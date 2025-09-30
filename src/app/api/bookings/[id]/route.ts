import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Helper function to enqueue status update notifications
async function enqueueStatusUpdateNotification(bookingId: string, customerId: string, providerId: string, status: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications/enqueue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: customerId,
        type: 'booking_update',
        title: `Booking ${status}`,
        content: `Your booking has been ${status}.`,
        metadata: { bookingId, status }
      })
    });

    // Also notify provider for cancellations
    if (status === 'cancelled') {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications/enqueue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: providerId,
          type: 'booking_update',
          title: `Booking ${status}`,
          content: `A booking has been ${status}.`,
          metadata: { bookingId, status }
        })
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = updateBookingSchema.parse(body);

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
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

    // Check 24-hour cancellation policy for both providers and customers
    if (status === 'cancelled') {
      const bookingDate = new Date(booking.date);
      const now = new Date();
      const timeDifference = bookingDate.getTime() - now.getTime();
      const hoursUntilBooking = timeDifference / (1000 * 60 * 60);

      if (hoursUntilBooking < 24) {
        return NextResponse.json({ 
          error: 'Cancellation not allowed. Appointments can only be cancelled at least 24 hours before the scheduled time.' 
        }, { status: 400 });
      }
    }

    // Update the booking
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
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
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}