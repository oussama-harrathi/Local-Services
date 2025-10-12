import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 })
    }

    const providerId = params.id
    
    // Parse the date and get start/end of day
    const selectedDate = new Date(date)
    const startOfDay = new Date(selectedDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(selectedDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Fetch all bookings for the provider on the selected date
    const bookings = await prisma.booking.findMany({
      where: {
        providerId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ['pending', 'confirmed'] // Only consider active bookings
        }
      },
      select: {
        date: true,
        duration: true,
        status: true
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Convert bookings to busy time slots
    const busyTimes = bookings.map(booking => {
      const startTime = new Date(booking.date)
      const endTime = new Date(startTime.getTime() + booking.duration * 60000) // duration in minutes
      
      return {
        startTime: startTime.toTimeString().slice(0, 5), // HH:MM format
        endTime: endTime.toTimeString().slice(0, 5), // HH:MM format
        status: booking.status
      }
    })

    return NextResponse.json({ busyTimes })
  } catch (error) {
    console.error('Error fetching busy times:', error)
    return NextResponse.json(
      { error: 'Failed to fetch busy times' },
      { status: 500 }
    )
  }
}