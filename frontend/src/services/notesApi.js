// Class Notes Sharing & Missed Lecture Notes API Handler
import { API_BASE_URL } from './api';

let mockClassNotes = [
  {
    id: 'NOTE-901',
    subject: 'Operating Systems',
    date: '2026-10-05',
    topic: 'Process Scheduling Algorithms (Round Robin & SJF)',
    description: 'Complete lecture notes covering CPU scheduling Gantt charts and waiting time calculations from today\'s 9:15 AM class.',
    semester: 'Semester 5',
    section: 'Section A',
    uploadedBy: {
      name: 'Rohan Sharma',
      rollNumber: '2305201012',
      department: 'Computer Science'
    },
    uploadedAt: '2026-10-05T10:30:00Z',
    fileUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    fileName: 'OS_Process_Scheduling_Oct05.pdf',
    fileType: 'application/pdf',
    status: 'VISIBLE',
    isFacultyVerified: true,
    verifiedBy: 'Dr. Pratyush Mohapatra (HOD)',
    duplicateGroupKey: 'Operating Systems|2026-10-05|Process Scheduling Algorithms',
    duplicateVersionIndex: 1,
    totalDuplicatesAvailable: 3,
    reports: []
  },
  {
    id: 'NOTE-902',
    subject: 'Operating Systems',
    date: '2026-10-05',
    topic: 'Process Scheduling Algorithms (Round Robin & SJF)',
    description: 'Handwritten blackboard photos and summary notes.',
    semester: 'Semester 5',
    section: 'Section A',
    uploadedBy: {
      name: 'Priya Das',
      rollNumber: '2305201018',
      department: 'Computer Science'
    },
    uploadedAt: '2026-10-05T11:45:00Z',
    fileUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80',
    fileName: 'OS_board_photos.jpg',
    fileType: 'image/jpeg',
    status: 'VISIBLE',
    isFacultyVerified: false,
    duplicateGroupKey: 'Operating Systems|2026-10-05|Process Scheduling Algorithms',
    duplicateVersionIndex: 2,
    totalDuplicatesAvailable: 3,
    reports: []
  },
  {
    id: 'NOTE-903',
    subject: 'Operating Systems',
    date: '2026-10-05',
    topic: 'Process Scheduling Algorithms (Round Robin & SJF)',
    description: 'Short revision notes and key formulas.',
    semester: 'Semester 5',
    section: 'Section A',
    uploadedBy: {
      name: 'Amit Patel',
      rollNumber: '2305201025',
      department: 'Computer Science'
    },
    uploadedAt: '2026-10-05T14:10:00Z',
    fileUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    fileName: 'OS_Formula_Sheet.jpg',
    fileType: 'image/jpeg',
    status: 'VISIBLE',
    isFacultyVerified: false,
    duplicateGroupKey: 'Operating Systems|2026-10-05|Process Scheduling Algorithms',
    duplicateVersionIndex: 3,
    totalDuplicatesAvailable: 3,
    reports: []
  },
  {
    id: 'NOTE-904',
    subject: 'Data Structures',
    date: '2026-10-04',
    topic: 'Binary Search Trees & AVL Rotations',
    description: 'Detailed step-by-step tree insertion algorithms and height balance calculations.',
    semester: 'Semester 5',
    section: 'Section A',
    uploadedBy: {
      name: 'Sneha Mishra',
      rollNumber: '2305201041',
      department: 'Computer Science'
    },
    uploadedAt: '2026-10-04T16:20:00Z',
    fileUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    fileName: 'BST_AVL_Notes.pdf',
    fileType: 'application/pdf',
    status: 'VISIBLE',
    isFacultyVerified: true,
    verifiedBy: 'Prof. S. N. Ray',
    duplicateGroupKey: 'Data Structures|2026-10-04|Binary Search Trees',
    duplicateVersionIndex: 1,
    totalDuplicatesAvailable: 1,
    reports: []
  },
  {
    id: 'NOTE-905',
    subject: 'Computer Networks',
    date: '2026-10-03',
    topic: 'TCP 3-Way Handshake & Congestion Control',
    description: 'Diagrams and Wireshark capture screenshots explained.',
    semester: 'Semester 5',
    section: 'Section A',
    uploadedBy: {
      name: 'Debasish Rout',
      rollNumber: '2305201009',
      department: 'Computer Science'
    },
    uploadedAt: '2026-10-03T15:00:00Z',
    fileUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    fileName: 'TCP_Congestion_Control.png',
    fileType: 'image/png',
    status: 'VISIBLE',
    isFacultyVerified: false,
    duplicateGroupKey: 'Computer Networks|2026-10-03|TCP Handshake',
    duplicateVersionIndex: 1,
    totalDuplicatesAvailable: 1,
    reports: []
  }
];

let mockMissedClasses = [
  {
    id: 'ABSENT-101',
    date: '2026-10-05',
    subject: 'Operating Systems',
    time: '09:15 AM - 10:15 AM',
    topic: 'Process Scheduling Algorithms (Round Robin & SJF)',
    status: 'Absent',
    faculty: 'Dr. Pratyush Mohapatra',
    room: 'Room 304 (CS Block)',
    notesAvailable: true,
    notesCount: 3,
    sampleNoteId: 'NOTE-901'
  },
  {
    id: 'ABSENT-102',
    date: '2026-10-04',
    subject: 'Data Structures',
    time: '11:15 AM - 12:15 PM',
    topic: 'Binary Search Trees & AVL Rotations',
    status: 'Absent',
    faculty: 'Prof. S. N. Ray',
    room: 'Lab 2 (CS Block)',
    notesAvailable: true,
    notesCount: 1,
    sampleNoteId: 'NOTE-904'
  },
  {
    id: 'ABSENT-103',
    date: '2026-09-28',
    subject: 'Database Systems',
    time: '02:15 PM - 03:15 PM',
    topic: 'B+ Tree Indexing & Query Optimization',
    status: 'Absent',
    faculty: 'Dr. Ananya Mohanty',
    room: 'Room 201 (Main Building)',
    notesAvailable: false,
    notesCount: 0,
    sampleNoteId: null
  }
];

export const notesApi = {
  // 1. Fetch Class Notes with Filters
  getClassNotes: async (filters = {}) => {
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`${API_BASE_URL}/class-notes?${query}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('collegeflow_token') || ''}` }
      });
      const data = await res.json();
      if (data && data.success) return data.data;
    } catch {
      // Fallback mock filtering
    }

    let list = mockClassNotes.filter((n) => n.status !== 'HIDDEN');
    if (filters.subject && filters.subject !== 'ALL') {
      list = list.filter((n) => n.subject.toLowerCase() === filters.subject.toLowerCase());
    }
    if (filters.date) {
      list = list.filter((n) => n.date === filters.date);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (n) =>
          n.topic.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q) ||
          n.subject.toLowerCase().includes(q)
      );
    }
    return list;
  },

  // 2. Upload Student Class Notes
  uploadClassNotes: async (payload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/class-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('collegeflow_token') || ''}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data && data.success) return data;
    } catch {
      // Fallback mock behavior
    }

    // Check duplicate group key
    const dupKey = `${payload.subject}|${payload.date}|${payload.topic}`;
    const existingGroup = mockClassNotes.filter((n) => n.duplicateGroupKey === dupKey);
    const versionIdx = existingGroup.length + 1;

    const newNote = {
      id: `NOTE-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: payload.subject,
      date: payload.date,
      topic: payload.topic,
      description: payload.description || 'Uploaded student notes',
      semester: payload.semester || 'Semester 5',
      section: payload.section || 'Section A',
      uploadedBy: {
        name: payload.studentName || 'Rakesh Das',
        rollNumber: payload.rollNumber || '2305201001',
        department: payload.department || 'Computer Science'
      },
      uploadedAt: new Date().toISOString(),
      fileUrl: payload.previewUrl || payload.fileUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      fileName: payload.fileName || 'class_notes.pdf',
      fileType: payload.fileType || 'application/pdf',
      status: 'VISIBLE',
      isFacultyVerified: false,
      duplicateGroupKey: dupKey,
      duplicateVersionIndex: versionIdx,
      totalDuplicatesAvailable: versionIdx,
      reports: []
    };

    // Update existing duplicates count for that group key
    mockClassNotes.forEach((n) => {
      if (n.duplicateGroupKey === dupKey) {
        n.totalDuplicatesAvailable = versionIdx;
      }
    });

    mockClassNotes.unshift(newNote);

    // Update missed classes notes availability automatically
    mockMissedClasses = mockMissedClasses.map((mc) => {
      if (mc.subject.toLowerCase() === payload.subject.toLowerCase() && mc.date === payload.date) {
        return {
          ...mc,
          notesAvailable: true,
          notesCount: mc.notesCount + 1,
          sampleNoteId: newNote.id
        };
      }
      return mc;
    });

    return {
      success: true,
      message: 'Class notes shared successfully!',
      data: newNote
    };
  },

  // 3. Report Inappropriate or Inaccurate Student Notes
  reportNote: async (id, reason, description) => {
    try {
      const res = await fetch(`${API_BASE_URL}/class-notes/${id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('collegeflow_token') || ''}`
        },
        body: JSON.stringify({ reason, description })
      });
      const data = await res.json();
      if (data && data.success) return data;
    } catch {
      // Fallback mock report
    }

    mockClassNotes = mockClassNotes.map((n) => {
      if (n.id === id) {
        return {
          ...n,
          reports: [...(n.reports || []), { reason, description, reportedAt: new Date().toISOString() }],
          status: n.reports?.length >= 2 ? 'REPORTED' : n.status
        };
      }
      return n;
    });

    return {
      success: true,
      message: 'Report submitted for faculty review. Thank you!'
    };
  },

  // 4. Fetch Missed Classes for Student Dashboard
  getMissedClasses: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/class-notes/missed-classes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('collegeflow_token') || ''}` }
      });
      const data = await res.json();
      if (data && data.success) return data.data;
    } catch {
      // Fallback mock return
    }
    return mockMissedClasses;
  },

  // 5. Faculty Verification & Moderation
  verifyNoteByFaculty: async (id, facultyName = 'Dr. Pratyush Mohapatra') => {
    try {
      const res = await fetch(`${API_BASE_URL}/faculty/class-notes/${id}/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('collegeflow_token') || ''}` }
      });
      const data = await res.json();
      if (data && data.success) return data;
    } catch {
      // Fallback mock update
    }

    mockClassNotes = mockClassNotes.map((n) => {
      if (n.id === id) {
        return {
          ...n,
          isFacultyVerified: true,
          verifiedBy: facultyName
        };
      }
      return n;
    });

    return {
      success: true,
      message: 'Note marked as Faculty Verified.'
    };
  },

  hideNoteByFaculty: async (id) => {
    mockClassNotes = mockClassNotes.map((n) => {
      if (n.id === id) return { ...n, status: 'HIDDEN' };
      return n;
    });
    return { success: true, message: 'Note hidden from students.' };
  }
};
