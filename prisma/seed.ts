import { PrismaClient } from '@prisma/client';
import { mockProviders } from '../src/lib/mockData';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.report.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create users and provider profiles from mock data
  for (const provider of mockProviders) {
    // Create a fake user for each provider
    const user = await prisma.user.create({
      data: {
        email: `${provider.name.toLowerCase().replace(/\s+/g, '.')}@localspark.com`,
        role: 'provider',
      },
    });

    // Create provider profile
    await prisma.providerProfile.create({
      data: {
        userId: user.id,
        name: provider.name,
        city: provider.city,
        lat: provider.coords.lat,
        lng: provider.coords.lng,
        categories: provider.categories.join(','), // Convert array to comma-separated string
        bio: provider.bio,
        avatarUrl: provider.avatarUrl,
        whatsapp: provider.whatsapp,
        messenger: provider.messenger,
        isVerified: true, // Mark all seeded providers as verified
      },
    });

    console.log(`✅ Created provider: ${provider.name}`);
  }

  // Create some sample reviews
  const providers = await prisma.providerProfile.findMany({
    include: { user: true },
  });

  // Create some fake reviewer users
  const reviewerUsers = [];
  for (let i = 1; i <= 5; i++) {
    const reviewer = await prisma.user.create({
      data: {
        email: `reviewer${i}@example.com`,
        role: 'user',
      },
    });
    reviewerUsers.push(reviewer);
  }

  // Create reviews based on the mock data review counts and ratings
  for (const provider of mockProviders) {
    const dbProvider = providers.find((p: { name: string }) => p.name === provider.name);
    if (!dbProvider) continue;

    const reviewCount = Math.min(provider.review.count, 5); // Limit to 5 reviews per provider
    const baseRating = provider.review.rating;

    for (let i = 0; i < reviewCount; i++) {
      const reviewer = reviewerUsers[i % reviewerUsers.length];
      // Generate rating around the base rating (±0.5)
      const rating = Math.max(1, Math.min(5, Math.round(baseRating + (Math.random() - 0.5))));
      
      const reviewTexts = [
        'Great service, highly recommended!',
        'Professional and reliable.',
        'Excellent quality work.',
        'Very satisfied with the service.',
        'Good value for money.',
        'Friendly and punctual.',
        'Will definitely use again.',
      ];

      await prisma.review.create({
        data: {
          providerId: dbProvider.id,
          userId: reviewer.id,
          rating: rating,
          text: reviewTexts[i % reviewTexts.length],
        },
      });
    }
  }

  console.log('📝 Created sample reviews');

  const totalUsers = await prisma.user.count();
  const totalProviders = await prisma.providerProfile.count();
  const totalReviews = await prisma.review.count();

  console.log('🎉 Seed completed!');
  console.log(`📊 Created ${totalUsers} users, ${totalProviders} providers, ${totalReviews} reviews`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });