'use client';

import { useState, useRef, ChangeEvent } from 'react';

/**
 * ImageUpload component
 * Handles image file selection with validation and preview
 * Requirements: 2.3, 3.1, 3.2, 13.5
 */

interface ImageUploadProps {
  /** Callback when a valid image is selected */
  onImageSelect: (file: File) => void;
  /** Maximum file size in megabytes */
  maxSizeMB?: number;
  /** Accepted image formats */
  acceptedFormats?: string[];
}

/**
 * Default configuration values
 */
const DEFAULT_MAX_SIZE_MB = 10;
const DEFAULT_ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Thai error messages for validation failures
 */
const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'ไฟล์ใหญ่เกินไป (สูงสุด 10MB)',
  INVALID_FORMAT: 'รองรับเฉพาะไฟล์ JPEG, PNG, WebP',
};

export default function ImageUpload({
  onImageSelect,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  acceptedFormats = DEFAULT_ACCEPTED_FORMATS,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validates file size
   * @param file - File to validate
   * @returns true if file size is within limit
   */
  const validateFileSize = (file: File): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  };

  /**
   * Validates file format
   * @param file - File to validate
   * @returns true if file format is accepted
   */
  const validateFileFormat = (file: File): boolean => {
    return acceptedFormats.includes(file.type);
  };

  /**
   * Handles file selection and validation
   */
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    // Reset state
    setError(null);
    setPreview(null);

    if (!file) {
      return;
    }

    // Validate file format
    if (!validateFileFormat(file)) {
      setError(ERROR_MESSAGES.INVALID_FORMAT);
      return;
    }

    // Validate file size
    if (!validateFileSize(file)) {
      setError(ERROR_MESSAGES.FILE_TOO_LARGE);
      return;
    }

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Notify parent component
    onImageSelect(file);
  };

  /**
   * Handles click on upload area
   */
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handles clearing the selected image
   */
  const handleClear = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileChange}
        className="hidden"
        aria-label="เลือกรูปภาพของเซ่นไหว้"
      />

      {/* Upload area - Glowing Energetic Boundary */}
      <div
        onClick={handleClick}
        className={`
          relative flex flex-col items-center justify-center p-8 
          border border-dashed rounded-none
          cursor-pointer group transition-all duration-500
          ${error 
            ? 'border-red-500 bg-red-900/30 shadow-[0_0_25px_rgba(239,68,68,0.3)]' 
            : preview 
            ? 'border-yellow-500/50 bg-gradient-to-b from-transparent to-yellow-900/20' 
            : 'border-yellow-500/50 bg-gradient-to-b from-transparent to-yellow-900/20 hover:bg-yellow-900/40 hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(234,179,8,0.2)]'
          }
        `.trim()}
      >
        {preview ? (
          // Image preview
          <div className="relative w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="ตัวอย่างรูปภาพของเซ่นไหว้"
              className="max-w-full max-h-[300px] mx-auto object-contain"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="absolute top-2 right-2 bg-red-700/90 hover:bg-red-600 backdrop-blur-sm text-white rounded-none p-2 transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] border border-red-500"
              aria-label="ลบรูปภาพ"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ) : (
          // Upload prompt - Mystical Style
          <div className="text-center">
            {/* Mystical Symbol */}
            <div className="text-6xl mb-4 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)] group-hover:drop-shadow-[0_0_20px_rgba(234,179,8,0.7)] transition-all">
              🕯️
            </div>
            <p className="text-yellow-400 group-hover:text-yellow-300 mb-2 transition-colors font-['Charm'] text-xl drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]">
              คลิกเพื่อเลือกรูปภาพ
            </p>
            <p className="text-sm text-yellow-700/70 group-hover:text-yellow-600/80 transition-colors">
              JPEG, PNG, WebP (สูงสุด {maxSizeMB}MB)
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 p-3 bg-red-900/40 backdrop-blur-sm border-2 border-red-500/60 rounded-none shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <p className="text-red-200 text-sm font-['Charm']">{error}</p>
        </div>
      )}
    </div>
  );
}
