import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const reportId = params.id;
    
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });
    
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }
    
    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: { status: 'resolved' },
      include: {
        reporter: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    
    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error('Error resolving report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}