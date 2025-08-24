import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Provider } from '@/lib/types';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const providerProfiles = await prisma.providerProfile.findMany({
      include: {
        user: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Transform database records to match the Provider type
    const providers: Provider[] = providerProfiles.map((profile: any) => {
      // Calculate average rating and count from reviews
      const ratings = profile.reviews.map((r: { rating: number }) => r.rating);
      const averageRating = ratings.length > 0 
        ? Number((ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length).toFixed(1))
        : 0;
      const reviewCount = ratings.length;

      return {
        id: profile.id,
        name: profile.name,
        city: profile.city,
        coords: {
          lat: profile.lat,
          lng: profile.lng,
        },
        categories: profile.categories.split(','), // Convert comma-separated string back to array
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        review: {
          rating: averageRating,
          count: reviewCount,
        },
        whatsapp: profile.whatsapp || undefined,
        messenger: profile.messenger || undefined,
      };
    });

    return NextResponse.json(providers);
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}