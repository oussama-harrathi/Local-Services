import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createReviewSchema = z.object({
  providerId: z.string().min(1, 'Provider ID is required'),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  text: z.string().min(10, 'Review text must be at least 10 characters').max(1000, 'Review text must be less than 1000 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createReviewSchema.parse(body);
    
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
    
    // Check for existing review within 14 days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        providerId: validatedData.providerId,
        createdAt: {
          gte: fourteenDaysAgo,
        },
      },
    });
    
    if (existingReview) {
      return NextResponse.json(
        { error: 'You can only review a provider once every 14 days' },
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