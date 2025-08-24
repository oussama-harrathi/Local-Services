import { NextResponse } from 'next/server';
import { Provider } from '@/lib/types';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const providerProfile = await prisma.providerProfile.findUnique({
      where: { id },
      include: {
        user: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    if (!providerProfile) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Calculate average rating and count from reviews
    const ratings = providerProfile.reviews.map((r: { rating: number }) => r.rating);
    const averageRating = ratings.length > 0 
      ? Number((ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length).toFixed(1))
      : 0;
    const reviewCount = ratings.length;

    // Transform database record to match the Provider type
    const provider: Provider = {
      id: providerProfile.id,
      name: providerProfile.name,
      city: providerProfile.city,
      coords: {
        lat: providerProfile.lat,
        lng: providerProfile.lng,
      },
      categories: providerProfile.categories.split(','), // Convert comma-separated string back to array
      bio: providerProfile.bio,
      avatarUrl: providerProfile.avatarUrl,
      review: {
        rating: averageRating,
        count: reviewCount,
      },
      whatsapp: providerProfile.whatsapp || undefined,
      messenger: providerProfile.messenger || undefined,
    };

    return NextResponse.json(provider);
  } catch (error) {
    console.error('Error fetching provider:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provider' },
      { status: 500 }
    );
  }
}