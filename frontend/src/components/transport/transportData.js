// ============================================================================
// BPUT COLLEGE MANAGEMENT SYSTEM (CMS) - TRANSPORT MANAGEMENT DATASET
// Complete, realistic datasets for the 15 new transport management modules.
// Vehicles: OD-02-AK-4411 (Bus 01), OD-02-AK-4412 (Bus 02), OD-02-BL-8890 (Bus 03),
//           OD-02-BL-8891 (Bus 04), OD-02-CL-1209 (Bus 05)
// ============================================================================

export const mockBoardingAttendance = [
  { id: 'BRD-001', studentName: 'BISHNU PRASAD SAHOO', rollNumber: '2401432265', routeName: 'Route 1: Cuttack Badambadi Express', vehicleNumber: 'OD-02-AK-4411', stopName: 'Badambadi Bus Stand', boardingStatus: 'Boarded', boardingTime: '07:18 AM', date: '2026-10-19', qrVerified: true },
  { id: 'BRD-002', studentName: 'Rakesh Das', rollNumber: '2305200001', routeName: 'Route 1: Cuttack Badambadi Express', vehicleNumber: 'OD-02-AK-4411', stopName: 'Madhupatna Square', boardingStatus: 'Boarded', boardingTime: '07:27 AM', date: '2026-10-19', qrVerified: true },
  { id: 'BRD-003', studentName: 'Amit Nayak', rollNumber: '2305200002', routeName: 'Route 2: Rasulgarh - Master Canteen', vehicleNumber: 'OD-02-AK-4412', stopName: 'Master Canteen', boardingStatus: 'Not Boarded', boardingTime: '--:--', date: '2026-10-19', qrVerified: false },
  { id: 'BRD-004', studentName: 'Priya Patra', rollNumber: '2305200004', routeName: 'Route 3: Patia - Infocity - Khandagiri', vehicleNumber: 'OD-02-BL-8890', stopName: 'Patia Square', boardingStatus: 'Boarded', boardingTime: '07:28 AM', date: '2026-10-19', qrVerified: true },
  { id: 'BRD-005', studentName: 'Sourav Mohanty', rollNumber: '2305200005', routeName: 'Route 4: Jayadev Vihar - KIIT Square', vehicleNumber: 'OD-02-BL-8891', stopName: 'Jayadev Vihar', boardingStatus: 'Boarded', boardingTime: '07:22 AM', date: '2026-10-19', qrVerified: true },
  { id: 'BRD-006', studentName: 'Sneha Mohanty', rollNumber: '2305200006', routeName: 'Route 3: Patia - Infocity - Khandagiri', vehicleNumber: 'OD-02-BL-8890', stopName: 'Damana Square', boardingStatus: 'Boarded', boardingTime: '07:38 AM', date: '2026-10-19', qrVerified: true },
  { id: 'BRD-007', studentName: 'Deepak Pradhan', rollNumber: '2305200010', routeName: 'Route 5: Khordha Bypass', vehicleNumber: 'OD-02-CL-1209', stopName: 'Khordha New Bus Stand', boardingStatus: 'Absent', boardingTime: '--:--', date: '2026-10-19', qrVerified: false },
  { id: 'BRD-008', studentName: 'Subrat Jena', rollNumber: '2305200012', routeName: 'Route 2: Rasulgarh - Master Canteen', vehicleNumber: 'OD-02-AK-4412', stopName: 'Kalpana Square', boardingStatus: 'Boarded', boardingTime: '08:02 AM', date: '2026-10-19', qrVerified: true },
  { id: 'BRD-009', studentName: 'Ananya Mishra', rollNumber: '2305200008', routeName: 'Route 1: Cuttack Badambadi Express', vehicleNumber: 'OD-02-AK-4411', stopName: 'Phulnakhara Bridge', boardingStatus: 'Boarded', boardingTime: '07:48 AM', date: '2026-10-19', qrVerified: true },
  { id: 'BRD-010', studentName: 'Tanmay Tripathy', rollNumber: '2305200015', routeName: 'Route 4: Jayadev Vihar - KIIT Square', vehicleNumber: 'OD-02-BL-8891', stopName: 'Trisulia Bridge', boardingStatus: 'Not Boarded', boardingTime: '--:--', date: '2026-10-19', qrVerified: false }
];

export const mockVehicleMaintenance = [
  { id: 'MNT-VEH-101', busNumber: 'OD-02-CL-1209', fleetCode: 'Bus 05', lastServiceDate: '2026-06-12', nextServiceDue: '2026-10-15', odometerKm: 89400, category: 'Clutch & Transmission Overhaul', description: 'Gear slip during 3rd gear shift and heavy clutch pedal vibration.', serviceProvider: 'Tata Motors Authorized Workshop, Rasulgarh', cost: 18500, status: 'In Service', isOverdue: true },
  { id: 'MNT-VEH-102', busNumber: 'OD-02-AK-4411', fleetCode: 'Bus 01', lastServiceDate: '2026-08-20', nextServiceDue: '2026-11-20', odometerKm: 68420, category: 'Periodic 10,000 KM Service', description: 'Engine oil 15W-40 renewal, air filter clean, coolant top-up, brake pad check.', serviceProvider: 'Ashok Leyland Service Center, Mancheswar', cost: 12400, status: 'Scheduled', isOverdue: false },
  { id: 'MNT-VEH-103', busNumber: 'OD-02-BL-8890', fleetCode: 'Bus 03', lastServiceDate: '2026-09-05', nextServiceDue: '2026-12-05', odometerKm: 42100, category: 'CNG Kit Hydrostatic Pressure Test', description: 'Certified CNG cylinder pressure test and leak valve replacement.', serviceProvider: 'GAIL Authorized CNG Testing Center', cost: 6800, status: 'Completed', isOverdue: false },
  { id: 'MNT-VEH-104', busNumber: 'OD-02-AK-4412', fleetCode: 'Bus 02', lastServiceDate: '2026-07-15', nextServiceDue: '2026-10-28', odometerKm: 59310, category: 'Electrical & AC Airflow', description: 'AC cabin blower resistor replaced and passenger USB port wiring checked.', serviceProvider: 'Subham Auto Electricals, Cuttack Road', cost: 4200, status: 'Scheduled', isOverdue: false },
  { id: 'MNT-VEH-105', busNumber: 'OD-02-BL-8891', fleetCode: 'Bus 04', lastServiceDate: '2026-05-18', nextServiceDue: '2026-09-30', odometerKm: 73250, category: 'Front Suspension & Kingpin', description: 'Front leaf spring bushing replacement and wheel alignment.', serviceProvider: 'Sri Jagannath Wheel Alignment & Garage', cost: 9500, status: 'Completed', isOverdue: true }
];

export const mockFuelExpenses = [
  { id: 'FUL-2026-091', date: '2026-10-18', busNumber: 'OD-02-AK-4411', fleetCode: 'Bus 01', driverName: 'Ramesh Ch. Jena', fuelType: 'Diesel (BS-VI)', quantityLitres: 65, pricePerLitre: 94.80, totalCost: 6162, odometerKm: 68420, bunkName: 'Indian Oil COCO - Phulnakhara', receiptNo: 'IOCL-99812', status: 'Approved' },
  { id: 'FUL-2026-092', date: '2026-10-18', busNumber: 'OD-02-AK-4412', fleetCode: 'Bus 02', driverName: 'Bikash Mohanty', fuelType: 'Diesel (BS-VI)', quantityLitres: 58, pricePerLitre: 94.80, totalCost: 5498.40, odometerKm: 59310, bunkName: 'Bharat Petroleum - Vani Vihar', receiptNo: 'BPCL-44120', status: 'Approved' },
  { id: 'FUL-2026-093', date: '2026-10-17', busNumber: 'OD-02-BL-8890', fleetCode: 'Bus 03', driverName: 'Sanjay Kumar Rout', fuelType: 'CNG', quantityLitres: 34, pricePerLitre: 82.50, totalCost: 2805, odometerKm: 42100, bunkName: 'GAIL Gas Station - Patia', receiptNo: 'GAIL-77145', status: 'Approved' },
  { id: 'FUL-2026-094', date: '2026-10-17', busNumber: 'OD-02-BL-8891', fleetCode: 'Bus 04', driverName: 'Kailash Sahoo', fuelType: 'Diesel (BS-VI)', quantityLitres: 62, pricePerLitre: 94.80, totalCost: 5877.60, odometerKm: 73250, bunkName: 'Hindustan Petroleum - Jayadev Vihar', receiptNo: 'HPCL-30911', status: 'Pending Audit' },
  { id: 'FUL-2026-095', date: '2026-10-16', busNumber: 'OD-02-CL-1209', fleetCode: 'Bus 05', driverName: 'Purna Chandra Das', fuelType: 'Diesel (BS-VI)', quantityLitres: 45, pricePerLitre: 94.80, totalCost: 4266, odometerKm: 89400, bunkName: 'Indian Oil - Khordha Bypass', receiptNo: 'IOCL-11082', status: 'Approved' }
];

export const mockTransportFees = [
  { id: 'TFEE-101', studentName: 'BISHNU PRASAD SAHOO', rollNumber: '2401432265', routeName: 'Route 1: Cuttack Badambadi Express', semester: 'Semester 3', feeAmount: 16000, paidAmount: 16000, dues: 0, dueDate: '2026-08-30', status: 'Paid & Verified', receiptNo: 'TRN-REC-2026-4401', verified: true },
  { id: 'TFEE-102', studentName: 'Rakesh Das', rollNumber: '2305200001', routeName: 'Route 1: Cuttack Badambadi Express', semester: 'Semester 5', feeAmount: 16000, paidAmount: 16000, dues: 0, dueDate: '2026-08-30', status: 'Paid & Verified', receiptNo: 'TRN-REC-2026-4402', verified: true },
  { id: 'TFEE-103', studentName: 'Amit Nayak', rollNumber: '2305200002', routeName: 'Route 2: Rasulgarh - Master Canteen', semester: 'Semester 5', feeAmount: 14000, paidAmount: 8000, dues: 6000, dueDate: '2026-09-15', status: 'Partial Paid', receiptNo: 'TRN-REC-2026-4415', verified: true },
  { id: 'TFEE-104', studentName: 'Priya Patra', rollNumber: '2305200004', routeName: 'Route 3: Patia - Infocity - Khandagiri', semester: 'Semester 5', feeAmount: 15000, paidAmount: 15000, dues: 0, dueDate: '2026-08-30', status: 'Paid & Verified', receiptNo: 'TRN-REC-2026-4408', verified: true },
  { id: 'TFEE-105', studentName: 'Deepak Pradhan', rollNumber: '2305200010', routeName: 'Route 5: Khordha Bypass', semester: 'Semester 5', feeAmount: 12000, paidAmount: 0, dues: 12000, dueDate: '2026-09-30', status: 'Overdue', receiptNo: '--', verified: false }
];

export const mockVehicleCompliance = [
  { id: 'CMP-01', busNumber: 'OD-02-AK-4411', fleetCode: 'Bus 01', registrationDate: '2022-04-10', fitnessExpiry: '2027-04-15', insurancePolicy: 'UIIC-BUS-998812', insuranceExpiry: '2027-03-31', pucNumber: 'PUC-OD02-2026-01', pucExpiry: '2027-01-20', permitNumber: 'STA-OD-STAGE-4411', permitExpiry: '2028-05-10', roadTaxStatus: 'Paid (Annual)', status: 'Compliant', daysRemaining: 92 },
  { id: 'CMP-02', busNumber: 'OD-02-AK-4412', fleetCode: 'Bus 02', registrationDate: '2022-06-15', fitnessExpiry: '2027-06-20', insurancePolicy: 'OICL-COMM-77210', insuranceExpiry: '2027-06-15', pucNumber: 'PUC-OD02-2026-02', pucExpiry: '2027-02-28', permitNumber: 'STA-OD-STAGE-4412', permitExpiry: '2028-06-12', roadTaxStatus: 'Paid (Annual)', status: 'Compliant', daysRemaining: 131 },
  { id: 'CMP-03', busNumber: 'OD-02-BL-8890', fleetCode: 'Bus 03', registrationDate: '2023-02-14', fitnessExpiry: '2027-02-10', insurancePolicy: 'NICL-PASS-55441', insuranceExpiry: '2027-01-25', pucNumber: 'PUC-OD02-2026-03', pucExpiry: '2026-12-15', permitNumber: 'STA-OD-STAGE-8890', permitExpiry: '2028-02-28', roadTaxStatus: 'Paid (Annual)', status: 'Expiring Soon', daysRemaining: 26 },
  { id: 'CMP-04', busNumber: 'OD-02-BL-8891', fleetCode: 'Bus 04', registrationDate: '2023-08-22', fitnessExpiry: '2027-08-30', insurancePolicy: 'UIIC-BUS-11094', insuranceExpiry: '2027-08-15', pucNumber: 'PUC-OD02-2026-04', pucExpiry: '2027-03-10', permitNumber: 'STA-OD-STAGE-8891', permitExpiry: '2028-09-01', roadTaxStatus: 'Paid (Annual)', status: 'Compliant', daysRemaining: 141 },
  { id: 'CMP-05', busNumber: 'OD-02-CL-1209', fleetCode: 'Bus 05', registrationDate: '2021-11-20', fitnessExpiry: '2026-12-05', insurancePolicy: 'HDFC-COMM-8812', insuranceExpiry: '2026-11-20', pucNumber: 'PUC-OD02-2026-05', pucExpiry: '2026-11-15', permitNumber: 'STA-OD-STAGE-1209', permitExpiry: '2027-12-10', roadTaxStatus: 'Paid (Annual)', status: 'Expiring Soon', daysRemaining: 16 }
];

export const mockTransportComplaints = [
  { id: 'TCMP-201', studentName: 'Amit Nayak', rollNumber: '2305200002', routeName: 'Route 2: Rasulgarh - Master Canteen', busNumber: 'OD-02-AK-4412', category: 'Bus Delay & Timing', priority: 'Medium', title: 'Bus arrived 18 minutes late at Kalpana Square on Tuesday morning', description: 'Due to unscheduled diesel stop, bus reached Kalpana square at 8:18 AM instead of 8:00 AM, causing students to be late for 1st period lecture.', submittedDate: '2026-10-18', status: 'In Review', assignedStaff: 'Mr. Bikash Mohanty (Route Supervisor)', resolutionNotes: 'Driver instructed to refuel only on return evening trip.' },
  { id: 'TCMP-202', studentName: 'Priya Patra', rollNumber: '2305200004', routeName: 'Route 3: Patia - Infocity - Khandagiri', busNumber: 'OD-02-BL-8890', category: 'AC & Cabin Airflow', priority: 'Low', title: 'Rear AC duct grill rattling during highway speeds', description: 'Plastic vent grill at seat 38 vibrates loudly on Nandankanan road.', submittedDate: '2026-10-16', status: 'Resolved', assignedStaff: 'Mr. Purna Chandra Das (Workshop Lead)', resolutionNotes: 'Vibration foam dampener installed on vent duct on 17 Oct.' },
  { id: 'TCMP-203', studentName: 'Sourav Mohanty', rollNumber: '2305200005', routeName: 'Route 4: Jayadev Vihar - KIIT Square', busNumber: 'OD-02-BL-8891', category: 'Driving Conduct & Speed', priority: 'High', title: 'Abrupt braking near Trisulia toll plaza', description: 'Sudden braking caused standing students to stumble.', submittedDate: '2026-10-15', status: 'Resolved', assignedStaff: 'Chief Transport Officer', resolutionNotes: 'Speed telemetry checked: maximum speed was 52 km/h. Driver cautioned regarding progressive braking.' }
];

export const mockAccidentIncidents = [
  { id: 'INC-TRN-001', referenceNo: 'BPUT/TRN/2026/INC-04', busNumber: 'OD-02-AK-4411', routeName: 'Route 1: Cuttack Badambadi Express', driverName: 'Ramesh Ch. Jena', date: '2026-10-12', time: '07:50 AM', location: 'Phulnakhara NH-16 Overbridge', category: 'Minor Road Hazard (Flat Tyre)', severity: 'Low', description: 'Rear left dual tyre experienced valve puncture from iron debris on highway. Driver guided vehicle safely onto service shoulder.', immediateResponse: 'Relief spare wheel installed in 14 minutes by driver and helper. Route resumed safely with 16-min delay.', emergencyAssistance: 'Not Required (No Injury)', responsibleOfficial: 'Mr. S. K. Behera (Transport Administrator)', investigationStatus: 'Closed', followUpAction: 'Tyre replaced with new Apollo Endurace radial.' },
  { id: 'INC-TRN-002', referenceNo: 'BPUT/TRN/2026/INC-02', busNumber: 'OD-02-CL-1209', routeName: 'Route 5: Khordha Bypass', driverName: 'Purna Chandra Das', date: '2026-09-18', time: '08:05 AM', location: 'Jatni Rail Gate Crossing', category: 'Traffic Obstruction / Level Crossing Delay', severity: 'Low', description: 'Goods freight train breakdown stalled railway gate for 45 minutes.', immediateResponse: 'Warden alerted of late student arrival. All 28 boarders granted excused attendance for 1st hour.', emergencyAssistance: 'Railway Police & Station Master Coordinated', responsibleOfficial: 'Mr. S. K. Behera', investigationStatus: 'Closed', followUpAction: 'Alternate diversion route via Retang overbridge mapped for contingencies.' }
];

export const mockParkingAssignments = [
  { id: 'PRK-01', bayNumber: 'Bay 01 (North Terminal)', busNumber: 'OD-02-AK-4411', fleetCode: 'Bus 01', type: '52-Seater AC Coach', status: 'Occupied', assignedDriver: 'Ramesh Ch. Jena', assignedDate: '2026-07-01', plugInCharging: false },
  { id: 'PRK-02', bayNumber: 'Bay 02 (North Terminal)', busNumber: 'OD-02-AK-4412', fleetCode: 'Bus 02', type: '52-Seater Coach', status: 'Occupied', assignedDriver: 'Bikash Mohanty', assignedDate: '2026-07-01', plugInCharging: false },
  { id: 'PRK-03', bayNumber: 'Bay 03 (Central Depot)', busNumber: 'OD-02-BL-8890', fleetCode: 'Bus 03', type: '42-Seater Coach (CNG)', status: 'Occupied', assignedDriver: 'Sanjay Kumar Rout', assignedDate: '2026-07-01', plugInCharging: false },
  { id: 'PRK-04', bayNumber: 'Bay 04 (Central Depot)', busNumber: 'OD-02-BL-8891', fleetCode: 'Bus 04', type: '52-Seater Coach', status: 'Occupied', assignedDriver: 'Kailash Sahoo', assignedDate: '2026-07-01', plugInCharging: false },
  { id: 'PRK-05', bayNumber: 'Workshop Service Bay 1', busNumber: 'OD-02-CL-1209', fleetCode: 'Bus 05', type: '32-Seater Mini Coach', status: 'Maintenance Pit', assignedDriver: 'Purna Chandra Das', assignedDate: '2026-10-14', plugInCharging: false },
  { id: 'PRK-06', bayNumber: 'Bay 06 (Visitor & Charter)', busNumber: '--', fleetCode: 'Vacant', type: 'Heavy Commercial Slot', status: 'Available', assignedDriver: 'Unassigned', assignedDate: '--', plugInCharging: false }
];

export const mockStaffAttendance = [
  { id: 'TSTF-01', name: 'Ramesh Ch. Jena', designation: 'Senior Bus Driver', licenseCategory: 'HMV', assignedBus: 'OD-02-AK-4411 (Bus 01)', shift: 'Morning & Evening (06:30 AM - 06:30 PM)', status: 'Present On Duty', checkInTime: '06:15 AM', availability: 'On Route' },
  { id: 'TSTF-02', name: 'Bikash Mohanty', designation: 'Senior Bus Driver', licenseCategory: 'HMV', assignedBus: 'OD-02-AK-4412 (Bus 02)', shift: 'Morning & Evening (06:30 AM - 06:30 PM)', status: 'Present On Duty', checkInTime: '06:20 AM', availability: 'On Route' },
  { id: 'TSTF-03', name: 'Sanjay Kumar Rout', designation: 'Bus Driver', licenseCategory: 'HMV', assignedBus: 'OD-02-BL-8890 (Bus 03)', shift: 'Morning & Evening (06:30 AM - 06:30 PM)', status: 'Present On Duty', checkInTime: '06:25 AM', availability: 'On Route' },
  { id: 'TSTF-04', name: 'Kailash Sahoo', designation: 'Bus Driver', licenseCategory: 'HMV', assignedBus: 'OD-02-BL-8891 (Bus 04)', shift: 'Morning & Evening (06:30 AM - 06:30 PM)', status: 'Present On Duty', checkInTime: '06:18 AM', availability: 'On Route' },
  { id: 'TSTF-05', name: 'Purna Chandra Das', designation: 'Relief & Workshop Driver', licenseCategory: 'HMV', assignedBus: 'OD-02-CL-1209 (Bus 05)', shift: 'General Workshop Shift (08:00 AM - 05:00 PM)', status: 'Present On Duty', checkInTime: '07:50 AM', availability: 'Workshop Standby' },
  { id: 'TSTF-06', name: 'Manoranjan Swain', designation: 'Relief Bus Driver', licenseCategory: 'HMV', assignedBus: 'Float / Reserve', shift: 'On Call Emergency Relief', status: 'On Authorized Leave', checkInTime: '--:--', availability: 'Casual Leave' }
];

export const mockTransportNotifications = [
  { id: 'NOTIF-TRN-01', title: 'Dense Morning Fog Advisory & Cautionary Speed Ceiling', targetGroup: 'All Drivers & Commuters', category: 'Safety Alert', publishDate: '2026-10-18', expiryDate: '2026-11-01', priority: 'Urgent', status: 'Published', content: 'Due to seasonal dense fog on Cuttack-Bhubaneswar highway (NH-16), all college buses must operate low-beam yellow fog lamps. Speed ceiling strictly reduced to 45 km/h until 08:00 AM.', author: 'Office of Transport Administrator' },
  { id: 'NOTIF-TRN-02', title: 'Route 2 Temporary Diversion due to Flyover Construction', targetGroup: 'Route 2 Pass Holders', category: 'Route Change', publishDate: '2026-10-15', expiryDate: '2026-10-30', priority: 'Important', status: 'Published', content: 'Due to flyover girder placement at Rasulgarh Square, Bus 02 will take Mancheswar link road. Expected travel time +8 minutes. Stop remains at Rasulgarh service lane.', author: 'Fleet Operations Desk' },
  { id: 'NOTIF-TRN-03', title: 'Diwali Festive Campus Break Transport Schedule', targetGroup: 'All Students & Staff', category: 'Holiday Schedule', publishDate: '2026-10-12', expiryDate: '2026-11-04', priority: 'General', status: 'Published', content: 'College buses will not ply from 29 Oct to 02 Nov. Special outbound shuttle service to Bhubaneswar Railway Station & Baramunda Bus Stand on 28 Oct afternoon.', author: 'Transport Administration' }
];

export const mockTransportRequests = [
  { id: 'REQ-TRN-301', type: 'Route Change', studentName: 'BISHNU PRASAD SAHOO', rollNumber: '2401432265', currentRoute: 'Route 1: Cuttack Badambadi Express', requestedRoute: 'Route 2: Rasulgarh - Master Canteen', requestedStop: 'Vani Vihar Square', reason: 'Shifted residence from Cuttack to Vani Vihar Bhubaneswar', requestDate: '2026-10-18', status: 'Pending Review', reviewNotes: 'Awaiting seat availability check on Bus 02.' },
  { id: 'REQ-TRN-302', type: 'New Stop Addition', studentName: 'Priya Patra', rollNumber: '2305200004', currentRoute: 'Route 3: Patia - Infocity - Khandagiri', requestedRoute: 'Route 3', requestedStop: 'KIIT Square Metro Pillar 42', reason: 'Walking distance to current stop is 1.8km, requested intermediate boarding point', requestDate: '2026-10-16', status: 'Approved', reviewNotes: 'Approved as 2-minute designated boarding halt.' },
  { id: 'REQ-TRN-303', type: 'Bus Pass Cancellation', studentName: 'Subrat Jena', rollNumber: '2305200012', currentRoute: 'Route 2: Rasulgarh - Master Canteen', requestedRoute: 'None', requestedStop: 'None', reason: 'Relocated into College Hostel (Gandhi Boys Residence)', requestDate: '2026-10-10', status: 'Approved & Refund Cleared', reviewNotes: 'Pro-rata refund clearance issued to Accounts.' }
];

export const mockSafetyInspections = [
  { id: 'INSP-SAF-01', busNumber: 'OD-02-AK-4411', fleetCode: 'Bus 01', inspectionDate: '2026-10-15', inspector: 'Mr. S. K. Behera (Transport Head) & MVI Official', score: '98%', status: 'Compliant & Certified', checklist: { speedGovernor: 'Calibrated at 60 km/h', fireExtinguisher: 'Valid (2 x 4kg ABC Cylinders)', firstAidKit: 'Full Stock Refilled', emergencyExit: 'Latch Functional & Unblocked', tyreTreadDepth: '4.8mm (Good Condition)' }, findings: 'All emergency equipment certified in prime condition.', followUpDate: '2026-11-15' },
  { id: 'INSP-SAF-02', busNumber: 'OD-02-BL-8890', fleetCode: 'Bus 03', inspectionDate: '2026-10-12', inspector: 'Mr. Purna Chandra Das (Mechanical Supervisor)', score: '94%', status: 'Compliant', checklist: { speedGovernor: 'Calibrated at 60 km/h', fireExtinguisher: 'Valid (Pressure Green)', firstAidKit: 'Antiseptic & Bandages Restocked', emergencyExit: 'Door Handle Greased', tyreTreadDepth: '4.2mm' }, findings: 'First aid burn cream tube replaced.', followUpDate: '2026-11-12' },
  { id: 'INSP-SAF-03', busNumber: 'OD-02-CL-1209', fleetCode: 'Bus 05', inspectionDate: '2026-09-28', inspector: 'Mr. S. K. Behera', score: '88%', status: 'Action Required', checklist: { speedGovernor: 'Calibrated', fireExtinguisher: 'Gauge Borderline Yellow', firstAidKit: 'Needs Restock', emergencyExit: 'Functional', tyreTreadDepth: '3.6mm' }, findings: 'Cylinder recharged. Replaced wiper blades before monsoon.', followUpDate: '2026-10-28' }
];

export const mockScheduleCalendar = [
  { id: 'SCH-01', title: 'Regular Morning Academic Transit (All 5 Routes)', category: 'Regular Fleet Run', time: '07:15 AM - 08:35 AM', routesActive: 'Routes 1, 2, 3, 4, 5', busesDeployed: 5, studentsTransported: 212, frequency: 'Daily (Mon - Sat)' },
  { id: 'SCH-02', title: 'Regular Evening Return Transit', category: 'Regular Fleet Run', time: '05:00 PM - 06:45 PM', routesActive: 'Routes 1, 2, 3, 4, 5', busesDeployed: 5, studentsTransported: 212, frequency: 'Daily (Mon - Sat)' },
  { id: 'SCH-03', title: 'TCS & Infosys Campus Placement Shuttle Service', category: 'Special Event Transit', time: '09:00 PM - 11:30 PM', routesActive: 'Special Campus → Infocity / Master Canteen', busesDeployed: 2, studentsTransported: 64, frequency: 'Thursday 22 Oct 2026' },
  { id: 'SCH-04', title: 'Mechanical Dept Industrial Visit to Paradeep Port', category: 'Academic Field Trip', time: '06:00 AM - 08:00 PM', routesActive: 'Campus → Paradeep Port Industrial Complex', busesDeployed: 1, studentsTransported: 52, frequency: 'Saturday 24 Oct 2026' }
];

