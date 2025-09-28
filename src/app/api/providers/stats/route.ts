import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get provider counts by city
    const providerStats = await prisma.providerProfile.groupBy({
      by: ['city'],
      _count: {
        id: true,
      },
      where: {
        // Only count active/approved providers if you have such fields
        // Add any additional filters here if needed
      },
    });

    // Transform the data into a more usable format
    const cityStats = providerStats.reduce((acc, stat) => {
      acc[stat.city] = stat._count.id;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json(cityStats);
  } catch (error) {
    console.error('Error fetching provider stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provider statistics' },
      { status: 500 }
    );
  }
}