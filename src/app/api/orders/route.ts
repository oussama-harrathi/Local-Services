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
    console.log('=== ORDER CREATION START ===');
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('Unauthorized: No session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User authenticated:', session.user.id);

    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    // Validate the data
    try {
      const validatedData = createOrderSchema.parse(body);
      console.log('Data validated successfully');
      
      // Check if provider exists
      const provider = await prisma.providerProfile.findUnique({
        where: { id: validatedData.providerId },
      });

      if (!provider) {
        console.log('Provider not found:', validatedData.providerId);
        return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
      }

      console.log('Provider found:', provider.name);

      // Check if provider is currently open for food orders (only if they have schedules configured)
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

      console.log(`Order attempt - Provider: ${validatedData.providerId}, Day: ${currentDay}, Time: ${currentTime}`);

      // Get provider's schedule for today
      const todaySchedule = await prisma.providerSchedule.findFirst({
        where: {
          providerId: validatedData.providerId,
          dayOfWeek: currentDay,
          isActive: true,
        },
      });

      console.log('Today schedule:', todaySchedule);

      // Only validate working hours if provider has schedules configured
      if (todaySchedule) {
        // Convert time strings to minutes for comparison
        const timeToMinutes = (timeStr: string) => {
          const [hours, minutes] = timeStr.split(':').map(Number);
          return hours * 60 + minutes;
        };

        const currentMinutes = timeToMinutes(currentTime);
        const startMinutes = timeToMinutes(todaySchedule.startTime);
        const endMinutes = timeToMinutes(todaySchedule.endTime);

        console.log(`Time check - Current: ${currentMinutes}, Start: ${startMinutes}, End: ${endMinutes}`);

        if (currentMinutes < startMinutes || currentMinutes >= endMinutes) {
          console.log(`Order outside working hours - Current: ${currentTime}, Available: ${todaySchedule.startTime}-${todaySchedule.endTime}`);
          return NextResponse.json({ 
            error: `Provider is only available for orders from ${todaySchedule.startTime} to ${todaySchedule.endTime}` 
          }, { status: 400 });
        }
      } else {
        // Check if provider has any schedules at all
        const hasAnySchedule = await prisma.providerSchedule.findFirst({
          where: {
            providerId: validatedData.providerId,
          },
        });

        if (hasAnySchedule) {
          // Provider has schedules but not active today
          console.log(`Provider has schedules but not available today (day ${currentDay})`);
          return NextResponse.json({ 
            error: 'Provider is not available for orders today. Please check their working hours.' 
          }, { status: 400 });
        }
        
        // Provider has no schedules configured - allow orders (they can manage availability manually)
        console.log(`Provider has no schedules configured - allowing order`);
      }

      // Calculate total price
      const totalPrice = validatedData.items.reduce((sum: number, item: { price: number; quantity: number }) => {
        return sum + (item.price * item.quantity);
      }, 0);

      console.log('Total price calculated:', totalPrice);

      // Create the order
      console.log('Creating order in database...');
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
              userId: true,
            },
          },
          customer: {
            select: {
              name: true,
            },
          },
        },
      });

      console.log('Order created successfully:', order.id);

      // Create notification for provider about new order request
      try {
        const metadata = JSON.stringify({
          orderId: order.id,
          customerName: order.customer.name,
          items: validatedData.items,
          totalPrice,
          deliveryAddress: validatedData.deliveryAddress,
          deliveryTime: validatedData.deliveryTime,
          notes: validatedData.notes,
        });

        await prisma.notification.create({
          data: {
            userId: order.provider.userId,
            type: 'new_order_request',
            title: 'New Order Request',
            content: `You have received a new order request from ${order.customer.name} for $${totalPrice.toFixed(2)}.`,
            scheduledAt: new Date(),
            metadata,
            status: 'pending',
          },
        });

        console.log('Provider notification created for new order');
      } catch (notificationError) {
        console.error('Failed to create provider notification:', notificationError);
        // Don't fail the order creation if notification fails
      }

      console.log('=== ORDER CREATION END ===');

      return NextResponse.json({
        ...order,
        items: JSON.parse(order.items),
      });
      
    } catch (validationError) {
      console.error('=== VALIDATION ERROR ===');
      console.error('Validation error:', validationError);
      if (validationError instanceof z.ZodError) {
        console.error('Validation issues:', validationError.issues);
        return NextResponse.json({ 
          error: 'Invalid order data', 
          details: validationError.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        }, { status: 400 });
      }
      throw validationError;
    }
    
  } catch (error) {
    console.error('=== ORDER CREATION ERROR ===');
    console.error('Error creating order:', error);
    console.error('=== ORDER CREATION ERROR END ===');
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