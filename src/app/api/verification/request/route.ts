import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has a provider profile
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }

    // Check if already verified or has pending request
    if (providerProfile.verificationStatus === 'verified') {
      return NextResponse.json({ error: 'Already verified' }, { status: 400 });
    }

    if (providerProfile.verificationStatus === 'pending') {
      return NextResponse.json({ error: 'Verification request already pending' }, { status: 400 });
    }

    const body = await request.json();
    const { 
      requestedLevel = 'basic', 
      formData = {}
    } = body;

    // Validate requested level
    const validLevels = ['basic', 'premium', 'elite'];

    if (!validLevels.includes(requestedLevel)) {
      return NextResponse.json({ error: 'Invalid verification level' }, { status: 400 });
    }

    // Determine badge type based on verification level
    const levelToBadgeMap = {
      'basic': 'identity',
      'premium': 'business', 
      'elite': 'quality'
    };
    
    const requestedBadgeType = levelToBadgeMap[requestedLevel as keyof typeof levelToBadgeMap];

    // Create verification request
    const updatedProvider = await prisma.providerProfile.update({
      where: { userId: session.user.id },
      data: {
        verificationStatus: 'pending',
        verificationLevel: requestedLevel,
        verificationBadgeType: requestedBadgeType,
        verificationRequestedAt: new Date(),
        verificationDocuments: JSON.stringify(formData), // Store form data as JSON
        verificationNotes: null, // Clear any previous notes
      },
      include: {
        user: true,
      },
    });

    // Send notification to admins about new verification request
    try {
      // Get all admin users (you might want to create an admin role system)
      const adminUsers = await prisma.user.findMany({
        where: {
          email: {
            in: ['admin@localspark.com', 'support@localspark.com'] // Add your admin emails here
          }
        }
      });

      // Create notifications for each admin
      for (const admin of adminUsers) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'verification_request',
            title: `New Verification Request from ${updatedProvider.user.name}`,
            content: `A new ${requestedLevel} ${requestedBadgeType} verification request has been submitted.`,
            scheduledAt: new Date(),
            metadata: JSON.stringify({
              providerId: updatedProvider.id,
              providerName: updatedProvider.user.name,
              verificationLevel: requestedLevel,
              verificationBadgeType: requestedBadgeType,
              formData: formData,
            }),
          },
        });
      }
    } catch (notificationError) {
      console.error('Failed to create admin notifications:', notificationError);
      // Don't fail the request if notifications fail
    }

    return NextResponse.json({
      success: true,
      message: 'Verification request submitted successfully',
      verificationStatus: updatedProvider.verificationStatus
    });

  } catch (error) {
    console.error('Verification request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get provider profile with verification status
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        verificationStatus: true,
        verificationLevel: true,
        verificationBadgeType: true,
        verificationRequestedAt: true,
        verificationCompletedAt: true,
        verificationNotes: true
      }
    });

    if (!providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      verification: providerProfile
    });

  } catch (error) {
    console.error('Get verification status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}