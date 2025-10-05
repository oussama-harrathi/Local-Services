import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const providerProfile = await prisma.providerProfile.findUnique({
      where: { 
        id,
        isHidden: false // Only show visible providers
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        schedules: {
          where: {
            isActive: true
          },
          orderBy: {
            dayOfWeek: 'asc'
          }
        },
        reviews: {
          where: {
            isHidden: false // Only show visible reviews
          },
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            reviews: {
              where: {
                isHidden: false
              }
            }
          }
        }
      },
    });

    if (!providerProfile) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Calculate average rating
    const visibleReviews = providerProfile.reviews;
    const averageRating = visibleReviews.length > 0
      ? visibleReviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / visibleReviews.length
      : 0;

    // Format the response
    const provider = {
      id: providerProfile.id,
      name: providerProfile.user.name || 'Anonymous',
      email: providerProfile.user.email,
      avatarUrl: providerProfile.avatarUrl || providerProfile.user.image || '/default-avatar.png',
      bio: providerProfile.bio,
      city: providerProfile.city,
      latitude: providerProfile.lat,
      longitude: providerProfile.lng,
      categories: providerProfile.categories ? providerProfile.categories.split(',').map((cat: string) => cat.trim()) : [],
      photos: (providerProfile as any).photos ? (providerProfile as any).photos.split(',').map((photo: string) => photo.trim()).filter((photo: string) => photo && photo.length > 0 && photo !== 'null' && photo !== 'undefined' && (photo.startsWith('http') || photo.startsWith('/') || (photo.startsWith('data:') && photo.length > 20))) : [],
      whatsapp: providerProfile.whatsapp,
      messenger: providerProfile.messenger,
      menuItems: providerProfile.menuItems ? JSON.parse(providerProfile.menuItems) : [],
      isVerified: providerProfile.isVerified,
      createdAt: providerProfile.createdAt,
      schedules: providerProfile.schedules?.map((schedule: any) => ({
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        isActive: schedule.isActive
      })) || [],
      review: {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        count: providerProfile._count.reviews,
      },
      reviews: visibleReviews.map((review: { 
        id: string;
        rating: number;
        text: string;
        createdAt: Date;
        user: {
          name: string | null;
          image: string | null;
        }
      }) => ({
        id: review.id,
        rating: review.rating,
        comment: review.text,
        createdAt: review.createdAt,
        user: {
          name: review.user.name || 'Anonymous',
          image: review.user.image || '/default-avatar.png',
        },
      })),
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