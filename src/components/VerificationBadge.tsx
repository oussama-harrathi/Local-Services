'use client';

import React from 'react';

interface VerificationBadgeProps {
  verificationStatus: string;
  verificationLevel?: string | null;
  verificationBadgeType?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function VerificationBadge({
  verificationStatus,
  verificationLevel,
  verificationBadgeType,
  size = 'md',
  showText = true
}: VerificationBadgeProps) {
  // Don't show badge if not verified
  if (verificationStatus !== 'verified') {
    return null;
  }

  const getBadgeConfig = () => {
    const level = verificationLevel || 'basic';
    const badgeType = verificationBadgeType || 'identity';

    const configs = {
      basic: {
        identity: {
          icon: '✓',
          color: 'bg-blue-500',
          text: 'Verified',
          description: 'Identity Verified'
        },
        business: {
          icon: '🏢',
          color: 'bg-green-500',
          text: 'Business',
          description: 'Business Verified'
        },
        quality: {
          icon: '⭐',
          color: 'bg-yellow-500',
          text: 'Quality',
          description: 'Quality Assured'
        }
      },
      premium: {
        identity: {
          icon: '✓✓',
          color: 'bg-purple-500',
          text: 'Premium',
          description: 'Premium Verified'
        },
        business: {
          icon: '🏆',
          color: 'bg-indigo-500',
          text: 'Premium Business',
          description: 'Premium Business'
        },
        quality: {
          icon: '⭐⭐',
          color: 'bg-orange-500',
          text: 'Premium Quality',
          description: 'Premium Quality'
        }
      },
      elite: {
        identity: {
          icon: '👑',
          color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
          text: 'Elite',
          description: 'Elite Verified'
        },
        business: {
          icon: '💎',
          color: 'bg-gradient-to-r from-blue-500 to-purple-600',
          text: 'Elite Business',
          description: 'Elite Business'
        },
        quality: {
          icon: '🌟',
          color: 'bg-gradient-to-r from-pink-500 to-red-500',
          text: 'Elite Quality',
          description: 'Elite Quality'
        }
      }
    };

    return configs[level as keyof typeof configs]?.[badgeType as keyof typeof configs.basic] || configs.basic.identity;
  };

  const config = getBadgeConfig();

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div
      className={`
        inline-flex items-center gap-1 rounded-full text-white font-medium
        ${config.color} ${sizeClasses[size]}
        shadow-sm border border-white/20
      `}
      title={config.description}
    >
      <span className={iconSizes[size]}>{config.icon}</span>
      {showText && (
        <span className="whitespace-nowrap">{config.text}</span>
      )}
    </div>
  );
}