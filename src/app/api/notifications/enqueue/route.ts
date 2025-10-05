import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const enqueueNotificationSchema = z.object({
  userId: z.string(),
  type: z.enum(['booking_confirmation', 'booking_reminder_24h', 'booking_reminder_2h', 'review_request', 'booking_update']),
  title: z.string(),
  content: z.string(),
  scheduledAt: z.string().datetime().optional(),
  metadata: z.union([z.string(), z.object({}).passthrough()]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = enqueueNotificationSchema.parse(body);

    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId: validatedData.userId,
        type: validatedData.type,
        title: validatedData.title,
        content: validatedData.content,
        scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : new Date(),
        metadata: typeof validatedData.metadata === 'string' ? validatedData.metadata : JSON.stringify(validatedData.metadata),
        status: 'pending',
      },
    });

    return NextResponse.json({ 
      success: true, 
      notificationId: notification.id 
    });

  } catch (error) {
    console.error('Failed to enqueue notification:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to enqueue notification' },
      { status: 500 }
    );
  }
}

// Helper function to enqueue booking-related notifications
export async function enqueueBookingNotifications(
  bookingId: string,
  customerId: string,
  providerId: string,
  customerName: string,
  providerName: string,
  serviceType: string,
  appointmentDate: Date,
  duration: number,
  totalPrice?: number
) {
  try {
    const notifications = [];

    // Check user preferences
    const [customerPrefs, providerPrefs] = await Promise.all([
      prisma.notificationPreference.findUnique({
        where: { userId: customerId }
      }),
      prisma.notificationPreference.findUnique({
        where: { userId: providerId }
      })
    ]);

    const metadata = JSON.stringify({
      bookingId,
      serviceType,
      appointmentDate: appointmentDate.toISOString(),
      duration,
      totalPrice,
      providerName,
      customerName,
    });

    // 1. Booking confirmation (immediate)
    if (customerPrefs?.emailBookingConfirm !== false) {
      notifications.push({
        userId: customerId,
        type: 'booking_confirmation' as const,
        title: 'Booking Confirmed - LocalSpark',
        content: `Your appointment with ${providerName} has been confirmed for ${appointmentDate.toLocaleDateString()}.`,
        scheduledAt: new Date(),
        metadata,
      });
    }

    // Provider notification
    if (providerPrefs?.emailBookingConfirm !== false) {
      notifications.push({
        userId: providerId,
        type: 'booking_confirmation' as const,
        title: 'New Booking Received - LocalSpark',
        content: `You have a new booking from ${customerName} for ${appointmentDate.toLocaleDateString()}.`,
        scheduledAt: new Date(),
        metadata,
      });
    }

    // 2. 24-hour reminder
    const reminder24h = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
    if (reminder24h > new Date() && customerPrefs?.emailBookingReminder !== false) {
      notifications.push({
        userId: customerId,
        type: 'booking_reminder_24h' as const,
        title: 'Appointment Tomorrow - LocalSpark',
        content: `Reminder: Your appointment with ${providerName} is tomorrow.`,
        scheduledAt: reminder24h,
        metadata,
      });
    }

    // 3. 2-hour reminder
    const reminder2h = new Date(appointmentDate.getTime() - 2 * 60 * 60 * 1000);
    if (reminder2h > new Date() && customerPrefs?.emailBookingReminder !== false) {
      notifications.push({
        userId: customerId,
        type: 'booking_reminder_2h' as const,
        title: 'Appointment in 2 Hours - LocalSpark',
        content: `Reminder: Your appointment with ${providerName} is in 2 hours.`,
        scheduledAt: reminder2h,
        metadata,
      });
    }

    // 4. Review request (24 hours after appointment)
    const reviewRequest = new Date(appointmentDate.getTime() + 24 * 60 * 60 * 1000);
    if (customerPrefs?.emailReviewRequest !== false) {
      notifications.push({
        userId: customerId,
        type: 'review_request' as const,
        title: 'How was your experience? - LocalSpark',
        content: `Please share your experience with ${providerName}.`,
        scheduledAt: reviewRequest,
        metadata,
      });
    }

    // Bulk create notifications
    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      });
    }

    return { success: true, count: notifications.length };

  } catch (error) {
    console.error('Failed to enqueue booking notifications:', error);
    return { success: false, error: 'Failed to enqueue notifications' };
  }
}