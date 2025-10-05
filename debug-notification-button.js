const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugNotificationButton() {
  try {
    console.log('🔍 Debugging ProviderNotificationButton issue...\n');

    // 1. Check if we have providers with notifications
    const providers = await prisma.providerProfile.findMany({
      include: {
        user: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    console.log(`👥 Found ${providers.length} providers:`);
    for (const provider of providers) {
      console.log(`   - ${provider.name} (${provider.user.id}) - Role: ${provider.user.role}`);
      
      // Check notifications for this provider
      const notifications = await prisma.notification.findMany({
        where: { userId: provider.user.id },
        orderBy: { createdAt: 'desc' }
      });
      
      console.log(`     Total notifications: ${notifications.length}`);
      
      if (notifications.length > 0) {
        const unread = notifications.filter(n => n.readAt === null).length;
        console.log(`     Unread: ${unread}`);
        console.log(`     Recent notifications:`);
        notifications.slice(0, 3).forEach(n => {
          console.log(`       - ${n.title} (${n.type}) - ${n.status} - ${n.readAt ? 'read' : 'unread'}`);
        });
      }
    }

    // 2. Test the exact API logic
    console.log('\n🧪 Testing API logic for first provider...');
    
    if (providers.length > 0) {
      const testProvider = providers[0];
      console.log(`Testing with: ${testProvider.name} (${testProvider.user.id})`);

      // Simulate the API query
      const providerNotificationTypes = [
        'new_appointment_request',
        'appointment_cancelled',
        'appointment_rescheduled',
        'new_order_request',
        'order_update',
        'payment_received',
        'review_received'
      ];

      const whereClause = {
        userId: testProvider.user.id,
        type: { in: providerNotificationTypes }
      };

      console.log('Where clause:', JSON.stringify(whereClause, null, 2));

      const apiNotifications = await prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      const unreadCount = await prisma.notification.count({
        where: {
          ...whereClause,
          readAt: null
        }
      });

      console.log(`📋 API would return:`);
      console.log(`   - ${apiNotifications.length} notifications`);
      console.log(`   - ${unreadCount} unread`);
      
      if (apiNotifications.length > 0) {
        console.log(`   - Notifications:`);
        apiNotifications.forEach(n => {
          console.log(`     * ${n.title} (${n.type}) - ${n.status} - ${n.readAt ? 'read' : 'unread'}`);
        });
      }

      // 3. Check user role
      console.log(`\n👤 User role check:`);
      const user = await prisma.user.findUnique({
        where: { id: testProvider.user.id },
        select: { role: true }
      });
      console.log(`   - User role: ${user?.role}`);
      console.log(`   - Should see provider notifications: ${user?.role === 'provider' ? 'YES' : 'NO'}`);
    }

    console.log('\n✅ Debug completed!');

  } catch (error) {
    console.error('❌ Error debugging:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugNotificationButton();