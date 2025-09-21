import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { reviewSubmissionLimiter, suspiciousActivityLimiter } from '@/lib/rate-limit';
import { phoneVerificationService } from '@/lib/phone-verification';

const createReviewSchema = z.object({
  providerId: z.string().min(1, 'Provider ID is required'),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  text: z.string().min(10, 'Review text must be at least 10 characters').max(1000, 'Review text must be less than 1000 characters'),
  captchaToken: z.string().min(1, 'CAPTCHA verification is required'),
});

// Function to verify reCAPTCHA token
async function verifyCaptcha(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();
    return data.success && data.score >= 0.5; // reCAPTCHA v3 score threshold
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    const body = await request.json();
    const validatedData = createReviewSchema.parse(body);

    // Get user details for enhanced rate limiting
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, 
        phone: true, 
        phoneVerified: true,
        createdAt: true,
        reviews: {
          select: { id: true },
          take: 1
        }
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Enhanced rate limiting checks
    const isNewUser = user.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
    const hasNoReviews = user.reviews.length === 0;
    const isPhoneVerified = !!user.phoneVerified;

    // Apply stricter limits for suspicious activity
    if ((isNewUser && hasNoReviews) || !isPhoneVerified) {
      const suspiciousLimitResult = await suspiciousActivityLimiter.checkLimit(
        user.id,
        user.phone || undefined,
        ipAddress
      );

      if (!suspiciousLimitResult.success) {
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded. New users and unverified accounts have stricter limits. Please verify your phone number or try again later.',
            resetTime: suspiciousLimitResult.resetTime 
          },
          { status: 429 }
        );
      }
    }

    // Standard rate limiting
    const rateLimitResult = await reviewSubmissionLimiter.checkLimit(
      user.id,
      user.phone || undefined,
      ipAddress
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: `Review submission limit exceeded. You can submit ${rateLimitResult.limit} reviews per day. Try again after ${rateLimitResult.resetTime.toLocaleString()}`,
          resetTime: rateLimitResult.resetTime,
          remaining: rateLimitResult.remaining
        },
        { status: 429 }
      );
    }
    
    // Verify CAPTCHA token
    const isCaptchaValid = await verifyCaptcha(validatedData.captchaToken);
    if (!isCaptchaValid) {
      return NextResponse.json(
        { error: 'CAPTCHA verification failed. Please try again.' },
        { status: 400 }
      );
    }
    
    // Check if provider exists
    const provider = await prisma.providerProfile.findUnique({
      where: { id: validatedData.providerId },
    });
    
    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }
    
    // Prevent self-review
    if (provider.userId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot review your own profile' },
        { status: 400 }
      );
    }
    
    // Check for existing review within 14 days (enhanced with phone verification)
    const reviewCooldownDays = isPhoneVerified ? 14 : 30; // Longer cooldown for unverified users
    const cooldownDate = new Date();
    cooldownDate.setDate(cooldownDate.getDate() - reviewCooldownDays);
    
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        providerId: validatedData.providerId,
        createdAt: {
          gte: cooldownDate,
        },
      },
    });
    
    if (existingReview) {
      const waitDays = isPhoneVerified ? 14 : 30;
      return NextResponse.json(
        { 
          error: `You can only review a provider once every ${waitDays} days. ${!isPhoneVerified ? 'Verify your phone number to reduce this to 14 days.' : ''}`,
          phoneVerified: isPhoneVerified
        },
        { status: 429 }
      );
    }
    
    // Create or update review
    const review = await prisma.review.upsert({
      where: {
        userId_providerId: {
          userId: session.user.id,
          providerId: validatedData.providerId,
        },
      },
      update: {
        rating: validatedData.rating,
        text: validatedData.text,
      },
      create: {
        userId: session.user.id,
        providerId: validatedData.providerId,
        rating: validatedData.rating,
        text: validatedData.text,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });
    
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    
    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }
    
    const reviews = await prisma.review.findMany({
      where: {
        providerId,
        isHidden: false,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}