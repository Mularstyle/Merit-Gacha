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
 * Tier-specific styling configuration - Cyber-Mutelu Theme
 * Each tier has unique mystical styling with glowing effects
 */
const tierStyles: Record<GachaTier, string> = {
  // SSR: Gold/Divine - Most sacred tier with pulsing glow
  SSR: 'bg-yellow-900/80 border-yellow-400 text-yellow-300 shadow-[0_0_25px_rgba(250,204,21,0.8)] animate-pulse',
  
  // SR: Silver/Holy - Sacred tier with bright glow
  SR: 'bg-slate-800/80 border-slate-300 text-slate-100 shadow-[0_0_20px_rgba(203,213,225,0.6)]',
  
  // R: Bronze/Copper - Regular tier with warm glow
  R: 'bg-orange-950/80 border-orange-700 text-orange-300 shadow-[0_0_15px_rgba(194,65,12,0.4)]',
  
  // เกลือ: Salt/Cursed - Worthless tier with dark aura
  เกลือ: 'bg-black/80 border-gray-700 text-gray-500 shadow-[0_0_10px_rgba(75,85,99,0.2)]',
};

/**
 * Base badge styling - Cyber-Mutelu angular style
 */
const baseStyle = 'px-3 py-1 font-bold text-sm tracking-widest uppercase border-2 rounded-none backdrop-blur-sm';

/**
 * Size variant styling configuration (removed from base, kept for backward compatibility)
 */
const sizeStyles = {
  sm: '',
  md: '',
  lg: 'px-4 py-2 text-base',
};

export default function TierBadge({ tier, size = 'md' }: TierBadgeProps) {
  const tierStyle = tierStyles[tier];
  const sizeStyle = sizeStyles[size];

  return (
    <div
      className={`
        inline-flex items-center justify-center
        transition-all duration-300
        ${baseStyle}
        ${tierStyle}
        ${sizeStyle}
      `.trim()}
    >
      {tier}
    </div>
  );
}
