const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function createTestSession() {
  try {
    console.log('🔧 Creating test session for provider...');

    // Find a provider user
    const provider = await prisma.user.findFirst({
      where: { role: 'provider' },
      include: {
        providerProfile: true
      }
    });

    if (!provider) {
      console.log('❌ No provider found');
      return;
    }

    console.log(`👤 Found provider: ${provider.name} (${provider.id})`);

    // Create a session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setDate(expires.getDate() + 30); // 30 days from now

    // Create session
    const session = await prisma.session.create({
      data: {
        sessionToken,
        userId: provider.id,
        expires
      }
    });

    console.log(`✅ Created session:`);
    console.log(`   - Session Token: ${sessionToken}`);
    console.log(`   - User ID: ${provider.id}`);
    console.log(`   - Expires: ${expires.toISOString()}`);
    console.log(`   - Provider Name: ${provider.name}`);

    // Test cookie format
    const cookieValue = `next-auth.session-token=${sessionToken}; Path=/; HttpOnly; SameSite=Lax`;
    console.log(`\n🍪 Cookie to set in browser:`);
    console.log(cookieValue);

    console.log(`\n📋 Manual test steps:`);
    console.log(`1. Open browser dev tools`);
    console.log(`2. Go to Application/Storage > Cookies > http://localhost:3000`);
    console.log(`3. Add cookie: name="next-auth.session-token", value="${sessionToken}"`);
    console.log(`4. Refresh the page`);

  } catch (error) {
    console.error('❌ Error creating session:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestSession();