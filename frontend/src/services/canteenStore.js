// Central Store & State Engine for Biometric-Based Canteen Food Management System
// APNA CAMPUS ERP — Canteen Directorate

const CANTEEN_STORAGE_PREFIX = 'apna_canteen_v2_';

// Initial Student Base with Day Scholar & Hosteller categorization and Fingerprint Templates
export const initialCanteenStudents = [
  {
    studentId: '2401432265',
    name: 'Bishnu Prasad Sahoo',
    category: 'Hosteller',
    room: 'Block-A / 304',
    department: 'CSE (AI)',
    semester: 'Semester 3',
    phone: '+91 77498 44291',
    fingerprintId: 'FP-19181',
    fingerprintQuality: '99.2%',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    studentId: '2401432288',
    name: 'Priya Sharma',
    category: 'Day Scholar',
    room: 'N/A (Day Scholar)',
    department: 'Computer Science & Engineering',
    semester: 'Semester 3',
    phone: '+91 94371 88201',
    fingerprintId: 'FP-20112',
    fingerprintQuality: '98.5%',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    studentId: '2305201001',
    name: 'Rakesh Das',
    category: 'Hosteller',
    room: 'Block-B / 112',
    department: 'Mechanical Engineering',
    semester: 'Semester 5',
    phone: '+91 98612 44310',
    fingerprintId: 'FP-18450',
    fingerprintQuality: '97.8%',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    studentId: '2305201002',
    name: 'Amit Nayak',
    category: 'Day Scholar',
    room: 'N/A (Day Scholar - Bus Route 2)',
    department: 'Civil Engineering',
    semester: 'Semester 5',
    phone: '+91 94371 00215',
    fingerprintId: 'FP-18451',
    fingerprintQuality: '98.1%',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    studentId: '2301289140',
    name: 'Subhashree Mohapatra',
    category: 'Hosteller',
    room: 'Gargi Girls Hostel / 208',
    department: 'Electrical Engineering',
    semester: 'Semester 5',
    phone: '+91 82491 55021',
    fingerprintId: 'FP-17932',
    fingerprintQuality: '99.0%',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
  },
  {
    studentId: '2401432290',
    name: 'Rahul Verma',
    category: 'Hosteller',
    room: 'Block-A / 215',
    department: 'CSE (Data Science)',
    semester: 'Semester 3',
    phone: '+91 99370 12450',
    fingerprintId: 'FP-19205',
    fingerprintQuality: '96.9%',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
  },
  {
    studentId: '2401432295',
    name: 'Ananya Panda',
    category: 'Day Scholar',
    room: 'N/A (Day Scholar)',
    department: 'Electronics & Communication',
    semester: 'Semester 3',
    phone: '+91 97761 33490',
    fingerprintId: 'FP-20150',
    fingerprintQuality: '98.8%',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },
  {
    studentId: '2305201015',
    name: 'Soumya Ranjan Rout',
    category: 'Hosteller',
    room: 'Block-C / 104',
    department: 'CSE',
    semester: 'Semester 5',
    phone: '+91 94390 88123',
    fingerprintId: 'FP-18512',
    fingerprintQuality: '97.4%',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
  },
  {
    studentId: '2401432301',
    name: 'Debasis Mishra',
    category: 'Day Scholar',
    room: 'N/A (Day Scholar)',
    department: 'Information Technology',
    semester: 'Semester 3',
    phone: '+91 91240 55678',
    fingerprintId: 'FP-20199',
    fingerprintQuality: '98.3%',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  },
  {
    studentId: '2401432305',
    name: 'Sneha Mohanty',
    category: 'Hosteller',
    room: 'Maitreyi Girls Hostel / 114',
    department: 'Biotechnology',
    semester: 'Semester 3',
    phone: '+91 98530 66789',
    fingerprintId: 'FP-19340',
    fingerprintQuality: '99.4%',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  }
];

// Initial Food Access Applications
export const initialFoodApplications = [
  {
    id: 'APP-CAN-2026-001',
    studentId: '2401432265',
    studentName: 'Bishnu Prasad Sahoo',
    category: 'Hosteller',
    department: 'CSE (AI)',
    submissionDate: '2026-07-28',
    status: 'Approved',
    requestedMeals: ['Breakfast', 'Lunch', 'Dinner'],
    subscriptionStatus: 'Active Subscription',
    reviewedBy: 'Mr. Kailash Chandra Sahoo (Canteen In-Charge)',
    reviewDate: '2026-07-30',
    remarks: 'Approved for full academic year hostel mess clearance.'
  },
  {
    id: 'APP-CAN-2026-002',
    studentId: '2401432288',
    studentName: 'Priya Sharma',
    category: 'Day Scholar',
    department: 'Computer Science & Engineering',
    submissionDate: '2026-08-02',
    status: 'Approved',
    requestedMeals: ['Lunch'],
    subscriptionStatus: 'Active Subscription',
    reviewedBy: 'Mr. Kailash Chandra Sahoo (Canteen In-Charge)',
    reviewDate: '2026-08-03',
    remarks: 'Day Scholar special lunch meal plan approved.'
  },
  {
    id: 'APP-CAN-2026-003',
    studentId: '2305201001',
    studentName: 'Rakesh Das',
    category: 'Hosteller',
    department: 'Mechanical Engineering',
    submissionDate: '2026-07-25',
    status: 'Approved',
    requestedMeals: ['Breakfast', 'Lunch', 'Dinner'],
    subscriptionStatus: 'Active Subscription',
    reviewedBy: 'Mr. Kailash Chandra Sahoo (Canteen In-Charge)',
    reviewDate: '2026-07-27',
    remarks: 'Full 3-meal subscription approved.'
  },
  {
    id: 'APP-CAN-2026-004',
    studentId: '2305201002',
    studentName: 'Amit Nayak',
    category: 'Day Scholar',
    department: 'Civil Engineering',
    submissionDate: '2026-08-05',
    status: 'Approved',
    requestedMeals: ['Breakfast', 'Lunch'],
    subscriptionStatus: 'Active Subscription',
    reviewedBy: 'Mr. Kailash Chandra Sahoo (Canteen In-Charge)',
    reviewDate: '2026-08-06',
    remarks: 'Early morning commuter combo plan approved.'
  },
  {
    id: 'APP-CAN-2026-005',
    studentId: '2301289140',
    studentName: 'Subhashree Mohapatra',
    category: 'Hosteller',
    department: 'Electrical Engineering',
    submissionDate: '2026-07-29',
    status: 'Approved',
    requestedMeals: ['Breakfast', 'Lunch', 'Dinner'],
    subscriptionStatus: 'Active Subscription',
    reviewedBy: 'Mr. Kailash Chandra Sahoo (Canteen In-Charge)',
    reviewDate: '2026-07-31',
    remarks: 'Hostel mess registration verified.'
  },
  {
    id: 'APP-CAN-2026-006',
    studentId: '2401432295',
    studentName: 'Ananya Panda',
    category: 'Day Scholar',
    department: 'Electronics & Communication',
    submissionDate: '2026-10-25',
    status: 'Pending',
    requestedMeals: ['Lunch'],
    subscriptionStatus: 'Pending Approval',
    reviewedBy: 'Under Administrative Review',
    reviewDate: null,
    remarks: 'Awaiting student council verification for mid-semester lunch pass.'
  },
  {
    id: 'APP-CAN-2026-007',
    studentId: '2401432301',
    studentName: 'Debasis Mishra',
    category: 'Day Scholar',
    department: 'Information Technology',
    submissionDate: '2026-10-26',
    status: 'Pending',
    requestedMeals: ['Breakfast', 'Lunch'],
    subscriptionStatus: 'Pending Approval',
    reviewedBy: 'Under Administrative Review',
    reviewDate: null,
    remarks: 'Applied for November term meal pass.'
  },
  {
    id: 'APP-CAN-2026-008',
    studentId: '2305201015',
    studentName: 'Soumya Ranjan Rout',
    category: 'Hosteller',
    department: 'CSE',
    submissionDate: '2026-08-10',
    status: 'Approved',
    requestedMeals: ['Breakfast', 'Lunch', 'Dinner'],
    subscriptionStatus: 'Active Subscription',
    reviewedBy: 'Mr. Kailash Chandra Sahoo',
    reviewDate: '2026-08-11',
    remarks: 'Verified.'
  },
  {
    id: 'APP-CAN-2026-009',
    studentId: '2401432305',
    studentName: 'Sneha Mohanty',
    category: 'Hosteller',
    department: 'Biotechnology',
    submissionDate: '2026-08-01',
    status: 'Approved',
    requestedMeals: ['Breakfast', 'Lunch', 'Dinner'],
    subscriptionStatus: 'Active Subscription',
    reviewedBy: 'Mr. Kailash Chandra Sahoo',
    reviewDate: '2026-08-02',
    remarks: 'Verified.'
  }
];

// Initial Yearly Meal Subscriptions (Approved students only)
export const initialYearlySubscriptions = [
  {
    id: 'SUB-2026-01',
    studentId: '2401432265',
    studentName: 'Bishnu Prasad Sahoo',
    category: 'Hosteller',
    selectedMeals: {
      breakfast: true,
      lunch: true,
      dinner: true
    },
    feeBreakdown: {
      breakfast: 12000,
      lunch: 18000,
      dinner: 18000
    },
    totalAnnualFee: 48000,
    startDate: '2026-08-01',
    expiryDate: '2027-07-31',
    academicYear: '2026-2027',
    status: 'Active',
    renewalNotice: 'Valid (Expires 31 Jul 2027)'
  },
  {
    id: 'SUB-2026-02',
    studentId: '2401432288',
    studentName: 'Priya Sharma',
    category: 'Day Scholar',
    selectedMeals: {
      breakfast: false,
      lunch: true,
      dinner: false
    },
    feeBreakdown: {
      breakfast: 0,
      lunch: 18000,
      dinner: 0
    },
    totalAnnualFee: 18000,
    startDate: '2026-08-01',
    expiryDate: '2027-07-31',
    academicYear: '2026-2027',
    status: 'Active',
    renewalNotice: 'Valid (Expires 31 Jul 2027)'
  },
  {
    id: 'SUB-2026-03',
    studentId: '2305201001',
    studentName: 'Rakesh Das',
    category: 'Hosteller',
    selectedMeals: {
      breakfast: true,
      lunch: true,
      dinner: true
    },
    feeBreakdown: {
      breakfast: 12000,
      lunch: 18000,
      dinner: 18000
    },
    totalAnnualFee: 48000,
    startDate: '2026-08-01',
    expiryDate: '2027-07-31',
    academicYear: '2026-2027',
    status: 'Active',
    renewalNotice: 'Valid (Expires 31 Jul 2027)'
  },
  {
    id: 'SUB-2026-04',
    studentId: '2305201002',
    studentName: 'Amit Nayak',
    category: 'Day Scholar',
    selectedMeals: {
      breakfast: true,
      lunch: true,
      dinner: false
    },
    feeBreakdown: {
      breakfast: 12000,
      lunch: 18000,
      dinner: 0
    },
    totalAnnualFee: 30000,
    startDate: '2026-08-01',
    expiryDate: '2027-07-31',
    academicYear: '2026-2027',
    status: 'Active',
    renewalNotice: 'Valid (Expires 31 Jul 2027)'
  },
  {
    id: 'SUB-2026-05',
    studentId: '2301289140',
    studentName: 'Subhashree Mohapatra',
    category: 'Hosteller',
    selectedMeals: {
      breakfast: true,
      lunch: true,
      dinner: true
    },
    feeBreakdown: {
      breakfast: 12000,
      lunch: 18000,
      dinner: 18000
    },
    totalAnnualFee: 48000,
    startDate: '2026-08-01',
    expiryDate: '2027-07-31',
    academicYear: '2026-2027',
    status: 'Active',
    renewalNotice: 'Valid (Expires 31 Jul 2027)'
  },
  {
    id: 'SUB-2026-06',
    studentId: '2305201015',
    studentName: 'Soumya Ranjan Rout',
    category: 'Hosteller',
    selectedMeals: {
      breakfast: true,
      lunch: true,
      dinner: true
    },
    feeBreakdown: {
      breakfast: 12000,
      lunch: 18000,
      dinner: 18000
    },
    totalAnnualFee: 48000,
    startDate: '2026-08-01',
    expiryDate: '2027-07-31',
    academicYear: '2026-2027',
    status: 'Active',
    renewalNotice: 'Valid (Expires 31 Jul 2027)'
  },
  {
    id: 'SUB-2026-07',
    studentId: '2401432305',
    studentName: 'Sneha Mohanty',
    category: 'Hosteller',
    selectedMeals: {
      breakfast: true,
      lunch: true,
      dinner: true
    },
    feeBreakdown: {
      breakfast: 12000,
      lunch: 18000,
      dinner: 18000
    },
    totalAnnualFee: 48000,
    startDate: '2026-08-01',
    expiryDate: '2027-07-31',
    academicYear: '2026-2027',
    status: 'Active',
    renewalNotice: 'Valid (Expires 31 Jul 2027)'
  }
];

// Initial Daily Biometric Meal Access Logs (for Today 2026-10-27 and historical reference)
export const initialBiometricMealLogs = [
  // Today's Breakfast Logs
  {
    id: 'LOG-BIO-101',
    studentId: '2401432265',
    studentName: 'Bishnu Prasad Sahoo',
    category: 'Hosteller',
    mealType: 'Breakfast',
    date: '2026-10-27',
    time: '08:14 AM',
    biometricStatus: 'Verified · Match 99.2%',
    fingerprintId: 'FP-19181',
    subscriptionStatus: 'Valid Yearly Subscription',
    terminalId: 'BIO-TERM-01 (Hostel Mess Gate)'
  },
  {
    id: 'LOG-BIO-102',
    studentId: '2305201001',
    studentName: 'Rakesh Das',
    category: 'Hosteller',
    mealType: 'Breakfast',
    date: '2026-10-27',
    time: '08:22 AM',
    biometricStatus: 'Verified · Match 97.8%',
    fingerprintId: 'FP-18450',
    subscriptionStatus: 'Valid Yearly Subscription',
    terminalId: 'BIO-TERM-01 (Hostel Mess Gate)'
  },
  {
    id: 'LOG-BIO-103',
    studentId: '2305201002',
    studentName: 'Amit Nayak',
    category: 'Day Scholar',
    mealType: 'Breakfast',
    date: '2026-10-27',
    time: '08:45 AM',
    biometricStatus: 'Verified · Match 98.1%',
    fingerprintId: 'FP-18451',
    subscriptionStatus: 'Valid Yearly Subscription',
    terminalId: 'BIO-TERM-02 (Central Canteen Gate)'
  },
  {
    id: 'LOG-BIO-104',
    studentId: '2301289140',
    studentName: 'Subhashree Mohapatra',
    category: 'Hosteller',
    mealType: 'Breakfast',
    date: '2026-10-27',
    time: '08:35 AM',
    biometricStatus: 'Verified · Match 99.0%',
    fingerprintId: 'FP-17932',
    subscriptionStatus: 'Valid Yearly Subscription',
    terminalId: 'BIO-TERM-01 (Hostel Mess Gate)'
  },
  // Today's Lunch Logs
  {
    id: 'LOG-BIO-201',
    studentId: '2401432265',
    studentName: 'Bishnu Prasad Sahoo',
    category: 'Hosteller',
    mealType: 'Lunch',
    date: '2026-10-27',
    time: '01:10 PM',
    biometricStatus: 'Verified · Match 99.1%',
    fingerprintId: 'FP-19181',
    subscriptionStatus: 'Valid Yearly Subscription',
    terminalId: 'BIO-TERM-01 (Hostel Mess Gate)'
  },
  {
    id: 'LOG-BIO-202',
    studentId: '2401432288',
    studentName: 'Priya Sharma',
    category: 'Day Scholar',
    mealType: 'Lunch',
    date: '2026-10-27',
    time: '01:25 PM',
    biometricStatus: 'Verified · Match 98.5%',
    fingerprintId: 'FP-20112',
    subscriptionStatus: 'Valid Yearly Subscription',
    terminalId: 'BIO-TERM-02 (Central Canteen Gate)'
  },
  {
    id: 'LOG-BIO-203',
    studentId: '2305201001',
    studentName: 'Rakesh Das',
    category: 'Hosteller',
    mealType: 'Lunch',
    date: '2026-10-27',
    time: '01:18 PM',
    biometricStatus: 'Verified · Match 98.0%',
    fingerprintId: 'FP-18450',
    subscriptionStatus: 'Valid Yearly Subscription',
    terminalId: 'BIO-TERM-01 (Hostel Mess Gate)'
  },
  {
    id: 'LOG-BIO-204',
    studentId: '2305201002',
    studentName: 'Amit Nayak',
    category: 'Day Scholar',
    mealType: 'Lunch',
    date: '2026-10-27',
    time: '01:30 PM',
    biometricStatus: 'Verified · Match 98.2%',
    fingerprintId: 'FP-18451',
    subscriptionStatus: 'Valid Yearly Subscription',
    terminalId: 'BIO-TERM-02 (Central Canteen Gate)'
  },
  {
    id: 'LOG-BIO-205',
    studentId: '2305201015',
    studentName: 'Soumya Ranjan Rout',
    category: 'Hosteller',
    mealType: 'Lunch',
    date: '2026-10-27',
    time: '01:38 PM',
    biometricStatus: 'Verified · Match 97.4%',
    fingerprintId: 'FP-18512',
    subscriptionStatus: 'Valid Yearly Subscription',
    terminalId: 'BIO-TERM-01 (Hostel Mess Gate)'
  },
  {
    id: 'LOG-BIO-206',
    studentId: '2401432305',
    studentName: 'Sneha Mohanty',
    category: 'Hosteller',
    mealType: 'Lunch',
    date: '2026-10-27',
    time: '01:42 PM',
    biometricStatus: 'Verified · Match 99.4%',
    fingerprintId: 'FP-19340',
    subscriptionStatus: 'Valid Yearly Subscription',
    terminalId: 'BIO-TERM-01 (Hostel Mess Gate)'
  }
];

// Special Dishes & Extra Curries Catalog
export const initialSpecialDishes = [
  {
    id: 'DISH-01',
    name: 'Paneer Butter Masala',
    category: 'Special Curry',
    mealAvailability: ['Lunch', 'Dinner'],
    price: 60,
    description: 'Fresh malai paneer simmered in rich makhani cashew-tomato gravy, finished with butter & fenugreek.',
    prepTime: 'Made to Order',
    isAvailable: true,
    dietType: 'Vegetarian',
    orderingCutoff: '11:45 AM (Lunch) / 06:45 PM (Dinner)'
  },
  {
    id: 'DISH-02',
    name: 'Odia Style Chicken Kosha',
    category: 'Special Non-Veg Curry',
    mealAvailability: ['Lunch', 'Dinner'],
    price: 90,
    description: 'Slow-cooked farm chicken in slow-caramelized onions, crushed ginger, garlic and fragrant garam masala.',
    prepTime: 'Chef Special',
    isAvailable: true,
    dietType: 'Non-Vegetarian',
    orderingCutoff: '11:45 AM (Lunch) / 06:45 PM (Dinner)'
  },
  {
    id: 'DISH-03',
    name: 'Egg Curry (Double Egg)',
    category: 'Curry / Side Dish',
    mealAvailability: ['Lunch', 'Dinner'],
    price: 40,
    description: 'Two golden crisped boiled eggs cooked in homestyle spiced onion-tomato gravy with fresh coriander.',
    prepTime: 'Quick Prep',
    isAvailable: true,
    dietType: 'Non-Vegetarian',
    orderingCutoff: '12:00 PM (Lunch) / 07:00 PM (Dinner)'
  },
  {
    id: 'DISH-04',
    name: 'Crispy River Fish Fry (Katla)',
    category: 'Special Non-Veg Side',
    mealAvailability: ['Lunch'],
    price: 80,
    description: 'Fresh local river fish marinated with yellow mustard, turmeric, and shallow crisp-fried with green chillies.',
    prepTime: 'Fresh Pan Fry',
    isAvailable: true,
    dietType: 'Non-Vegetarian',
    orderingCutoff: '11:30 AM (Lunch Only)'
  },
  {
    id: 'DISH-05',
    name: 'Dal Makhani (Slow Simmered)',
    category: 'Special Curry',
    mealAvailability: ['Lunch', 'Dinner'],
    price: 50,
    description: 'Authentic 12-hour slow cooked black urad and rajma simmered with white butter, cream and gentle spices.',
    prepTime: 'Special Batch',
    isAvailable: true,
    dietType: 'Vegetarian',
    orderingCutoff: '12:00 PM (Lunch) / 07:00 PM (Dinner)'
  },
  {
    id: 'DISH-06',
    name: 'Mushroom Masala Gravy',
    category: 'Special Curry',
    mealAvailability: ['Lunch', 'Dinner'],
    price: 65,
    description: 'Fresh button mushrooms tossed with diced bell peppers and cooked in robust kadhai spices.',
    prepTime: 'Made to Order',
    isAvailable: true,
    dietType: 'Vegetarian',
    orderingCutoff: '11:45 AM (Lunch) / 06:45 PM (Dinner)'
  },
  {
    id: 'DISH-07',
    name: 'Hot Gulab Jamun (2 Pcs)',
    category: 'Dessert & Sweets',
    mealAvailability: ['Breakfast', 'Lunch', 'Dinner'],
    price: 30,
    description: 'Warm khoya dumplings steeped in rose water cardamom syrup.',
    prepTime: 'Ready Counter',
    isAvailable: true,
    dietType: 'Vegetarian',
    orderingCutoff: 'Anytime'
  },
  {
    id: 'DISH-08',
    name: 'Earthen Sweet Curd (Mishti Doi)',
    category: 'Dairy & Dessert',
    mealAvailability: ['Lunch', 'Dinner'],
    price: 25,
    description: 'Traditional caramelized sweet curd chilled in porous clay cups.',
    prepTime: 'Ready Counter',
    isAvailable: true,
    dietType: 'Vegetarian',
    orderingCutoff: 'Anytime'
  }
];

// Special Dish Transactions
export const initialSpecialDishTransactions = [
  {
    id: 'TRX-SD-2026-1041',
    studentId: '2401432265',
    studentName: 'Bishnu Prasad Sahoo',
    dishId: 'DISH-01',
    dishName: 'Paneer Butter Masala',
    mealCategory: 'Lunch',
    orderDate: '2026-10-27',
    scheduledServingDate: '2026-10-27',
    quantity: 1,
    pricePerItem: 60,
    totalAdditionalCharge: 60,
    orderStatus: 'Confirmed', // Requested, Confirmed, Prepared, Served, Cancelled
    paymentStatus: 'Pending', // Pending, Paid, Partially Paid, Refunded
    billedToAccount: true,
    servedTimestamp: null,
    servedByStaff: null
  },
  {
    id: 'TRX-SD-2026-1039',
    studentId: '2401432265',
    studentName: 'Bishnu Prasad Sahoo',
    dishId: 'DISH-02',
    dishName: 'Odia Style Chicken Kosha',
    mealCategory: 'Dinner',
    orderDate: '2026-10-26',
    scheduledServingDate: '2026-10-26',
    quantity: 1,
    pricePerItem: 90,
    totalAdditionalCharge: 90,
    orderStatus: 'Served',
    paymentStatus: 'Paid',
    billedToAccount: true,
    servedTimestamp: '2026-10-26 08:35 PM',
    servedByStaff: 'Kailash Sahoo (Canteen In-Charge)'
  },
  {
    id: 'TRX-SD-2026-1038',
    studentId: '2401432288',
    studentName: 'Priya Sharma',
    dishId: 'DISH-05',
    dishName: 'Dal Makhani (Slow Simmered)',
    mealCategory: 'Lunch',
    orderDate: '2026-10-27',
    scheduledServingDate: '2026-10-27',
    quantity: 1,
    pricePerItem: 50,
    totalAdditionalCharge: 50,
    orderStatus: 'Served',
    paymentStatus: 'Paid',
    billedToAccount: true,
    servedTimestamp: '2026-10-27 01:28 PM',
    servedByStaff: 'Kailash Sahoo'
  },
  {
    id: 'TRX-SD-2026-1035',
    studentId: '2305201001',
    studentName: 'Rakesh Das',
    dishId: 'DISH-04',
    dishName: 'Crispy River Fish Fry (Katla)',
    mealCategory: 'Lunch',
    orderDate: '2026-10-27',
    scheduledServingDate: '2026-10-27',
    quantity: 2,
    pricePerItem: 80,
    totalAdditionalCharge: 160,
    orderStatus: 'Served',
    paymentStatus: 'Paid',
    billedToAccount: true,
    servedTimestamp: '2026-10-27 01:20 PM',
    servedByStaff: 'Kailash Sahoo'
  },
  {
    id: 'TRX-SD-2026-1032',
    studentId: '2305201002',
    studentName: 'Amit Nayak',
    dishId: 'DISH-07',
    dishName: 'Hot Gulab Jamun (2 Pcs)',
    mealCategory: 'Lunch',
    orderDate: '2026-10-27',
    scheduledServingDate: '2026-10-27',
    quantity: 1,
    pricePerItem: 30,
    totalAdditionalCharge: 30,
    orderStatus: 'Confirmed',
    paymentStatus: 'Pending',
    billedToAccount: true,
    servedTimestamp: null,
    servedByStaff: null
  }
];

// Initial Canteen Fee Payments History
export const initialCanteenPayments = [
  {
    id: 'PAY-CAN-901',
    studentId: '2401432265',
    studentName: 'Bishnu Prasad Sahoo',
    amount: 40000,
    paymentDate: '2026-08-05',
    paymentMode: 'Net Banking (SBI)',
    referenceNo: 'TXN-SBI-8921890',
    description: 'Yearly Mess Fee Installment 1',
    receiptNo: 'RCPT-CAN-2026-0421'
  },
  {
    id: 'PAY-CAN-902',
    studentId: '2401432288',
    studentName: 'Priya Sharma',
    amount: 18000,
    paymentDate: '2026-08-04',
    paymentMode: 'UPI (GPay)',
    referenceNo: 'UPI-77491-0021',
    description: 'Full Yearly Lunch Subscription Fee',
    receiptNo: 'RCPT-CAN-2026-0402'
  },
  {
    id: 'PAY-CAN-903',
    studentId: '2305201001',
    studentName: 'Rakesh Das',
    amount: 48000,
    paymentDate: '2026-08-02',
    paymentMode: 'Cheque / Draft',
    referenceNo: 'CHQ-PNB-004128',
    description: 'Full Yearly Hostel Mess Subscription',
    receiptNo: 'RCPT-CAN-2026-0390'
  },
  {
    id: 'PAY-CAN-904',
    studentId: '2305201002',
    studentName: 'Amit Nayak',
    amount: 30000,
    paymentDate: '2026-08-06',
    paymentMode: 'Debit Card',
    referenceNo: 'CARD-HDFC-9912',
    description: 'Full Yearly Breakfast + Lunch Subscription',
    receiptNo: 'RCPT-CAN-2026-0433'
  }
];

class CanteenStore {
  constructor() {
    this.students = this._load('students', initialCanteenStudents);
    this.applications = this._load('applications', initialFoodApplications);
    this.subscriptions = this._load('subscriptions', initialYearlySubscriptions);
    this.biometricLogs = this._load('biometric_logs', initialBiometricMealLogs);
    this.specialDishes = this._load('special_dishes', initialSpecialDishes);
    this.specialTransactions = this._load('special_transactions', initialSpecialDishTransactions);
    this.payments = this._load('payments', initialCanteenPayments);
  }

  _load(key, fallback) {
    try {
      const item = localStorage.getItem(`${CANTEEN_STORAGE_PREFIX}${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.warn(`[CanteenStore] Failed to load ${key}:`, e);
      return fallback;
    }
  }

  _save(key, data) {
    try {
      localStorage.setItem(`${CANTEEN_STORAGE_PREFIX}${key}`, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('cms_canteen_updated', { detail: { key } }));
    } catch (e) {
      console.warn(`[CanteenStore] Failed to save ${key}:`, e);
    }
  }

  // --- Student Methods ---
  getAllStudents() {
    return this.students;
  }

  getStudentById(studentId) {
    return this.students.find(s => s.studentId === String(studentId)) || null;
  }

  // --- Applications Methods ---
  getApplications() {
    return this.applications;
  }

  getApplicationByStudentId(studentId) {
    return this.applications.find(a => a.studentId === String(studentId)) || null;
  }

  submitApplication({ studentId, studentName, category, department, requestedMeals, remarks }) {
    const existing = this.getApplicationByStudentId(studentId);
    if (existing && existing.status === 'Pending') {
      return { success: false, message: 'You already have an application under review.' };
    }

    const newApp = {
      id: `APP-CAN-${Date.now().toString().slice(-6)}`,
      studentId: String(studentId),
      studentName,
      category: category || 'Day Scholar',
      department: department || 'General Engineering',
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      requestedMeals: requestedMeals || ['Lunch'],
      subscriptionStatus: 'Pending Approval',
      reviewedBy: 'Under Administrative Review',
      reviewDate: null,
      remarks: remarks || 'Initial Food Access Application'
    };

    if (existing) {
      this.applications = this.applications.map(a => a.studentId === String(studentId) ? newApp : a);
    } else {
      this.applications = [newApp, ...this.applications];
    }

    this._save('applications', this.applications);
    return { success: true, application: newApp };
  }

  updateApplicationStatus(appId, newStatus, reviewerName = 'Canteen In-Charge', remarks = '') {
    this.applications = this.applications.map(a => {
      if (a.id === appId) {
        return {
          ...a,
          status: newStatus,
          subscriptionStatus: newStatus === 'Approved' ? 'Eligible for Subscription' : 'Rejected',
          reviewedBy: reviewerName,
          reviewDate: new Date().toISOString().split('T')[0],
          remarks: remarks || a.remarks
        };
      }
      return a;
    });
    this._save('applications', this.applications);
    return true;
  }

  // --- Yearly Subscriptions Methods ---
  getSubscriptions() {
    return this.subscriptions;
  }

  getSubscriptionByStudentId(studentId) {
    return this.subscriptions.find(s => s.studentId === String(studentId)) || null;
  }

  saveSubscription({ studentId, studentName, category, selectedMeals, startDate, expiryDate }) {
    // Only approved students are allowed
    const app = this.getApplicationByStudentId(studentId);
    if (!app || app.status !== 'Approved') {
      return { success: false, message: 'Only students with approved food access applications can activate subscriptions.' };
    }

    const bfFee = selectedMeals.breakfast ? 12000 : 0;
    const lunchFee = selectedMeals.lunch ? 18000 : 0;
    const dinnerFee = selectedMeals.dinner ? 18000 : 0;
    const totalFee = bfFee + lunchFee + dinnerFee;

    const existingIndex = this.subscriptions.findIndex(s => s.studentId === String(studentId));
    const subRecord = {
      id: existingIndex >= 0 ? this.subscriptions[existingIndex].id : `SUB-${Date.now().toString().slice(-6)}`,
      studentId: String(studentId),
      studentName,
      category: category || app.category,
      selectedMeals: {
        breakfast: Boolean(selectedMeals.breakfast),
        lunch: Boolean(selectedMeals.lunch),
        dinner: Boolean(selectedMeals.dinner)
      },
      feeBreakdown: {
        breakfast: bfFee,
        lunch: lunchFee,
        dinner: dinnerFee
      },
      totalAnnualFee: totalFee,
      startDate: startDate || '2026-08-01',
      expiryDate: expiryDate || '2027-07-31',
      academicYear: '2026-2027',
      status: 'Active',
      renewalNotice: `Valid until ${expiryDate || '31 Jul 2027'}`
    };

    if (existingIndex >= 0) {
      this.subscriptions[existingIndex] = subRecord;
    } else {
      this.subscriptions = [subRecord, ...this.subscriptions];
    }

    // Update application subscription status
    this.applications = this.applications.map(a => {
      if (a.studentId === String(studentId)) {
        return { ...a, subscriptionStatus: 'Active Subscription' };
      }
      return a;
    });

    this._save('subscriptions', this.subscriptions);
    this._save('applications', this.applications);
    return { success: true, subscription: subRecord };
  }

  // --- Biometric Meal Verification & Access Engine ---
  verifyBiometricMealAccess(studentId, mealType = 'Lunch', terminalId = 'BIO-TERM-01 (Main Counter)') {
    const student = this.getStudentById(studentId);
    if (!student) {
      return {
        success: false,
        code: 'STUDENT_NOT_FOUND',
        message: `Student ID "${studentId}" is not enrolled in the authorized campus student database.`
      };
    }

    // 1. Check Food Access Application
    const app = this.getApplicationByStudentId(studentId);
    if (!app || app.status !== 'Approved') {
      return {
        success: false,
        code: 'APPLICATION_UNAPPROVED',
        student,
        message: `Food Access Application is ${app ? app.status.toUpperCase() : 'NOT SUBMITTED'}. Only approved students can access meals.`
      };
    }

    // 2. Check Yearly Subscription
    const sub = this.getSubscriptionByStudentId(studentId);
    if (!sub || sub.status !== 'Active') {
      return {
        success: false,
        code: 'NO_ACTIVE_SUBSCRIPTION',
        student,
        message: 'No active meal subscription found on student record.'
      };
    }

    // Check expiry
    const todayStr = new Date().toISOString().split('T')[0];
    if (sub.expiryDate < todayStr) {
      return {
        success: false,
        code: 'SUBSCRIPTION_EXPIRED',
        student,
        message: `Yearly subscription expired on ${sub.expiryDate}. Please renew to access meals.`
      };
    }

    // Check specific meal coverage
    const mealKey = mealType.toLowerCase();
    if (!sub.selectedMeals[mealKey]) {
      return {
        success: false,
        code: 'MEAL_NOT_SUBSCRIBED',
        student,
        message: `Student is not subscribed to ${mealType}. Active subscriptions: ${Object.entries(sub.selectedMeals).filter(([, v]) => v).map(([k]) => k.toUpperCase()).join(', ')}.`
      };
    }

    // 3. Prevent Duplicate Meal Claims (Same student, same meal, same date)
    const existingLog = this.biometricLogs.find(
      log => log.studentId === String(studentId) &&
             log.mealType.toLowerCase() === mealType.toLowerCase() &&
             log.date === todayStr
    );

    if (existingLog) {
      return {
        success: false,
        code: 'DUPLICATE_CLAIM',
        student,
        duplicateLog: existingLog,
        message: `DUPLICATE CLAIM BLOCKED: ${student.name} already availed ${mealType} today at ${existingLog.time} via ${existingLog.terminalId}.`
      };
    }

    // 4. Successful Verification! Create new log entry
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const matchScore = (97 + Math.random() * 2.8).toFixed(1);

    const newLog = {
      id: `LOG-BIO-${Date.now().toString().slice(-6)}`,
      studentId: String(studentId),
      studentName: student.name,
      category: student.category,
      mealType,
      date: todayStr,
      time: timeFormatted,
      biometricStatus: `Verified · Match ${matchScore}%`,
      fingerprintId: student.fingerprintId,
      subscriptionStatus: 'Valid Yearly Subscription',
      terminalId
    };

    this.biometricLogs = [newLog, ...this.biometricLogs];
    this._save('biometric_logs', this.biometricLogs);

    // 5. Integration with Special Dishes:
    // Check if student has confirmed special dish orders for this meal today
    const pendingSpecialDishes = this.specialTransactions.filter(
      trx => trx.studentId === String(studentId) &&
             trx.mealCategory.toLowerCase() === mealType.toLowerCase() &&
             trx.scheduledServingDate === todayStr &&
             (trx.orderStatus === 'Confirmed' || trx.orderStatus === 'Prepared' || trx.orderStatus === 'Requested')
    );

    return {
      success: true,
      code: 'VERIFIED',
      student,
      log: newLog,
      subscription: sub,
      specialDishOrders: pendingSpecialDishes,
      message: `Biometric verification successful. Access granted for ${mealType}.`
    };
  }

  getBiometricLogs(filters = {}) {
    let list = [...this.biometricLogs];
    if (filters.date) {
      list = list.filter(l => l.date === filters.date);
    }
    if (filters.category && filters.category !== 'All') {
      list = list.filter(l => l.category === filters.category);
    }
    if (filters.mealType && filters.mealType !== 'All') {
      list = list.filter(l => l.mealType.toLowerCase() === filters.mealType.toLowerCase());
    }
    if (filters.query) {
      const q = filters.query.toLowerCase();
      list = list.filter(l => l.studentName.toLowerCase().includes(q) || l.studentId.includes(q));
    }
    return list;
  }

  // --- Special Dishes & Extra Curries Methods ---
  getSpecialDishes() {
    return this.specialDishes;
  }

  addSpecialDish(dishData) {
    const newDish = {
      id: `DISH-${Date.now().toString().slice(-4)}`,
      name: dishData.name,
      category: dishData.category || 'Special Curry',
      mealAvailability: dishData.mealAvailability || ['Lunch', 'Dinner'],
      price: Number(dishData.price) || 50,
      description: dishData.description || '',
      prepTime: dishData.prepTime || 'Fresh Prep',
      isAvailable: true,
      dietType: dishData.dietType || 'Vegetarian',
      orderingCutoff: dishData.orderingCutoff || '11:45 AM (Lunch) / 06:45 PM (Dinner)'
    };
    this.specialDishes = [...this.specialDishes, newDish];
    this._save('special_dishes', this.specialDishes);
    return newDish;
  }

  toggleSpecialDishAvailability(dishId) {
    this.specialDishes = this.specialDishes.map(d => {
      if (d.id === dishId) {
        return { ...d, isAvailable: !d.isAvailable };
      }
      return d;
    });
    this._save('special_dishes', this.specialDishes);
  }

  // --- Special Dish Transactions Methods ---
  getSpecialTransactions(filters = {}) {
    let list = [...this.specialTransactions];
    if (filters.studentId) {
      list = list.filter(t => t.studentId === String(filters.studentId));
    }
    if (filters.date) {
      list = list.filter(t => t.scheduledServingDate === filters.date || t.orderDate === filters.date);
    }
    if (filters.mealCategory && filters.mealCategory !== 'All') {
      list = list.filter(t => t.mealCategory.toLowerCase() === filters.mealCategory.toLowerCase());
    }
    if (filters.orderStatus && filters.orderStatus !== 'All') {
      list = list.filter(t => t.orderStatus === filters.orderStatus);
    }
    if (filters.paymentStatus && filters.paymentStatus !== 'All') {
      list = list.filter(t => t.paymentStatus === filters.paymentStatus);
    }
    if (filters.query) {
      const q = filters.query.toLowerCase();
      list = list.filter(t => t.studentName.toLowerCase().includes(q) || t.studentId.includes(q) || t.dishName.toLowerCase().includes(q));
    }
    return list;
  }

  orderSpecialDish({ studentId, dishId, mealCategory, scheduledServingDate, quantity = 1 }) {
    const student = this.getStudentById(studentId);
    const dish = this.specialDishes.find(d => d.id === dishId);

    if (!student || !dish) {
      return { success: false, message: 'Invalid student or dish item selected.' };
    }

    const price = dish.price;
    const totalCharge = price * quantity;
    const todayStr = new Date().toISOString().split('T')[0];

    const newTrx = {
      id: `TRX-SD-2026-${Date.now().toString().slice(-4)}`,
      studentId: String(studentId),
      studentName: student.name,
      dishId: dish.id,
      dishName: dish.name,
      mealCategory: mealCategory || 'Lunch',
      orderDate: todayStr,
      scheduledServingDate: scheduledServingDate || todayStr,
      quantity: Number(quantity),
      pricePerItem: price,
      totalAdditionalCharge: totalCharge,
      orderStatus: 'Confirmed', // Automatically confirmed for approved students
      paymentStatus: 'Pending',
      billedToAccount: true,
      servedTimestamp: null,
      servedByStaff: null
    };

    this.specialTransactions = [newTrx, ...this.specialTransactions];
    this._save('special_transactions', this.specialTransactions);
    return { success: true, transaction: newTrx };
  }

  updateOrderStatus(orderId, orderStatus, staffName = 'Kailash Sahoo') {
    this.specialTransactions = this.specialTransactions.map(t => {
      if (t.id === orderId) {
        const isServed = orderStatus === 'Served';
        return {
          ...t,
          orderStatus,
          servedTimestamp: isServed ? new Date().toLocaleString() : t.servedTimestamp,
          servedByStaff: isServed ? staffName : t.servedByStaff
        };
      }
      return t;
    });
    this._save('special_transactions', this.specialTransactions);
    return true;
  }

  markSpecialDishServed(orderId, staffName = 'Kailash Sahoo') {
    return this.updateOrderStatus(orderId, 'Served', staffName);
  }

  updatePaymentStatus(orderId, paymentStatus) {
    this.specialTransactions = this.specialTransactions.map(t => {
      if (t.id === orderId) {
        return { ...t, paymentStatus };
      }
      return t;
    });
    this._save('special_transactions', this.specialTransactions);
    return true;
  }

  // --- Canteen Fee & Accounting Engine ---
  getStudentFeeAccount(studentId) {
    const student = this.getStudentById(studentId);
    if (!student) return null;

    const sub = this.getSubscriptionByStudentId(studentId);
    const yearlySubscriptionFee = sub ? sub.totalAnnualFee : 0;

    // Special Dish charges
    const studentSpecialOrders = this.specialTransactions.filter(
      t => t.studentId === String(studentId) && t.orderStatus !== 'Cancelled'
    );
    const specialDishCharges = studentSpecialOrders.reduce((sum, t) => sum + (t.totalAdditionalCharge || 0), 0);

    const otherCharges = 0; // Authorized other charges if any

    // Formula from requirement:
    // Total Canteen Charges = Yearly Subscription Fees + Special-Dish Charges + Other Applicable Charges
    const totalCanteenCharges = yearlySubscriptionFee + specialDishCharges + otherCharges;

    // Payments made
    const studentPayments = this.payments.filter(p => p.studentId === String(studentId));
    const paymentsMade = studentPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Outstanding Balance = Total Canteen Charges - Payments Made
    const outstandingBalance = totalCanteenCharges - paymentsMade;

    return {
      student,
      subscription: sub,
      yearlySubscriptionFee,
      specialDishCharges,
      otherCharges,
      totalCanteenCharges,
      paymentsMade,
      outstandingBalance,
      payments: studentPayments,
      orders: studentSpecialOrders
    };
  }

  getAllStudentFeeAccounts() {
    return this.students.map(s => this.getStudentFeeAccount(s.studentId)).filter(Boolean);
  }

  recordPayment({ studentId, amount, paymentMode = 'UPI (GPay)', referenceNo = '', description = 'Canteen Account Payment' }) {
    const student = this.getStudentById(studentId);
    if (!student) return { success: false, message: 'Student not found' };

    const newPay = {
      id: `PAY-CAN-${Date.now().toString().slice(-6)}`,
      studentId: String(studentId),
      studentName: student.name,
      amount: Number(amount),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode,
      referenceNo: referenceNo || `TXN-REF-${Math.floor(100000 + Math.random() * 900000)}`,
      description,
      receiptNo: `RCPT-CAN-2026-${Date.now().toString().slice(-4)}`
    };

    this.payments = [newPay, ...this.payments];

    // If payment covers pending special dishes, mark them as Paid
    let remainingPaid = Number(amount);
    this.specialTransactions = this.specialTransactions.map(t => {
      if (t.studentId === String(studentId) && t.paymentStatus === 'Pending') {
        if (remainingPaid >= t.totalAdditionalCharge) {
          remainingPaid -= t.totalAdditionalCharge;
          return { ...t, paymentStatus: 'Paid' };
        }
      }
      return t;
    });

    this._save('payments', this.payments);
    this._save('special_transactions', this.specialTransactions);
    return { success: true, payment: newPay };
  }

  // --- Summary Counts for Dashboard ---
  getTodaySummaryCounts(selectedDate = '2026-10-27') {
    const dateLogs = this.biometricLogs.filter(l => l.date === selectedDate);

    const breakfastLogs = dateLogs.filter(l => l.mealType.toLowerCase() === 'breakfast');
    const lunchLogs = dateLogs.filter(l => l.mealType.toLowerCase() === 'lunch');
    const dinnerLogs = dateLogs.filter(l => l.mealType.toLowerCase() === 'dinner');

    return {
      selectedDate,
      totalServedToday: dateLogs.length,
      breakfast: {
        total: breakfastLogs.length,
        dayScholars: breakfastLogs.filter(l => l.category === 'Day Scholar').length,
        hostellers: breakfastLogs.filter(l => l.category === 'Hosteller').length,
        logs: breakfastLogs
      },
      lunch: {
        total: lunchLogs.length,
        dayScholars: lunchLogs.filter(l => l.category === 'Day Scholar').length,
        hostellers: lunchLogs.filter(l => l.category === 'Hosteller').length,
        logs: lunchLogs
      },
      dinner: {
        total: dinnerLogs.length,
        dayScholars: dinnerLogs.filter(l => l.category === 'Day Scholar').length,
        hostellers: dinnerLogs.filter(l => l.category === 'Hosteller').length,
        logs: dinnerLogs
      },
      pendingApplications: this.applications.filter(a => a.status === 'Pending').length,
      activeSubscriptions: this.subscriptions.filter(s => s.status === 'Active').length,
      todaySpecialDishOrders: this.specialTransactions.filter(t => t.scheduledServingDate === selectedDate).length
    };
  }
}

export const canteenStore = new CanteenStore();
