import { NextResponse } from 'next/server';
import { Provider, Category } from '@/lib/types';
import { haversineKm } from '@/lib/geo';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    // Extract query parameters
    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const q = searchParams.get('q'); // search query
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const maxKm = searchParams.get('maxKm');

    // Build where clause for Prisma query
    const whereClause: any = {
      isHidden: false, // Only show visible providers
    };

    // Filter by city
    if (city && city !== 'all' && city !== '') {
      whereClause.city = city;
    }

    // Filter by category (search in comma-separated categories string)
    if (category && category !== 'all' && category !== '') {
      whereClause.categories = {
        contains: category,
      };
    }

    // Filter by search query (search in name and bio)
    if (q) {
      whereClause.AND = [
        {
          OR: [
            { name: { contains: q } },
            { bio: { contains: q } },
          ]
        }
      ];
    }

    const providerProfiles = await prisma.providerProfile.findMany({
      where: whereClause,
      include: {
        user: true,
        reviews: {
          select: {
            rating: true,
          },
        },
        schedules: {
          where: {
            isActive: true,
          },
          orderBy: {
            dayOfWeek: 'asc',
          },
        },
      },
    });

    // Transform database records to match the Provider type
    let providers: Provider[] = providerProfiles.map((profile: { 
      id: string; 
      name: string; 
      city: string; 
      lat: number; 
      lng: number; 
      categories: string; 
      bio: string; 
      avatarUrl: string; 
      whatsapp: string | null; 
      messenger: string | null; 
      verificationStatus: string | null;
      verificationLevel: string | null;
      verificationBadgeType: string | null;
      verificationRequestedAt: Date | null;
      verificationCompletedAt: Date | null;
      verificationDocuments: string | null;
      verificationNotes: string | null;
      reviews: { rating: number }[]; 
      schedules: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }[]; 
      user: any 
    }) => {
      // Calculate average rating and count from reviews
      const ratings = profile.reviews.map((r: { rating: number }) => r.rating);
      const averageRating = ratings.length > 0 
        ? Number((ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length).toFixed(1))
        : 0;
      const reviewCount = ratings.length;

      return {
        id: profile.id,
        name: profile.name,
        city: profile.city as "Tunis" | "Sousse" | "Budapest",
        coords: {
          lat: profile.lat,
          lng: profile.lng,
        },
        categories: profile.categories.split(',') as Category[], // Convert comma-separated string back to array
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        review: {
          rating: averageRating,
          count: reviewCount,
        },
        whatsapp: profile.whatsapp || undefined,
        messenger: profile.messenger || undefined,
        schedules: profile.schedules,
        // Include verification fields
        verificationStatus: profile.verificationStatus || 'unverified',
        verificationLevel: profile.verificationLevel,
        verificationBadgeType: profile.verificationBadgeType,
        verificationRequestedAt: profile.verificationRequestedAt,
        verificationCompletedAt: profile.verificationCompletedAt,
        verificationDocuments: profile.verificationDocuments,
        verificationNotes: profile.verificationNotes,
      };
    });

    // Apply distance filtering if coordinates are provided
    if (lat && lng && maxKm) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxDistance = parseFloat(maxKm);

      providers = providers.filter((provider) => {
        const distance = haversineKm(
          { lat: userLat, lng: userLng },
          provider.coords
        );
        return distance <= maxDistance;
      });
    }

    return NextResponse.json(providers);
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}