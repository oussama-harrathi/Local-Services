const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugNotificationStatus() {
  try {
    console.log('🔍 Debugging notification status issue...\n');

    // 1. Check all notifications with failed status
    const failedNotifications = await prisma.notification.findMany({
      where: { status: 'failed' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: { name: true, email: true, role: true }
        }
      }
    });

    console.log(`❌ Found ${failedNotifications.length} failed notifications:`);
    failedNotifications.forEach(n => {
      console.log(`   - ${n.title} (${n.type}) for ${n.user.name} (${n.user.role}) - ${n.createdAt.toISOString()}`);
    });

    // 2. Check the notification schema to understand status field
    console.log('\n📋 Checking notification statuses in database:');
    const statusCounts = await prisma.notification.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    statusCounts.forEach(s => {
      console.log(`   - ${s.status}: ${s._count.status}`);
    });

    // 3. Update all failed notifications to pending status
    console.log('\n🔧 Updating failed notifications to pending status...');
    const updateResult = await prisma.notification.updateMany({
      where: { status: 'failed' },
      data: { status: 'pending' }
    });

    console.log(`✅ Updated ${updateResult.count} notifications from failed to pending`);

    // 4. Check provider notifications specifically
    console.log('\n👥 Checking provider notifications after update:');
    
    const providerNotificationTypes = [
      'new_appointment_request',
      'appointment_cancelled',
      'appointment_rescheduled',
      'new_order_request',
      'order_update',
      'payment_received',
      'review_received'
    ];

    const providers = await prisma.providerProfile.findMany({
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

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
      
      if (providerNotifications.length > 0) {
        console.log('     Recent notifications:');
        providerNotifications.slice(0, 3).forEach(n => {
          console.log(`       - ${n.title} (${n.type}) - ${n.status} - ${n.createdAt.toISOString()}`);
        });
      }
    }

    console.log('\n✅ Debug completed! Notifications should now be visible.');

  } catch (error) {
    console.error('❌ Error debugging notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugNotificationStatus();