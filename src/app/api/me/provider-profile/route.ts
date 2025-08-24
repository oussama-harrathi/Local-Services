import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const providerProfileSchema = z.object({
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
      where: {
        userId: session.user.id
      }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(profile)
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
    const validatedData = providerProfileSchema.parse(body)

    // Upsert the provider profile
    const profile = await prisma.providerProfile.upsert({
      where: {
        userId: session.user.id
      },
      update: {
        bio: validatedData.bio,
        city: validatedData.city,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        categories: validatedData.categories,
        photos: validatedData.photos,
        whatsapp: validatedData.whatsapp,
        messenger: validatedData.messenger,
      },
      create: {
        userId: session.user.id,
        bio: validatedData.bio,
        city: validatedData.city,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        categories: validatedData.categories,
        photos: validatedData.photos,
        whatsapp: validatedData.whatsapp,
        messenger: validatedData.messenger,
      }
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