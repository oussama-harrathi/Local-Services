const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkNotifications() {
  try {
    console.log('Checking all notifications in database...');
    
    const notifications = await prisma.notification.findMany({
      select: {
        id: true,
        userId: true,
        type: true,
        title: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    
    console.log('\nFound', notifications.length, 'notifications:');
    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. Type: ${notif.type}`);
      console.log(`   Title: ${notif.title}`);
      console.log(`   User: ${notif.user.name} (${notif.user.email})`);
      console.log(`   Created: ${notif.createdAt}`);
      console.log('');
    });
    
    // Check provider vs customer notification types
    console.log('\n=== Notification Type Analysis ===');
    const providerTypes = ['new_appointment_request', 'new_order_request', 'booking_update', 'order_update'];
    const customerTypes = ['booking_confirmation', 'booking_reminder_24h', 'booking_reminder_2h', 'review_request', 'order_confirmation'];
    
    const providerNotifs = notifications.filter(n => providerTypes.includes(n.type));
    const customerNotifs = notifications.filter(n => customerTypes.includes(n.type));
    
    console.log(`Provider notifications: ${providerNotifs.length}`);
    providerNotifs.forEach(n => console.log(`  - ${n.type}: ${n.title}`));
    
    console.log(`\nCustomer notifications: ${customerNotifs.length}`);
    customerNotifs.forEach(n => console.log(`  - ${n.type}: ${n.title}`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNotifications();