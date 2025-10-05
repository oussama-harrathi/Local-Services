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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type'); // 'provider' or 'customer'

    // Get user's role from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Define notification types for providers vs customers
    const providerNotificationTypes = [
      'new_appointment_request',
      'appointment_cancelled',
      'appointment_rescheduled',
      'new_order_request',
      'order_update',
      'payment_received',
      'review_received'
    ];

    const customerNotificationTypes = [
      'booking_confirmation',
      'booking_reminder_24h', 
      'booking_reminder_2h',
      'booking_update',
      'review_request',
      'order_confirmation'
    ];

    // Build where clause based on user role and type filter
    let whereClause: any = {
      userId: session.user.id,
      ...(unreadOnly && { readAt: null }),
    };

    // If type is specified, use it; otherwise use user's role
    const effectiveType = type || (user.role === 'provider' ? 'provider' : 'customer');

    if (effectiveType === 'provider') {
      whereClause.type = {
        in: providerNotificationTypes
      };
    } else {
      whereClause.type = {
        in: customerNotificationTypes
      };
    }

    // Fetch notifications for the current user
    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Get unread count with same filtering
    const unreadCount = await prisma.notification.count({
      where: {
        ...whereClause,
        readAt: null,
      },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
      hasMore: notifications.length === limit,
    });

  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}