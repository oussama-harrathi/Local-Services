import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // First check if provider exists
    const provider = await prisma.providerProfile.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Fetch reviews for the provider
    const reviews = await prisma.review.findMany({
      where: { providerId: id },
      include: {
        reviewer: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.review.count({
      where: { providerId: id },
    });

    // Transform reviews to include reviewer name (using email prefix)
    const transformedReviews = reviews.map((review: { 
      id: string;
      rating: number;
      comment: string;
      createdAt: Date;
      reviewer: {
        id: string;
        email: string;
      }
    }) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      reviewer: {
        id: review.reviewer.id,
        name: review.reviewer.email.split('@')[0], // Use email prefix as name
      },
    }));

    return NextResponse.json({
      reviews: transformedReviews,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}