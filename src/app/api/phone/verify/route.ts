import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { phoneVerificationService } from '@/lib/phone-verification';
import { z } from 'zod';

const sendCodeSchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format. Use international format (+1234567890)'),
});

const verifyCodeSchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    const body = await request.json();
    const { action } = body;

    if (action === 'send_code') {
      const validatedData = sendCodeSchema.parse(body);
      
      const result = await phoneVerificationService.sendVerificationCode(
        session.user.id,
        validatedData.phone,
        ipAddress
      );

      return NextResponse.json(result, { 
        status: result.success ? 200 : 400 
      });
    }

    if (action === 'verify_code') {
      const validatedData = verifyCodeSchema.parse(body);
      
      const result = await phoneVerificationService.verifyCode(
        session.user.id,
        validatedData.phone,
        validatedData.code,
        ipAddress
      );

      return NextResponse.json(result, { 
        status: result.success ? 200 : 400 
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "send_code" or "verify_code"' },
      { status: 400 }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Phone verification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const isVerified = await phoneVerificationService.isPhoneVerified(session.user.id);
    
    return NextResponse.json({ 
      phoneVerified: isVerified 
    });

  } catch (error) {
    console.error('Phone verification status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}