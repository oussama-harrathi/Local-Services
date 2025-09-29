import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = updateOrderSchema.parse(body);

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        provider: true,
        customer: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if user has permission to update this order
    const isProvider = order.provider.userId === session.user.id;
    const isCustomer = order.customerId === session.user.id;

    if (!isProvider && !isCustomer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only providers can update order status (except customers can cancel)
    if (!isProvider && status !== 'cancelled') {
      return NextResponse.json({ error: 'Only providers can update order status' }, { status: 403 });
    }

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: {
        provider: {
          select: {
            name: true,
            city: true,
            avatarUrl: true,
          },
        },
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...updatedOrder,
      items: JSON.parse(updatedOrder.items),
    });
  } catch (error) {
    console.error('Error updating order:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        provider: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if user has permission to delete this order
    const isProvider = order.provider.userId === session.user.id;
    const isCustomer = order.customerId === session.user.id;

    if (!isProvider && !isCustomer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the order
    await prisma.order.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}