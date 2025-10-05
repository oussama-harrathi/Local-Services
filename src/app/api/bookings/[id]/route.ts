import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Helper function to enqueue status update notifications
async function enqueueStatusUpdateNotification(bookingId: string, customerId: string, providerId: string, status: string) {
  try {
    // Get booking details for metadata
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        provider: {
          select: {
            name: true,
          },
        },
        customer: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!booking) {
      console.error('Booking not found for notification:', bookingId);
      return;
    }

    const metadata = JSON.stringify({
      bookingId,
      status,
      providerName: booking.provider.name,
      customerName: booking.customer.name,
      serviceType: booking.serviceType,
      appointmentDate: booking.date.toISOString(),
      duration: booking.duration,
      totalPrice: booking.totalPrice,
    });

    // Create customer notification directly in database
    await prisma.notification.create({
      data: {
        userId: customerId,
        type: 'booking_update',
        title: `Booking ${status}`,
        content: `Your booking has been ${status}.`,
        scheduledAt: new Date(),
        metadata,
        status: 'pending',
      },
    });

    // Also notify provider for cancellations
    if (status === 'cancelled') {
      await prisma.notification.create({
        data: {
          userId: providerId,
          type: 'booking_update',
          title: `Booking ${status}`,
          content: `A booking has been ${status}.`,
          scheduledAt: new Date(),
          metadata,
          status: 'pending',
        },
      });
    }
  } catch (error) {
    console.error('Failed to enqueue status update notification:', error);
  }
}

const updateBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = updateBookingSchema.parse(body);

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        provider: true,
        customer: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user has permission to update this booking
    const isProvider = booking.provider.userId === session.user.id;
    const isCustomer = booking.customerId === session.user.id;

    if (!isProvider && !isCustomer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only providers can confirm bookings, customers can only cancel their own
    if (status === 'confirmed' && !isProvider) {
      return NextResponse.json({ error: 'Only providers can confirm bookings' }, { status: 403 });
    }

    // Check 24-hour cancellation policy
    if (status === 'cancelled') {
      const bookingDate = new Date(booking.date);
      const now = new Date();
      const timeDifference = bookingDate.getTime() - now.getTime();
      const hoursUntilBooking = timeDifference / (1000 * 60 * 60);

      // Providers can reject pending appointments anytime, but cannot cancel confirmed ones within 24h
      if (isProvider && booking.status === 'pending') {
        // Providers can always reject pending appointments (no time restriction)
      } else if (hoursUntilBooking < 24) {
        // For all other cases (customer cancellation or provider cancelling confirmed booking)
        const errorMessage = isProvider 
          ? 'Cannot cancel confirmed appointments less than 24 hours before the scheduled time.'
          : 'Cancellation not allowed. Appointments can only be cancelled at least 24 hours before the scheduled time.';
        
        return NextResponse.json({ 
          error: errorMessage 
        }, { status: 400 });
      }
    }

    // Update the booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        provider: {
          select: {
            name: true,
            city: true,
            avatarUrl: true,
          },
        },
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Enqueue status update notifications
    try {
      await enqueueStatusUpdateNotification(
        updatedBooking.id, 
        updatedBooking.customerId, 
        updatedBooking.providerId, 
        status
      );
    } catch (notificationError) {
      console.error('Failed to enqueue status update notifications:', notificationError);
      // Don't fail the booking update if notifications fail
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        provider: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user has permission to delete this booking
    const isProvider = booking.provider.userId === session.user.id;
    const isCustomer = booking.customerId === session.user.id;

    if (!isProvider && !isCustomer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the booking
    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}