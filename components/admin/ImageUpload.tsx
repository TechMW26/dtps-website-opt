'use client';

import { useState, useRef } from 'react';
import { FaUpload, FaSpinner, FaTrash, FaImage } from 'react-icons/fa';

interface ImageUploadProps {
  folder: 'testimonials' | 'recognition' | 'pricing' | 'success-stories' | 'transformations' | 'blogs' | 'admin' | 'plan-banners';
  value?: string;
  onChange: (url: string, fileId?: string) => void;
  onDelete?: () => void;
  label?: string;
  className?: string;
  maxSizeMB?: number;
}

export default function ImageUpload({
  folder,
  value,
  onChange,
  onDelete,
  label = 'Upload Image',
  className = '',
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);

    try {
      // Convert to base64
      const base64 = await fileToBase64(file);

      // Upload to API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          fileName: file.name.split('.')[0],
          folder,
          compress: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      onChange(data.url, data.fileId);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDelete = async () => {
    if (onDelete) {
      onDelete();
    }
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={`image-upload ${className}`}>
      {label && <label className="image-upload-label">{label}</label>}

      {value ? (
        <div className="image-upload-preview">
          <img src={value} alt="Preview" />
          <div className="image-upload-actions">
            <button
              type="button"
              className="image-upload-delete"
              onClick={handleDelete}
              title="Remove image"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`image-upload-dropzone ${dragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="image-upload-input"
          />
          {uploading ? (
            <>
              <FaSpinner className="image-upload-icon spinning" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <FaImage className="image-upload-icon" />
              <span>Drag & drop or click to upload</span>
              <span className="image-upload-hint">Max {maxSizeMB}MB, will be compressed</span>
            </>
          )}
        </div>
      )}

      {error && <p className="image-upload-error">{error}</p>}

      <style jsx>{`
        .image-upload {
          width: 100%;
        }

        .image-upload-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #e5e7eb;
          margin-bottom: 6px;
        }

        .image-upload-dropzone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 32px 16px;
          border: 2px dashed #374151;
          border-radius: 12px;
          background: #111827;
          cursor: pointer;
          transition: all 0.2s;
          color: #9ca3af;
          text-align: center;
        }

        .image-upload-dropzone:hover,
        .image-upload-dropzone.active {
          border-color: #22c55e;
          background: rgba(34, 197, 94, 0.1);
        }

        .image-upload-dropzone.uploading {
          pointer-events: none;
          opacity: 0.7;
        }

        .image-upload-input {
          display: none;
        }

        .image-upload-icon {
          font-size: 32px;
          color: #6b7280;
        }

        .image-upload-icon.spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .image-upload-hint {
          font-size: 12px;
          color: #6b7280;
        }

        .image-upload-preview {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #374151;
        }

        .image-upload-preview img {
          width: 100%;
          max-height: 200px;
          object-fit: cover;
          display: block;
        }

        .image-upload-actions {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          gap: 8px;
        }

        .image-upload-delete {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .image-upload-delete:hover {
          background: #dc2626;
        }

        .image-upload-error {
          color: #ef4444;
          font-size: 12px;
          margin-top: 6px;
        }
      `}</style>
    </div>
  );
}

// Helper function to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
