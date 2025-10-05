import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch provider schedules
    const schedules = await prisma.providerSchedule.findMany({
      where: { 
        providerId: id,
        isActive: true,
      },
      orderBy: { dayOfWeek: 'asc' },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching provider schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provider schedules' },
      { status: 500 }
    );
  }
}