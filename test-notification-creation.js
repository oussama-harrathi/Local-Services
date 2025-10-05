const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testNotificationCreation() {
  console.log('🧪 Testing notification creation for new bookings...\n');

  try {
    // Find the specific provider (ouss ouss)
    const provider = await prisma.user.findUnique({
      where: { email: 'harrathioussama182@gmail.com' },
      include: {
        providerProfile: true
      }
    });

    if (!provider || !provider.providerProfile) {
      console.log('❌ Provider not found');
      return;
    }

    console.log(`✅ Found provider: ${provider.name} (${provider.email})`);
    console.log(`   Provider Profile ID: ${provider.providerProfile.id}\n`);

    // Find a customer to test with
    const customer = await prisma.user.findFirst({
      where: { role: 'customer' }
    });

    if (!customer) {
      console.log('❌ No customer found for testing');
      return;
    }

    console.log(`✅ Found customer: ${customer.name} (${customer.email})\n`);

    // Check existing notifications before creating booking
    const existingNotifications = await prisma.notification.count({
      where: { userId: provider.id }
    });

    console.log(`📊 Existing notifications for provider: ${existingNotifications}`);

    // Create a test booking
    const testBooking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        providerId: provider.providerProfile.id,
        serviceType: 'haircut_mobile',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        duration: 60,
        notes: 'Test booking to verify notification creation',
        status: 'pending'
      }
    });

    console.log(`✅ Created test booking: ${testBooking.id}`);

    // Now manually call the notification enqueue function
    const { enqueueBookingNotifications } = require('./src/app/api/notifications/enqueue/route.ts');
    
    console.log('📨 Calling enqueueBookingNotifications...');
    
    const result = await enqueueBookingNotifications(
      testBooking.id,
      customer.id,
      provider.id, // Note: using provider user ID, not profile ID
      customer.name,
      provider.providerProfile.name,
      testBooking.serviceType,
      testBooking.date,
      testBooking.duration,
      testBooking.totalPrice
    );

    console.log('📨 Notification enqueue result:', result);

    // Check if notifications were created
    const newNotifications = await prisma.notification.findMany({
      where: { 
        userId: provider.id,
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n🔔 New notifications created: ${newNotifications.length}`);
    
    if (newNotifications.length > 0) {
      console.log('\n📄 New notification details:');
      newNotifications.forEach((notif, index) => {
        console.log(`  ${index + 1}. ${notif.title}`);
        console.log(`     Type: ${notif.type}`);
        console.log(`     Status: ${notif.status}`);
        console.log(`     Content: ${notif.content}`);
        console.log(`     Created: ${notif.createdAt}`);
        console.log('');
      });
    }

    // Check total notifications now
    const totalNotifications = await prisma.notification.count({
      where: { userId: provider.id }
    });

    console.log(`📊 Total notifications for provider now: ${totalNotifications}`);

    // Clean up test booking
    await prisma.booking.delete({
      where: { id: testBooking.id }
    });

    console.log(`🧹 Cleaned up test booking: ${testBooking.id}`);

    console.log('\n✅ Test completed!');

  } catch (error) {
    console.error('❌ Error testing notification creation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNotificationCreation();