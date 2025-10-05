const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkExistingNotifications() {
  try {
    console.log('🔍 Checking existing notifications in database...\n');

    // 1. Get all providers
    const providers = await prisma.providerProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log(`👥 Found ${providers.length} providers:`);
    providers.forEach(p => {
      console.log(`   - ${p.name} (${p.user.id})`);
    });

    // 2. Check notifications for each provider
    for (const provider of providers) {
      console.log(`\n🔔 Notifications for ${provider.name}:`);
      
      const notifications = await prisma.notification.findMany({
        where: { userId: provider.user.id },
        orderBy: { createdAt: 'desc' }
      });

      console.log(`   Total notifications: ${notifications.length}`);
      
      if (notifications.length > 0) {
        // Group by type
        const byType = {};
        notifications.forEach(n => {
          byType[n.type] = (byType[n.type] || 0) + 1;
        });

        console.log('   By type:');
        Object.entries(byType).forEach(([type, count]) => {
          console.log(`     - ${type}: ${count}`);
        });

        // Show recent notifications
        console.log('   Recent notifications:');
        notifications.slice(0, 3).forEach(n => {
          console.log(`     - ${n.title} (${n.type}) - ${n.status} - ${n.createdAt.toISOString()}`);
        });

        // Count unread
        const unread = notifications.filter(n => n.status === 'pending').length;
        console.log(`   Unread: ${unread}`);
      }
    }

    // 3. Check recent bookings
    console.log('\n📅 Recent bookings:');
    const recentBookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        customer: {
          select: { name: true }
        },
        provider: {
          select: { name: true }
        }
      }
    });

    recentBookings.forEach(b => {
      console.log(`   - ${b.serviceType} by ${b.customer.name} with ${b.provider.name} - ${b.status} - ${b.createdAt.toISOString()}`);
    });

    // 4. Test the notification API logic
    console.log('\n🧪 Testing notification filtering logic:');
    
    const providerNotificationTypes = [
      'new_appointment_request',
      'appointment_cancelled',
      'appointment_rescheduled',
      'new_order_request',
      'order_update',
      'payment_received',
      'review_received'
    ];

    for (const provider of providers) {
      const providerNotifications = await prisma.notification.findMany({
        where: {
          userId: provider.user.id,
          type: { in: providerNotificationTypes },
          status: { in: ['pending', 'sent'] }
        },
        orderBy: { createdAt: 'desc' }
      });

      const unreadCount = await prisma.notification.count({
        where: {
          userId: provider.user.id,
          type: { in: providerNotificationTypes },
          readAt: null
        }
      });

      console.log(`   ${provider.name}: ${providerNotifications.length} total, ${unreadCount} unread`);
    }

    console.log('\n✅ Database check completed!');

  } catch (error) {
    console.error('❌ Error checking notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExistingNotifications();