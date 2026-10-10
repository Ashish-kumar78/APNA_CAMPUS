// Service for managing Student Hostel Gate Passes (Outstation / Home / Leave)
// Synchronizes between Student Portal, Hostel Warden Portal, and Campus Security

const GATE_PASS_STORAGE_KEY = 'bput_hostel_gate_passes_v1';

// Seed initial realistic gate passes
const initialGatePasses = [
  {
    id: 'GP-2026-1042',
    studentId: 'std-1',
    studentName: 'Rakesh Das',
    rollNumber: '01',
    registrationNumber: '2305201001',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    gender: 'Male',
    studentPhone: '+91 98610 23010',
    parentName: 'Sanjay Das',
    parentPhone: '+91 94370 10001',
    hostelName: 'Gandhi Boys Residence (Hostel 1)',
    roomNumber: 'Room 101',
    bedNo: 'Bed 01',
    wardenName: 'Mr. Rajesh Jena',
    purposeType: 'Home Visit',
    destination: 'Plot 18, Unit 4, Bhubaneswar / Bargarh, Odisha',
    outDateTime: '2026-10-08T09:00',
    inDateTime: '2026-10-12T18:00',
    emergencyContact: '+91 94370 10001',
    parentConsentVerified: true,
    mentorName: 'Dr. Siba Prasad Tripathy',
    mentorEmpId: 'FAC-CSE-018',
    mentorDepartment: 'Computer Science & Engineering',
    mentorStatus: 'Verified & Recommended',
    mentorRemarks: 'Student has 92% attendance and completed mid-sem exams. Recommended for Durga Puja break visit.',
    mentorVerifiedAt: '05 Oct 2026, 11:30 AM',
    uploadedApplicationDoc: {
      fileName: 'Rakesh_Das_Mentor_Verified_Leave_Application.pdf',
      fileType: 'application/pdf',
      fileSize: '340 KB',
      uploadedAt: '05 Oct 2026, 01:15 PM',
      docTitle: 'Application for Home Leave with Mentor Recommendation',
      applicationText: `To\nThe Resident Warden\nGandhi Boys Residence (Hostel 1)\nApna Campus, Bhubaneswar\n\nRespected Sir,\n\nI am Rakesh Das, a resident of Room 101 (Bed 01) pursuing B.Tech in Computer Science & Engineering (5th Semester, Roll No: 01, Reg No: 2305201001).\n\nI humbly request permission to visit my home in Bargarh from 08-Oct-2026 (09:00 AM) to 12-Oct-2026 (06:00 PM) for the upcoming festival and family gathering. My parents have given their telephonic and written consent.\n\nMy academic mentor, Dr. Siba Prasad Tripathy, has verified my attendance (92%) and academic clearance and has signed his endorsement below.\n\nKindly issue the official Gate Pass for outstation travel.\n\nYours obediently,\nRakesh Das\nContact: +91 98610 23010\nFather: Sanjay Das (+91 94370 10001)\n\n[MENTOR ENDORSEMENT]\nStatus: Verified and Recommended\nSigned: Dr. Siba Prasad Tripathy (Faculty Advisor, Dept of CSE)\nDate: 05-Oct-2026 11:30 AM`
    },
    status: 'Pending Warden Approval', // 'Pending Warden Approval' | 'Approved' | 'Rejected'
    appliedAt: '05 Oct 2026, 01:20 PM',
    wardenRemarks: '',
    approvedAt: null,
    approvedBy: null,
    qrCodeString: 'BPUT-GP-2026-1042-RAKESH-DAS-PENDING'
  },
  {
    id: 'GP-2026-1039',
    studentId: 'std-2',
    studentName: 'Priya Patra',
    rollNumber: '02',
    registrationNumber: '2305201002',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    gender: 'Female',
    studentPhone: '+91 98610 23011',
    parentName: 'Ramesh Patra',
    parentPhone: '+91 94370 10003',
    hostelName: 'Sarojini Girls Residence (Hostel 1)',
    roomNumber: 'Room 102',
    bedNo: 'Bed 01',
    wardenName: 'Mrs. Nibedita Das',
    purposeType: 'Medical Consultation',
    destination: 'AIIMS Bhubaneswar, Sijua, Patrapada, Bhubaneswar',
    outDateTime: '2026-10-06T08:30',
    inDateTime: '2026-10-06T18:00',
    emergencyContact: '+91 94370 10003',
    parentConsentVerified: true,
    mentorName: 'Prof. Ananya Mishra',
    mentorEmpId: 'FAC-CSE-024',
    mentorDepartment: 'Computer Science & Engineering',
    mentorStatus: 'Verified & Recommended',
    mentorRemarks: 'Doctor appointment card verified. Outing approved for consultation.',
    mentorVerifiedAt: '04 Oct 2026, 04:45 PM',
    uploadedApplicationDoc: {
      fileName: 'Priya_Patra_Medical_GatePass_Verified.pdf',
      fileType: 'application/pdf',
      fileSize: '280 KB',
      uploadedAt: '04 Oct 2026, 05:10 PM',
      docTitle: 'Medical Outing Permission Application',
      applicationText: `To\nThe Resident Warden\nSarojini Girls Residence\n\nRespected Madam,\n\nKindly grant day gate pass for scheduled medical review at AIIMS Bhubaneswar on 06-Oct-2026 accompanied by local guardian. Mentor has verified medical documents.\n\nThanking you,\nPriya Patra (Roll 02, Room 102)`
    },
    status: 'Approved',
    appliedAt: '04 Oct 2026, 05:15 PM',
    wardenRemarks: 'Medical clearance noted. Return to campus before 06:30 PM mandatory.',
    approvedAt: '04 Oct 2026, 06:00 PM',
    approvedBy: 'Mrs. Nibedita Das (Resident Warden)',
    qrCodeString: 'BPUT-GP-2026-1039-PRIYA-PATRA-APPROVED'
  },
  {
    id: 'GP-2026-1035',
    studentId: 'std-3',
    studentName: 'Sneha Mohanty',
    rollNumber: '03',
    registrationNumber: '2305201003',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    gender: 'Female',
    studentPhone: '+91 98610 23012',
    parentName: 'Bipin Mohanty',
    parentPhone: '+91 94370 10005',
    hostelName: 'Sarojini Girls Residence (Hostel 1)',
    roomNumber: 'Room 103',
    bedNo: 'Bed 01',
    wardenName: 'Mrs. Nibedita Das',
    purposeType: 'Competitive Examination',
    destination: 'TCS iON Digital Zone, Chandaka Industrial Estate, Patia, Bhubaneswar',
    outDateTime: '2026-10-03T07:00',
    inDateTime: '2026-10-03T17:30',
    emergencyContact: '+91 94370 10005',
    parentConsentVerified: true,
    mentorName: 'Dr. Debabrata Swain',
    mentorEmpId: 'FAC-CSE-012',
    mentorDepartment: 'Computer Science & Engineering',
    mentorStatus: 'Verified & Recommended',
    mentorRemarks: 'Hall ticket verified for national hackathon exam.',
    mentorVerifiedAt: '02 Oct 2026, 02:00 PM',
    uploadedApplicationDoc: {
      fileName: 'Sneha_Mohanty_Exam_Pass_Endorsed.pdf',
      fileType: 'application/pdf',
      fileSize: '310 KB',
      uploadedAt: '02 Oct 2026, 02:30 PM',
      docTitle: 'GATE Mock Exam Day Pass',
      applicationText: `Day outing application for National Level Mock Exam at TCS iON Patia.`
    },
    status: 'Approved',
    appliedAt: '02 Oct 2026, 02:35 PM',
    wardenRemarks: 'Admit card inspected. Approved.',
    approvedAt: '02 Oct 2026, 03:15 PM',
    approvedBy: 'Mrs. Nibedita Das (Resident Warden)',
    qrCodeString: 'BPUT-GP-2026-1035-SNEHA-MOHANTY-APPROVED'
  }
];

export function getAllGatePasses() {
  try {
    const raw = localStorage.getItem(GATE_PASS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(GATE_PASS_STORAGE_KEY, JSON.stringify(initialGatePasses));
      return initialGatePasses;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading gate passes:', err);
    return initialGatePasses;
  }
}

export function getStudentGatePasses(studentIdentifier) {
  const passes = getAllGatePasses();
  if (!studentIdentifier) return passes;
  const lower = String(studentIdentifier).toLowerCase();
  return passes.filter(p => 
    (p.studentId && p.studentId.toLowerCase() === lower) ||
    (p.rollNumber && String(p.rollNumber).toLowerCase() === lower) ||
    (p.registrationNumber && String(p.registrationNumber).toLowerCase() === lower) ||
    (p.studentName && p.studentName.toLowerCase().includes(lower))
  );
}

export function createGatePass(passData) {
  const passes = getAllGatePasses();
  const nextSeq = passes.length + 1043;
  const newPass = {
    id: `GP-2026-${nextSeq}`,
    status: 'Pending Warden Approval',
    appliedAt: new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ', ' + new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    wardenRemarks: '',
    approvedAt: null,
    approvedBy: null,
    qrCodeString: `BPUT-GP-2026-${nextSeq}-${(passData.studentName || 'STUDENT').toUpperCase()}-PENDING`,
    ...passData
  };

  const updated = [newPass, ...passes];
  try {
    localStorage.setItem(GATE_PASS_STORAGE_KEY, JSON.stringify(updated));
    // Dispatch system events
    window.dispatchEvent(new CustomEvent('bput_gate_passes_changed', { detail: { newPass } }));
    window.dispatchEvent(new StorageEvent('storage', { key: GATE_PASS_STORAGE_KEY, newValue: JSON.stringify(updated) }));
  } catch (err) {
    console.error('Failed to store gate pass:', err);
  }
  return newPass;
}

export function approveGatePass(passId, wardenName = 'Mr. Rajesh Jena (Resident Warden)', remarks = 'Application & mentor verification reviewed. Outstation gate pass granted.') {
  const passes = getAllGatePasses();
  const now = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) + ', ' + new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const updated = passes.map(p => {
    if (p.id === passId) {
      return {
        ...p,
        status: 'Approved',
        approvedAt: now,
        approvedBy: wardenName,
        wardenRemarks: remarks,
        qrCodeString: `BPUT-${p.id}-${(p.studentName || '').toUpperCase()}-APPROVED-VERIFIED`
      };
    }
    return p;
  });

  try {
    localStorage.setItem(GATE_PASS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('bput_gate_passes_changed', { detail: { passId, status: 'Approved' } }));
    window.dispatchEvent(new StorageEvent('storage', { key: GATE_PASS_STORAGE_KEY, newValue: JSON.stringify(updated) }));
  } catch (err) {
    console.error('Failed to approve gate pass:', err);
  }
  return updated.find(p => p.id === passId);
}

export function rejectGatePass(passId, wardenName = 'Mr. Rajesh Jena (Resident Warden)', remarks = 'Application rejected. Mentor verification missing or parent consent not confirmed.') {
  const passes = getAllGatePasses();
  const now = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) + ', ' + new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const updated = passes.map(p => {
    if (p.id === passId) {
      return {
        ...p,
        status: 'Rejected',
        approvedAt: now,
        approvedBy: wardenName,
        wardenRemarks: remarks,
        qrCodeString: `BPUT-${p.id}-${(p.studentName || '').toUpperCase()}-REJECTED`
      };
    }
    return p;
  });

  try {
    localStorage.setItem(GATE_PASS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('bput_gate_passes_changed', { detail: { passId, status: 'Rejected' } }));
    window.dispatchEvent(new StorageEvent('storage', { key: GATE_PASS_STORAGE_KEY, newValue: JSON.stringify(updated) }));
  } catch (err) {
    console.error('Failed to reject gate pass:', err);
  }
  return updated.find(p => p.id === passId);
}

export function recordGatePassExit(passId) {
  const passes = getAllGatePasses();
  const now = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) + ', ' + new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const updated = passes.map(p => {
    if (p.id === passId) {
      return {
        ...p,
        status: 'Exited Campus',
        actualExitTime: now,
      };
    }
    return p;
  });

  try {
    localStorage.setItem(GATE_PASS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('bput_gate_passes_changed', { detail: { passId, status: 'Exited Campus' } }));
    window.dispatchEvent(new StorageEvent('storage', { key: GATE_PASS_STORAGE_KEY, newValue: JSON.stringify(updated) }));
  } catch (err) {
    console.error('Failed to record exit:', err);
  }
  return updated.find(p => p.id === passId);
}

export function recordGatePassReturn(passId) {
  const passes = getAllGatePasses();
  const now = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) + ', ' + new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const updated = passes.map(p => {
    if (p.id === passId) {
      return {
        ...p,
        status: 'Returned to Hostel',
        actualReturnTime: now,
      };
    }
    return p;
  });

  try {
    localStorage.setItem(GATE_PASS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('bput_gate_passes_changed', { detail: { passId, status: 'Returned to Hostel' } }));
    window.dispatchEvent(new StorageEvent('storage', { key: GATE_PASS_STORAGE_KEY, newValue: JSON.stringify(updated) }));
  } catch (err) {
    console.error('Failed to record return:', err);
  }
  return updated.find(p => p.id === passId);
}
