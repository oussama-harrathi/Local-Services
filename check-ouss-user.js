const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkOussUser() {
  console.log('🔍 Checking user "ouss ouss" with email harrathioussama182@gmail.com...\n');

  try {
    // 1. Find the user
    const user = await prisma.user.findUnique({
      where: {
        email: 'harrathioussama182@gmail.com'
      },
      include: {
        providerProfile: true,
        sessions: true
      }
    });

    if (!user) {
      console.log('❌ User not found with email harrathioussama182@gmail.com');
      
      // Check if there's a similar user
      const similarUsers = await prisma.user.findMany({
        where: {
          OR: [
            { email: { contains: 'ouss' } },
            { name: { contains: 'ouss' } }
          ]
        }
      });
      
      console.log(`Found ${similarUsers.length} similar users:`);
      similarUsers.forEach(u => {
        console.log(`  - ${u.name} (${u.email}) - Role: ${u.role}`);
      });
      
      return;
    }

    console.log('✅ User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Has Provider Profile: ${!!user.providerProfile}`);
    console.log(`   Active Sessions: ${user.sessions.length}`);

    if (user.providerProfile) {
      console.log(`   Provider Profile ID: ${user.providerProfile.id}`);
      console.log(`   Provider Name: ${user.providerProfile.name}`);
      console.log(`   Provider City: ${user.providerProfile.city}`);
    }

    // 2. Check notifications for this user
    console.log('\n📬 Checking notifications for this user:');
    
    const allNotifications = await prisma.notification.findMany({
      where: {
        userId: user.id
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Total notifications: ${allNotifications.length}`);
    
    if (allNotifications.length > 0) {
      console.log('\nAll notifications:');
      allNotifications.forEach((notif, index) => {
        console.log(`  ${index + 1}. ${notif.title}`);
        console.log(`     Type: ${notif.type}`);
        console.log(`     Status: ${notif.status}`);
        console.log(`     Read: ${notif.readAt ? 'YES' : 'NO'}`);
        console.log(`     Created: ${notif.createdAt}`);
        console.log(`     Metadata: ${notif.metadata}`);
        console.log('');
      });
    }

    // 3. Check provider-specific notifications
    const providerNotifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        type: 'provider'
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Provider notifications: ${providerNotifications.length}`);
    
    const unreadProviderNotifications = await prisma.notification.count({
      where: {
        userId: user.id,
        type: 'provider',
        readAt: null
      }
    });

    console.log(`Unread provider notifications: ${unreadProviderNotifications}`);

    // 4. Check bookings made TO this provider
    if (user.providerProfile) {
      console.log('\n📅 Checking bookings made to this provider:');
      
      const bookings = await prisma.booking.findMany({
        where: {
          providerId: user.providerProfile.id
        },
        include: {
          customer: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      console.log(`Total bookings: ${bookings.length}`);
      
      if (bookings.length > 0) {
        console.log('\nRecent bookings:');
        bookings.slice(0, 5).forEach((booking, index) => {
          console.log(`  ${index + 1}. ${booking.serviceType} - ${booking.status}`);
          console.log(`     Customer: ${booking.customer.name} (${booking.customer.email})`);
          console.log(`     Date: ${booking.date}`);
          console.log(`     Created: ${booking.createdAt}`);
          console.log('');
        });
      }
    }

  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOussUser();