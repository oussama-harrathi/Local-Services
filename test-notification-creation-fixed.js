const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Manually implement the notification creation logic
async function createBookingNotifications(
  bookingId,
  customerId,
  providerId,
  customerName,
  providerName,
  serviceType,
  appointmentDate,
  duration,
  totalPrice
) {
  try {
    const notifications = [];

    // Check user preferences
    const [customerPrefs, providerPrefs] = await Promise.all([
      prisma.notificationPreference.findUnique({
        where: { userId: customerId }
      }),
      prisma.notificationPreference.findUnique({
        where: { userId: providerId }
      })
    ]);

    const metadata = JSON.stringify({
      bookingId,
      serviceType,
      appointmentDate: appointmentDate.toISOString(),
      duration,
      totalPrice,
      providerName,
      customerName,
    });

    // 1. Booking confirmation for customer (immediate)
    if (customerPrefs?.emailBookingConfirm !== false) {
      notifications.push({
        userId: customerId,
        type: 'booking_confirmation',
        title: 'Booking Confirmed - LocalSpark',
        content: `Your appointment with ${providerName} has been confirmed for ${appointmentDate.toLocaleDateString()}.`,
        scheduledAt: new Date(),
        metadata,
        status: 'pending'
      });
    }

    // 2. Provider notification for new appointment request
    if (providerPrefs?.emailBookingConfirm !== false) {
      notifications.push({
        userId: providerId,
        type: 'new_appointment_request',
        title: 'New Appointment Request - LocalSpark',
        content: `You have received a new appointment request from ${customerName} for ${appointmentDate.toLocaleDateString()}.`,
        scheduledAt: new Date(),
        metadata,
        status: 'pending'
      });
    }

    // 3. 24-hour reminder
    const reminder24h = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
    if (reminder24h > new Date() && customerPrefs?.emailBookingReminder !== false) {
      notifications.push({
        userId: customerId,
        type: 'booking_reminder_24h',
        title: 'Appointment Tomorrow - LocalSpark',
        content: `Reminder: Your appointment with ${providerName} is tomorrow.`,
        scheduledAt: reminder24h,
        metadata,
        status: 'pending'
      });
    }

    // 4. 2-hour reminder
    const reminder2h = new Date(appointmentDate.getTime() - 2 * 60 * 60 * 1000);
    if (reminder2h > new Date() && customerPrefs?.emailBookingReminder !== false) {
      notifications.push({
        userId: customerId,
        type: 'booking_reminder_2h',
        title: 'Appointment in 2 Hours - LocalSpark',
        content: `Reminder: Your appointment with ${providerName} is in 2 hours.`,
        scheduledAt: reminder2h,
        metadata,
        status: 'pending'
      });
    }

    // 5. Review request (24 hours after appointment)
    const reviewRequest = new Date(appointmentDate.getTime() + 24 * 60 * 60 * 1000);
    if (customerPrefs?.emailReviewRequest !== false) {
      notifications.push({
        userId: customerId,
        type: 'review_request',
        title: 'How was your experience? - LocalSpark',
        content: `Please share your experience with ${providerName}.`,
        scheduledAt: reviewRequest,
        metadata,
        status: 'pending'
      });
    }

    // Bulk create notifications
    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      });
    }

    return { success: true, count: notifications.length };

  } catch (error) {
    console.error('Failed to create booking notifications:', error);
    return { success: false, error: 'Failed to create notifications' };
  }
}

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

    // Find a different customer to test with (not the same as provider)
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

    // Now manually call the notification creation function
    console.log('📨 Creating booking notifications...');
    
    const result = await createBookingNotifications(
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

    console.log('📨 Notification creation result:', result);

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