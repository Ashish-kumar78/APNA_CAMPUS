/**
 * APNA CAMPUS - Hostel Food Feedback & Mess Review Store
 * Reactive client-side store with real-time localStorage sync and backend API integration.
 */
import { api } from './api.js';
import { mockMessMenuWeekly } from '../components/hostel/hostelData.js';

const STORAGE_KEY = 'apna_campus_hostel_food_feedback_v1';
export const FOOD_FEEDBACK_UPDATED_EVENT = 'apna_campus_food_feedback_updated';

const seedInitialFeedback = () => [
  {
    id: 'ffb-001',
    feedbackCode: 'FFB-2026-1001',
    studentId: 'std-001',
    studentName: 'Rakesh Das',
    rollNumber: '2305200001',
    hostelId: 'hostel-b1',
    hostelName: 'Gandhi Boys Residence',
    mealDate: '2026-10-28',
    mealType: 'Dinner',
    foodItems: 'Phulka Chapati, Jeera Rice, Dal Makhani, Mixed Vegetable Korma, Kheer Payasam',
    qualityRating: 4,
    tasteRating: 4,
    temperatureRating: 5,
    hygieneRating: 5,
    quantity: 'Appropriate',
    overallRating: 4,
    category: 'Taste',
    comments: 'Dal Makhani and Kheer were delicious! Chapatis were served warm and fresh.',
    status: 'Resolved',
    priority: 'Normal',
    assignedWarden: 'Mr. Rajesh Jena',
    internalNotes: 'Compliments shared with kitchen head cook.',
    response: 'Thank you for your feedback! The mess committee has noted your appreciation.',
    respondedBy: 'Mr. Rajesh Jena',
    respondedAt: '2026-10-28T22:30:00Z',
    correctiveAction: 'Maintained current recipe standard.',
    createdAt: '2026-10-28T21:45:00Z',
    updatedAt: '2026-10-28T22:30:00Z'
  },
  {
    id: 'ffb-002',
    feedbackCode: 'FFB-2026-1002',
    studentId: 'std-002',
    studentName: 'Amit Nayak',
    rollNumber: '2305200002',
    hostelId: 'hostel-b1',
    hostelName: 'Gandhi Boys Residence',
    mealDate: '2026-10-29',
    mealType: 'Lunch',
    foodItems: 'Basmati Steamed Rice, Dal Tadka, Paneer Butter Masala, Aloo Gobi Dry, Papad, Curd',
    qualityRating: 2,
    tasteRating: 2,
    temperatureRating: 3,
    hygieneRating: 4,
    quantity: 'Too Little',
    overallRating: 2,
    category: 'Food Quality',
    comments: 'Paneer gravy had excessive salt and paneer cubes were slightly tough.',
    status: 'Under Review',
    priority: 'High',
    assignedWarden: 'Mr. Rajesh Jena',
    internalNotes: 'Inspected seasoning log with second shift chef.',
    response: 'Hostel warden has inspected the mess spice measurements and instructed chef to calibrate salt proportions.',
    respondedBy: 'Mr. Rajesh Jena',
    respondedAt: '2026-10-29T14:15:00Z',
    correctiveAction: 'Chef instructed to strictly follow standardized recipe proportions.',
    createdAt: '2026-10-29T13:30:00Z',
    updatedAt: '2026-10-29T14:15:00Z'
  },
  {
    id: 'ffb-003',
    feedbackCode: 'FFB-2026-1003',
    studentId: 'std-004',
    studentName: 'Priya Patra',
    rollNumber: '2305200004',
    hostelId: 'hostel-g1',
    hostelName: 'Sarojini Girls Residence',
    mealDate: '2026-10-29',
    mealType: 'Breakfast',
    foodItems: 'Idli, Medu Vada, Coconut Chutney, Sambar, Boiled Egg / Banana, Tea',
    qualityRating: 5,
    tasteRating: 5,
    temperatureRating: 5,
    hygieneRating: 5,
    quantity: 'Appropriate',
    overallRating: 5,
    category: 'Hygiene',
    comments: 'Crispy vadas and piping hot sambar. Dining counters were exceptionally clean.',
    status: 'Submitted',
    priority: 'Normal',
    assignedWarden: 'Mrs. Nibedita Das',
    internalNotes: '',
    response: null,
    respondedBy: null,
    respondedAt: null,
    correctiveAction: null,
    createdAt: '2026-10-29T09:15:00Z',
    updatedAt: '2026-10-29T09:15:00Z'
  }
];

let _memoryFeedback = null;

const getStorage = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch (e) {
    // Ignore storage errors in non-browser env
  }
  return null;
};

const notifyFeedbackUpdated = (data) => {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent(FOOD_FEEDBACK_UPDATED_EVENT, { detail: data }));
    } catch (e) {
      // Ignore dispatch errors
    }
  }
};

export const getLocalFoodFeedback = () => {
  const storage = getStorage();
  if (storage) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed parsing food feedback from storage:', e);
    }
  }
  if (_memoryFeedback && _memoryFeedback.length > 0) return _memoryFeedback;

  const initial = seedInitialFeedback();
  _memoryFeedback = initial;
  if (storage) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(initial));
    } catch (e) {
      // ignore
    }
  }
  return initial;
};

export const saveLocalFoodFeedback = (data) => {
  _memoryFeedback = data;
  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // ignore
    }
  }
  notifyFeedbackUpdated(data);
  return data;
};

export const resetFoodFeedbackStore = () => {
  _memoryFeedback = null;
  const storage = getStorage();
  if (storage) {
    try {
      storage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }
};

/**
 * Fetch daily mess menu for a given date
 */
export const getDailyMessMenu = async (dateStr) => {
  try {
    const res = await api.getMessMenu(dateStr);
    if (res?.data) return res.data;
  } catch (err) {
    console.warn('Backend API getMessMenu fallback to local timetable:', err.message);
  }

  const targetDate = dateStr ? new Date(dateStr) : new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[targetDate.getDay()] || 'Monday';
  const isoDate = targetDate.toISOString().split('T')[0];
  const weekly = mockMessMenuWeekly[dayName] || mockMessMenuWeekly['Monday'];

  return {
    date: isoDate,
    day: dayName,
    meals: {
      breakfast: { ...weekly.breakfast, mealType: 'Breakfast', date: isoDate },
      lunch: { ...weekly.lunch, mealType: 'Lunch', date: isoDate },
      snacks: { ...weekly.snacks, mealType: 'Evening Snacks', date: isoDate },
      dinner: { ...weekly.dinner, mealType: 'Dinner', date: isoDate }
    }
  };
};

/**
 * Submit student food feedback
 */
export const submitFoodFeedback = async (payload) => {
  // Validate future dates
  if (payload.mealDate) {
    const todayStr = new Date().toISOString().split('T')[0];
    if (payload.mealDate > todayStr) {
      throw new Error('Cannot submit feedback for future meals.');
    }
  }

  // Validate duplicate on frontend
  const current = getLocalFoodFeedback();
  const duplicate = current.find(
    f => f.rollNumber === payload.rollNumber &&
         f.mealDate === payload.mealDate &&
         f.mealType.toLowerCase() === payload.mealType.toLowerCase()
  );
  if (duplicate) {
    throw new Error(`You have already submitted feedback for ${payload.mealType} on ${payload.mealDate}.`);
  }

  // Attempt backend API submission
  let created = null;
  try {
    const res = await api.createFoodFeedback(payload);
    if (res?.data) created = res.data;
  } catch (err) {
    console.warn('Backend API createFoodFeedback fallback to local persistence:', err.message);
  }

  if (!created) {
    const newId = `ffb-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const feedbackCode = `FFB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    created = {
      id: newId,
      feedbackCode,
      studentId: payload.studentId || 'std-active',
      studentName: payload.studentName || 'Rakesh Das',
      rollNumber: payload.rollNumber || '2305200001',
      hostelId: payload.hostelId || null,
      hostelName: payload.hostelName || 'Sarojini Girls Residence (Block A)',
      mealDate: payload.mealDate,
      mealType: payload.mealType,
      foodItems: payload.foodItems || 'Standard Rotation Items',
      qualityRating: Number(payload.qualityRating) || 5,
      tasteRating: Number(payload.tasteRating) || 5,
      temperatureRating: Number(payload.temperatureRating) || 5,
      hygieneRating: Number(payload.hygieneRating) || 5,
      quantity: payload.quantity || 'Appropriate',
      overallRating: Number(payload.overallRating) || 5,
      category: payload.category || 'Taste',
      comments: payload.comments || '',
      status: 'Submitted',
      priority: Number(payload.overallRating) <= 2 ? 'High' : 'Normal',
      assignedWarden: payload.hostelName?.toLowerCase().includes('sarojini') ? 'Mrs. Nibedita Das' : 'Mr. Rajesh Jena',
      internalNotes: '',
      response: null,
      respondedBy: null,
      respondedAt: null,
      correctiveAction: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  const updated = [created, ...current];
  saveLocalFoodFeedback(updated);
  return created;
};

/**
 * Retrieve food feedback with optional filters
 */
export const getAllFoodFeedback = async (filters = {}) => {
  try {
    const res = await api.getFoodFeedback(filters);
    if (res?.data && Array.isArray(res.data)) {
      saveLocalFoodFeedback(res.data);
      return res.data;
    }
  } catch (err) {
    console.warn('Backend API getFoodFeedback fallback to local storage:', err.message);
  }

  let list = getLocalFoodFeedback();
  if (filters.mealDate) list = list.filter(f => f.mealDate === filters.mealDate);
  if (filters.mealType && filters.mealType !== 'ALL') list = list.filter(f => f.mealType.toLowerCase() === filters.mealType.toLowerCase());
  if (filters.category && filters.category !== 'ALL') list = list.filter(f => f.category.toLowerCase() === filters.category.toLowerCase());
  if (filters.status && filters.status !== 'ALL') list = list.filter(f => f.status.toLowerCase() === filters.status.toLowerCase());
  if (filters.hostel && filters.hostel !== 'ALL') list = list.filter(f => f.hostelName?.toLowerCase().includes(filters.hostel.toLowerCase()));
  if (filters.rating) list = list.filter(f => f.overallRating >= Number(filters.rating));
  if (filters.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(f =>
      f.feedbackCode?.toLowerCase().includes(s) ||
      f.comments?.toLowerCase().includes(s) ||
      f.studentName?.toLowerCase().includes(s) ||
      f.foodItems?.toLowerCase().includes(s)
    );
  }
  return list;
};

/**
 * Retrieve student self feedback history
 */
export const getStudentFoodFeedback = async (rollNumber, filters = {}) => {
  const all = await getAllFoodFeedback(filters);
  const targetRoll = rollNumber || '2305200001';
  const list = all.filter(f => f.rollNumber === targetRoll || (targetRoll === '2305200001' && f.studentName?.toLowerCase().includes('rakesh')));
  return list.map(item => {
    const { internalNotes, ...safe } = item;
    return safe;
  });
};

/**
 * Update status of food feedback
 */
export const updateFoodFeedbackStatus = async (id, status, priority, assignedWarden) => {
  try {
    await api.updateFoodFeedbackStatus(id, { status, priority, assignedWarden });
  } catch (err) {
    console.warn('Backend updateFoodFeedbackStatus fallback:', err.message);
  }

  const current = getLocalFoodFeedback();
  const updated = current.map(f => {
    if (f.id === id || f.feedbackCode === id) {
      return {
        ...f,
        status,
        ...(priority ? { priority } : {}),
        ...(assignedWarden ? { assignedWarden } : {}),
        updatedAt: new Date().toISOString()
      };
    }
    return f;
  });
  saveLocalFoodFeedback(updated);
  return updated.find(f => f.id === id || f.feedbackCode === id);
};

/**
 * Respond to food feedback
 */
export const respondToFoodFeedback = async (id, response, correctiveAction, officerName = 'Mr. Rajesh Jena') => {
  try {
    await api.respondToFoodFeedback(id, { response, correctiveAction });
  } catch (err) {
    console.warn('Backend respondToFoodFeedback fallback:', err.message);
  }

  const current = getLocalFoodFeedback();
  const updated = current.map(f => {
    if (f.id === id || f.feedbackCode === id) {
      return {
        ...f,
        response,
        correctiveAction: correctiveAction || f.correctiveAction,
        respondedBy: officerName,
        respondedAt: new Date().toISOString(),
        status: 'Resolved',
        updatedAt: new Date().toISOString()
      };
    }
    return f;
  });
  saveLocalFoodFeedback(updated);
  return updated.find(f => f.id === id || f.feedbackCode === id);
};

/**
 * Add internal administrative note
 */
export const addFoodFeedbackInternalNote = async (id, note, authorName = 'Warden') => {
  try {
    await api.addFoodFeedbackInternalNote(id, note);
  } catch (err) {
    console.warn('Backend addFoodFeedbackInternalNote fallback:', err.message);
  }

  const current = getLocalFoodFeedback();
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const formattedNote = `[${timestamp} by ${authorName}]: ${note}`;
  const updated = current.map(f => {
    if (f.id === id || f.feedbackCode === id) {
      return {
        ...f,
        internalNotes: f.internalNotes ? `${f.internalNotes}\n${formattedNote}` : formattedNote,
        updatedAt: new Date().toISOString()
      };
    }
    return f;
  });
  saveLocalFoodFeedback(updated);
  return updated.find(f => f.id === id || f.feedbackCode === id);
};

/**
 * Forward food feedback to Hostel Admin
 */
export const forwardFoodFeedbackToAdmin = async (id, forwardNote, authorName = 'Warden') => {
  try {
    await api.forwardFoodFeedback(id, forwardNote);
  } catch (err) {
    console.warn('Backend forwardFoodFeedback fallback:', err.message);
  }

  const current = getLocalFoodFeedback();
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const note = `[FORWARDED TO ADMIN at ${timestamp} by ${authorName}]: ${forwardNote || 'Escalated for administrative review'}`;
  const updated = current.map(f => {
    if (f.id === id || f.feedbackCode === id) {
      return {
        ...f,
        status: 'Action Required',
        priority: 'High',
        internalNotes: f.internalNotes ? `${f.internalNotes}\n${note}` : note,
        updatedAt: new Date().toISOString()
      };
    }
    return f;
  });
  saveLocalFoodFeedback(updated);
  return updated.find(f => f.id === id || f.feedbackCode === id);
};

/**
 * Calculate summary analytics
 */
export const getFoodFeedbackAnalytics = async () => {
  try {
    const res = await api.getFoodFeedbackAnalytics();
    if (res?.data) return res.data;
  } catch (err) {
    // fallback
  }

  const list = getLocalFoodFeedback();
  const totalFeedback = list.length;
  const avgRating = totalFeedback > 0 ? (list.reduce((acc, curr) => acc + curr.overallRating, 0) / totalFeedback).toFixed(1) : '4.5';
  const openIssues = list.filter(f => f.status !== 'Resolved').length;
  const resolvedIssues = list.filter(f => f.status === 'Resolved').length;

  const meals = ['Breakfast', 'Lunch', 'Evening Snacks', 'Dinner'];
  const ratingsByMeal = {};
  meals.forEach(m => {
    const subset = list.filter(f => f.mealType.toLowerCase() === m.toLowerCase());
    const sum = subset.reduce((acc, curr) => acc + curr.overallRating, 0);
    ratingsByMeal[m] = {
      count: subset.length,
      avgRating: subset.length > 0 ? Number((sum / subset.length).toFixed(1)) : 4.5
    };
  });

  const categoryDistribution = {};
  list.forEach(f => {
    categoryDistribution[f.category] = (categoryDistribution[f.category] || 0) + 1;
  });

  const hostelWiseRatings = {};
  list.forEach(f => {
    if (!hostelWiseRatings[f.hostelName]) {
      hostelWiseRatings[f.hostelName] = { count: 0, avgRating: 0 };
    }
    hostelWiseRatings[f.hostelName].count += 1;
  });
  Object.keys(hostelWiseRatings).forEach(h => {
    const subset = list.filter(f => f.hostelName === h);
    const sum = subset.reduce((acc, curr) => acc + curr.overallRating, 0);
    hostelWiseRatings[h].avgRating = Number((sum / subset.length).toFixed(1));
  });

  return {
    totalFeedback,
    averageRating: Number(avgRating),
    openIssues,
    resolvedIssues,
    ratingsByMeal,
    categoryDistribution,
    hostelWiseRatings,
    recentTrend: [
      { date: '2026-10-25', rating: 4.2 },
      { date: '2026-10-26', rating: 4.4 },
      { date: '2026-10-27', rating: 4.1 },
      { date: '2026-10-28', rating: 4.6 },
      { date: '2026-10-29', rating: 4.5 },
    ]
  };
};

/**
 * React hook/subscription helper
 */
export const subscribeFoodFeedback = (listener) => {
  if (typeof window === 'undefined') return () => {};
  const handler = (e) => listener(e.detail || getLocalFoodFeedback());
  window.addEventListener(FOOD_FEEDBACK_UPDATED_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(FOOD_FEEDBACK_UPDATED_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
};
