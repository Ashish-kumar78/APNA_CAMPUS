import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  TrendingUp,
  Download,
  Filter,
  Eye,
  Award,
  Layers,
  CheckCircle2,
  Receipt,
  Users,
} from 'lucide-react';

export default function ReportsAnalyticsTab({
  courses = [],
  applicants = [],
}) {
  const [selectedReportKey, setSelectedReportKey] = useState('course_conversion');
  const [sessionFilter, setSessionFilter] = useState('2026-2027');
  const [courseFilter, setCourseFilter] = useState('All');

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        `"Report: ${selectedReportKey.toUpperCase()} (Session ${sessionFilter})"`,
        'Course Code,Course Name,Approved Intake,Applications Received,Eligible Pool,Allotted,Confirmed Enrolled,Vacancies,Conversion Rate',
        ...courses.map(
          (c) =>
            `"${c.code}","${c.name}",${c.approvedIntake},${c.applicationsReceived},${c.eligibleApplicants},${c.seatsAllotted},${c.confirmedAdmissions},${c.vacantSeats},"${Math.round(
              (c.confirmedAdmissions / c.applicationsReceived) * 100
            )}%"`
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `admission_report_${selectedReportKey}_${sessionFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Title & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 700, color: '#0f172a' }}>
            Admission Reports &amp; Institutional Analytics
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Comprehensive analytics on application conversion rates, document scrutiny yields, fee realizations, and demographic sources.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="adm-btn-secondary" onClick={handleExportCSV}>
            <Download size={15} /> Download CSV
          </button>
          <button type="button" className="adm-btn-secondary" onClick={handlePrint}>
            <Printer size={15} /> Print Report
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="adm-filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="#64748b" />
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>Report Configuration:</span>
        </div>

        <div className="adm-filter-group">
          {/* Select Report Type */}
          <select
            className="adm-select-control"
            value={selectedReportKey}
            onChange={(e) => setSelectedReportKey(e.target.value)}
          >
            <option value="course_conversion">Course-Wise Applications &amp; Conversion Rates</option>
            <option value="doc_scrutiny">Document Scrutiny &amp; Verification Summary</option>
            <option value="seat_occupancy">Seat Occupancy &amp; Vacancy Audit</option>
            <option value="fee_reconciliation">Fee Verification &amp; Inflow Summary</option>
            <option value="entrance_demographics">Application Source &amp; Entrance Analysis</option>
          </select>

          {/* Academic Session */}
          <select
            className="adm-select-control"
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
          >
            <option value="2026-2027">Session 2026-2027 (Active)</option>
            <option value="2025-2026">Session 2025-2026 (Archived)</option>
          </select>

          {/* Course */}
          <select
            className="adm-select-control"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="All">All Programs</option>
            {courses.map((c) => (
              <option key={c.id} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* REPORT 1: COURSE CONVERSION REPORT */}
      {selectedReportKey === 'course_conversion' && (
        <div className="adm-panel-box">
          <div className="adm-panel-header">
            <div>
              <h3 className="adm-panel-title">
                <TrendingUp size={18} color="#0284c7" /> Course-Wise Application to Enrollment Conversion
              </h3>
              <p className="adm-panel-desc">
                Analyzing intake conversion from applicant inquiry to seat confirmation
              </p>
            </div>
            <span className="adm-badge-pill green">Institutional Average: 45.1%</span>
          </div>

          <div className="adm-table-wrap">
            <table className="adm-data-table">
              <thead>
                <tr>
                  <th>Academic Course</th>
                  <th>Approved Intake</th>
                  <th>Applications</th>
                  <th>Eligible Pool</th>
                  <th>Allotted Seats</th>
                  <th>Confirmed Enrollments</th>
                  <th>Vacancy</th>
                  <th>Inquiry-to-Enrollment Yield</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => {
                  const yieldPct = Math.round((c.confirmedAdmissions / c.applicationsReceived) * 100);
                  const occupancyPct = Math.round((c.confirmedAdmissions / c.approvedIntake) * 100);

                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.name}</div>
                        <div style={{ fontSize: '0.71rem', color: '#64748b' }}>{c.code} · {c.degree}</div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{c.approvedIntake}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: '#0284c7' }}>{c.applicationsReceived}</td>
                      <td style={{ textAlign: 'center', color: '#059669' }}>{c.eligibleApplicants}</td>
                      <td style={{ textAlign: 'center', color: '#7c3aed', fontWeight: 700 }}>{c.seatsAllotted}</td>
                      <td style={{ textAlign: 'center', fontWeight: 800 }}>{c.confirmedAdmissions}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: c.vacantSeats > 0 ? '#b45309' : '#64748b' }}>
                        {c.vacantSeats}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#0284c7', minWidth: '38px' }}>
                            {yieldPct}%
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            ({occupancyPct}% of capacity)
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 2: DOCUMENT SCRUTINY SUMMARY */}
      {selectedReportKey === 'doc_scrutiny' && (
        <div className="adm-panel-box">
          <div className="adm-panel-header">
            <div>
              <h3 className="adm-panel-title">
                <CheckCircle2 size={18} color="#059669" /> Document Scrutiny &amp; Verification Audit
              </h3>
              <p className="adm-panel-desc">Scrutiny yield, resubmission flags, and certificate authentication breakdown</p>
            </div>
            <span className="adm-badge-pill green">97.3% Scrutiny Clearance</span>
          </div>

          <div className="adm-panel-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>VERIFIED CERTIFICATES</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
                  1,180 Dossiers
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                  Class 10, 12, Rank Cards &amp; Aadhaar cross-verified with DigiLocker.
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>FLAGGED RESUBMISSIONS</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706', marginTop: '6px' }}>
                  29 Files
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                  Blurry marksheet scans or missing migration certificates notified to applicants.
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>REJECTED / UNMET</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#e11d48', marginTop: '6px' }}>
                  240 Applications
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                  Prerequisites below threshold or ineligible board streams.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 3: SEAT OCCUPANCY REPORT */}
      {selectedReportKey === 'seat_occupancy' && (
        <div className="adm-panel-box">
          <div className="adm-panel-header">
            <div>
              <h3 className="adm-panel-title">
                <Layers size={18} color="#0284c7" /> Seat Occupancy &amp; Remaining Vacancy Analysis
              </h3>
              <p className="adm-panel-desc">Audit of 720 approved institutional intake seats</p>
            </div>
            <span className="adm-badge-pill green">88.9% Institutional Fill</span>
          </div>

          <div className="adm-panel-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>Computer &amp; Emerging Tech</div>
                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  CSE: 172/180 (95.5%) · AIML: 114/120 (95.0%)
                </div>
                <div style={{ fontWeight: 800, color: '#059669', marginTop: '6px' }}>14 Vacant Total</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>Electrical &amp; Electronics</div>
                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  ECE: 104/120 (86.7%) · EEE: 74/90 (82.2%)
                </div>
                <div style={{ fontWeight: 800, color: '#0284c7', marginTop: '6px' }}>32 Vacant Total</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>Mechanical &amp; Post-Grad</div>
                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  MECH: 68/90 (75.5%) · MBA: 58/60 (96.7%) · MCA: 50/60 (83.3%)
                </div>
                <div style={{ fontWeight: 800, color: '#d97706', marginTop: '6px' }}>34 Vacant Total</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 4: FEE RECONCILIATION SUMMARY */}
      {selectedReportKey === 'fee_reconciliation' && (
        <div className="adm-panel-box">
          <div className="adm-panel-header">
            <div>
              <h3 className="adm-panel-title">
                <Receipt size={18} color="#059669" /> Fee Verification &amp; Inflow Realization Report
              </h3>
              <p className="adm-panel-desc">Realized tuition, development fees, and pending balances</p>
            </div>
            <span className="adm-badge-pill green">Reconciliation: 94.8%</span>
          </div>

          <div className="adm-panel-body">
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', lineHeight: '1.6' }}>
              For Academic Session 2026–2027, total verified admission fee inflow realized across all 640 confirmed candidates stands at <strong>₹7.18 Crore</strong>, reconciled with the College State Bank of India primary collection account. 45 Round 2 provisional allottee payments (estimated ₹51.75 Lakhs) remain in verification queue awaiting final RTGS UTR bank advices.
            </p>
          </div>
        </div>
      )}

      {/* REPORT 5: ENTRANCE DEMOGRAPHICS */}
      {selectedReportKey === 'entrance_demographics' && (
        <div className="adm-panel-box">
          <div className="adm-panel-header">
            <div>
              <h3 className="adm-panel-title">
                <Users size={18} color="#7c3aed" /> Entrance Examination Source &amp; Domicile Analysis
              </h3>
              <p className="adm-panel-desc">Quota yields and entrance pipeline distribution</p>
            </div>
          </div>

          <div className="adm-panel-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0284c7' }}>OJEE State Merit Quota (85%)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>960 Applicants</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Home State Odisha candidates</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#059669' }}>JEE Main All-India Quota (15%)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>340 Applicants</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Pan-India engineering aspirants</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#7c3aed' }}>Management / Direct PG Quota</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>120 Applicants</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>MAT / CAT / Lateral Entry</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
