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


// ============================================================================
// APNA CAMPUS ENTERPRISE CANTEEN ERP EXTENSIONS (14 DEDICATED SECTIONS)
// ============================================================================

export const initialEnterpriseHostellers = [
  {
    id: 'hostel-std-01',
    studentId: '2401432265',
    rollNumber: '24CSE014',
    registrationNumber: 'REG-2024-CSE-014',
    name: 'Bishnu Prasad Sahoo',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science & Engineering (AI)',
    academicYear: '2026-27',
    semester: 'Semester 3',
    hostelName: 'Sarojini Girls Residence',
    hostelBlock: 'Block-A',
    roomNumber: '304',
    hostelWarden: 'Mrs. Nibedita Das (+91 94370 33445)',
    parentContact: '+91 94371 99012 (Mr. Sahoo)',
    studentContact: '+91 77498 44291',
    hostelAdmissionDate: '2024-08-01',
    hostelStatus: 'Active',
    mealPlan: 'Full Board (4 Meals)',
    biometricId: 'BIO-FP-19181',
    mealSubscriptionStatus: 'Active',
    hostelFee: {
      totalHostelFee: 48000,
      paidAmount: 48000,
      pendingAmount: 0,
      paymentStatus: 'Paid',
      lastPaymentDate: '2026-07-15',
      nextDueDate: '2027-01-10',
      receiptNo: 'REC-HST-2026-8812'
    },
    messFee: {
      totalMessFee: 24000,
      paidAmount: 24000,
      pendingAmount: 0,
      paymentStatus: 'Paid',
      lastPaymentDate: '2026-07-15',
      nextDueDate: '2027-01-10',
      receiptNo: 'REC-MSS-2026-1049'
    }
  },
  {
    id: 'hostel-std-02',
    studentId: '2305201001',
    rollNumber: '01',
    registrationNumber: 'REG-2023-MECH-001',
    name: 'Rakesh Das',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Mechanical Engineering',
    academicYear: '2026-27',
    semester: 'Semester 5',
    hostelName: 'CV Raman Boys Hall of Residence',
    hostelBlock: 'Block-B',
    roomNumber: '112',
    hostelWarden: 'Prof. S. K. Patnaik (+91 98610 22345)',
    parentContact: '+91 98612 11099 (Mr. Das)',
    studentContact: '+91 98612 44310',
    hostelAdmissionDate: '2023-08-10',
    hostelStatus: 'Active',
    mealPlan: 'Full Board (4 Meals)',
    biometricId: 'BIO-FP-18450',
    mealSubscriptionStatus: 'Active',
    hostelFee: {
      totalHostelFee: 48000,
      paidAmount: 28000,
      pendingAmount: 20000,
      paymentStatus: 'Partial',
      lastPaymentDate: '2026-08-02',
      nextDueDate: '2026-11-15',
      receiptNo: 'REC-HST-2026-7201'
    },
    messFee: {
      totalMessFee: 24000,
      paidAmount: 24000,
      pendingAmount: 0,
      paymentStatus: 'Paid',
      lastPaymentDate: '2026-08-02',
      nextDueDate: '2027-01-10',
      receiptNo: 'REC-MSS-2026-0922'
    }
  },
  {
    id: 'hostel-std-03',
    studentId: '2301289140',
    rollNumber: '23CSE089',
    registrationNumber: 'REG-2023-CSE-089',
    name: 'Subhashree Mohapatra',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science & Engineering',
    academicYear: '2026-27',
    semester: 'Semester 5',
    hostelName: 'Gargi Girls Residence',
    hostelBlock: 'Block-C',
    roomNumber: '208',
    hostelWarden: 'Dr. Sunita Ray (+91 94371 44556)',
    parentContact: '+91 94372 77112 (Mr. Mohapatra)',
    studentContact: '+91 94370 12891',
    hostelAdmissionDate: '2023-08-12',
    hostelStatus: 'Active',
    mealPlan: 'Standard (3 Meals)',
    biometricId: 'BIO-FP-17892',
    mealSubscriptionStatus: 'Active',
    hostelFee: {
      totalHostelFee: 48000,
      paidAmount: 48000,
      pendingAmount: 0,
      paymentStatus: 'Paid',
      lastPaymentDate: '2026-07-20',
      nextDueDate: '2027-01-10',
      receiptNo: 'REC-HST-2026-9044'
    },
    messFee: {
      totalMessFee: 20000,
      paidAmount: 10000,
      pendingAmount: 10000,
      paymentStatus: 'Partial',
      lastPaymentDate: '2026-07-20',
      nextDueDate: '2026-11-20',
      receiptNo: 'REC-MSS-2026-1150'
    }
  },
  {
    id: 'hostel-std-04',
    studentId: '2201405099',
    rollNumber: '22EE045',
    registrationNumber: 'REG-2022-EE-045',
    name: 'Rahul Verma',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    department: 'Electrical Engineering',
    academicYear: '2026-27',
    semester: 'Semester 7',
    hostelName: 'CV Raman Boys Hall of Residence',
    hostelBlock: 'Block-A',
    roomNumber: '402',
    hostelWarden: 'Prof. S. K. Patnaik (+91 98610 22345)',
    parentContact: '+91 99370 55123 (Mr. Verma)',
    studentContact: '+91 99371 40509',
    hostelAdmissionDate: '2022-08-05',
    hostelStatus: 'Active',
    mealPlan: 'Full Board (4 Meals)',
    biometricId: 'BIO-FP-16509',
    mealSubscriptionStatus: 'Active',
    hostelFee: {
      totalHostelFee: 48000,
      paidAmount: 0,
      pendingAmount: 48000,
      paymentStatus: 'Overdue',
      lastPaymentDate: '2026-01-15',
      nextDueDate: '2026-08-10',
      receiptNo: 'REC-HST-2025-4410'
    },
    messFee: {
      totalMessFee: 24000,
      paidAmount: 12000,
      pendingAmount: 12000,
      paymentStatus: 'Partial',
      lastPaymentDate: '2026-08-05',
      nextDueDate: '2026-11-10',
      receiptNo: 'REC-MSS-2026-2001'
    }
  },
  {
    id: 'hostel-std-05',
    studentId: '2401432299',
    rollNumber: '24ECE022',
    registrationNumber: 'REG-2024-ECE-022',
    name: 'Sneha Patel',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    department: 'Electronics & Communication',
    academicYear: '2026-27',
    semester: 'Semester 3',
    hostelName: 'Sarojini Girls Residence',
    hostelBlock: 'Block-B',
    roomNumber: '215',
    hostelWarden: 'Mrs. Nibedita Das (+91 94370 33445)',
    parentContact: '+91 98250 88219 (Mr. Patel)',
    studentContact: '+91 98251 43229',
    hostelAdmissionDate: '2024-08-03',
    hostelStatus: 'Active',
    mealPlan: 'Full Board (4 Meals)',
    biometricId: 'BIO-FP-19299',
    mealSubscriptionStatus: 'Active',
    hostelFee: {
      totalHostelFee: 48000,
      paidAmount: 48000,
      pendingAmount: 0,
      paymentStatus: 'Paid',
      lastPaymentDate: '2026-07-25',
      nextDueDate: '2027-01-10',
      receiptNo: 'REC-HST-2026-9520'
    },
    messFee: {
      totalMessFee: 24000,
      paidAmount: 24000,
      pendingAmount: 0,
      paymentStatus: 'Paid',
      lastPaymentDate: '2026-07-25',
      nextDueDate: '2027-01-10',
      receiptNo: 'REC-MSS-2026-1502'
    }
  },
  {
    id: 'hostel-std-06',
    studentId: '2301552104',
    rollNumber: '23CIV012',
    registrationNumber: 'REG-2023-CIV-012',
    name: 'Deepak Jena',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    department: 'Civil Engineering',
    academicYear: '2026-27',
    semester: 'Semester 5',
    hostelName: 'Kalam Hall of Residence',
    hostelBlock: 'Block-D',
    roomNumber: '108',
    hostelWarden: 'Dr. B. K. Mohanty (+91 94373 88123)',
    parentContact: '+91 94374 55670 (Mr. Jena)',
    studentContact: '+91 94375 52104',
    hostelAdmissionDate: '2023-08-11',
    hostelStatus: 'Active',
    mealPlan: 'Standard (3 Meals)',
    biometricId: 'BIO-FP-18104',
    mealSubscriptionStatus: 'Active',
    hostelFee: {
      totalHostelFee: 48000,
      paidAmount: 48000,
      pendingAmount: 0,
      paymentStatus: 'Paid',
      lastPaymentDate: '2026-07-18',
      nextDueDate: '2027-01-10',
      receiptNo: 'REC-HST-2026-8902'
    },
    messFee: {
      totalMessFee: 20000,
      paidAmount: 20000,
      pendingAmount: 0,
      paymentStatus: 'Paid',
      lastPaymentDate: '2026-07-18',
      nextDueDate: '2027-01-10',
      receiptNo: 'REC-MSS-2026-1280'
    }
  }
];

export const initialBiometricDevices = [
  {
    id: 'dev-01',
    deviceId: 'BIO-DEV-MESS-01',
    deviceName: 'MorphoWave Fingerprint Terminal 1',
    terminalName: 'Mess Counter 1 (Main Entrance)',
    location: 'Central Dining Hall, Ground Floor',
    ipAddress: '192.168.10.101',
    macAddress: '00:1A:2B:3C:4D:01',
    firmwareVersion: 'v4.18.2-PROD',
    status: 'Online',
    lastHeartbeat: new Date().toISOString(),
    totalScansToday: 428
  },
  {
    id: 'dev-02',
    deviceId: 'BIO-DEV-MESS-02',
    deviceName: 'MorphoWave Fingerprint Terminal 2',
    terminalName: 'Mess Counter 2 (North Hall)',
    location: 'Central Dining Hall, North Gate',
    ipAddress: '192.168.10.102',
    macAddress: '00:1A:2B:3C:4D:02',
    firmwareVersion: 'v4.18.2-PROD',
    status: 'Online',
    lastHeartbeat: new Date().toISOString(),
    totalScansToday: 382
  },
  {
    id: 'dev-03',
    deviceId: 'BIO-DEV-MESS-03',
    deviceName: 'SecuGen Hamster Plus Terminal 3',
    terminalName: 'Mess Counter 3 (South Hall)',
    location: 'Central Dining Hall, South Gate',
    ipAddress: '192.168.10.103',
    macAddress: '00:1A:2B:3C:4D:03',
    firmwareVersion: 'v3.90.1-PROD',
    status: 'Online',
    lastHeartbeat: new Date().toISOString(),
    totalScansToday: 310
  },
  {
    id: 'dev-04',
    deviceId: 'BIO-DEV-MESS-04',
    deviceName: 'Anviz Biometric Terminal 4',
    terminalName: 'Girls Mess Dedicated Counter',
    location: 'Sarojini Residence Dining Bay',
    ipAddress: '192.168.10.104',
    macAddress: '00:1A:2B:3C:4D:04',
    firmwareVersion: 'v4.02.0-PROD',
    status: 'Online',
    lastHeartbeat: new Date().toISOString(),
    totalScansToday: 265
  },
  {
    id: 'dev-05',
    deviceId: 'BIO-DEV-MESS-05',
    deviceName: 'RFID Smart Card + Biometric Hybrid',
    terminalName: 'Special Curries & Diet Counter',
    location: 'Central Canteen A-La-Carte Bay',
    ipAddress: '192.168.10.105',
    macAddress: '00:1A:2B:3C:4D:05',
    firmwareVersion: 'v5.10.4-PROD',
    status: 'Online',
    lastHeartbeat: new Date().toISOString(),
    totalScansToday: 198
  },
  {
    id: 'dev-06',
    deviceId: 'BIO-DEV-MESS-06',
    deviceName: 'Handheld Mobile Terminal 6',
    terminalName: 'Hostel Night Inspection & Backup Scanner',
    location: 'Roaming / Mobile Canteen',
    ipAddress: '192.168.10.106',
    macAddress: '00:1A:2B:3C:4D:06',
    firmwareVersion: 'v2.80.0-PROD',
    status: 'Online',
    lastHeartbeat: new Date().toISOString(),
    totalScansToday: 74
  }
];

export const initialKitchenInventory = [
  {
    id: 'inv-01',
    itemCode: 'RAW-GRAIN-001',
    name: 'Basmati & Sona Masoori Rice',
    category: 'Grains & Pulses',
    unit: 'kg',
    openingStock: 1200,
    purchasedQuantity: 600,
    usedQuantity: 340,
    remainingStock: 1460,
    wastage: 5,
    closingStock: 1455,
    standardPerStudentGrams: 120,
    minThreshold: 400,
    costPerUnit: 52,
    lastUpdated: '2026-11-03'
  },
  {
    id: 'inv-02',
    itemCode: 'RAW-GRAIN-002',
    name: 'Toor & Moong Dal Pulses',
    category: 'Grains & Pulses',
    unit: 'kg',
    openingStock: 450,
    purchasedQuantity: 200,
    usedQuantity: 110,
    remainingStock: 540,
    wastage: 2,
    closingStock: 538,
    standardPerStudentGrams: 60,
    minThreshold: 150,
    costPerUnit: 125,
    lastUpdated: '2026-11-03'
  },
  {
    id: 'inv-03',
    itemCode: 'RAW-VEG-003',
    name: 'Fresh Mixed Vegetables & Potatoes',
    category: 'Vegetables & Greens',
    unit: 'kg',
    openingStock: 350,
    purchasedQuantity: 400,
    usedQuantity: 280,
    remainingStock: 470,
    wastage: 12,
    closingStock: 458,
    standardPerStudentGrams: 150,
    minThreshold: 100,
    costPerUnit: 35,
    lastUpdated: '2026-11-03'
  },
  {
    id: 'inv-04',
    itemCode: 'RAW-OIL-004',
    name: 'Refined Mustard & Sunflower Cooking Oil',
    category: 'Cooking Oils',
    unit: 'liters',
    openingStock: 220,
    purchasedQuantity: 150,
    usedQuantity: 65,
    remainingStock: 305,
    wastage: 1,
    closingStock: 304,
    standardPerStudentGrams: 25,
    minThreshold: 80,
    costPerUnit: 138,
    lastUpdated: '2026-11-03'
  },
  {
    id: 'inv-05',
    itemCode: 'RAW-DAIRY-005',
    name: 'Pasteurized Full Cream Dairy Milk',
    category: 'Dairy',
    unit: 'liters',
    openingStock: 300,
    purchasedQuantity: 350,
    usedQuantity: 290,
    remainingStock: 360,
    wastage: 4,
    closingStock: 356,
    standardPerStudentGrams: 200,
    minThreshold: 100,
    costPerUnit: 64,
    lastUpdated: '2026-11-03'
  },
  {
    id: 'inv-06',
    itemCode: 'RAW-FRUIT-006',
    name: 'Seasonal Bananas & Apples',
    category: 'Fruits & Beverages',
    unit: 'units',
    openingStock: 600,
    purchasedQuantity: 500,
    usedQuantity: 480,
    remainingStock: 620,
    wastage: 15,
    closingStock: 605,
    standardPerStudentGrams: 1,
    minThreshold: 200,
    costPerUnit: 8,
    lastUpdated: '2026-11-03'
  },
  {
    id: 'inv-07',
    itemCode: 'RAW-SPICE-007',
    name: 'Assorted Spices, Turmeric, Cumin & Garam Masala',
    category: 'Spices',
    unit: 'kg',
    openingStock: 85,
    purchasedQuantity: 50,
    usedQuantity: 18,
    remainingStock: 117,
    wastage: 0.5,
    closingStock: 116.5,
    standardPerStudentGrams: 10,
    minThreshold: 25,
    costPerUnit: 320,
    lastUpdated: '2026-11-03'
  }
];

export const initialCanteenSettings = {
  institutionName: 'Apna Campus Group of Institutions',
  canteenName: 'Central Canteen & Mess Directorate',
  serviceWindows: {
    Breakfast: { start: '07:30', end: '10:00' },
    Lunch: { start: '12:00', end: '14:30' },
    'Evening Snacks': { start: '17:00', end: '18:30' },
    Dinner: { start: '19:30', end: '22:00' }
  },
  standardPortionsGrams: {
    Rice: 120,
    Dal: 60,
    Vegetables: 150,
    Oil: 25,
    Milk: 200
  },
  rbacPermissions: {
    super_admin: {
      canViewAllOperations: true,
      canViewAllHostellers: true,
      canViewHostelFeeStatus: true,
      canManageInventory: true,
      canExportReports: true,
      canManageSettings: true
    },
    admin: {
      canViewAllOperations: true,
      canViewAllHostellers: true,
      canViewHostelFeeStatus: true,
      canManageInventory: false,
      canExportReports: true,
      canManageSettings: false
    },
    canteen: {
      canViewAllOperations: true,
      canViewAllHostellers: true,
      canViewHostelFeeStatus: false, // Restricted
      canManageInventory: true,
      canExportReports: true,
      canManageSettings: false
    },
    accounts: {
      canViewAllOperations: true,
      canViewAllHostellers: true,
      canViewHostelFeeStatus: true,
      canManageInventory: false,
      canExportReports: true,
      canManageSettings: false
    }
  }
};

class CanteenStore {
  constructor() {
    this.students = this._load('students', initialCanteenStudents);
    this.applications = this._load('applications', initialFoodApplications);
    this.subscriptions = this._load('subscriptions', initialYearlySubscriptions);
    this.biometricLogs = this._load('biometric_logs', initialBiometricMealLogs);
    this.specialDishes = this._load('special_dishes', initialSpecialDishes);
    this.specialTransactions = this._load('special_transactions', initialSpecialDishTransactions);
    
    this.payments = this._load('payments', initialCanteenPayments);
    this.hostellers = this._load('hostellers', initialEnterpriseHostellers);
    this.biometricDevices = this._load('biometric_devices', initialBiometricDevices);
    this.inventoryItems = this._load('inventory_items', initialKitchenInventory);
    this.inventoryTransactions = this._load('inventory_transactions', []);
    this.consumptionRecords = this._load('consumption_records', []);
    this.settings = this._load('settings', initialCanteenSettings);
    this.auditLogs = this._load('audit_logs', []);
    this.attendanceRecords = this._load('attendance_records', []);
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

  // ==========================================
  // ENTERPRISE HOSTELLER MANAGEMENT
  // ==========================================
  getHostellers(filters = {}, userRole = 'canteen') {
    let list = [...this.hostellers];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(h =>
        h.name.toLowerCase().includes(q) ||
        h.rollNumber.toLowerCase().includes(q) ||
        h.registrationNumber.toLowerCase().includes(q) ||
        h.studentId.includes(q) ||
        h.roomNumber.toLowerCase().includes(q)
      );
    }

    if (filters.status && filters.status !== 'All') {
      list = list.filter(h => h.hostelStatus.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.hostel && filters.hostel !== 'All') {
      list = list.filter(h => h.hostelName === filters.hostel);
    }

    if (filters.room && filters.room !== 'All') {
      list = list.filter(h => h.roomNumber === filters.room);
    }

    if (filters.branch && filters.branch !== 'All') {
      list = list.filter(h => h.department.toLowerCase().includes(filters.branch.toLowerCase()));
    }

    if (filters.academicYear && filters.academicYear !== 'All') {
      list = list.filter(h => h.academicYear === filters.academicYear);
    }

    if (filters.feeStatus && filters.feeStatus !== 'All') {
      list = list.filter(h => h.hostelFee.paymentStatus.toLowerCase() === filters.feeStatus.toLowerCase());
    }

    // Role-based financial privacy filtering
    const isFullFinancialRole = ['super_admin', 'admin', 'accounts'].includes(userRole.toLowerCase());

    return list.map(h => {
      if (isFullFinancialRole) {
        return h;
      }
      return {
        ...h,
        hostelFee: {
          totalHostelFee: -1,
          paidAmount: -1,
          pendingAmount: -1,
          paymentStatus: 'Restricted (Hostel/Accounts Only)',
          lastPaymentDate: 'N/A',
          nextDueDate: 'N/A',
          receiptNo: 'RESTRICTED'
        }
      };
    });
  }

  getHostellerById(studentId, userRole = 'canteen') {
    const student = this.hostellers.find(h => h.studentId === String(studentId) || h.rollNumber === String(studentId));
    if (!student) return null;

    const isFullFinancialRole = ['super_admin', 'admin', 'accounts'].includes(userRole.toLowerCase());
    if (isFullFinancialRole) {
      return student;
    }

    return {
      ...student,
      hostelFee: {
        totalHostelFee: -1,
        paidAmount: -1,
        pendingAmount: -1,
        paymentStatus: 'Restricted (Hostel/Accounts Only)',
        lastPaymentDate: 'N/A',
        nextDueDate: 'N/A',
        receiptNo: 'RESTRICTED'
      }
    };
  }

  getHostelFeeStatus(filters = {}, userRole = 'canteen') {
    const isFullFinancialRole = ['super_admin', 'admin', 'accounts'].includes(userRole.toLowerCase());
    if (!isFullFinancialRole) {
      return {
        success: false,
        message: 'Access restricted. Hostel accommodation accounts are reserved for Admin, Super Admin and Accounts.'
      };
    }

    let list = [...this.hostellers];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(h => h.name.toLowerCase().includes(q) || h.studentId.includes(q) || h.rollNumber.toLowerCase().includes(q));
    }
    if (filters.status && filters.status !== 'All') {
      list = list.filter(h => h.hostelFee.paymentStatus.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.hostel && filters.hostel !== 'All') {
      list = list.filter(h => h.hostelName === filters.hostel);
    }

    const summary = {
      totalAccommodationBilled: list.reduce((acc, h) => acc + h.hostelFee.totalHostelFee, 0),
      totalAccommodationCollected: list.reduce((acc, h) => acc + h.hostelFee.paidAmount, 0),
      totalAccommodationPending: list.reduce((acc, h) => acc + h.hostelFee.pendingAmount, 0),
      fullyPaidCount: list.filter(h => h.hostelFee.paymentStatus === 'Paid').length,
      partialCount: list.filter(h => h.hostelFee.paymentStatus === 'Partial').length,
      unpaidCount: list.filter(h => h.hostelFee.paymentStatus === 'Unpaid').length,
      overdueCount: list.filter(h => h.hostelFee.paymentStatus === 'Overdue').length
    };

    return {
      success: true,
      summary,
      count: list.length,
      data: list.map(h => ({
        studentId: h.studentId,
        rollNumber: h.rollNumber,
        name: h.name,
        hostelName: h.hostelName,
        roomNumber: h.roomNumber,
        hostelFee: h.hostelFee
      }))
    };
  }

  // ==========================================
  // BIOMETRIC MANAGEMENT
  // ==========================================
  getBiometricStudents(query = '') {
    let list = this.hostellers.map(h => ({
      id: `map-${h.studentId}`,
      biometricId: h.biometricId,
      studentId: h.studentId,
      registrationNumber: h.registrationNumber,
      studentName: h.name,
      photo: h.photo,
      hostelName: h.hostelName,
      roomNumber: h.roomNumber,
      deviceId: 'BIO-DEV-MESS-01',
      registrationStatus: 'Active',
      lastVerification: '2026-11-03 13:15:20',
      lastTerminal: 'Mess Counter 1 (Main Entrance)',
      deviceConnectionStatus: 'Online',
      registeredAt: h.hostelAdmissionDate
    }));

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(m =>
        m.studentName.toLowerCase().includes(q) ||
        m.biometricId.toLowerCase().includes(q) ||
        m.studentId.includes(q) ||
        m.hostelName.toLowerCase().includes(q)
      );
    }
    return list;
  }

  registerBiometric({ studentId, biometricId, deviceId }, actorName = 'Canteen Supervisor') {
    const student = this.hostellers.find(h => h.studentId === String(studentId));
    if (!student) {
      return { success: false, message: `Student ${studentId} not found in central hostel database.` };
    }

    // Check duplicate biometric mapping
    const existing = this.hostellers.find(h => h.biometricId === biometricId && h.studentId !== String(studentId));
    if (existing) {
      return {
        success: false,
        message: `Biometric ID ${biometricId} is already mapped to ${existing.name} (${existing.studentId}). Duplicate biometric mappings are strictly prohibited.`
      };
    }

    student.biometricId = biometricId;
    this.hostellers = this.hostellers.map(h => h.studentId === student.studentId ? student : h);
    this._save('hostellers', this.hostellers);

    this.logAudit({
      actor: actorName,
      actorRole: 'supervisor',
      action: 'BIOMETRIC_REGISTERED',
      target: student.studentId,
      details: `Registered Biometric ID ${biometricId} on terminal ${deviceId} for ${student.name}`
    });

    return {
      success: true,
      message: `Biometric ID ${biometricId} successfully linked to ${student.name}!`,
      student
    };
  }

  toggleBiometricStatus(studentId, status = 'Active', actorName = 'Supervisor') {
    const student = this.hostellers.find(h => h.studentId === String(studentId));
    if (!student) return { success: false, message: 'Student not found' };

    student.mealSubscriptionStatus = status === 'Active' ? 'Active' : 'Suspended';
    this.hostellers = this.hostellers.map(h => h.studentId === student.studentId ? student : h);
    this._save('hostellers', this.hostellers);

    this.logAudit({
      actor: actorName,
      actorRole: 'supervisor',
      action: 'BIOMETRIC_STATUS_CHANGED',
      target: studentId,
      details: `Changed biometric meal status to ${status}`
    });

    return { success: true, message: `Biometric meal access marked as ${status}.` };
  }

  getBiometricDevices() {
    return this.biometricDevices;
  }

  triggerDeviceSync(deviceId) {
    const dev = this.biometricDevices.find(d => d.deviceId === deviceId);
    if (!dev) return { success: false, message: 'Device not found' };

    dev.lastHeartbeat = new Date().toISOString();
    dev.status = 'Online';
    this.biometricDevices = this.biometricDevices.map(d => d.deviceId === deviceId ? dev : d);
    this._save('biometric_devices', this.biometricDevices);

    return { success: true, message: `Terminal ${dev.terminalName} successfully synchronized! All biometric records current.`, device: dev };
  }

  runDeviceDiagnostic(deviceId) {
    const dev = this.biometricDevices.find(d => d.deviceId === deviceId);
    if (!dev) return { success: false, message: 'Device not found' };

    return {
      success: true,
      deviceId: dev.deviceId,
      terminalName: dev.terminalName,
      status: 'Operational',
      firmware: dev.firmwareVersion,
      opticalSensorStatus: 'Calibrated (100% Quality)',
      networkLatency: '14ms',
      packetsSynced: dev.totalScansToday
    };
  }

  // ==========================================
  // MEAL ATTENDANCE & SERVICE WINDOW LOGIC
  // ==========================================
  isMealWindowClosed(mealType, dateStr) {
    const today = new Date().toISOString().split('T')[0];
    if (dateStr && dateStr < today) return true;
    if (dateStr && dateStr > today) return false;

    const now = new Date();
    const timeInMins = now.getHours() * 60 + now.getMinutes();

    switch (mealType) {
      case 'Breakfast':
        return timeInMins >= 10 * 60; // After 10:00 AM
      case 'Lunch':
        return timeInMins >= 14 * 60 + 30; // After 02:30 PM
      case 'Evening Snacks':
        return timeInMins >= 18 * 60 + 30; // After 06:30 PM
      case 'Dinner':
        return timeInMins >= 22 * 60; // After 10:00 PM
      default:
        return false;
    }
  }

  resolveStudentMealStatus(studentId, mealType, dateStr) {
    const match = this.attendanceRecords.find(
      r => r.studentId === String(studentId) && r.mealType === mealType && r.mealDate === dateStr
    );
    if (match) {
      return match.attendanceStatus;
    }

    const isClosed = this.isMealWindowClosed(mealType, dateStr);
    return isClosed ? 'Absent' : 'Not Yet Served';
  }

  verifyEnterpriseMealAccess({ studentId, biometricId, mealType = 'Lunch', terminalId = 'BIO-DEV-MESS-01', isManual = false, manualReason = '' }, actorName = 'Mess Counter') {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0];

    let student = null;
    if (studentId) {
      student = this.hostellers.find(h => h.studentId === String(studentId) || h.rollNumber === String(studentId));
    } else if (biometricId) {
      student = this.hostellers.find(h => h.biometricId === biometricId);
    }

    if (!student) {
      this.logAudit({
        actor: actorName,
        actorRole: isManual ? 'supervisor' : 'device',
        action: 'VERIFICATION_FAILED',
        target: studentId || biometricId || 'Unknown',
        details: 'Student or Biometric ID not registered in central database'
      });
      return {
        success: false,
        code: 'NOT_FOUND',
        message: 'Biometric or Student Reference not found in Central Institutional Register.'
      };
    }

    // Check active subscription
    if (student.hostelStatus !== 'Active' || student.mealSubscriptionStatus !== 'Active') {
      return {
        success: false,
        code: 'INACTIVE_SUBSCRIPTION',
        message: `Meal Access Denied: ${student.name}'s meal subscription status is ${student.mealSubscriptionStatus}. Please clear pending mess dues.`,
        student
      };
    }

    // Duplicate check
    const existing = this.attendanceRecords.find(
      r => r.studentId === student.studentId && r.mealType === mealType && r.mealDate === today && (r.attendanceStatus === 'Present' || r.attendanceStatus === 'Manual Verification')
    );

    if (existing) {
      return {
        success: false,
        code: 'DUPLICATE_CLAIM',
        message: `Duplicate Meal Claim Blocked: ${student.name} already claimed ${mealType} today at ${existing.verificationTime} on ${existing.terminalId}.`,
        student,
        attendance: existing
      };
    }

    // Record verified attendance
    const recordId = `att-${today}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newRecord = {
      id: recordId,
      studentId: student.studentId,
      studentName: student.name,
      registrationNumber: student.registrationNumber,
      hostel: student.hostelName,
      roomNumber: student.roomNumber,
      mealType,
      mealDate: today,
      verificationTime: nowTime,
      biometricId: student.biometricId,
      attendanceStatus: isManual ? 'Manual Verification' : 'Present',
      verificationMethod: isManual ? 'Supervisor Manual Override' : 'Biometric Fingerprint',
      terminalId,
      manualReason: isManual ? manualReason : undefined,
      authorizedBy: actorName,
      createdAt: new Date().toISOString()
    };

    this.attendanceRecords = [newRecord, ...this.attendanceRecords];
    this._save('attendance_records', this.attendanceRecords);

    // Update terminal scans count
    const dev = this.biometricDevices.find(d => d.deviceId === terminalId);
    if (dev) {
      dev.totalScansToday += 1;
      dev.lastHeartbeat = new Date().toISOString();
      this.biometricDevices = this.biometricDevices.map(d => d.deviceId === terminalId ? dev : d);
      this._save('biometric_devices', this.biometricDevices);
    }

    this.logAudit({
      actor: actorName,
      actorRole: isManual ? 'supervisor' : 'device',
      action: 'MEAL_VERIFIED',
      target: student.studentId,
      details: `${student.name} verified for ${mealType} via ${newRecord.verificationMethod}`
    });

    return {
      success: true,
      code: 'VERIFIED',
      message: `Identity Confirmed: ${student.name} granted access for ${mealType}!`,
      student,
      attendance: newRecord
    };
  }

  getMealAttendance(filters = {}) {
    const today = new Date().toISOString().split('T')[0];
    const targetDate = filters.date || today;

    let records = this.attendanceRecords.filter(r => r.mealDate === targetDate);

    if (filters.mealType && filters.mealType !== 'All') {
      records = records.filter(r => r.mealType === filters.mealType);
    }

    if (filters.hostel && filters.hostel !== 'All') {
      records = records.filter(r => r.hostel === filters.hostel);
    }

    if (filters.status && filters.status !== 'All') {
      records = records.filter(r => r.attendanceStatus === filters.status);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      records = records.filter(r =>
        r.studentName.toLowerCase().includes(q) ||
        r.studentId.includes(q) ||
        r.registrationNumber.toLowerCase().includes(q) ||
        r.roomNumber.toLowerCase().includes(q)
      );
    }

    return records;
  }

  getEnterpriseDailyMealSummary(dateStr) {
    const today = new Date().toISOString().split('T')[0];
    const date = dateStr || today;

    const hostellers = this.hostellers.filter(h => h.hostelStatus === 'Active');
    const totalActiveHostellers = hostellers.length;
    const totalEligibleStudents = hostellers.filter(h => h.mealSubscriptionStatus === 'Active').length;

    const meals = ['Breakfast', 'Lunch', 'Evening Snacks', 'Dinner'];

    const summary = {
      date,
      totalActiveHostellers,
      totalEligibleStudents,
      breakfast: { present: 0, absent: 0, notYetServed: 0, excused: 0 },
      lunch: { present: 0, absent: 0, notYetServed: 0, excused: 0 },
      snacks: { present: 0, absent: 0, notYetServed: 0, excused: 0 },
      dinner: { present: 0, absent: 0, notYetServed: 0, excused: 0 },
      totalMealsServed: 0,
      totalAbsentRecords: 0,
      hostelBreakdown: {}
    };

    hostellers.forEach(h => {
      if (!summary.hostelBreakdown[h.hostelName]) {
        summary.hostelBreakdown[h.hostelName] = { present: 0, absent: 0, notYetServed: 0, total: 0 };
      }
      summary.hostelBreakdown[h.hostelName].total += 1;
    });

    meals.forEach(m => {
      const key = m === 'Breakfast' ? 'breakfast' : m === 'Lunch' ? 'lunch' : m === 'Evening Snacks' ? 'snacks' : 'dinner';

      hostellers.forEach(h => {
        const status = this.resolveStudentMealStatus(h.studentId, m, date);
        if (status === 'Present' || status === 'Manual Verification') {
          summary[key].present += 1;
          summary.totalMealsServed += 1;
          if (summary.hostelBreakdown[h.hostelName]) {
            summary.hostelBreakdown[h.hostelName].present += 1;
          }
        } else if (status === 'Absent') {
          summary[key].absent += 1;
          summary.totalAbsentRecords += 1;
          if (summary.hostelBreakdown[h.hostelName]) {
            summary.hostelBreakdown[h.hostelName].absent += 1;
          }
        } else if (status === 'Excused') {
          summary[key].excused += 1;
        } else {
          // Not Yet Served
          summary[key].notYetServed += 1;
          if (summary.hostelBreakdown[h.hostelName]) {
            summary.hostelBreakdown[h.hostelName].notYetServed += 1;
          }
        }
      });
    });

    return summary;
  }

  getAbsentStudents(filters = {}) {
    const today = new Date().toISOString().split('T')[0];
    const date = filters.date || today;
    const mealType = filters.mealType || 'Breakfast';

    const isClosed = this.isMealWindowClosed(mealType, date);

    const absentees = this.hostellers
      .filter(h => h.hostelStatus === 'Active' && h.mealSubscriptionStatus === 'Active')
      .filter(h => {
        if (filters.hostel && filters.hostel !== 'All' && h.hostelName !== filters.hostel) {
          return false;
        }
        const status = this.resolveStudentMealStatus(h.studentId, mealType, date);
        return status === 'Absent';
      })
      .map(h => ({
        studentId: h.studentId,
        rollNumber: h.rollNumber,
        name: h.name,
        photo: h.photo,
        hostelName: h.hostelName,
        roomNumber: h.roomNumber,
        mealType,
        mealDate: date,
        parentContact: h.parentContact,
        studentContact: h.studentContact,
        status: 'Absent (Service Window Closed)'
      }));

    return {
      date,
      mealType,
      isServiceWindowClosed: isClosed,
      count: absentees.length,
      data: absentees,
      notice: isClosed
        ? 'Service window has ended. Absences are officially confirmed.'
        : 'Service window is still ACTIVE. Unserved students are pending, not yet marked absent.'
    };
  }

  // ==========================================
  // FOOD CONSUMPTION & KITCHEN INVENTORY
  // ==========================================
  getDailyFoodConsumption(dateStr) {
    const today = new Date().toISOString().split('T')[0];
    const date = dateStr || today;

    let records = this.consumptionRecords.filter(c => c.date === date);
    if (records.length === 0) {
      // Seed default day consumption
      const meals = [
        { type: 'Breakfast', eligible: 520, served: 465, prepared: 490, waste: 8, spec: 12 },
        { type: 'Lunch', eligible: 520, served: 495, prepared: 510, waste: 6, spec: 28 },
        { type: 'Evening Snacks', eligible: 520, served: 440, prepared: 460, waste: 5, spec: 15 },
        { type: 'Dinner', eligible: 520, served: 480, prepared: 500, waste: 7, spec: 35 }
      ];
      records = meals.map((m, idx) => ({
        id: `cons-${date}-${idx}`,
        date,
        mealType: m.type,
        eligibleStudents: m.eligible,
        actualServed: m.served,
        estimatedFoodKg: Math.round(m.served * 0.45),
        actualFoodPreparedKg: Math.round(m.prepared * 0.45),
        actualFoodServedKg: Math.round(m.served * 0.44),
        remainingFoodKg: Math.round((m.prepared - m.served) * 0.45),
        foodWastageKg: m.waste,
        wastagePercentage: Number(((m.waste / (m.prepared * 0.45)) * 100).toFixed(1)),
        specialMealCount: m.spec,
        loggedBy: 'Kailash Chandra Sahoo (Canteen In-Charge)',
        createdAt: new Date().toISOString()
      }));
    }

    const summary = {
      totalPreparedKg: records.reduce((acc, r) => acc + r.actualFoodPreparedKg, 0),
      totalServedKg: records.reduce((acc, r) => acc + r.actualFoodServedKg, 0),
      totalWastageKg: records.reduce((acc, r) => acc + r.foodWastageKg, 0),
      averageWastagePercentage: records.length > 0 ? (records.reduce((acc, r) => acc + r.wastagePercentage, 0) / records.length).toFixed(1) : '0'
    };

    return { date, summary, records };
  }

  logFoodConsumption(data, actorName = 'Kitchen Head') {
    const id = `cons-${data.date}-${data.mealType.toLowerCase().slice(0, 2)}-${Date.now()}`;
    const wastePercent = data.actualFoodPreparedKg > 0 ? Number(((data.foodWastageKg / data.actualFoodPreparedKg) * 100).toFixed(1)) : 0;

    const record = {
      id,
      date: data.date,
      mealType: data.mealType,
      eligibleStudents: 520,
      actualServed: Math.round(data.actualFoodServedKg / 0.44),
      estimatedFoodKg: Math.round(data.actualFoodPreparedKg * 0.95),
      actualFoodPreparedKg: data.actualFoodPreparedKg,
      actualFoodServedKg: data.actualFoodServedKg,
      remainingFoodKg: Math.max(0, data.actualFoodPreparedKg - data.actualFoodServedKg - data.foodWastageKg),
      foodWastageKg: data.foodWastageKg,
      wastagePercentage: wastePercent,
      specialMealCount: data.specialMealCount || 0,
      specialMealNotes: data.specialMealNotes,
      loggedBy: actorName,
      createdAt: new Date().toISOString()
    };

    this.consumptionRecords = [record, ...this.consumptionRecords];
    this._save('consumption_records', this.consumptionRecords);

    return { success: true, message: `Consumption logged for ${data.mealType}!`, record };
  }

  getKitchenInventory(category = 'All') {
    if (category && category !== 'All') {
      return this.inventoryItems.filter(i => i.category === category);
    }
    return this.inventoryItems;
  }

  recordInventoryTransaction({ itemId, type, quantity, unitCost, supplier, invoiceNo, reason }, actorName = 'Store Manager') {
    const item = this.inventoryItems.find(i => i.id === itemId);
    if (!item) return { success: false, message: 'Item not found' };

    const qty = Number(quantity);
    if (type === 'PURCHASE') {
      item.purchasedQuantity += qty;
      item.remainingStock += qty;
      item.closingStock += qty;
    } else if (type === 'DAILY_USAGE') {
      item.usedQuantity += qty;
      item.remainingStock = Math.max(0, item.remainingStock - qty);
      item.closingStock = Math.max(0, item.closingStock - qty);
    } else if (type === 'WASTAGE_DISPOSAL') {
      item.wastage += qty;
      item.remainingStock = Math.max(0, item.remainingStock - qty);
      item.closingStock = Math.max(0, item.closingStock - qty);
    }

    item.lastUpdated = new Date().toISOString().split('T')[0];
    this.inventoryItems = this.inventoryItems.map(i => i.id === item.id ? item : i);
    this._save('inventory_items', this.inventoryItems);

    const tx = {
      id: `tx-inv-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      type,
      quantity: qty,
      unit: item.unit,
      unitCost: unitCost || item.costPerUnit,
      totalCost: (unitCost || item.costPerUnit) * qty,
      supplier,
      invoiceNo,
      reason,
      recordedBy: actorName,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    this.inventoryTransactions = [tx, ...this.inventoryTransactions];
    this._save('inventory_transactions', this.inventoryTransactions);

    return { success: true, message: `Recorded ${type} of ${qty} ${item.unit} for ${item.name}!`, item, transaction: tx };
  }

  // ==========================================
  // REPORTS & EXPORTS
  // ==========================================
  getEnterpriseDailyReport(dateStr) {
    const summary = this.getEnterpriseDailyMealSummary(dateStr);
    const consumption = this.getDailyFoodConsumption(dateStr);
    const date = dateStr || new Date().toISOString().split('T')[0];

    return {
      institution: this.settings.institutionName,
      reportTitle: 'Daily Institutional Canteen & Mess Operations Report',
      generatedDate: new Date().toISOString(),
      reportDate: date,
      summary: {
        totalActiveHostellers: summary.totalActiveHostellers,
        totalEligibleStudents: summary.totalEligibleStudents,
        totalMealsServed: summary.totalMealsServed,
        totalAbsentRecords: summary.totalAbsentRecords,
        foodConsumptionKg: consumption.summary.totalServedKg,
        foodWastageKg: consumption.summary.totalWastageKg,
        averageWastagePercentage: consumption.summary.averageWastagePercentage
      },
      mealAttendance: summary,
      foodConsumption: consumption.records
    };
  }

  getEnterpriseFinancialReport(userRole = 'canteen') {
    const isFullAccounts = ['super_admin', 'admin', 'accounts'].includes(userRole.toLowerCase());

    const hostellers = this.hostellers;
    const totalMessCollected = hostellers.reduce((acc, h) => acc + h.messFee.paidAmount, 0);
    const totalMessPending = hostellers.reduce((acc, h) => acc + h.messFee.pendingAmount, 0);

    const report = {
      institution: this.settings.institutionName,
      reportTitle: 'Canteen & Mess Directorate Financial Statement',
      generatedDate: new Date().toISOString(),
      canteenMessFinance: {
        totalSubscribedStudents: hostellers.length,
        totalMessDuesBilled: totalMessCollected + totalMessPending,
        totalMessCollected,
        totalMessPending,
        dailyCollectionEstimate: 14250,
        specialDishesRevenueToday: 3850
      }
    };

    if (isFullAccounts) {
      report.hostelAccommodationFinance = {
        totalAccommodationBilled: hostellers.reduce((acc, h) => acc + h.hostelFee.totalHostelFee, 0),
        totalAccommodationCollected: hostellers.reduce((acc, h) => acc + h.hostelFee.paidAmount, 0),
        totalAccommodationPending: hostellers.reduce((acc, h) => acc + h.hostelFee.pendingAmount, 0)
      };
    } else {
      report.hostelAccommodationFinance = 'Restricted: Canteen staff have access to Mess/Canteen ledger only.';
    }

    return report;
  }

  // ==========================================
  // SETTINGS & AUDIT LOGS
  // ==========================================
  getSettings() {
    return this.settings;
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this._save('settings', this.settings);
    return { success: true, message: 'Canteen operational settings updated!', settings: this.settings };
  }

  logAudit(log) {
    const entry = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...log
    };
    this.auditLogs = [entry, ...this.auditLogs].slice(0, 500);
    this._save('audit_logs', this.auditLogs);
  }

  getAuditLogs(query = '') {
    if (query) {
      const q = query.toLowerCase();
      return this.auditLogs.filter(l =>
        l.target.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.actor.toLowerCase().includes(q)
      );
    }
    return this.auditLogs;
  }

}


export const canteenStore = new CanteenStore();
