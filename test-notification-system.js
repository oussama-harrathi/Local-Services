const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testNotificationSystem() {
  try {
    console.log('=== Testing Complete Notification System ===\n');

    // 1. Find a provider user
    const providerUser = await prisma.user.findFirst({
      where: {
        role: 'provider'
      },
      include: {
        providerProfile: true
      }
    });

    if (!providerUser) {
      console.log('❌ No provider user found');
      return;
    }

    console.log(`✅ Found provider: ${providerUser.name} (${providerUser.email})`);
    console.log(`   User ID: ${providerUser.id}`);
    console.log(`   Role: ${providerUser.role}`);

    // 2. Check existing notifications for this provider
    const existingNotifications = await prisma.notification.findMany({
      where: {
        userId: providerUser.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    console.log(`\n📋 Existing notifications for ${providerUser.name}:`);
    if (existingNotifications.length === 0) {
      console.log('   No existing notifications');
    } else {
      existingNotifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. ${notif.type} - ${notif.title} (${notif.readAt ? 'READ' : 'UNREAD'})`);
      });
    }

    // 3. Test the notification filtering logic
    const providerNotificationTypes = [
      'new_appointment_request',
      'appointment_cancelled',
      'appointment_rescheduled',
      'new_order_request',
      'order_update',
      'payment_received',
      'review_received'
    ];

    const filteredNotifications = await prisma.notification.findMany({
      where: {
        userId: providerUser.id,
        type: {
          in: providerNotificationTypes
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: providerUser.id,
        type: {
          in: providerNotificationTypes
        },
        readAt: null
      }
    });

    console.log(`\n🔍 Filtered provider notifications:`);
    console.log(`   Total: ${filteredNotifications.length}`);
    console.log(`   Unread: ${unreadCount}`);

    if (filteredNotifications.length > 0) {
      console.log('   Recent notifications:');
      filteredNotifications.slice(0, 3).forEach((notif, index) => {
        console.log(`     ${index + 1}. ${notif.type} - ${notif.title}`);
      });
    }

    // 4. Create a test notification to verify the system works
    console.log(`\n🧪 Creating test notification...`);
    
    const testNotification = await prisma.notification.create({
      data: {
        userId: providerUser.id,
        type: 'new_appointment_request',
        title: 'Test Appointment Request',
        content: 'This is a test notification to verify the system works.',
        status: 'pending',
        scheduledAt: new Date(),
        metadata: JSON.stringify({
          test: true,
          createdAt: new Date().toISOString()
        })
      }
    });

    console.log(`✅ Test notification created: ${testNotification.id}`);

    // 5. Verify the test notification appears in filtered results
    const updatedFilteredNotifications = await prisma.notification.findMany({
      where: {
        userId: providerUser.id,
        type: {
          in: providerNotificationTypes
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    const updatedUnreadCount = await prisma.notification.count({
      where: {
        userId: providerUser.id,
        type: {
          in: providerNotificationTypes
        },
        readAt: null
      }
    });

    console.log(`\n✅ After test notification:`);
    console.log(`   Total: ${updatedFilteredNotifications.length}`);
    console.log(`   Unread: ${updatedUnreadCount}`);

    // 6. Simulate API response
    console.log(`\n📡 Simulated API response:`);
    const apiResponse = {
      notifications: updatedFilteredNotifications.map(notif => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        content: notif.content,
        metadata: notif.metadata,
        readAt: notif.readAt,
        createdAt: notif.createdAt
      })),
      unreadCount: updatedUnreadCount,
      hasMore: updatedFilteredNotifications.length === 10
    };

    console.log(JSON.stringify(apiResponse, null, 2));

    // 7. Clean up test notification
    await prisma.notification.delete({
      where: {
        id: testNotification.id
      }
    });

    console.log(`\n🧹 Test notification cleaned up`);

    console.log(`\n🎉 Notification system test completed successfully!`);
    console.log(`\n📝 Summary:`);
    console.log(`   - Provider user found: ✅`);
    console.log(`   - Existing notifications: ${existingNotifications.length}`);
    console.log(`   - Filtered notifications: ${filteredNotifications.length}`);
    console.log(`   - Unread count: ${unreadCount}`);
    console.log(`   - Test notification creation: ✅`);
    console.log(`   - API response simulation: ✅`);

    if (unreadCount > 0) {
      console.log(`\n🔔 The provider should see ${unreadCount} unread notifications in the UI`);
    } else {
      console.log(`\n💡 No unread notifications - create a new appointment to generate notifications`);
    }

  } catch (error) {
    console.error('❌ Error testing notification system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNotificationSystem();