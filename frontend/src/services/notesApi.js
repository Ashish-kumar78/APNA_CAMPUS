// Class Notes Sharing & Missed Lecture Notes API Handler
import { API_BASE_URL } from './api';
import { notificationsApi } from './notificationsApi';

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

const STUDY_MATERIALS_STORAGE_KEY = 'apna_campus_faculty_study_materials_v1';

export const initialStudyMaterials = [
  {
    id: 'SMAT-101',
    title: 'Unit 3 Complete Lecture Notes: Balanced Search Trees & AVL Rotations',
    description: 'Comprehensive faculty lecture notes covering LL, RR, LR, and RL rotations with solved balancing examples, height-balance invariants, and algorithm analysis.',
    materialType: 'Lecture Notes',
    subject: 'Data Structures & Algorithms',
    subjectCode: 'CS501',
    department: 'Computer Science & Engineering',
    deptCode: 'CSE',
    semester: 'Semester 5',
    section: 'Section A',
    topic: 'Binary Search Trees & AVL Rotations',
    uploadedBy: {
      name: 'Dr. S. Mohanty',
      facultyId: 'FAC-042',
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor & Course Coordinator',
      email: 's.mohanty@gift.edu.in'
    },
    uploadedAt: '2026-10-14T09:30:00.000Z',
    updatedAt: null,
    fileName: 'CS501_Unit3_AVL_Rotations_LectureNotes.pdf',
    fileType: 'application/pdf',
    fileSize: '3.8 MB',
    fileUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    downloadCount: 42,
    viewCount: 89,
    status: 'PUBLISHED',
    previewText: 'Unit 3: Self-Balancing Binary Search Trees\n1. Height Balance Condition: For every node T, |height(T.left) - height(T.right)| <= 1.\n2. Rotation Cases:\n   - Left-Left (LL): Single right rotation about root.\n   - Right-Right (RR): Single left rotation about root.\n   - Left-Right (LR): Left rotate left child, then right rotate root.\n   - Right-Left (RL): Right rotate right child, then left rotate root.\nComplexity: Insertion & Deletion O(log n).'
  },
  {
    id: 'SMAT-102',
    title: 'Midterm Question Bank & Model Solutions (2023-2025)',
    description: 'Official 3-year compiled midterm examination question papers with step-by-step model solutions and marking rubrics for continuous assessment.',
    materialType: 'Question Paper',
    subject: 'Data Structures & Algorithms',
    subjectCode: 'CS501',
    department: 'Computer Science & Engineering',
    deptCode: 'CSE',
    semester: 'Semester 5',
    section: 'Section A',
    topic: 'Asymptotic Analysis, Trees, Heaps & Graphs',
    uploadedBy: {
      name: 'Dr. S. Mohanty',
      facultyId: 'FAC-042',
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor & Course Coordinator',
      email: 's.mohanty@gift.edu.in'
    },
    uploadedAt: '2026-10-15T11:00:00.000Z',
    updatedAt: null,
    fileName: 'CS501_Midterm_Question_Bank_Model_Solutions.pdf',
    fileType: 'application/pdf',
    fileSize: '5.2 MB',
    fileUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    downloadCount: 65,
    viewCount: 134,
    status: 'PUBLISHED',
    previewText: 'Midterm Question Bank:\nQ1. Prove that in an AVL tree of height h, the minimum number of nodes is given by N(h) = N(h-1) + N(h-2) + 1.\nQ2. Explain Heapify algorithm with example array [12, 11, 13, 5, 6, 7].\nQ3. Compare Dijkstra vs Bellman-Ford for negative weight cycles.'
  },
  {
    id: 'SMAT-103',
    title: 'Module 2 Slide Deck: Process Scheduling & CPU Dispatcher',
    description: 'Classroom presentation slides with animated Gantt charts, average waiting time comparison tables, and CPU utilization formulas.',
    materialType: 'PPT / Presentation Slides',
    subject: 'Operating Systems',
    subjectCode: 'CS502',
    department: 'Computer Science & Engineering',
    deptCode: 'CSE',
    semester: 'Semester 5',
    section: 'Section A',
    topic: 'Process Scheduling Algorithms (Round Robin & SJF)',
    uploadedBy: {
      name: 'Dr. S. Mohanty',
      facultyId: 'FAC-042',
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor & Course Coordinator',
      email: 's.mohanty@gift.edu.in'
    },
    uploadedAt: '2026-10-08T14:20:00.000Z',
    updatedAt: null,
    fileName: 'CS502_Module2_Process_Scheduling_Slides.pptx',
    fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    fileSize: '6.4 MB',
    fileUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    downloadCount: 38,
    viewCount: 76,
    status: 'PUBLISHED',
    previewText: 'Module 2: CPU Scheduling\n- Preemptive vs Non-Preemptive Scheduling\n- Scheduling Criteria: CPU utilization, Throughput, Turnaround time, Waiting time, Response time\n- Algorithms: FCFS, Shortest Job First (SJF), Shortest Remaining Time First (SRTF), Priority Scheduling, Round Robin with Quantum Q=2ms.'
  },
  {
    id: 'SMAT-104',
    title: 'Assignment 4: Multithreading & Synchronization in Java',
    description: 'Coding assignment sheet including problem statements, boilerplate class skeletons, and test cases for thread synchronization.',
    materialType: 'Assignment Sheet',
    subject: 'Object Oriented Programming with Java',
    subjectCode: 'CS301',
    department: 'Computer Science & Engineering',
    deptCode: 'CSE',
    semester: 'Semester 3',
    section: 'Section A',
    topic: 'Java Threads & Synchronization',
    uploadedBy: {
      name: 'Dr. S. Mohanty',
      facultyId: 'FAC-042',
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor & Course Coordinator',
      email: 's.mohanty@gift.edu.in'
    },
    uploadedAt: '2026-10-18T16:00:00.000Z',
    updatedAt: null,
    fileName: 'CS301_Assignment4_Thread_Synchronization.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: '1.9 MB',
    fileUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    downloadCount: 29,
    viewCount: 54,
    status: 'PUBLISHED',
    previewText: 'CS301 Assignment 4:\nProblem 1: Implement a Producer-Consumer buffer using Java synchronized blocks, wait() and notifyAll().\nProblem 2: Compare ReentrantLock vs intrinsic synchronized monitor locks in high-contention thread scenarios.\nSubmission Deadline: 28 Oct 2026.'
  },
  {
    id: 'SMAT-105',
    title: 'Data Structures Laboratory Manual (Autumn 2026)',
    description: 'Complete laboratory practical manual with 12 lab exercises, viva-voce questions, and code verification rubrics.',
    materialType: 'Lab Manual',
    subject: 'Data Structures & Algorithms',
    subjectCode: 'CS501',
    department: 'Computer Science & Engineering',
    deptCode: 'CSE',
    semester: 'Semester 5',
    section: 'Section A',
    topic: 'Data Structures Lab Experiments & Viva Questions',
    uploadedBy: {
      name: 'Dr. S. Mohanty',
      facultyId: 'FAC-042',
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor & Course Coordinator',
      email: 's.mohanty@gift.edu.in'
    },
    uploadedAt: '2026-09-25T10:00:00.000Z',
    updatedAt: null,
    fileName: 'CS501_Lab_Manual_Autumn2026.pdf',
    fileType: 'application/pdf',
    fileSize: '7.1 MB',
    fileUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80',
    downloadCount: 88,
    viewCount: 190,
    status: 'PUBLISHED',
    previewText: 'Laboratory Practical Syllabus:\nExp 1: Polynomial Addition using Singly Linked List.\nExp 2: Infix to Postfix conversion and Evaluation using Stack.\nExp 3: Circular Queue implementation with array.\nExp 4: BST creation, traversal (Inorder, Preorder, Postorder) and search.\nExp 5: Minimum Spanning Tree using Prim\'s Algorithm.'
  }
];

function loadLocalStudyMaterials() {
  if (typeof localStorage === 'undefined') return initialStudyMaterials;
  try {
    const raw = localStorage.getItem(STUDY_MATERIALS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STUDY_MATERIALS_STORAGE_KEY, JSON.stringify(initialStudyMaterials));
      return initialStudyMaterials;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialStudyMaterials;
  } catch {
    return initialStudyMaterials;
  }
}

function saveLocalStudyMaterials(materials) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STUDY_MATERIALS_STORAGE_KEY, JSON.stringify(materials));
    window.dispatchEvent(new CustomEvent('apna_campus_materials_updated'));
  } catch (e) {
    console.warn('Failed to save study materials:', e);
  }
}

export const notesApi = {
  // 1. Fetch Class Notes with Filters (Includes verified peer notes + official faculty study materials)
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

    let list = [...mockClassNotes.filter((n) => n.status !== 'HIDDEN')];

    // Merge in faculty study materials converted to notes view format
    const facultyMats = loadLocalStudyMaterials().filter(m => m.status === 'PUBLISHED');
    const mappedFacultyMats = facultyMats.map(m => ({
      id: m.id,
      subject: m.subject,
      subjectCode: m.subjectCode,
      date: m.uploadedAt ? m.uploadedAt.split('T')[0] : '2026-10-14',
      topic: m.topic || m.title,
      description: `${m.title} — ${m.description}`,
      semester: m.semester || 'Semester 5',
      section: m.section || 'Section A',
      materialType: m.materialType || 'Lecture Notes',
      isFacultyMaterial: true,
      uploadedBy: {
        name: m.uploadedBy?.name || 'Dr. S. Mohanty',
        designation: m.uploadedBy?.designation || 'Faculty',
        department: m.department || 'Computer Science'
      },
      uploadedAt: m.uploadedAt,
      fileUrl: m.fileUrl,
      fileName: m.fileName,
      fileType: m.fileType,
      fileSize: m.fileSize,
      downloadCount: m.downloadCount || 0,
      status: 'VISIBLE',
      isFacultyVerified: true,
      verifiedBy: m.uploadedBy?.name || 'Dr. S. Mohanty',
      duplicateGroupKey: `${m.subject}|${m.uploadedAt?.split('T')[0] || ''}|${m.topic || m.title}`,
      duplicateVersionIndex: 1,
      totalDuplicatesAvailable: 1,
      reports: []
    }));

    list = [...mappedFacultyMats, ...list];

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
          n.subject.toLowerCase().includes(q) ||
          (n.fileName && n.fileName.toLowerCase().includes(q))
      );
    }
    if (filters.materialType && filters.materialType !== 'ALL') {
      list = list.filter(n => n.materialType === filters.materialType);
    }
    return list;
  },

  // 2. Fetch Study Materials Specifically for Faculty or Students
  getStudyMaterials: async (filters = {}) => {
    let list = loadLocalStudyMaterials();
    if (filters.subject && filters.subject !== 'ALL') {
      list = list.filter(m => m.subject.toLowerCase() === filters.subject.toLowerCase() || (m.subjectCode && m.subjectCode.toLowerCase() === filters.subject.toLowerCase()));
    }
    if (filters.semester && filters.semester !== 'ALL') {
      list = list.filter(m => m.semester.toLowerCase() === filters.semester.toLowerCase());
    }
    if (filters.materialType && filters.materialType !== 'ALL') {
      list = list.filter(m => m.materialType.toLowerCase() === filters.materialType.toLowerCase());
    }
    if (filters.section && filters.section !== 'ALL') {
      list = list.filter(m => !m.section || m.section === 'All Sections' || m.section.toLowerCase() === filters.section.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(m =>
        m.title.toLowerCase().includes(q) ||
        (m.topic && m.topic.toLowerCase().includes(q)) ||
        m.description.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        (m.fileName && m.fileName.toLowerCase().includes(q))
      );
    }
    return list;
  },

  // 3. Get Faculty Uploaded Study Materials (Scoped to Assigned Classes)
  getFacultyStudyMaterials: async (facultyName = 'Dr. S. Mohanty', filters = {}) => {
    let list = loadLocalStudyMaterials();
    if (facultyName && facultyName !== 'ALL') {
      const fLower = facultyName.toLowerCase();
      list = list.filter(m =>
        !m.uploadedBy?.name ||
        m.uploadedBy.name.toLowerCase().includes(fLower) ||
        fLower.includes(m.uploadedBy.name.toLowerCase()) ||
        (m.uploadedBy?.facultyId && fLower.includes(m.uploadedBy.facultyId.toLowerCase()))
      );
    }
    if (filters.subject && filters.subject !== 'ALL') {
      list = list.filter(m => m.subject.toLowerCase() === filters.subject.toLowerCase() || (m.subjectCode && m.subjectCode.toLowerCase() === filters.subject.toLowerCase()));
    }
    if (filters.semester && filters.semester !== 'ALL') {
      list = list.filter(m => m.semester.toLowerCase() === filters.semester.toLowerCase());
    }
    if (filters.materialType && filters.materialType !== 'ALL') {
      list = list.filter(m => m.materialType.toLowerCase() === filters.materialType.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(m =>
        m.title.toLowerCase().includes(q) ||
        (m.topic && m.topic.toLowerCase().includes(q)) ||
        m.description.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        (m.fileName && m.fileName.toLowerCase().includes(q))
      );
    }
    return list;
  },

  // 4. Create & Publish Study Material (With Student Notification Integration)
  createStudyMaterial: async (payload, facultyUser = {}) => {
    const current = loadLocalStudyMaterials();
    const newId = `SMAT-${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`;

    const newMaterial = {
      id: newId,
      title: payload.title || 'Untitled Study Material',
      description: payload.description || '',
      materialType: payload.materialType || 'Lecture Notes',
      subject: payload.subject || 'Data Structures & Algorithms',
      subjectCode: payload.subjectCode || 'CS501',
      department: payload.department || facultyUser.department || 'Computer Science & Engineering',
      deptCode: payload.deptCode || facultyUser.deptCode || 'CSE',
      semester: payload.semester || 'Semester 5',
      section: payload.section || 'Section A',
      topic: payload.topic || payload.title,
      uploadedBy: {
        name: facultyUser.name || payload.facultyName || 'Dr. S. Mohanty',
        facultyId: facultyUser.identity || facultyUser.facultyId || 'FAC-042',
        department: facultyUser.department || 'Computer Science & Engineering',
        designation: facultyUser.designation || 'Associate Professor',
        email: facultyUser.email || 's.mohanty@gift.edu.in'
      },
      uploadedAt: new Date().toISOString(),
      updatedAt: null,
      fileName: payload.fileName || 'study_material.pdf',
      fileType: payload.fileType || 'application/pdf',
      fileSize: payload.fileSize || '3.2 MB',
      fileUrl: payload.fileUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      downloadCount: 0,
      viewCount: 1,
      status: 'PUBLISHED',
      previewText: payload.previewText || `Lecture notes and study resources for ${payload.topic || payload.title}.\nPublished by ${facultyUser.name || 'Faculty'}.`
    };

    saveLocalStudyMaterials([newMaterial, ...current]);

    // Dispatch student notification if requested or default
    try {
      if (notificationsApi && notificationsApi.createNotification) {
        await notificationsApi.createNotification({
          title: `New Study Material: ${newMaterial.title}`,
          message: `${newMaterial.uploadedBy.name} uploaded new ${newMaterial.materialType} for ${newMaterial.subject} (${newMaterial.subjectCode}) on "${newMaterial.topic}". Accessible now in Study Materials & Class Notes.`,
          category: 'COURSE_UPDATE',
          priority: 'NORMAL',
          semester: newMaterial.semester,
          section: newMaterial.section === 'All Sections' ? 'ALL_ASSIGNED' : newMaterial.section,
          subjectCode: newMaterial.subjectCode,
          subjectName: newMaterial.subject,
          attachmentName: newMaterial.fileName,
          attachmentUrl: newMaterial.fileUrl
        }, newMaterial.uploadedBy);
      }
    } catch (err) {
      console.warn('Could not dispatch automatic notification:', err);
    }

    return {
      success: true,
      message: 'Study material uploaded and shared with students successfully!',
      data: newMaterial
    };
  },

  // 5. Update Study Material Details
  updateStudyMaterial: async (id, updates) => {
    const current = loadLocalStudyMaterials();
    let updatedItem = null;
    const updatedList = current.map(item => {
      if (item.id === id) {
        updatedItem = {
          ...item,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        return updatedItem;
      }
      return item;
    });

    if (updatedItem) {
      saveLocalStudyMaterials(updatedList);
      return { success: true, message: 'Material details updated successfully!', data: updatedItem };
    }
    return { success: false, message: 'Material not found.' };
  },

  // 6. Replace File for Existing Study Material
  replaceStudyMaterialFile: async (id, fileData) => {
    const current = loadLocalStudyMaterials();
    let replacedItem = null;
    const updatedList = current.map(item => {
      if (item.id === id) {
        replacedItem = {
          ...item,
          fileName: fileData.fileName || item.fileName,
          fileType: fileData.fileType || item.fileType,
          fileSize: fileData.fileSize || item.fileSize,
          fileUrl: fileData.fileUrl || item.fileUrl,
          previewText: fileData.previewText || item.previewText,
          updatedAt: new Date().toISOString()
        };
        return replacedItem;
      }
      return item;
    });

    if (replacedItem) {
      saveLocalStudyMaterials(updatedList);
      return { success: true, message: 'File replaced with latest revision successfully!', data: replacedItem };
    }
    return { success: false, message: 'Material not found.' };
  },

  // 7. Delete Study Material
  deleteStudyMaterial: async (id) => {
    const current = loadLocalStudyMaterials();
    const filtered = current.filter(item => item.id !== id);
    saveLocalStudyMaterials(filtered);
    return { success: true, message: 'Study material deleted successfully.' };
  },

  // 8. Record Download / View Metrics
  recordMaterialDownload: async (id) => {
    const current = loadLocalStudyMaterials();
    const updated = current.map(m => {
      if (m.id === id) {
        return { ...m, downloadCount: (m.downloadCount || 0) + 1 };
      }
      return m;
    });
    saveLocalStudyMaterials(updated);
  },

  recordMaterialView: async (id) => {
    const current = loadLocalStudyMaterials();
    const updated = current.map(m => {
      if (m.id === id) {
        return { ...m, viewCount: (m.viewCount || 0) + 1 };
      }
      return m;
    });
    saveLocalStudyMaterials(updated);
  },

  // Upload Student Class Notes (Peer Notes)
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

  // Report Inappropriate or Inaccurate Student Notes
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

  // Fetch Missed Classes for Student Dashboard
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

  // Faculty Verification & Moderation
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
