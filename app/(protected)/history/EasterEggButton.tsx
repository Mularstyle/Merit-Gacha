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
      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
      title={shrineMode ? 'ปิดโหมดศาลพระภูมิ' : 'เปิดโหมดศาลพระภูมิ'}
    >
      {shrineMode ? '🏛️ ปิดศาล' : '🏛️ เปิดศาล'}
    </button>
  );
}
