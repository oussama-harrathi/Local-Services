import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you can implement your own admin check logic)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.email !== 'admin@localspark.com') { // Replace with your admin email
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const whereClause = action ? { action } : {};

    const rateLimits = await prisma.rateLimitEntry.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phoneVerified: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(rateLimits);
  } catch (error) {
    console.error('Error fetching rate limits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}