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

      {/* Upload area */}
      <div
        onClick={handleClick}
        className={`
          relative w-full min-h-[200px] 
          border-2 border-dashed rounded-lg
          cursor-pointer transition-all duration-200
          flex items-center justify-center
          ${error 
            ? 'border-red-500 bg-red-500/10' 
            : preview 
            ? 'border-gray-600 bg-gray-800/50' 
            : 'border-gray-600 bg-gray-800/30 hover:border-gray-500 hover:bg-gray-800/50'
          }
        `.trim()}
      >
        {preview ? (
          // Image preview
          <div className="relative w-full h-full p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="ตัวอย่างรูปภาพของเซ่นไหว้"
              className="max-w-full max-h-[300px] mx-auto rounded-lg object-contain"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="absolute top-6 right-6 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-colors"
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
          // Upload prompt
          <div className="text-center p-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto mb-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-400 mb-2">คลิกเพื่อเลือกรูปภาพ</p>
            <p className="text-sm text-gray-500">
              JPEG, PNG, WebP (สูงสุด {maxSizeMB}MB)
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 p-3 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