export const mockInventorySpareParts = [
  { id: 'SPR-01', name: 'Radial Tubeless Bus Tyre (295/80R22.5)', category: 'Tyres & Wheels', inStock: 6, minStock: 2, condition: 'New Sealed', location: 'Tyre Rack Bay 3', unitCost: 18500, supplier: 'Apollo Tyres Commercial Hub, Cuttack' },
  { id: 'SPR-02', name: 'Heavy Duty Asbestos-Free Brake Shoe Kit', category: 'Braking System', inStock: 4, minStock: 2, condition: 'New', location: 'Bin A-14', unitCost: 3800, supplier: 'Rane Brake Linings Distributor' },
  { id: 'SPR-03', name: 'Castrol CRB Turbomax 15W-40 Diesel Oil (20L Drum)', category: 'Lubricants & Fluids', inStock: 5, minStock: 2, condition: 'Sealed Drum', location: 'Oil Store', unitCost: 6400, supplier: 'Castrol India Commercial Depot' },
  { id: 'SPR-04', name: 'Ceasefire 4kg ABC Dry Chemical Fire Extinguisher', category: 'Safety Equipment', inStock: 3, minStock: 2, condition: 'Certified', location: 'Safety Cabinet 1', unitCost: 2800, supplier: 'Ceasefire Industries Ltd' },
  { id: 'SPR-05', name: 'Amaron Pro Commercial 12V 150Ah Bus Battery', category: 'Electrical', inStock: 1, minStock: 2, condition: 'Charged Ready', location: 'Battery Room', unitCost: 11200, supplier: 'Amaron Power Systems, Mancheswar', alertLowStock: true }
];

export const mockTransportPolicies = [
  {
    category: 'Student Commuter & Boarding Code',
    items: [
      { title: 'Mandatory RFID / QR Bus Pass Verification', description: 'Every student must tap RFID Smart Bus Pass or present digital QR pass on mobile before stepping inside the vehicle.' },
      { title: 'Designated Stoppage Punctuality', description: 'Buses will not halt at unauthorized intersections. Students must arrive at designated bus stop 5 minutes prior to scheduled departure.' },
      { title: 'Anti-Harassment & Zero-Tolerance Ragging', description: 'Misbehavior, teasing, or abusive language aboard campus buses results in immediate bus pass revocation and disciplinary referral.' }
    ]
  },
  {
    category: 'Fleet Safety & Driver Speed Governance',
    items: [
      { title: 'Mandatory 60 KM/H Speed Ceiling', description: 'All university buses are electronically governed with AIS-140 GPS speed governors locked at 60 km/h.' },
      { title: 'Zero Distraction & Mobile Phone Prohibition', description: 'Drivers are strictly prohibited from answering mobile phones while the bus is in motion. Hands-free earpieces are also forbidden.' },
      { title: 'Mandatory Pre-Trip Walkaround Audit', description: 'Drivers must inspect tyre pressure, wiper blades, emergency door locks, and indicator lights every morning before departure.' }
    ]
  },
  {
    category: 'Fare, Pass Allocation & Refund Rules',
    items: [
      { title: 'Semester Transport Tariff', description: 'Bus pass fees are assessed per semester and must be cleared prior to ID pass issuance.' },
      { title: 'Pro-Rata Refund on Hostel Conversion', description: 'Students shifting into college hostels can apply for pro-rata transport fee adjustments within 30 days of semester commencement.' }
    ]
  }
];
