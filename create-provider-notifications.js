const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createProviderNotifications() {
  console.log('🔔 Creating test notifications for providers...\n');

  try {
    // Get all providers
    const providers = await prisma.user.findMany({
      where: { role: 'provider' },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    console.log(`Found ${providers.length} providers to create notifications for:`);
    
    for (const provider of providers) {
      console.log(`\nCreating notifications for ${provider.name}...`);
      
      // Create various types of provider notifications
      const notifications = [
        {
          userId: provider.id,
          type: 'provider',
          title: 'New Appointment Request',
          content: 'You have received a new appointment request from a customer.',
          metadata: JSON.stringify({ bookingId: 'test-booking-1', customerName: 'John Doe' }),
          status: 'sent',
          scheduledAt: new Date(),
          sentAt: new Date(),
          readAt: null // Unread
        },
        {
          userId: provider.id,
          type: 'provider',
          title: 'Booking Confirmed',
          content: 'Your appointment has been confirmed by the customer.',
          metadata: JSON.stringify({ bookingId: 'test-booking-2', customerName: 'Jane Smith' }),
          status: 'sent',
          scheduledAt: new Date(Date.now() - 60000), // 1 minute ago
          sentAt: new Date(Date.now() - 60000),
          readAt: null // Unread
        },
        {
          userId: provider.id,
          type: 'provider',
          title: 'New Order Request',
          content: 'You have received a new food order from a customer.',
          metadata: JSON.stringify({ orderId: 'test-order-1', customerName: 'Mike Johnson', total: 25.50 }),
          status: 'sent',
          scheduledAt: new Date(Date.now() - 120000), // 2 minutes ago
          sentAt: new Date(Date.now() - 120000),
          readAt: null // Unread
        },
        {
          userId: provider.id,
          type: 'provider',
          title: 'Payment Received',
          content: 'Payment has been received for your recent service.',
          metadata: JSON.stringify({ amount: 50.00, paymentId: 'pay-123' }),
          status: 'sent',
          scheduledAt: new Date(Date.now() - 180000), // 3 minutes ago
          sentAt: new Date(Date.now() - 180000),
          readAt: new Date(Date.now() - 60000) // Read 1 minute ago
        },
        {
          userId: provider.id,
          type: 'provider',
          title: 'Customer Review',
          content: 'You have received a new 5-star review from a customer!',
          metadata: JSON.stringify({ reviewId: 'review-123', rating: 5, customerName: 'Alice Brown' }),
          status: 'sent',
          scheduledAt: new Date(Date.now() - 240000), // 4 minutes ago
          sentAt: new Date(Date.now() - 240000),
          readAt: null // Unread
        }
      ];

      // Create notifications for this provider
      for (const notification of notifications) {
        await prisma.notification.create({
          data: notification
        });
        console.log(`  ✓ Created: ${notification.title}`);
      }
    }

    // Show summary
    console.log('\n📊 Summary:');
    for (const provider of providers) {
      const totalNotifications = await prisma.notification.count({
        where: { 
          userId: provider.id,
          type: 'provider'
        }
      });
      
      const unreadNotifications = await prisma.notification.count({
        where: { 
          userId: provider.id,
          type: 'provider',
          readAt: null
        }
      });
      
      console.log(`${provider.name}: ${totalNotifications} total, ${unreadNotifications} unread`);
    }

  } catch (error) {
    console.error('Error creating notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createProviderNotifications();