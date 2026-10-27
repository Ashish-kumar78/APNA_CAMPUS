import React, { useState } from 'react';
import {
  Award,
  Filter,
  Eye,
  CheckCircle2,
  Printer,
  FileSpreadsheet,
  AlertCircle,
  FileText,
  Search,
  X,
  Check,
  Send,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export default function MeritListTab({
  meritLists = [],
  courses = [],
  onUpdateStatus,
}) {
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('All');
  const [selectedRoundFilter, setSelectedRoundFilter] = useState('All');
  const [previewList, setPreviewList] = useState(meritLists[0] || null);

  const filteredLists = meritLists.filter((m) => {
    if (selectedCourseFilter !== 'All' && m.courseCode !== selectedCourseFilter && m.courseName !== selectedCourseFilter) {
      return false;
    }
    if (selectedRoundFilter !== 'All' && m.admissionRound !== selectedRoundFilter) {
      return false;
    }
    return true;
  });

  const handleSimulatePublish = (meritList) => {
    if (!window.confirm(`Certify and publish ${meritList.meritListNo} to public portal and student accounts?`)) {
      return;
    }
    onUpdateStatus &&
      onUpdateStatus(meritList.id, 'Published', 'Dr. B. K. Sarap (Principal) & Ms. Sasmita Mohapatra');
    if (previewList?.id === meritList.id) {
      setPreviewList({ ...previewList, publicationStatus: 'Published', selectionStatus: 'Published' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = (list) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        `"Merit List: ${list.title} (${list.meritListNo})"`,
        `"Course: ${list.courseName} | Round: ${list.admissionRound} | Session: ${list.academicSession}"`,
        `"Ranking Criteria: ${list.rankingCriteria}"`,
        '',
        'Rank,Application ID,Candidate Name,Exam Rank,12th Marks %,Allotment Status',
        ...(list.topCandidates || []).map(
          (c) => `${c.rank},"${c.appId}","${c.name}","${c.examRank}","${c.marks12}","${c.status}"`
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${list.meritListNo.replace(/\s+/g, '_')}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 700, color: '#0f172a' }}>
            Institutional Merit List Management
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Preview candidate rankings, audit tie-breaking criteria, certify draft allocations, and formally publish admission merit lists.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {previewList && (
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={() => handleExportCSV(previewList)}
            >
              <FileSpreadsheet size={15} /> Export Selected List CSV
            </button>
          )}
          <button type="button" className="adm-btn-secondary" onClick={handlePrint}>
            <Printer size={15} /> Print Gazetted List
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="adm-filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="#64748b" />
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>Filter Merit Lists:</span>
        </div>
        <div className="adm-filter-group">
          <select
            className="adm-select-control"
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
          >
            <option value="All">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.code}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>

          <select
            className="adm-select-control"
            value={selectedRoundFilter}
            onChange={(e) => setSelectedRoundFilter(e.target.value)}
          >
            <option value="All">All Rounds</option>
            <option value="Round 1">Round 1</option>
            <option value="Round 2">Round 2</option>
            <option value="Spot Round">Spot Round</option>
          </select>
        </div>
      </div>

      {/* Two Column Layout: Merit Lists Roster & Live Candidate Preview Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left List of Merit Lists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredLists.map((item) => {
            const isSelected = item.id === previewList?.id;
            const isPublished = item.publicationStatus === 'Published';

            return (
              <div
                key={item.id}
                onClick={() => setPreviewList(item)}
                style={{
                  background: '#ffffff',
                  border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.82rem', color: '#0284c7' }}>
                    {item.meritListNo}
                  </span>
                  <span
                    className={`adm-status-tag ${isPublished ? 'verified' : 'under_review'}`}
                    style={{ fontSize: '0.68rem' }}
                  >
                    {item.publicationStatus}
                  </span>
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a', marginTop: '6px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                  {item.courseName} ({item.courseCode})
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '0.72rem' }}>
                  <span style={{ color: '#475569' }}>Round: <strong>{item.admissionRound}</strong></span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>{item.totalRanked} Candidates Ranked</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Preview Panel for Selected Merit List */}
        {previewList ? (
          <div className="adm-panel-box" style={{ margin: 0 }}>
            <div className="adm-panel-header" style={{ background: '#f8fafc' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="adm-badge-pill dark">{previewList.meritListNo}</span>
                  <span className={`adm-status-tag ${previewList.publicationStatus === 'Published' ? 'verified' : 'under_review'}`}>
                    {previewList.publicationStatus}
                  </span>
                </div>
                <h3 style={{ margin: '6px 0 0', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  {previewList.title}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                  Academic Session: {previewList.academicSession} · Approved Cutoff: JEE CRL &lt; {previewList.cutoffRank?.toLocaleString()}
                </p>
              </div>

              {previewList.publicationStatus !== 'Published' && (
                <button
                  type="button"
                  className="adm-btn-primary"
                  onClick={() => handleSimulatePublish(previewList)}
                  style={{ background: '#059669' }}
                >
                  <CheckCircle2 size={15} /> Certify &amp; Publish Merit List
                </button>
              )}
            </div>

            {/* Ranking Criteria Used Banner */}
            <div style={{ padding: '14px 18px', background: '#eff6ff', borderBottom: '1px solid #bfdbfe', fontSize: '0.76rem', color: '#1e40af' }}>
              <div style={{ fontWeight: 700, marginBottom: '2px' }}>Approved Ranking &amp; Tie-Breaking Formulation:</div>
              <div>{previewList.rankingCriteria}</div>
            </div>

            {/* Ranked Candidates Table */}
            <div className="adm-table-wrap">
              <table className="adm-data-table">
                <thead>
                  <tr>
                    <th>Merit Rank</th>
                    <th>Application ID</th>
                    <th>Candidate Legal Name</th>
                    <th>Qualifying Score / Rank</th>
                    <th>12th Marks (%)</th>
                    <th>Allotment &amp; Admission Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(previewList.topCandidates || []).map((cand) => (
                    <tr key={cand.appId}>
                      <td style={{ fontWeight: 800, fontSize: '0.9rem', color: cand.rank <= 3 ? '#d97706' : '#0f172a' }}>
                        #{cand.rank}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>
                        {cand.appId}
                      </td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>
                        {cand.name}
                      </td>
                      <td style={{ fontWeight: 600, color: '#334155' }}>
                        {cand.examRank}
                      </td>
                      <td style={{ fontWeight: 700, color: '#059669' }}>
                        {cand.marks12}
                      </td>
                      <td>
                        <span className="adm-status-tag selected" style={{ fontSize: '0.72rem' }}>
                          {cand.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '12px 18px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', color: '#64748b' }}>
              <span>Certified Authority: <strong>{previewList.approvedBy}</strong></span>
              <span>Publication Date: {previewList.publishedDate}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
