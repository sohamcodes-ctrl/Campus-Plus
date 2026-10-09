"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/presentation/utils/cn";

export interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  mimeType: string;
  storageKey?: string;
}

export interface FileUploaderProps {
  files: UploadedFileItem[];
  onChange: (files: UploadedFileItem[]) => void;
  maxFiles?: number;
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
  disabled?: boolean;
  className?: string;
}

const DEFAULT_ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const DEFAULT_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const DEFAULT_MAX_FILES = 3;

export const FileUploader: React.FC<FileUploaderProps> = ({
  files,
  onChange,
  maxFiles = DEFAULT_MAX_FILES,
  maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
  allowedMimeTypes = DEFAULT_ALLOWED_MIME_TYPES,
  disabled = false,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validateAndAddFiles = (newFiles: FileList | File[]) => {
    setErrorMessage(null);
    const validItems: UploadedFileItem[] = [...files];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];

      if (validItems.length >= maxFiles) {
        setErrorMessage(`Maximum of ${maxFiles} attachments allowed.`);
        break;
      }

      if (!allowedMimeTypes.includes(file.type)) {
        setErrorMessage(
          `File "${file.name}" is not supported. Allowed formats: JPEG, PNG, PDF.`
        );
        continue;
      }

      if (file.size > maxSizeBytes) {
        setErrorMessage(
          `File "${file.name}" exceeds maximum size limit of ${formatFileSize(maxSizeBytes)}.`
        );
        continue;
      }

      // Check for duplicate filenames
      if (validItems.some((item) => item.name === file.name && item.sizeBytes === file.size)) {
        continue;
      }

      validItems.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        name: file.name,
        sizeBytes: file.size,
        mimeType: file.type,
      });
    }

    onChange(validItems);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (id: string) => {
    setErrorMessage(null);
    onChange(files.filter((f) => f.id !== id));
  };

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && files.length < maxFiles) {
            inputRef.current?.click();
          }
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
          dragOver
            ? "border-[var(--role-primary,#7FA8D9)] bg-[var(--role-accent,#EAF2FB)]/30"
            : "border-slate-300 bg-white hover:bg-slate-50",
          (disabled || files.length >= maxFiles) &&
            "cursor-not-allowed opacity-60 hover:bg-white border-slate-200"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={allowedMimeTypes.join(",")}
          disabled={disabled || files.length >= maxFiles}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) {
              validateAndAddFiles(e.target.files);
              e.target.value = "";
            }
          }}
        />

        <svg
          className="h-8 w-8 text-slate-400 mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <p className="text-sm font-medium text-slate-700">
          {files.length >= maxFiles ? (
            <span>Maximum attachments limit reached ({maxFiles}/{maxFiles})</span>
          ) : (
            <span>
              <span className="text-[var(--role-btn-text,#1E3A5F)] font-semibold underline">
                Click to upload
              </span>{" "}
              or drag and drop
            </span>
          )}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          JPEG, PNG, or PDF up to 5MB each (Max {maxFiles} files)
        </p>
      </div>

      {errorMessage && (
        <p role="alert" className="text-xs font-medium text-red-600">
          {errorMessage}
        </p>
      )}

      {/* Uploaded File List */}
      {files.length > 0 && (
        <ul role="list" className="space-y-2">
          {files.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700"
            >
              <div className="flex items-center space-x-2 truncate">
                <svg
                  className="h-4 w-4 text-slate-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
                <span className="font-medium truncate">{item.name}</span>
                <span className="text-slate-400">({formatFileSize(item.sizeBytes)})</span>
              </div>

              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  aria-label={`Remove file ${item.name}`}
                  className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
