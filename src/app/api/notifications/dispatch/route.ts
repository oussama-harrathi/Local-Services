import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { EmailService } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Get all pending notifications that are due to be sent
    const dueNotifications = await prisma.notification.findMany({
      where: {
        status: 'pending',
        scheduledAt: {
          lte: new Date(),
        },
      },
      include: {
        user: {
          include: {
            notificationPreference: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
      take: 50, // Process in batches to avoid overwhelming the email service
    });

    if (dueNotifications.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No notifications to dispatch',
        processed: 0 
      });
    }

    const results = {
      sent: 0,
      failed: 0,
      skipped: 0,
    };

    // Process each notification
    for (const notification of dueNotifications) {
      try {
        // Check if user has email preferences that would block this notification
        const prefs = notification.user.notificationPreference;
        let shouldSend = true;

        if (prefs) {
          switch (notification.type) {
            case 'booking_confirmation':
              shouldSend = prefs.emailBookingConfirm;
              break;
            case 'booking_reminder_24h':
            case 'booking_reminder_2h':
              shouldSend = prefs.emailBookingReminder;
              break;
            case 'review_request':
              shouldSend = prefs.emailReviewRequest;
              break;
            case 'order_update':
              shouldSend = prefs.emailBookingConfirm; // Use booking confirm preference for orders
              break;
          }
        }

        if (!shouldSend) {
          // Mark as sent but skipped
          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: 'sent',
              sentAt: new Date(),
            },
          });
          results.skipped++;
          continue;
        }

        // Generate email content based on notification type
        let emailHtml = notification.content;
        
        if (notification.metadata) {
          try {
            const metadata = JSON.parse(notification.metadata);
            emailHtml = generateEmailContent(
              notification.type,
              notification.user.name || 'User',
              metadata
            );
          } catch (e) {
            console.warn('Failed to parse notification metadata:', e);
          }
        }

        // Send email
        const emailSent = await EmailService.sendEmail({
          to: notification.user.email,
          subject: notification.title,
          html: emailHtml,
        });

        // Update notification status
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: emailSent ? 'sent' : 'failed',
            sentAt: emailSent ? new Date() : null,
          },
        });

        if (emailSent) {
          results.sent++;
        } else {
          results.failed++;
        }

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Failed to process notification ${notification.id}:`, error);
        
        // Mark as failed
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: 'failed',
          },
        });
        
        results.failed++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: dueNotifications.length,
      results,
    });

  } catch (error) {
    console.error('Failed to dispatch notifications:', error);
    return NextResponse.json(
      { error: 'Failed to dispatch notifications' },
      { status: 500 }
    );
  }
}

function generateEmailContent(
  type: string,
  userName: string,
  metadata: any
): string {
  const appointmentDate = new Date(metadata.appointmentDate);

  switch (type) {
    case 'booking_confirmation':
      return EmailService.generateBookingConfirmationEmail(
        userName,
        metadata.providerName || 'Provider',
        metadata.serviceType,
        appointmentDate,
        metadata.duration,
        metadata.totalPrice
      );

    case 'booking_reminder_24h':
      return EmailService.generateReminderEmail(
        userName,
        metadata.providerName || 'Provider',
        metadata.serviceType,
        appointmentDate,
        metadata.duration,
        24
      );

    case 'booking_reminder_2h':
      return EmailService.generateReminderEmail(
        userName,
        metadata.providerName || 'Provider',
        metadata.serviceType,
        appointmentDate,
        metadata.duration,
        2
      );

    case 'review_request':
      return EmailService.generateReviewRequestEmail(
        userName,
        metadata.providerName || 'Provider',
        metadata.serviceType,
        metadata.bookingId
      );

    case 'booking_update':
      return EmailService.generateBookingUpdateEmail(
        userName,
        metadata.providerName || 'Provider',
        metadata.serviceType,
        metadata.status,
        appointmentDate,
        metadata.duration,
        metadata.totalPrice
      );

    case 'order_update':
      return EmailService.generateOrderUpdateEmail(
        userName,
        metadata.providerName || 'Provider',
        metadata.status,
        metadata.items,
        metadata.totalPrice,
        new Date(metadata.orderDate)
      );

    default:
      return `<p>Hello ${userName},</p><p>You have a notification from LocalSpark.</p>`;
  }
}

// GET endpoint to check notification queue status
export async function GET() {
  try {
    const stats = await prisma.notification.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const pendingCount = await prisma.notification.count({
      where: {
        status: 'pending',
        scheduledAt: {
          lte: new Date(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      stats: stats.reduce((acc: any, stat: any) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {} as Record<string, number>),
      pendingDue: pendingCount,
    });

  } catch (error) {
    console.error('Failed to get notification stats:', error);
    return NextResponse.json(
      { error: 'Failed to get notification stats' },
      { status: 500 }
    );
  }
}