'use client';

import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';

/**
 * Test page for ImageUpload component
 * This page allows manual testing of the ImageUpload component
 */
export default function TestImageUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    console.log('Image selected:', {
      name: file.name,
      size: file.size,
      type: file.type,
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          ทดสอบ ImageUpload Component
        </h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">จงวางของเซ่นไหว้ลงตรงนี้</h2>
          <ImageUpload onImageSelect={handleImageSelect} />
        </div>

        {selectedFile && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">ข้อมูลไฟล์ที่เลือก</h2>
            <div className="space-y-2 text-gray-300">
              <p><strong>ชื่อไฟล์:</strong> {selectedFile.name}</p>
              <p><strong>ขนาด:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <p><strong>ประเภท:</strong> {selectedFile.type}</p>
            </div>
          </div>
        )}

        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">การทดสอบ</h2>
          <ul className="space-y-2 text-gray-300 list-disc list-inside">
            <li>ทดสอบอัพโหลดไฟล์ JPEG, PNG, WebP (ควรสำเร็จ)</li>
            <li>ทดสอบอัพโหลดไฟล์ประเภทอื่น เช่น PDF, TXT (ควรแสดงข้อผิดพลาด)</li>
            <li>ทดสอบอัพโหลดไฟล์ขนาดใหญ่กว่า 10MB (ควรแสดงข้อผิดพลาด)</li>
            <li>ทดสอบดูตัวอย่างรูปภาพ (ควรแสดงรูปภาพ)</li>
            <li>ทดสอบลบรูปภาพ (ควรลบได้)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
