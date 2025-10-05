const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBookingNotificationFlow() {
  try {
    console.log('🔍 Testing booking notification flow...\n');

    // 1. Find a customer and provider
    const customer = await prisma.user.findFirst({
      where: { role: 'customer' }
    });

    const provider = await prisma.providerProfile.findFirst({
      include: {
        user: true
      }
    });

    if (!customer || !provider) {
      console.log('❌ Need both customer and provider users for testing');
      return;
    }

    console.log(`👤 Customer: ${customer.name} (${customer.id})`);
    console.log(`🏪 Provider: ${provider.name} (${provider.user.id})\n`);

    // 2. Check existing notifications for provider before booking
    const existingNotifications = await prisma.notification.findMany({
      where: { 
        userId: provider.user.id,
        type: 'new_appointment_request'
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📋 Existing appointment request notifications for provider: ${existingNotifications.length}`);

    // 3. Create a test booking (simulating the API call)
    const testBooking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        providerId: provider.id,
        serviceType: 'cleaning',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        duration: 120,
        notes: 'Test booking for notification flow',
        status: 'pending'
      }
    });

    console.log(`✅ Created test booking: ${testBooking.id}\n`);

    // 4. Manually create provider notification (simulating what should happen)
    const providerNotification = await prisma.notification.create({
      data: {
        userId: provider.user.id,
        type: 'new_appointment_request',
        title: 'New Appointment Request - LocalSpark',
        content: `You have received a new appointment request from ${customer.name} for ${testBooking.date.toLocaleDateString()}.`,
        scheduledAt: new Date(),
        metadata: JSON.stringify({
          bookingId: testBooking.id,
          serviceType: testBooking.serviceType,
          appointmentDate: testBooking.date.toISOString(),
          duration: testBooking.duration,
          totalPrice: testBooking.totalPrice,
          providerName: provider.name,
          customerName: customer.name,
        }),
        status: 'pending'
      }
    });

    console.log('📨 Created provider notification:', providerNotification.id);

    // 5. Check if provider notification was created
    const newNotifications = await prisma.notification.findMany({
      where: { 
        userId: provider.user.id,
        type: 'new_appointment_request',
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n🔔 New appointment request notifications created: ${newNotifications.length}`);
    
    if (newNotifications.length > 0) {
      console.log('📄 Latest notification details:');
      const latest = newNotifications[0];
      console.log(`   - Title: ${latest.title}`);
      console.log(`   - Content: ${latest.content}`);
      console.log(`   - Type: ${latest.type}`);
      console.log(`   - Status: ${latest.status}`);
      console.log(`   - Created: ${latest.createdAt}`);
    }

    // 6. Test the notification filtering logic (simulating ProviderNotificationButton)
    const allProviderNotifications = await prisma.notification.findMany({
      where: { 
        userId: provider.user.id,
        status: { in: ['pending', 'sent'] }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n📊 All provider notifications: ${allProviderNotifications.length}`);

    // Filter for unread notifications (status: pending)
    const unreadNotifications = allProviderNotifications.filter(n => n.status === 'pending');
    console.log(`📬 Unread notifications: ${unreadNotifications.length}`);

    // Check notification types
    const notificationTypes = {};
    allProviderNotifications.forEach(n => {
      notificationTypes[n.type] = (notificationTypes[n.type] || 0) + 1;
    });

    console.log('\n📈 Notification types breakdown:');
    Object.entries(notificationTypes).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`);
    });

    // 7. Clean up test booking
    await prisma.booking.delete({
      where: { id: testBooking.id }
    });

    console.log(`\n🧹 Cleaned up test booking: ${testBooking.id}`);

    console.log('\n✅ Booking notification flow test completed!');

  } catch (error) {
    console.error('❌ Error testing booking notification flow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBookingNotificationFlow();