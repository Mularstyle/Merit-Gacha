'use client';

import { EvaluationResult } from '@/lib/types';
import TierBadge from './TierBadge';
import { useEffect, useState } from 'react';

/**
 * ResultDisplay component
 * Displays AI evaluation results with tier-based styling and animations
 * Requirements: 6.1, 6.6, 6.7
 */

interface ResultDisplayProps {
  /** The evaluation result from the AI deity */
  result: EvaluationResult;
}

export default function ResultDisplay({ result }: ResultDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Trigger animations on mount
  useEffect(() => {
    // First show the tier badge with animation
    const timer1 = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Then show the verdict and comment
    const timer2 = setTimeout(() => {
      setShowContent(true);
    }, 800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Tier-specific visual effects (radiance/glow)
  const tierEffects = {
    SSR: 'shadow-2xl shadow-yellow-500/50 animate-pulse',
    SR: 'shadow-2xl shadow-gray-400/50 animate-pulse',
    R: 'shadow-2xl shadow-orange-500/50 animate-pulse',
    เกลือ: 'shadow-2xl shadow-gray-800/50',
  };

  const tierEffect = tierEffects[result.tier];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Tier Badge with Animation */}
      <div
        className={`
          flex justify-center
          transition-all duration-700 ease-out
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
        `}
      >
        <div className={tierEffect}>
          <TierBadge tier={result.tier} size="lg" />
        </div>
      </div>

      {/* Verdict and Comment */}
      <div
        className={`
          space-y-4
          transition-all duration-700 ease-out
          ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        {/* Verdict */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">
            คำตัดสิน
          </h3>
          <p className="text-xl font-bold text-white">
            {result.verdict}
          </p>
        </div>

        {/* Comment */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">
            ความเห็นจากเทพเจ้า
          </h3>
          <p className="text-lg text-gray-200 leading-relaxed">
            {result.comment}
          </p>
        </div>
      </div>
    </div>
  );
}
