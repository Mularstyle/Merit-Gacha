'use client';

import { useState } from 'react';
import PrayerForm from '@/components/PrayerForm';
import ResultDisplay from '@/components/ResultDisplay';
import { EvaluationResult } from '@/lib/types';

/**
 * Test page for PrayerForm component
 * Allows visual testing of the prayer submission flow
 */
export default function TestPrayerFormPage() {
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

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-yellow-400 mb-8 text-center">
          PrayerForm Component Test
        </h1>

        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700 mb-8">
          <PrayerForm
            onSubmitSuccess={handleSubmitSuccess}
            onSubmitError={handleSubmitError}
          />
        </div>

        {/* Display result */}
        {result && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-yellow-400">
                ผลการประเมิน
              </h2>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
              >
                ล้างผลลัพธ์
              </button>
            </div>
            <ResultDisplay result={result} />
          </div>
        )}

        {/* Display error */}
        {error && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-red-400">ข้อผิดพลาด</h2>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
              >
                ล้างข้อผิดพลาด
              </button>
            </div>
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-6">
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-800 rounded-lg shadow-2xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">
            Testing Instructions
          </h2>
          <ul className="space-y-2 text-gray-300">
            <li>• Fill in the wish text field</li>
            <li>• Upload an offering image (JPEG, PNG, or WebP, max 10MB)</li>
            <li>• Submit button should be disabled until both fields are filled</li>
            <li>• Click &quot;ขอพร&quot; to submit (will show loading state)</li>
            <li>• Note: API route /api/pray must be implemented for actual submission</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
