// ============================================================================
// BPUT COLLEGE MANAGEMENT SYSTEM (CMS) - HOSTEL WARDEN MODULE DATASET
// Realistic, comprehensive mock datasets for the 15 new hostel warden modules.
// Hostels: Gandhi Boys Residence (B1), Kalam Boys Residence (B2), Sarojini Girls Residence (G1)
// ============================================================================

export const mockHostelAttendanceList = [
  { id: 'att-1', rollNumber: '2401432265', studentName: 'BISHNU PRASAD SAHOO', hostelName: 'Gandhi Boys Residence', roomNumber: '101', bedNumber: 'Bed 01 (Window Side)', checkInTime: '08:15 PM', status: 'Present', consecutiveAbsences: 0, date: '2026-10-19', biometricVerified: true },
  { id: 'att-2', rollNumber: '2305200001', studentName: 'Rakesh Das', hostelName: 'Gandhi Boys Residence', roomNumber: '101', bedNumber: 'Bed 02', checkInTime: '08:22 PM', status: 'Present', consecutiveAbsences: 0, date: '2026-10-19', biometricVerified: true },
  { id: 'att-3', rollNumber: '2305200002', studentName: 'Amit Nayak', hostelName: 'Gandhi Boys Residence', roomNumber: '102', bedNumber: 'Bed 01', checkInTime: '--:--', status: 'Absent', consecutiveAbsences: 4, date: '2026-10-19', biometricVerified: false, alertNote: 'Unreported absence for 4 consecutive nights. Parents alerted.' },
  { id: 'att-4', rollNumber: '2305200004', studentName: 'Priya Patra', hostelName: 'Sarojini Girls Residence', roomNumber: '204', bedNumber: 'Bed 01', checkInTime: '08:10 PM', status: 'Present', consecutiveAbsences: 0, date: '2026-10-19', biometricVerified: true },
  { id: 'att-5', rollNumber: '2305200006', studentName: 'Sneha Mohanty', hostelName: 'Sarojini Girls Residence', roomNumber: '204', bedNumber: 'Bed 02', checkInTime: '08:35 PM', status: 'Present', consecutiveAbsences: 0, date: '2026-10-19', biometricVerified: true },
  { id: 'att-6', rollNumber: '2305200005', studentName: 'Sourav Mohanty', hostelName: 'Gandhi Boys Residence', roomNumber: '201', bedNumber: 'Bed 01', checkInTime: '--:--', status: 'On Leave', consecutiveAbsences: 0, date: '2026-10-19', biometricVerified: false, leaveRef: 'LV-2026-041' },
  { id: 'att-7', rollNumber: '2305200008', studentName: 'Ananya Mishra', hostelName: 'Sarojini Girls Residence', roomNumber: '101', bedNumber: 'Bed 01', checkInTime: '09:05 PM', status: 'Late Check-in', consecutiveAbsences: 1, date: '2026-10-19', biometricVerified: true, alertNote: 'Late return after curfew. Warning noted.' },
  { id: 'att-8', rollNumber: '2305200010', studentName: 'Deepak Pradhan', hostelName: 'Kalam Boys Residence', roomNumber: '105', bedNumber: 'Bed 02', checkInTime: '--:--', status: 'Not Recorded', consecutiveAbsences: 0, date: '2026-10-19', biometricVerified: false },
  { id: 'att-9', rollNumber: '2305200012', studentName: 'Subrat Jena', hostelName: 'Kalam Boys Residence', roomNumber: '106', bedNumber: 'Bed 01', checkInTime: '08:05 PM', status: 'Present', consecutiveAbsences: 0, date: '2026-10-19', biometricVerified: true },
  { id: 'att-10', rollNumber: '2305200015', studentName: 'Tanmay Tripathy', hostelName: 'Gandhi Boys Residence', roomNumber: '103', bedNumber: 'Bed 02', checkInTime: '--:--', status: 'Absent', consecutiveAbsences: 3, date: '2026-10-19', biometricVerified: false, alertNote: '3rd consecutive night absent. Warden review required.' },
];

export const mockHostelCorrectionRequests = [
  { id: 'COR-01', rollNumber: '2305200008', studentName: 'Ananya Mishra', date: '2026-10-18', reason: 'Biometric device scanner timed out during evening round', requestedStatus: 'Present', proofNote: 'Caretaker Mrs. Kabita confirmed attendance in Floor Register.', status: 'Pending' },
  { id: 'COR-02', rollNumber: '2305200010', studentName: 'Deepak Pradhan', date: '2026-10-17', reason: 'Late lab session at AI-Robotics Center till 8:30 PM with Dean approval', requestedStatus: 'Present', proofNote: 'Faculty gate slip signed by Prof. Mohapatra.', status: 'Pending' }
];

export const mockLeaveApplications = [
  { id: 'LV-2026-041', studentName: 'Sourav Mohanty', rollNumber: '2305200005', hostelName: 'Gandhi Boys Residence', roomNumber: '201', phone: '+91 98610 55443', startDate: '2026-10-18', endDate: '2026-10-22', days: 4, reason: 'Sister\'s Wedding Ceremony at Berhampur', guardianName: 'B. C. Mohanty', guardianPhone: '+91 98610 88771', guardianStatus: 'Verified via Phone Call', status: 'Approved', appliedOn: '2026-10-15', returned: false },
  { id: 'LV-2026-042', studentName: 'Amit Nayak', rollNumber: '2305200002', hostelName: 'Gandhi Boys Residence', roomNumber: '102', phone: '+91 98610 00222', startDate: '2026-10-20', endDate: '2026-10-24', days: 4, reason: 'Medical Checkup & Dental Procedure at AIIMS BBSR', guardianName: 'Nayak Senior', guardianPhone: '+91 98610 00222', guardianStatus: 'SMS Awaiting Confirmation', status: 'Pending', appliedOn: '2026-10-18', returned: false },
  { id: 'LV-2026-043', studentName: 'Ananya Mishra', rollNumber: '2305200008', hostelName: 'Sarojini Girls Residence', roomNumber: '101', phone: '+91 94371 88990', startDate: '2026-10-19', endDate: '2026-10-21', days: 2, reason: 'Hackathon Participation at NIT Rourkela', guardianName: 'S. K. Mishra', guardianPhone: '+91 94371 99001', guardianStatus: 'Faculty & Guardian Consent Letter Attached', status: 'Pending', appliedOn: '2026-10-17', returned: false },
  { id: 'LV-2026-039', studentName: 'Rakesh Das', rollNumber: '2305200001', hostelName: 'Gandhi Boys Residence', roomNumber: '101', phone: '+91 94370 11999', startDate: '2026-10-10', endDate: '2026-10-13', days: 3, reason: 'Family Function in Cuttack', guardianName: 'D. Das', guardianPhone: '+91 94370 11888', guardianStatus: 'Verified', status: 'Approved', appliedOn: '2026-10-08', returned: true },
  { id: 'LV-2026-038', studentName: 'Subrat Jena', rollNumber: '2305200012', hostelName: 'Kalam Boys Residence', roomNumber: '106', phone: '+91 98612 33445', startDate: '2026-10-05', endDate: '2026-10-07', days: 2, reason: 'Personal errands without guardian consent letter', guardianName: 'R. K. Jena', guardianPhone: '+91 98612 00112', guardianStatus: 'Guardian Disapproved', status: 'Rejected', appliedOn: '2026-10-03', returned: false }
];

export const mockMessMenuWeekly = {
  Monday: {
    breakfast: { items: 'Idli, Medu Vada, Coconut Chutney, Sambar, Boiled Egg / Banana, Tea & Coffee', time: '07:30 - 09:30 AM', calories: '520 kcal' },
    lunch: { items: 'Basmati Steamed Rice, Dal Tadka, Paneer Butter Masala (Veg) / Fish Curry (Non-Veg), Aloo Gobi Dry, Papad, Curd, Salad', time: '12:30 - 02:30 PM', calories: '820 kcal' },
    snacks: { items: 'Veg Patties & Onion Pakora, Green Mint Chutney, Ginger Tea', time: '05:00 - 06:15 PM', calories: '340 kcal' },
    dinner: { items: 'Phulka Chapati, Jeera Rice, Dal Makhani, Mixed Vegetable Korma, Kheer Payasam, Pickle', time: '08:00 - 10:00 PM', calories: '750 kcal' }
  },
  Tuesday: {
    breakfast: { items: 'Aloo Paratha with Curd, Pickle, Boiled Sprouts, Fresh Cut Fruits, Milk & Tea', time: '07:30 - 09:30 AM', calories: '560 kcal' },
    lunch: { items: 'Plain Rice, Yellow Moong Dal, Kadai Chicken (Non-Veg) / Matar Mushroom (Veg), Bhindi Fry, Boondi Raita', time: '12:30 - 02:30 PM', calories: '840 kcal' },
    snacks: { items: 'Poha with Roasted Peanuts, Sev, Lemon & Masala Chai', time: '05:00 - 06:15 PM', calories: '310 kcal' },
    dinner: { items: 'Tawa Roti, Veg Biryani / Pulao, Paneer Do Pyaza, Yellow Dal, Gulab Jamun (1 pc)', time: '08:00 - 10:00 PM', calories: '780 kcal' }
  },
  Wednesday: {
    breakfast: { items: 'Masala Dosa, Sambar, Tomato & Coconut Chutney, Hard Boiled Eggs, Tea / Coffee', time: '07:30 - 09:30 AM', calories: '530 kcal' },
    lunch: { items: 'Steamed Rice, Chana Dal Fry, Egg Curry (2 pcs) / Palak Paneer, Baingan Bhaja, Curd, Papad', time: '12:30 - 02:30 PM', calories: '810 kcal' },
    snacks: { items: 'Sweet Corn Chaat, Samosa with Sweet Imli Chutney, Tea', time: '05:00 - 06:15 PM', calories: '380 kcal' },
    dinner: { items: 'Butter Roti, Plain Rice, Dal Fry, Seasonal Mixed Veg, Sevaiyan Kheer', time: '08:00 - 10:00 PM', calories: '710 kcal' }
  },
  Thursday: {
    breakfast: { items: 'Upma with Chana Ghuguni, Banana, Bread & Butter, Fruit Jam, Bournvita & Tea', time: '07:30 - 09:30 AM', calories: '510 kcal' },
    lunch: { items: 'Steamed Rice, Masoor Dal, Dum Aloo Kashmiri, Rajma Masala, Crispy Papad, Sweet Lassi', time: '12:30 - 02:30 PM', calories: '850 kcal' },
    snacks: { items: 'Bread Pakora with Tomato Sauce, Green Chili, Cardamom Tea', time: '05:00 - 06:15 PM', calories: '390 kcal' },
    dinner: { items: 'Phulka, Jeera Rice, Dal Tadka, Paneer Pasanda, Aloo Capsicum, Fruit Custard', time: '08:00 - 10:00 PM', calories: '740 kcal' }
  },
  Friday: {
    breakfast: { items: 'Puri Sabji (Poori & Aloo Dum), Sooji Halwa, Fresh Banana, Masala Tea & Black Coffee', time: '07:30 - 09:30 AM', calories: '610 kcal' },
    lunch: { items: 'Fragrant Rice, Dal Maharani, Odia Machha Besara (Fish in Mustard) / Shahi Paneer, Cabbage Peas Bhaji, Curd', time: '12:30 - 02:30 PM', calories: '860 kcal' },
    snacks: { items: 'Veg Spring Rolls, Maggi Noodles Cup, Ginger Tea', time: '05:00 - 06:15 PM', calories: '360 kcal' },
    dinner: { items: 'Tawa Roti, Veg Pulao, Dal Fry, Soya Chunks Gravy, Rasgulla (1 pc)', time: '08:00 - 10:00 PM', calories: '730 kcal' }
  },
  Saturday: {
    breakfast: { items: 'Uttapam with Onion & Tomato, Coconut Chutney, Sambar, Omelette / Boiled Eggs, Tea', time: '07:30 - 09:30 AM', calories: '540 kcal' },
    lunch: { items: 'Steamed Rice, Dal Kolhapuri, Chilli Chicken / Chilli Paneer, Veg Fried Rice, Kimchi Salad', time: '12:30 - 02:30 PM', calories: '870 kcal' },
    snacks: { items: 'Aloo Bonda, Roasted Chana, Hot Coffee', time: '05:00 - 06:15 PM', calories: '320 kcal' },
    dinner: { items: 'Rumali Roti, Khichdi with Ghee (Comfort Diet option), Baigan Bharta, Dal Tadka, Papad', time: '08:00 - 10:00 PM', calories: '690 kcal' }
  },
  Sunday: {
    breakfast: { items: 'Chole Bhature with Pickled Onions & Green Chili, Fresh Fruit Juice, Sweet Lassi, Tea', time: '08:00 - 10:00 AM', calories: '680 kcal' },
    lunch: { items: 'Hyderabadi Chicken Dum Biryani / Veg Dum Biryani with Raita, Mirchi Ka Salan, Double Ka Meetha', time: '12:30 - 03:00 PM', calories: '950 kcal' },
    snacks: { items: 'Biscuits, Rusks, Mixed Namkeen, Masala Chai', time: '05:00 - 06:15 PM', calories: '260 kcal' },
    dinner: { items: 'Soft Rotis, Steamed Rice, Dal Makhani, Paneer Tikka Masala, Ice Cream Cup (Vanilla/Butterscotch)', time: '08:00 - 10:00 PM', calories: '790 kcal' }
  }
};

export const mockMessComplaints = [
  { id: 'MC-101', studentName: 'Amit Nayak', rollNumber: '2305200002', date: '2026-10-18', meal: 'Lunch', category: 'Food Quality', comment: 'Chapati was slightly dry and undercooked on Sunday evening dinner.', rating: 2, status: 'Action Taken', wardenNote: 'Instructed head chef to monitor tandoor flame temperature.' },
  { id: 'MC-102', studentName: 'Priya Patra', rollNumber: '2305200004', date: '2026-10-17', meal: 'Dinner', category: 'Hygiene & Cleanliness', comment: 'Drinking water dispenser in Sarojini Girls mess dining hall needs filter replacement.', rating: 3, status: 'Resolved', wardenNote: 'RO technician cleaned storage tank and changed carbon filter on 18 Oct.' }
];

export const mockSpecialMealRequests = [
  { id: 'SMR-01', studentName: 'Rakesh Das', rollNumber: '2305200001', hostel: 'Gandhi Boys Residence', room: '101', dietType: 'Sick Diet (Moong Khichdi & Curd)', startDate: '2026-10-18', endDate: '2026-10-20', status: 'Approved & Serving' },
  { id: 'SMR-02', studentName: 'Sneha Mohanty', rollNumber: '2305200006', hostel: 'Sarojini Girls Residence', room: '204', dietType: 'Navratri Vrat / Fasting Fruit Meal', startDate: '2026-10-19', endDate: '2026-10-21', status: 'Approved & Serving' }
];

export const mockMaintenanceRequests = [
  { id: 'MNT-301', category: 'Plumbing', title: 'Washroom 2nd Floor Flush Valve Leakage', hostelName: 'Gandhi Boys Residence', roomOrArea: 'Floor 2 Common Washroom (East Wing)', priority: 'High', assignedStaff: 'Mr. Kailash Barik (Senior Plumber)', filedDate: '2026-10-18', status: 'In Progress', estimatedCost: '₹450', completionTarget: '2026-10-20', notes: 'Replaced rubber washer, final testing scheduled.' },
  { id: 'MNT-302', category: 'Electrical', title: 'Corridor LED tube flicker and switch spark', hostelName: 'Sarojini Girls Residence', roomOrArea: 'Floor 1 Room 102 Corridor', priority: 'Urgent', assignedStaff: 'Mr. Bipin Sethi (Electrician)', filedDate: '2026-10-19', status: 'Pending', estimatedCost: '₹320', completionTarget: '2026-10-19', notes: 'Parts requisitioned from campus store.' },
  { id: 'MNT-303', category: 'Furniture', title: 'Wooden Study Chair leg broken', hostelName: 'Gandhi Boys Residence', roomOrArea: 'Room 101', priority: 'Medium', assignedStaff: 'Mr. Jagabandhu Nayak (Carpenter)', filedDate: '2026-10-16', status: 'Completed', estimatedCost: '₹200', completionTarget: '2026-10-17', notes: 'Repaired with steel brace support.' },
  { id: 'MNT-304', category: 'Cleaning', title: 'Water cooler drainage tray choked with leaves', hostelName: 'Kalam Boys Residence', roomOrArea: 'Ground Floor Porch', priority: 'Low', assignedStaff: 'Mrs. Laxmi Das (Housekeeping)', filedDate: '2026-10-17', status: 'Completed', estimatedCost: '₹0', completionTarget: '2026-10-18', notes: 'Flushed and sanitized with bleaching solution.' },
  { id: 'MNT-305', category: 'Civil', title: 'Balcony door latch loose and rattling in wind', hostelName: 'Gandhi Boys Residence', roomOrArea: 'Room 201', priority: 'Medium', assignedStaff: 'Mr. Jagabandhu Nayak (Carpenter)', filedDate: '2026-10-19', status: 'Pending', estimatedCost: '₹150', completionTarget: '2026-10-21', notes: 'New latch ordered from central inventory.' }
];

export const mockHostelStaffList = [
  { id: 'STF-101', name: 'Mr. Rajesh Jena', designation: 'Chief Resident Warden (Boys)', hostel: 'Gandhi Boys Residence', shift: 'General / 24x7 Resident', phone: '+91 94370 11223', email: 'rajesh.jena@gift.edu.in', attendance: 'Present On-Duty', leaveStatus: 'Active' },
  { id: 'STF-102', name: 'Mrs. Nibedita Das', designation: 'Chief Resident Warden (Girls)', hostel: 'Sarojini Girls Residence', shift: 'General / 24x7 Resident', phone: '+91 94370 33445', email: 'nibedita.das@gift.edu.in', attendance: 'Present On-Duty', leaveStatus: 'Active' },
  { id: 'STF-103', name: 'Mr. Manoj Sahoo', designation: 'Assistant Warden', hostel: 'Kalam Boys Residence', shift: 'Evening (02:00 PM - 10:00 PM)', phone: '+91 94370 22334', email: 'manoj.sahoo@gift.edu.in', attendance: 'Present On-Duty', leaveStatus: 'Active' },
  { id: 'STF-104', name: 'Mr. Kailash Barik', designation: 'Hostel Maintenance Plumber', hostel: 'All Hostels', shift: 'Morning (07:00 AM - 03:00 PM)', phone: '+91 94372 88122', email: 'kailash.barik@gift.edu.in', attendance: 'Present On-Duty', leaveStatus: 'Active' },
  { id: 'STF-105', name: 'Mr. Bipin Sethi', designation: 'Hostel Senior Electrician', hostel: 'All Hostels', shift: 'Morning (08:00 AM - 04:00 PM)', phone: '+91 94373 99233', email: 'bipin.sethi@gift.edu.in', attendance: 'Present On-Duty', leaveStatus: 'Active' },
  { id: 'STF-106', name: 'Mrs. Kabita Swain', designation: 'Hostel Caretaker & Matron', hostel: 'Sarojini Girls Residence', shift: 'Day Shift (08:00 AM - 05:00 PM)', phone: '+91 98611 44556', email: 'kabita.swain@gift.edu.in', attendance: 'Present On-Duty', leaveStatus: 'Active' },
  { id: 'STF-107', name: 'Mr. Niranjan Behera', designation: 'Head Cook & Mess In-Charge', hostel: 'Central Dining Hall', shift: 'Split Shift (06:00 AM - 02:00 PM / 06:00 PM - 10:00 PM)', phone: '+91 98613 66778', email: 'niranjan.behera@gift.edu.in', attendance: 'Present On-Duty', leaveStatus: 'Active' },
  { id: 'STF-108', name: 'Mr. Arjun Pradhan', designation: 'Security Gate Sergeant', hostel: 'Gandhi Boys Residence Gate', shift: 'Night Shift (10:00 PM - 06:00 AM)', phone: '+91 98614 77889', email: 'security.hostel@gift.edu.in', attendance: 'On Leave (Relief on Duty)', leaveStatus: 'Casual Leave' }
];

export const mockDisciplinaryRecords = [
  { id: 'DISC-2026-011', studentName: 'Amit Nayak', rollNumber: '2305200002', hostelName: 'Gandhi Boys Residence', roomNumber: '102', date: '2026-10-14', category: 'Curfew & Gate Violation', description: 'Student returned to hostel after 10:45 PM without prior outstation gate pass or emergency approval.', status: 'Show-Cause Issued', actionTaken: 'Written Explanation Summoned & Guardian Informed via Official Call', authorizedOfficial: 'Mr. Rajesh Jena (Chief Warden)', followUpDate: '2026-10-22' },
  { id: 'DISC-2026-009', studentName: 'Tanmay Tripathy', rollNumber: '2305200015', hostelName: 'Gandhi Boys Residence', roomNumber: '103', date: '2026-10-02', category: 'Prohibited Electrical Appliance', description: 'Unauthorized 1500W electric heating immersion rod seized during surprise warden room inspection.', status: 'Penalized & Closed', actionTaken: 'Appliance Confiscated & ₹500 Environmental Safety Penalty debited to student accounts', authorizedOfficial: 'Mr. Rajesh Jena (Chief Warden)', followUpDate: '2026-10-10' },
  { id: 'DISC-2026-004', studentName: 'Deepak Pradhan', rollNumber: '2305200010', hostelName: 'Kalam Boys Residence', roomNumber: '105', date: '2026-09-24', category: 'Noise & Curfew Disturbance', description: 'Loud Bluetooth party speaker played at 1:15 AM during study preparatory week.', status: 'Resolved with Warning', actionTaken: 'First Formal Warning Letter issued and undertaking signed.', authorizedOfficial: 'Mr. Manoj Sahoo (Asst. Warden)', followUpDate: '2026-10-01' }
];

export const mockEmergencyIncidents = [
  { id: 'EMG-2026-005', title: 'Medical Emergency: Severe Gastric Pain & Dehydration', category: 'Medical Emergency', severity: 'High', date: '2026-10-18', time: '11:20 PM', location: 'Sarojini Girls Residence, Room 204', studentAffected: 'Priya Patra (2305200004)', description: 'Student complained of acute abdominal pain and nausea late night. Matron alerted warden immediately.', immediateResponse: 'Campus Ambulance arrived in 6 minutes. Shifted to Kalinga Hospital Emergency with Matron escort. IV fluids administered.', responsibleOfficial: 'Mrs. Nibedita Das (Chief Warden)', escalationStatus: 'Dean Student Welfare & Parents Informed at 11:35 PM', status: 'Resolved & Discharged' },
  { id: 'EMG-2026-004', title: 'Main Phase MCB Trip & Power Loss in West Wing', category: 'Power & Infrastructure', severity: 'Moderate', date: '2026-10-12', time: '08:45 PM', location: 'Gandhi Boys Residence, 1st Floor', studentAffected: '18 Rooms (54 Students)', immediateResponse: 'Generator backup switched automatically. Electrician Mr. Bipin Sethi replaced burnt 63A MCB within 22 minutes.', responsibleOfficial: 'Mr. Rajesh Jena (Chief Warden)', escalationStatus: 'Maintenance Log Updated', status: 'Resolved' },
  { id: 'EMG-2026-001', title: 'Accidental Fire Alarm Sensor Trigger in Pantry', category: 'Fire & Safety', severity: 'Critical', date: '2026-09-18', time: '04:10 PM', location: 'Central Dining Hall Kitchen', studentAffected: 'Kitchen Staff & Diners', immediateResponse: 'Dry chemical CO2 extinguisher deployed. Evacuation drill initiated for 4 minutes. Burnt toast smoke cleared.', responsibleOfficial: 'Mr. Niranjan Behera (Mess In-Charge)', escalationStatus: 'Chief Security Officer Signed Incident Clearance', status: 'Closed' }
];

export const mockInventoryAssets = [
  { id: 'AST-HST-001', name: 'Heavy Duty Steel Bunk Bed (Double Tier)', category: 'Furniture', hostel: 'Gandhi Boys Residence', location: 'Rooms 101 to 130', totalQty: 60, inUse: 56, condition: 'Good', status: 'Assigned', acquisitionDate: '2024-07-15', maintenanceHistory: 'All bolt joints greased & tightened July 2026' },
  { id: 'AST-HST-002', name: 'High-Density Orthopedic Foam Mattress', category: 'Bedding', hostel: 'Gandhi Boys Residence', location: 'Hostel Store & Rooms', totalQty: 180, inUse: 168, condition: 'Good', status: 'Assigned', acquisitionDate: '2025-06-10', maintenanceHistory: 'Annual dry-cleaning conducted June 2026' },
  { id: 'AST-HST-003', name: 'Engineered Wood Study Desk with Book Rack', category: 'Furniture', hostel: 'Sarojini Girls Residence', location: 'Rooms 101 to 150', totalQty: 150, inUse: 142, condition: 'Good', status: 'Assigned', acquisitionDate: '2024-07-20', maintenanceHistory: 'Laminate polish refreshed Sept 2026' },
  { id: 'AST-HST-004', name: 'Havells 1200mm Heavy-Air Ceiling Fan', category: 'Electrical', hostel: 'Gandhi Boys Residence', location: 'Room 204 & All Floors', totalQty: 90, inUse: 88, condition: 'Needs Repair', status: 'Under Repair', acquisitionDate: '2023-08-01', maintenanceHistory: 'Capacitor replacement ongoing for Unit #14' },
  { id: 'AST-HST-005', name: 'Blue Star 80L Stainless Steel RO Water Cooler', category: 'Sanitation & Appliances', hostel: 'Kalam Boys Residence', location: 'Floor 1 & Floor 2 Lobby', totalQty: 4, inUse: 4, condition: 'Good', status: 'Assigned', acquisitionDate: '2025-01-10', maintenanceHistory: 'TDS tested: 110 ppm. UV lamp checked 15 Oct 2026' },
  { id: 'AST-HST-006', name: 'Ceasefire ABC Dry Powder Fire Extinguisher (6kg)', category: 'Safety & Security', hostel: 'All Hostels', location: 'Stairwell Corridors', totalQty: 24, inUse: 24, condition: 'Certified', status: 'Assigned', acquisitionDate: '2025-09-01', maintenanceHistory: 'Pressure gauge green. Certified valid till Aug 2027' }
];

export const mockHostelNotices = [
  { id: 'NTC-HST-091', title: 'Diwali Festive Vacation & Hostel Curfew Guidelines', targetHostel: 'All Hostels', targetGroup: 'All Boarders & Residents', publishDate: '2026-10-18', expiryDate: '2026-11-05', priority: 'Urgent', status: 'Published', content: 'Hostel mess will operate on special festive schedule from 28 Oct to 02 Nov. All students traveling home must submit online Gate Pass before 25 Oct 5:00 PM. No student is allowed to burst firecrackers inside hostel corridors or courtyards.', attachmentName: 'Diwali_Hostel_Advisory_2026.pdf', author: 'Office of Chief Warden' },
  { id: 'NTC-HST-089', title: 'Schedule for Mandatory Biometric Registration Update', targetHostel: 'Gandhi Boys Residence', targetGroup: '1st & 2nd Year Students', publishDate: '2026-10-15', expiryDate: '2026-10-25', priority: 'General', status: 'Published', content: 'IT team will be available at Hostel Office from 5:00 PM to 8:00 PM for re-enrolling fingerprint sensors for students experiencing biometric failures.', attachmentName: 'Biometric_Desk_Schedule.pdf', author: 'Hostel IT Admin' },
  { id: 'NTC-HST-085', title: 'Winter Water Heating Boiler Maintenance Shutdown', targetHostel: 'Sarojini Girls Residence', targetGroup: 'All Residents', publishDate: '2026-10-10', expiryDate: '2026-10-14', priority: 'Routine', status: 'Expired', content: 'Solar thermal water heating systems underwent routine descale maintenance on Sunday. Normal hot water supply resumed from 12 Oct.', attachmentName: null, author: 'Estate Maintenance Cell' }
];

export const mockCheckinCheckoutList = [
  { id: 'CHK-2026-081', type: 'Check-in', studentName: 'BISHNU PRASAD SAHOO', rollNumber: '2401432265', hostelName: 'Gandhi Boys Residence', roomNumber: '101', bedNumber: 'Bed 01', date: '2026-07-28', checklist: { idVerified: true, messSmartCard: true, roomKeysHanded: true, assetConditionForm: true }, status: 'Completed', notes: 'All fixtures verified intact.' },
  { id: 'CHK-2026-082', type: 'Check-in', studentName: 'Rakesh Das', rollNumber: '2305200001', hostelName: 'Gandhi Boys Residence', roomNumber: '101', bedNumber: 'Bed 02', date: '2026-07-29', checklist: { idVerified: true, messSmartCard: true, roomKeysHanded: true, assetConditionForm: true }, status: 'Completed', notes: 'Bedding assigned.' },
  { id: 'CHK-2026-095', type: 'Check-in', studentName: 'Abhilash Mohapatra', rollNumber: '2401432299', hostelName: 'Kalam Boys Residence', roomNumber: '108', bedNumber: 'Bed 01', date: '2026-10-20', checklist: { idVerified: true, messSmartCard: false, roomKeysHanded: true, assetConditionForm: false }, status: 'Awaiting Check-in', notes: 'Mess smart card to be issued at dining counter.' },
  { id: 'CHK-2026-071', type: 'Check-out', studentName: 'Dipti Ranjan Nayak', rollNumber: '2105200019', hostelName: 'Gandhi Boys Residence', roomNumber: '302', bedNumber: 'Bed 02', date: '2026-10-16', checklist: { noDuesAccounts: true, noDuesLibrary: true, roomInspectionClean: true, keysReturned: true }, status: 'Check-out Approved', notes: 'Security deposit clearance slip generated.' },
  { id: 'CHK-2026-072', type: 'Check-out', studentName: 'Rohan Senapati', rollNumber: '2105200045', hostelName: 'Kalam Boys Residence', roomNumber: '210', bedNumber: 'Bed 01', date: '2026-10-21', checklist: { noDuesAccounts: true, noDuesLibrary: false, roomInspectionClean: true, keysReturned: false }, status: 'Pending Check-out', notes: 'Pending return of 2 library reference books.' }
];

export const mockHostelFeesList = [
  { id: 'FEE-HST-101', studentName: 'BISHNU PRASAD SAHOO', rollNumber: '2401432265', hostelName: 'Gandhi Boys Residence', roomNumber: '101', category: 'Hostel Accommodation (Sem 3)', amount: 28000, paidAmount: 28000, dues: 0, dueDate: '2026-08-15', status: 'Paid', receiptNo: 'HST-REC-2026-8841', verified: true },
  { id: 'FEE-HST-102', studentName: 'Rakesh Das', rollNumber: '2305200001', hostelName: 'Gandhi Boys Residence', roomNumber: '101', category: 'Hostel Accommodation (Sem 5)', amount: 28000, paidAmount: 28000, dues: 0, dueDate: '2026-08-15', status: 'Paid', receiptNo: 'HST-REC-2026-8812', verified: true },
  { id: 'FEE-HST-103', studentName: 'Amit Nayak', rollNumber: '2305200002', hostelName: 'Gandhi Boys Residence', roomNumber: '102', category: 'Mess Catering Fee (Term 1)', amount: 18000, paidAmount: 10000, dues: 8000, dueDate: '2026-09-30', status: 'Partial Due', receiptNo: 'HST-REC-2026-8904', verified: true },
  { id: 'FEE-HST-104', studentName: 'Tanmay Tripathy', rollNumber: '2305200015', hostelName: 'Gandhi Boys Residence', roomNumber: '103', category: 'Hostel Caution Deposit & Amenity', amount: 32000, paidAmount: 0, dues: 32000, dueDate: '2026-10-05', status: 'Overdue', receiptNo: '--', verified: false },
  { id: 'FEE-HST-105', studentName: 'Priya Patra', rollNumber: '2305200004', hostelName: 'Sarojini Girls Residence', roomNumber: '204', category: 'Hostel Accommodation (Sem 5)', amount: 32000, paidAmount: 32000, dues: 0, dueDate: '2026-08-15', status: 'Paid', receiptNo: 'HST-REC-2026-8790', verified: true },
  { id: 'FEE-HST-106', studentName: 'Sneha Mohanty', rollNumber: '2305200006', hostelName: 'Sarojini Girls Residence', roomNumber: '204', category: 'Hostel Accommodation (Sem 5)', amount: 32000, paidAmount: 32000, dues: 0, dueDate: '2026-08-15', status: 'Paid', receiptNo: 'HST-REC-2026-8791', verified: true }
];

export const mockFeedbackSuggestions = [
  { id: 'FB-01', category: 'Mess & Food', studentName: 'Anonymous Resident', hostel: 'Sarojini Girls Residence', date: '2026-10-17', title: 'Request for evening curd/fruit option during dinner', rating: 4, status: 'Under Review', priority: 'Medium', assignedStaff: 'Mr. Niranjan Behera (Mess In-Charge)', actionTaken: 'Mess committee to deliberate in weekly meeting on 22 Oct.' },
  { id: 'FB-02', category: 'Internet & Wi-Fi', studentName: 'Sourav Mohanty (2305200005)', hostel: 'Gandhi Boys Residence', date: '2026-10-15', title: 'Wi-Fi bandwidth throttling during online contest hours (8-10 PM)', rating: 3, status: 'Action Initiated', priority: 'High', assignedStaff: 'Campus IT Network Team', actionTaken: 'Upgraded QoS packet prioritization for Coding and Academic portals.' },
  { id: 'FB-03', category: 'Sports & Recreation', studentName: 'Deepak Pradhan (2305200010)', hostel: 'Kalam Boys Residence', date: '2026-10-12', title: 'Hostel Table Tennis table racquets and balls need replacement', rating: 5, status: 'Resolved', priority: 'Low', assignedStaff: 'Mr. Manoj Sahoo (Asst. Warden)', actionTaken: 'Procured 4 new Stag racquets and two dozen balls from Sports budget.' }
];

export const mockInspectionCompliance = [
  { id: 'INSP-2026-031', hostelName: 'Sarojini Girls Residence', date: '2026-10-15', inspector: 'Mrs. Nibedita Das & Dr. Sujata Ray (Dean SW)', score: '97.5%', status: 'Compliant & Excellent', findings: 'All emergency exit corridors clear. Solar water heaters operating normally. First aid boxes fully stocked.', correctiveAction: 'Repainted fire extinguisher location signs on Floor 3.', followUpDate: '2026-11-15' },
  { id: 'INSP-2026-030', hostelName: 'Gandhi Boys Residence', date: '2026-10-10', inspector: 'Mr. Rajesh Jena (Chief Warden) & Fire Safety Officer', score: '94.0%', status: 'Compliant', findings: 'Two pantry power sockets showed loose wiring. Minor leakage in 2nd floor pipe shaft.', correctiveAction: 'Electrical & Plumbing work orders issued same day. Rectified within 24 hours.', followUpDate: '2026-11-10' },
  { id: 'INSP-2026-028', hostelName: 'Kalam Boys Residence', date: '2026-09-28', inspector: 'Mr. Manoj Sahoo & Chief Sanitary Inspector', score: '91.8%', status: 'Action Required', findings: 'Water drainage pit behind kitchen mess required bleaching and desilting.', correctiveAction: 'Sanitary squad dispatched. Water sample sent for microbiology culture test (reported clean).', followUpDate: '2026-10-28' }
];

export const mockEmergencyContactsDirectory = [
  { id: 'EC-01', category: 'Campus Security', name: 'Chief Security Control Room (24x7)', contactPerson: 'Maj. S. K. Patnaik', phone: '+91 94370 00100', altPhone: '0674-2741100', location: 'Main Entrance Security Gate 1', availability: '24x7 Immediate Response', verified: true },
  { id: 'EC-02', category: 'Medical & Ambulance', name: 'Campus Health Center & 24x7 Ambulance', contactPerson: 'Dr. P. K. Mohanty (RMO)', phone: '+91 94370 00108', altPhone: '+91 98610 10810', location: 'Health Center, Academic Block B', availability: '24x7 Resident Doctor & Driver', verified: true },
  { id: 'EC-03', category: 'Hostel Administration', name: 'Chief Warden Office (Boys Hostels)', contactPerson: 'Mr. Rajesh Jena', phone: '+91 94370 11223', altPhone: '0674-2741123', location: 'Gandhi Residence Ground Floor Office', availability: 'Resident On-Campus', verified: true },
  { id: 'EC-04', category: 'Hostel Administration', name: 'Chief Warden Office (Girls Hostels)', contactPerson: 'Mrs. Nibedita Das', phone: '+91 94370 33445', altPhone: '0674-2741345', location: 'Sarojini Residence Ground Floor Office', availability: 'Resident On-Campus', verified: true },
  { id: 'EC-05', category: 'Electrical & Power', name: 'Campus Electrical Substation / Breakdown', contactPerson: 'Mr. Bipin Sethi (Head Electrician)', phone: '+91 94373 99233', altPhone: '0674-2741150', location: '33KV Power Substation', availability: '24x7 Emergency Line', verified: true },
  { id: 'EC-06', category: 'Civic Services', name: 'Infocity Police Station Hotline', contactPerson: 'Inspector In-Charge (IIC)', phone: '0674-2744100', altPhone: '112', location: 'Infocity Police Station, Bhubaneswar', availability: 'Govt. Emergency Services', verified: true },
  { id: 'EC-07', category: 'Civic Services', name: 'Fire Station Chandrasekharpur', contactPerson: 'Station Officer', phone: '0674-2300101', altPhone: '101', location: 'Chandrasekharpur, Bhubaneswar', availability: 'Govt. Fire & Rescue', verified: true },
  { id: 'EC-08', category: 'Student Welfare', name: 'Dean Student Welfare (DSW) Office', contactPerson: 'Prof. (Dr.) A. K. Nayak', phone: '+91 94370 99881', altPhone: '0674-2741999', location: 'Administrative Block 2nd Floor', availability: '09:00 AM - 07:00 PM', verified: true }
];

export const mockHostelRulesConfig = [
  {
    category: 'Curfew & Gate Timings',
    items: [
      { title: 'Girls Hostel Curfew', value: '08:30 PM', description: 'All residents of Sarojini Girls Residence must swipe biometric attendance before 8:30 PM.' },
      { title: 'Boys Hostel Curfew', value: '09:30 PM', description: 'All residents of Gandhi and Kalam Boys Residences must swipe biometric attendance before 9:30 PM.' },
      { title: 'Morning Gate Opening', value: '06:00 AM', description: 'Main hostel entrance opens for morning athletic runs, gym, and library access.' },
      { title: 'Night Quiet Hours', value: '11:00 PM - 06:00 AM', description: 'Strict quiet hours in all wings; loud music, shouting in corridors, and hallway sports prohibited.' }
    ]
  },
  {
    category: 'Visitor & Guest Policies',
    items: [
      { title: 'Visiting Hours', value: '04:00 PM - 06:30 PM', description: 'Parents and authorized guardians can meet students only in the designated ground floor Visitor Lounge.' },
      { title: 'Overnight Guests', value: 'Strictly Prohibited', description: 'No non-resident or unauthorized individual may stay overnight under any circumstances.' },
      { title: 'Opposite Gender Wing Entry', value: 'Zero Tolerance', description: 'Entry of male visitors into girls hostel or female visitors into boys hostel wings is prohibited.' }
    ]
  },
  {
    category: 'Electrical & Room Safety',
    items: [
      { title: 'Prohibited Heavy Appliances', value: 'Immerison Rods, Heaters, Induction Cookers', description: 'Any appliance drawing over 300W without prior written sanction from Chief Warden is confiscated.' },
      { title: 'Permitted Devices', value: 'Laptops, Phone Chargers, Study Lamps', description: 'Low-power certified electronics are allowed on designated study desk power points.' }
    ]
  },
  {
    category: 'Anti-Ragging & Code of Conduct',
    items: [
      { title: 'Supreme Court & UGC Anti-Ragging', value: 'Strict Zero Tolerance', description: 'Any act of teasing, manhandling, or harassment leads to immediate police FIR and college rustication.' },
      { title: 'Substance & Alcohol Policy', value: '100% Smoke & Substance-Free Campus', description: 'Possession or consumption results in immediate expulsion from hostel and parent notification.' }
    ]
  }
];
