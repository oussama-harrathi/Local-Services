import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const orderItemSchema = z.object({
  name: z.string(),
  price: z.number(),
  quantity: z.number().min(1),
  notes: z.string().optional(),
});

const createOrderSchema = z.object({
  providerId: z.string(),
  items: z.array(orderItemSchema),
  notes: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryTime: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    // Check if provider exists
    const provider = await prisma.providerProfile.findUnique({
      where: { id: validatedData.providerId },
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // Calculate total price
    const totalPrice = validatedData.items.reduce((sum: number, item: { price: number; quantity: number }) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Create the order
    const order = await prisma.order.create({
      data: {
        customerId: session.user.id,
        providerId: validatedData.providerId,
        items: JSON.stringify(validatedData.items),
        totalPrice,
        notes: validatedData.notes,
        deliveryAddress: validatedData.deliveryAddress,
        deliveryTime: validatedData.deliveryTime ? new Date(validatedData.deliveryTime) : null,
      },
      include: {
        provider: {
          select: {
            name: true,
            city: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...order,
      items: JSON.parse(order.items),
    });
  } catch (error) {
    console.error('Error creating order:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'customer' or 'provider'

    let orders;

    if (type === 'provider') {
      // Get orders for provider
      const providerProfile = await prisma.providerProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!providerProfile) {
        return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
      }

      orders = await prisma.order.findMany({
        where: { providerId: providerProfile.id },
        include: {
          customer: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Get orders for customer
      orders = await prisma.order.findMany({
        where: { customerId: session.user.id },
        include: {
          provider: {
            select: {
              name: true,
              city: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Parse items JSON for each order
    const ordersWithParsedItems = orders.map(order => ({
      ...order,
      items: JSON.parse(order.items),
    }));

    return NextResponse.json(ordersWithParsedItems);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}