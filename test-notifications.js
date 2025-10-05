// Test script to create sample notifications for testing
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestNotifications() {
  try {
    console.log('Creating test notifications...');

    // First, let's find a user to create notifications for
    const users = await prisma.user.findMany({
      take: 2,
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (users.length === 0) {
      console.log('No users found. Please create a user first.');
      return;
    }

    console.log(`Found ${users.length} users:`, users.map(u => ({ id: u.id, name: u.name, email: u.email })));

    const testNotifications = [
      {
        userId: users[0].id,
        type: 'booking_confirmation',
        title: 'Booking Confirmed',
        content: 'Your appointment with John\'s Plumbing has been confirmed for tomorrow at 2:00 PM.',
        scheduledAt: new Date(),
        status: 'pending',
        metadata: JSON.stringify({
          bookingId: 'test-booking-1',
          serviceType: 'Plumbing',
          appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          duration: 60,
          providerName: 'John\'s Plumbing',
          customerName: users[0].name || 'Customer',
        }),
      },
      {
        userId: users[0].id,
        type: 'booking_reminder_24h',
        title: 'Appointment Tomorrow',
        content: 'Reminder: Your appointment with Sarah\'s Cleaning is tomorrow at 10:00 AM.',
        scheduledAt: new Date(),
        status: 'pending',
        metadata: JSON.stringify({
          bookingId: 'test-booking-2',
          serviceType: 'Cleaning',
          appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          duration: 120,
          providerName: 'Sarah\'s Cleaning',
          customerName: users[0].name || 'Customer',
        }),
      },
      {
        userId: users[0].id,
        type: 'order_update',
        title: 'Order Confirmed',
        content: 'Your food order from Mike\'s Kitchen has been confirmed and will be delivered in 30 minutes.',
        scheduledAt: new Date(),
        status: 'pending',
        metadata: JSON.stringify({
          orderId: 'test-order-1',
          status: 'confirmed',
          providerName: 'Mike\'s Kitchen',
          customerName: users[0].name || 'Customer',
          items: [{ name: 'Pizza Margherita', price: 15.99, quantity: 1 }],
          totalPrice: 15.99,
          orderDate: new Date().toISOString(),
        }),
      },
    ];

    // Add notifications for second user if available (provider notifications)
    if (users.length > 1) {
      testNotifications.push(
        {
          userId: users[1].id,
          type: 'new_appointment_request',
          title: 'New Appointment Request',
          content: `You have received a new appointment request from ${users[0].name || 'Customer'}.`,
          scheduledAt: new Date(),
          status: 'pending',
          metadata: JSON.stringify({
            bookingId: 'test-booking-3',
            serviceType: 'Gardening',
            appointmentDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            duration: 90,
            providerName: users[1].name || 'Provider',
            customerName: users[0].name || 'Customer',
          }),
        },
        {
          userId: users[1].id,
          type: 'new_order_request',
          title: 'New Order Request',
          content: `You have received a new order request from ${users[0].name || 'Customer'} for $25.50.`,
          scheduledAt: new Date(),
          status: 'pending',
          metadata: JSON.stringify({
            orderId: 'test-order-2',
            customerName: users[0].name || 'Customer',
            items: [
              { name: 'Burger Deluxe', price: 12.99, quantity: 1 },
              { name: 'Fries', price: 4.99, quantity: 2 },
              { name: 'Soda', price: 2.99, quantity: 1 }
            ],
            totalPrice: 25.97,
            deliveryAddress: '123 Test Street, Test City',
            deliveryTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            notes: 'Please ring the doorbell',
          }),
        }
      );
    }

    // Create the notifications
    const result = await prisma.notification.createMany({
      data: testNotifications,
    });

    console.log(`✅ Created ${result.count} test notifications successfully!`);

    // Display the created notifications
    const createdNotifications = await prisma.notification.findMany({
      where: {
        userId: { in: users.map(u => u.id) },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    console.log('\nCreated notifications:');
    createdNotifications.forEach((notification, index) => {
      console.log(`${index + 1}. ${notification.title} (${notification.type}) - User: ${notification.userId}`);
    });

  } catch (error) {
    console.error('❌ Error creating test notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestNotifications();