// src/marks/BulkMarksUploadModal.jsx
import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  X,
  FileCheck2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { ASSESSMENT_CONFIG } from './marksData'

export default function BulkMarksUploadModal({
  isOpen,
  onClose,
  subject,
  onImportComplete,
}) {
  const [fileSelected, setFileSelected] = useState(false)
  const [fileName, setFileName] = useState('')
  const [showErrors, setShowErrors] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  // Simulated mock import statistics
  const validRecordsCount = 86
  const errorRecordsCount = 5

  const mockErrors = [
    { row: 14, roll: '14', name: 'Sunita Pradhan', error: 'Quiz 3 score (12) exceeds maximum allowed marks (10)' },
    { row: 29, roll: '29', name: 'Bhavna Tripathy', error: 'Modular 2 score (-2) cannot be negative' },
    { row: 48, roll: '48', name: 'Monika Mallick', error: 'Lab Practical marks missing or non-numeric ("AB")' },
    { row: 63, roll: '63', name: 'Lokesh Swain', error: 'Invalid Roll number format ("063X")' },
    { row: 77, roll: '77', name: 'Jitendra Jena', error: 'Surprise Test 1 score (15) exceeds maximum allowed marks (10)' },
  ]

  function handleFileDrop(e) {
    e.preventDefault()
    if (e.dataTransfer?.files?.[0]) {
      setFileName(e.dataTransfer.files[0].name)
      setFileSelected(true)
    }
  }

  function handleFileInput(e) {
    if (e.target.files?.[0]) {
      setFileName(e.target.files[0].name)
      setFileSelected(true)
    }
  }

  function handleSimulateUpload() {
    setFileName(`${subject.code}_Semester5_Marks_Batch.xlsx`)
    setFileSelected(true)
  }

  function handleDownloadTemplate() {
    // Generate CSV template for download
    let headers = 'Roll No,Registration No,Student Name,Section,' + ASSESSMENT_CONFIG.map((a) => `${a.label}_Max_${a.maxMarks}`).join(',')
    let sampleRow1 = '01,2305201001,Rahul Sharma,A,18,16,8,9,7,10,8,9,9,8,7,9,22'
    let sampleRow2 = '02,2305201002,Amit Patel,A,17,18,9,8,9,8,9,10,8,9,8,7,24'
    const content = `${headers}\n${sampleRow1}\n${sampleRow2}\n`

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${subject.code}_Marks_Template.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function handleCommitImport() {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      onImportComplete(validRecordsCount)
      onClose()
    }, 700)
  }

  const modalContent = (
    <div className="mm-modal-backdrop" onClick={onClose} style={{ zIndex: 999999 }}>
      <div
        className="mm-modal-window mm-upload-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mm-modal-header">
          <div className="mm-modal-title-stack">
            <span className="mm-pill-tag">Batch Import Engine</span>
            <h3>Bulk Marks Entry & Spreadsheet Import</h3>
            <p>Subject: <strong>{subject.code} - {subject.name}</strong> (Semester 5)</p>
          </div>
          <button
            type="button"
            className="mm-modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mm-modal-body">
          {!fileSelected ? (
            <>
              {/* Dropzone */}
              <div
                className="mm-dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
              >
                <div className="mm-dropzone-icon">
                  <FileSpreadsheet size={38} />
                </div>
                <h4>Drag & Drop Excel (.xlsx, .xls) or CSV File Here</h4>
                <p>Upload multi-student assessment marks sheets directly into the system</p>

                <div className="mm-dropzone-actions">
                  <label className="mm-btn mm-btn-primary mm-btn-file">
                    <Upload size={15} />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                      onChange={handleFileInput}
                      style={{ display: 'none' }}
                    />
                  </label>

                  <button
                    type="button"
                    className="mm-btn mm-btn-secondary"
                    onClick={handleSimulateUpload}
                  >
                    <span>Load Demo File</span>
                  </button>
                </div>
              </div>

              {/* Download Template Bar */}
              <div className="mm-template-callout">
                <div>
                  <strong>Need the official spreadsheet format?</strong>
                  <p>Download the pre-filled template with student roll numbers, names, and column constraints.</p>
                </div>
                <button
                  type="button"
                  className="mm-btn mm-btn-outline"
                  onClick={handleDownloadTemplate}
                >
                  <Download size={15} />
                  <span>Download Template</span>
                </button>
              </div>
            </>
          ) : (
            /* Import Preview Section (Requirement Section 9) */
            <div className="mm-import-preview-wrap">
              <div className="mm-file-meta-pill">
                <FileSpreadsheet size={16} />
                <strong>{fileName}</strong>
                <button
                  type="button"
                  className="mm-link-btn"
                  onClick={() => setFileSelected(false)}
                >
                  Change File
                </button>
              </div>

              <div className="mm-preview-summary-card">
                <h4>Import Preview & Data Verification</h4>
                <div className="mm-preview-stats-row">
                  <div className="mm-pstat success">
                    <CheckCircle2 size={18} />
                    <div>
                      <strong>{validRecordsCount} Valid Records</strong>
                      <span>Ready to be committed to marks database</span>
                    </div>
                  </div>

                  <div className="mm-pstat warning">
                    <AlertTriangle size={18} />
                    <div>
                      <strong>{errorRecordsCount} Errors Found</strong>
                      <span>Out-of-range marks or format mismatches</span>
                    </div>
                  </div>
                </div>

                <div className="mm-error-toggle-row">
                  <button
                    type="button"
                    className="mm-btn-error-toggle"
                    onClick={() => setShowErrors(!showErrors)}
                  >
                    <span>{showErrors ? 'Hide Error Details' : 'View Errors & Affected Rows'}</span>
                    {showErrors ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {showErrors && (
                  <div className="mm-errors-list">
                    <div className="mm-errors-table-wrap">
                      <table className="mm-errors-table">
                        <thead>
                          <tr>
                            <th>Row</th>
                            <th>Roll</th>
                            <th>Student</th>
                            <th>Error Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockErrors.map((err) => (
                            <tr key={err.row}>
                              <td><strong>#{err.row}</strong></td>
                              <td>{err.roll}</td>
                              <td>{err.name}</td>
                              <td className="mm-error-msg">{err.error}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <small className="mm-error-note">
                      Note: You can proceed to import the {validRecordsCount} valid records. The 5 rows with errors will remain unchanged.
                    </small>
                  </div>
                )}
              </div>

              {/* Bottom Buttons */}
              <div className="mm-modal-actions-footer">
                <button
                  type="button"
                  className="mm-btn mm-btn-outline"
                  onClick={() => setFileSelected(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="mm-btn mm-btn-primary"
                  onClick={handleCommitImport}
                  disabled={isProcessing}
                >
                  <FileCheck2 size={15} />
                  <span>{isProcessing ? 'Importing Records...' : `Import ${validRecordsCount} Valid Records`}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
