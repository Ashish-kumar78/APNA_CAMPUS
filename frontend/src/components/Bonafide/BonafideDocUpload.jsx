import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Eye,
  AlertCircle,
  FileCheck2,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import BonafideDocPreviewModal from './BonafideDocPreviewModal';

/**
 * Format bytes into human-readable size string (e.g. "2.45 MB", "512 KB")
 */
export function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function BonafideDocUpload({
  label = 'Supporting Document',
  required = false,
  hint = 'Upload supportive verification proof in PDF, JPG, PNG or document format.',
  value = null, // { fileName, fileSize, sizeInBytes, fileType, dataUrl }
  onChange,
  maxSizeMB = 10,
  accept = '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx',
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const processFile = (file) => {
    if (!file) return;
    setErrorMessage('');

    // Check size limit
    if (file.size > maxSizeBytes) {
      setErrorMessage(
        `File "${file.name}" exceeds maximum allowed size of ${maxSizeMB} MB (selected file is ${formatFileSize(file.size)}). Please choose a smaller file.`
      );
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = e.target?.result;
      const docObject = {
        name: file.name,
        fileName: file.name,
        sizeInBytes: file.size,
        fileSize: formatFileSize(file.size),
        fileType: file.type || 'application/octet-stream',
        dataUrl,
        uploadedAt: new Date().toISOString(),
      };
      setIsProcessing(false);
      onChange && onChange(docObject);
    };

    reader.onerror = () => {
      setIsProcessing(false);
      setErrorMessage('Failed to read selected file. Please try again.');
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // reset input so user can choose the same file again if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setErrorMessage('');
    onChange && onChange(null);
  };

  const isPdf =
    value?.fileType?.includes('pdf') ||
    value?.fileName?.toLowerCase().endsWith('.pdf') ||
    (value?.dataUrl && value?.dataUrl.startsWith('data:application/pdf'));

  const isImage =
    value?.fileType?.startsWith('image/') ||
    /\.(jpg|jpeg|png|webp|gif)$/i.test(value?.fileName || '') ||
    (value?.dataUrl && value?.dataUrl.startsWith('data:image/'));

  return (
    <div className="bonafide-doc-upload-container">
      {/* Label and Size Specifier Banner */}
      <div className="bonafide-upload-header-row">
        <label className="bonafide-upload-label">
          {label} {required && <span className="req">*</span>}
        </label>
        <div className="bonafide-upload-meta-badges">
          <span className="bonafide-badge-size-limit">
            <HardDrive size={11} />
            <span>Max Size: <strong>{maxSizeMB} MB</strong></span>
          </span>
          <span className="bonafide-badge-formats">PDF, JPG, PNG, DOCX</span>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        style={{ display: 'none' }}
      />

      {/* Error message */}
      {errorMessage && (
        <div className="bonafide-upload-error-banner">
          <AlertCircle size={15} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* IF A DOCUMENT IS ALREADY UPLOADED */}
      {value ? (
        <div className="bonafide-uploaded-file-card">
          <div className="bonafide-uploaded-left">
            {/* Thumbnail or File Icon */}
            {isImage && value.dataUrl ? (
              <div
                className="bonafide-uploaded-thumb-preview"
                onClick={() => setPreviewOpen(true)}
                title="Click to preview full image"
              >
                <img src={value.dataUrl} alt={value.fileName} />
              </div>
            ) : (
              <div
                className={`bonafide-uploaded-icon-box ${isPdf ? 'is-pdf' : 'is-doc'}`}
                onClick={() => setPreviewOpen(true)}
                title="Click to preview document"
              >
                {isPdf ? <FileText size={22} /> : <FileCheck2 size={22} />}
              </div>
            )}

            {/* File Details */}
            <div className="bonafide-uploaded-meta">
              <div className="bonafide-uploaded-title-line">
                <span className="bonafide-uploaded-filename" title={value.fileName}>
                  {value.fileName || 'Attached Document'}
                </span>
                <span className="bonafide-file-size-pill">
                  {value.fileSize || formatFileSize(value.sizeInBytes)}
                </span>
              </div>
              <div className="bonafide-uploaded-subline">
                <span className="bonafide-uploaded-status">
                  <CheckCircle2 size={12} color="#059669" />
                  <span>Ready for institutional review</span>
                </span>
                <span className="bonafide-file-type-pill">
                  {isPdf ? 'PDF Document' : isImage ? 'Image (JPG/PNG)' : 'Document Attachment'}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="bonafide-uploaded-actions">
            <button
              type="button"
              className="bonafide-upload-action-btn view-btn"
              onClick={() => setPreviewOpen(true)}
              title="Preview document"
            >
              <Eye size={14} />
              <span>Preview</span>
            </button>

            <button
              type="button"
              className="bonafide-upload-action-btn replace-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Replace with another file"
            >
              <RefreshCw size={14} />
              <span>Replace</span>
            </button>

            <button
              type="button"
              className="bonafide-upload-action-btn remove-btn"
              onClick={handleRemove}
              title="Remove this document"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ) : (
        /* DROPZONE / CLICK TO BROWSE */
        <div
          className={`bonafide-dropzone ${isDragging ? 'is-dragging' : ''} ${isProcessing ? 'is-processing' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="bonafide-dropzone-icon-circle">
            {isProcessing ? (
              <RefreshCw size={24} className="animate-spin text-blue-600" />
            ) : (
              <UploadCloud size={24} className="text-blue-600" />
            )}
          </div>
          <div className="bonafide-dropzone-text">
            <p className="bonafide-dropzone-main">
              <strong>Click to upload</strong> or drag and drop your document
            </p>
            <p className="bonafide-dropzone-sub">
              PDF, JPG, PNG, or DOCX • <strong>Maximum size: {maxSizeMB} MB</strong>
            </p>
          </div>
          <button
            type="button"
            className="bonafide-dropzone-browse-btn"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Browse File
          </button>
        </div>
      )}

      {/* Field Hint */}
      {hint && <span className="field-hint" style={{ marginTop: '6px', display: 'block' }}>{hint}</span>}

      {/* Document Preview Modal */}
      {previewOpen && value && (
        <BonafideDocPreviewModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          doc={value}
        />
      )}
    </div>
  );
}
