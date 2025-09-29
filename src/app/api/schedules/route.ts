import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const scheduleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6), // 0 = Sunday, 6 = Saturday
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  isActive: z.boolean().optional().default(true),
});

const createSchedulesSchema = z.array(scheduleSchema);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has a provider profile
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const schedules = createSchedulesSchema.parse(body);

    // Validate that start time is before end time for each schedule
    for (const schedule of schedules) {
      const [startHour, startMin] = schedule.startTime.split(':').map(Number);
      const [endHour, endMin] = schedule.endTime.split(':').map(Number);
      
      if (startHour * 60 + startMin >= endHour * 60 + endMin) {
        return NextResponse.json(
          { error: `Invalid time range for day ${schedule.dayOfWeek}: start time must be before end time` },
          { status: 400 }
        );
      }
    }

    // Delete existing schedules for this provider
    await prisma.providerSchedule.deleteMany({
      where: { providerId: providerProfile.id },
    });

    // Create new schedules
    const createdSchedules = await prisma.providerSchedule.createMany({
      data: schedules.map(schedule => ({
        providerId: providerProfile.id,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        isActive: schedule.isActive,
      })),
    });

    // Fetch the created schedules to return them
    const newSchedules = await prisma.providerSchedule.findMany({
      where: { providerId: providerProfile.id },
      orderBy: { dayOfWeek: 'asc' },
    });

    return NextResponse.json(newSchedules);
  } catch (error) {
    console.error('Error creating schedules:', error);
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

    // Check if user has a provider profile
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }

    const schedules = await prisma.providerSchedule.findMany({
      where: { 
        providerId: providerProfile.id,
        isActive: true,
      },
      orderBy: { dayOfWeek: 'asc' },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has a provider profile
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const schedules = createSchedulesSchema.parse(body);

    // Validate time ranges
    for (const schedule of schedules) {
      const [startHour, startMin] = schedule.startTime.split(':').map(Number);
      const [endHour, endMin] = schedule.endTime.split(':').map(Number);
      
      if (startHour * 60 + startMin >= endHour * 60 + endMin) {
        return NextResponse.json(
          { error: `Invalid time range for day ${schedule.dayOfWeek}: start time must be before end time` },
          { status: 400 }
        );
      }
    }

    // Delete existing schedules and create new ones
    await prisma.providerSchedule.deleteMany({
      where: { providerId: providerProfile.id },
    });

    await prisma.providerSchedule.createMany({
      data: schedules.map(schedule => ({
        providerId: providerProfile.id,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        isActive: schedule.isActive,
      })),
    });

    // Fetch updated schedules
    const updatedSchedules = await prisma.providerSchedule.findMany({
      where: { providerId: providerProfile.id },
      orderBy: { dayOfWeek: 'asc' },
    });

    return NextResponse.json(updatedSchedules);
  } catch (error) {
    console.error('Error updating schedules:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}