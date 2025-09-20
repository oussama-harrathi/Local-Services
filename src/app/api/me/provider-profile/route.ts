import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const providerProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bio: z.string().min(1, 'Bio is required'),
  city: z.string().min(1, 'City is required'),
  latitude: z.number(),
  longitude: z.number(),
  categories: z.array(z.string()),
  photos: z.array(z.string()).optional().default([]),
  whatsapp: z.string().optional(),
  messenger: z.string().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !('id' in session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.providerProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: true }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: profile.id,
      name: profile.name,
      bio: profile.bio,
      city: profile.city,
      lat: profile.lat,
      lng: profile.lng,
      categories: profile.categories ? profile.categories.split(',').map(cat => cat.trim()) : [],
      photos: (profile as any).photos ? (profile as any).photos.split(',').map((photo: string) => photo.trim()).filter((photo: string) => photo && photo.length > 0 && photo !== 'null' && photo !== 'undefined' && (photo.startsWith('http') || photo.startsWith('/') || (photo.startsWith('data:') && photo.length > 20))) : [],
      whatsapp: profile.whatsapp,
      messenger: profile.messenger,
      isVerified: profile.isVerified,
      createdAt: profile.createdAt
    })
  } catch (error) {
    console.error('Error fetching provider profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !('id' in session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Received body:', JSON.stringify(body, null, 2))
    
    const validatedData = providerProfileSchema.parse(body)
    console.log('Validated data:', JSON.stringify(validatedData, null, 2))

    // Upsert the provider profile
    const updateData = {
      name: validatedData.name,
      city: validatedData.city,
      lat: validatedData.latitude,
      lng: validatedData.longitude,
      categories: validatedData.categories.join(','),
      bio: validatedData.bio,
      photos: validatedData.photos?.length ? validatedData.photos.join(',') : null,
      avatarUrl: validatedData.photos?.[0] || '',
      whatsapp: validatedData.whatsapp || null,
      messenger: validatedData.messenger || null,
    };

    const createData = {
      userId: session.user.id,
      name: validatedData.name,
      city: validatedData.city,
      lat: validatedData.latitude,
      lng: validatedData.longitude,
      categories: validatedData.categories.join(','),
      bio: validatedData.bio,
      photos: validatedData.photos?.length ? validatedData.photos.join(',') : null,
      avatarUrl: validatedData.photos?.[0] || '',
      whatsapp: validatedData.whatsapp || null,
      messenger: validatedData.messenger || null,
    };

    const profile = await prisma.providerProfile.upsert({
      where: {
        userId: session.user.id
      },
      update: updateData,
      create: createData,
    })

    return NextResponse.json(profile)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error saving provider profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}