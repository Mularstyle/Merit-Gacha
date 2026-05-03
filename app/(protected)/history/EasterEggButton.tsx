'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

/**
 * Easter Egg Button - Toggles shrine mode
 * Hidden feature that enables the 3-piece shrine frame UI
 */
export default function EasterEggButton() {
  const router = useRouter();
  const [shrineMode, setShrineMode] = useState(false);

  // Check localStorage for shrine mode on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('shrineMode');
    if (savedMode === 'true') {
      setShrineMode(true);
    }
  }, []);

  const toggleShrineMode = () => {
    const newMode = !shrineMode;
    setShrineMode(newMode);
    localStorage.setItem('shrineMode', newMode.toString());
    
    // Navigate to shrine page to see the effect
    router.push('/shrine');
  };

  return (
    <button
      onClick={toggleShrineMode}
      className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-yellow-900 via-yellow-700 to-yellow-900 border border-yellow-500 text-yellow-50 hover:from-yellow-700 hover:via-yellow-500 hover:to-yellow-700 hover:shadow-[0_0_15px_rgba(234,179,8,0.5)] transition-all duration-300 rounded-none font-serif tracking-wider"
      title={shrineMode ? 'ปิดโหมดศาลพระภูมิ' : 'เปิดโหมดศาลพระภูมิ'}
    >
      {shrineMode ? '🏛️ ปิดศาล' : '🏛️ เปิดศาล'}
    </button>
  );
}
