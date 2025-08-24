import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createReportSchema = z.object({
  targetType: z.enum(['provider', 'review']),
  targetId: z.string().min(1, 'Target ID is required'),
  reason: z.string().min(1, 'Reason is required').max(100, 'Reason must be less than 100 characters'),
  details: z.string().max(500, 'Details must be less than 500 characters').optional(),
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
    const validatedData = createReportSchema.parse(body);
    
    // Verify target exists
    if (validatedData.targetType === 'provider') {
      const provider = await prisma.providerProfile.findUnique({
        where: { id: validatedData.targetId },
      });
      
      if (!provider) {
        return NextResponse.json(
          { error: 'Provider not found' },
          { status: 404 }
        );
      }
      
      // Prevent self-reporting
      if (provider.userId === session.user.id) {
        return NextResponse.json(
          { error: 'You cannot report your own profile' },
          { status: 400 }
        );
      }
    } else if (validatedData.targetType === 'review') {
      const review = await prisma.review.findUnique({
        where: { id: validatedData.targetId },
      });
      
      if (!review) {
        return NextResponse.json(
          { error: 'Review not found' },
          { status: 404 }
        );
      }
      
      // Prevent self-reporting
      if (review.userId === session.user.id) {
        return NextResponse.json(
          { error: 'You cannot report your own review' },
          { status: 400 }
        );
      }
    }
    
    // Check for duplicate report
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: session.user.id,
        targetType: validatedData.targetType,
        targetId: validatedData.targetId,
        status: 'pending',
      },
    });
    
    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this item' },
        { status: 409 }
      );
    }
    
    // Create report
    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        targetType: validatedData.targetType,
        targetId: validatedData.targetId,
        reason: validatedData.reason,
        details: validatedData.details,
      },
      include: {
        reporter: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    
    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    
    const reports = await prisma.report.findMany({
      where: {
        status,
      },
      include: {
        reporter: {
          select: {
            name: true,
            email: true,
          },
        },
        provider: {
          select: {
            name: true,
            city: true,
          },
        },
        review: {
          select: {
            text: true,
            rating: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}