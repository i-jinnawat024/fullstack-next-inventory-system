'use client';

import { useState } from 'react';
import { THAI_LABELS } from '@/lib/constants/thai-labels';
import { ImportData, ImportResult } from '@/lib/types';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ImportData[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = async (file: File) => {
    setLoading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('ไฟล์ต้องมีอย่างน้อย 2 บรรทัด (หัวตารางและข้อมูล)');
        setFile(null);
        setLoading(false);
        return;
      }

      // Parse CSV (simple implementation)
      const headers = lines[0].split(',').map(h => h.trim());
      const data: ImportData[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        if (values.length >= 7) {
          data.push({
            code: values[0] || '',
            name: values[1] || '',
            description: values[2] || '',
            category: values[3] || '',
            unit: values[4] || '',
            currentStock: parseInt(values[5]) || 0,
            minimumStock: parseInt(values[6]) || 0,
          });
        }
      }

      setPreviewData(data);
      setStep('preview');
    } catch (error) {
      console.error('Parse error:', error);
      alert('เกิดข้อผิดพลาดในการอ่านไฟล์');
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: previewData }),
      });

      const result = await response.json();
      
      if (result.success) {
        setImportResult(result.data);
        setStep('result');
      } else {
        alert(result.error?.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewData([]);
    setImportResult(null);
    setStep('upload');
  };

  const downloadTemplate = () => {
    const template = 'code,name,description,category,unit,currentStock,minimumStock\n' +
      'SAMPLE-001,สินค้าตัวอย่าง,รายละเอียดสินค้า,หมวดหมู่,ชิ้น,100,10\n';
    
    const blob = new Blob(['\ufeff' + template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'import-template.csv';
    link.click();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {THAI_LABELS.import}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          นำเข้าข้อมูลสินค้าจากไฟล์ CSV
        </p>
      </div>

      {/* Upload Step */}
      {step === 'upload' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              อัปโหลดไฟล์
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              รองรับไฟล์ CSV ที่มีคอลัมน์: code, name, description, category, unit, currentStock, minimumStock
            </p>
            
            <button
              onClick={downloadTemplate}
              className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              ดาวน์โหลดไฟล์ตัวอย่าง
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex flex-col items-center"
            >
              <svg
                className="w-12 h-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                คลิกเพื่อเลือกไฟล์
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                รองรับไฟล์ CSV เท่านั้น
              </span>
            </label>
          </div>

          {loading && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">กำลังอ่านไฟล์...</p>
            </div>
          )}
        </div>
      )}

      {/* Preview Step */}
      {step === 'preview' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              ตรวจสอบข้อมูล
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              พบข้อมูล {previewData.length} รายการ
            </p>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    รหัสสินค้า
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    ชื่อสินค้า
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    หมวดหมู่
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    หน่วย
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    สต็อก
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    สต็อกขั้นต่ำ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {previewData.slice(0, 10).map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {item.code}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {item.category}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {item.unit}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {item.currentStock}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {item.minimumStock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 10 && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                แสดง 10 รายการแรก จากทั้งหมด {previewData.length} รายการ
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleImport}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? THAI_LABELS.loading : 'นำเข้าข้อมูล'}
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
            >
              {THAI_LABELS.cancel}
            </button>
          </div>
        </div>
      )}

      {/* Result Step */}
      {step === 'result' && importResult && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              ผลการนำเข้า
            </h2>
          </div>

          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-300 mb-1">
                  นำเข้าสำเร็จ
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {importResult.imported}
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-300 mb-1">
                  ข้อผิดพลาด
                </p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {importResult.errors.length}
                </p>
              </div>
            </div>
          </div>

          {importResult.errors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                รายการข้อผิดพลาด
              </h3>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                {importResult.errors.map((error, index) => (
                  <div key={index} className="mb-2 last:mb-0">
                    <span className="text-sm text-red-800 dark:text-red-300">
                      แถว {error.row}: {error.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleReset}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            นำเข้าไฟล์ใหม่
          </button>
        </div>
      )}
    </div>
  );
}
