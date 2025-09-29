import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data - COMMENTED OUT to preserve existing providers
  // await prisma.favorite.deleteMany();
  // await prisma.review.deleteMany();
  // await prisma.report.deleteMany();
  // await prisma.providerProfile.deleteMany();
  // await prisma.user.deleteMany();

  console.log('🔄 Preserving existing data - adding new sample providers');

  // Create users and provider profiles from hardcoded data
  const providersData = [
    {
      name: 'Sarah Johnson',
      city: 'Tunis',
      coords: { lat: 36.8065, lng: 10.1815 },
      categories: ['cleaning'],
      bio: 'Professional cleaning service with 5+ years experience',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      whatsapp: '+216 20 123 456',
      messenger: 'sarah.johnson',
      review: { rating: 4.8, count: 12 }
    },
    {
      name: 'Ahmed Ben Ali',
      city: 'Sousse',
      coords: { lat: 35.8256, lng: 10.6369 },
      categories: ['repairs'],
      bio: 'Expert handyman for all your repair needs',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      whatsapp: '+216 25 789 012',
      messenger: 'ahmed.benali',
      review: { rating: 4.9, count: 8 }
    },
    {
      name: 'Maria Rossi',
      city: 'Budapest',
      coords: { lat: 47.4979, lng: 19.0402 },
      categories: ['food_home'],
      bio: 'Authentic Italian cuisine prepared in your home',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      whatsapp: '+36 30 456 789',
      messenger: 'maria.rossi',
      review: { rating: 4.7, count: 15 }
    }
  ];

  for (const provider of providersData) {
    // Check if provider already exists to avoid duplicates
    const existingProvider = await prisma.providerProfile.findFirst({
      where: { name: provider.name }
    });

    if (existingProvider) {
      console.log(`⏭️  Skipping existing provider: ${provider.name}`);
      continue;
    }

    // Create a fake user for each provider
    const user = await prisma.user.create({
      data: {
        name: provider.name,
        email: `${provider.name.toLowerCase().replace(/\s+/g, '.')}@localspark.com`,
        image: provider.avatarUrl,
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
  const reviewerNames = ['John Smith', 'Emma Wilson', 'Michael Brown', 'Lisa Davis', 'David Miller'];
  for (let i = 1; i <= 5; i++) {
    const reviewer = await prisma.user.create({
      data: {
        name: reviewerNames[i - 1],
        email: `reviewer${i}@example.com`,
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=reviewer${i}`,
        role: 'user',
      },
    });
    reviewerUsers.push(reviewer);
  }

  // Create reviews based on the provider data review counts and ratings
  for (const provider of providersData) {
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