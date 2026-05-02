'use client';

import ResultDisplay from '@/components/ResultDisplay';
import { EvaluationResult, GachaTier } from '@/lib/types';
import { useState } from 'react';

/**
 * Test page for ResultDisplay component
 * Allows testing all tier variations and animations
 */

export default function TestResultDisplayPage() {
  const [selectedTier, setSelectedTier] = useState<GachaTier>('SSR');

  // Sample evaluation results for each tier
  const sampleResults: Record<GachaTier, EvaluationResult> = {
    SSR: {
      tier: 'SSR',
      verdict: 'ศักดิ์สิทธิ์สูงสุด! ของเซ่นหรูหรา',
      comment: 'เจ้าถวายหมูกระทะระดับพรีเมียม เทพเจ้าพอใจมาก ขอให้สมหวังทุกประการ!',
    },
    SR: {
      tier: 'SR',
      verdict: 'ศักดิ์สิทธิ์! ของเซ่นดี',
      comment: 'น้ำอัดลมกับขนมปัง พอใช้ได้นะ เทพเจ้าจะช่วยเหลือเจ้าบ้าง',
    },
    R: {
      tier: 'R',
      verdict: 'ธรรมดา ของเซ่นพอใช้',
      comment: 'กล้วยหวีเดียว? เอาเถอะ เทพเจ้าจะพิจารณาดู แต่อย่าหวังมากนัก',
    },
    เกลือ: {
      tier: 'เกลือ',
      verdict: 'ไร้ค่า! ของเซ่นห่วยแตก',
      comment: 'เจ้าถวายแค่เกลือ แล้วขอรถบีเอ็มดับเบิลยู? เทพเจ้าไม่รับนะจ๊ะ ไปทำบุญใหม่มาเถอะ',
    },
  };

  const currentResult = sampleResults[selectedTier];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            ทดสอบ ResultDisplay Component
          </h1>
          <p className="text-gray-300">
            เลือก Tier เพื่อดูการแสดงผลและ Animation
          </p>
        </div>

        {/* Tier Selector */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            เลือก Tier
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['SSR', 'SR', 'R', 'เกลือ'] as GachaTier[]).map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`
                  px-6 py-3 rounded-lg font-bold text-lg
                  transition-all duration-200
                  ${
                    selectedTier === tier
                      ? 'bg-purple-600 text-white scale-105'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }
                `}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* ResultDisplay Component */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            ผลการแสดง
          </h2>
          <ResultDisplay key={selectedTier} result={currentResult} />
        </div>

        {/* Component Info */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            ข้อมูล Component
          </h2>
          <div className="space-y-2 text-gray-300">
            <p>
              <strong className="text-white">Requirements:</strong> 6.1, 6.6, 6.7
            </p>
            <p>
              <strong className="text-white">Features:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>แสดง Tier Badge พร้อม Animation</li>
              <li>แสดงคำตัดสิน (Verdict)</li>
              <li>แสดงความเห็นจากเทพเจ้า (Comment)</li>
              <li>Tier-specific visual effects (radiance/glow)</li>
              <li>Smooth fade-in และ scale animations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
