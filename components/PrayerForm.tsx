'use client';

import { useState, FormEvent } from 'react';
import ImageUpload from './ImageUpload';
import { EvaluationResult } from '@/lib/types';

/**
 * PrayerForm component
 * Main interface for submitting prayers with wish text and offering images
 * Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 9.4
 */

interface PrayerFormProps {
  /** Callback when prayer submission succeeds */
  onSubmitSuccess: (result: EvaluationResult) => void;
  /** Callback when prayer submission fails */
  onSubmitError: (error: string) => void;
}

export default function PrayerForm({
  onSubmitSuccess,
  onSubmitError,
}: PrayerFormProps) {
  const [wish, setWish] = useState<string>('');
  const [offeringImage, setOfferingImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  /**
   * Check if form is valid (both fields filled)
   */
  const isFormValid = wish.trim().length > 0 && offeringImage !== null;

  /**
   * Handle image selection from ImageUpload component
   */
  const handleImageSelect = (file: File) => {
    setOfferingImage(file);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form before submission
    if (!isFormValid) {
      return;
    }

    setIsSubmitting(true);
    setNetworkError(null);

    try {
      // Prepare FormData for API call
      const formData = new FormData();
      formData.append('wish', wish);
      formData.append('offering', offeringImage!);

      // Call API route
      const response = await fetch('/api/pray', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'เกิดข้อผิดพลาดในการส่งคำขอพร');
      }

      // Success - notify parent component
      onSubmitSuccess(result.data);

      // Reset form
      setWish('');
      setOfferingImage(null);
    } catch (error) {
      // Check if it's a network error (fetch failed, not HTTP error)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkErrorMsg = 'ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบอินเทอร์เน็ต';
        setNetworkError(networkErrorMsg);
        onSubmitError(networkErrorMsg);
      } else {
        // Other errors (API errors, validation errors, etc.)
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'เกิดข้อผิดพลาดในการส่งคำขอพร';
        setNetworkError(null);
        onSubmitError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle retry after network error
   */
  const handleRetry = () => {
    setNetworkError(null);
    // Trigger form submission again
    const form = document.querySelector('form');
    if (form) {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Network error message with retry button */}
      {networkError && (
        <div className="bg-red-900/40 backdrop-blur-sm border-2 border-red-500/60 rounded-none p-4 shadow-[0_0_25px_rgba(239,68,68,0.2)] mb-6">
          <p className="text-red-200 mb-3 font-['Charm'] text-lg">{networkError}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="px-4 py-2 bg-red-700/80 hover:bg-red-600 backdrop-blur-sm text-white rounded-none transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] border border-red-500"
          >
            ลองอีกครั้ง
          </button>
        </div>
      )}

      {/* Wish text input - Dark Scroll */}
      <div className="mb-8">
        <label
          htmlFor="wish"
          className="block text-lg font-medium text-yellow-400 mb-4 font-['Charm'] text-2xl"
        >
          ท่านต้องการสิ่งใด?
        </label>
        <textarea
          id="wish"
          value={wish}
          onChange={(e) => setWish(e.target.value)}
          disabled={isSubmitting}
          className="w-full bg-black/40 border-b-2 border-t-0 border-x-0 border-yellow-700/50 rounded-none px-4 py-3 focus:outline-none focus:border-yellow-400 focus:shadow-[0_4px_15px_-3px_rgba(234,179,8,0.3)] transition-all text-yellow-100 placeholder-yellow-900/50 font-serif disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          placeholder="กรุณาระบุคำขอพรของท่าน..."
          rows={4}
          aria-label="คำขอพร"
        />
      </div>

      {/* Offering image upload */}
      <div className="mb-8">
        <label className="block text-lg font-medium text-yellow-400 mb-4 font-['Charm'] text-2xl">
          จงวางของเซ่นไหว้ลงตรงนี้
        </label>
        <ImageUpload
          onImageSelect={handleImageSelect}
          maxSizeMB={10}
          acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
        />
      </div>

      {/* Submit button - Golden Plaque */}
      <div>
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`
            w-full px-6 py-3 border-2 font-bold tracking-widest uppercase transition-all duration-300 transform
            ${
              isFormValid && !isSubmitting
                ? 'bg-gradient-to-r from-yellow-800 via-yellow-600 to-yellow-800 border-yellow-500 text-white hover:from-yellow-700 hover:via-yellow-500 hover:to-yellow-700 hover:shadow-[0_0_20px_rgba(234,179,8,0.6)] hover:scale-[1.02]'
                : 'bg-gray-800/50 border-gray-700 text-gray-600 cursor-not-allowed'
            }
          `.trim()}
          aria-label="ส่งคำขอพร"
        >
          {isSubmitting ? 'กำลังส่งกระแสจิต...' : 'ขอพร'}
        </button>
      </div>
    </form>
  );
}
