'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Check if user is already authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/shrine');
      }
    };
    checkUser();
  }, [router, supabase.auth]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('[Login Error]', error);
        setError('ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('[Login Error]', err);
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-950/40 via-black to-black text-yellow-50">
      <div className="max-w-md w-full mx-4">
        {/* Shrine Header */}
        <div className="text-center mb-12">
          <h1 className="font-['Charm'] text-5xl font-bold bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-700 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] pr-4 pb-2 pt-4 leading-relaxed mb-3">
            ศาลพระภูมิศักดิ์สิทธิ์
          </h1>
          <p className="text-yellow-400 text-xl font-['Charm'] mb-2">
            Merit Gacha
          </p>
          <p className="text-yellow-100/70 text-base">
            จงเข้ามาขอพรจากเจ้าที่ผู้ทรงอารมณ์ขัน
          </p>
        </div>

        {/* Login Card - Altar Base Style */}
        <div className="bg-black/60 backdrop-blur-lg border-x-4 border-y-2 border-double border-yellow-600/80 rounded-none shadow-[inset_0_0_50px_rgba(161,98,7,0.3)] p-8 relative">
          {/* Corner Ornaments */}
          <div className="w-3 h-3 bg-gradient-to-br from-yellow-400 to-yellow-700 absolute -top-1 -left-1"></div>
          <div className="w-3 h-3 bg-gradient-to-bl from-yellow-400 to-yellow-700 absolute -top-1 -right-1"></div>
          <div className="w-3 h-3 bg-gradient-to-tr from-yellow-400 to-yellow-700 absolute -bottom-1 -left-1"></div>
          <div className="w-3 h-3 bg-gradient-to-tl from-yellow-400 to-yellow-700 absolute -bottom-1 -right-1"></div>
          
          <div className="text-center mb-6">
            <img 
              src="/logo.svg" 
              alt="Logo" 
              className="w-20 h-20 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] animate-pulse"
            />
            <h2 className="text-2xl font-semibold text-yellow-400 mb-2 font-['Charm']">
              เข้าสู่ระบบ
            </h2>
            <p className="text-yellow-100/70 text-sm">
              เข้าสู่ระบบเพื่อเริ่มขอพรและดูประวัติคำขอของคุณ
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/40 backdrop-blur-sm border-2 border-red-500/60 rounded-none shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <p className="text-red-200 text-sm font-['Charm']">{error}</p>
            </div>
          )}

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-900 via-yellow-700 to-yellow-900 border-2 border-yellow-500 text-yellow-50 hover:from-yellow-700 hover:via-yellow-500 hover:to-yellow-700 hover:shadow-[0_0_20px_rgba(234,179,8,0.6)] font-semibold py-3 px-4 rounded-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-yellow-200 border-t-transparent rounded-full animate-spin" />
                <span>กำลังเข้าสู่ระบบ...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>เข้าสู่ระบบด้วย Google</span>
              </>
            )}
          </button>

          <p className="text-yellow-700/70 text-xs text-center mt-4">
            การเข้าสู่ระบบหมายความว่าคุณยอมรับเงื่อนไขการใช้งาน
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-yellow-700/70 text-sm">
          <p>สร้างด้วยความเคารพต่อวัฒนธรรมไทย 🇹🇭</p>
        </div>
      </div>
    </div>
  );
}
