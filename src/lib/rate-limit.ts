import { prisma } from './db';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: Date;
  error?: string;
}

export class RateLimiter {
  private config: RateLimitConfig;
  private action: string;

  constructor(action: string, config: RateLimitConfig) {
    this.action = action;
    this.config = config;
  }

  async checkLimit(
    userId?: string,
    phone?: string,
    ipAddress?: string
  ): Promise<RateLimitResult> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - this.config.windowMs);

    try {
      // Clean up expired entries
      await this.cleanupExpiredEntries();

      // Find existing rate limit entry
      const existingEntry = await prisma.rateLimitEntry.findFirst({
        where: {
          OR: [
            userId ? { userId, action: this.action } : {},
            phone ? { phone, action: this.action } : {},
            ipAddress ? { ipAddress, action: this.action } : {},
          ].filter(condition => Object.keys(condition).length > 0),
          windowStart: {
            gte: windowStart,
          },
        },
        orderBy: {
          windowStart: 'desc',
        },
      });

      if (existingEntry) {
        if (existingEntry.count >= this.config.maxRequests) {
          return {
            success: false,
            limit: this.config.maxRequests,
            remaining: 0,
            resetTime: existingEntry.expiresAt,
            error: 'Rate limit exceeded',
          };
        }

        // Update existing entry
        const updated = await prisma.rateLimitEntry.update({
          where: { id: existingEntry.id },
          data: { count: existingEntry.count + 1 },
        });

        return {
          success: true,
          limit: this.config.maxRequests,
          remaining: this.config.maxRequests - updated.count,
          resetTime: updated.expiresAt,
        };
      }

      // Create new entry
      const newEntry = await prisma.rateLimitEntry.create({
        data: {
          userId,
          phone,
          ipAddress,
          action: this.action,
          count: 1,
          windowStart: now,
          expiresAt: new Date(now.getTime() + this.config.windowMs),
        },
      });

      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        resetTime: newEntry.expiresAt,
      };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return {
        success: false,
        limit: this.config.maxRequests,
        remaining: 0,
        resetTime: new Date(now.getTime() + this.config.windowMs),
        error: 'Rate limit check failed',
      };
    }
  }

  private async cleanupExpiredEntries(): Promise<void> {
    const now = new Date();
    await prisma.rateLimitEntry.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });
  }
}

// Predefined rate limiters
export const reviewSubmissionLimiter = new RateLimiter('review_submission', {
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  maxRequests: 5, // 5 reviews per day
});

export const phoneVerificationLimiter = new RateLimiter('phone_verification', {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 verification attempts per hour
});

export const phoneVerificationCodeLimiter = new RateLimiter('phone_verification_code', {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 code requests per 15 minutes
});

// Enhanced rate limiting for suspicious activity
export const suspiciousActivityLimiter = new RateLimiter('suspicious_activity', {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 1, // 1 attempt per hour for flagged users
});