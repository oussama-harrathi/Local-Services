const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getSessionInfo() {
  console.log('🍪 Getting session information for browser setup...\n');

  try {
    // Get Sarah Johnson's session (she's a provider)
    const session = await prisma.session.findFirst({
      where: {
        user: {
          email: 'sarah.johnson@localspark.com',
          role: 'provider'
        }
      },
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

    if (!session) {
      console.log('❌ No session found for Sarah Johnson');
      return;
    }

    console.log('✅ Session found for Sarah Johnson:');
    console.log(`   User: ${session.user.name} (${session.user.email})`);
    console.log(`   Role: ${session.user.role}`);
    console.log(`   Session Token: ${session.sessionToken}`);
    console.log(`   Expires: ${session.expires}`);
    console.log(`   Is Valid: ${new Date() < session.expires}`);

    console.log('\n🌐 To set this session in your browser:');
    console.log('1. Open Developer Tools (F12)');
    console.log('2. Go to Console tab');
    console.log('3. Paste this command:');
    console.log(`\ndocument.cookie = "next-auth.session-token=${session.sessionToken}; path=/; domain=localhost; expires=${session.expires.toUTCString()}";`);
    console.log('\n4. Refresh the page');
    console.log('\nAlternatively, you can run this in the console:');
    console.log(`localStorage.setItem('debug-session-token', '${session.sessionToken}');`);

  } catch (error) {
    console.error('Error getting session info:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getSessionInfo();