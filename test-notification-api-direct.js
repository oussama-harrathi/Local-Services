const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testNotificationAPI() {
  try {
    console.log('🧪 Testing notification API logic directly...\n');

    // Get a provider user
    const provider = await prisma.providerProfile.findFirst({
      include: {
        user: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    if (!provider) {
      console.log('❌ No provider found');
      return;
    }

    console.log(`👤 Testing with provider: ${provider.name} (${provider.user.id})`);

    // Simulate the notification API logic
    const providerNotificationTypes = [
      'new_appointment_request',
      'appointment_cancelled',
      'appointment_rescheduled',
      'new_order_request',
      'order_update',
      'payment_received',
      'review_received'
    ];

    // Test the exact query the API uses
    const whereClause = {
      userId: provider.user.id,
      type: {
        in: providerNotificationTypes
      }
    };

    console.log('🔍 Where clause:', JSON.stringify(whereClause, null, 2));

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    console.log(`📋 Found ${notifications.length} notifications:`);
    notifications.forEach(n => {
      console.log(`   - ${n.title} (${n.type}) - ${n.status} - ${n.createdAt.toISOString()}`);
    });

    // Test unread count
    const unreadCount = await prisma.notification.count({
      where: {
        ...whereClause,
        readAt: null,
      },
    });

    console.log(`📊 Unread count: ${unreadCount}`);

    // Test the API response format
    const apiResponse = {
      notifications,
      unreadCount,
      hasMore: notifications.length === 10,
    };

    console.log('\n📤 API Response format:');
    console.log(JSON.stringify(apiResponse, null, 2));

    console.log('\n✅ Notification API logic test completed!');

  } catch (error) {
    console.error('❌ Error testing notification API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNotificationAPI();