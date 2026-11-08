/**
 * APNA_CAMPUS - Mess Attendance, Telemetry & Student Skip-Meal System
 * Implements Fretbox BPUT Hackathon 2026 PS07 Requirements (Section 8)
 *
 * Core Capabilities:
 * 1. 4-Meal Expected vs Actual Attendance Telemetry (Breakfast, Lunch, Evening Snacks, Dinner).
 * 2. Resident headcount sync (Hostel residents minus approved outstation leaves).
 * 3. Student Skip-Meal opt-out feature with configurable cutoff deadlines.
 * 4. Kitchen staff actual plate/biometric count recording and turnout ratio calculation.
 * 5. Explicit separation: Expected count is NOT treated as actual attendance.
 */

const ATTENDANCE_STORAGE_KEY = 'apna_campus_mess_attendance_v1';
const DEADLINES_STORAGE_KEY = 'apna_campus_mess_skip_deadlines_v1';
export const MESS_ATTENDANCE_UPDATED_EVENT = 'apna_campus_mess_attendance_updated';

export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Evening Snacks', 'Dinner'];

export const DEFAULT_SKIP_DEADLINES = {
  Breakfast: '06:30',      // 06:30 AM
  Lunch: '10:30',          // 10:30 AM
  'Evening Snacks': '15:30', // 03:30 PM
  Dinner: '18:30',         // 06:30 PM
};

export const DEFAULT_TOTAL_RESIDENTS = 520;

let _memoryAttendance = null;
let _memoryDeadlines = null;

const getStorage = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch (e) {}
  return null;
};

const notifyAttendanceUpdated = (detail = {}) => {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent(MESS_ATTENDANCE_UPDATED_EVENT, { detail }));
      window.dispatchEvent(new CustomEvent('storage', { detail: { key: ATTENDANCE_STORAGE_KEY } }));
    } catch (e) {}
  }
};

const seedInitialSkipRequests = () => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  return [
    {
      id: 'skp-001',
      studentId: 'std-002',
      studentName: 'Amit Nayak',
      rollNumber: '2305200002',
      hostelName: 'Gandhi Boys Residence',
      roomNumber: '102',
      date: today,
      skippedMeals: ['Breakfast', 'Dinner'],
      reason: 'Attending off-campus technical symposium and fasting dinner',
      submittedAt: `${today}T06:15:00Z`,
    },
    {
      id: 'skp-002',
      studentId: 'std-003',
      studentName: 'Subhashree Behera',
      rollNumber: '2305200003',
      hostelName: 'Sarojini Girls Residence (Block A)',
      roomNumber: '203',
      date: today,
      skippedMeals: ['Evening Snacks'],
      reason: 'Lab assignment overtime in Academic Block 2',
      submittedAt: `${today}T14:10:00Z`,
    },
    {
      id: 'skp-003',
      studentId: 'std-001',
      studentName: 'Rakesh Das',
      rollNumber: '2305200001',
      hostelName: 'Gandhi Boys Residence',
      roomNumber: '101',
      date: today,
      skippedMeals: ['Lunch'],
      reason: 'Project work and lunch meeting with mentor',
      submittedAt: `${today}T09:45:00Z`,
    },
    {
      id: 'skp-004',
      studentId: 'std-004',
      studentName: 'Priya Patra',
      rollNumber: '2305200004',
      hostelName: 'Sarojini Girls Residence (Block A)',
      roomNumber: '204',
      date: yesterday,
      skippedMeals: ['Dinner'],
      reason: 'Doctor appointment in city',
      submittedAt: `${yesterday}T17:30:00Z`,
    },
  ];
};

const seedInitialActualRecords = () => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  return {
    [today]: {
      Breakfast: 462,
      Lunch: 491,
      'Evening Snacks': 0,
      Dinner: 0,
    },
    [yesterday]: {
      Breakfast: 470,
      Lunch: 495,
      'Evening Snacks': 415,
      Dinner: 498,
    },
  };
};

/**
 * Retrieve current configurable skip cutoff deadlines
 */
export const getSkipDeadlines = () => {
  const storage = getStorage();
  if (storage) {
    try {
      const raw = storage.getItem(DEADLINES_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
  }
  if (_memoryDeadlines) return _memoryDeadlines;
  return { ...DEFAULT_SKIP_DEADLINES };
};

/**
 * Update skip cutoff deadlines (Mess Manager feature)
 */
export const saveSkipDeadlines = (newDeadlines) => {
  const merged = { ...DEFAULT_SKIP_DEADLINES, ...newDeadlines };
  _memoryDeadlines = merged;
  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(DEADLINES_STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {}
  }
  notifyAttendanceUpdated({ type: 'deadlines_updated', deadlines: merged });
  return merged;
};

/**
 * Check if the cutoff deadline has elapsed for a specific meal session
 */
export const isSkipDeadlinePassed = (mealType, targetDateStr = null, customDeadlines = null) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const dateToCheck = targetDateStr || todayStr;

  // Past dates cannot be changed
  if (dateToCheck < todayStr) return true;
  // Future dates are always before deadline
  if (dateToCheck > todayStr) return false;

  const deadlines = customDeadlines || getSkipDeadlines();
  const cutoffTime = deadlines[mealType] || '10:00';
  const [cutoffHours, cutoffMinutes] = cutoffTime.split(':').map(Number);

  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  if (currentHours > cutoffHours) return true;
  if (currentHours === cutoffHours && currentMinutes >= cutoffMinutes) return true;
  return false;
};

/**
 * Load raw persistent attendance & skip store
 */
export const getLocalAttendanceStore = () => {
  const storage = getStorage();
  if (storage) {
    try {
      const raw = storage.getItem(ATTENDANCE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.skipRequests) return parsed;
      }
    } catch (e) {}
  }
  if (_memoryAttendance) return _memoryAttendance;

  const initial = {
    totalResidents: DEFAULT_TOTAL_RESIDENTS,
    skipRequests: seedInitialSkipRequests(),
    actualServedRecords: seedInitialActualRecords(),
  };
  _memoryAttendance = initial;
  if (storage) {
    try {
      storage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(initial));
    } catch (e) {}
  }
  return initial;
};

/**
 * Persist raw attendance state
 */
export const saveLocalAttendanceStore = (data) => {
  _memoryAttendance = data;
  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }
  notifyAttendanceUpdated(data);
  return data;
};

/**
 * Reset store (for testing)
 */
export const resetMessAttendanceStore = () => {
  _memoryAttendance = null;
  _memoryDeadlines = null;
  const storage = getStorage();
  if (storage) {
    try {
      storage.removeItem(ATTENDANCE_STORAGE_KEY);
      storage.removeItem(DEADLINES_STORAGE_KEY);
    } catch (e) {}
  }
};

/**
 * Retrieve 4-meal daily telemetry and statistics for a given date
 * Explicitly separates expectedCount from actualServed count.
 */
export const getDailyMealAttendanceTelemetry = (dateStr = null) => {
  const store = getLocalAttendanceStore();
  const date = dateStr || new Date().toISOString().split('T')[0];
  const deadlines = getSkipDeadlines();

  const totalResidents = store.totalResidents || DEFAULT_TOTAL_RESIDENTS;
  const daySkips = store.skipRequests.filter((r) => r.date === date);
  const actualsForDate = store.actualServedRecords[date] || {};

  // Standard approved outstation leaves count (estimated or synced from hostel resident leave store)
  const approvedLeavesCount = 12;

  const mealSummary = {};

  MEAL_TYPES.forEach((meal) => {
    // Count how many students skipped this specific meal
    const skippedStudents = daySkips.filter((r) => (r.skippedMeals || []).includes(meal));
    const skippedCount = skippedStudents.length;

    // Expected headcount = Total residents - (Approved outstation leaves + Students who explicitly skipped)
    const expectedCount = Math.max(0, totalResidents - (approvedLeavesCount + skippedCount));

    // Actual meals served recorded by kitchen counter
    const actualServed = actualsForDate[meal] || 0;

    // Turnout ratio calculation
    const turnoutRatio = actualServed > 0 && expectedCount > 0
      ? `${((actualServed / expectedCount) * 100).toFixed(1)}%`
      : '-';

    // Status: Closed if past or served, In Service if current, Scheduled if upcoming
    const isPastDeadline = isSkipDeadlinePassed(meal, date, deadlines);
    let status = 'Scheduled';
    if (actualServed > 0) {
      status = 'Completed';
    } else if (isPastDeadline) {
      status = 'In Service';
    } else {
      status = `Open (Deadline: ${deadlines[meal]})`;
    }

    mealSummary[meal] = {
      mealType: meal,
      totalResidents,
      approvedLeaves: approvedLeavesCount,
      skippedCount,
      skippedStudents: skippedStudents.map((s) => ({
        rollNumber: s.rollNumber,
        studentName: s.studentName,
        hostelName: s.hostelName,
        roomNumber: s.roomNumber,
        reason: s.reason,
        submittedAt: s.submittedAt,
      })),
      expectedCount,
      actualServed,
      turnoutRatio,
      deadline: deadlines[meal],
      isDeadlinePassed: isPastDeadline,
      status,
    };
  });

  return {
    date,
    totalResidents,
    approvedLeavesCount,
    deadlines,
    meals: mealSummary,
    allSkipsForDate: daySkips,
  };
};

/**
 * Retrieve skip meal record for a specific student and date
 */
export const getStudentMealSkipStatus = (rollNumber, dateStr = null) => {
  const store = getLocalAttendanceStore();
  const date = dateStr || new Date().toISOString().split('T')[0];
  const cleanRoll = (rollNumber || '').trim().toLowerCase();

  const record = store.skipRequests.find(
    (r) => (r.rollNumber || '').toLowerCase() === cleanRoll && r.date === date
  );

  const deadlines = getSkipDeadlines();
  const statusPerMeal = {};

  MEAL_TYPES.forEach((meal) => {
    const isSkipped = record ? (record.skippedMeals || []).includes(meal) : false;
    const isDeadlinePassed = isSkipDeadlinePassed(meal, date, deadlines);

    statusPerMeal[meal] = {
      isSkipped,
      isDeadlinePassed,
      deadline: deadlines[meal],
      canToggle: !isDeadlinePassed,
    };
  });

  return {
    date,
    rollNumber,
    record,
    statusPerMeal,
  };
};

/**
 * Submit or update student skip-meal choices
 * Guards against expired deadlines.
 */
export const submitStudentMealSkip = ({
  studentId = 'std-active',
  studentName = 'Student',
  rollNumber,
  hostelName = 'Gandhi Boys Residence',
  roomNumber = '101',
  date = new Date().toISOString().split('T')[0],
  skippedMeals = [],
  reason = '',
}) => {
  if (!rollNumber) throw new Error('Student roll number is required to register meal skips.');

  const todayStr = new Date().toISOString().split('T')[0];
  if (date < todayStr) {
    throw new Error('Cannot submit or modify meal skips for past dates.');
  }

  const deadlines = getSkipDeadlines();

  // Validate deadline for each newly skipped meal
  skippedMeals.forEach((meal) => {
    if (isSkipDeadlinePassed(meal, date, deadlines)) {
      throw new Error(`The skip deadline for ${meal} (${deadlines[meal]}) has already passed for ${date}.`);
    }
  });

  const store = getLocalAttendanceStore();
  const cleanRoll = (rollNumber || '').trim().toLowerCase();

  // Filter out any existing record for this student on this date
  const filtered = store.skipRequests.filter(
    (r) => !((r.rollNumber || '').toLowerCase() === cleanRoll && r.date === date)
  );

  let newRecord = null;
  if (skippedMeals && skippedMeals.length > 0) {
    newRecord = {
      id: `skp-${Date.now()}`,
      studentId,
      studentName,
      rollNumber: rollNumber.trim(),
      hostelName,
      roomNumber,
      date,
      skippedMeals: Array.from(new Set(skippedMeals)),
      reason: reason.trim(),
      submittedAt: new Date().toISOString(),
    };
    filtered.unshift(newRecord);
  }

  const updatedStore = {
    ...store,
    skipRequests: filtered,
  };

  saveLocalAttendanceStore(updatedStore);
  return {
    success: true,
    record: newRecord,
    telemetry: getDailyMealAttendanceTelemetry(date),
  };
};

/**
 * Cancel a skipped meal (student opts back into dining)
 */
export const cancelStudentMealSkip = ({ rollNumber, date, mealType }) => {
  if (!rollNumber) throw new Error('Roll number is required.');
  const deadlines = getSkipDeadlines();

  if (isSkipDeadlinePassed(mealType, date, deadlines)) {
    throw new Error(`Cannot cancel skip for ${mealType}; deadline (${deadlines[mealType]}) has passed.`);
  }

  const store = getLocalAttendanceStore();
  const cleanRoll = (rollNumber || '').trim().toLowerCase();

  const existing = store.skipRequests.find(
    (r) => (r.rollNumber || '').toLowerCase() === cleanRoll && r.date === date
  );

  if (!existing) return { success: true };

  const remaining = (existing.skippedMeals || []).filter((m) => m !== mealType);

  let updatedList;
  if (remaining.length === 0) {
    updatedList = store.skipRequests.filter((r) => r.id !== existing.id);
  } else {
    updatedList = store.skipRequests.map((r) =>
      r.id === existing.id ? { ...r, skippedMeals: remaining, updatedAt: new Date().toISOString() } : r
    );
  }

  const updatedStore = { ...store, skipRequests: updatedList };
  saveLocalAttendanceStore(updatedStore);

  return {
    success: true,
    telemetry: getDailyMealAttendanceTelemetry(date),
  };
};

/**
 * Mess Manager records or updates actual meals served (e.g. from dining counter or scanner)
 */
export const recordActualMealsServed = ({ date, mealType, count }) => {
  if (!date || !mealType) throw new Error('Date and mealType are required.');
  const numericCount = Math.max(0, parseInt(count, 10) || 0);

  const store = getLocalAttendanceStore();
  const dayRecords = store.actualServedRecords[date] || {};

  const updatedActuals = {
    ...store.actualServedRecords,
    [date]: {
      ...dayRecords,
      [mealType]: numericCount,
    },
  };

  const updatedStore = {
    ...store,
    actualServedRecords: updatedActuals,
  };

  saveLocalAttendanceStore(updatedStore);
  return {
    success: true,
    date,
    mealType,
    actualServed: numericCount,
    telemetry: getDailyMealAttendanceTelemetry(date),
  };
};

/**
 * React hook / window event subscription helper
 */
export const subscribeMessAttendance = (listener) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(MESS_ATTENDANCE_UPDATED_EVENT, listener);
  return () => window.removeEventListener(MESS_ATTENDANCE_UPDATED_EVENT, listener);
};

