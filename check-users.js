const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    // Check if there are any providers
    const providers = await prisma.provider.findMany({
      select: {
        id: true,
        name: true,
        userId: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    console.log('\nProviders in database:');
    providers.forEach(provider => {
      console.log(`- ${provider.name} (User: ${provider.user.name})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();