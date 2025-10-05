const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugSessionIssue() {
  console.log('🔍 Debugging session and notification issue...\n');

  try {
    // 1. Check all sessions in the database
    console.log('1. Checking all sessions in database:');
    const sessions = await prisma.session.findMany({
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
    
    console.log(`Found ${sessions.length} sessions:`);
    sessions.forEach((session, index) => {
      console.log(`  Session ${index + 1}:`);
      console.log(`    - Session Token: ${session.sessionToken.substring(0, 20)}...`);
      console.log(`    - User: ${session.user.name} (${session.user.email})`);
      console.log(`    - Role: ${session.user.role}`);
      console.log(`    - Expires: ${session.expires}`);
      console.log(`    - Is Valid: ${new Date() < session.expires}`);
    });

    // 2. Check provider users
    console.log('\n2. Checking provider users:');
    const providers = await prisma.user.findMany({
      where: { role: 'provider' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    console.log(`Found ${providers.length} providers:`);
    providers.forEach((provider, index) => {
      console.log(`  Provider ${index + 1}: ${provider.name} (${provider.email}) - ID: ${provider.id}`);
    });

    // 3. Check notifications for each provider
    console.log('\n3. Checking notifications for providers:');
    for (const provider of providers) {
      const notifications = await prisma.notification.findMany({
        where: { 
          userId: provider.id,
          type: 'provider'
        },
        orderBy: { createdAt: 'desc' }
      });
      
      console.log(`  ${provider.name}: ${notifications.length} notifications`);
      notifications.forEach((notif, index) => {
        console.log(`    ${index + 1}. ${notif.title} - ${notif.readAt ? 'READ' : 'UNREAD'}`);
      });
    }

    // 4. Test the API logic manually
    console.log('\n4. Testing API logic for first provider:');
    if (providers.length > 0) {
      const testProvider = providers[0];
      console.log(`Testing for: ${testProvider.name} (ID: ${testProvider.id})`);
      
      const apiNotifications = await prisma.notification.findMany({
        where: {
          userId: testProvider.id,
          type: 'provider'
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      const unreadCount = await prisma.notification.count({
        where: {
          userId: testProvider.id,
          type: 'provider',
          readAt: null
        }
      });

      console.log(`API would return:`);
      console.log(`  - Notifications: ${apiNotifications.length}`);
      console.log(`  - Unread count: ${unreadCount}`);
      console.log(`  - Has more: ${apiNotifications.length === 10}`);
    }

  } catch (error) {
    console.error('Error debugging session issue:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSessionIssue();