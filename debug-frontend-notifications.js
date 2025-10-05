const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugFrontendNotifications() {
  try {
    console.log('=== Debugging Frontend Notification Issues ===\n');

    // 1. Check which users are providers
    const providerUsers = await prisma.user.findMany({
      where: {
        role: 'provider'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    console.log('1. Provider Users:');
    providerUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ID: ${user.id}`);
    });

    // 2. For each provider, simulate the API call
    console.log('\n2. Simulating API calls for each provider:');
    
    const providerNotificationTypes = [
      'new_appointment_request',
      'appointment_cancelled',
      'appointment_rescheduled',
      'new_order_request',
      'order_update',
      'payment_received',
      'review_received'
    ];

    for (const user of providerUsers) {
      console.log(`\n--- ${user.name} (${user.email}) ---`);
      
      // Simulate the exact query the API would make
      const notifications = await prisma.notification.findMany({
        where: {
          userId: user.id,
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
          userId: user.id,
          type: {
            in: providerNotificationTypes
          },
          readAt: null
        }
      });

      console.log(`Total notifications: ${notifications.length}`);
      console.log(`Unread count: ${unreadCount}`);
      
      if (notifications.length > 0) {
        console.log('Recent notifications:');
        notifications.slice(0, 3).forEach((notif, index) => {
          console.log(`  ${index + 1}. ${notif.type} - ${notif.title} (${notif.createdAt})`);
        });
      } else {
        console.log('No notifications found for this provider');
      }
    }

    // 3. Check if there are any notifications with wrong user IDs
    console.log('\n3. Checking for notification assignment issues:');
    
    const allNotifications = await prisma.notification.findMany({
      where: {
        type: {
          in: providerNotificationTypes
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    console.log(`Found ${allNotifications.length} provider-type notifications:`);
    allNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.type} -> ${notif.user.name} (${notif.user.role})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugFrontendNotifications();