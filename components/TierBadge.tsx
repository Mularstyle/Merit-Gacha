'use client';

import { GachaTier } from '@/lib/types';

/**
 * TierBadge component
 * Displays gacha tier with tier-specific styling and radiance effects
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

interface TierBadgeProps {
  /** The gacha tier to display */
  tier: GachaTier;
  /** Size variant of the badge */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Tier-specific styling configuration
 * Each tier has unique gradient and shadow effects for visual distinction
 */
const tierStyles: Record<GachaTier, string> = {
  // SSR: Gold radiance - Most sacred tier
  SSR: 'bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/50 text-yellow-900',
  
  // SR: Silver radiance - Sacred tier
  SR: 'bg-gradient-to-r from-gray-300 to-gray-500 shadow-lg shadow-gray-400/50 text-gray-900',
  
  // R: Copper radiance - Regular tier
  R: 'bg-gradient-to-r from-orange-400 to-orange-600 shadow-lg shadow-orange-500/50 text-orange-900',
  
  // เกลือ: Dark radiance - Worthless tier
  เกลือ: 'bg-gradient-to-r from-gray-700 to-gray-900 shadow-lg shadow-gray-800/50 text-gray-300',
};

/**
 * Size variant styling configuration
 */
const sizeStyles = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-lg',
};

export default function TierBadge({ tier, size = 'md' }: TierBadgeProps) {
  const tierStyle = tierStyles[tier];
  const sizeStyle = sizeStyles[size];

  return (
    <div
      className={`
        inline-flex items-center justify-center
        font-bold rounded-lg
        transition-all duration-300
        ${tierStyle}
        ${sizeStyle}
      `.trim()}
    >
      {tier}
    </div>
  );
}
