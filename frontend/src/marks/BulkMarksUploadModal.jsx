import React from 'react'
import { Download, FileSpreadsheet, X } from 'lucide-react'
import { ASSESSMENT_CONFIG } from './marksData'

export default function BulkMarksUploadModal({ isOpen, onClose, subject }) {
  if (!isOpen) return null

  function handleDownloadTemplate() {
    const headers = [
      'Roll No',
      'Registration No',
      'Student Name',
      'Section',
      ...ASSESSMENT_CONFIG.map((assessment) => `${assessment.label}_Max_${assessment.maxMarks}`),
    ]
    const content = `${headers.join(',')}\n`
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${subject?.code || 'subject'}_Marks_Template.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mm-modal-backdrop" onClick={onClose}>
      <div className="mm-modal-window mm-upload-modal" onClick={(event) => event.stopPropagation()}>
        <div className="mm-modal-header">
          <div className="mm-modal-title-stack">
            <span className="mm-pill-tag">Marks Import</span>
            <h3>Bulk Marks Spreadsheet</h3>
            <p>Subject: <strong>{subject?.code || '—'}{subject?.name ? ` - ${subject.name}` : ''}</strong></p>
          </div>
          <button type="button" className="mm-modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="mm-modal-body">
          <div className="mm-template-callout" role="status">
            <div>
              <strong>Bulk import is not available yet</strong>
              <p>There is no verified backend import endpoint, so this screen cannot validate or save spreadsheet marks. Enter marks through the supported marks workflow.</p>
            </div>
          </div>
          <div className="mm-dropzone">
            <FileSpreadsheet size={38} aria-hidden="true" />
            <h4>Download a blank CSV column template</h4>
            <p>The template contains column names only. Add real student rows from your authorized roster before use.</p>
            <button type="button" className="mm-btn mm-btn-outline" onClick={handleDownloadTemplate}>
              <Download size={15} />
              <span>Download Blank Template</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
