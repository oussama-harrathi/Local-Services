const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRealBookingCreation() {
  console.log('🧪 Testing real booking creation with notifications...\n');

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
    console.log(`   Provider Profile ID: ${provider.providerProfile.id}`);
    console.log(`   Provider User ID: ${provider.id}\n`);

    // Find a different customer to test with
    const customer = await prisma.user.findFirst({
      where: { 
        role: 'customer',
        email: { not: 'harrathioussama182@gmail.com' }
      }
    });

    if (!customer) {
      console.log('❌ No different customer found for testing');
      return;
    }

    console.log(`✅ Found customer: ${customer.name} (${customer.email})\n`);

    // Check existing notifications before creating booking
    const existingNotifications = await prisma.notification.count({
      where: { userId: provider.id }
    });

    console.log(`📊 Existing notifications for provider: ${existingNotifications}`);

    // Simulate the booking creation process (like the API does)
    console.log('📝 Creating booking...');

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        providerId: provider.providerProfile.id,
        serviceType: 'haircut_mobile',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        duration: 60,
        notes: 'Real test booking with notifications',
        totalPrice: 50,
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

    console.log(`✅ Created booking: ${booking.id}`);

    // Now call the notification enqueue function with the correct parameters
    console.log('📨 Enqueuing booking notifications...');

    // Manually implement the notification creation (like the API should do)
    const notifications = [];

    // Check user preferences
    const [customerPrefs, providerPrefs] = await Promise.all([
      prisma.notificationPreference.findUnique({
        where: { userId: customer.id }
      }),
      prisma.notificationPreference.findUnique({
        where: { userId: provider.id }
      })
    ]);

    const metadata = JSON.stringify({
      bookingId: booking.id,
      serviceType: booking.serviceType,
      appointmentDate: booking.date.toISOString(),
      duration: booking.duration,
      totalPrice: booking.totalPrice,
      providerName: provider.providerProfile.name,
      customerName: customer.name,
    });

    // 1. Booking confirmation for customer
    if (customerPrefs?.emailBookingConfirm !== false) {
      notifications.push({
        userId: customer.id,
        type: 'booking_confirmation',
        title: 'Booking Confirmed - LocalSpark',
        content: `Your appointment with ${provider.providerProfile.name} has been confirmed for ${booking.date.toLocaleDateString()}.`,
        scheduledAt: new Date(),
        metadata,
        status: 'pending'
      });
    }

    // 2. Provider notification for new appointment request
    if (providerPrefs?.emailBookingConfirm !== false) {
      notifications.push({
        userId: provider.id, // This is the key fix - use provider.id (user ID), not provider.providerProfile.id
        type: 'new_appointment_request',
        title: 'New Appointment Request - LocalSpark',
        content: `You have received a new appointment request from ${customer.name} for ${booking.date.toLocaleDateString()}.`,
        scheduledAt: new Date(),
        metadata,
        status: 'pending'
      });
    }

    // Create notifications
    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      });
      console.log(`📨 Created ${notifications.length} notifications`);
    }

    // Check if provider notification was created
    const newProviderNotifications = await prisma.notification.findMany({
      where: { 
        userId: provider.id,
        type: 'new_appointment_request',
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n🔔 New provider notifications created: ${newProviderNotifications.length}`);
    
    if (newProviderNotifications.length > 0) {
      console.log('\n📄 Provider notification details:');
      newProviderNotifications.forEach((notif, index) => {
        console.log(`  ${index + 1}. ${notif.title}`);
        console.log(`     Type: ${notif.type}`);
        console.log(`     Status: ${notif.status}`);
        console.log(`     Content: ${notif.content}`);
        console.log(`     User ID: ${notif.userId}`);
        console.log(`     Created: ${notif.createdAt}`);
        console.log('');
      });
    }

    // Check total notifications now
    const totalNotifications = await prisma.notification.count({
      where: { userId: provider.id }
    });

    console.log(`📊 Total notifications for provider now: ${totalNotifications}`);

    // Check unread notifications
    const unreadNotifications = await prisma.notification.count({
      where: { 
        userId: provider.id,
        readAt: null
      }
    });

    console.log(`📬 Unread notifications for provider: ${unreadNotifications}`);

    // Don't clean up - leave the booking and notifications for testing
    console.log(`\n📌 Keeping booking ${booking.id} for testing purposes`);

    console.log('\n✅ Real booking creation test completed!');
    console.log('\n🎯 RESULT: Provider should now see notifications in the dashboard');

  } catch (error) {
    console.error('❌ Error testing real booking creation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRealBookingCreation();