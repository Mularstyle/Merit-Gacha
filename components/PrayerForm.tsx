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
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <p className="text-red-400 mb-3">{networkError}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            ลองอีกครั้ง
          </button>
        </div>
      )}

      {/* Wish text input */}
      <div>
        <label
          htmlFor="wish"
          className="block text-lg font-medium text-yellow-400 mb-2"
        >
          ท่านต้องการสิ่งใด?
        </label>
        <textarea
          id="wish"
          value={wish}
          onChange={(e) => setWish(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          placeholder="กรุณาระบุคำขอพรของท่าน..."
          rows={4}
          aria-label="คำขอพร"
        />
      </div>

      {/* Offering image upload */}
      <div>
        <label className="block text-lg font-medium text-yellow-400 mb-2">
          จงวางของเซ่นไหว้ลงตรงนี้
        </label>
        <ImageUpload
          onImageSelect={handleImageSelect}
          maxSizeMB={10}
          acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
        />
      </div>

      {/* Submit button */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`
            px-8 py-3 rounded-lg font-bold text-lg transition-all duration-200
            ${
              isFormValid && !isSubmitting
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 shadow-lg shadow-yellow-500/50 hover:shadow-yellow-500/70 transform hover:scale-105'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
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
