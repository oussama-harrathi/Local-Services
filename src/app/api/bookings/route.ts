import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createBookingSchema = z.object({
  providerId: z.string(),
  serviceType: z.string(),
  date: z.string().datetime(),
  duration: z.number().min(15).max(480), // 15 minutes to 8 hours
  notes: z.string().optional(),
  totalPrice: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createBookingSchema.parse(body);

    // Check if provider exists
    const provider = await prisma.providerProfile.findUnique({
      where: { id: validatedData.providerId },
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        customerId: session.user.id,
        providerId: validatedData.providerId,
        serviceType: validatedData.serviceType,
        date: new Date(validatedData.date),
        duration: validatedData.duration,
        notes: validatedData.notes,
        totalPrice: validatedData.totalPrice,
      },
      include: {
        provider: {
          select: {
            name: true,
            city: true,
          },
        },
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'customer' or 'provider'

    let bookings;

    if (type === 'provider') {
      // Get bookings for provider
      const providerProfile = await prisma.providerProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!providerProfile) {
        return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
      }

      bookings = await prisma.booking.findMany({
        where: { providerId: providerProfile.id },
        include: {
          customer: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { date: 'asc' },
      });
    } else {
      // Get bookings for customer
      bookings = await prisma.booking.findMany({
        where: { customerId: session.user.id },
        include: {
          provider: {
            select: {
              name: true,
              city: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { date: 'asc' },
      });
    }

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}