'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Prayer } from '@/lib/types';
import TierBadge from './TierBadge';
import Image from 'next/image';

/**
 * PrayerHistoryList component
 * Displays user's prayer history in reverse chronological order
 * Requirements: 8.2, 8.3, 8.4, 8.5, 8.6, 8.7
 */

interface PrayerHistoryListProps {
  /** User ID to fetch prayers for */
  userId: string;
}

export default function PrayerHistoryList({ userId }: PrayerHistoryListProps) {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrayers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      // Fetch prayers for the user, ordered by created_at DESC
      const { data, error: fetchError } = await supabase
        .from('prayers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error('ไม่สามารถโหลดประวัติได้ กรุณาลองใหม่อีกครั้ง');
      }

      setPrayers(data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'เกิดข้อผิดพลาดในการโหลดประวัติ';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  /**
   * Handle retry after error
   */
  const handleRetry = () => {
    fetchPrayers();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="text-yellow-400/70 font-['Charm'] text-lg">กำลังโหลดประวัติ...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-900/40 backdrop-blur-sm border-2 border-red-500/60 rounded-none p-6 text-center shadow-[0_0_25px_rgba(239,68,68,0.2)]">
        <p className="text-red-200 mb-4 font-['Charm'] text-lg">{error}</p>
        <button
          onClick={handleRetry}
          className="px-6 py-2 bg-red-700/80 hover:bg-red-600 text-white rounded-none transition-all border border-red-500"
        >
          ลองอีกครั้ง
        </button>
      </div>
    );
  }

  // Empty state
  if (prayers.length === 0) {
    return (
      <div className="bg-black/60 backdrop-blur-lg border-x-4 border-y-2 border-double border-yellow-600/50 rounded-none p-12 text-center shadow-[inset_0_0_50px_rgba(161,98,7,0.2)]">
        <p className="text-yellow-400 text-xl font-['Charm'] mb-2">
          ยังไม่มีประวัติคำขอพร
        </p>
        <p className="text-yellow-700/70 mt-2">
          ไปที่ศาลพระภูมิเพื่อส่งคำขอพรครั้งแรกของคุณ
        </p>
      </div>
    );
  }

  // Format timestamp to Thai locale
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {prayers.map((prayer) => (
        <div
          key={prayer.id}
          className="bg-black/60 backdrop-blur-lg border-x-4 border-y-2 border-double border-yellow-600/50 rounded-none shadow-[inset_0_0_50px_rgba(161,98,7,0.2)] p-6 hover:border-yellow-500/70 transition-all duration-300 relative"
        >
          {/* Corner Ornaments */}
          <div className="w-2 h-2 bg-gradient-to-br from-yellow-400 to-yellow-700 absolute -top-0.5 -left-0.5"></div>
          <div className="w-2 h-2 bg-gradient-to-bl from-yellow-400 to-yellow-700 absolute -top-0.5 -right-0.5"></div>
          <div className="w-2 h-2 bg-gradient-to-tr from-yellow-400 to-yellow-700 absolute -bottom-0.5 -left-0.5"></div>
          <div className="w-2 h-2 bg-gradient-to-tl from-yellow-400 to-yellow-700 absolute -bottom-0.5 -right-0.5"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column: Offering image */}
            <div className="md:col-span-1">
              <div className="relative w-full aspect-square rounded-none overflow-hidden bg-black border border-yellow-700/40">
                <Image
                  src={prayer.offering_image_url}
                  alt="ของเซ่นไหว้"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </div>

            {/* Right column: Prayer details */}
            <div className="md:col-span-2 space-y-4">
              {/* Tier badge and timestamp */}
              <div className="flex items-center justify-between">
                <TierBadge tier={prayer.tier} size="sm" />
                <p className="text-sm text-yellow-700/70">
                  {formatTimestamp(prayer.created_at)}
                </p>
              </div>

              {/* Wish text */}
              <div>
                <h3 className="text-sm font-semibold text-yellow-500 mb-1 font-['Charm']">
                  คำขอพร
                </h3>
                <p className="text-yellow-100/90">{prayer.wish_text}</p>
              </div>

              {/* Verdict */}
              <div>
                <h3 className="text-sm font-semibold text-yellow-500 mb-1 font-['Charm']">
                  คำตัดสิน
                </h3>
                <p className="text-yellow-300 font-medium">{prayer.verdict}</p>
              </div>

              {/* Comment */}
              <div>
                <h3 className="text-sm font-semibold text-yellow-500 mb-1 font-['Charm']">
                  ความเห็นจากเจ้าที่
                </h3>
                <p className="text-yellow-100/80 leading-relaxed">{prayer.comment}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
