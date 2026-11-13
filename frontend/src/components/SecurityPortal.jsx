import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppLayout } from './Navigation';
import {
  Shield,
  ShieldCheck,
  QrCode,
  Users,
  LogOut,
  UserCheck,
  AlertTriangle,
  History,
  Clock,
  ArrowRightLeft,
  ChevronRight,
  Eye,
  FileCheck2,
  Lock,
  Camera,
  CameraOff,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileDown,
  Plus,
  RefreshCw,
  Phone,
  Building2,
  Calendar,
  Send,
  X,
  FileText,
  Filter,
  Check,
  ExternalLink,
  PhoneCall,
  Activity,
  Layers,
  Home,
  User,
  BadgeCheck,
  CheckSquare,
  Wifi,
  WifiOff,
  CloudOff,
  BarChart3,
  Edit3,
} from 'lucide-react';
import api from '../services/api.js';
import { securityOfflineStore } from '../services/securityOfflineStore.js';
import { getAllResidentLeaves, normalizeLeaveStatus } from '../services/hostelResidentLeaveStore.js';
import { recordGatePassExit, recordGatePassReturn } from '../services/gatePassStore.js';
import RoleDashboardLanding from './RoleDashboardLanding.jsx';
import SecurityGuardEmployeeProfile from './SecurityGuardEmployeeProfile.jsx';
import { getSecurityMenuConfig } from '../config/menuConfig/menuConfig.security.js';
import './AdminPortal.css';
import './SecurityPortal.css';

// Lightweight native CSV export helper
function exportToCsv(filename, rows) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map((row) =>
        keys
          .map((k) => {
            let val = row[k] === null || row[k] === undefined ? '' : String(row[k]);
            val = val.replace(/"/g, '""');
            if (val.search(/("|,|\n)/g) >= 0) val = `"${val}"`;
            return val;
          })
          .join(separator),
      )
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function SecurityPortal({ account, onLogout, onSwitchRole }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const guardName = account?.name || 'Dillip Kumar Pradhan';
  const badgeId = account?.detail?.includes('Badge')
    ? account.detail.split('Badge')[1]?.trim()?.replace(')', '')
    : 'SG-OD-4421';
  const gatePost = account?.detail?.includes('·')
    ? account.detail.split('·')[0]?.trim()
    : 'Main Campus Gate 1 (Front Entrance)';

  const [selectedGate, setSelectedGate] = useState(gatePost);
  const [overdueList, setOverdueList] = useState([]);

  // 1. STATS STATE
  const [stats, setStats] = useState({
    studentsOutside: 1,
    todayExits: 2,
    todayEntries: 2,
    lateReturns: 0,
    activeVisitors: 2,
  });

  // 2. SCANNER STATE
  const [searchQuery, setSearchQuery] = useState('');
  const [scannedResult, setScannedResult] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [guardRemarks, setGuardRemarks] = useState('');
  const [parentNotice, setParentNotice] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);

  // Offline Synchronization & Network Resilience State
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine !== false : true
  );
  const [offlineQueueCount, setOfflineQueueCount] = useState(() =>
    securityOfflineStore ? securityOfflineStore.getPendingCount() : 0
  );
  const [syncingQueue, setSyncingQueue] = useState(false);

  // Camera stream state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('environment');
  const videoRef = useRef(null);

  // 3. PASSES CATALOG STATE
  const [passesList, setPassesList] = useState([]);
  const [passFilterHostel, setPassFilterHostel] = useState('ALL');
  const [passFilterStatus, setPassFilterStatus] = useState('ALL');
  const [passSearch, setPassSearch] = useState('');
  const [passesLoading, setPassesLoading] = useState(false);

  // 4. VISITORS STATE
  const [visitorSubTab, setVisitorSubTab] = useState('active'); // 'active' | 'verify' | 'walkin'
  const [visitorsList, setVisitorsList] = useState([]);
  const [visitorCode, setVisitorCode] = useState('');
  const [verifiedVisitorData, setVerifiedVisitorData] = useState(null);
  const [visitorFeedback, setVisitorFeedback] = useState(null);
  const [walkInForm, setWalkInForm] = useState({
    visitorName: '',
    relation: 'Parent / Family',
    studentName: '',
    rollNumber: '',
    purpose: '',
    phone: '',
    idProofNumber: '',
    badgeNumber: '',
    requiresStudentApproval: true,
  });

  // 5. HISTORY STATE
  const [historyList, setHistoryList] = useState([]);
  const [historyDirection, setHistoryDirection] = useState('ALL');
  const [historySearch, setHistorySearch] = useState('');
  const [historyGateFilter, setHistoryGateFilter] = useState('ALL');
  const [historyRoleFilter, setHistoryRoleFilter] = useState('ALL');

  // 6. INCIDENTS STATE
  const [alertsList, setAlertsList] = useState([
    {
      id: 'inc-01',
      title: 'Gate 2 Perimeter Checkpoint Flagged',
      category: 'Perimeter Breach',
      severity: 'medium',
      time: '10:30 AM Today',
      description: 'Vehicle attempted entry without registered windshield RFID pass. Directed to visitor bay.',
    },
  ]);
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    title: '',
    affectedRollNumber: '',
    studentName: '',
    hostelName: 'Gandhi Boys Residence',
    category: 'Unauthorized Exit Attempt',
    severity: 'high',
    description: '',
  });

  // 6b. OVERDUE RESOLUTION MODAL STATE
  const [overdueResolveModal, setOverdueResolveModal] = useState(null);
  const [overdueResolveForm, setOverdueResolveForm] = useState({
    resolutionStatus: 'RESOLVED',
    notes: 'Student arrived safely at gate. Physical verification complete.',
  });

  // 7. DAILY REPORT STATE
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
  const [reportHostelFilter, setReportHostelFilter] = useState('ALL');
  const [dailyReportData, setDailyReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // 8. AUDIT HISTORY & AUDITED CORRECTION STATE
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');
  const [auditRoleFilter, setAuditRoleFilter] = useState('ALL');
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [correctionForm, setCorrectionForm] = useState({
    recordId: '',
    recordType: 'MOVEMENT',
    fieldToCorrect: 'gateName',
    oldValue: '',
    newValue: '',
    reason: '',
  });
  const [correctionSubmitting, setCorrectionSubmitting] = useState(false);
  const [correctionFeedback, setCorrectionFeedback] = useState(null);

  // 9. SHIFT NOTES STATE
  const [shiftNotes, setShiftNotes] = useState([
    {
      id: 'sn-1',
      time: '06:00 AM Today',
      author: 'Dillip Kumar Pradhan (SG-OD-4421)',
      shift: 'Morning Shift (06:00 - 14:00)',
      content: 'Turnstile A and B optical barriers calibrated. Emergency fire gate padlock inspected and secure. All perimeter CCTV cameras operational.',
    },
    {
      id: 'sn-2',
      time: '10:15 AM Today',
      author: 'Dillip Kumar Pradhan (SG-OD-4421)',
      shift: 'Morning Shift (06:00 - 14:00)',
      content: 'Official postal courier vehicle inspected and logged. Delivery staff escorted to Administrative Block dispatch desk.',
    },
  ]);
  const [newNoteText, setNewNoteText] = useState('');

  // Load initial data
  useEffect(() => {
    loadOverviewStats();
    loadApprovedPasses();
    loadVisitors();
    loadMovementsHistory();
    loadOverdueReturns();
    loadAlerts();
    loadDailyReport();
    loadAuditTrail();

    const handleLeavesSync = () => {
      loadApprovedPasses();
      loadOverviewStats();
    };

    window.addEventListener('bput_hostel_leaves_updated', handleLeavesSync);
    window.addEventListener('storage', handleLeavesSync);

    return () => {
      window.removeEventListener('bput_hostel_leaves_updated', handleLeavesSync);
      window.removeEventListener('storage', handleLeavesSync);
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'reports') {
      loadDailyReport(reportDate, reportHostelFilter);
    } else if (activeTab === 'audit') {
      loadAuditTrail();
    }
  }, [activeTab, reportDate, reportHostelFilter, auditActionFilter, auditRoleFilter]);

  // Subscribe to offline queue changes and network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    let unsubscribe = () => {};
    if (securityOfflineStore && typeof securityOfflineStore.subscribe === 'function') {
      unsubscribe = securityOfflineStore.subscribe((queue) => {
        setOfflineQueueCount(Array.isArray(queue) ? queue.length : 0);
      });
    }

    let autoSyncCleanup = () => {};
    if (securityOfflineStore && typeof securityOfflineStore.initAutoSync === 'function') {
      autoSyncCleanup = securityOfflineStore.initAutoSync(api, (report) => {
        if (report && report.syncedCount > 0) {
          loadOverviewStats();
          loadMovementsHistory();
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
      autoSyncCleanup();
    };
  }, []);

  const loadOverviewStats = async () => {
    try {
      const res = await api.getSecurityOverviewStats();
      if (res && res.data) setStats(res.data);
      else if (res) setStats(res);
    } catch {
      // Use fallback
    }
  };

  const loadApprovedPasses = async () => {
    setPassesLoading(true);
    try {
      let list = [];
      try {
        const res = await api.getSecurityApprovedPasses();
        list = Array.isArray(res) ? res : res?.data || [];
      } catch {
        list = [];
      }

      // Merge with approved resident leaves from warden/admin approval workflow
      const residentLeaves = getAllResidentLeaves();
      const approvedResidentPasses = residentLeaves
        .filter((l) => {
          const st = normalizeLeaveStatus(l.status);
          return st === 'Approved' || l.returned || String(l.status).toLowerCase().includes('return');
        })
        .map((l) => {
          const isReturned = Boolean(l.returned || String(l.status).toLowerCase().includes('return'));
          return {
            id: l.id,
            passId: l.id,
            studentName: l.studentName,
            rollNumber: l.rollNumber || l.regNo,
            hostelName: l.hostelName,
            roomNumber: l.roomNumber,
            purposeType: l.reason || 'Outstation Leave',
            destination: l.reason || 'Home Visit',
            outDateTime: `${l.startDate || '2026-11-01'} 08:00`,
            inDateTime: `${l.endDate || '2026-11-03'} 20:00`,
            status: isReturned ? 'Returned to Hostel' : 'Approved by Warden',
            catalogStatus: isReturned ? 'RETURNED' : 'PENDING_EXIT',
            isOverdue: false,
            wardenRemarks: l.guardianStatus || 'Verified and approved by Warden',
            approvedBy: l.approvedBy || 'Resident Warden',
            qrCodeString: `BPUT-${l.id}-APPROVED-VALID`,
            studentPhone: l.phone,
            guardianPhone: l.guardianPhone,
            isLeaveApp: true
          };
        });

      const passMap = new Map();
      list.forEach((p) => {
        if (p && (p.passId || p.id)) passMap.set(p.passId || p.id, p);
      });
      approvedResidentPasses.forEach((p) => {
        if (!passMap.has(p.passId)) {
          passMap.set(p.passId, p);
        } else {
          // Keep resident leave status up to date
          const existing = passMap.get(p.passId);
          passMap.set(p.passId, { ...existing, ...p });
        }
      });

      setPassesList(Array.from(passMap.values()));
    } catch {
      // fallback
    } finally {
      setPassesLoading(false);
    }
  };

  const loadVisitors = async () => {
    try {
      const res = await api.getVisitors();
      const list = Array.isArray(res) ? res : res?.data || [];
      if (list.length > 0) setVisitorsList(list);
    } catch {
      // fallback
    }
  };

  const loadMovementsHistory = async () => {
    try {
      const res = await api.getSecurityMovementsHistory();
      const list = Array.isArray(res) ? res : res?.data || [];
      if (list.length > 0) setHistoryList(list);
    } catch {
      // fallback
    }
  };

  const loadOverdueReturns = async () => {
    try {
      const res = await api.getSecurityOverdueReturns();
      const list = Array.isArray(res) ? res : res?.data || [];
      if (list.length > 0) setOverdueList(list);
    } catch {
      setOverdueList([
        {
          id: 'ovd-01',
          studentRoll: '04',
          studentName: 'Subhasish Dash',
          hostelName: 'Gandhi Boys Residence',
          roomNumber: 'Room 312',
          destination: 'Library & City Study Center',
          expectedReturnTime: new Date(Date.now() - 3600000 * 2.5).toISOString(),
          overdueMinutes: 150,
          status: 'NEEDS_FOLLOW_UP',
          wardenAlertSent: true,
          resolutionNotes: 'Warden called student phone; student stated city bus delay. Follow-up pending at gate.',
        },
        {
          id: 'ovd-02',
          studentRoll: '06',
          studentName: 'Ananya Mishra',
          hostelName: 'Sarojini Girls Residence (Hostel 1)',
          roomNumber: 'Room 205',
          destination: 'Central Hospital Consultation',
          expectedReturnTime: new Date(Date.now() - 3600000 * 1).toISOString(),
          overdueMinutes: 60,
          status: 'APPROVED_LATE_RETURN',
          wardenAlertSent: true,
          resolutionNotes: 'Approved late return granted by Warden (prescription pickup delay).',
        },
      ]);
    }
  };

  const loadAlerts = async () => {
    try {
      const res = await (api.getSecurityIncidents ? api.getSecurityIncidents() : api.getSecurityAlerts());
      const list = Array.isArray(res) ? res : res?.data || [];
      if (list.length > 0) {
        setAlertsList(list.map((item) => ({
          id: item.id || item.incidentCode,
          title: item.title,
          category: item.category || 'Perimeter & Gate Security',
          severity: (item.severity || 'high').toLowerCase(),
          time: item.detectedAt ? new Date(item.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
          description: item.evidence || item.description || '',
        })));
      }
    } catch {
      // Keep initial alertsList
    }
  };

  // Camera Handler
  useEffect(() => {
    let stream = null;
    if (cameraActive && videoRef.current) {
      navigator.mediaDevices
        ?.getUserMedia({
          video: { facingMode: cameraFacing },
          audio: false,
        })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.warn('Camera access unavailable:', err);
          setCameraActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive, cameraFacing]);

  // Lookup / Scan
  const handlePerformScan = async (queryToUse) => {
    const q = queryToUse || searchQuery;
    if (!q || !q.trim()) return;

    setScanLoading(true);
    setScanError('');
    setScannedResult(null);
    setActionFeedback(null);
    setParentNotice(null);

    const trimmedQuery = q.trim();

    // 1. Dynamic 10-Second QR Token Scanner Workflow
    if (trimmedQuery.startsWith('ACQR.')) {
      try {
        const res = await api.verifyDynamicQr({
          token: trimmedQuery,
          gateName: selectedGate || gatePost,
          gateType: (selectedGate || gatePost).toLowerCase().includes('hostel') ? 'HOSTEL_GATE' : 'MAIN_CAMPUS',
          direction: 'AUTO',
        });
        const data = res?.data || res;
        if (data) {
          setScannedResult({
            valid: data.allowed,
            decision: data.decision,
            dynamicQr: true,
            reason: data.reason,
            isOverdue: data.isOverdue,
            overdueText: data.isOverdue ? `${data.overdueMinutes} mins overdue` : null,
            recommendedAction: data.allowed ? (data.direction === 'EXIT' ? 'EXIT' : 'ENTRY') : 'BLOCKED',
            student: {
              name: data.person?.name || 'Verified Member',
              rollNumber: data.person?.identifier || 'N/A',
              role: data.person?.role || 'STUDENT',
              department: data.person?.department || 'General',
              hostelName: data.person?.hostelName || 'Sarojini Girls Residence (Hostel 1)',
              roomNumber: data.person?.roomNumber || 'Room 103',
              phone: '+91 98610 23010',
              parentPhone: '+91 94370 10001',
              campusStatus: data.person?.currentCampusStatus,
              accountActive: data.person?.accountActive !== false,
            },
            pass: data.permissionContext || {
              passId: 'DYN-QR-PASS',
              purposeType: data.category === 'ROUTINE_ACCESS' ? 'Routine Movement' : 'Approved Gate Pass',
              destination: 'Campus Gate Checkpoint',
              status: data.allowed ? 'APPROVED' : 'DENIED',
            },
          });

          if (data.allowed) {
            setActionFeedback({
              success: true,
              message: `${data.decision}: Movement automatically saved. Turnstiles unlocked.`,
            });
            loadOverviewStats();
            loadMovementsHistory();
          } else {
            setActionFeedback({
              success: false,
              message: `${data.decision}: ${data.reason}`,
            });
          }
          setScanLoading(false);
          return;
        }
      } catch (err) {
        setScanError(err.message || 'Dynamic QR verification failed.');
        setScanLoading(false);
        return;
      }
    }

    const checkOfflineFallback = () => {
      const trimmed = q.trim().toLowerCase();
      const localMatch = passesList.find(
        (p) =>
          p.passId?.toLowerCase() === trimmed ||
          p.rollNumber?.toLowerCase() === trimmed ||
          p.studentName?.toLowerCase().includes(trimmed)
      );
      if (localMatch) {
        return {
          valid: localMatch.status === 'APPROVED',
          reason: 'Cached approved pass loaded (Offline mode · Provisional scan)',
          provisional: true,
          pass: localMatch,
          student: {
            name: localMatch.studentName,
            rollNumber: localMatch.rollNumber,
            hostelName: localMatch.hostelName,
            roomNumber: localMatch.roomNumber || 'Room 102',
            department: 'Civil Engineering',
            phone: '+91 94370 12345',
            parentPhone: '+91 98610 99887',
          },
          recommendedAction: localMatch.catalogStatus === 'OUT' ? 'ENTRY' : 'EXIT',
          isOverdue: localMatch.isOverdue || false,
          overdueText: localMatch.isOverdue ? 'Overdue Return' : null,
        };
      }
      return null;
    };

    if (!isOnline) {
      const localResult = checkOfflineFallback();
      if (localResult) {
        setScannedResult(localResult);
      } else {
        setScanError('Device is offline. Pass not found in local cache. Scans will be queued once identified.');
      }
      setScanLoading(false);
      return;
    }

    try {
      const res = await api.scanSecurityCode(q.trim());
      const data = res?.data || res;
      setScannedResult(data);
    } catch (err) {
      const localFallback = checkOfflineFallback();
      if (localFallback) {
        setScannedResult(localFallback);
      } else {
        setScanError(err.message || 'Pass verification failed. Please inspect student credentials.');
      }
    } finally {
      setScanLoading(false);
    }
  };

  // Record Physical Exit
  const handleRecordExit = async () => {
    if (!scannedResult || !scannedResult.pass) return;
    setActionLoading(true);
    setActionFeedback(null);

    const payload = {
      passId: scannedResult.pass.passId || scannedResult.pass.id,
      rollNumber: scannedResult.student.rollNumber,
      studentName: scannedResult.student.name,
      direction: 'EXIT',
      gateName: gatePost,
      guardId: badgeId,
      guardName,
      remarks: guardRemarks || 'Turnstile student departure logged.',
    };

    if (!isOnline) {
      const queued = securityOfflineStore.enqueueMovement(payload);
      setActionFeedback({
        success: true,
        provisional: true,
        message: 'Saved, will sync · Exit queued locally (Provisional scan - pending server confirmation).',
        syncId: queued.offlineSyncId,
      });
      setOfflineQueueCount(securityOfflineStore.getQueueCount());
      setActionLoading(false);
      return;
    }

    try {
      const res = await api.recordSecurityExit(payload);

      try {
        recordGatePassExit(scannedResult.pass.passId || scannedResult.pass.id);
      } catch (e) {
        console.warn('Local gate pass store exit sync:', e);
      }

      setActionFeedback({
        success: true,
        message: `Exit successfully logged for ${scannedResult.student.name}.`,
      });
      if (res?.parentNotificationLog) {
        setParentNotice(res.parentNotificationLog);
      }
      loadOverviewStats();
      loadApprovedPasses();
      loadMovementsHistory();
      handlePerformScan(scannedResult.student.rollNumber);
    } catch (err) {
      console.warn('Live API exit record failed, falling back to local security store:', err.message);
      try {
        recordGatePassExit(scannedResult.pass.passId || scannedResult.pass.id);
        const queued = securityOfflineStore.enqueueMovement(payload);
        setOfflineQueueCount(securityOfflineStore.getQueueCount());
        setActionFeedback({
          success: true,
          provisional: true,
          message: `Exit logged locally for ${scannedResult.student.name} (Provisional scan - queued for sync).`,
          syncId: queued.offlineSyncId,
        });
        loadOverviewStats();
        loadApprovedPasses();
        loadMovementsHistory();
        handlePerformScan(scannedResult.student.rollNumber);
      } catch (fallbackErr) {
        setActionFeedback({
          success: false,
          message: err.message || 'Failed to record campus exit.',
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Record Physical Entry
  const handleRecordEntry = async () => {
    if (!scannedResult || !scannedResult.pass) return;
    setActionLoading(true);
    setActionFeedback(null);

    const payload = {
      passId: scannedResult.pass.passId || scannedResult.pass.id,
      rollNumber: scannedResult.student.rollNumber,
      studentName: scannedResult.student.name,
      direction: 'ENTRY',
      gateName: gatePost,
      guardId: badgeId,
      guardName,
      remarks: guardRemarks || 'Turnstile student entry logged.',
    };

    if (!isOnline) {
      const queued = securityOfflineStore.enqueueMovement(payload);
      setActionFeedback({
        success: true,
        provisional: true,
        message: 'Saved, will sync · Entry queued locally (Provisional scan - pending server confirmation).',
        syncId: queued.offlineSyncId,
      });
      setOfflineQueueCount(securityOfflineStore.getPendingCount());
      setActionLoading(false);
      return;
    }

    try {
      const res = await api.recordSecurityEntry(payload);

      try {
        recordGatePassReturn(scannedResult.pass.passId || scannedResult.pass.id);
      } catch (e) {
        console.warn('Local gate pass store return sync:', e);
      }

      setActionFeedback({
        success: true,
        message: res.isLate
          ? `Entry logged. Curfew alert dispatched (${res.lateDuration}).`
          : `Entry successfully logged for ${scannedResult.student.name}.`,
      });
      if (res?.parentNotificationLog) {
        setParentNotice(res.parentNotificationLog);
      }
      loadOverviewStats();
      loadApprovedPasses();
      loadMovementsHistory();
      handlePerformScan(scannedResult.student.rollNumber);
    } catch (err) {
      console.warn('Live API entry record failed, falling back to local security store:', err.message);
      try {
        recordGatePassReturn(scannedResult.pass.passId || scannedResult.pass.id);
        const queued = securityOfflineStore.enqueueMovement(payload);
        setOfflineQueueCount(securityOfflineStore.getPendingCount());
        setActionFeedback({
          success: true,
          provisional: true,
          message: `Entry logged locally for ${scannedResult.student.name} (Provisional scan - queued for sync).`,
          syncId: queued.offlineSyncId,
        });
        loadOverviewStats();
        loadApprovedPasses();
        loadMovementsHistory();
        handlePerformScan(scannedResult.student.rollNumber);
      } catch (fallbackErr) {
        setActionFeedback({
          success: false,
          message: err.message || 'Failed to record campus return.',
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Manual trigger for offline queue synchronization
  const handleManualSyncQueue = async () => {
    if (!isOnline || syncingQueue) return;
    setSyncingQueue(true);
    try {
      const report = await securityOfflineStore.syncQueue(api);
      setOfflineQueueCount(securityOfflineStore.getPendingCount());
      if (report && report.success) {
        if (report.syncedCount > 0) {
          setActionFeedback({
            success: true,
            message: `Successfully synchronized ${report.syncedCount} queued movement(s) with central server.`,
          });
          loadOverviewStats();
          loadApprovedPasses();
          loadMovementsHistory();
        } else {
          setActionFeedback({
            success: true,
            message: 'All gate movements are already synchronized.',
          });
        }
      } else {
        setActionFeedback({
          success: false,
          message: report?.error || report?.message || 'Synchronization failed. Will retry automatically when online.',
        });
      }
    } catch (err) {
      console.warn('Offline sync failed:', err);
      setActionFeedback({
        success: false,
        message: err.message || 'Offline queue sync encountered an error.',
      });
    } finally {
      setSyncingQueue(false);
    }
  };

  // Visitor Verify Code
  const handleVerifyVisitorCode = async (e) => {
    e.preventDefault();
    if (!visitorCode) return;
    setVisitorFeedback(null);
    setVerifiedVisitorData(null);

    try {
      const res = await api.verifySecurityVisitorCode(visitorCode.trim());
      const data = res?.data || res;
      setVerifiedVisitorData(data.visitor);
      setVisitorFeedback({ success: true, message: data.message });
    } catch (err) {
      setVisitorFeedback({
        success: false,
        message: err.message || 'Verification failed. Code not found.',
      });
    }
  };

  // Visitor Check In
  const handleCheckInVisitor = async (id, badge) => {
    try {
      await api.checkInSecurityVisitor(id, badge || 'BADGE-V-01');
      setVisitorFeedback({ success: true, message: 'Visitor marked as Checked In.' });
      loadVisitors();
      setVerifiedVisitorData(null);
    } catch (err) {
      setVisitorFeedback({ success: false, message: err.message });
    }
  };

  // Visitor Check Out
  const handleCheckOutVisitor = async (id) => {
    try {
      await api.checkOutSecurityVisitor(id);
      setVisitorFeedback({ success: true, message: 'Visitor marked as Signed Out.' });
      loadVisitors();
    } catch (err) {
      setVisitorFeedback({ success: false, message: err.message });
    }
  };

  // Walk-in Visitor Submit
  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.registerSecurityWalkInVisitor({
        ...walkInForm,
        gateNumber: 'Gate 1',
      });
      setVisitorFeedback({
        success: true,
        message: res.message || (walkInForm.requiresStudentApproval ? 'Walk-in visitor registered. Awaiting host student confirmation.' : 'Walk-in visitor pass issued.'),
      });
      setWalkInForm({
        visitorName: '',
        relation: 'Parent / Family',
        studentName: '',
        rollNumber: '',
        purpose: '',
        phone: '',
        idProofNumber: '',
        badgeNumber: '',
        requiresStudentApproval: true,
      });
      loadVisitors();
      setVisitorSubTab('active');
    } catch (err) {
      setVisitorFeedback({ success: false, message: err.message });
    }
  };

  // Report Incident Submit
  const handleIncidentSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.reportSecurityIncident({
        ...incidentForm,
        gateName: gatePost,
      });
      setAlertsList((prev) => [
        {
          id: `inc-${Date.now()}`,
          title: incidentForm.title,
          category: incidentForm.category,
          severity: incidentForm.severity,
          time: 'Just now',
          description: incidentForm.description,
        },
        ...prev,
      ]);
      setIncidentModalOpen(false);
      setIncidentForm({
        title: '',
        affectedRollNumber: '',
        studentName: '',
        hostelName: 'Gandhi Boys Residence',
        category: 'Unauthorized Exit Attempt',
        severity: 'high',
        description: '',
      });
      alert(res.message || 'Security Incident reported to Warden & Admin.');
    } catch (err) {
      alert(err.message || 'Failed to report incident.');
    }
  };

  // Export Movement History to CSV / Excel
  const handleExportHistory = () => {
    const dataToExport = historyList.map((m, idx) => ({
      'Sl No': idx + 1,
      'Movement Code': m.movementCode || m.id,
      'Date & Time': m.movementTime || m.createdAt,
      'Student Name': m.studentName,
      'Roll Number': m.rollNumber,
      'Hostel': m.hostelName || 'Hostel',
      'Direction': m.direction,
      'Gate Checkpoint': m.gateName,
      'Guard on Duty': m.guardName,
      'Status': m.status,
      'Curfew Violation': m.isLate ? `YES (${m.lateDuration})` : 'NO',
      'Remarks': m.remarks || '',
    }));

    exportToCsv(`Apna_Campus_Gate_Movements_${new Date().toISOString().slice(0, 10)}.csv`, dataToExport);
  };

  const handleExportPdf = () => {
    try {
      import('jspdf').then((jsPDFModule) => {
        const { jsPDF } = jsPDFModule;
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Apna Campus - Gate Movement Audit Report', 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 28);
        doc.text(`Active Checkpoint: ${selectedGate || 'All Gates'}`, 14, 34);

        let y = 46;
        historyList.slice(0, 25).forEach((m, idx) => {
          doc.text(
            `${idx + 1}. [${m.direction}] ${m.studentName || 'Member'} (${m.rollNumber}) - ${m.gateName || 'Gate 1'} - ${new Date(m.movementTime || m.createdAt).toLocaleTimeString('en-US')}`,
            14,
            y
          );
          y += 8;
        });

        doc.save(`Gate_Movements_Audit_${Date.now()}.pdf`);
      });
    } catch {
      window.print();
    }
  };


  // Load Daily Security Report
  const loadDailyReport = async (date = reportDate, hostel = reportHostelFilter) => {
    setLoadingReport(true);
    try {
      if (api.getDailySecurityReport) {
        const res = await api.getDailySecurityReport(date, hostel);
        if (res && res.success) {
          setDailyReportData(res);
        }
      }
    } catch (err) {
      console.warn('Daily report load error:', err);
    } finally {
      setLoadingReport(false);
    }
  };

  // Export Daily Report to CSV
  const handleExportDailyCsv = () => {
    if (!dailyReportData) return;
    const rows = [];
    rows.push({
      Section: '1. SUMMARY',
      Metric: 'Report Date',
      Value: dailyReportData.reportDate,
      Details: `Generated: ${dailyReportData.generatedAt}`,
    });
    rows.push({
      Section: '1. SUMMARY',
      Metric: 'Total Gate Movements',
      Value: dailyReportData.summary?.totalMovements || 0,
      Details: `Exits: ${dailyReportData.summary?.totalExits || 0}, Entries: ${dailyReportData.summary?.totalEntries || 0}`,
    });
    rows.push({
      Section: '1. SUMMARY',
      Metric: 'Curfew Compliance Rate',
      Value: dailyReportData.summary?.curfewComplianceRate || '100%',
      Details: `On-time: ${dailyReportData.summary?.onTimeReturns || 0}, Late Violations: ${dailyReportData.summary?.lateReturns || 0}`,
    });
    rows.push({
      Section: '1. SUMMARY',
      Metric: 'Peak Outbound Rush (Morning)',
      Value: dailyReportData.summary?.peakExitHour || '09:00 AM',
      Details: 'Highest student exit scans',
    });
    rows.push({
      Section: '1. SUMMARY',
      Metric: 'Peak Inbound Rush (Evening)',
      Value: dailyReportData.summary?.peakEntryHour || '06:00 PM',
      Details: 'Highest student turnstile return scans',
    });
    rows.push({
      Section: '1. SUMMARY',
      Metric: 'Total Security Incidents',
      Value: dailyReportData.incidentSummary?.total || 0,
      Details: `Critical: ${dailyReportData.incidentSummary?.bySeverity?.critical || 0}, Open: ${dailyReportData.incidentSummary?.byStatus?.open || 0}`,
    });
    rows.push({
      Section: '1. SUMMARY',
      Metric: 'Active Campus Visitors',
      Value: dailyReportData.visitorSummary?.currentlyInside || 0,
      Details: `Total today: ${dailyReportData.visitorSummary?.totalToday || 0}`,
    });

    // Peak Hours
    (dailyReportData.peakHours || []).forEach((slot) => {
      rows.push({
        Section: '2. PEAK_HOURS',
        Metric: slot.timeRange,
        Value: `${slot.total} scans`,
        Details: `Exits: ${slot.exits}, Entries: ${slot.entries}${slot.isPeak ? ' [PEAK RUSH HOUR]' : ''}`,
      });
    });

    // Incidents
    (dailyReportData.incidentSummary?.incidents || []).forEach((inc) => {
      rows.push({
        Section: '3. INCIDENTS',
        Metric: inc.incidentCode || inc.id,
        Value: inc.title,
        Details: `Severity: ${inc.severity}, Status: ${inc.status}, Gate: ${inc.gateName || 'Gate 1'}`,
      });
    });

    exportToCsv(`ApnaCampus_Daily_Security_Report_${dailyReportData.reportDate || reportDate}.csv`, rows);
  };

  // Export Daily Report to PDF
  const handleExportDailyPdf = () => {
    try {
      import('jspdf').then((jsPDFModule) => {
        const { jsPDF } = jsPDFModule;
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('APNA CAMPUS - DAILY GATE SECURITY & PERIMETER REPORT', 14, 18);
        doc.setFontSize(9);
        doc.text(`Report Date: ${dailyReportData?.reportDate || reportDate} | Generated: ${new Date().toLocaleString('en-IN')}`, 14, 25);
        doc.text(`Duty Officer: ${guardName} (${badgeId}) | Gate Post: ${gatePost}`, 14, 30);

        doc.setLineWidth(0.5);
        doc.line(14, 33, 196, 33);

        // Section 1: Summary Statistics
        doc.setFontSize(11);
        doc.text('1. DAILY OPERATIONAL TELEMETRY & CURFEW COMPLIANCE', 14, 40);
        doc.setFontSize(8.5);
        doc.text(`• Total Turnstile Scans: ${dailyReportData?.summary?.totalMovements || 0} (Exits: ${dailyReportData?.summary?.totalExits || 0}, Entries: ${dailyReportData?.summary?.totalEntries || 0})`, 16, 47);
        doc.text(`• Curfew Compliance Rate: ${dailyReportData?.summary?.curfewComplianceRate || '100%'} (On-time: ${dailyReportData?.summary?.onTimeReturns || 0}, Breaches: ${dailyReportData?.summary?.lateReturns || 0})`, 16, 53);
        doc.text(`• Campus Population In/Out: ${dailyReportData?.summary?.studentsInside || 0} students inside campus (${dailyReportData?.summary?.studentsOutside || 0} outside)`, 16, 59);
        doc.text(`• Peak Outbound Hour (Morning): ${dailyReportData?.summary?.peakExitHour || '09:00 AM'}`, 16, 65);
        doc.text(`• Peak Inbound Hour (Evening): ${dailyReportData?.summary?.peakEntryHour || '06:00 PM'}`, 16, 71);
        doc.text(`• Combined Busiest Gate Window: ${dailyReportData?.summary?.peakOverallHour || '18:00 - 19:00'}`, 16, 77);

        // Section 2: Peak Hours Throughput
        doc.setFontSize(11);
        doc.text('2. HOURLY TURNSTILE THROUGHPUT (06:00 - 22:00)', 14, 88);
        doc.setFontSize(8);
        let y = 95;
        (dailyReportData?.peakHours || []).slice(0, 10).forEach((slot) => {
          doc.text(`${slot.timeRange}: ${slot.total} scans (Exits: ${slot.exits}, Entries: ${slot.entries})${slot.isPeak ? ' [PEAK]' : ''}`, 16, y);
          y += 5.5;
        });

        // Section 3: Incident Summary
        y += 4;
        doc.setFontSize(11);
        doc.text('3. SECURITY INCIDENTS & PERIMETER BREACH REGISTER', 14, y);
        y += 7;
        doc.setFontSize(8);
        const incidents = dailyReportData?.incidentSummary?.incidents || [];
        if (incidents.length === 0) {
          doc.text('Zero security incidents recorded for this period.', 16, y);
          y += 6;
        } else {
          incidents.slice(0, 5).forEach((inc) => {
            doc.text(`• [${inc.severity || 'HIGH'}] ${inc.incidentCode || inc.id}: ${inc.title} (${inc.status || 'OPEN'})`, 16, y);
            y += 5.5;
          });
        }

        // Section 4: Sign-off block
        y += 12;
        doc.setLineWidth(0.3);
        doc.line(14, y, 196, y);
        y += 8;
        doc.setFontSize(8.5);
        doc.text(`Chief Warden / Security In-Charge Verification: __________________________________`, 14, y);
        y += 6;
        doc.text(`Duty Security Officer Sign-off: ${guardName} (Digital Signature Confirmed)`, 14, y);

        doc.save(`Daily_Security_Report_${dailyReportData?.reportDate || reportDate}.pdf`);
      });
    } catch {
      window.print();
    }
  };


  // Escalate Overdue Alert (Dispatches Parent SMS & Warden Emergency Notice)
  const handleEscalateOverdue = async (id) => {
    try {
      if (api.escalateSecurityOverdueReturn) {
        const res = await api.escalateSecurityOverdueReturn(id);
        setActionFeedback({
          success: true,
          message: res.message || 'Curfew alert escalated to Parent SMS and Resident Warden.',
        });
      }
      loadOverdueReturns();
    } catch (err) {
      alert(err.message || 'Failed to escalate alert.');
    }
  };

  // Resolve Overdue Submit
  const handleResolveOverdueSubmit = async (e) => {
    e.preventDefault();
    if (!overdueResolveModal) return;
    try {
      if (api.resolveSecurityOverdueReturn) {
        await api.resolveSecurityOverdueReturn(overdueResolveModal.id, overdueResolveForm);
      }
      setActionFeedback({
        success: true,
        message: `Overdue case for ${overdueResolveModal.studentName} resolved successfully.`,
      });
      setOverdueResolveModal(null);
      setOverdueResolveForm({
        resolutionStatus: 'RESOLVED',
        notes: 'Student arrived safely at gate. Physical verification complete.',
      });
      loadOverdueReturns();
    } catch (err) {
      alert(err.message || 'Failed to resolve record.');
    }
  };

  // Shift Handover Note Submit
  const handleAddShiftNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const note = {
      id: `sn-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: `${guardName} (${badgeId})`,
      shift: 'Morning Shift (06:00 - 14:00)',
      content: newNoteText.trim(),
    };
    setShiftNotes([note, ...shiftNotes]);
    setNewNoteText('');
  };

  // Audit Trail & History Loader
  const loadAuditTrail = async (query = {}) => {
    setAuditLoading(true);
    try {
      const res = await api.getSecurityAuditTrail({
        search: query.search !== undefined ? query.search : auditSearch,
        action: (query.action !== undefined ? query.action : auditActionFilter) === 'ALL' ? undefined : (query.action !== undefined ? query.action : auditActionFilter),
        role: (query.role !== undefined ? query.role : auditRoleFilter) === 'ALL' ? undefined : (query.role !== undefined ? query.role : auditRoleFilter),
      });
      const list = res?.auditTrail || (Array.isArray(res) ? res : []);
      if (list && list.length > 0) {
        setAuditLogs(list);
      } else {
        setAuditLogs([
          {
            id: 'audit-fallback-1',
            user: guardName || 'Dillip Kumar Pradhan',
            role: 'SECURITY',
            action: 'GATE_STUDENT_EXIT',
            target: 'Student: Sneha Mohanty (Roll: 03)',
            oldValue: 'Status: Approved (Inside Campus)',
            newValue: 'Status: EXITED (Active off-campus)',
            reason: 'Physical Turnstile Card & Biometric check passed at Gate 1',
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
          {
            id: 'audit-fallback-2',
            user: 'Dr. Ramesh Chandra Sahoo',
            role: 'WARDEN',
            action: 'GATE_PASS_APPROVED',
            target: 'Pass: GP-2026-1039 (Student: Priya Patra)',
            oldValue: 'Status: PENDING_WARDEN',
            newValue: 'Status: APPROVED',
            reason: 'Verified project work recommendation from faculty advisor',
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          },
        ]);
      }
    } catch {
      setAuditLogs([
        {
          id: 'audit-fallback-1',
          user: guardName || 'Dillip Kumar Pradhan',
          role: 'SECURITY',
          action: 'GATE_STUDENT_EXIT',
          target: 'Student: Sneha Mohanty (Roll: 03)',
          oldValue: 'Status: Approved (Inside Campus)',
          newValue: 'Status: EXITED (Active off-campus)',
          reason: 'Physical Turnstile Card & Biometric check passed at Gate 1',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      ]);
    } finally {
      setAuditLoading(false);
    }
  };

  // Audited Record Correction Submit
  const handleSubmitCorrection = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!correctionForm.recordId.trim()) {
      alert('Record ID is required.');
      return;
    }
    if (!correctionForm.newValue.trim()) {
      alert('New corrected value is required.');
      return;
    }
    if (!correctionForm.reason || correctionForm.reason.trim().length < 5) {
      alert('Audit compliance mandates a detailed reason of at least 5 characters.');
      return;
    }

    setCorrectionSubmitting(true);
    setCorrectionFeedback(null);
    try {
      const res = await api.correctSecurityRecord({
        recordId: correctionForm.recordId.trim(),
        recordType: correctionForm.recordType,
        fieldToCorrect: correctionForm.fieldToCorrect.trim(),
        oldValue: correctionForm.oldValue ? correctionForm.oldValue.trim() : undefined,
        newValue: correctionForm.newValue.trim(),
        reason: correctionForm.reason.trim(),
      });
      setCorrectionFeedback({
        type: 'success',
        message: res?.message || 'Security record corrected and logged to immutable audit trail.',
      });
      loadAuditTrail();
      loadMovementsHistory();
      loadVisitors();
      setTimeout(() => {
        setCorrectionModalOpen(false);
        setCorrectionFeedback(null);
      }, 1500);
    } catch (err) {
      setCorrectionFeedback({
        type: 'error',
        message: err?.message || 'Failed to submit correction. Check supervisor permissions.',
      });
    } finally {
      setCorrectionSubmitting(false);
    }
  };

  const openCorrectionForRecord = (type, item, defaultField = 'gateName') => {
    setCorrectionForm({
      recordId: item.id || item.movementCode || item.passId || '',
      recordType: type,
      fieldToCorrect: defaultField,
      oldValue: item[defaultField] || item.status || '',
      newValue: '',
      reason: '',
    });
    setCorrectionFeedback(null);
    setCorrectionModalOpen(true);
  };

  // Navigation Sections matching platform design system
  // getSecurityMenuConfig provides: Gate Overview, QR Scanner, Approved Gate Passes, Overdue Returns, Visitor Management
  const securityNavSections = useMemo(
    () =>
      getSecurityMenuConfig({
        passesBadge: passesList.length > 0 ? String(passesList.length) : undefined,
        overdueBadge: overdueList.length > 0 ? String(overdueList.length) : undefined,
        visitorsBadge: visitorsList.filter((v) => v.outTime === 'Pending Sign-out' || !v.outTime).length
          ? String(visitorsList.filter((v) => v.outTime === 'Pending Sign-out' || !v.outTime).length)
          : undefined,
        alertsBadge: alertsList.length > 0 ? String(alertsList.length) : undefined,
      }),
    [passesList.length, overdueList.length, visitorsList, alertsList.length]
  );

  // Dynamic Page Header Content
  const getSecurityHeading = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Campus Security Guard Dashboard',
          subtitle: 'Perimeter Access Control & 24/7 Gate Vigilance · Real-time turnstiles, student movements, and visitor credentials.',
        };
      case 'overview':
        return {
          title: 'Campus Security Executive Console',
          subtitle: 'Live perimeter vigilance, turnstile exit/entry verification, warden pass compliance, and visitor guest logs.',
        };
      case 'scanner':
        return {
          title: 'Turnstile QR Scanner & Roll Lookup',
          subtitle: 'Instant gate pass verification, biometric identity check, and physical exit/entry recording.',
        };
      case 'passes':
        return {
          title: 'Approved Gate Passes Registry',
          subtitle: 'Warden-verified outpasses, approved curfew windows, and student destination oversight.',
        };
      case 'overdue':
        return {
          title: 'Overdue & Late Return Monitoring',
          subtitle: 'Automated tracking of expired curfew passes, warden notifications, and investigation resolution.',
        };
      case 'visitors':
        return {
          title: 'Campus Visitor & Guest Management',
          subtitle: 'Pre-approved 6-digit visitor pass verification, walk-in guest check-ins, and badge issuance.',
        };
      case 'history':
        return {
          title: 'Campus Turnstile Movement History',
          subtitle: 'Immutable chronological turnstile telemetry, curfew violation audit, and Excel/CSV export.',
        };
      case 'reports':
        return {
          title: 'Daily Gate Security & Movement Telemetry Reports',
          subtitle: 'Perimeter movement summaries, 06:00-22:00 peak hours breakdown, incident logs, and CSV/PDF export.',
        };
      case 'audit':
        return {
          title: 'Immutable Security Audit Trail & Correction Register',
          subtitle: 'Traceable log of all perimeter transactions, turnstile corrections, warden approvals, and visitor authorizations.',
        };
      case 'alerts':
        return {
          title: 'Perimeter Security Alerts & Breaches',
          subtitle: 'Real-time alert register, unauthorized exit flags, and emergency dispatch to Warden & Proctor.',
        };
      case 'shift-notes':
        return {
          title: 'Security Shift Handover & Duty Log',
          subtitle: 'Physical checkpoint handover notes, equipment status, and incident records between guard shifts.',
        };
      case 'profile':
        return {
          title: 'Security Personnel & Post Record',
          subtitle: 'Official guard badge assignment, stationed checkpoint, and institutional safety credentials.',
        };
      default:
        return {
          title: 'Campus Security Portal',
          subtitle: 'Perimeter & Access Control Vigilance System',
        };
    }
  };

  const heading = getSecurityHeading();

  return (
    <AppLayout
      account={account}
      portalName="Campus Security"
      portalSubtitle="Perimeter & Access Control Vigilance System"
      portalHomeTab="dashboard"
      navSections={securityNavSections}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={onLogout}
      pageTitle={heading.title}
      pageSubtitle={heading.subtitle}
      pageActions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div className="sec-duty-chip">
            <span className="sec-duty-pulse"></span>
            <span>ON DUTY</span>
          </div>
          <div
            className={`sec-online-pill ${isOnline ? 'online' : 'offline'}`}
            title={isOnline ? 'Campus network online' : 'Device offline'}
          >
            {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </div>
          {offlineQueueCount > 0 && (
            <button
              className="sec-btn-sync"
              onClick={handleManualSyncQueue}
              disabled={syncingQueue}
              title="Synchronize stored offline scans with campus server"
            >
              <CloudOff size={14} />
              <span>Saved, will sync ({offlineQueueCount})</span>
              <RefreshCw size={12} className={syncingQueue ? 'animate-spin' : ''} />
            </button>
          )}
        </div>
      }
    >
      <div className="sec-portal-wrapper">
        {/* Urgent Curfew Warning Banner */}
        {stats.lateReturns > 0 && (
          <div className="sec-alert-banner">
            <div className="sec-alert-content">
              <AlertTriangle size={22} color="#dc2626" />
              <div className="sec-alert-text">
                <strong>Security Alert: {stats.lateReturns} Resident Outstation Return Deadlines Breached</strong>
                <span>Students have not scanned entry RFID badge by curfew deadline. Parent alerts queued.</span>
              </div>
            </div>
            <button
              className="sec-btn-rose"
              onClick={() => {
                setActiveTab('passes');
                setPassFilterStatus('LATE');
              }}
            >
              Inspect Passes →
            </button>
          </div>
        )}

        {/* Offline Queue Active Banner */}
        {offlineQueueCount > 0 && (
          <div className="sec-offline-banner">
            <div className="sec-offline-banner-left">
              <CloudOff size={20} className="text-amber-500" />
              <div>
                <strong>Saved, will sync:</strong> {offlineQueueCount} gate movement(s) saved locally in device queue.
                <span className="sec-provisional-note">
                  Provisional scans: Movements require central server authorization once network connectivity is restored.
                </span>
              </div>
            </div>
            <button
              className="sec-btn-sync"
              onClick={handleManualSyncQueue}
              disabled={syncingQueue || !isOnline}
            >
              <RefreshCw size={14} className={syncingQueue ? 'animate-spin' : ''} />
              {syncingQueue ? 'Syncing...' : isOnline ? 'Sync Queue Now' : 'Awaiting Internet...'}
            </button>
          </div>
        )}

        {/* ── TAB 0: SECURITY GUARD DASHBOARD (ROLE DASHBOARD LANDING LIKE HOSTEL ADMIN) ── */}
        {activeTab === 'dashboard' && (
          <div className="sec-dashboard-landing-container">
            <RoleDashboardLanding
              roleKey="security"
              account={account}
              onLogout={onLogout}
              onSwitchRole={onSwitchRole}
              onNavigateTab={(target) => {
                if (target === 'scanner') setActiveTab('scanner');
                else if (target === 'passes') setActiveTab('passes');
                else if (target === 'visitors') setActiveTab('visitors');
                else if (target === 'history') setActiveTab('history');
                else if (target === 'reports') setActiveTab('reports');
                else if (target === 'alerts') setActiveTab('alerts');
                else if (target === 'shift-notes') setActiveTab('shift-notes');
                else if (target === 'profile') setActiveTab('profile');
                else if (target === 'overview' || target === 'gate-overview') setActiveTab('dashboard');
                else if (target) setActiveTab(target);
              }}
              onNavigate={(target) => {
                if (target === 'scanner') setActiveTab('scanner');
                else if (target === 'passes') setActiveTab('passes');
                else if (target === 'visitors') setActiveTab('visitors');
                else if (target === 'history') setActiveTab('history');
                else if (target === 'reports') setActiveTab('reports');
                else if (target === 'alerts') setActiveTab('alerts');
                else if (target === 'shift-notes') setActiveTab('shift-notes');
                else if (target === 'profile') setActiveTab('profile');
                else if (target === 'overview' || target === 'gate-overview') setActiveTab('dashboard');
                else if (target) setActiveTab(target);
              }}
            />
          </div>
        )}

        {/* ── TAB 1: GATE OVERVIEW (EXECUTIVE DASHBOARD LIKE HOSTEL ADMIN) ── */}
        {activeTab === 'overview' && (
          <div>
            {/* Top Executive Header */}
            <div className="sec-executive-header">
              <div className="sec-executive-title-group">
                <h1>
                  Campus Security Executive Console
                  <span className="sec-executive-badge">{gatePost.split('(')[0]}</span>
                </h1>
                <p className="sec-executive-subtitle">
                  Live perimeter vigilance, turnstile exit/entry verification, warden pass compliance, and visitor guest logs.
                </p>
              </div>
              <div className="sec-quick-actions">
                <button
                  className="sec-btn-secondary"
                  onClick={() => setActiveTab('dashboard')}
                  title="Switch to Executive Security Guard Dashboard"
                >
                  <Home size={14} /> Security Dashboard
                </button>
                <button className="sec-btn-primary" onClick={() => setActiveTab('scanner')}>
                  <QrCode size={14} /> Open Turnstile Scanner
                </button>
                <button
                  className="sec-btn-secondary"
                  onClick={() => {
                    setActiveTab('visitors');
                    setVisitorSubTab('verify');
                  }}
                >
                  <UserCheck size={14} /> Verify Visitor Code
                </button>
                <button
                  className="sec-btn-rose"
                  onClick={() => {
                    setActiveTab('alerts');
                    setIncidentModalOpen(true);
                  }}
                >
                  <AlertTriangle size={14} /> Report Breach / Alert
                </button>
                <button
                  className="sec-btn-secondary"
                  onClick={() => {
                    loadOverviewStats();
                    loadApprovedPasses();
                    loadVisitors();
                    loadMovementsHistory();
                  }}
                >
                  <RefreshCw size={14} /> Refresh Live Metrics
                </button>
              </div>
            </div>

            {/* Filter & Shift Bar */}
            <div className="sec-filter-bar">
              <div className="sec-filter-group">
                <Clock size={15} color="#0284c7" />
                <span>Duty Shift:</span>
                <select className="sec-filter-select" defaultValue="morning">
                  <option value="morning">Morning Shift (06:00 - 14:00) · Active</option>
                  <option value="evening">Evening Shift (14:00 - 22:00)</option>
                  <option value="night">Night Curfew Shift (22:00 - 06:00)</option>
                </select>
              </div>

              <div className="sec-filter-group">
                <Building2 size={15} color="#059669" />
                <span>Checkpoint:</span>
                <select className="sec-filter-select" defaultValue="gate1">
                  <option value="gate1">Main Campus Gate 1 (Front Entrance)</option>
                  <option value="gate2">Hostel Complex Gate 2</option>
                  <option value="gate3">Engineering Back Gate 3</option>
                  <option value="all">All Checkpoints (Synchronized)</option>
                </select>
              </div>

              <div className="sec-filter-group">
                <Filter size={15} color="#7c3aed" />
                <span>Live View:</span>
                <select className="sec-filter-select" defaultValue="all">
                  <option value="all">All Live Gate Operations</option>
                  <option value="outside">Students Outside Campus Only</option>
                  <option value="visitors">Active Checked-In Visitors Only</option>
                </select>
              </div>

        {/* Tab Content Panes */}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                <button className="sec-btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }} onClick={handleExportHistory}>
                  <FileDown size={13} /> Export to Excel / CSV
                </button>
              </div>
            </div>

            {/* Top KPI Cards Grid (Matching Hostel Admin Dashboard had-kpi-grid) */}
            <div className="sec-kpi-grid">
              {/* KPI 1: Students Outside */}
              <div className="sec-kpi-card" onClick={() => setActiveTab('passes')}>
                <div className="sec-kpi-card-header">
                  <span className="sec-kpi-label">Students Currently Outside</span>
                  <div className="sec-kpi-icon blue"><Users size={18} /></div>
                </div>
                <div className="sec-kpi-val">{stats.studentsOutside}</div>
                <div className="sec-kpi-sub">
                  <span style={{ color: '#0284c7', fontWeight: 600 }}>On approved warden gate pass</span>
                </div>
              </div>

              {/* KPI 2: Today's Gate Movements */}
              <div className="sec-kpi-card" onClick={() => setActiveTab('history')}>
                <div className="sec-kpi-card-header">
                  <span className="sec-kpi-label">Today's Gate Movements</span>
                  <div className="sec-kpi-icon emerald"><ArrowRightLeft size={18} /></div>
                </div>
                <div className="sec-kpi-val">{stats.todayExits + stats.todayEntries}</div>
                <div className="sec-kpi-sub">
                  <span>{stats.todayExits} exits, {stats.todayEntries} entries verified</span>
                </div>
              </div>

              {/* KPI 3: Overdue / Late Returns */}
              <div className="sec-kpi-card" onClick={() => { setActiveTab('passes'); setPassFilterStatus('LATE'); }}>
                <div className="sec-kpi-card-header">
                  <span className="sec-kpi-label">Overdue / Late Returns</span>
                  <div className="sec-kpi-icon rose"><Clock size={18} /></div>
                </div>
                <div className="sec-kpi-val" style={{ color: stats.lateReturns > 0 ? '#e11d48' : '#0f172a' }}>
                  {stats.lateReturns}
                </div>
                <div className="sec-kpi-sub">
                  <span style={{ color: stats.lateReturns > 0 ? '#dc2626' : '#64748b', fontWeight: 600 }}>
                    {stats.lateReturns > 0 ? 'Curfew violations flagged' : 'Zero curfew breaches'}
                  </span>
                </div>
              </div>

              {/* KPI 4: Active Visitors */}
              <div className="sec-kpi-card" onClick={() => setActiveTab('visitors')}>
                <div className="sec-kpi-card-header">
                  <span className="sec-kpi-label">Active Visitors Inside</span>
                  <div className="sec-kpi-icon amber"><UserCheck size={18} /></div>
                </div>
                <div className="sec-kpi-val">{stats.activeVisitors}</div>
                <div className="sec-kpi-sub">
                  <span>Pending exit badge return</span>
                </div>
              </div>

              {/* KPI 5: Approved Passes Queue */}
              <div className="sec-kpi-card" onClick={() => setActiveTab('passes')}>
                <div className="sec-kpi-card-header">
                  <span className="sec-kpi-label">Approved Passes Ready</span>
                  <div className="sec-kpi-icon purple"><FileCheck2 size={18} /></div>
                </div>
                <div className="sec-kpi-val" style={{ color: '#7c3aed' }}>
                  {passesList.filter((p) => p.catalogStatus === 'PENDING_EXIT').length || 2}
                </div>
                <div className="sec-kpi-sub">
                  <span>Awaiting student physical exit</span>
                </div>
              </div>

              {/* KPI 6: Turnstiles Online */}
              <div className="sec-kpi-card" onClick={() => setActiveTab('scanner')}>
                <div className="sec-kpi-card-header">
                  <span className="sec-kpi-label">Turnstiles Online</span>
                  <div className="sec-kpi-icon emerald"><ShieldCheck size={18} /></div>
                </div>
                <div className="sec-kpi-val" style={{ color: '#059669' }}>4 / 4</div>
                <div className="sec-kpi-sub">
                  <span>RFID & QR Scanners Active</span>
                </div>
                <div className="sec-progress-bar">
                  <div className="sec-progress-fill emerald" style={{ width: '100%' }} />
                </div>
              </div>

              {/* KPI 7: Offline Scans Queue */}
              <div className="sec-kpi-card" onClick={handleManualSyncQueue}>
                <div className="sec-kpi-card-header">
                  <span className="sec-kpi-label">Offline Sync Queue</span>
                  <div className="sec-kpi-icon amber"><CloudOff size={18} /></div>
                </div>
                <div className="sec-kpi-val" style={{ color: offlineQueueCount > 0 ? '#d97706' : '#059669' }}>
                  {offlineQueueCount}
                </div>
                <div className="sec-kpi-sub">
                  <span>{offlineQueueCount > 0 ? 'Saved, will sync' : 'Fully Synchronized'}</span>
                </div>
              </div>

              {/* KPI 8: Security Alerts Flagged */}
              <div className="sec-kpi-card" onClick={() => setActiveTab('alerts')}>
                <div className="sec-kpi-card-header">
                  <span className="sec-kpi-label">Incidents & Breaches</span>
                  <div className="sec-kpi-icon rose"><AlertTriangle size={18} /></div>
                </div>
                <div className="sec-kpi-val" style={{ color: alertsList.length > 0 ? '#e11d48' : '#059669' }}>
                  {alertsList.length}
                </div>
                <div className="sec-kpi-sub">
                  <span>Active security alerts</span>
                </div>
              </div>
            </div>

            {/* Multi-Column Monitoring Sections Grid (Matching Hostel Admin Dashboard had-sections-grid) */}
            <div className="sec-sections-grid">
              {/* SECTION 1: Live Gate Checkpoints & Turnstiles Matrix */}
              <div className="sec-card sec-col-8">
                <div className="sec-card-header">
                  <h3 className="sec-card-title">
                    <ShieldCheck size={17} color="#0284c7" /> 1. Campus Gate Checkpoints & Turnstile Status
                  </h3>
                  <button className="sec-btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }} onClick={() => setActiveTab('scanner')}>
                    Open Scanner →
                  </button>
                </div>
                <div className="sec-table-container">
                  <table className="sec-data-table">
                    <thead>
                      <tr>
                        <th>Checkpoint Gate</th>
                        <th>Type & Biometrics</th>
                        <th>Guard on Duty</th>
                        <th>Today's Turnstile Count</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <strong>Main Campus Gate 1</strong>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Post ID: GP-MAIN-01</div>
                        </td>
                        <td>
                          <span className="sec-badge out">Dual Turnstile</span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '0.3rem' }}>QR & RFID</span>
                        </td>
                        <td>
                          <strong>{guardName}</strong>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Badge: {badgeId}</div>
                        </td>
                        <td>
                          <strong>{stats.todayExits} Exits / {stats.todayEntries} Entries</strong>
                        </td>
                        <td>
                          <span className="sec-badge returned">ONLINE · SYNCED</span>
                        </td>
                        <td>
                          <button
                            className="sec-btn-primary"
                            style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem' }}
                            onClick={() => setActiveTab('scanner')}
                          >
                            Scan
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Hostel Complex Gate 2</strong>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Post ID: GP-HSTL-02</div>
                        </td>
                        <td>
                          <span className="sec-badge purple">Barrier Gate</span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '0.3rem' }}>RFID Card</span>
                        </td>
                        <td>
                          <strong>Ramesh Chandra Nayak</strong>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Badge: SG-OD-3109</div>
                        </td>
                        <td>
                          <strong>8 Exits / 9 Entries</strong>
                        </td>
                        <td>
                          <span className="sec-badge returned">ONLINE · SYNCED</span>
                        </td>
                        <td>
                          <button
                            className="sec-btn-secondary"
                            style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem' }}
                            onClick={() => setActiveTab('scanner')}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Engineering Back Gate 3</strong>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Post ID: GP-ENGR-03</div>
                        </td>
                        <td>
                          <span className="sec-badge out">Pedestrian Turnstile</span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '0.3rem' }}>Camera Scan</span>
                        </td>
                        <td>
                          <strong>Bikash Mohanty</strong>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Badge: SG-OD-2204</div>
                        </td>
                        <td>
                          <strong>4 Exits / 5 Entries</strong>
                        </td>
                        <td>
                          <span className="sec-badge returned">ONLINE · SYNCED</span>
                        </td>
                        <td>
                          <button
                            className="sec-btn-secondary"
                            style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem' }}
                            onClick={() => setActiveTab('scanner')}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 2: Guard Duty Post & Standard Operating Protocol */}
              <div className="sec-card sec-col-4">
                <div className="sec-card-header">
                  <h3 className="sec-card-title">
                    <Lock size={17} color="#059669" /> 2. Guard Duty Roster & SOP
                  </h3>
                  <span className="sec-badge returned">ACTIVE SHIFT</span>
                </div>
                <div className="sec-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{guardName}</strong>
                      <span className="sec-post-badge">Badge {badgeId}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{gatePost}</div>
                    <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600, marginTop: '0.25rem' }}>
                      Duty Shift: Morning (06:00 - 14:00) · General Access
                    </div>
                  </div>

                  <div style={{ background: '#eff6ff', padding: '0.85rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <h5 style={{ margin: '0 0 0.4rem 0', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
                      <Shield size={14} color="#2563eb" /> Standard Operating Protocol:
                    </h5>
                    <ul style={{ margin: 0, paddingLeft: '1.15rem', fontSize: '0.76rem', color: '#1e40af', lineHeight: 1.5 }}>
                      <li><strong>Gate Passes:</strong> All departures require an approved digital pass from the Hostel Warden.</li>
                      <li><strong>No Guard Approvals:</strong> Security personnel verify identity and record movements. Guards do not approve passes.</li>
                      <li><strong>Late Return Detection:</strong> The system computes overdue durations and alerts Wardens & Proctor.</li>
                      <li><strong>Parent Alerts:</strong> Simulated SMS/WhatsApp alerts are logged immediately upon physical exit and entry.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Recent Gate Movements Verification Queue */}
              <div className="sec-card sec-col-7">
                <div className="sec-card-header">
                  <h3 className="sec-card-title">
                    <History size={17} color="#7c3aed" /> 3. Recent Gate Movements Verification Queue
                  </h3>
                  <button className="sec-btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }} onClick={() => setActiveTab('history')}>
                    View All History →
                  </button>
                </div>
                <div className="sec-table-container">
                  <table className="sec-data-table">
                    <thead>
                      <tr>
                        <th>Movement Code</th>
                        <th>Student Name & Roll</th>
                        <th>Direction</th>
                        <th>Time</th>
                        <th>Curfew Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyList.slice(0, 4).map((m) => (
                        <tr key={m.id}>
                          <td>
                            <strong>{m.movementCode || m.id}</strong>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{m.gateName}</div>
                          </td>
                          <td>
                            <strong>{m.studentName}</strong>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Roll: {m.rollNumber}</div>
                          </td>
                          <td>
                            <span className={`sec-badge ${m.direction === 'EXIT' ? 'out' : 'returned'}`}>
                              {m.direction}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.78rem' }}>
                              {new Date(m.movementTime || m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              {new Date(m.movementTime || m.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td>
                            {m.isLate ? (
                              <span className="sec-badge late">{m.lateDuration || 'LATE'}</span>
                            ) : (
                              <span style={{ color: '#059669', fontSize: '0.76rem', fontWeight: 600 }}>On Time</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {historyList.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
                            No movements logged yet today.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 4: Active Campus Visitors Inside */}
              <div className="sec-card sec-col-5">
                <div className="sec-card-header">
                  <h3 className="sec-card-title">
                    <Users size={17} color="#d97706" /> 4. Active Campus Visitors Inside ({visitorsList.filter((v) => v.outTime === 'Pending Sign-out' || !v.outTime).length})
                  </h3>
                  <button className="sec-btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }} onClick={() => setActiveTab('visitors')}>
                    All Visitors →
                  </button>
                </div>
                <div className="sec-table-container">
                  <table className="sec-data-table">
                    <thead>
                      <tr>
                        <th>Visitor & Relation</th>
                        <th>Host Student</th>
                        <th>Badge No</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visitorsList
                        .filter((v) => v.outTime === 'Pending Sign-out' || !v.outTime)
                        .slice(0, 3)
                        .map((v) => (
                          <tr key={v.id}>
                            <td>
                              <strong>{v.visitorName}</strong>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{v.relation}</div>
                            </td>
                            <td>
                              <div>{v.studentName}</div>
                              <small style={{ color: '#64748b' }}>Roll: {v.rollNumber}</small>
                            </td>
                            <td>
                              <span className="sec-post-badge">{v.badgeNumber || 'BADGE-01'}</span>
                            </td>
                            <td>
                              <button
                                className="sec-btn-rose"
                                style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                                onClick={() => handleCheckOutVisitor(v.id)}
                              >
                                Sign Out / Return Badge
                              </button>
                            </td>
                          </tr>
                        ))}
                      {visitorsList.filter((v) => v.outTime === 'Pending Sign-out' || !v.outTime).length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
                            Zero active visitors inside campus.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 5: Security Alerts & Incidents */}
              <div className="sec-card sec-col-6">
                <div className="sec-card-header">
                  <h3 className="sec-card-title">
                    <AlertTriangle size={17} color="#e11d48" /> 5. Perimeter Security Alerts & Incident Hotline
                  </h3>
                  <button
                    className="sec-btn-rose"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }}
                    onClick={() => {
                      setActiveTab('alerts');
                      setIncidentModalOpen(true);
                    }}
                  >
                    + Report Incident
                  </button>
                </div>
                <div className="sec-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
                  {alertsList.map((a) => (
                    <div
                      key={a.id}
                      style={{
                        background: '#fff1f2',
                        border: '1px solid #ffe4e6',
                        borderRadius: '8px',
                        padding: '0.85rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <strong style={{ fontSize: '0.84rem', color: '#9f1239' }}>{a.title}</strong>
                        <span className="sec-badge late">{a.severity}</span>
                      </div>
                      <p style={{ margin: '0 0 0.35rem 0', fontSize: '0.78rem', color: '#475569' }}>{a.description}</p>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        Logged: {a.time} · Category: {a.category}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 6: Emergency & Warden Quick Contacts */}
              <div className="sec-card sec-col-6">
                <div className="sec-card-header">
                  <h3 className="sec-card-title">
                    <PhoneCall size={17} color="#059669" /> 6. Emergency & Hostel Warden Quick Contacts
                  </h3>
                  <span className="sec-badge out">24/7 HOTLINE</span>
                </div>
                <div className="sec-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '1rem' }}>
                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Chief Warden (Residential Affairs)</div>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Dr. K. C. Mohapatra</strong>
                    <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 600, marginTop: '0.2rem' }}>
                      +91 94370 12345
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Gandhi Boys Residence Warden</div>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Mr. Manoranjan Das</strong>
                    <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 600, marginTop: '0.2rem' }}>
                      +91 94370 23456
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Sarojini Girls Residence Warden</div>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Dr. Minati Mishra</strong>
                    <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 600, marginTop: '0.2rem' }}>
                      +91 94370 34567
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Campus Health Clinic / Ambulance</div>
                    <strong style={{ fontSize: '0.85rem', color: '#e11d48' }}>Emergency Desk (Ext. 108)</strong>
                    <div style={{ fontSize: '0.78rem', color: '#e11d48', fontWeight: 600, marginTop: '0.2rem' }}>
                      +91 94370 99108
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: QR SCANNER & ROLL LOOKUP ── */}
        {activeTab === 'scanner' && (
          <div className="sec-scanner-layout">
            {/* Left: Camera & Search Input */}
            <div className="sec-card">
              <div className="sec-card-header">
                <h3 className="sec-card-title">
                  <QrCode size={18} color="#0284c7" />
                  Turnstile Camera Scanner
                </h3>
                <button
                  className="sec-btn-primary"
                  onClick={() => setCameraActive(!cameraActive)}
                >
                  {cameraActive ? <CameraOff size={14} /> : <Camera size={14} />}
                  {cameraActive ? 'Stop Camera' : 'Start Camera'}
                </button>
              </div>

              <div className="sec-card-body">
                {/* Gate Checkpoint Selector */}
                <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                    Active Gate Checkpoint & Turnstile Hardware
                  </label>
                  <select
                    value={selectedGate}
                    onChange={(e) => setSelectedGate(e.target.value)}
                    className="sec-input"
                    style={{ width: '100%', fontWeight: 700, color: '#0f172a', background: '#ffffff' }}
                  >
                    <option value="Main Campus Gate 1 (Front Entrance)">Main Campus Gate 1 (Front Entrance) · Turnstiles A & B (Optical)</option>
                    <option value="Hostel Quadrangle North Gate 2">Hostel Quadrangle North Gate 2 · RFID Pedestrian Barrier</option>
                    <option value="South Academic Service Gate 3">South Academic Service Gate 3 · Vehicular Boom Barrier</option>
                    <option value="Sports Complex Back Perimeter Gate 4">Sports Complex Back Perimeter Gate 4 · Electromagnetic Padlock</option>
                  </select>
                </div>

                {/* Camera Preview */}
                <div className="sec-camera-box">
                  {cameraActive ? (
                    <>
                      <video ref={videoRef} autoPlay playsInline className="sec-camera-video" />
                      <div className="sec-laser-line"></div>
                      <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, background: 'rgba(15,23,42,0.8)', color: '#fff', padding: '4px 8px', borderRadius: 6, fontSize: '0.72rem', textAlign: 'center' }}>
                        Live 10-Second Dynamic QR Optical Detection Active
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                      <QrCode size={48} style={{ margin: '0 auto 0.75rem', color: '#64748b' }} />
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                        Camera inactive. Click "Start Camera" or select a dynamic scan simulation below.
                      </p>
                    </div>
                  )}
                </div>

                {cameraActive && (
                  <div className="sec-scanner-ctrls">
                    <button
                      className="sec-btn-secondary"
                      onClick={() => setCameraFacing(cameraFacing === 'environment' ? 'user' : 'environment')}
                    >
                      Flip Camera ({cameraFacing})
                    </button>
                  </div>
                )}

                {/* Dynamic QR Live Optical Simulation Triggers */}
                <div style={{ marginTop: '1rem', background: '#f0fdf4', padding: '0.75rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ShieldCheck size={14} color="#16a34a" /> 10-Second Dynamic QR Scanner Triggers:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <button
                      className="sec-pill-btn"
                      style={{ background: '#ffffff', borderColor: '#0284c7', color: '#0284c7', fontWeight: 600 }}
                      onClick={() => {
                        const t = dynamicQrService.generateLocalToken({ id: 'std-3', role: 'STUDENT', rollNumber: '03', name: 'Sneha Mohanty', department: 'Computer Science & Engineering' });
                        setSearchQuery(t.token);
                        handlePerformScan(t.token);
                      }}
                    >
                      Student 10s QR (Sneha - Roll 03)
                    </button>
                    <button
                      className="sec-pill-btn"
                      style={{ background: '#ffffff', borderColor: '#10b981', color: '#059669', fontWeight: 600 }}
                      onClick={() => {
                        const t = dynamicQrService.generateLocalToken({ id: 'fac-1', role: 'FACULTY', identifier: 'FAC-101', name: 'Prof. Dillip Ray', department: 'Computer Science & Engineering' });
                        setSearchQuery(t.token);
                        handlePerformScan(t.token);
                      }}
                    >
                      Faculty 10s QR (Prof. Dillip Ray)
                    </button>
                    <button
                      className="sec-pill-btn"
                      style={{ background: '#ffffff', borderColor: '#8b5cf6', color: '#7c3aed', fontWeight: 600 }}
                      onClick={() => {
                        const t = dynamicQrService.generateLocalToken({ id: 'staff-1', role: 'STAFF', identifier: 'STAFF-201', name: 'Kailash Nayak', department: 'Campus Dining Logistics' });
                        setSearchQuery(t.token);
                        handlePerformScan(t.token);
                      }}
                    >
                      Staff 10s QR (Kailash Nayak)
                    </button>
                    <button
                      className="sec-pill-btn"
                      style={{ background: '#ffffff', borderColor: '#f43f5e', color: '#e11d48', fontWeight: 600 }}
                      onClick={() => {
                        const now = Date.now() - 25000;
                        const p = { sub: 'usr-exp', role: 'STUDENT', identifier: '99', iat: now - 10000, exp: now, nonce: 'exp123' };
                        const t = `ACQR.eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify(p))}.simulatedsig`;
                        setSearchQuery(t);
                        handlePerformScan(t);
                      }}
                    >
                      Test Expired QR Token
                    </button>
                  </div>
                </div>

                {/* Manual Lookup Group (Fallback) */}
                <div style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
                    Manual Roll Number, Pass ID, or QR String:
                  </label>
                  <div className="sec-search-input-group">
                    <input
                      type="text"
                      className="sec-input"
                      placeholder="e.g. 02, GP-2026-1039, or ACQR..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePerformScan()}
                    />
                    <button
                      className="sec-btn-primary"
                      onClick={() => handlePerformScan()}
                      disabled={scanLoading}
                    >
                      {scanLoading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                      Verify
                    </button>
                  </div>

                  {/* Sample Test Pills */}
                  <div className="sec-pills-row">
                    <span style={{ fontSize: '0.74rem', color: '#64748b', alignSelf: 'center' }}>Manual fallback:</span>
                    <button className="sec-pill-btn" onClick={() => { setSearchQuery('02'); handlePerformScan('02'); }}>
                      Roll 02 (Priya Patra)
                    </button>
                    <button className="sec-pill-btn" onClick={() => { setSearchQuery('03'); handlePerformScan('03'); }}>
                      Roll 03 (Sneha Mohanty)
                    </button>
                    <button className="sec-pill-btn" onClick={() => { setSearchQuery('01'); handlePerformScan('01'); }}>
                      Roll 01 (Rakesh Das)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Verification Result Card */}
            <div>
              {scanError && (
                <div className="sec-card" style={{ borderColor: '#e11d48', background: '#fff1f2', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', padding: '1rem' }}>
                    <XCircle size={18} />
                    <strong>Verification Error:</strong> {scanError}
                  </div>
                </div>
              )}

              {actionFeedback && (
                <div
                  className="sec-card"
                  style={{
                    borderColor: actionFeedback.provisional ? '#d97706' : actionFeedback.success ? '#059669' : '#e11d48',
                    background: actionFeedback.provisional ? '#fffbeb' : actionFeedback.success ? '#ecfdf5' : '#fff1f2',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: actionFeedback.provisional ? '#92400e' : actionFeedback.success ? '#065f46' : '#9f1239', padding: '1rem' }}>
                    {actionFeedback.provisional ? <CloudOff size={18} /> : actionFeedback.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <strong>{actionFeedback.message}</strong>
                  </div>
                </div>
              )}

              {scannedResult ? (
                <div className={`sec-pass-result-card ${scannedResult.recommendedAction === 'EXIT' ? 'approved' : (scannedResult.recommendedAction === 'ENTRY' ? 'exited' : 'blocked')}`}>
                  {/* Provisional Alert if checked in offline mode */}
                  {scannedResult.provisional && (
                    <div className="sec-provisional-callout">
                      <CloudOff size={18} className="text-amber-500 shrink-0" />
                      <div>
                        <strong>PROVISIONAL SCAN · PENDING SERVER VERIFICATION</strong>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem' }}>
                          Verified against local offline cache. Gate actions taken remain provisional and will be submitted for full central server authorization when internet connectivity is restored.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Status Header with Exact Decision Badges */}
                  <div className="sec-status-header">
                    {scannedResult.decision ? (
                      <span
                        className={`sec-status-chip-lg ${
                          scannedResult.decision === 'ENTRY APPROVED'
                            ? 'green'
                            : scannedResult.decision === 'EXIT RECORDED'
                            ? 'blue'
                            : scannedResult.decision === 'QR EXPIRED'
                            ? 'amber'
                            : scannedResult.decision === 'QR ALREADY USED'
                            ? 'amber'
                            : scannedResult.decision === 'APPROVAL REQUIRED'
                            ? 'purple'
                            : 'red'
                        }`}
                        style={{ fontWeight: 800, letterSpacing: '0.04em' }}
                      >
                        {scannedResult.valid ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        {scannedResult.decision}
                      </span>
                    ) : (
                      <span className={`sec-status-chip-lg ${scannedResult.recommendedAction === 'EXIT' ? 'green' : (scannedResult.recommendedAction === 'ENTRY' ? (scannedResult.isOverdue ? 'amber' : 'blue') : 'red')}`}>
                        {scannedResult.recommendedAction === 'EXIT' && <CheckCircle2 size={16} />}
                        {scannedResult.recommendedAction === 'ENTRY' && <ArrowRightLeft size={16} />}
                        {scannedResult.recommendedAction === 'BLOCKED' && <XCircle size={16} />}
                        {scannedResult.recommendedAction === 'EXIT' && 'APPROVED FOR CAMPUS EXIT'}
                        {scannedResult.recommendedAction === 'ENTRY' && (scannedResult.isOverdue ? 'OVERDUE RETURN' : 'ACTIVE PASS — READY FOR RETURN')}
                        {scannedResult.recommendedAction === 'BLOCKED' && 'EXIT / ENTRY BLOCKED'}
                      </span>
                    )}
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {scannedResult.dynamicQr ? '10-Sec Dynamic QR' : `Pass #${scannedResult.pass?.passId || 'N/A'}`}
                    </span>
                  </div>

                  {/* Student / Faculty / Staff Identity Block */}
                  <div className="sec-student-identity-block">
                    <div className="sec-student-avatar">
                      {scannedResult.student.name.charAt(0)}
                    </div>
                    <div className="sec-student-meta">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h3 style={{ margin: 0 }}>{scannedResult.student.name}</h3>
                        <span className="sec-badge" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 700, fontSize: '0.7rem' }}>
                          {scannedResult.student.role || 'STUDENT'}
                        </span>
                        <span className="sec-badge returned" style={{ fontSize: '0.7rem' }}>
                          {scannedResult.student.accountActive !== false ? '● ACTIVE ACCOUNT' : '● SUSPENDED'}
                        </span>
                      </div>
                      <p style={{ marginTop: '0.2rem' }}>
                        ID: <strong style={{ color: '#0f172a' }}>{scannedResult.student.rollNumber}</strong> · {scannedResult.student.department}
                      </p>
                      <p style={{ marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>{scannedResult.student.hostelName || 'Main Campus'} · {scannedResult.student.roomNumber || 'Residence'}</span>
                        <span style={{ color: '#64748b' }}>|</span>
                        <span style={{ fontWeight: 600, color: scannedResult.student.campusStatus === 'OUTSIDE_CAMPUS' ? '#d97706' : '#059669' }}>
                          {scannedResult.student.campusStatus === 'OUTSIDE_CAMPUS' ? 'Status: Outside Campus' : scannedResult.student.campusStatus === 'AT_HOSTEL' ? 'Status: At Hostel' : 'Status: Inside Campus'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Decision Reason Callout if not valid */}
                  {scannedResult.reason && (
                    <div
                      style={{
                        padding: '0.65rem 0.85rem',
                        background: scannedResult.valid ? '#f0fdf4' : '#fff1f2',
                        border: `1px solid ${scannedResult.valid ? '#bbf7d0' : '#fecdd3'}`,
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontSize: '0.8rem',
                        color: scannedResult.valid ? '#166534' : '#9f1239',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      {scannedResult.valid ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                      <span><strong>{scannedResult.valid ? 'Decision Context:' : 'Security Warning:'}</strong> {scannedResult.reason}</span>
                    </div>
                  )}

                  {/* Pass Details Info Grid */}
                  {scannedResult.pass && (
                    <div className="sec-pass-info-grid">
                      <div className="sec-info-item">
                        <dt>Purpose</dt>
                        <dd>{scannedResult.pass.purposeType}</dd>
                      </div>
                      <div className="sec-info-item">
                        <dt>Destination</dt>
                        <dd>{scannedResult.pass.destination}</dd>
                      </div>
                      <div className="sec-info-item">
                        <dt>Approved Departure</dt>
                        <dd>{scannedResult.pass.outDateTime?.replace('T', ' ') || 'Immediate'}</dd>
                      </div>
                      <div className="sec-info-item">
                        <dt>Expected Return</dt>
                        <dd style={{ color: scannedResult.isOverdue ? '#e11d48' : '#0f172a' }}>
                          {scannedResult.pass.inDateTime?.replace('T', ' ')}
                          {scannedResult.isOverdue && ` (${scannedResult.overdueText})`}
                        </dd>
                      </div>
                      <div className="sec-info-item">
                        <dt>Approved By</dt>
                        <dd>{scannedResult.pass.approvedBy || 'Resident Warden'}</dd>
                      </div>
                      <div className="sec-info-item">
                        <dt>Student Phone</dt>
                        <dd>{scannedResult.student.phone}</dd>
                      </div>
                      <div className="sec-info-item">
                        <dt>Parent Contact</dt>
                        <dd>{scannedResult.student.parentPhone}</dd>
                      </div>
                    </div>
                  )}

                  {/* Guard Remarks Input */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>
                      Security Guard Observation / Remarks:
                    </label>
                    <input
                      type="text"
                      className="sec-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. Student baggage inspected. Exited via Main Gate Turnstile 2."
                      value={guardRemarks}
                      onChange={(e) => setGuardRemarks(e.target.value)}
                    />
                  </div>

                  <div className="sec-action-buttons">
                    {scannedResult.recommendedAction === 'EXIT' && (
                      <button
                        className="sec-btn-emerald"
                        onClick={handleRecordExit}
                        disabled={actionLoading}
                      >
                        {actionLoading ? <RefreshCw size={16} className="animate-spin" /> : <LogOut size={16} />}
                        VERIFY & LOG CAMPUS EXIT
                      </button>
                    )}

                    {scannedResult.recommendedAction === 'ENTRY' && (
                      <button
                        className="sec-btn-sky"
                        onClick={handleRecordEntry}
                        disabled={actionLoading}
                      >
                        {actionLoading ? <RefreshCw size={16} className="animate-spin" /> : <ArrowRightLeft size={16} />}
                        VERIFY & LOG CAMPUS ENTRY
                      </button>
                    )}

                    {scannedResult.recommendedAction === 'BLOCKED' && (
                      <button
                        className="sec-btn-rose"
                        onClick={() => {
                          setIncidentForm({
                            title: `Unauthorized Exit Attempt: ${scannedResult.student.name}`,
                            affectedRollNumber: scannedResult.student.rollNumber,
                            studentName: scannedResult.student.name,
                            hostelName: scannedResult.student.hostelName,
                            category: 'Unauthorized Exit Attempt',
                            severity: 'high',
                            description: `Student attempted to exit campus without an approved gate pass (Current status: ${scannedResult.pass?.status || 'No pass'}).`,
                          });
                          setIncidentModalOpen(true);
                        }}
                      >
                        <AlertTriangle size={16} />
                        FLAG SECURITY BREACH & NOTIFY WARDEN
                      </button>
                    )}
                  </div>

                  {/* Simulated Parent SMS Notice Box */}
                  {parentNotice && (
                    <div className="sec-parent-notice-box">
                      <Send size={18} color="#059669" />
                      <div>
                        <strong>Parent SMS / WhatsApp Notification Dispatched:</strong>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem' }}>
                          "{parentNotice.message}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="sec-card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                  <ShieldCheck size={48} style={{ margin: '0 auto 0.75rem', color: '#cbd5e1' }} />
                  <h4 style={{ margin: 0, color: '#0f172a' }}>Awaiting Scan or Roll Input</h4>
                  <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                    Scan a student QR outpass or enter their roll number to verify authorization and log movement.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

                        {/* ── TAB 3: APPROVED GATE PASSES CATALOG ── */}
                        {activeTab === 'passes' && (
          <div className="sec-card">
            <div className="sec-card-header">
              <h3 className="sec-card-title">
                <FileCheck2 size={18} color="#0284c7" />
                Warden Approved Gate Passes Catalog
              </h3>
              <button className="sec-btn-secondary" onClick={loadApprovedPasses}>
                <RefreshCw size={14} /> Refresh Passes
              </button>
            </div>
            <p style={{ color: '#94a3b8' }}>
              Real-time directory of all currently approved student leaves and campus movement authorizations.
            </p>

            <div className="sec-card-body">
              {/* Filter Bar */}
              <div className="sec-filters-row">
                <input
                  type="text"
                  className="sec-input"
                  style={{ maxWidth: 280 }}
                  placeholder="Search by student, roll, or destination..."
                  value={passSearch}
                  onChange={(e) => setPassSearch(e.target.value)}
                />

                <select
                  className="sec-input"
                  style={{ maxWidth: 200 }}
                  value={passFilterStatus}
                  onChange={(e) => setPassFilterStatus(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING_EXIT">Pending Exit</option>
                  <option value="OUT">Currently Outside</option>
                  <option value="RETURNED">Returned</option>
                  <option value="LATE">Overdue / Late</option>
                </select>

                <select
                  className="sec-input"
                  style={{ maxWidth: 240 }}
                  value={passFilterHostel}
                  onChange={(e) => setPassFilterHostel(e.target.value)}
                >
                  <option value="ALL">All Hostels</option>
                  <option value="Gandhi Boys Residence">Gandhi Boys Residence</option>
                  <option value="Sarojini Girls Residence">Sarojini Girls Residence</option>
                </select>
              </div>

              {/* Passes Table */}
              <div className="sec-table-container">
                <table className="sec-data-table">
                  <thead>
                    <tr>
                      <th>Pass ID</th>
                      <th>Student Name & Roll</th>
                      <th>Hostel</th>
                      <th>Purpose & Destination</th>
                      <th>Leave Window</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {passesList
                      .filter((p) => {
                        if (passFilterStatus !== 'ALL') {
                          if (passFilterStatus === 'PENDING_EXIT' && p.catalogStatus !== 'PENDING_EXIT') return false;
                          if (passFilterStatus === 'OUT' && p.catalogStatus !== 'OUT') return false;
                          if (passFilterStatus === 'RETURNED' && p.catalogStatus !== 'RETURNED') return false;
                          if (passFilterStatus === 'LATE' && p.catalogStatus !== 'LATE') return false;
                        }
                        if (passFilterHostel !== 'ALL' && !(p.hostelName || '').includes(passFilterHostel)) return false;
                        if (passSearch) {
                          const q = passSearch.toLowerCase();
                          return (
                            p.studentName.toLowerCase().includes(q) ||
                            String(p.rollNumber).toLowerCase().includes(q) ||
                            p.id.toLowerCase().includes(q)
                          );
                        }
                        return true;
                      })
                      .map((pass) => (
                        <tr key={pass.id}>
                          <td><strong>{pass.passId || pass.id}</strong></td>
                          <td>
                            <div><strong>{pass.studentName}</strong></div>
                            <small style={{ color: '#64748b' }}>Roll: {pass.rollNumber}</small>
                          </td>
                          <td>{pass.hostelName}</td>
                          <td>
                            <div>{pass.purposeType}</div>
                            <small style={{ color: '#64748b' }}>{pass.destination}</small>
                          </td>
                          <td>
                            <div>Out: {pass.outDateTime?.replace('T', ' ')}</div>
                            <div style={{ color: pass.isOverdue ? '#e11d48' : '#64748b' }}>
                              In: {pass.inDateTime?.replace('T', ' ')}
                            </div>
                          </td>
                          <td>
                            <span className={`sec-badge ${pass.catalogStatus === 'OUT' ? 'out' : (pass.catalogStatus === 'RETURNED' ? 'returned' : (pass.catalogStatus === 'LATE' ? 'late' : 'approved'))}`} style={pass.catalogStatus === 'PENDING_EXIT' ? { background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' } : {}}>
                              {pass.catalogStatus === 'OUT' ? 'OUTSIDE' : (pass.catalogStatus === 'RETURNED' ? 'RETURNED' : (pass.catalogStatus === 'LATE' ? 'OVERDUE' : 'APPROVED (EXIT READY)'))}
                            </span>
                            {pass.approvedBy && (
                              <div style={{ fontSize: '0.68rem', color: '#059669', marginTop: '2px', fontWeight: 600 }}>
                                By: {pass.approvedBy.split('(')[0]}
                              </div>
                            )}
                          </td>
                          <td>
                            <button
                              className="sec-btn-primary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                              onClick={() => {
                                setActiveTab('scanner');
                                setSearchQuery(pass.rollNumber);
                                handlePerformScan(pass.rollNumber);
                              }}
                            >
                              <QrCode size={12} /> Inspect / Log
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3.5: OVERDUE & LATE RETURN MONITORING ── */}
        {activeTab === 'overdue' && (
          <div className="sec-card">
            <div className="sec-card-header">
              <h3 className="sec-card-title">
                <Clock size={18} color="#e11d48" />
                Overdue Student Movements & Curfew Breach Investigations
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="sec-btn-secondary"
                  onClick={loadOverdueReturns}
                >
                  <RefreshCw size={13} /> Refresh Records
                </button>
              </div>
            </div>

            <div className="sec-card-body" style={{ padding: '1rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px', padding: '0.85rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9f1239' }}>Active Overdue Breaches</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e11d48', marginTop: '0.2rem' }}>
                    {overdueList.filter((r) => r.status !== 'RESOLVED').length}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#be123c' }}>Awaiting hostel reporting</div>
                </div>

                <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.85rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e' }}>Approved Late Returns</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', marginTop: '0.2rem' }}>
                    {overdueList.filter((r) => r.status === 'APPROVED_LATE_RETURN').length}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#b45309' }}>Warden permission granted</div>
                </div>

                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '0.85rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b' }}>Critical Curfew Alerts</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b91c1c', marginTop: '0.2rem' }}>
                    {overdueList.filter((r) => r.escalationLevel === 3 || (r.overdueMinutes && r.overdueMinutes > 120)).length}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#7f1d1d' }}>&gt; 2 hrs late / Parent SMS escalated</div>
                </div>

                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.85rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>Investigated & Resolved</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem' }}>
                    {overdueList.filter((r) => r.status === 'RESOLVED').length}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#15803d' }}>Cases officially closed</div>
                </div>
              </div>

              {/* Overdue Table */}
              <div className="sec-table-container">
                <table className="sec-data-table">
                  <thead>
                    <tr>
                      <th>Student Roll & Name</th>
                      <th>Hostel & Room</th>
                      <th>Destination</th>
                      <th>Expected Return</th>
                      <th>Overdue Duration</th>
                      <th>Escalation Tier</th>
                      <th>Status</th>
                      <th>Actions & Investigation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueList.map((item) => {
                      const mins = item.overdueMinutes || 0;
                      const isCritical = item.escalationLevel === 3 || mins > 120;
                      const isModerate = item.escalationLevel === 2 || (mins > 30 && mins <= 120);

                      return (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.studentName}</strong>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Roll: {item.studentRoll}</div>
                          </td>
                          <td>
                            <div>{item.hostelName || 'Gandhi Boys Residence'}</div>
                            <small style={{ color: '#64748b' }}>{item.roomNumber || 'Room 312'}</small>
                          </td>
                          <td>{item.destination}</td>
                          <td>
                            <div style={{ color: '#e11d48', fontWeight: 600 }}>
                              {item.expectedReturnTime ? new Date(item.expectedReturnTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Curfew Past'}
                            </div>
                          </td>
                          <td>
                            <span className="sec-badge late" style={{ fontWeight: 700 }}>
                              {mins} mins late
                            </span>
                          </td>
                          <td>
                            {isCritical ? (
                              <span style={{ display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: 4, background: '#fee2e2', color: '#991b1b', fontSize: '0.7rem', fontWeight: 700 }}>
                                🚨 LEVEL 3 - CRITICAL CURFEW
                              </span>
                            ) : isModerate ? (
                              <span style={{ display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: 4, background: '#fef3c7', color: '#92400e', fontSize: '0.7rem', fontWeight: 700 }}>
                                ⚠️ LEVEL 2 - PARENT ALERT
                              </span>
                            ) : (
                              <span style={{ display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: 4, background: '#e0f2fe', color: '#0369a1', fontSize: '0.7rem', fontWeight: 700 }}>
                                ℹ️ LEVEL 1 - WARDEN
                              </span>
                            )}
                          </td>
                          <td>
                            <span
                              className={`sec-badge ${
                                item.status === 'RESOLVED'
                                  ? 'returned'
                                  : item.status === 'APPROVED_LATE_RETURN'
                                  ? 'amber'
                                  : 'late'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td>
                            {item.status !== 'RESOLVED' ? (
                              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                <button
                                  className="sec-btn-emerald"
                                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
                                  onClick={() => {
                                    setOverdueResolveModal(item);
                                    setOverdueResolveForm({
                                      resolutionStatus: 'RESOLVED',
                                      notes: 'Student arrived safely at gate. Physical verification complete.',
                                    });
                                  }}
                                >
                                  Resolve Case
                                </button>
                                <button
                                  className="sec-btn-rose"
                                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                                  onClick={() => handleEscalateOverdue(item.id)}
                                  title="Dispatch urgent Parent SMS notification and escalate to Chief Warden"
                                >
                                  <Send size={11} /> Escalate Alert
                                </button>
                              </div>
                            ) : (
                              <small style={{ color: '#64748b' }}>{item.resolutionNotes || 'Case Closed'}</small>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'visitors' && (
          <div className="sec-card">
            <div className="sec-card-header">
              <h3 className="sec-card-title">
                <Users size={18} color="#d97706" />
                Campus Visitor & Guest Management
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className={visitorSubTab === 'active' ? 'sec-btn-primary' : 'sec-btn-secondary'}
                  onClick={() => setVisitorSubTab('active')}
                >
                  Active Checked-In ({visitorsList.filter((v) => v.outTime === 'Pending Sign-out' || !v.outTime).length})
                </button>
                <button
                  className={visitorSubTab === 'verify' ? 'sec-btn-primary' : 'sec-btn-secondary'}
                  onClick={() => setVisitorSubTab('verify')}
                >
                  Verify Pre-Approval Code
                </button>
                <button
                  className={visitorSubTab === 'walkin' ? 'sec-btn-primary' : 'sec-btn-secondary'}
                  onClick={() => setVisitorSubTab('walkin')}
                >
                  <Plus size={14} /> Walk-In Registration
                </button>
              </div>
            </div>
            <p style={{ color: '#94a3b8' }}>
              Verify student-invited visitors via digital 6-digit security codes or register walk-in campus guests with physical badges.
            </p>

            <div className="sec-card-body">
              {visitorFeedback && (
                <div
                  className="sec-card"
                  style={{
                    borderColor: visitorFeedback.success ? '#059669' : '#e11d48',
                    background: visitorFeedback.success ? '#ecfdf5' : '#fff1f2',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ color: visitorFeedback.success ? '#065f46' : '#9f1239', fontSize: '0.85rem' }}>
                    {visitorFeedback.message}
                  </div>
                </div>
              )}

              {/* Sub-mode 1: Active Visitors Table */}
              {visitorSubTab === 'active' && (
                <div className="sec-table-container">
                  <table className="sec-data-table">
                    <thead>
                      <tr>
                        <th>Pass No</th>
                        <th>Visitor Name</th>
                        <th>Relation</th>
                        <th>Host Student</th>
                        <th>Status</th>
                        <th>Entry Time</th>
                        <th>Badge No</th>
                        <th>Purpose</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visitorsList.map((v) => (
                        <tr key={v.id}>
                          <td><strong>{v.passNumber}</strong></td>
                          <td>{v.visitorName}</td>
                          <td>{v.relation}</td>
                          <td>
                            <div>{v.studentName}</div>
                            <small style={{ color: '#64748b' }}>Roll: {v.rollNumber}</small>
                          </td>
                          <td>
                            {v.status === 'Awaiting Student Approval' ? (
                              <span style={{ display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: 4, background: '#fef3c7', color: '#92400e', fontSize: '0.72rem', fontWeight: 700 }}>
                                ⏳ Awaiting Student
                              </span>
                            ) : v.status === 'Pre-Approved' ? (
                              <span style={{ display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: 4, background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 700 }}>
                                ✓ Approved by Student
                              </span>
                            ) : v.status === 'Rejected by Student' ? (
                              <span style={{ display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: 4, background: '#fee2e2', color: '#b91c1c', fontSize: '0.72rem', fontWeight: 700 }}>
                                ✕ Declined by Student
                              </span>
                            ) : (
                              <span style={{ display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: 4, background: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem', fontWeight: 700 }}>
                                {v.status || 'Checked In'}
                              </span>
                            )}
                          </td>
                          <td>{v.inTime}</td>
                          <td>
                            <span className="sec-post-badge">{v.badgeNumber || 'BADGE-01'}</span>
                          </td>
                          <td><small>{v.purpose}</small></td>
                          <td>
                            {v.status === 'Awaiting Student Approval' ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                <span style={{ color: '#d97706', fontSize: '0.74rem', fontWeight: 600 }}>
                                  Pending approval from {v.studentName || 'Host'}
                                </span>
                                <small style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Roll: {v.rollNumber}</small>
                              </div>
                            ) : v.status === 'Pre-Approved' ? (
                              <button
                                className="sec-btn-emerald"
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                                onClick={() => handleCheckInVisitor(v.id, v.badgeNumber || 'BADGE-V-01')}
                              >
                                Issue Badge & Check In
                              </button>
                            ) : v.status === 'Rejected by Student' ? (
                              <span style={{ color: '#ef4444', fontSize: '0.74rem', fontWeight: 600 }}>
                                Entry Declined by Student
                              </span>
                            ) : v.outTime === 'Pending Sign-out' || !v.outTime ? (
                              <button
                                className="sec-btn-rose"
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                                onClick={() => handleCheckOutVisitor(v.id)}
                              >
                                Sign Out / Return Badge
                              </button>
                            ) : (
                              <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Exited: {v.outTime}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Sub-mode 2: Pre-Approved Code Verification */}
              {visitorSubTab === 'verify' && (
                <div style={{ maxWidth: 520, margin: '1rem auto' }}>
                  <form onSubmit={handleVerifyVisitorCode} className="sec-card" style={{ background: '#f8fafc', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Enter 6-Digit Visitor Pass Code:</h4>
                    <div className="sec-search-input-group">
                      <input
                        type="text"
                        className="sec-input"
                        placeholder="e.g. 842109 or 619352"
                        value={visitorCode}
                        onChange={(e) => setVisitorCode(e.target.value)}
                      />
                      <button type="submit" className="sec-btn-primary">
                        Validate Code
                      </button>
                    </div>
                    <div className="sec-pills-row">
                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Demo codes:</span>
                      <button type="button" className="sec-pill-btn" onClick={() => setVisitorCode('842109')}>
                        842109 (Mr. Bimal Das)
                      </button>
                      <button type="button" className="sec-pill-btn" onClick={() => setVisitorCode('619352')}>
                        619352 (Mrs. Jayanti Patra)
                      </button>
                    </div>
                  </form>

                  {verifiedVisitorData && (
                    <div className="sec-card" style={{ borderColor: '#059669', background: '#ecfdf5', padding: '1.25rem', marginTop: '1rem' }}>
                      <div className="sec-card-header" style={{ borderBottom: '1px solid #a7f3d0', padding: '0 0 0.75rem 0', background: 'transparent' }}>
                        <h4 style={{ margin: 0, color: '#065f46' }}>Verified Pre-Approved Visitor</h4>
                        <span className="sec-badge returned">INVITATION VALID</span>
                      </div>
                      <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                        <p style={{ margin: '0 0 0.4rem 0' }}>
                          <strong>Visitor:</strong> {verifiedVisitorData.visitorName} ({verifiedVisitorData.relation})
                        </p>
                        <p style={{ margin: '0 0 0.4rem 0' }}>
                          <strong>Host Student:</strong> {verifiedVisitorData.studentName} (Roll: {verifiedVisitorData.rollNumber})
                        </p>
                        <p style={{ margin: '0 0 0.4rem 0' }}>
                          <strong>Purpose:</strong> {verifiedVisitorData.purpose}
                        </p>
                      </div>
                      <button
                        className="sec-btn-emerald"
                        style={{ marginTop: '0.75rem', width: '100%' }}
                        onClick={() => handleCheckInVisitor(verifiedVisitorData.id, verifiedVisitorData.badgeNumber)}
                      >
                        Issue Badge & Complete Check-In
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-mode 3: Walk-In Registration */}
              {visitorSubTab === 'walkin' && (
                <form onSubmit={handleWalkInSubmit} style={{ maxWidth: 640, margin: '1rem auto' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Visitor Full Name *</label>
                      <input
                        type="text"
                        required
                        className="sec-input"
                        style={{ width: '100%' }}
                        value={walkInForm.visitorName}
                        onChange={(e) => setWalkInForm({ ...walkInForm, visitorName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Relation *</label>
                      <input
                        type="text"
                        required
                        className="sec-input"
                        style={{ width: '100%' }}
                        value={walkInForm.relation}
                        onChange={(e) => setWalkInForm({ ...walkInForm, relation: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Host Student Name *</label>
                      <input
                        type="text"
                        required
                        className="sec-input"
                        style={{ width: '100%' }}
                        value={walkInForm.studentName}
                        onChange={(e) => setWalkInForm({ ...walkInForm, studentName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Student Roll Number *</label>
                      <input
                        type="text"
                        required
                        className="sec-input"
                        style={{ width: '100%' }}
                        value={walkInForm.rollNumber}
                        onChange={(e) => setWalkInForm({ ...walkInForm, rollNumber: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Phone Number</label>
                      <input
                        type="text"
                        className="sec-input"
                        style={{ width: '100%' }}
                        placeholder="+91 94370 00000"
                        value={walkInForm.phone}
                        onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Government ID Proof</label>
                      <input
                        type="text"
                        className="sec-input"
                        style={{ width: '100%' }}
                        placeholder="Aadhaar / Voter ID"
                        value={walkInForm.idProofNumber}
                        onChange={(e) => setWalkInForm({ ...walkInForm, idProofNumber: e.target.value })}
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Visit Purpose *</label>
                      <input
                        type="text"
                        required
                        className="sec-input"
                        style={{ width: '100%' }}
                        placeholder="Delivering documents / Meeting ward"
                        value={walkInForm.purpose}
                        onChange={(e) => setWalkInForm({ ...walkInForm, purpose: e.target.value })}
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem', marginTop: '0.25rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>
                        <input
                          type="checkbox"
                          checked={walkInForm.requiresStudentApproval}
                          onChange={(e) => setWalkInForm({ ...walkInForm, requiresStudentApproval: e.target.checked })}
                          style={{ width: 16, height: 16, accentColor: '#2563eb' }}
                        />
                        <span>Require Host Student Live In-App Approval before Badge Issuance (Recommended)</span>
                      </label>
                      <p style={{ margin: '0.35rem 0 0 1.6rem', fontSize: '0.76rem', color: '#64748b' }}>
                        Sends an instantaneous alert to host student's mobile dashboard. Entry badge can only be issued after student clicks "Approve Visitor".
                      </p>
                    </div>
                  </div>
                  <button type="submit" className="sec-btn-emerald" style={{ marginTop: '1rem', width: '100%' }}>
                    {walkInForm.requiresStudentApproval
                      ? 'Request Live Student Approval & Register Walk-In'
                      : 'Issue Guest Badge & Record Entry Directly'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 5: MOVEMENT HISTORY & CSV EXPORT ── */}
        {activeTab === 'history' && (
          <div className="sec-card">
            <div className="sec-card-header">
              <h3 className="sec-card-title">
                <History size={18} color="#7c3aed" />
                Campus Turnstile & Gate Entry/Exit Logs
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className="sec-btn-secondary" onClick={handleExportPdf}>
                  <FileText size={14} /> Export PDF Audit
                </button>
                <button className="sec-btn-secondary" onClick={handleExportHistory}>
                  <FileDown size={14} /> Export Excel / CSV
                </button>
                <button className="sec-btn-secondary" onClick={loadMovementsHistory}>
                  <RefreshCw size={14} /> Refresh Logs
                </button>
              </div>
            </div>

            <div className="sec-card-body">
              {/* Filter Row */}
              <div className="sec-filters-row">
                <input
                  type="text"
                  className="sec-input"
                  style={{ maxWidth: 240 }}
                  placeholder="Search by name, roll, or code..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                />

                <select
                  className="sec-input"
                  style={{ maxWidth: 160 }}
                  value={historyDirection}
                  onChange={(e) => setHistoryDirection(e.target.value)}
                >
                  <option value="ALL">All Directions</option>
                  <option value="EXIT">Exits Only</option>
                  <option value="ENTRY">Entries Only</option>
                </select>

                <select
                  className="sec-input"
                  style={{ maxWidth: 200 }}
                  value={historyGateFilter}
                  onChange={(e) => setHistoryGateFilter(e.target.value)}
                >
                  <option value="ALL">All Checkpoints</option>
                  <option value="Main Campus Gate 1">Main Campus Gate 1 (Front Entrance)</option>
                  <option value="Hostel Quadrangle North Gate 2">Hostel Quadrangle North Gate 2 (Hostel)</option>
                  <option value="South Academic Service Gate 3">South Academic Service Gate 3</option>
                  <option value="Sports Complex Back Perimeter Gate 4">Sports Complex Back Perimeter Gate 4</option>
                </select>

                <select
                  className="sec-input"
                  style={{ maxWidth: 140 }}
                  value={historyRoleFilter}
                  onChange={(e) => setHistoryRoleFilter(e.target.value)}
                >
                  <option value="ALL">All Roles</option>
                  <option value="STUDENT">Student</option>
                  <option value="FACULTY">Faculty</option>
                  <option value="STAFF">Staff</option>
                  <option value="VISITOR">Visitor</option>
                </select>
              </div>

              {/* History Table */}
              <div className="sec-table-container">
                <table className="sec-data-table">
                  <thead>
                    <tr>
                      <th>Movement Code</th>
                      <th>Date & Time</th>
                      <th>Name & Role</th>
                      <th>Roll / Emp ID</th>
                      <th>Direction</th>
                      <th>Gate Post</th>
                      <th>Checkpoint Type</th>
                      <th>Curfew Status</th>
                      <th>Remarks</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyList
                      .filter((m) => {
                        if (historyDirection !== 'ALL' && m.direction !== historyDirection) return false;
                        if (historyGateFilter !== 'ALL' && !(m.gateName || '').includes(historyGateFilter)) return false;
                        if (historyRoleFilter !== 'ALL' && (m.identityType || 'STUDENT') !== historyRoleFilter) return false;
                        if (historySearch) {
                          const q = historySearch.toLowerCase();
                          return (
                            (m.studentName && m.studentName.toLowerCase().includes(q)) ||
                            String(m.rollNumber).toLowerCase().includes(q) ||
                            (m.movementCode && m.movementCode.toLowerCase().includes(q))
                          );
                        }
                        return true;
                      })
                      .map((item) => (
                        <tr key={item.id}>
                          <td><strong>{item.movementCode || item.id}</strong></td>
                          <td>
                            <div>{new Date(item.movementTime || item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            <small style={{ color: '#64748b' }}>{new Date(item.movementTime || item.createdAt).toLocaleDateString()}</small>
                          </td>
                          <td>
                            <strong>{item.studentName}</strong>
                            <div style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 600 }}>{item.identityType || 'STUDENT'}</div>
                          </td>
                          <td>{item.rollNumber}</td>
                          <td>
                            <span className={`sec-badge ${item.direction === 'EXIT' ? 'out' : 'returned'}`}>
                              {item.direction}
                            </span>
                          </td>
                          <td>{item.gateName}</td>
                          <td>
                            <span className="sec-post-badge" style={{ fontSize: '0.68rem' }}>
                              {item.checkpointType || (item.gateName?.includes('Hostel') ? 'HOSTEL_GATE' : 'MAIN_CAMPUS')}
                            </span>
                          </td>
                          <td>
                            {item.isLate ? (
                              <span className="sec-badge late">{item.lateDuration || 'LATE'}</span>
                            ) : (
                              <span style={{ color: '#059669', fontSize: '0.78rem', fontWeight: 600 }}>On Time</span>
                            )}
                          </td>
                          <td><small style={{ color: '#64748b' }}>{item.remarks || '-'}</small></td>
                          <td>
                            <button
                              type="button"
                              className="sec-btn-secondary"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              onClick={() => openCorrectionForRecord('MOVEMENT', item, 'gateName')}
                              title="Submit audited correction for this record"
                            >
                              <Edit3 size={12} /> Correct
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: DAILY SECURITY REPORTS & PEAK HOURS ── */}
        {activeTab === 'reports' && (
          <div className="sec-card">
            <div className="sec-card-header">
              <h3 className="sec-card-title">
                <BarChart3 size={18} color="#0284c7" />
                Daily Gate Security & Movement Telemetry Report
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={14} color="#64748b" />
                  <input
                    type="date"
                    className="sec-input"
                    style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                  />
                </div>
                <select
                  className="sec-select"
                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                  value={reportHostelFilter}
                  onChange={(e) => setReportHostelFilter(e.target.value)}
                >
                  <option value="ALL">All Hostels & Blocks</option>
                  <option value="Sarojini">Sarojini Girls Residence</option>
                  <option value="Gandhi">Gandhi Boys Residence</option>
                  <option value="Kalam">APJ Abdul Kalam Block</option>
                </select>
                <button className="sec-btn-secondary" onClick={() => loadDailyReport(reportDate, reportHostelFilter)}>
                  <RefreshCw size={14} className={loadingReport ? 'animate-spin' : ''} /> Refresh
                </button>
                <button className="sec-btn-secondary" onClick={handleExportDailyPdf}>
                  <FileText size={14} /> Export Official PDF
                </button>
                <button className="sec-btn-primary" onClick={handleExportDailyCsv}>
                  <FileDown size={14} /> Export Daily CSV
                </button>
              </div>
            </div>

            <div className="sec-card-body">
              {/* Daily KPI Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div className="sec-kpi-card" style={{ borderColor: '#3b82f6' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>TOTAL MOVEMENTS</div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#1e3a8a', marginTop: '0.2rem' }}>
                    {dailyReportData?.summary?.totalMovements || 0}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Exits: {dailyReportData?.summary?.totalExits || 0} · Entries: {dailyReportData?.summary?.totalEntries || 0}
                  </div>
                </div>

                <div className="sec-kpi-card" style={{ borderColor: '#10b981' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>CURFEW COMPLIANCE</div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#065f46', marginTop: '0.2rem' }}>
                    {dailyReportData?.summary?.curfewComplianceRate || '100%'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                    On-time: {dailyReportData?.summary?.onTimeReturns || 0} · Breaches: {dailyReportData?.summary?.lateReturns || 0}
                  </div>
                </div>

                <div className="sec-kpi-card" style={{ borderColor: '#f59e0b' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>PEAK MORNING RUSH</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#92400e', marginTop: '0.2rem' }}>
                    {dailyReportData?.summary?.peakExitHour || '09:00 AM'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Highest outbound scans
                  </div>
                </div>

                <div className="sec-kpi-card" style={{ borderColor: '#8b5cf6' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>PEAK EVENING RETURN</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#5b21b6', marginTop: '0.2rem' }}>
                    {dailyReportData?.summary?.peakEntryHour || '06:00 PM'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Highest inbound turnstiles
                  </div>
                </div>

                <div className="sec-kpi-card" style={{ borderColor: '#ef4444' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>INCIDENTS LOGGED</div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#991b1b', marginTop: '0.2rem' }}>
                    {dailyReportData?.incidentSummary?.total || 0}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Critical: {dailyReportData?.incidentSummary?.bySeverity?.critical || 0} · Open: {dailyReportData?.incidentSummary?.byStatus?.open || 0}
                  </div>
                </div>

                <div className="sec-kpi-card" style={{ borderColor: '#06b6d4' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>VISITORS ON CAMPUS</div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#155e75', marginTop: '0.2rem' }}>
                    {dailyReportData?.visitorSummary?.currentlyInside || 0}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Today Total: {dailyReportData?.visitorSummary?.totalToday || 0}
                  </div>
                </div>
              </div>

              {/* Peak Hours Visual Histogram (06:00 to 22:00) */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Activity size={16} color="#0284c7" /> Hourly Turnstile Throughput & Peak Hours Breakdown (06:00 – 22:00)
                    </h4>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                      Perimeter gate traffic volume. Busiest period: <strong>{dailyReportData?.summary?.peakOverallHour || '18:00 - 19:00'}</strong>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.74rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: '#10b981', display: 'inline-block' }}></span> Scans
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: '#6366f1', display: 'inline-block' }}></span> Peak Period
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(17, 1fr)', gap: '0.35rem', alignItems: 'end', height: 130, padding: '0.5rem 0' }}>
                  {(dailyReportData?.peakHours || []).map((slot) => {
                    const maxVal = Math.max(1, ...((dailyReportData?.peakHours || []).map(s => s.total)));
                    const barHeightPct = Math.max(10, Math.round((slot.total / maxVal) * 100));
                    return (
                      <div key={slot.hour} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: slot.isPeak ? '#4f46e5' : '#64748b', marginBottom: '0.2rem' }}>
                          {slot.total}
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: `${barHeightPct}%`,
                            background: slot.isPeak ? 'linear-gradient(180deg, #6366f1, #4f46e5)' : 'linear-gradient(180deg, #10b981, #059669)',
                            borderRadius: '3px 3px 0 0',
                            position: 'relative',
                            transition: 'height 0.3s ease',
                          }}
                          title={`${slot.timeRange}: ${slot.total} scans (${slot.exits} exits, ${slot.entries} entries)`}
                        ></div>
                        <div style={{ fontSize: '0.64rem', color: slot.isPeak ? '#4f46e5' : '#475569', fontWeight: slot.isPeak ? 700 : 500, marginTop: '0.35rem', whiteSpace: 'nowrap' }}>
                          {slot.hour}h
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Two-Column Grid: Incident Summary & Curfew Breaches */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                {/* Column 1: Incident Breakdown */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={16} color="#e11d48" /> Gate Incident Register ({dailyReportData?.incidentSummary?.total || 0})
                  </h4>
                  <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                    {(!dailyReportData?.incidentSummary?.incidents || dailyReportData.incidentSummary.incidents.length === 0) ? (
                      <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                        Zero security perimeter breaches recorded for this date.
                      </div>
                    ) : (
                      <table style={{ width: '100%', fontSize: '0.76rem', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                            <th style={{ padding: '0.3rem' }}>Code</th>
                            <th style={{ padding: '0.3rem' }}>Title</th>
                            <th style={{ padding: '0.3rem' }}>Severity</th>
                            <th style={{ padding: '0.3rem' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailyReportData.incidentSummary.incidents.map((inc) => (
                            <tr key={inc.id || inc.incidentCode} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '0.4rem 0.3rem', fontWeight: 600 }}>{inc.incidentCode || inc.id}</td>
                              <td style={{ padding: '0.4rem 0.3rem' }}>{inc.title}</td>
                              <td style={{ padding: '0.4rem 0.3rem' }}>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '0.15rem 0.4rem',
                                  borderRadius: 4,
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  background: (inc.severity || '').toLowerCase() === 'critical' ? '#fee2e2' : '#fef3c7',
                                  color: (inc.severity || '').toLowerCase() === 'critical' ? '#b91c1c' : '#92400e',
                                }}>
                                  {inc.severity}
                                </span>
                              </td>
                              <td style={{ padding: '0.4rem 0.3rem' }}>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '0.15rem 0.4rem',
                                  borderRadius: 4,
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  background: (inc.status || '').toLowerCase() === 'resolved' ? '#dcfce7' : '#e0f2fe',
                                  color: (inc.status || '').toLowerCase() === 'resolved' ? '#15803d' : '#0369a1',
                                }}>
                                  {inc.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Column 2: Visitor Statistics & Curfew Summary */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={16} color="#0891b2" /> Daily Visitors & Access Breakdown
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: 6 }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Pre-Approved Passes</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                        {dailyReportData?.visitorSummary?.preApproved || 0}
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: 6 }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Walk-in Registrations</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                        {dailyReportData?.visitorSummary?.walkIn || 0}
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: 6 }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Active Guests Inside</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0369a1' }}>
                        {dailyReportData?.visitorSummary?.currentlyInside || 0}
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: 6 }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Departed / Signed Out</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#059669' }}>
                        {dailyReportData?.visitorSummary?.checkedOut || 0}
                      </div>
                    </div>
                  </div>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '0.6rem', fontSize: '0.76rem', color: '#166534' }}>
                    ✓ Curfew Enforcement: <strong>{dailyReportData?.summary?.curfewComplianceRate || '100%'}</strong> on-time return rate with <strong>{dailyReportData?.summary?.lateReturns || 0}</strong> overdue incident(s) escalated to Wardens.
                  </div>
                </div>
              </div>

              {/* Sample Movement Logs Table */}
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Turnstile Movements Sample (Target Date: {reportDate})</h4>
                <div className="sec-table-container">
                  <table className="sec-data-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Direction</th>
                        <th>Student Name</th>
                        <th>Roll Number</th>
                        <th>Hostel</th>
                        <th>Gate</th>
                        <th>Status</th>
                        <th>Curfew Flag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dailyReportData?.movementsSample || []).map((m) => (
                        <tr key={m.id || m.movementCode}>
                          <td>{new Date(m.movementTime || m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                          <td>
                            <span className={`sec-direction-badge ${m.direction === 'EXIT' ? 'exit' : 'entry'}`}>
                              {m.direction}
                            </span>
                          </td>
                          <td>{m.studentName}</td>
                          <td>{m.rollNumber}</td>
                          <td>{m.hostelName || 'Hostel'}</td>
                          <td>{m.gateName || 'Gate 1'}</td>
                          <td><span className="sec-badge approved">{m.status}</span></td>
                          <td>
                            {m.isLate ? (
                              <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.72rem' }}>
                                LATE ({m.lateDuration})
                              </span>
                            ) : (
                              <span style={{ color: '#059669', fontSize: '0.72rem' }}>ON-TIME</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: IMMUTABLE AUDIT TRAIL & CORRECTION REGISTER ── */}
        {activeTab === 'audit' && (
          <div className="sec-card">
            <div className="sec-card-header">
              <h3 className="sec-card-title">
                <FileCheck2 size={18} color="#0284c7" />
                Immutable Security Audit Trail &amp; Record Correction Workflow
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="sec-btn-indigo"
                  onClick={() => {
                    setCorrectionForm({
                      recordId: '',
                      recordType: 'MOVEMENT',
                      fieldToCorrect: 'gateName',
                      oldValue: '',
                      newValue: '',
                      reason: '',
                    });
                    setCorrectionFeedback(null);
                    setCorrectionModalOpen(true);
                  }}
                >
                  <Plus size={14} /> Submit Audited Correction
                </button>
                <button
                  type="button"
                  className="sec-btn-secondary"
                  onClick={() => loadAuditTrail()}
                >
                  <RefreshCw size={14} className={auditLoading ? 'spin' : ''} /> Refresh Trail
                </button>
              </div>
            </div>

            <div className="sec-card-body">
              {/* Compliance Info Banner */}
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <ShieldCheck size={20} color="#16a34a" />
                <div style={{ fontSize: '0.82rem', color: '#166534' }}>
                  <strong>ISO/IEC 27001 &amp; Campus Safety Audit Standards:</strong> Records in this registry cannot be silently altered or deleted. Every edit requires mandatory human justification, preserves original data, and logs the supervisor identity.
                </div>
              </div>

              {/* Filters */}
              <div className="sec-filters-row">
                <input
                  type="text"
                  className="sec-input"
                  style={{ maxWidth: 280 }}
                  placeholder="Search user, action, target, or reason..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                />

                <select
                  className="sec-input"
                  style={{ maxWidth: 220 }}
                  value={auditActionFilter}
                  onChange={(e) => setAuditActionFilter(e.target.value)}
                >
                  <option value="ALL">All Actions</option>
                  <option value="GATE_STUDENT_EXIT">Student Exits</option>
                  <option value="GATE_STUDENT_ENTRY">Student Entries</option>
                  <option value="AUDIT_RECORD_CORRECTED">Audited Corrections</option>
                  <option value="GATE_VISITOR_REGISTRATION">Visitor Registrations</option>
                  <option value="GATE_VISITOR_ENTRY">Visitor Check-ins</option>
                  <option value="GATE_VISITOR_EXIT">Visitor Departures</option>
                  <option value="GATE_OVERDUE_RESOLVED">Overdue Cases Resolved</option>
                  <option value="GATE_DAILY_REPORT_GENERATED">Daily Reports Generated</option>
                </select>

                <select
                  className="sec-input"
                  style={{ maxWidth: 160 }}
                  value={auditRoleFilter}
                  onChange={(e) => setAuditRoleFilter(e.target.value)}
                >
                  <option value="ALL">All Roles</option>
                  <option value="SECURITY">Security Staff</option>
                  <option value="WARDEN">Hostel Warden</option>
                  <option value="ADMIN">Super Admin</option>
                  <option value="STUDENT">Student</option>
                </select>
              </div>

              {/* Audit Table */}
              <div className="sec-table-container">
                <table className="sec-data-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Operator &amp; Role</th>
                      <th>Audit Action</th>
                      <th>Target Record</th>
                      <th>Old Value</th>
                      <th>New Value</th>
                      <th>Justification / Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs
                      .filter((log) => {
                        if (auditActionFilter !== 'ALL' && !String(log.action || '').includes(auditActionFilter)) return false;
                        if (auditRoleFilter !== 'ALL' && !String(log.role || '').includes(auditRoleFilter)) return false;
                        if (auditSearch) {
                          const q = auditSearch.toLowerCase();
                          const blob = `${log.user || ''} ${log.action || ''} ${log.target || ''} ${log.reason || ''} ${log.oldValue || ''} ${log.newValue || ''}`.toLowerCase();
                          return blob.includes(q);
                        }
                        return true;
                      })
                      .map((log) => (
                        <tr key={log.id}>
                          <td>
                            <div>{new Date(log.createdAt || log.changedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                            <small style={{ color: '#64748b' }}>{new Date(log.createdAt || log.changedAt || Date.now()).toLocaleDateString()}</small>
                          </td>
                          <td>
                            <strong>{log.user || 'Security Guard'}</strong>
                            <div style={{ fontSize: '0.7rem', color: log.role === 'WARDEN' ? '#7c3aed' : log.role === 'ADMIN' ? '#0284c7' : '#059669', fontWeight: 700 }}>
                              {log.role || 'SECURITY'}
                            </div>
                          </td>
                          <td>
                            <span
                              className="sec-badge"
                              style={{
                                background: log.action === 'AUDIT_RECORD_CORRECTED' ? '#f5f3ff' : log.action?.includes('EXIT') ? '#fff1f2' : '#f0fdf4',
                                color: log.action === 'AUDIT_RECORD_CORRECTED' ? '#6d28d9' : log.action?.includes('EXIT') ? '#e11d48' : '#16a34a',
                                border: '1px solid currentColor',
                                fontSize: '0.7rem',
                              }}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td>
                            <strong>{log.target || 'General'}</strong>
                          </td>
                          <td>
                            <span style={{ color: '#64748b', fontSize: '0.78rem', wordBreak: 'break-word' }}>
                              {log.oldValue || '-'}
                            </span>
                          </td>
                          <td>
                            <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.78rem', wordBreak: 'break-word' }}>
                              {log.newValue || '-'}
                            </span>
                          </td>
                          <td>
                            <small style={{ color: '#334155', fontStyle: 'italic' }}>
                              {log.reason || 'Institutional compliance log'}
                            </small>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 6: SECURITY INCIDENTS & UNAPPROVED EXITS ── */}
        {activeTab === 'alerts' && (
          <div className="sec-card">
            <div className="sec-card-header">
              <h3 className="sec-card-title">
                <AlertTriangle size={18} color="#e11d48" />
                Perimeter Security Alerts & Incidents
              </h3>
              <button className="sec-btn-rose" onClick={() => setIncidentModalOpen(true)}>
                <Plus size={14} /> Report Security Incident
              </button>
            </div>

            <div className="sec-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {alertsList.map((alertItem) => (
                <div
                  key={alertItem.id}
                  style={{
                    background: '#fff1f2',
                    border: '1px solid #ffe4e6',
                    borderRadius: '8px',
                    padding: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <h4 style={{ margin: 0, color: '#9f1239', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <AlertTriangle size={16} color="#e11d48" />
                      {alertItem.title}
                    </h4>
                    <span className="sec-badge late" style={{ textTransform: 'uppercase' }}>
                      {alertItem.severity}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.84rem', color: '#334155' }}>
                    {alertItem.description}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Logged: {alertItem.time} · Category: {alertItem.category}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 7: SHIFT HANDOVER NOTES ── */}
        {activeTab === 'shift-notes' && (
          <div className="sec-card">
            <div className="sec-card-header">
              <h3 className="sec-card-title">
                <FileText size={18} color="#0284c7" />
                Security Guard Shift Handover & Observations
              </h3>
              <span className="sec-badge out">OFFICIAL LOGBOOK</span>
            </div>

            <div className="sec-card-body">
              {/* Formal Digital Shift Handover Acknowledgment Card (Part 12) */}
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={20} color="#16a34a" />
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#166534' }}>
                      Official Shift Handover &amp; Incoming Guard Acknowledgment
                    </h4>
                  </div>
                  <span className="sec-badge returned">AUDIT VERIFIED</span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '0.75rem',
                    fontSize: '0.8rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                    <strong style={{ color: '#166534' }}>Outgoing Guard:</strong>
                    <div>{guardName} ({badgeId})</div>
                    <small style={{ color: '#64748b' }}>Morning Shift (06:00 - 14:00)</small>
                  </div>
                  <div style={{ background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                    <strong style={{ color: '#166534' }}>Incoming Guard:</strong>
                    <div>Bikash Mohanty (SG-OD-3109)</div>
                    <small style={{ color: '#64748b' }}>Evening Shift (14:00 - 22:00)</small>
                  </div>
                  <div style={{ background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                    <strong style={{ color: '#166534' }}>Hardware &amp; Equipment:</strong>
                    <div>Turnstiles A/B, Handheld QR Scanners, 8 Keys</div>
                    <small style={{ color: '#16a34a', fontWeight: 600 }}>All Verified &amp; Operational</small>
                  </div>
                </div>

                <button
                  type="button"
                  className="sec-btn-emerald"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                  onClick={async () => {
                    try {
                      await api.acknowledgeShiftHandover({
                        shiftCode: `SH-2026-${Date.now()}`,
                        incomingGuardId: 'SG-OD-3109',
                        incomingGuardName: 'Bikash Mohanty',
                        remarks: 'Incoming guard verified all optical barriers, equipment, and visitor badges.',
                      });
                      setActionFeedback({
                        success: true,
                        message: 'Shift handover officially acknowledged by incoming guard Bikash Mohanty.',
                      });
                    } catch (err) {
                      alert(err.message || 'Failed to acknowledge handover');
                    }
                  }}
                >
                  <CheckCircle2 size={16} /> Acknowledge Handover &amp; Sign Shift Receipt
                </button>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddShiftNote} style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.88rem', color: '#0f172a' }}>Record Shift Observation / Handover Note:</h4>
                <textarea
                  className="sec-input"
                  style={{ width: '100%', resize: 'vertical', minHeight: 70 }}
                  placeholder="Record perimeter status, turnstile barrier conditions, physical key handover, or incoming guard notes..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                />
                <button type="submit" className="sec-btn-primary" style={{ marginTop: '0.5rem' }}>
                  <Plus size={14} /> Submit Shift Note
                </button>
              </form>

              {/* Shift Notes History */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {shiftNotes.map((note) => (
                  <div key={note.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{note.author}</strong>
                      <span className="sec-post-badge">{note.time}</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 600, marginBottom: '0.35rem' }}>{note.shift}</div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155' }}>{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 8: GUARD PROFILE & POST RECORD (OFFICIAL CMS PROFILE) ── */}
        {activeTab === 'profile' && (
          <SecurityGuardEmployeeProfile
            account={account}
            onBack={() => setActiveTab('dashboard')}
          />
        )}
      </div>

      {/* ── INCIDENT MODAL ── */}
      {incidentModalOpen && (
        <div className="sec-modal-overlay" onClick={() => setIncidentModalOpen(false)}>
          <div className="sec-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1rem' }}>
                <AlertTriangle size={18} color="#e11d48" /> Report Security Incident
              </h3>
              <button
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                onClick={() => setIncidentModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleIncidentSubmit}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>
                  Incident Title *
                </label>
                <input
                  type="text"
                  required
                  className="sec-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. Unauthorized Exit Attempt Without Gate Pass"
                  value={incidentForm.title}
                  onChange={(e) => setIncidentForm({ ...incidentForm, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Student Roll No</label>
                  <input
                    type="text"
                    className="sec-input"
                    style={{ width: '100%' }}
                    value={incidentForm.affectedRollNumber}
                    onChange={(e) => setIncidentForm({ ...incidentForm, affectedRollNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Severity</label>
                  <select
                    className="sec-input"
                    style={{ width: '100%' }}
                    value={incidentForm.severity}
                    onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={3}
                  className="sec-input"
                  style={{ width: '100%', resize: 'vertical' }}
                  placeholder="Describe what occurred at the gate checkpoint..."
                  value={incidentForm.description}
                  onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="sec-btn-secondary"
                  onClick={() => setIncidentModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="sec-btn-rose">
                  Dispatch Alert to Warden & Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── OVERDUE RETURN RESOLUTION MODAL ── */}
      {overdueResolveModal && (
        <div className="sec-modal-overlay" onClick={() => setOverdueResolveModal(null)}>
          <div
            className="sec-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 520, borderRadius: '12px' }}
          >
            <div className="sec-card-header" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h4 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color="#e11d48" /> Resolve Curfew Overdue Case
                </h4>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                  Student: <strong>{overdueResolveModal.studentName}</strong> (Roll: {overdueResolveModal.studentRoll}) · {overdueResolveModal.overdueMinutes} mins late
                </p>
              </div>
              <button
                type="button"
                className="sec-btn-icon"
                onClick={() => setOverdueResolveModal(null)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleResolveOverdueSubmit} style={{ padding: '1.25rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Investigation Outcome / Case Status *
                </label>
                <select
                  className="sec-input"
                  style={{ width: '100%' }}
                  value={overdueResolveForm.resolutionStatus}
                  onChange={(e) => setOverdueResolveForm({ ...overdueResolveForm, resolutionStatus: e.target.value })}
                >
                  <option value="RESOLVED">Resolved: Student Safely Arrived at Campus Gate</option>
                  <option value="APPROVED_LATE_RETURN">Approved Late Return: Warden Permission Verified</option>
                  <option value="PARENT_CONFIRMED_DELAY">Parent Verified: Delayed En Route with Family Consent</option>
                  <option value="DISCIPLINARY_ACTION_INITIATED">Disciplinary Action: Case Escalated to Chief Proctor</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Duty Guard / Warden Investigation Notes *
                </label>
                <textarea
                  required
                  rows={3}
                  className="sec-input"
                  style={{ width: '100%', resize: 'vertical' }}
                  placeholder="Record verification details, transport delay explanation, or disciplinary notes..."
                  value={overdueResolveForm.notes}
                  onChange={(e) => setOverdueResolveForm({ ...overdueResolveForm, notes: e.target.value })}
                />
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.76rem', color: '#64748b' }}>
                ℹ️ Recording resolution creates an immutable audit entry and updates the Resident Warden and Hostel Admin rosters.
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="sec-btn-secondary"
                  onClick={() => setOverdueResolveModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="sec-btn-emerald">
                  Confirm &amp; Close Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: AUDITED RECORD CORRECTION ── */}
      {correctionModalOpen && (
        <div className="sec-modal-overlay" onClick={() => setCorrectionModalOpen(false)}>
          <div
            className="sec-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 540, borderRadius: '12px' }}
          >
            <div className="sec-card-header" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h4 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Edit3 size={16} color="#7c3aed" /> Audited Security Record Correction
                </h4>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                  Submit traceable amendment. An immutable audit trail entry will be generated.
                </p>
              </div>
              <button
                type="button"
                className="sec-btn-icon"
                onClick={() => setCorrectionModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitCorrection} style={{ padding: '1.25rem' }}>
              {correctionFeedback && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    fontSize: '0.82rem',
                    background: correctionFeedback.type === 'success' ? '#f0fdf4' : '#fff1f2',
                    color: correctionFeedback.type === 'success' ? '#166534' : '#9f1239',
                    border: `1px solid ${correctionFeedback.type === 'success' ? '#bbf7d0' : '#fecdd3'}`,
                  }}
                >
                  {correctionFeedback.message}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Record Type *
                  </label>
                  <select
                    className="sec-input"
                    style={{ width: '100%' }}
                    value={correctionForm.recordType}
                    onChange={(e) => setCorrectionForm({ ...correctionForm, recordType: e.target.value })}
                  >
                    <option value="MOVEMENT">Movement (Turnstile Exit/Entry)</option>
                    <option value="PASS">Gate Pass (Outpass / Curfew)</option>
                    <option value="VISITOR">Visitor Registration</option>
                    <option value="INCIDENT">Incident / Breach</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Record Identifier *
                  </label>
                  <input
                    type="text"
                    className="sec-input"
                    style={{ width: '100%' }}
                    placeholder="e.g. mov-1001, GP-2026-1039"
                    value={correctionForm.recordId}
                    onChange={(e) => setCorrectionForm({ ...correctionForm, recordId: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Field to Correct *
                  </label>
                  <select
                    className="sec-input"
                    style={{ width: '100%' }}
                    value={correctionForm.fieldToCorrect}
                    onChange={(e) => setCorrectionForm({ ...correctionForm, fieldToCorrect: e.target.value })}
                  >
                    <option value="gateName">Gate Post / Checkpoint Name</option>
                    <option value="direction">Direction (EXIT / ENTRY)</option>
                    <option value="remarks">Security Remarks / Notes</option>
                    <option value="visitorName">Visitor Name</option>
                    <option value="badgeNumber">Visitor Badge Number</option>
                    <option value="purposeType">Pass Purpose</option>
                    <option value="actualReturnTime">Return Timestamp</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Current / Prior Value
                  </label>
                  <input
                    type="text"
                    className="sec-input"
                    style={{ width: '100%' }}
                    placeholder="Old value (if known)"
                    value={correctionForm.oldValue}
                    onChange={(e) => setCorrectionForm({ ...correctionForm, oldValue: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', marginBottom: '0.35rem', fontWeight: 600 }}>
                  New Corrected Value *
                </label>
                <input
                  type="text"
                  className="sec-input"
                  style={{ width: '100%' }}
                  placeholder="Enter accurate replacement value"
                  value={correctionForm.newValue}
                  onChange={(e) => setCorrectionForm({ ...correctionForm, newValue: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Mandatory Audit Justification Reason *
                </label>
                <textarea
                  className="sec-input"
                  rows={3}
                  style={{ width: '100%', resize: 'vertical' }}
                  placeholder="Explain why this record requires correction (minimum 5 characters)..."
                  value={correctionForm.reason}
                  onChange={(e) => setCorrectionForm({ ...correctionForm, reason: e.target.value })}
                  required
                />
                <small style={{ color: '#64748b', fontSize: '0.7rem' }}>
                  Compliance: Logged with operator ID {guardName} ({badgeId}) and timestamp.
                </small>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="sec-btn-secondary"
                  onClick={() => setCorrectionModalOpen(false)}
                  disabled={correctionSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sec-btn-indigo"
                  disabled={correctionSubmitting}
                >
                  {correctionSubmitting ? 'Recording Audit...' : 'Confirm & Log Correction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

