'use client';

import { useState } from 'react';
import PrayerForm from '@/components/PrayerForm';
import ResultDisplay from '@/components/ResultDisplay';
import { EvaluationResult } from '@/lib/types';

/**
 * Shrine page client component
 * Handles prayer submission and result display
 */
export default function ShrineClient() {
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitSuccess = (evaluationResult: EvaluationResult) => {
    setResult(evaluationResult);
    setError(null);
  };

  const handleSubmitError = (errorMessage: string) => {
    setError(errorMessage);
    setResult(null);
  };

  const handleNewPrayer = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-8">
      {/* Prayer Form */}
      {!result && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-2xl p-8 border border-gray-700">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🙏</div>
            <h2 className="text-2xl font-semibold text-yellow-400 mb-2">
              จงขอพรจากเทพเจ้า
            </h2>
            <p className="text-gray-400">
              กรอกคำขอพรและวางของเซ่นไหว้เพื่อรับการประเมินจากเทพเจ้าผู้ทรงอารมณ์ขัน
            </p>
          </div>

          <PrayerForm
            onSubmitSuccess={handleSubmitSuccess}
            onSubmitError={handleSubmitError}
          />

          {/* Error Display */}
          {error && (
            <div className="mt-6 bg-red-900/20 border border-red-700 rounded-lg p-4">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="space-y-6">
          <ResultDisplay result={result} />
          
          <div className="text-center">
            <button
              onClick={handleNewPrayer}
              className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 font-bold rounded-lg transition-all duration-200 shadow-lg shadow-yellow-500/50 hover:shadow-yellow-500/70 transform hover:scale-105"
            >
              ขอพรอีกครั้ง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
