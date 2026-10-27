import React from 'react';
import { X, Download, ExternalLink, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function BonafideDocPreviewModal({ isOpen, onClose, doc }) {
  if (!isOpen || !doc) return null;

  const fileName = doc.fileName || doc.name || 'Supporting Document';
  const fileSize = doc.fileSize || (doc.sizeInBytes ? `${(doc.sizeInBytes / (1024 * 1024)).toFixed(2)} MB` : 'Attached Document');
  const fileType = doc.fileType || '';
  const dataUrl = doc.dataUrl || doc.url || '';

  const isPdf = fileType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf') || (dataUrl && dataUrl.startsWith('data:application/pdf'));
  const isImage = fileType.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fileName) || (dataUrl && dataUrl.startsWith('data:image/'));

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenNewTab = () => {
    if (!dataUrl) return;
    if (dataUrl.startsWith('data:')) {
      // Create a blob URL for safe opening in new tab
      try {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } catch (err) {
        window.open(dataUrl, '_blank');
      }
    } else {
      window.open(dataUrl, '_blank');
    }
  };

  return (
    <div className="bonafide-modal-backdrop" onClick={onClose} style={{ zIndex: 10050 }}>
      <div
        className="bonafide-modal-card"
        style={{ maxWidth: '850px', height: '88vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bonafide-modal-header" style={{ borderBottom: '1px solid #e2e8f0', padding: '14px 20px' }}>
          <div className="bonafide-modal-header-info">
            <div
              className="bonafide-modal-icon-wrap"
              style={{
                width: '38px',
                height: '38px',
                background: isPdf ? '#fee2e2' : isImage ? '#e0e7ff' : '#f1f5f9',
                color: isPdf ? '#dc2626' : isImage ? '#4f46e5' : '#475569',
              }}
            >
              {isPdf ? <FileText size={20} /> : isImage ? <ImageIcon size={20} /> : <FileText size={20} />}
            </div>
            <div>
              <h3 className="bonafide-modal-title" style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{fileName}</span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: '#e0f2fe',
                    color: '#0369a1',
                  }}
                >
                  {fileSize}
                </span>
              </h3>
              <p className="bonafide-modal-subtitle" style={{ fontSize: '11.5px' }}>
                Uploaded Supportive Document for Bonafide Verification
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {dataUrl && (
              <>
                <button
                  className="bonafide-btn-outline"
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                  onClick={handleOpenNewTab}
                  title="Open in new window"
                >
                  <ExternalLink size={14} />
                  <span>Open Full</span>
                </button>
                <button
                  className="bonafide-btn-outline"
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                  onClick={handleDownload}
                  title="Download file"
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>
              </>
            )}
            <button className="bonafide-modal-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            background: '#0f172a08',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          {isImage && dataUrl ? (
            <div style={{ textAlign: 'center', maxWidth: '100%', maxHeight: '100%' }}>
              <img
                src={dataUrl}
                alt={fileName}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
                  background: '#ffffff',
                }}
              />
            </div>
          ) : isPdf && dataUrl ? (
            <iframe
              src={dataUrl}
              title={fileName}
              width="100%"
              height="100%"
              style={{
                border: 'none',
                borderRadius: '8px',
                background: '#ffffff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                minHeight: '65vh',
              }}
            />
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                maxWidth: '460px',
              }}
            >
              <FileText size={48} color="#64748b" style={{ margin: '0 auto 12px auto' }} />
              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#1e293b' }}>{fileName}</h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
                Document type: {fileType || 'Binary file'} ({fileSize})
              </p>
              {dataUrl ? (
                <button className="bonafide-btn-primary" onClick={handleDownload} style={{ margin: '0 auto' }}>
                  <Download size={15} />
                  <span>Download Document to View</span>
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', color: '#94a3b8' }}>
                  <AlertCircle size={15} />
                  <span style={{ fontSize: '12.5px' }}>File content URL not directly available.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
