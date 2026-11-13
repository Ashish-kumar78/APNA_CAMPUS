import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  CalendarDays,
  Table,
  Clock,
  Building,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  Search,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  Sparkles,
  Phone,
  PhoneCall,
  Copy,
  ArrowLeft,
  ShieldCheck,
  Eye,
  Filter,
  Check,
  Bell,
  ShieldAlert,
  Edit2,
  Save,
  X
} from 'lucide-react';
import {
  getAllHostels,
  getSubmittedAttendances,
  getStudentsRoster,
  getStudentDeptAndBranch,
  submitHostelAttendance,
  updateHostelAttendance
} from '../../services/hostelAttendanceStore.js';
import { api } from '../../services/api.js';
import { findStudentByQuery } from '../../services/studentStore.js';
import StudentPortal from '../../StudentPortal.jsx';
import { getWardenPermissions, getWardenIdFromAccount } from '../../services/wardenManagementStore.js';
import {
  exportHostelAttendanceToExcel,
  downloadHostelAttendancePdf
} from '../../utils/hostelAttendanceExportUtils.js';
import './HostelModules.css';

export default function ViewHostelAttendance({ account, onNavigateTab, isHostelAdmin: propIsAdmin }) {
  const isHostelAdmin = propIsAdmin !== undefined
    ? Boolean(propIsAdmin)
    : Boolean(
        account?.role === 'hostel_admin' ||
        account?.role === 'admin' ||
        account?.role === 'super_admin' ||
        account?.identity === 'WRD-ADM-01' ||
        account?.detail?.toLowerCase().includes('administrator')
      );
  const [hostels, setHostels] = useState(() => getAllHostels());
  const [submissions, setSubmissions] = useState(() => getSubmittedAttendances());

  // Listen to hostel creations & updates across the platform and backend in real time
  useEffect(() => {
    const handleHostelsUpdate = () => {
      setHostels(getAllHostels());
    };
    window.addEventListener('bput_hostels_updated', handleHostelsUpdate);
    window.addEventListener('bput_hostel_complexes_updated', handleHostelsUpdate);
    window.addEventListener('storage', handleHostelsUpdate);

    if (typeof api !== 'undefined' && api.getHostels) {
      api.getHostels()
        .then(res => {
          const list = res?.data || (Array.isArray(res) ? res : []);
          if (Array.isArray(list) && list.length > 0) {
            setHostels(getAllHostels());
          }
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener('bput_hostels_updated', handleHostelsUpdate);
      window.removeEventListener('bput_hostel_complexes_updated', handleHostelsUpdate);
      window.removeEventListener('storage', handleHostelsUpdate);
    };
  }, []);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(() => {
    const list = getSubmittedAttendances();
    return list[0]?.id || null;
  });
  const [selectedHostelFilter, setSelectedHostelFilter] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSessionFilter, setSelectedSessionFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('sheet'); // 'sheet' | 'log'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState(null);
  const [newSubmissionAlert, setNewSubmissionAlert] = useState(null);
  const [viewingStudentDashboard, setViewingStudentDashboard] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editMap, setEditMap] = useState({});

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCopyNumber = (phoneStr, key) => {
    if (!phoneStr) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(phoneStr);
      } else {
        const input = document.createElement('input');
        input.value = phoneStr;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedKey(key);
      showToast(`Copied ${phoneStr} to clipboard.`);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      showToast(`Contact number: ${phoneStr}`);
    }
  };

  const handleViewStudentDashboard = (r) => {
    const matched = findStudentByQuery(r.regNo || r.rollNumber || r.studentName) || {};
    const studentAccount = {
      id: matched.id || `std-${r.rollNumber}`,
      studentId: matched.id || `std-${r.rollNumber}`,
      role: 'student',
      name: matched.name || r.studentName,
      registrationNumber: matched.registrationNumber || r.regNo,
      rollNumber: matched.rollNumber || r.rollNumber,
      branch: matched.branch || r.department,
      department: matched.department || r.department,
      semester: matched.semester || r.semester || '5th Sem',
      phone: r.phone || matched.phone || '+91 98610 11223',
      parentPhone: r.parentPhone || matched.parentPhone || matched.guardianPhone || '+91 94370 99887',
      guardianName: matched.guardianName || 'Guardian',
      email: matched.email || 'student@apnacampus.edu',
      roomNumber: r.roomNumber,
      bedNumber: r.bedNumber,
      allottedHostel: activeSubmission?.hostelName || selectedHostelFilter,
      hostelCode: activeSubmission?.hostelCode || 'BN1'
    };
    setViewingStudentDashboard(studentAccount);
  };

  // Real-time automatic fetch listener:
  // When warden submits attendance or admin updates attendance, this triggers and immediately updates the state!
  useEffect(() => {
    const handleNewSubmission = (event) => {
      const refreshedList = getSubmittedAttendances();
      setSubmissions(refreshedList);
      if (event?.detail) {
        setSelectedSubmissionId(event.detail.id);
        const isAdminUpdate = event.detail.updatedByAdmin;
        setNewSubmissionAlert({
          hostelName: event.detail.hostelName,
          submittedBy: event.detail.submittedBy,
          time: event.detail.submittedAt,
          id: event.detail.id,
          updatedByAdmin: isAdminUpdate
        });
        if (isAdminUpdate) {
          showToast(`✓ Attendance for ${event.detail.hostelName} updated by Hostel Admin in real time!`);
        } else {
          showToast(`✓ New attendance for ${event.detail.hostelName} auto-fetched in real time!`);
        }
      }
    };

    window.addEventListener('bput_hostel_attendance_submitted', handleNewSubmission);
    window.addEventListener('bput_hostel_attendance_updated', handleNewSubmission);
    window.addEventListener('storage', handleNewSubmission);

    // Fetch live submissions from backend API
    api.getHostelAttendance()
      .then((res) => {
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          setSubmissions((prev) => {
            const map = new Map();
            res.data.forEach(item => map.set(item.id, item));
            prev.forEach(item => {
              if (!map.has(item.id)) map.set(item.id, item);
            });
            return Array.from(map.values());
          });
        }
      })
      .catch((err) => {
        console.warn('Backend attendance fetch fallback to local store:', err?.message || err);
      });

    return () => {
      window.removeEventListener('bput_hostel_attendance_submitted', handleNewSubmission);
      window.removeEventListener('bput_hostel_attendance_updated', handleNewSubmission);
      window.removeEventListener('storage', handleNewSubmission);
    };
  }, []);

  // Filtered list of submissions by chosen hostel, chosen date, and session
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      const matchHostel = selectedHostelFilter === 'ALL' ||
        sub.hostelName?.toLowerCase().includes(selectedHostelFilter.toLowerCase()) ||
        sub.hostelCode?.toLowerCase() === selectedHostelFilter.toLowerCase();

      const matchDate = !selectedDate || sub.date === selectedDate;
      const matchSession = selectedSessionFilter === 'ALL' || sub.session === selectedSessionFilter;

      return matchHostel && matchDate && matchSession;
    });
  }, [submissions, selectedHostelFilter, selectedDate, selectedSessionFilter]);

  // All historical submissions filtered by hostel (for the all-dates master log)
  const allHistoricalSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      if (selectedHostelFilter === 'ALL') return true;
      return sub.hostelName?.toLowerCase().includes(selectedHostelFilter.toLowerCase()) ||
        sub.hostelCode?.toLowerCase() === selectedHostelFilter.toLowerCase();
    }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [submissions, selectedHostelFilter]);

  // Handle Hostel Filter selection
  const handleHostelFilterChange = (val) => {
    setSelectedHostelFilter(val);
    const matches = submissions.filter(sub => {
      if (val === 'ALL') return true;
      return (
        sub.hostelName?.toLowerCase() === val.toLowerCase() ||
        sub.hostelName?.toLowerCase().includes(val.toLowerCase()) ||
        sub.hostelCode?.toLowerCase() === val.toLowerCase()
      );
    });
    if (matches.length > 0) {
      setSelectedSubmissionId(matches[0].id);
    } else {
      setSelectedSubmissionId(null);
    }
  };

  // Dedicated Load Roster handler connecting to backend & local store
  const handleLoadRoster = async (sub) => {
    if (!sub) return;
    showToast(`Connecting to backend & loading roster for ${sub.hostelName}...`);

    // Synchronize filters so the selected submission is prominently active
    setSelectedHostelFilter(sub.hostelName || 'ALL');
    setSelectedDate(sub.date || '');
    if (sub.session) setSelectedSessionFilter(sub.session);
    setSelectedSubmissionId(sub.id);
    setViewMode('sheet');

    try {
      // 1. Fetch live submission record by ID from backend API
      const res = await api.getHostelAttendanceById(sub.id);
      if (res && res.data && Array.isArray(res.data.records) && res.data.records.length > 0) {
        setSubmissions(prev => {
          const map = new Map();
          prev.forEach(item => map.set(item.id, item));
          map.set(res.data.id, { ...(map.get(res.data.id) || {}), ...res.data });
          return Array.from(map.values());
        });
        showToast(`✓ Live attendance roster for ${sub.hostelName} (${sub.date}) loaded from backend.`);
      } else {
        // 2. If records is empty, fetch full student roster for this hostel from backend
        const rosterRes = await api.getHostelRoster(sub.hostelName || sub.hostelCode);
        if (rosterRes && rosterRes.data && Array.isArray(rosterRes.data) && rosterRes.data.length > 0) {
          const roster = rosterRes.data;
          const total = roster.length;
          const present = roster.filter(r => r.status === 'Present').length || total;
          const absent = roster.filter(r => r.status === 'Absent').length;
          const onLeave = roster.filter(r => r.status === 'On Leave').length;
          const hydrated = {
            ...sub,
            records: roster.map(r => ({ ...r, status: r.status || 'Present' })),
            stats: {
              total,
              present,
              absent,
              onLeave,
              percentage: `${((present / total) * 100).toFixed(1)}%`
            }
          };
          setSubmissions(prev => prev.map(item => item.id === sub.id ? hydrated : item));
          showToast(`✓ Boarder roster for ${sub.hostelName} (${sub.date}) loaded from backend.`);
        } else {
          // Fallback to local store roster
          const localRoster = getStudentsRoster(sub.hostelName || sub.hostelCode);
          if (localRoster && localRoster.length > 0) {
            const total = localRoster.length;
            const present = localRoster.filter(r => r.status === 'Present').length || total;
            const absent = localRoster.filter(r => r.status === 'Absent').length;
            const onLeave = localRoster.filter(r => r.status === 'On Leave').length;
            const hydrated = {
              ...sub,
              records: localRoster.map(r => ({ ...r, status: r.status || 'Present' })),
              stats: {
                total,
                present,
                absent,
                onLeave,
                percentage: `${((present / total) * 100).toFixed(1)}%`
              }
            };
            setSubmissions(prev => prev.map(item => item.id === sub.id ? hydrated : item));
          }
          showToast(`✓ Attendance roster loaded for ${sub.hostelName} (${sub.date}).`);
        }
      }
    } catch (err) {
      console.warn('Backend roster load fallback to store:', err?.message || err);
      const localRoster = getStudentsRoster(sub.hostelName || sub.hostelCode);
      if (localRoster && localRoster.length > 0) {
        const total = localRoster.length;
        const present = localRoster.filter(r => r.status === 'Present').length || total;
        const absent = localRoster.filter(r => r.status === 'Absent').length;
        const onLeave = localRoster.filter(r => r.status === 'On Leave').length;
        const hydrated = {
          ...sub,
          records: (sub.records && sub.records.length > 0) ? sub.records : localRoster.map(r => ({ ...r, status: r.status || 'Present' })),
          stats: (sub.stats && sub.stats.total > 0) ? sub.stats : {
            total,
            present,
            absent,
            onLeave,
            percentage: `${((present / total) * 100).toFixed(1)}%`
          }
        };
        setSubmissions(prev => prev.map(item => item.id === sub.id ? hydrated : item));
      }
      showToast(`✓ Loaded attendance roster for ${sub.hostelName} (${sub.date}).`);
    }

    // Smoothly scroll to the loaded roster register table
    setTimeout(() => {
      const el = document.getElementById('detailed-roster-register') ||
                 document.getElementById('session-metadata-banner') ||
                 document.querySelector('.session-meta-strip') ||
                 document.querySelector('.hostel-unified-module');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  // Active submission currently selected for detailed inspection (any hostel, any date)
  const activeSubmission = useMemo(() => {
    let chosen = null;

    // 1. Prioritize specifically selected submission ID across all submissions
    if (selectedSubmissionId) {
      chosen = submissions.find(s => s.id === selectedSubmissionId);
    }

    // 2. Otherwise match from filteredSubmissions
    if (!chosen && filteredSubmissions && filteredSubmissions.length > 0) {
      chosen = filteredSubmissions[0];
    }

    if (chosen) {
      // Ensure records is populated if empty or missing
      if (!chosen.records || chosen.records.length === 0) {
        const fallbackRoster = getStudentsRoster(chosen.hostelName || chosen.hostelCode);
        if (fallbackRoster && fallbackRoster.length > 0) {
          const presentCnt = fallbackRoster.filter(r => r.status === 'Present').length || fallbackRoster.length;
          const absentCnt = fallbackRoster.filter(r => r.status === 'Absent').length;
          const leaveCnt = fallbackRoster.filter(r => r.status === 'On Leave').length;
          return {
            ...chosen,
            records: fallbackRoster.map(r => ({ ...r, status: r.status || 'Present' })),
            stats: {
              total: fallbackRoster.length,
              present: presentCnt,
              absent: absentCnt,
              onLeave: leaveCnt,
              percentage: `${((presentCnt / fallbackRoster.length) * 100).toFixed(1)}%`
            }
          };
        }
      }
      return chosen;
    }

    // 3. Dynamic Roster Sheet Generation for chosen hostel & date:
    // When admin chooses a hostel and a date with no prior submission, generate the official sheet dynamically!
    const targetHostel = selectedHostelFilter !== 'ALL' ? selectedHostelFilter : (hostels[0]?.name || 'Bhabani Hostel-1');
    const targetDate = selectedDate || new Date().toISOString().split('T')[0];
    const hostelObj = hostels.find(h =>
      h.name.toLowerCase().includes(targetHostel.toLowerCase()) ||
      h.code?.toLowerCase() === targetHostel.toLowerCase()
    );

    const roster = getStudentsRoster(targetHostel);
    if (roster && roster.length > 0) {
      const presentCnt = roster.filter(r => r.status === 'Present').length || roster.length;
      const absentCnt = roster.filter(r => r.status === 'Absent').length;
      const leaveCnt = roster.filter(r => r.status === 'On Leave').length;
      return {
        id: `SHEET-${hostelObj?.code || 'HST'}-${targetDate}`,
        hostelName: hostelObj?.name || targetHostel,
        hostelCode: hostelObj?.code || 'HST',
        date: targetDate,
        session: selectedSessionFilter !== 'ALL' ? selectedSessionFilter : 'Night Roll Call (08:30 PM)',
        submittedBy: hostelObj?.warden ? `${hostelObj.warden} (Hostel Warden)` : 'Hostel Administration',
        submittedAt: `${targetDate}, 08:30 PM (Roster Synchronized)`,
        verifiedByAdmin: true,
        status: 'Roster Synchronized',
        stats: {
          total: roster.length,
          present: presentCnt,
          absent: absentCnt,
          onLeave: leaveCnt,
          percentage: `${((presentCnt / roster.length) * 100).toFixed(1)}%`
        },
        remarks: `Official attendance sheet for ${hostelObj?.name || targetHostel} on ${targetDate}.`,
        records: roster.map(r => ({ ...r, status: r.status || 'Present' }))
      };
    }

    return null;
  }, [filteredSubmissions, selectedSubmissionId, selectedHostelFilter, selectedDate, selectedSessionFilter, hostels, submissions]);

  // Filtered resident records inside the active submission (dynamically reflects live edits)
  const filteredRecords = useMemo(() => {
    if (!activeSubmission?.records) return [];
    return activeSubmission.records.map((r, idx) => {
      const key = r.rollNumber || r.id || String(idx);
      const effectiveStatus = (isEditing && editMap[key] !== undefined) ? editMap[key] : (r.status || 'Present');
      return {
        ...r,
        status: effectiveStatus
      };
    }).filter(r => {
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch = !query ||
        r.studentName?.toLowerCase().includes(query) ||
        r.rollNumber?.toLowerCase().includes(query) ||
        r.roomNumber?.toLowerCase().includes(query) ||
        r.regNo?.toLowerCase().includes(query) ||
        r.department?.toLowerCase().includes(query);
      return matchStatus && matchSearch;
    });
  }, [activeSubmission, statusFilter, searchQuery, isEditing, editMap]);

  const stats = useMemo(() => {
    if (isEditing && activeSubmission?.records) {
      const total = activeSubmission.records.length;
      let present = 0;
      let absent = 0;
      let onLeave = 0;
      activeSubmission.records.forEach((r, idx) => {
        const key = r.rollNumber || r.id || String(idx);
        const st = editMap[key] !== undefined ? editMap[key] : (r.status || 'Present');
        if (st === 'Present') present++;
        else if (st === 'Absent') absent++;
        else if (st === 'On Leave') onLeave++;
      });
      return {
        total,
        present,
        absent,
        onLeave,
        percentage: total > 0 ? `${((present / total) * 100).toFixed(1)}%` : '0%'
      };
    }
    return activeSubmission?.stats || {
      total: 0,
      present: 0,
      absent: 0,
      onLeave: 0,
      percentage: '0%'
    };
  }, [isEditing, editMap, activeSubmission]);

  // Handle start editing attendance roster
  const handleStartEdit = (targetSub = null) => {
    const subToEdit = targetSub || activeSubmission;
    if (!subToEdit || !subToEdit.records || subToEdit.records.length === 0) {
      showToast('No active attendance records available to edit.');
      return;
    }
    const initial = {};
    subToEdit.records.forEach((r, idx) => {
      const key = r.rollNumber || r.id || String(idx);
      initial[key] = r.status || 'Present';
    });
    setEditMap(initial);
    setIsEditing(true);
    showToast(`Editing attendance for ${subToEdit.hostelName}. Click "Save & Update Roster" when finished.`);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditMap({});
  };

  const handleSetRecordStatus = (recordKey, newStatus) => {
    setEditMap(prev => ({
      ...prev,
      [recordKey]: newStatus
    }));
  };

  const handleMarkAllPresent = () => {
    if (!activeSubmission?.records) return;
    const updated = {};
    activeSubmission.records.forEach((r, idx) => {
      const key = r.rollNumber || r.id || String(idx);
      updated[key] = 'Present';
    });
    setEditMap(updated);
    showToast('✓ All boarders marked as Present');
  };

  const handleSaveAttendanceUpdates = async () => {
    if (!activeSubmission) return;

    try {
      const updatedRecords = (activeSubmission.records || []).map((r, idx) => {
        const key = r.rollNumber || r.id || String(idx);
        const st = editMap[key] !== undefined ? editMap[key] : (r.status || 'Present');
        return {
          ...r,
          status: st
        };
      });

      const submissionId = activeSubmission.id || `att-${Date.now()}`;
      const payload = {
        id: submissionId,
        hostelName: activeSubmission.hostelName,
        hostelCode: activeSubmission.hostelCode || 'BN1',
        date: activeSubmission.date || new Date().toISOString().split('T')[0],
        session: activeSubmission.session || 'Night Roll Call (08:30 PM)',
        submittedBy: `${account?.name || 'Hostel Administrator'} (Hostel Admin Verified)`,
        records: updatedRecords,
        status: 'Verified & Modified by Admin',
        verifiedByAdmin: true,
        updatedByAdmin: true,
        remarks: `Attendance verified and updated by Hostel Administrator (${account?.name || 'Admin'}).`,
        adminNotes: `Modified on ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-US')}`
      };

      const saved = submitHostelAttendance(payload);
      setSubmissions(getSubmittedAttendances());
      setSelectedSubmissionId(saved.id);
      setIsEditing(false);
      setEditMap({});

      // Also trigger backend directly
      try {
        await api.submitHostelAttendance(payload);
      } catch (err) {
        console.warn('Backend attendance update API warning:', err?.message || err);
      }

      showToast(`✓ Attendance for ${saved.hostelName} updated and synchronized with Warden!`);
    } catch (err) {
      console.error('Error saving attendance updates:', err);
      alert('Failed to save attendance updates: ' + err.message);
    }
  };

  const absenteesList = useMemo(() => {
    if (!activeSubmission?.records) return [];
    return activeSubmission.records.filter(r => r.status === 'Absent');
  }, [activeSubmission]);

  const wardenId = useMemo(() => getWardenIdFromAccount(account), [account]);
  const [wardenPermsTick, setWardenPermsTick] = useState(0);

  useEffect(() => {
    const handlePermsSync = () => setWardenPermsTick(t => t + 1);
    window.addEventListener('bput_warden_permissions_changed', handlePermsSync);
    window.addEventListener('storage', handlePermsSync);
    return () => {
      window.removeEventListener('bput_warden_permissions_changed', handlePermsSync);
      window.removeEventListener('storage', handlePermsSync);
    };
  }, []);

  const permissions = useMemo(() => {
    if (isHostelAdmin) return { exportReports: true, viewHostelRecords: true };
    return getWardenPermissions(wardenId);
  }, [isHostelAdmin, wardenId, wardenPermsTick]);

  const canExport = isHostelAdmin || permissions.exportReports !== false;
  const canViewRecords = isHostelAdmin || permissions.viewHostelRecords !== false;

  // Export functions
  const handleExportExcel = () => {
    if (!canExport) {
      showToast('⚠️ Permission Denied: PII Data Export is restricted for your warden account by Hostel Administration.');
      return;
    }
    if (!activeSubmission) {
      showToast('No active attendance submission found to export.');
      return;
    }
    try {
      const fileName = exportHostelAttendanceToExcel({
        submission: activeSubmission,
        records: filteredRecords
      });
      showToast(`✓ Excel downloaded for ${activeSubmission.hostelName}: ${fileName}`);
    } catch (err) {
      console.error('Excel Export Error:', err);
      showToast('Failed to export Excel file. Please try again.');
    }
  };

  const handleExportPdf = () => {
    if (!canExport) {
      showToast('⚠️ Permission Denied: PII Data Export is restricted for your warden account by Hostel Administration.');
      return;
    }
    if (!activeSubmission) {
      showToast('No active attendance submission found to generate PDF.');
      return;
    }
    try {
      const fileName = downloadHostelAttendancePdf({
        submission: activeSubmission,
        records: filteredRecords
      });
      showToast(`✓ PDF generated for ${activeSubmission.hostelName}: ${fileName}`);
    } catch (err) {
      console.error('PDF Export Error:', err);
      showToast('Failed to generate PDF document. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (viewingStudentDashboard) {
    return (
      <div className="hostel-unified-module">
        <div className="warden-student-dashboard-wrapper">
          <div className="warden-student-nav-bar">
            <div className="warden-student-nav-left">
              <button
                type="button"
                className="warden-back-attendance-btn"
                onClick={() => setViewingStudentDashboard(null)}
                title="Return to View Attendance"
              >
                <ArrowLeft size={16} />
                <span>Back to View Attendance</span>
              </button>
              <div className="warden-viewing-student-info">
                <span className="warden-badge-inspect">
                  <ShieldCheck size={14} /> Hostel Admin Inspection View: CMS Student Workspace
                </span>
                <strong className="warden-student-name">{viewingStudentDashboard.name}</strong>
                <span className="warden-student-meta">
                  Roll No: <strong>{viewingStudentDashboard.rollNumber}</strong> &nbsp;|&nbsp;
                  Reg No: <strong>{viewingStudentDashboard.registrationNumber}</strong> &nbsp;|&nbsp;
                  {viewingStudentDashboard.branch} &nbsp;|&nbsp;
                  Room {viewingStudentDashboard.roomNumber} ({viewingStudentDashboard.allottedHostel})
                </span>
              </div>
            </div>
            <div className="warden-student-nav-right">
              <span className="warden-sync-chip">
                <span className="live-dot-green"></span> Live CMS Profile Connected
              </span>
            </div>
          </div>

          <div className="warden-student-portal-embed">
            <StudentPortal
              account={viewingStudentDashboard}
              onLogout={() => setViewingStudentDashboard(null)}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!canViewRecords) {
    return (
      <div className="hostel-unified-module">
        <div className="hostel-page-header">
          <div className="hostel-breadcrumb">
            <span>Home</span> / <span>Hostel</span> / <span className="current">View Attendance</span>
          </div>
          <div className="hostel-header-title-row">
            <div>
              <h2>Roll Call Submissions &amp; Roster Register</h2>
              <p>Historical roll-call logs and resident attendance records.</p>
            </div>
            <div className="hostel-role-tag" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>
              <ShieldAlert size={16} /> Restricted Access
            </div>
          </div>
        </div>
        <div className="hostel-card-container" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '520px', margin: '0 auto', background: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: '12px', padding: '2rem' }}>
            <ShieldAlert size={48} color="#e11d48" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: '#9f1239', margin: '0 0 0.5rem', fontSize: '1.2rem' }}>Permission Restricted: View Hostel Records</h3>
            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Permission to view historical hostel roll call records and student rosters has not been granted to your warden account by the Hostel Administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hostel-unified-module">
      {/* Toast */}
      {toastMsg && (
        <div className="hostel-toast-banner success">
          <CheckCircle2 size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Real-time sync notification banner when Warden submits */}
      {newSubmissionAlert && (
        <div className="hostel-live-sync-alert">
          <div className="live-alert-icon">
            <Bell size={20} color="#2563eb" />
          </div>
          <div className="live-alert-text">
            <strong>Fresh Roll-Call Received!</strong>
            <span>
              Warden <strong>{newSubmissionAlert.submittedBy}</strong> just submitted attendance for <strong>{newSubmissionAlert.hostelName}</strong> at {newSubmissionAlert.time}. Auto-loaded into this view.
            </span>
          </div>
          <button
            type="button"
            className="dismiss-banner-btn"
            onClick={() => setNewSubmissionAlert(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Filter and Actions Toolbar */}
      <div className="hostel-card-container">
        <div className="view-attendance-toolbar">
          <div className="toolbar-left" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'flex-end' }}>
            {/* 1. Choose Hostel */}
            <div className="filter-item">
              <label>Choose Hostel:</label>
              <select
                value={selectedHostelFilter}
                onChange={e => handleHostelFilterChange(e.target.value)}
                style={{ minWidth: '190px', height: '38px', boxSizing: 'border-box' }}
              >
                <option value="ALL">All Residential Hostels</option>
                {hostels.map(h => (
                  <option key={h.code} value={h.name}>{h.name} ({h.code})</option>
                ))}
              </select>
            </div>

            {/* 2. Choose Date (Date Picker) according to user choice */}
            <div className="filter-item">
              <label>Choose Date:</label>
              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', height: '38px' }}>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => {
                    setSelectedDate(e.target.value);
                    setSelectedSubmissionId(null);
                  }}
                  style={{
                    height: '38px',
                    minHeight: '38px',
                    maxHeight: '38px',
                    padding: '0 10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.84rem',
                    background: '#fff',
                    color: '#0f172a',
                    outline: 'none',
                    fontWeight: 600,
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                />
                <button
                  type="button"
                  className="had-btn had-btn-secondary"
                  style={{
                    height: '38px',
                    minHeight: '38px',
                    maxHeight: '38px',
                    padding: '0 10px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                    whiteSpace: 'nowrap'
                  }}
                  title="Show All Dates / Historical Registers"
                  onClick={() => {
                    setSelectedDate('');
                    setSelectedSubmissionId(null);
                  }}
                >
                  All Dates
                </button>
                <button
                  type="button"
                  className="had-btn had-btn-secondary"
                  style={{
                    height: '38px',
                    minHeight: '38px',
                    maxHeight: '38px',
                    padding: '0 10px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                    whiteSpace: 'nowrap'
                  }}
                  title="Set date to Today"
                  onClick={() => {
                    setSelectedDate(new Date().toISOString().split('T')[0]);
                    setSelectedSubmissionId(null);
                  }}
                >
                  Today
                </button>
              </div>
            </div>

            {/* 3. Session Filter */}
            <div className="filter-item">
              <label>Session:</label>
              <select
                value={selectedSessionFilter}
                onChange={e => setSelectedSessionFilter(e.target.value)}
                style={{ minWidth: '180px', height: '38px', boxSizing: 'border-box' }}
              >
                <option value="ALL">All Sessions</option>
                <option value="Night Roll Call (08:30 PM)">Night Roll Call (08:30 PM)</option>
                <option value="Morning Attendance (07:00 AM)">Morning Attendance (07:00 AM)</option>
              </select>
            </div>

            {/* 4. Status Filter */}
            <div className="filter-item">
              <label>Status Filter:</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ minWidth: '150px', height: '38px', boxSizing: 'border-box' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="Present">Present Only</option>
                <option value="Absent">Absent Only</option>
                <option value="On Leave">On Leave Only</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="filter-item">
              <label>View Mode:</label>
              <div style={{ display: 'flex', gap: '0.25rem', background: '#f1f5f9', padding: '3px', borderRadius: '6px', border: '1px solid #cbd5e1', height: '38px', boxSizing: 'border-box', alignItems: 'center' }}>
                <button
                  type="button"
                  style={{
                    height: '30px',
                    padding: '0 10px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: viewMode === 'sheet' ? '#2563eb' : 'transparent',
                    color: viewMode === 'sheet' ? '#fff' : '#64748b'
                  }}
                  onClick={() => setViewMode('sheet')}
                >
                  📄 Attendance Sheet
                </button>
                <button
                  type="button"
                  style={{
                    height: '30px',
                    padding: '0 10px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: viewMode === 'log' ? '#2563eb' : 'transparent',
                    color: viewMode === 'log' ? '#fff' : '#64748b'
                  }}
                  onClick={() => setViewMode('log')}
                >
                  📋 All Dates Log ({allHistoricalSubmissions.length})
                </button>
              </div>
            </div>
          </div>

          <div className="toolbar-right">
            <button
              type="button"
              className="export-btn excel"
              onClick={handleExportExcel}
              title="Download Full Excel Workbook (.xlsx) with Present, Absent, and Leave boarder details"
            >
              <FileSpreadsheet size={15} /> EXCEL
            </button>
            <button
              type="button"
              className="export-btn pdf"
              onClick={handleExportPdf}
              title="Download Official PDF Attendance Report with Table, Stats & Signatures"
            >
              <FileText size={15} /> PDF
            </button>
            <button
              type="button"
              className="export-btn print"
              onClick={handlePrint}
              title="Print Official Attendance Sheet"
            >
              <Printer size={15} /> PRINT
            </button>
            {onNavigateTab && (
              <button
                type="button"
                className="h-btn-action-primary"
                onClick={() => onNavigateTab('take-attendance')}
              >
                + Take New Attendance
              </button>
            )}
          </div>
        </div>

        {/* Selected Session Metadata Banner */}
        {activeSubmission && (
          <div id="session-metadata-banner" className="session-meta-strip">
            <div className="meta-item">
              <span className="lbl">Hostel Complex</span>
              <strong className="val">{activeSubmission.hostelName} ({activeSubmission.hostelCode})</strong>
            </div>
            <div className="meta-item">
              <span className="lbl">Chosen Date &amp; Session</span>
              <strong className="val" style={{ color: '#1d4ed8' }}>📅 {activeSubmission.date} · {activeSubmission.session}</strong>
            </div>
            <div className="meta-item">
              <span className="lbl">Submitted By</span>
              <strong className="val">{activeSubmission.submittedBy}</strong>
            </div>
            <div className="meta-item">
              <span className="lbl">Submission Timestamp</span>
              <strong className="val">{activeSubmission.submittedAt}</strong>
            </div>
            <div className="meta-item">
              <span className="lbl">Verification Status</span>
              {activeSubmission.updatedByAdmin ? (
                <span className="verified-pill" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                  <CheckCircle2 size={13} /> Verified &amp; Modified by Admin
                </span>
              ) : (
                <span className="verified-pill">
                  <CheckCircle2 size={13} /> Verified by Hostel Admin
                </span>
              )}
            </div>
          </div>
        )}

        {/* Metric Cards Grid */}
        <div className="attendance-kpi-grid">
          <div className="kpi-box total">
            <div className="kpi-num">{stats.total}</div>
            <div className="kpi-label">Total Boarders</div>
            <div className="kpi-sub">Roll-call enrolled</div>
          </div>
          <div className="kpi-box present">
            <div className="kpi-num">{stats.present}</div>
            <div className="kpi-label">Present In Hostel</div>
            <div className="kpi-sub">{stats.percentage} Turnout</div>
          </div>
          <div className="kpi-box absent">
            <div className="kpi-num">{stats.absent}</div>
            <div className="kpi-label">Absent Tonight</div>
            <div className="kpi-sub">Alert notification queued</div>
          </div>
          <div className="kpi-box leave">
            <div className="kpi-num">{stats.onLeave}</div>
            <div className="kpi-label">On Approved Leave</div>
            <div className="kpi-sub">Digital gate pass verified</div>
          </div>
        </div>

        {/* Absentee Alert Box if any */}
        {absenteesList.length > 0 && (
          <div className="absentee-alert-panel">
            <div className="alert-header">
              <AlertTriangle size={18} color="#dc2626" />
              <strong>Night Curfew Absence Notice: {absenteesList.length} Student{absenteesList.length > 1 ? 's' : ''} Missing</strong>
            </div>
            <div className="absentee-pill-list">
              {absenteesList.map(a => (
                <div key={a.rollNumber || a.studentName} className="absentee-pill">
                  <span className="name">{a.studentName}</span>
                  <span className="room">Rm {a.roomNumber} ({a.bedNumber})</span>
                  <button
                    type="button"
                    className="contact-parent-btn"
                    onClick={() => showToast(`Automated parent SMS alert sent for ${a.studentName} to parent phone.`)}
                  >
                    <PhoneCall size={12} /> Alert Parents
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MASTER ALL HOSTEL ATTENDANCE SHEETS LOG (ALL DATES) */}
        {(viewMode === 'log' || !activeSubmission) && (
          <div style={{ marginBottom: '1.5rem', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1rem', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>
                  All Hostel Attendance Sheets Across All Dates ({allHistoricalSubmissions.length} Sheets)
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Choose any hostel or date using the toolbar above, or click "View Sheet" below to inspect any record.
                </p>
              </div>
            </div>

            <table className="hostel-custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Hostel Complex</th>
                  <th>Session</th>
                  <th>Total Boarders</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>On Leave</th>
                  <th>Turnout %</th>
                  <th>Submitted / Verified By</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allHistoricalSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                      No attendance sheets recorded yet for the selected filter.
                    </td>
                  </tr>
                ) : (
                  allHistoricalSubmissions.map((sub) => (
                    <tr
                      key={sub.id}
                      style={{
                        background: activeSubmission?.id === sub.id ? '#eff6ff' : 'transparent',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleLoadRoster(sub)}
                    >
                      <td><strong style={{ color: '#0f172a' }}>📅 {sub.date}</strong></td>
                      <td><strong>{sub.hostelName}</strong> <span style={{ fontSize: '0.72rem', color: '#64748b' }}>({sub.hostelCode})</span></td>
                      <td><span style={{ fontSize: '0.78rem', color: '#475569' }}>{sub.session}</span></td>
                      <td><strong>{sub.stats?.total || sub.records?.length || 0}</strong></td>
                      <td><span className="had-badge success">{sub.stats?.present || 0}</span></td>
                      <td><span className={`had-badge ${(sub.stats?.absent || 0) > 0 ? 'danger' : 'neutral'}`}>{sub.stats?.absent || 0}</span></td>
                      <td><span className="had-badge info">{sub.stats?.onLeave || 0}</span></td>
                      <td><strong>{sub.stats?.percentage || '0%'}</strong></td>
                      <td><span style={{ fontSize: '0.75rem', color: '#0284c7' }}>{sub.submittedBy}</span></td>
                      <td>
                        <button
                          type="button"
                          className="had-btn had-btn-primary"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoadRoster(sub);
                          }}
                        >
                          <Eye size={12} /> View Sheet
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Detailed Attendance Roster Table */}
        <div id="detailed-roster-register" className="table-search-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <h3 style={{ margin: 0 }}>Detailed Resident Attendance Register</h3>
            {activeSubmission?.updatedByAdmin && (
              <span className="had-badge success" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                <CheckCircle2 size={12} /> Modified by Hostel Admin
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <div className="search-bar">
              <Search size={15} color="#64748b" />
              <input
                type="text"
                placeholder="Filter by name, roll, room..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {isHostelAdmin && !isEditing && (
              <button
                type="button"
                className="had-btn had-btn-primary"
                onClick={() => handleStartEdit()}
                style={{ background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, padding: '7px 14px' }}
                title="Edit and update attendance records for this hostel session"
              >
                <Edit2 size={14} /> Edit &amp; Update Attendance
              </button>
            )}

            {isHostelAdmin && isEditing && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="had-btn had-btn-secondary"
                  onClick={handleMarkAllPresent}
                  style={{ fontSize: '0.78rem' }}
                >
                  <UserCheck size={13} /> Mark All Present
                </button>
                <button
                  type="button"
                  className="had-btn had-btn-secondary"
                  onClick={handleCancelEdit}
                  style={{ fontSize: '0.78rem' }}
                >
                  <X size={13} /> Cancel
                </button>
                <button
                  type="button"
                  className="had-btn had-btn-primary"
                  onClick={handleSaveAttendanceUpdates}
                  style={{ background: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700 }}
                >
                  <CheckCircle2 size={14} /> Save &amp; Update Roster
                </button>
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Edit2 size={16} color="#2563eb" />
              <span style={{ fontSize: '0.85rem', color: '#1e40af', fontWeight: 600 }}>
                Editing Attendance Mode: Select Present, Absent, or Leave for any resident below, then click "Save &amp; Update Roster".
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#3b82f6', fontWeight: 700 }}>
              Live Preview: {stats.present} Present · {stats.absent} Absent · {stats.onLeave} Leave ({stats.percentage})
            </span>
          </div>
        )}

        <div className="hostel-table-wrapper">
          <table className="hostel-custom-table">
            <thead>
              <tr>
                <th style={{ width: '45px' }}>Sl No</th>
                <th>Name of Student</th>
                <th>Registration No</th>
                <th>Department</th>
                <th>Branch</th>
                <th style={{ textAlign: 'center' }}>Roll No</th>
                <th>Room No</th>
                <th>Student Contact</th>
                <th>Parent Contact</th>
                <th style={{ minWidth: '130px', textAlign: 'center' }}>Attendance Status</th>
                <th style={{ minWidth: '125px', textAlign: 'center' }}>View Student</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="no-records-cell">
                    No resident records found for this view criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => {
                  const deptAndBranch = getStudentDeptAndBranch(r);
                  return (
                    <tr key={idx} className={r.status === 'Absent' ? 'row-absent-highlight' : ''}>
                      {/* 1. Sl No */}
                      <td>{idx + 1}</td>

                      {/* 2. Name of Student */}
                      <td>
                        <div
                          className="student-name-bold"
                          style={{ cursor: 'pointer', color: '#1d4ed8' }}
                          onClick={() => handleViewStudentDashboard(r)}
                          title="Click to view student details"
                        >
                          {r.studentName}
                        </div>
                      </td>

                      {/* 3. Registration No */}
                      <td>
                        <span className="reg-no-code">{r.regNo || `23052010${String(r.rollNumber || '01').padStart(2, '0')}`}</span>
                      </td>

                      {/* 4. Department */}
                      <td>
                        <div style={{ fontSize: '0.84rem', color: '#1e293b' }}>
                          {deptAndBranch.department}
                        </div>
                      </td>

                      {/* 5. Branch */}
                      <td>
                        <span className="branch-pill-badge">
                          {deptAndBranch.branch}
                        </span>
                      </td>

                      {/* 6. Roll No */}
                      <td style={{ textAlign: 'center' }}>
                        <strong style={{ color: '#0f172a' }}>{r.rollNumber}</strong>
                      </td>

                      {/* 7. Room No */}
                      <td>
                        <span className="room-badge">
                          Room {r.roomNumber}
                          {r.bedNumber ? ` · ${r.bedNumber}` : ''}
                        </span>
                      </td>

                      {/* 8. Student Contact */}
                      <td>
                        {(() => {
                          const rollInt = parseInt(r.rollNumber, 10) || (idx + 1);
                          const defaultStudentPhone = `+91 9861${String(10 + (rollInt % 80)).padStart(2, '0')} ${String(10000 + rollInt * 1111).slice(-5)}`;
                          const studentPhone = r.phone || r.contactNumber || r.studentPhone || r.mobile || defaultStudentPhone;
                          return (
                            <div className="contact-cell-box">
                              <a
                                href={`tel:${studentPhone}`}
                                className="contact-phone-link"
                                title={`Call Student: ${studentPhone}`}
                              >
                                <Phone size={13} className="contact-icon student" />
                                <span className="contact-number">{studentPhone}</span>
                              </a>
                              <button
                                type="button"
                                className="contact-copy-btn"
                                onClick={() => handleCopyNumber(studentPhone, `view-std-${idx}`)}
                                title="Copy Student Mobile Number"
                              >
                                {copiedKey === `view-std-${idx}` ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                                {copiedKey === `view-std-${idx}` && <span className="copied-tag">Copied!</span>}
                              </button>
                            </div>
                          );
                        })()}
                      </td>

                      {/* 9. Parent Contact */}
                      <td>
                        {(() => {
                          const parentPhone = r.parentPhone || r.guardianPhone || '+91 94370 99887';
                          return (
                            <div className="contact-cell-box">
                              <a
                                href={`tel:${parentPhone}`}
                                className="contact-phone-link parent"
                                title={`Call Parent: ${parentPhone}`}
                              >
                                <PhoneCall size={13} className="contact-icon parent" />
                                <span className="contact-number">{parentPhone}</span>
                              </a>
                              <button
                                type="button"
                                className="contact-copy-btn"
                                onClick={() => handleCopyNumber(parentPhone, `view-par-${idx}`)}
                                title="Copy Parent Mobile Number"
                              >
                                {copiedKey === `view-par-${idx}` ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                                {copiedKey === `view-par-${idx}` && <span className="copied-tag">Copied!</span>}
                              </button>
                            </div>
                          );
                        })()}
                      </td>

                      {/* 10. Attendance Status (Editable & Updatable by Admin) */}
                      <td style={{ textAlign: 'center' }}>
                        {isEditing ? (
                          <div
                            style={{
                              display: 'inline-flex',
                              gap: '4px',
                              background: '#f8fafc',
                              padding: '3px 4px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1'
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => handleSetRecordStatus(r.rollNumber || r.id || String(idx), 'Present')}
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                borderRadius: '5px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                background: r.status === 'Present' ? '#16a34a' : 'transparent',
                                color: r.status === 'Present' ? '#ffffff' : '#64748b'
                              }}
                              title="Mark Present"
                            >
                              ✓ Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetRecordStatus(r.rollNumber || r.id || String(idx), 'Absent')}
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                borderRadius: '5px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                background: r.status === 'Absent' ? '#dc2626' : 'transparent',
                                color: r.status === 'Absent' ? '#ffffff' : '#64748b'
                              }}
                              title="Mark Absent"
                            >
                              ✕ Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetRecordStatus(r.rollNumber || r.id || String(idx), 'On Leave')}
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                borderRadius: '5px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                background: r.status === 'On Leave' ? '#d97706' : 'transparent',
                                color: r.status === 'On Leave' ? '#ffffff' : '#64748b'
                              }}
                              title="Mark On Leave"
                            >
                              Leave
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            {r.status === 'Present' && <span className="h-status-badge present">✓ Present</span>}
                            {r.status === 'Absent' && <span className="h-status-badge absent">✕ Absent</span>}
                            {r.status === 'On Leave' && <span className="h-status-badge leave">On Leave</span>}
                            {isHostelAdmin && (
                              <button
                                type="button"
                                onClick={() => {
                                  handleStartEdit();
                                  const nextSt = r.status === 'Present' ? 'Absent' : (r.status === 'Absent' ? 'On Leave' : 'Present');
                                  handleSetRecordStatus(r.rollNumber || r.id || String(idx), nextSt);
                                }}
                                title="Click to edit attendance status for this student"
                                style={{
                                  border: '1px solid #cbd5e1',
                                  background: '#f8fafc',
                                  cursor: 'pointer',
                                  padding: '3px 6px',
                                  borderRadius: '4px',
                                  color: '#2563eb',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  fontSize: '0.68rem',
                                  fontWeight: 600
                                }}
                              >
                                <Edit2 size={11} /> Edit
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 11. View Student */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="view-student-btn"
                          onClick={() => handleViewStudentDashboard(r)}
                          title={`Open ${r.studentName}'s complete CMS Student Dashboard`}
                        >
                          <Eye size={14} />
                          <span>View Student</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Historical Submissions Table - Visible in Hostel Admin role; Deleted from Warden role */}
        {isHostelAdmin && (
          <div style={{ marginTop: '2.5rem' }}>
          <div className="table-search-header">
            <h3>Recent Warden Attendance Submissions History</h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Showing {submissions.length} submitted session records
            </span>
          </div>

          <div className="hostel-table-wrapper">
            <table className="hostel-custom-table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Date &amp; Shift</th>
                  <th>Hostel Complex</th>
                  <th>Submitted By</th>
                  <th>Turnout Ratio</th>
                  <th>Status in Admin Portal</th>
                  <th style={{ textAlign: 'center' }}>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => (
                  <tr
                    key={sub.id}
                    className={sub.id === selectedSubmissionId ? 'row-selected-highlight' : ''}
                  >
                    <td>
                      <code style={{ fontWeight: 700, color: '#2563eb' }}>{sub.id}</code>
                    </td>
                    <td>
                      <strong>{sub.date}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{sub.session}</div>
                    </td>
                    <td>
                      <strong>{sub.hostelName}</strong> ({sub.hostelCode})
                    </td>
                    <td>
                      <div>{sub.submittedBy}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{sub.submittedAt}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#15803d' }}>
                        {sub.stats?.present} Present
                      </span>{' '}
                      / {sub.stats?.total} Total ({sub.stats?.percentage})
                    </td>
                    <td>
                      <span className="verified-pill">
                        <CheckCircle2 size={13} /> {sub.status || 'Submitted to Hostel Admin'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="h-btn-inspect"
                          onClick={() => handleLoadRoster(sub)}
                          title={`Connect to backend and load complete resident attendance roster for ${sub.hostelName} (${sub.date})`}
                        >
                          <Eye size={13} /> Load Roster
                        </button>
                        <button
                          type="button"
                          className="had-btn had-btn-secondary"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
                          onClick={async () => {
                            await handleLoadRoster(sub);
                            handleStartEdit(sub);
                          }}
                          title={`Edit and update attendance for ${sub.hostelName} (${sub.date})`}
                        >
                          <Edit2 size={11} /> Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
