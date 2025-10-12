import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get verification requests
    const verificationRequests = await prisma.providerProfile.findMany({
      where: {
        verificationStatus: status
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        verificationRequestedAt: 'desc'
      },
      skip,
      take: limit
    });

    const total = await prisma.providerProfile.count({
      where: {
        verificationStatus: status
      }
    });

    return NextResponse.json({
      success: true,
      requests: verificationRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get verification requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      providerId, 
      action, // 'approve' or 'reject'
      verificationLevel,
      verificationBadgeType,
      adminNotes = ''
    } = body;

    if (!providerId || !action) {
      return NextResponse.json({ error: 'Provider ID and action are required' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get provider profile
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { id: providerId }
    });

    if (!providerProfile) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    if (providerProfile.verificationStatus !== 'pending') {
      return NextResponse.json({ error: 'No pending verification request' }, { status: 400 });
    }

    // Update provider verification status
      const updatedProvider = await prisma.providerProfile.update({
        where: { id: providerId },
        data: {
          verificationStatus: action === 'approve' ? 'verified' : 'rejected',
          verificationCompletedAt: new Date(),
          verificationNotes: adminNotes,
        },
      include: {
        user: true,
      },
    });

    // Send notification to provider about status update
    try {
      await prisma.notification.create({
        data: {
          userId: updatedProvider.user.id,
          type: 'verification_status_update',
          title: action === 'approve' 
            ? 'Verification Approved!' 
            : 'Verification Update',
          content: action === 'approve'
            ? 'Your provider verification has been approved!'
            : 'Your verification request has been reviewed.',
          scheduledAt: new Date(),
          metadata: JSON.stringify({
            verificationStatus: updatedProvider.verificationStatus,
            verificationLevel: updatedProvider.verificationLevel,
            verificationBadgeType: updatedProvider.verificationBadgeType,
            adminNotes: adminNotes,
          }),
        },
      });
    } catch (notificationError) {
      console.error('Failed to create provider notification:', notificationError);
      // Don't fail the request if notifications fail
    }

    return NextResponse.json({
      success: true,
      message: `Verification ${action}d successfully`,
      provider: updatedProvider
    });

  } catch (error) {
    console.error('Update verification status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}