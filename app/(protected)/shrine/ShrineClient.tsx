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
                    <img 
                      src="/logo.svg" 
                      alt="Logo" 
                      className="w-20 h-20 mx-auto mb-4"
                    />
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
            // NORMAL MODE - Cyber-Mutelu (Cyber-Mystical Thai Shrine)
            <div className="max-w-2xl mx-auto">
              {/* Header */}
              <div className="text-center mb-12">
                <img 
                  src="/logo.svg" 
                  alt="Logo" 
                  className="w-24 h-24 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(234,179,8,0.6)] animate-pulse"
                />
                <h2 className="font-['Charm'] text-5xl font-bold bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-700 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] pr-4 pb-2 pt-4 leading-relaxed mb-4">
                  จงขอพรจากเจ้าที่
                </h2>
                <p className="text-yellow-100/80 text-lg font-light tracking-wide">
                  กรอกคำขอพรและวางของเซ่นไหว้เพื่อรับการประเมินจากเจ้าที่ผู้ทรงอารมณ์ขัน
                </p>
              </div>

              {/* Prayer Form - The Altar Base */}
              <div className="bg-black/60 backdrop-blur-lg border-x-4 border-y-2 border-double border-yellow-600/80 rounded-none shadow-[inset_0_0_50px_rgba(161,98,7,0.3)] p-8 relative">
                {/* Corner Ornaments */}
                <div className="w-3 h-3 bg-gradient-to-br from-yellow-400 to-yellow-700 absolute -top-1 -left-1"></div>
                <div className="w-3 h-3 bg-gradient-to-bl from-yellow-400 to-yellow-700 absolute -top-1 -right-1"></div>
                <div className="w-3 h-3 bg-gradient-to-tr from-yellow-400 to-yellow-700 absolute -bottom-1 -left-1"></div>
                <div className="w-3 h-3 bg-gradient-to-tl from-yellow-400 to-yellow-700 absolute -bottom-1 -right-1"></div>
                
                <PrayerForm
                  onSubmitSuccess={handleSubmitSuccess}
                  onSubmitError={handleSubmitError}
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-6 bg-red-900/40 backdrop-blur-sm border-2 border-red-500/60 rounded-none p-4 shadow-[0_0_25px_rgba(239,68,68,0.2)]">
                  <p className="text-red-200 text-center font-['Charm'] text-lg">{error}</p>
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
