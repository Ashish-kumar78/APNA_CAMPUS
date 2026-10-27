// Document & Export Utilities for APNA CAMPUS Smart Communication System
// Supports valid generation of PDF, XLSX (Excel), CSV, and Word (DOC/DOCX)

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export data array to Excel (XLSX)
 * @param {string} fileName 
 * @param {string} sheetName 
 * @param {Array<object> | Array<Array<any>>} data 
 * @param {Array<string>} headers optional
 */
export function exportToExcel(fileName, sheetName, data, headers = null) {
  try {
    let ws;
    if (headers && Array.isArray(data[0]) && typeof data[0][0] !== 'object') {
      const aoa = [headers, ...data];
      ws = XLSX.utils.aoa_to_sheet(aoa);
    } else {
      ws = XLSX.utils.json_to_sheet(data);
    }

    // Auto-fit column widths
    const colWidths = [];
    if (data.length > 0) {
      const keys = headers || Object.keys(data[0]);
      keys.forEach((key, colIdx) => {
        let maxLen = String(key).length;
        data.forEach(row => {
          const val = Array.isArray(row) ? row[colIdx] : row[key];
          if (val) maxLen = Math.max(maxLen, String(val).length);
        });
        colWidths.push({ wch: Math.min(Math.max(maxLen + 3, 10), 45) });
      });
      ws['!cols'] = colWidths;
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName || 'Sheet1');
    const safeName = (fileName || 'Apna_Campus_Export').replace(/[^a-zA-Z0-9_-]/g, '_');
    XLSX.writeFile(wb, `${safeName}.xlsx`);
    return true;
  } catch (err) {
    console.error('Excel Export Failed:', err);
    throw new Error('Failed to generate Excel file: ' + err.message);
  }
}

/**
 * Export data array to CSV
 */
export function exportToCsv(fileName, data, headers = null) {
  try {
    let csvContent = '';
    if (headers) {
      csvContent += headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\n';
    } else if (data.length > 0 && typeof data[0] === 'object' && !Array.isArray(data[0])) {
      headers = Object.keys(data[0]);
      csvContent += headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\n';
    }

    data.forEach(row => {
      let rowValues = [];
      if (Array.isArray(row)) {
        rowValues = row;
      } else if (headers) {
        rowValues = headers.map(h => row[h]);
      } else {
        rowValues = Object.values(row);
      }
      csvContent += rowValues.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = (fileName || 'Apna_Campus_Data').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('href', url);
    link.setAttribute('download', `${safeName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('CSV Export Failed:', err);
    throw new Error('Failed to generate CSV file: ' + err.message);
  }
}

/**
 * Export formatted document or circular to Word (HTML-based DOC)
 */
export function exportToWord(fileName, title, contentHtml, metadata = {}) {
  try {
    const documentHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${title || 'APNA CAMPUS Document'}</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; color: #1e293b; line-height: 1.6; padding: 20px; }
          .inst-header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px; }
          .inst-name { font-size: 18pt; font-weight: bold; color: #0369a1; margin: 0; }
          .inst-sub { font-size: 10pt; color: #64748b; margin-top: 4px; }
          .doc-title { font-size: 14pt; font-weight: bold; color: #0f172a; margin-top: 15px; text-transform: uppercase; }
          .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; margin-bottom: 20px; font-size: 9.5pt; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; }
          th { background-color: #0284c7; color: white; padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; }
          td { padding: 8px; border: 1px solid #cbd5e1; }
          .inst-footer { margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 8pt; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="inst-header">
          <div class="inst-name">APNA CAMPUS · AUTONOMOUS HIGHER EDUCATION</div>
          <div class="inst-sub">NAAC A++ Accredited Autonomous Institution · Office of Communications & Deanery</div>
          <div class="doc-title">${title}</div>
        </div>

        ${metadata && Object.keys(metadata).length > 0 ? `
          <div class="meta-box">
            ${metadata.sender ? `<div><strong>Issued By:</strong> ${metadata.sender} (${metadata.department || 'Administrative Authority'})</div>` : ''}
            ${metadata.date ? `<div><strong>Date of Dispatch:</strong> ${metadata.date}</div>` : ''}
            ${metadata.recipients ? `<div><strong>Authorized Target Group:</strong> ${metadata.recipients}</div>` : ''}
            ${metadata.priority ? `<div><strong>Priority Status:</strong> ${metadata.priority}</div>` : ''}
          </div>
        ` : ''}

        <div class="content-body">
          ${contentHtml}
        </div>

        <div class="inst-footer">
          Official Institutional Gazette · APNA CAMPUS ERP v3.0 · Document ID: DOC-${Date.now().toString(36).toUpperCase()}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', documentHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = (fileName || title || 'Apna_Campus_Document').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.href = url;
    link.download = `${safeName}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Word Export Failed:', err);
    throw new Error('Failed to generate Word document: ' + err.message);
  }
}

/**
 * Generate official PDF Document from Table / Data
 */
export function exportTableToPdf(fileName, title, headers, rows, subtitle = '') {
  try {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

    // Header styling
    doc.setFontSize(16);
    doc.setTextColor(2, 132, 199);
    doc.text('APNA CAMPUS · AUTONOMOUS HIGHER EDUCATION', 40, 40);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('NAAC A++ Accredited · Centralized Institutional Communication Gazette', 40, 56);

    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(title || 'Institutional Record', 40, 80);

    if (subtitle) {
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(subtitle, 40, 96);
    }

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(1);
    doc.line(40, 106, 800, 106);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 116,
      theme: 'grid',
      headStyles: {
        fillColor: [2, 132, 199],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [30, 41, 59]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 40, right: 40 }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Page ${i} of ${pageCount} · Generated on ${new Date().toLocaleDateString('en-GB')}`, 40, 570);
    }

    const safeName = (fileName || title || 'Apna_Campus_Report').replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`${safeName}.pdf`);
    return true;
  } catch (err) {
    console.error('PDF Export Failed:', err);
    throw new Error('Failed to generate PDF file: ' + err.message);
  }
}

/**
 * Generate PDF for Form Responses Summary
 */
export function exportFormResponsesPdf(formTitle, questions, responses) {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

    doc.setFontSize(16);
    doc.setTextColor(2, 132, 199);
    doc.text('APNA CAMPUS · FORM RESPONSES AUDIT', 40, 45);

    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(formTitle || 'Institutional Form Response Summary', 40, 68);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Total Submissions: ${responses.length} · Exported on ${new Date().toLocaleString('en-GB')}`, 40, 84);

    doc.setDrawColor(203, 213, 225);
    doc.line(40, 94, 555, 94);

    const headers = ['#', 'Respondent', 'ID / Roll', ...questions.slice(0, 4).map(q => q.title)];
    const body = responses.map((res, idx) => [
      idx + 1,
      res.respondentName || 'Student',
      res.respondentId || 'N/A',
      ...questions.slice(0, 4).map(q => {
        const val = res.answers?.[q.id] || res.answers?.[q.title] || '—';
        return Array.isArray(val) ? val.join(', ') : String(val);
      })
    ]);

    autoTable(doc, {
      head: [headers],
      body: body,
      startY: 104,
      theme: 'grid',
      headStyles: {
        fillColor: [2, 132, 199],
        textColor: [255, 255, 255],
        fontSize: 8.5
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59]
      },
      margin: { left: 40, right: 40 }
    });

    const safeName = (formTitle || 'Form_Responses').replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`${safeName}_Audit.pdf`);
    return true;
  } catch (err) {
    console.error('Form PDF Export Failed:', err);
    throw new Error('Failed to generate PDF summary: ' + err.message);
  }
}
