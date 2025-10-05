const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugProviderNotifications() {
  try {
    console.log('=== Debugging Provider Notifications ===\n');

    // 1. Check all users and their roles
    console.log('1. All Users and Roles:');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role} - ID: ${user.id}`);
    });

    // 2. Check providers specifically
    console.log('\n2. Provider Details:');
    const providers = await prisma.providerProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    providers.forEach((provider, index) => {
      console.log(`${index + 1}. Provider ID: ${provider.id}`);
      console.log(`   User: ${provider.user.name} (${provider.user.email})`);
      console.log(`   User Role: ${provider.user.role}`);
      console.log(`   User ID: ${provider.user.id}`);
      console.log('');
    });

    // 3. Check recent notifications for providers
    console.log('3. Recent Notifications for Provider Users:');
    const providerUsers = providers.map(p => p.user.id);
    
    for (const userId of providerUsers) {
      const user = users.find(u => u.id === userId);
      console.log(`\nNotifications for ${user.name} (ID: ${userId}):`);
      
      const notifications = await prisma.notification.findMany({
        where: {
          userId: userId
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      });

      if (notifications.length === 0) {
        console.log('  No notifications found');
      } else {
        notifications.forEach((notif, index) => {
          console.log(`  ${index + 1}. ${notif.type} - ${notif.title} (${notif.createdAt})`);
        });
      }
    }

    // 4. Test the notification filtering logic
    console.log('\n4. Testing Notification Filtering Logic:');
    const providerNotificationTypes = [
      'new_appointment_request',
      'appointment_cancelled',
      'appointment_rescheduled',
      'new_order_request',
      'order_update',
      'payment_received',
      'review_received'
    ];

    for (const userId of providerUsers) {
      const user = users.find(u => u.id === userId);
      console.log(`\nFiltered notifications for ${user.name}:`);
      
      const filteredNotifications = await prisma.notification.findMany({
        where: {
          userId: userId,
          type: {
            in: providerNotificationTypes
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      });

      console.log(`  Found ${filteredNotifications.length} provider-type notifications`);
      filteredNotifications.forEach((notif, index) => {
        console.log(`  ${index + 1}. ${notif.type} - ${notif.title}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugProviderNotifications();