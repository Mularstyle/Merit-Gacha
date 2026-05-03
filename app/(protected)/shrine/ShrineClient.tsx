'use client';

import { useState, useEffect } from 'react';
import PrayerForm from '@/components/PrayerForm';
import ResultDisplay from '@/components/ResultDisplay';
import { EvaluationResult } from '@/lib/types';

/**
 * Shrine page client component
 * Handles prayer submission and result display
 * Supports both normal mode and shrine frame mode (Easter egg)
 */
export default function ShrineClient() {
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shrineMode, setShrineMode] = useState(false);

  // Check localStorage for shrine mode on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('shrineMode');
    if (savedMode === 'true') {
      setShrineMode(true);
    }
  }, []);

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
      {/* Prayer Form - Normal or Shrine Mode */}
      {!result && (
        <>
          {shrineMode ? (
            // SHRINE MODE - 3-Piece Shrine Frame
            <div 
              className="flex flex-col items-center w-full max-w-2xl mx-auto"
              style={{
                // 🎯 TUNE THESE VALUES:
                '--shrine-top-width': '91.9%',
                '--shrine-mid-width': '79.5%',
                '--shrine-base-width': '100%',
                '--shrine-top-margin': '0.15%',
                '--shrine-mid-margin': '-0.11%',
                '--shrine-base-margin': '-0.5%',
                '--shrine-mid-bg-position': '0%',
                '--form-max-width-mobile': '180px',
                '--form-max-width-desktop': '270px',
                '--form-padding-mobile': '1rem',
                '--form-padding-desktop': '2rem',
              } as React.CSSProperties}
            >
              {/* 1. TOP SECTION (ROOF) */}
              <img 
                src="/shrine-top.png" 
                alt="Shrine Roof" 
                className="h-auto block"
                style={{ 
                  width: 'var(--shrine-top-width)',
                  marginLeft: 'var(--shrine-top-margin)'
                }}
              />

              {/* 2. MIDDLE SECTION (PILLARS) - THE FORM LIVES INSIDE HERE */}
              <div 
                className="bg-[url('/shrine-mid.png')] bg-[length:100%_auto] bg-repeat-y flex flex-col items-center"
                style={{ 
                  width: 'var(--shrine-mid-width)',
                  backgroundPosition: 'var(--shrine-mid-bg-position) top',
                  marginLeft: 'var(--shrine-mid-margin)',
                  paddingLeft: 'var(--form-padding-mobile)',
                  paddingRight: 'var(--form-padding-mobile)',
                  paddingTop: '1rem',
                  paddingBottom: '1rem',
                }}
              >
                {/* --- FORM UI INSIDE MIDDLE SECTION --- */}
                <div className="w-full max-w-[var(--form-max-width-mobile)] sm:max-w-[var(--form-max-width-desktop)]">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🙏</div>
                    <h2 className="text-2xl font-semibold text-yellow-400 mb-2">
                      จงขอพรจากเจ้าที่
                    </h2>
                    <p className="text-gray-300">
                      กรอกคำขอพรและวางของเซ่นไหว้เพื่อรับการประเมินจากเจ้าที่ผู้ทรงอารมณ์ขัน
                    </p>
                  </div>

                  {/* Prayer Form */}
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
                {/* --- END OF FORM UI --- */}
              </div>

              {/* 3. BOTTOM SECTION (BASE) */}
              <img 
                src="/shrine-base.png" 
                alt="Shrine Base" 
                className="h-auto block"
                style={{ 
                  width: 'var(--shrine-base-width)',
                  marginLeft: 'var(--shrine-base-margin)'
                }}
              />
            </div>
          ) : (
            // NORMAL MODE - Simple Layout with Frame
            <div className="max-w-2xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🙏</div>
                <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                  จงขอพรจากเจ้าที่
                </h2>
                <p className="text-gray-300 text-lg">
                  กรอกคำขอพรและวางของเซ่นไหว้เพื่อรับการประเมินจากเจ้าที่ผู้ทรงอารมณ์ขัน
                </p>
              </div>

              {/* Prayer Form with Frame */}
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-8 border border-yellow-600/30 shadow-2xl shadow-yellow-500/10">
                <PrayerForm
                  onSubmitSuccess={handleSubmitSuccess}
                  onSubmitError={handleSubmitError}
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-6 bg-red-900/20 border border-red-700 rounded-lg p-4">
                  <p className="text-red-400 text-center">{error}</p>
                </div>
              )}
            </div>
          )}
        </>
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
