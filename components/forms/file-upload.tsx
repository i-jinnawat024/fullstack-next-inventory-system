'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { cn } from '@/lib/utils/format';
import { THAI_LABELS } from '@/lib/constants/thai-labels';
import { ProgressBar } from '@/components/ui/progress-bar';

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  error?: string;
  url?: string;
}

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  error?: boolean;
  onFilesChange?: (files: File[]) => void;
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
  uploadFunction?: (file: File) => Promise<string>; // Returns URL
}

export function FileUpload({
  accept,
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 5,
  multiple = true,
  disabled = false,
  error = false,
  onFilesChange,
  onUploadComplete,
  onUploadError,
  uploadFunction,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `${THAI_LABELS.fileTooLarge} (${THAI_LABELS.maxFileSize}: ${formatFileSize(maxSize)})`;
    }

    // Check file type
    if (accept) {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type;
      
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type.toLowerCase();
        }
        if (type.endsWith('/*')) {
          return mimeType.startsWith(type.replace('/*', ''));
        }
        return mimeType === type;
      });

      if (!isAccepted) {
        return `${THAI_LABELS.invalidFileType} (${accept})`;
      }
    }

    return null;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Check max files limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      onUploadError?.(`สามารถอัปโหลดได้สูงสุด ${maxFiles} ไฟล์`);
      return;
    }

    // Validate and prepare files
    const newFiles: UploadedFile[] = [];
    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        onUploadError?.(validationError);
        continue;
      }

      newFiles.push({
        id: Math.random().toString(36).substring(7),
        file,
        progress: 0,
        error: undefined,
      });
    }

    if (newFiles.length === 0) return;

    setUploadedFiles(prev => [...prev, ...newFiles]);
    onFilesChange?.(fileArray);

    // Upload files if upload function is provided
    if (uploadFunction) {
      for (const uploadedFile of newFiles) {
        try {
          // Simulate progress
          const progressInterval = setInterval(() => {
            setUploadedFiles(prev =>
              prev.map(f =>
                f.id === uploadedFile.id && f.progress < 90
                  ? { ...f, progress: f.progress + 10 }
                  : f
              )
            );
          }, 200);

          const url = await uploadFunction(uploadedFile.file);

          clearInterval(progressInterval);

          setUploadedFiles(prev =>
            prev.map(f =>
              f.id === uploadedFile.id
                ? { ...f, progress: 100, url }
                : f
            )
          );
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Upload failed';
          setUploadedFiles(prev =>
            prev.map(f =>
              f.id === uploadedFile.id
                ? { ...f, error: errorMessage, progress: 0 }
                : f
            )
          );
          onUploadError?.(errorMessage);
        }
      }

      // Notify completion
      const completedFiles = uploadedFiles.filter(f => f.progress === 100);
      if (completedFiles.length > 0) {
        onUploadComplete?.(completedFiles);
      }
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    const remainingFiles = uploadedFiles
      .filter(f => f.id !== fileId)
      .map(f => f.file);
    onFilesChange?.(remainingFiles);
  };

  const handleRetryUpload = async (fileId: string) => {
    const fileToRetry = uploadedFiles.find(f => f.id === fileId);
    if (!fileToRetry || !uploadFunction) return;

    setUploadedFiles(prev =>
      prev.map(f =>
        f.id === fileId
          ? { ...f, error: undefined, progress: 0 }
          : f
      )
    );

    try {
      const progressInterval = setInterval(() => {
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === fileId && f.progress < 90
              ? { ...f, progress: f.progress + 10 }
              : f
          )
        );
      }, 200);

      const url = await uploadFunction(fileToRetry.file);

      clearInterval(progressInterval);

      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? { ...f, progress: 100, url }
            : f
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? { ...f, error: errorMessage, progress: 0 }
            : f
        )
      );
      onUploadError?.(errorMessage);
    }
  };

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all',
          isDragging && 'border-primary bg-opacity-5',
          disabled && 'opacity-50 cursor-not-allowed',
          error && !isDragging && 'border-error'
        )}
        style={{
          borderColor: isDragging
            ? 'var(--color-primary)'
            : error
            ? 'var(--color-error)'
            : 'var(--color-border)',
          backgroundColor: isDragging
            ? 'var(--color-surface-hover)'
            : 'var(--color-surface)',
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload files"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
          aria-hidden="true"
        />

        <div className="flex flex-col items-center gap-2">
          <svg
            className="w-12 h-12"
            style={{ color: 'var(--color-text-muted)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          <div>
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              {THAI_LABELS.uploadFile}
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
            </p>
          </div>

          {(accept || maxSize) && (
            <p
              className="text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {accept && `ประเภทไฟล์: ${accept}`}
              {accept && maxSize && ' • '}
              {maxSize && `ขนาดสูงสุด: ${formatFileSize(maxSize)}`}
            </p>
          )}
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((uploadedFile) => (
            <div
              key={uploadedFile.id}
              className="rounded-lg p-3"
              style={{
                backgroundColor: 'var(--color-surface-hover)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-start gap-3">
                {/* File Icon */}
                <div
                  className="flex-shrink-0 w-10 h-10 rounded flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                >
                  <svg
                    className="w-5 h-5"
                    style={{ color: 'var(--color-text-secondary)' }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--color-text)' }}
                        title={uploadedFile.file.name}
                      >
                        {uploadedFile.file.name}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {uploadedFile.error && (
                        <button
                          type="button"
                          onClick={() => handleRetryUpload(uploadedFile.id)}
                          className="p-1 rounded hover:opacity-70 transition-opacity"
                          style={{ color: 'var(--color-warning)' }}
                          aria-label="Retry upload"
                          title="ลองอีกครั้ง"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(uploadedFile.id)}
                        className="p-1 rounded hover:opacity-70 transition-opacity"
                        style={{ color: 'var(--color-error)' }}
                        aria-label="Remove file"
                        title={THAI_LABELS.removeItem}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {uploadedFile.progress > 0 && uploadedFile.progress < 100 && !uploadedFile.error && (
                    <div className="mt-2">
                      <ProgressBar value={uploadedFile.progress} size="sm" />
                    </div>
                  )}

                  {/* Success Message */}
                  {uploadedFile.progress === 100 && !uploadedFile.error && (
                    <div className="flex items-center gap-1 mt-1">
                      <svg
                        className="w-4 h-4"
                        style={{ color: 'var(--color-success)' }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span
                        className="text-xs"
                        style={{ color: 'var(--color-success)' }}
                      >
                        อัปโหลดสำเร็จ
                      </span>
                    </div>
                  )}

                  {/* Error Message */}
                  {uploadedFile.error && (
                    <div className="flex items-start gap-1 mt-1">
                      <svg
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        style={{ color: 'var(--color-error)' }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span
                        className="text-xs"
                        style={{ color: 'var(--color-error)' }}
                      >
                        {uploadedFile.error}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export type { FileUploadProps, UploadedFile };
