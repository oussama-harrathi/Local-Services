import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const providerId = params.id;
    
    // Check if provider exists
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }
    
    // Perform cascading deletion in the correct order
    // 1. Delete favorites first (references provider)
    await prisma.favorite.deleteMany({
      where: { providerId: providerId },
    });
    
    // 2. Delete reviews (references provider)
    await prisma.review.deleteMany({
      where: { providerId: providerId },
    });
    
    // 3. Delete reports (references provider)
    await prisma.report.deleteMany({
      where: { 
        provider: {
          id: providerId
        }
      },
    });
    
    // 4. Delete the provider profile
    await prisma.providerProfile.delete({
      where: { id: providerId },
    });
    
    // 5. Optionally delete the user account if they have no other roles
    // Check if the user has any other provider profiles or is just a customer
    const userHasOtherProfiles = await prisma.providerProfile.findFirst({
      where: { 
        userId: provider.user.id,
        id: { not: providerId }
      },
    });
    
    // If user has no other provider profiles and their role is 'provider', 
    // we can delete the user account entirely
    if (!userHasOtherProfiles && provider.user) {
      const user = await prisma.user.findUnique({
        where: { id: provider.user.id },
      });
      
      if (user?.role === 'provider') {
        // Delete user's sessions first
        await prisma.session.deleteMany({
          where: { userId: provider.user.id },
        });
        
        // Delete user's accounts
        await prisma.account.deleteMany({
          where: { userId: provider.user.id },
        });
        
        // Delete the user
        await prisma.user.delete({
          where: { id: provider.user.id },
        });
      }
    }
    
    return NextResponse.json({ 
      message: 'Provider deleted successfully',
      deletedProvider: {
        id: provider.id,
        name: provider.name,
        email: provider.user.email,
      }
    });
  } catch (error) {
    console.error('Error deleting provider:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}