import { prisma } from './db';
import { phoneVerificationLimiter, phoneVerificationCodeLimiter } from './rate-limit';

export interface PhoneVerificationResult {
  success: boolean;
  message: string;
  verificationId?: string;
  error?: string;
}

export class PhoneVerificationService {
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private isValidPhoneNumber(phone: string): boolean {
    // Basic phone number validation (international format)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  async sendVerificationCode(
    userId: string,
    phone: string,
    ipAddress?: string
  ): Promise<PhoneVerificationResult> {
    try {
      // Validate phone number format
      if (!this.isValidPhoneNumber(phone)) {
        return {
          success: false,
          message: 'Invalid phone number format. Please use international format (+1234567890)',
        };
      }

      // Check rate limits
      const rateLimitResult = await phoneVerificationCodeLimiter.checkLimit(
        userId,
        phone,
        ipAddress
      );

      if (!rateLimitResult.success) {
        return {
          success: false,
          message: `Too many verification attempts. Please try again after ${rateLimitResult.resetTime.toLocaleTimeString()}`,
          error: 'RATE_LIMIT_EXCEEDED',
        };
      }

      // Check if phone is already verified by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          phone,
          phoneVerified: { not: null },
          id: { not: userId },
        },
      });

      if (existingUser) {
        return {
          success: false,
          message: 'This phone number is already verified by another account',
          error: 'PHONE_ALREADY_VERIFIED',
        };
      }

      // Generate verification code
      const code = this.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Clean up old verification attempts
      await prisma.phoneVerification.deleteMany({
        where: {
          userId,
          verified: false,
          expiresAt: { lt: new Date() },
        },
      });

      // Create new verification entry
      const verification = await prisma.phoneVerification.create({
        data: {
          userId,
          phone,
          code,
          expiresAt,
        },
      });

      // In a real application, you would send SMS here
      // For development, we'll log the code
      console.log(`📱 Verification code for ${phone}: ${code}`);
      
      // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
      // await this.sendSMS(phone, `Your LocalSpark verification code is: ${code}`);

      return {
        success: true,
        message: 'Verification code sent successfully',
        verificationId: verification.id,
      };
    } catch (error) {
      console.error('Phone verification error:', error);
      return {
        success: false,
        message: 'Failed to send verification code. Please try again.',
        error: 'INTERNAL_ERROR',
      };
    }
  }

  async verifyCode(
    userId: string,
    phone: string,
    code: string,
    ipAddress?: string
  ): Promise<PhoneVerificationResult> {
    try {
      // Check rate limits
      const rateLimitResult = await phoneVerificationLimiter.checkLimit(
        userId,
        phone,
        ipAddress
      );

      if (!rateLimitResult.success) {
        return {
          success: false,
          message: `Too many verification attempts. Please try again after ${rateLimitResult.resetTime.toLocaleTimeString()}`,
          error: 'RATE_LIMIT_EXCEEDED',
        };
      }

      // Find verification entry
      const verification = await prisma.phoneVerification.findFirst({
        where: {
          userId,
          phone,
          code,
          verified: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (!verification) {
        return {
          success: false,
          message: 'Invalid or expired verification code',
          error: 'INVALID_CODE',
        };
      }

      // Mark verification as completed
      await prisma.phoneVerification.update({
        where: { id: verification.id },
        data: { verified: true },
      });

      // Update user's phone and verification status
      await prisma.user.update({
        where: { id: userId },
        data: {
          phone,
          phoneVerified: new Date(),
        },
      });

      // Clean up old verification entries for this user
      await prisma.phoneVerification.deleteMany({
        where: {
          userId,
          id: { not: verification.id },
        },
      });

      return {
        success: true,
        message: 'Phone number verified successfully',
      };
    } catch (error) {
      console.error('Phone verification error:', error);
      return {
        success: false,
        message: 'Verification failed. Please try again.',
        error: 'INTERNAL_ERROR',
      };
    }
  }

  async isPhoneVerified(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { phoneVerified: true },
      });

      return !!user?.phoneVerified;
    } catch (error) {
      console.error('Phone verification check error:', error);
      return false;
    }
  }

  // TODO: Implement SMS sending with your preferred provider
  private async sendSMS(phone: string, message: string): Promise<void> {
    // Example integration with Twilio:
    /*
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    */
    
    // For now, just log the message
    console.log(`SMS to ${phone}: ${message}`);
  }
}

export const phoneVerificationService = new PhoneVerificationService();