
const STORAGE_KEY = 'bput_students_records';
const ACTIVE_STUDENT_KEY = 'bput_active_student_id';

/**
 * Read previously saved browser student records without creating demo rows.
 */
export function getAllStudents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading saved student records:', error);
    return [];
  }
}

/**
 * Refuse browser-only student writes so callers cannot report false persistence.
 */
export function saveStudent(studentData) {
  void studentData;
  throw new Error('Student records must be created or updated through the authenticated backend API.');
}

/**
 * Get the currently active student record for student section view
 */
export function getActiveStudent() {
  const all = getAllStudents();
  const activeId = localStorage.getItem(ACTIVE_STUDENT_KEY);
  if (activeId) {
    const found = all.find(s => s.id === activeId || s.registrationNumber === activeId || s.rollNumber === activeId);
    if (found) return found;
  }
  return all[0] || null;
}

/**
 * Set active student by ID or roll number
 */
export function setActiveStudent(studentIdOrRoll) {
  localStorage.setItem(ACTIVE_STUDENT_KEY, studentIdOrRoll);
  window.dispatchEvent(new CustomEvent('cms_active_student_changed', { detail: studentIdOrRoll }));
}

/**
 * Find student by registration number, roll number, email, or name
 */
export function findStudentByQuery(query) {
  if (!query) return null;
  const q = String(query).trim().toLowerCase();
  const all = getAllStudents();
  return all.find(s => 
    (s.registrationNumber && s.registrationNumber.toLowerCase() === q) ||
    (s.rollNumber && s.rollNumber.toLowerCase() === q) ||
    (s.email && s.email.toLowerCase() === q) ||
    (s.name && s.name.toLowerCase() === q) ||
    (s.studentId && s.studentId.toLowerCase() === q)
  ) || null;
}

// ── CAMPUS DOCUMENT STORE ──────────────────────────────────────────────────────

const DOCS_STORAGE_KEY = 'bput_campus_documents';

/**
 * Read previously saved browser documents without seeding sample documents.
 */
export function getAllDocuments() {
  try {
    const raw = localStorage.getItem(DOCS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading saved campus documents:', error);
    return [];
  }
}

/**
 * Save (add/update) a campus document
 */
export function saveDocument(docData) {
  const all = getAllDocuments();
  let updatedList;
  let savedDoc;

  if (docData.id && all.some(d => d.id === docData.id)) {
    // Update existing
    updatedList = all.map(d => {
      if (d.id === docData.id) {
        savedDoc = { ...d, ...docData };
        return savedDoc;
      }
      return d;
    });
  } else {
    // Add new
    savedDoc = {
      ...docData,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
      visibleTo: docData.visibleTo || ['admin', 'faculty', 'hod']
    };
    updatedList = [savedDoc, ...all];
  }

  try {
    localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent('cms_documents_changed', { detail: savedDoc }));
  } catch (err) {
    console.error('Error saving document:', err);
  }
  return savedDoc;
}

/**
 * Delete a campus document by id
 */
export function deleteDocument(docId) {
  const all = getAllDocuments();
  const updated = all.filter(d => d.id !== docId);
  try {
    localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('cms_documents_changed', { detail: { deleted: docId } }));
  } catch (err) {}
}

/**
 * Get documents visible to a specific role
 */
export function getDocumentsForRole(role) {
  return getAllDocuments().filter(d => d.visibleTo && d.visibleTo.includes(role));
}

const STUDENT_DOCS_KEY = 'bput_student_custom_docs';

/**
 * Get all documents for a specific student (standard verified docs + custom uploads)
 */
export function getStudentDocuments(studentQuery) {
  const student = findStudentByQuery(studentQuery);
  if (!student) return [];

  const records = Array.isArray(student.documents) ? student.documents : [];
  const studentKey = student.id || student.registrationNumber || student.studentId;
  if (!studentKey) return records;

  try {
    const raw = localStorage.getItem(`${STUDENT_DOCS_KEY}_${studentKey}`);
    const saved = raw ? JSON.parse(raw) : [];
    return [...records, ...(Array.isArray(saved) ? saved : [])];
  } catch (error) {
    console.error('Error reading saved student documents:', error);
    return records;
  }
}

/**
 * Get all document records across all students for the master documents table
 */
export function getAllStudentDocumentRecords() {
  const students = getAllStudents();
  const records = [];

  students.forEach((student) => {
    const studentDocs = getStudentDocuments(student.id || student.registrationNumber || student.studentId);
    studentDocs.forEach((doc) => {
      records.push({
        id: `${student.id || student.rollNumber || student.studentId}-${doc.id || doc.fileName || doc.name}`,
        studentId: student.studentId,
        registrationNumber: student.registrationNumber,
        rollNumber: student.rollNumber,
        studentName: student.name,
        sex: student.gender,
        gender: student.gender,
        section: student.section,
        semester: student.semester,
        department: student.department,
        deptCode: student.deptCode,
        docId: doc.id,
        docName: doc.name,
        category: doc.category,
        status: doc.status,
        fileType: doc.fileType,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        fileUrl: doc.fileUrl,
        uploadedAt: doc.uploadedAt,
        verified: doc.verified === true || doc.status === 'Verified',
        studentObj: student,
        rawDoc: doc
      });
    });
  });

  return records;
}

/**
 * Student file upload is unavailable until a protected storage API is configured.
 */
export function addStudentDocument(studentQuery, docData) {
  void studentQuery;
  void docData;
  throw new Error('Student document uploads are unavailable until a protected file-storage API is configured.');
}

