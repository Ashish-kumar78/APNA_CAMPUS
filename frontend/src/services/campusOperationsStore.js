// Campus Operations Enterprise Store & Service Layer
// Serves Campus Operations: Maintenance, Security, Housekeeping, Canteen, Facilities, Inventory, and Field Crews

const STORAGE_KEY = 'apna_campus_operations_v1';

export const INITIAL_STAFF_CATEGORIES = [
  'Electrician',
  'Plumber',
  'Mechanic',
  'Security Guard',
  'Canteen Staff',
  'Housekeeping Staff',
  'Floor Manager',
  'Gardener',
  'Carpenter',
  'HVAC Technician',
  'Lift Operator or Technician',
  'Campus Supervisor',
  'Storekeeper',
  'Waste Management Staff',
  'Other Support Staff'
];

export const INITIAL_STAFF_DIRECTORY = [
  {
    id: 'STF-OPS-101',
    name: 'Mr. Ramesh Chandra Parida',
    avatar: '/passport_photo_male.svg',
    designation: 'Chief Campus Operations Officer',
    category: 'Campus Supervisor',
    team: 'Operations Directorate',
    department: 'Estate Maintenance & Campus Operations',
    assignedBuilding: 'All Campus Sectors',
    assignedFloor: 'Central Facility Command',
    phone: '+91 94370 00140',
    email: 'operations@apnacampus.edu.in',
    shift: 'General (09:00 - 17:00)',
    status: 'On Duty',
    joiningDate: '12 Sep 2016',
    experience: '17+ Years Facilities Administration',
  },
  {
    id: 'STF-OPS-102',
    name: 'Mr. Pramod Kumar Panda',
    avatar: '/passport_photo_male.svg',
    designation: 'Senior High-Voltage Electrician',
    category: 'Electrician',
    team: 'Electrical & Power Works',
    department: 'Substation & Grid Operations',
    assignedBuilding: 'Block B & Tech Tower',
    assignedFloor: 'Basement Substation & Floors 1-4',
    phone: '+91 94371 10201',
    email: 'p.panda@apnacampus.edu.in',
    shift: 'Morning (06:00 - 14:00)',
    status: 'On Duty',
    joiningDate: '15 Mar 2018',
    experience: '11 Years Industrial Electrician',
  },
  {
    id: 'STF-OPS-103',
    name: 'Mr. Suresh Mohapatra',
    avatar: '/passport_photo_male.svg',
    designation: 'Lead Water Systems Plumber',
    category: 'Plumber',
    team: 'Plumbing & Hydraulic Grid',
    department: 'Sanitation & Water Infrastructure',
    assignedBuilding: 'Hostel Complex & Academic A',
    assignedFloor: 'Rooftop Water Tanks & All Floors',
    phone: '+91 94371 10202',
    email: 's.mohapatra@apnacampus.edu.in',
    shift: 'General (09:00 - 17:00)',
    status: 'On Duty',
    joiningDate: '20 Jul 2017',
    experience: '14 Years Commercial Plumbing',
  },
  {
    id: 'STF-OPS-104',
    name: 'Mr. Bipin Bihari Das',
    avatar: '/passport_photo_male.svg',
    designation: 'Heavy Equipment & Generator Mechanic',
    category: 'Mechanic',
    team: 'Mechanical & Power Backup',
    department: 'Central Utility & Workshop',
    assignedBuilding: 'Utility Yard & Generator Shed',
    assignedFloor: 'Ground Level DG Sets 1-4',
    phone: '+91 94371 10203',
    email: 'b.das@apnacampus.edu.in',
    shift: 'Morning (06:00 - 14:00)',
    status: 'On Duty',
    joiningDate: '05 Jan 2019',
    experience: '12 Years Diesel Generator Specialist',
  },
  {
    id: 'STF-OPS-105',
    name: 'Mr. Maheswar Nayak',
    avatar: '/passport_photo_male.svg',
    designation: 'Head Security Officer (Gate 1)',
    category: 'Security Guard',
    team: 'Perimeter & Gate Security',
    department: 'Campus Security Directorate',
    assignedBuilding: 'Main Gate 1 & Visitor Lounge',
    assignedFloor: 'Entry Boom Barriers',
    phone: '+91 94371 10204',
    email: 'security.gate1@apnacampus.edu.in',
    shift: 'Morning (06:00 - 14:00)',
    status: 'On Duty',
    joiningDate: '10 Feb 2017',
    experience: 'Ex-Defence Veteran / 9 Yrs Security',
  },
  {
    id: 'STF-OPS-106',
    name: 'Mrs. Minati Senapati',
    avatar: '/passport_photo_female.svg',
    designation: 'Head Housekeeping Lead',
    category: 'Housekeeping Staff',
    team: 'Sanitation & Hygiene Squad',
    department: 'Campus Hygiene & Waste Control',
    assignedBuilding: 'Academic Block A & B',
    assignedFloor: 'Floors 1 & 2 Corridor / Washrooms',
    phone: '+91 94371 10205',
    email: 'm.senapati@apnacampus.edu.in',
    shift: 'Morning (06:00 - 14:00)',
    status: 'On Duty',
    joiningDate: '18 Aug 2018',
    experience: '8 Years Institutional Housekeeping',
  },
  {
    id: 'STF-OPS-107',
    name: 'Mr. Kailash Chandra Sahoo',
    avatar: '/passport_photo_male.svg',
    designation: 'Central Canteen Operations Supervisor',
    category: 'Canteen Staff',
    team: 'Dining & Kitchen Operations',
    department: 'Hospitality & Food Safety',
    assignedBuilding: 'Central Dining & Food Court',
    assignedFloor: 'Kitchen Annex & Main Dining Hall',
    phone: '+91 94371 10206',
    email: 'canteen.supervisor@apnacampus.edu.in',
    shift: 'Morning (06:00 - 14:00)',
    status: 'On Duty',
    joiningDate: '01 Nov 2019',
    experience: '10 Years Commercial Food Service',
  },
  {
    id: 'STF-OPS-108',
    name: 'Mr. Ashok Kumar Rout',
    avatar: '/passport_photo_male.svg',
    designation: 'Academic Floor Manager (Block B)',
    category: 'Floor Manager',
    team: 'Facilities Floor Supervision',
    department: 'Academic Infrastructure Desk',
    assignedBuilding: 'Academic Block B (Computing)',
    assignedFloor: 'Floors 2 & 3 (Rooms 201-212)',
    phone: '+91 94371 10207',
    email: 'floor.blockb@apnacampus.edu.in',
    shift: 'General (09:00 - 17:00)',
    status: 'On Duty',
    joiningDate: '14 May 2019',
    experience: '7 Years Facility Operations',
  },
  {
    id: 'STF-OPS-109',
    name: 'Mr. Bhaskar Pradhan',
    avatar: '/passport_photo_male.svg',
    designation: 'Campus Head Landscape Gardener',
    category: 'Gardener',
    team: 'Horticulture & Greenery',
    department: 'Campus Beautification Division',
    assignedBuilding: 'Central Lawn & Botanical Park',
    assignedFloor: 'Outdoor Grounds & Quadrangle',
    phone: '+91 94371 10208',
    email: 'horticulture@apnacampus.edu.in',
    shift: 'Morning (06:00 - 14:00)',
    status: 'On Duty',
    joiningDate: '11 Jun 2016',
    experience: '16 Years Horticulture',
  },
  {
    id: 'STF-OPS-110',
    name: 'Mr. Jagabandhu Nayak',
    avatar: '/passport_photo_male.svg',
    designation: 'Master Furniture & Woodwork Carpenter',
    category: 'Carpenter',
    team: 'Civil & Woodwork Repairs',
    department: 'Carpentry & Estate Repairs',
    assignedBuilding: 'Central Workshop & Classrooms',
    assignedFloor: 'All Academic Blocks',
    phone: '+91 94371 10209',
    email: 'j.nayak@apnacampus.edu.in',
    shift: 'General (09:00 - 17:00)',
    status: 'On Duty',
    joiningDate: '23 Mar 2017',
    experience: '15 Years Master Carpenter',
  },
  {
    id: 'STF-OPS-111',
    name: 'Mr. Rajesh Kumar Moharana',
    avatar: '/passport_photo_male.svg',
    designation: 'Central Chiller & HVAC Technician',
    category: 'HVAC Technician',
    team: 'Climate Control & HVAC',
    department: 'Mechanical Utility',
    assignedBuilding: 'Library & Central Server Room',
    assignedFloor: 'Rooftop Chillers & Precision AC',
    phone: '+91 94371 10210',
    email: 'hvac@apnacampus.edu.in',
    shift: 'General (09:00 - 17:00)',
    status: 'On Duty',
    joiningDate: '09 Oct 2020',
    experience: '8 Years HVAC Certification',
  },
  {
    id: 'STF-OPS-112',
    name: 'Mr. Debendra Behera',
    avatar: '/passport_photo_male.svg',
    designation: 'Elevator & Lift Operations Inspector',
    category: 'Lift Operator or Technician',
    team: 'Vertical Transit & Lifts',
    department: 'Estate Safety Directorate',
    assignedBuilding: 'Tech Tower & Administrative Block',
    assignedFloor: 'Lifts L1, L2, L3 & Service Elevators',
    phone: '+91 94371 10211',
    email: 'lifts.safety@apnacampus.edu.in',
    shift: 'Morning (06:00 - 14:00)',
    status: 'On Duty',
    joiningDate: '17 Feb 2021',
    experience: '6 Years OTIS / Schindler Certified',
  },
  {
    id: 'STF-OPS-113',
    name: 'Mr. Nabin Chandra Sahoo',
    avatar: '/passport_photo_male.svg',
    designation: 'Central Stores Inventory Controller',
    category: 'Storekeeper',
    team: 'Central Inventory & Material Vault',
    department: 'Estate Logistics & Procurement',
    assignedBuilding: 'Central Storehouse',
    assignedFloor: 'Ground Floor Bays A-D',
    phone: '+91 94371 10212',
    email: 'centralstore@apnacampus.edu.in',
    shift: 'General (09:00 - 17:00)',
    status: 'On Duty',
    joiningDate: '04 Jul 2018',
    experience: '9 Years Material Management',
  },
  {
    id: 'STF-OPS-114',
    name: 'Mr. Dhiren Patra',
    avatar: '/passport_photo_male.svg',
    designation: 'Solid Waste & Recycling In-Charge',
    category: 'Waste Management Staff',
    team: 'Eco-Campus Waste Segregation',
    department: 'Green Campus Initiative',
    assignedBuilding: 'Compost Plant & Recycling Yard',
    assignedFloor: 'Campus Perimeter Waste Stations',
    phone: '+91 94371 10213',
    email: 'waste.mgmt@apnacampus.edu.in',
    shift: 'Morning (06:00 - 14:00)',
    status: 'On Duty',
    joiningDate: '19 Jan 2022',
    experience: '5 Years Environmental Sanitation',
  },
  {
    id: 'STF-OPS-115',
    name: 'Mr. Manoj Kumar Samal',
    avatar: '/passport_photo_male.svg',
    designation: 'General Operations Field Assistant',
    category: 'Other Support Staff',
    team: 'Rapid Response Utility Crew',
    department: 'Estate Emergency Service',
    assignedBuilding: 'All Campus Sectors',
    assignedFloor: 'On-Call Dispatched',
    phone: '+91 94371 10214',
    email: 'm.samal@apnacampus.edu.in',
    shift: 'Evening (14:00 - 22:00)',
    status: 'On Duty',
    joiningDate: '15 Aug 2022',
    experience: '4 Years Facility Assistance',
  }
];

export const INITIAL_TASKS = [
  {
    id: 'WO-2026-8801',
    title: 'Replace burnt 63A MCB switch in Substation 2 panel',
    description: 'Phase 2 feeder breaker tripped twice under laboratory peak air conditioning load. Requires 63A 4-Pole Schneider MCB replacement and busbar torque check.',
    category: 'Electrician',
    location: 'Electrical Substation 2 · Tech Tower Basement',
    priority: 'Critical',
    assignedStaffId: 'STF-OPS-102',
    assignedStaffName: 'Mr. Pramod Kumar Panda',
    assignedTeam: 'Electrical & Power Works',
    createdDate: '2026-10-22',
    dueDate: '2026-10-22',
    status: 'In Progress',
    completionNotes: 'Faulty breaker unmounted. New 63A MCB collected from store. Testing insulation resistance.',
    requiredMaterials: '63A 4P MCB (1 Unit), Insulated Terminal Lugs (8 Nos), Cable Ties',
    supervisorReviewStatus: 'Pending Verification',
  },
  {
    id: 'WO-2026-8802',
    title: 'Repair high-pressure water pipe leakage behind Room 104',
    description: '1.5 inch CPVC main distribution pipe joint is leaking near the external duct. Water pooling near pedestrian walkway.',
    category: 'Plumber',
    location: 'Academic Block A · External Service Duct',
    priority: 'High',
    assignedStaffId: 'STF-OPS-103',
    assignedStaffName: 'Mr. Suresh Mohapatra',
    assignedTeam: 'Plumbing & Hydraulic Grid',
    createdDate: '2026-10-22',
    dueDate: '2026-10-23',
    status: 'Accepted',
    completionNotes: 'Water main isolated via valve V-4. Preparing CPVC solvent cement and replacement coupler.',
    requiredMaterials: '1.5-inch CPVC Coupler (2 Nos), Solvent Cement (100ml), Teflon Tape',
    supervisorReviewStatus: 'Approved for Action',
  },
  {
    id: 'WO-2026-8803',
    title: 'Emergency Generator DG-2 250-hour oil and filter overhaul',
    description: 'Scheduled preventive 250-hour servicing for Kirloskar 320kVA backup generator. Replace engine oil, oil filter, primary fuel filter and clean radiator fins.',
    category: 'Mechanic',
    location: 'Utility Yard DG Shed · Generator Set 2',
    priority: 'High',
    assignedStaffId: 'STF-OPS-104',
    assignedStaffName: 'Mr. Bipin Bihari Das',
    assignedTeam: 'Mechanical & Power Backup',
    createdDate: '2026-10-21',
    dueDate: '2026-10-23',
    status: 'In Progress',
    completionNotes: 'Used oil drained. Radiator coolant checked at 45% concentration. New filter mounted.',
    requiredMaterials: '15W40 Engine Oil (28 Litres), Spin-on Lube Filter (1 Pc), Fuel Filter (2 Pcs)',
    supervisorReviewStatus: 'In Review',
  },
  {
    id: 'WO-2026-8804',
    title: 'Gate 1 Visitor RFID badge scanner calibration & boom barrier test',
    description: 'Calibrate optical sensors on the automatic vehicle exit barrier and inspect loop detector sensitivity. Refresh visitor log terminal.',
    category: 'Security Guard',
    location: 'Main Gate 1 · Security Command Cabin',
    priority: 'Medium',
    assignedStaffId: 'STF-OPS-105',
    assignedStaffName: 'Mr. Maheswar Nayak',
    assignedTeam: 'Perimeter & Gate Security',
    createdDate: '2026-10-22',
    dueDate: '2026-10-22',
    status: 'Completed',
    completionNotes: 'Optical reflectors cleaned and aligned. Boom barrier response time verified at 2.4 seconds. Scanner operational.',
    requiredMaterials: 'Microfibre cloth, Contact cleaner spray, Hex key set',
    supervisorReviewStatus: 'Verified',
  },
  {
    id: 'WO-2026-8805',
    title: 'Disinfect and deep-clean Academic Block B 2nd Floor washrooms',
    description: 'Deep sanitary scrub, descaling of ceramic urinals, replenishment of handwash liquid, fragrance dispensers, and dry-mop of corridor tiles.',
    category: 'Housekeeping Staff',
    location: 'Academic Block B · 2nd Floor (Gents & Ladies)',
    priority: 'High',
    assignedStaffId: 'STF-OPS-106',
    assignedStaffName: 'Mrs. Minati Senapati',
    assignedTeam: 'Sanitation & Hygiene Squad',
    createdDate: '2026-10-22',
    dueDate: '2026-10-22',
    status: 'In Progress',
    completionNotes: 'Descaling completed. Floor disinfectant applied. Sanitizer dispensers refilled.',
    requiredMaterials: 'Taski R1/R6 Chemicals (2L), Microfiber mops, Liquid soap refill (5L)',
    supervisorReviewStatus: 'Pending Verification',
  },
  {
    id: 'WO-2026-8806',
    title: 'Canteen Kitchen Bain-Marie heating element temperature inspection',
    description: 'Verify thermostat calibration of electric Bain-Marie hot food stations (Must hold above 65°C for food safety standards). Check steam exhaust hood ducting.',
    category: 'Canteen Staff',
    location: 'Central Food Court · Commercial Kitchen Line',
    priority: 'High',
    assignedStaffId: 'STF-OPS-107',
    assignedStaffName: 'Mr. Kailash Chandra Sahoo',
    assignedTeam: 'Dining & Kitchen Operations',
    createdDate: '2026-10-22',
    dueDate: '2026-10-22',
    status: 'Completed',
    completionNotes: 'Digital probe registered 72°C across all 4 wells. Grease filters washed and re-seated.',
    requiredMaterials: 'Digital Infrared Thermometer, Food-grade degreaser',
    supervisorReviewStatus: 'Verified',
  },
  {
    id: 'WO-2026-8807',
    title: 'Fix loose student bench brackets in Seminar Hall 204',
    description: 'Inspect 18 wooden study desks in lecture hall 204. Tighten loose heavy-duty steel bolts and re-glue cracked front modesty panel.',
    category: 'Carpenter',
    location: 'Academic Block A · Seminar Room 204',
    priority: 'Medium',
    assignedStaffId: 'STF-OPS-110',
    assignedStaffName: 'Mr. Jagabandhu Nayak',
    assignedTeam: 'Civil & Woodwork Repairs',
    createdDate: '2026-10-21',
    dueDate: '2026-10-24',
    status: 'Accepted',
    completionNotes: 'Inspected benches. Identified 6 desks requiring M8 carriage bolts and wood adhesive.',
    requiredMaterials: 'M8 Carriage Bolts (12 Nos), Fevicol Marine (500g), Rubber Foot Caps',
    supervisorReviewStatus: 'Approved for Action',
  },
  {
    id: 'WO-2026-8808',
    title: 'Central Server Room precision AC Unit 1 refrigerant gas top-up',
    description: 'Chilled air supply temperature drifting from 19°C setpoint to 23°C. Test high/low pressure gauges, detect micro-leak and charge R410A refrigerant.',
    category: 'HVAC Technician',
    location: 'Tech Tower · Central Data Center Room 004',
    priority: 'Critical',
    assignedStaffId: 'STF-OPS-111',
    assignedStaffName: 'Mr. Rajesh Kumar Moharana',
    assignedTeam: 'Climate Control & HVAC',
    createdDate: '2026-10-22',
    dueDate: '2026-10-22',
    status: 'In Progress',
    completionNotes: 'Flare nut leak sealed. Vacuum pulled down to 400 microns. Charging 1.8 kg R410A.',
    requiredMaterials: 'R410A Refrigerant (2kg), Flare copper nut, Vacuum pump oil',
    supervisorReviewStatus: 'Pending Verification',
  },
  {
    id: 'WO-2026-8809',
    title: 'Quarterly safety brake & governor test on Passenger Lift L-2',
    description: 'Mandatory statutory safety inspection for 13-passenger elevator. Perform car buffer test, overspeed governor engagement, and door interlock check.',
    category: 'Lift Operator or Technician',
    location: 'Academic Block B · Passenger Lift L-2',
    priority: 'High',
    assignedStaffId: 'STF-OPS-112',
    assignedStaffName: 'Mr. Debendra Behera',
    assignedTeam: 'Vertical Transit & Lifts',
    createdDate: '2026-10-20',
    dueDate: '2026-10-23',
    status: 'Completed',
    completionNotes: 'All safety interlocks tested with zero faults. Annual statutory log signed.',
    requiredMaterials: 'Tachometer, Door tension gauge, Lift machine oil (ISO VG 220)',
    supervisorReviewStatus: 'Verified',
  },
  {
    id: 'WO-2026-8810',
    title: 'Trim overgrown eucalyptus branches near 11kV overhead power lines',
    description: 'High branches swaying within 1.2 meters of the primary 11kV campus feeder line near Gate 3. Requires hydraulic pruning and safety isolation.',
    category: 'Gardener',
    location: 'Perimeter Boundary · Between Gate 2 and Gate 3',
    priority: 'High',
    assignedStaffId: 'STF-OPS-109',
    assignedStaffName: 'Mr. Bhaskar Pradhan',
    assignedTeam: 'Horticulture & Greenery',
    createdDate: '2026-10-21',
    dueDate: '2026-10-23',
    status: 'In Progress',
    completionNotes: 'Line clearance permit issued by Electrical team. Pruning 8 critical branches.',
    requiredMaterials: 'Telescopic Tree Pruner, Safety harness, Warning traffic cones',
    supervisorReviewStatus: 'Approved for Action',
  }
];

export const INITIAL_MAINTENANCE_REQUESTS = [
  {
    id: 'MNT-REQ-501',
    reportedIssue: 'Projector ceiling power socket sparking when plugged in',
    category: 'Electrical problems',
    location: 'Academic Block B · Room 302',
    requester: 'Dr. Subhashree Mohanty (Faculty)',
    requestDate: '2026-10-22 09:15 AM',
    priority: 'Critical',
    assignedStaff: 'Mr. Pramod Kumar Panda',
    assignedCategory: 'Electrician',
    status: 'In Progress',
    estimatedCompletion: '2026-10-22 01:30 PM',
    resolutionNotes: 'Power isolated. Replacing charred 16A modular socket and checking neutral wire continuity.',
  },
  {
    id: 'MNT-REQ-502',
    reportedIssue: 'Low water pressure on 3rd floor washrooms',
    category: 'Plumbing and water supply',
    location: 'Academic Block A · 3rd Floor East Wing',
    requester: 'Prof. R. K. Behera (HOD Office)',
    requestDate: '2026-10-22 08:30 AM',
    priority: 'High',
    assignedStaff: 'Mr. Suresh Mohapatra',
    assignedCategory: 'Plumber',
    status: 'Accepted',
    estimatedCompletion: '2026-10-22 04:00 PM',
    resolutionNotes: 'Air lock in the overhead gravity line. Bleeding the distribution header valve.',
  },
  {
    id: 'MNT-REQ-503',
    reportedIssue: 'Exhaust blower belt slipping and squeaking loudly',
    category: 'Mechanical repairs',
    location: 'Central Canteen · Kitchen Exhaust Stack',
    requester: 'Mr. Kailash Chandra Sahoo (Canteen Supv)',
    requestDate: '2026-10-21 04:10 PM',
    priority: 'Medium',
    assignedStaff: 'Mr. Bipin Bihari Das',
    assignedCategory: 'Mechanic',
    status: 'Completed',
    estimatedCompletion: '2026-10-22 10:00 AM',
    resolutionNotes: 'Replaced worn B-64 V-belt and aligned motor pulley with laser guide. Sound normal.',
  },
  {
    id: 'MNT-REQ-504',
    reportedIssue: 'Faculty cabin desk drawer lock jammed with exam dossiers inside',
    category: 'Furniture damage',
    location: 'Academic Block B · Cabin 208',
    requester: 'Dr. S. Mohanty (Associate Prof)',
    requestDate: '2026-10-22 10:45 AM',
    priority: 'High',
    assignedStaff: 'Mr. Jagabandhu Nayak',
    assignedCategory: 'Carpenter',
    status: 'In Progress',
    estimatedCompletion: '2026-10-22 12:00 PM',
    resolutionNotes: 'Lock cylinder lubricated and freed. Duplicate master brass key provided to faculty.',
  },
  {
    id: 'MNT-REQ-505',
    reportedIssue: 'Split AC Unit leaking condensate water onto student computer desk',
    category: 'Air conditioning',
    location: 'Computing Lab 3 · Tech Tower 1st Floor',
    requester: 'Mr. Biswajit Sahoo (Lab Staff)',
    requestDate: '2026-10-22 08:00 AM',
    priority: 'Critical',
    assignedStaff: 'Mr. Rajesh Kumar Moharana',
    assignedCategory: 'HVAC Technician',
    status: 'Completed',
    estimatedCompletion: '2026-10-22 10:30 AM',
    resolutionNotes: 'Condensate drain tray was clogged with dust slurry. Flushed line with pressurized air.',
  },
  {
    id: 'MNT-REQ-506',
    reportedIssue: 'Flickering LED tube lights in Central Reading Hall',
    category: 'Lighting',
    location: 'Central Library · 1st Floor Reading Bay 2',
    requester: 'Dr. Rabindra K. Jena (Chief Librarian)',
    requestDate: '2026-10-21 03:00 PM',
    priority: 'Medium',
    assignedStaff: 'Mr. Pramod Kumar Panda',
    assignedCategory: 'Electrician',
    status: 'Completed',
    estimatedCompletion: '2026-10-21 06:00 PM',
    resolutionNotes: 'Replaced 3 faulty 36W electronic ballasts with Havells LED drivers.',
  },
  {
    id: 'MNT-REQ-507',
    reportedIssue: 'Lift L-1 doors shuddering and reopening repeatedly on 2nd floor',
    category: 'Lift maintenance',
    location: 'Tech Tower · Main Passenger Elevator L-1',
    requester: 'Mr. Ashok Kumar Rout (Floor Manager)',
    requestDate: '2026-10-22 11:15 AM',
    priority: 'High',
    assignedStaff: 'Mr. Debendra Behera',
    assignedCategory: 'Lift Operator or Technician',
    status: 'In Progress',
    estimatedCompletion: '2026-10-22 02:00 PM',
    resolutionNotes: 'Debris found in sill groove. Cleaning sill tracks and recalibrating door skate roller.',
  },
  {
    id: 'MNT-REQ-508',
    reportedIssue: 'Broken window latch allowing rain spray during storms',
    category: 'Classroom and laboratory facilities',
    location: 'Academic Block A · Lecture Hall 102',
    requester: 'Er. S. K. Nayak (CAO)',
    requestDate: '2026-10-20 02:00 PM',
    priority: 'Low',
    assignedStaff: 'Mr. Jagabandhu Nayak',
    assignedCategory: 'Carpenter',
    status: 'Completed',
    estimatedCompletion: '2026-10-21 11:00 AM',
    resolutionNotes: 'Aluminium stay arm and heavy brass latch fitted. Weatherproof rubber bead installed.',
  },
  {
    id: 'MNT-REQ-509',
    reportedIssue: 'Continuous flush valve overflow in Ground Floor Staff Restroom',
    category: 'Washrooms',
    location: 'Administration Wing · Staff Washroom Ground Floor',
    requester: 'Ms. Sasmita Mohapatra (Admissions)',
    requestDate: '2026-10-22 09:40 AM',
    priority: 'High',
    assignedStaff: 'Mr. Suresh Mohapatra',
    assignedCategory: 'Plumber',
    status: 'In Progress',
    estimatedCompletion: '2026-10-22 01:00 PM',
    resolutionNotes: 'Diaphragm washer split. Installing Jaquar dual-flush internal assembly.',
  }
];

export const INITIAL_PREVENTIVE_MAINTENANCE = [
  {
    id: 'PM-2026-01',
    equipment: 'Kirloskar 320kVA Diesel Generator #1',
    category: 'Power & Utilities',
    frequency: 'Monthly',
    lastServiced: '2026-09-24',
    nextScheduled: '2026-10-24',
    assignedLead: 'Mr. Bipin Bihari Das (Mechanic)',
    checklist: ['Engine Lube Oil Level', 'Battery Terminal Grease', 'Radiator Coolant Specific Gravity', 'Dry Run on Full Load (15 Mins)'],
    status: 'Scheduled',
    complianceRating: '100% On Schedule'
  },
  {
    id: 'PM-2026-02',
    equipment: 'Rooftop Solar Photovoltaic Array (100 kWp)',
    category: 'Green Energy',
    frequency: 'Bi-Weekly',
    lastServiced: '2026-10-10',
    nextScheduled: '2026-10-24',
    assignedLead: 'Mr. Pramod Kumar Panda (Electrician)',
    checklist: ['Panel Dust De-Ionized Wash', 'Inverter Error Code Review', 'Earthing Pit Resistance (< 2 Ohm)', 'MC4 Connector Tightness'],
    status: 'Scheduled',
    complianceRating: 'Optimal Performance'
  },
  {
    id: 'PM-2026-03',
    equipment: 'Central RO Drinking Water Purification Plant (2000 LPH)',
    category: 'Water Quality',
    frequency: 'Weekly',
    lastServiced: '2026-10-18',
    nextScheduled: '2026-10-25',
    assignedLead: 'Mr. Suresh Mohapatra (Plumber)',
    checklist: ['TDS Level Calibration (Target: 80-120 PPM)', 'Backwash Carbon Filter', 'Dosing Pump Chemical Level', 'Membrane Pressure Gauge Check'],
    status: 'Scheduled',
    complianceRating: 'Certified Potable'
  },
  {
    id: 'PM-2026-04',
    equipment: 'Fire Hydrant & Dry Chemical Powder (DCP) Extinguishers',
    category: 'Life Safety',
    frequency: 'Monthly',
    lastServiced: '2026-09-30',
    nextScheduled: '2026-10-30',
    assignedLead: 'Mr. Maheswar Nayak (Security)',
    checklist: ['Pressure Gauge in Green Zone', 'Hose Reel Nozzle Integrity', 'Fire Ring Main Jockey Pump Auto-Start', 'Access Clearance Verified'],
    status: 'Scheduled',
    complianceRating: 'Fire NOC Compliant'
  },
  {
    id: 'PM-2026-05',
    equipment: 'OTIS Passenger Elevator L-1 & L-2',
    category: 'Vertical Transit',
    frequency: 'Monthly',
    lastServiced: '2026-09-28',
    nextScheduled: '2026-10-28',
    assignedLead: 'Mr. Debendra Behera (Lift Tech)',
    checklist: ['Traction Cable Lubrication', 'Counterweight Clearance', 'Emergency Cabin Intercom Battery', 'Door Safety Light Curtain Alignment'],
    status: 'Scheduled',
    complianceRating: 'Statutory Cleared'
  }
];

export const INITIAL_VISITOR_RECORDS = [
  {
    id: 'VIS-2026-901',
    visitorName: 'Mr. Arvind Krishnan',
    organization: 'Cognizant Technology Solutions',
    purpose: 'Campus Recruitment Final Interviews',
    hostPerson: 'Prof. Sudhanshu S. Ray (TPO Head)',
    hostDept: 'Training & Placement Cell',
    gate: 'Gate 1 (Main Entrance)',
    badgeNo: 'VIS-BADGE-04',
    entryTime: '2026-10-22 09:30 AM',
    exitTime: null,
    vehicleNo: 'OD-02-AX-8819 (Innova Crysta)',
    contactPhone: '+91 98450 11200',
    status: 'Inside Campus',
    idProofType: 'Corporate Employee ID #CTS-49102'
  },
  {
    id: 'VIS-2026-902',
    visitorName: 'Dr. R. C. Mohanty',
    organization: 'BPUT Autonomous Inspection Commission',
    purpose: 'Annual Academic & Laboratory Audit',
    hostPerson: 'Dr. B. K. Sarap (Principal)',
    hostDept: 'Office of the Principal',
    gate: 'Gate 1 (Main Entrance)',
    badgeNo: 'VIS-BADGE-01',
    entryTime: '2026-10-22 10:15 AM',
    exitTime: null,
    vehicleNo: 'OD-02-BD-1002 (Official Staff Car)',
    contactPhone: '+91 94371 44550',
    status: 'Inside Campus',
    idProofType: 'Government / University Official ID'
  },
  {
    id: 'VIS-2026-903',
    visitorName: 'Mr. Rajesh Jena',
    organization: 'Voltas Commercial HVAC Solutions',
    purpose: 'Warranty Inspection of Chiller 2',
    hostPerson: 'Mr. Ramesh Chandra Parida (Operations)',
    hostDept: 'Campus Operations',
    gate: 'Gate 2 (Service Gate)',
    badgeNo: 'VIS-BADGE-09',
    entryTime: '2026-10-22 08:00 AM',
    exitTime: '2026-10-22 12:45 PM',
    vehicleNo: 'OD-02-K-3310 (Service Van)',
    contactPhone: '+91 94378 22114',
    status: 'Departed',
    idProofType: 'Aadhaar Card · 9981'
  },
  {
    id: 'VIS-2026-904',
    visitorName: 'Mrs. Jayashree Tripathy',
    organization: 'Parent of Student (Ayush Tripathy)',
    purpose: 'Hostel Room Visit & Fee Consultation',
    hostPerson: 'Mrs. Nibedita Das (Chief Warden)',
    hostDept: 'Hostel Administration',
    gate: 'Gate 1 (Main Entrance)',
    badgeNo: 'VIS-BADGE-12',
    entryTime: '2026-10-22 11:30 AM',
    exitTime: null,
    vehicleNo: 'OD-02-W-7744',
    contactPhone: '+91 94372 99011',
    status: 'Inside Campus',
    idProofType: 'Driving Licence · OR-02-2018'
  }
];

export const INITIAL_HOUSEKEEPING_SCHEDULES = [
  {
    id: 'HK-SCH-01',
    area: 'Academic Block A - Floors 1 to 4',
    assignedStaff: 'Mrs. Minati Senapati & Team (4 Crew)',
    routine: 'Daily 06:30 AM, 11:30 AM & 03:30 PM',
    washroomsInspected: '12 / 12 Cleaned',
    soapRefilled: 'Yes (100%)',
    hygieneScore: '98% Excellent',
    supervisorSignoff: 'Verified by Floor Manager (Ashok Rout)',
    status: 'Completed'
  },
  {
    id: 'HK-SCH-02',
    area: 'Academic Block B - Computing Floors',
    assignedStaff: 'Mr. Sarat Chandra Das (2 Crew)',
    routine: 'Daily 07:00 AM & 01:00 PM',
    washroomsInspected: '8 / 8 Cleaned',
    soapRefilled: 'Yes (100%)',
    hygieneScore: '95% Optimal',
    supervisorSignoff: 'Verified by Lab Supt (Biswajit Sahoo)',
    status: 'Completed'
  },
  {
    id: 'HK-SCH-03',
    area: 'Central Dining & Canteen Hall',
    assignedStaff: 'Mrs. Sabita Mohanty & 3 Staff',
    routine: 'After Breakfast, Lunch & Dinner',
    washroomsInspected: '4 / 4 Handwash Counters',
    soapRefilled: 'Yes (100%)',
    hygieneScore: '99% Certified',
    supervisorSignoff: 'Signed by Canteen Supervisor (Kailash Sahoo)',
    status: 'In Progress'
  },
  {
    id: 'HK-SCH-04',
    area: 'Central University Library All Reading Wings',
    assignedStaff: 'Mr. Purna Chandra Jena',
    routine: 'Daily 07:30 AM & 02:00 PM',
    washroomsInspected: '4 / 4 Cleaned',
    soapRefilled: 'Yes (100%)',
    hygieneScore: '96% Clean',
    supervisorSignoff: 'Signed by Librarian (Dr. R. Jena)',
    status: 'Completed'
  }
];

export const INITIAL_CANTEEN_CHECKLISTS = [
  { id: 'CK-01', item: 'Food raw material receiving temperature verified (< 5°C for dairy/poultry)', time: '06:30 AM', status: 'Passed', verifiedBy: 'Chef S. R. Jena' },
  { id: 'CK-02', item: 'Deep-fryer oil quality test (TPM Polar compounds < 22%)', time: '07:00 AM', status: 'Passed', verifiedBy: 'Kailash Sahoo' },
  { id: 'CK-03', item: 'Drinking water chiller filter sanitized and tested (Zero coliform)', time: '08:00 AM', status: 'Passed', verifiedBy: 'Suresh Mohapatra' },
  { id: 'CK-04', item: 'Cutlery & tray steam sanitization at 85°C completed', time: '11:00 AM', status: 'Passed', verifiedBy: 'Minati Senapati' },
  { id: 'CK-05', item: 'Kitchen waste segregated into green (wet organic) and blue (dry)', time: '02:00 PM', status: 'Passed', verifiedBy: 'Dhiren Patra' },
];

export const INITIAL_CAMPUS_FACILITIES = [
  { id: 'FAC-A-101', building: 'Academic Block A', floor: 'Ground Floor', roomNumber: '101', type: 'Lecture Classroom (70 Seats)', condition: 'Good', openIssues: 0, lastInspected: '2026-10-20', availability: 'Occupied · Class Active' },
  { id: 'FAC-A-102', building: 'Academic Block A', floor: 'Ground Floor', roomNumber: '102', type: 'Smart Interactive Classroom', condition: 'Maintenance Needed', openIssues: 1, lastInspected: '2026-10-21', availability: 'Available between 11-1' },
  { id: 'FAC-B-201', building: 'Academic Block B', floor: '2nd Floor', roomNumber: '201', type: 'Advanced Computing Lab 1', condition: 'Excellent', openIssues: 0, lastInspected: '2026-10-22', availability: 'Lab Practical in Progress' },
  { id: 'FAC-B-204', building: 'Academic Block B', floor: '2nd Floor', roomNumber: '204', type: 'Smart Seminar Hall (120 Seats)', condition: 'Under Repair', openIssues: 2, lastInspected: '2026-10-22', availability: 'Reserved for Afternoon Session' },
  { id: 'FAC-TT-004', building: 'Tech Tower', floor: 'Basement', roomNumber: '004', type: 'Central Server Room & NOC', condition: 'Controlled Environment', openIssues: 1, lastInspected: '2026-10-22', availability: 'Restricted Biometric Access' },
  { id: 'FAC-LIB-01', building: 'Central Library', floor: 'Mezzanine', roomNumber: 'Reading-A', type: 'Quiet Study Hall (150 Seats)', condition: 'Good', openIssues: 0, lastInspected: '2026-10-21', availability: 'Open 08:00 - 20:00' },
  { id: 'FAC-FC-01', building: 'Central Food Court', floor: 'Ground', roomNumber: 'Mess-1', type: 'Student Dining Hall (400 Seats)', condition: 'Optimal Hygiene', openIssues: 0, lastInspected: '2026-10-22', availability: 'Lunch Prep Active' },
];

export const INITIAL_INVENTORY = [
  { id: 'INV-EL-01', code: 'ELEC-MCB-63A', name: 'Schneider 63A 4-Pole MCB Breaker', category: 'Electrical Components', availableQty: 18, unit: 'Nos', location: 'Store Bay E-12', minStock: 5, status: 'In Stock' },
  { id: 'INV-EL-02', code: 'ELEC-LED-36W', name: 'Philips 36W 4-Foot LED Batten Tubelight', category: 'Electrical Components', availableQty: 4, unit: 'Nos', location: 'Store Bay E-04', minStock: 15, status: 'Low Stock Alert' },
  { id: 'INV-PL-01', code: 'PLMB-CPVC-15', name: 'Astral 1.5-inch CPVC High Pressure Pipe (3m)', category: 'Plumbing Supplies', availableQty: 32, unit: 'Lengths', location: 'Store Bay P-01', minStock: 10, status: 'In Stock' },
  { id: 'INV-PL-02', code: 'PLMB-TAP-SS', name: 'Heavy Brass Chrome Plated Bib Tap 0.5-inch', category: 'Plumbing Supplies', availableQty: 3, unit: 'Nos', location: 'Store Bay P-08', minStock: 8, status: 'Low Stock Alert' },
  { id: 'INV-TL-01', code: 'TOOL-DRILL-01', name: 'Bosch Professional 750W Hammer Drill Set', category: 'Tools & Equipment', availableQty: 6, unit: 'Sets', location: 'Tool Crib Bay T-02', minStock: 2, status: 'In Stock' },
  { id: 'INV-CL-01', code: 'CLEN-TASKI-R6', name: 'Taski R6 Heavy Toilet Cleaner Descaler (5L)', category: 'Cleaning Materials', availableQty: 24, unit: 'Cans', location: 'Chemical Vault C-01', minStock: 10, status: 'In Stock' },
  { id: 'INV-SP-01', code: 'SPAR-DG-OIL', name: 'Castrol 15W40 Commercial Diesel Engine Oil (20L)', category: 'Maintenance Spare Parts', availableQty: 5, unit: 'Drums', location: 'Oil Bay O-02', minStock: 3, status: 'In Stock' },
  { id: 'INV-SP-02', code: 'SPAR-AC-R410', name: 'Floron R410A Refrigerant Gas Cylinder (11.3 kg)', category: 'Maintenance Spare Parts', availableQty: 2, unit: 'Cylinders', location: 'Gas Cage G-01', minStock: 2, status: 'Low Stock Alert' },
];

export const INITIAL_DUTY_ROSTER = [
  { id: 'RST-01', staffId: 'STF-OPS-102', staffName: 'Mr. Pramod Panda', category: 'Electrician', shift: 'Morning (06:00 - 14:00)', location: 'Substations 1 & 2', dutyConfirmed: true, attendanceStatus: 'Present' },
  { id: 'RST-02', staffId: 'STF-OPS-103', staffName: 'Mr. Suresh Mohapatra', category: 'Plumber', shift: 'General (09:00 - 17:00)', location: 'Hostels & Academic A', dutyConfirmed: true, attendanceStatus: 'Present' },
  { id: 'RST-03', staffId: 'STF-OPS-104', staffName: 'Mr. Bipin Das', category: 'Mechanic', shift: 'Morning (06:00 - 14:00)', location: 'Utility Yard DG Shed', dutyConfirmed: true, attendanceStatus: 'Present' },
  { id: 'RST-04', staffId: 'STF-OPS-105', staffName: 'Mr. Maheswar Nayak', category: 'Security Guard', shift: 'Morning (06:00 - 14:00)', location: 'Main Gate 1', dutyConfirmed: true, attendanceStatus: 'Present' },
  { id: 'RST-05', staffId: 'STF-OPS-106', staffName: 'Mrs. Minati Senapati', category: 'Housekeeping Staff', shift: 'Morning (06:00 - 14:00)', location: 'Academic Block A & B', dutyConfirmed: true, attendanceStatus: 'Present' },
  { id: 'RST-06', staffId: 'STF-OPS-107', staffName: 'Mr. Kailash Sahoo', category: 'Canteen Staff', shift: 'Morning (06:00 - 14:00)', location: 'Central Canteen', dutyConfirmed: true, attendanceStatus: 'Present' },
  { id: 'RST-07', staffId: 'STF-OPS-108', staffName: 'Mr. Ashok Rout', category: 'Floor Manager', shift: 'General (09:00 - 17:00)', location: 'Academic Block B', dutyConfirmed: true, attendanceStatus: 'Present' },
  { id: 'RST-08', staffId: 'STF-OPS-115', staffName: 'Mr. Manoj Samal', category: 'Other Support Staff', shift: 'Evening (14:00 - 22:00)', location: 'Standby Emergency Utility', dutyConfirmed: false, attendanceStatus: 'Upcoming Shift' },
];

export const INITIAL_LEAVE_REQUESTS = [
  { id: 'LVR-101', staffId: 'STF-OPS-103', staffName: 'Mr. Suresh Mohapatra', category: 'Plumber', type: 'Casual Leave', dates: '26 Oct 2026 to 27 Oct 2026', days: 2, reason: 'Family spiritual ritual at native village', relieverStaff: 'Mr. Manoj Kumar Samal', supervisorStatus: 'Approved' },
  { id: 'LVR-102', staffId: 'STF-OPS-109', staffName: 'Mr. Bhaskar Pradhan', category: 'Gardener', type: 'Duty Shift Swap', dates: '24 Oct 2026', days: 1, reason: 'Swap Morning with Evening shift with Assistant Gardener', relieverStaff: 'Mr. Dhiren Patra', supervisorStatus: 'Pending Review' },
];

export const INITIAL_SAFETY_INCIDENTS = [
  {
    id: 'INC-2026-041',
    category: 'Electrical Hazard',
    location: 'External Transformer Yard 2',
    dateTime: '2026-10-21 04:30 PM',
    description: 'Cat entered switchgear perimeter and touched earthing link. Tripped breaker safely. No human injury.',
    reportedBy: 'Mr. Pramod Panda (Electrician)',
    severity: 'Medium',
    assignedSupervisor: 'Mr. Ramesh Chandra Parida',
    reviewStatus: 'Reviewed & Addressed',
    correctiveAction: 'Sealed 2-inch gap in chainlink perimeter with galvanized wire mesh.',
    resolutionStatus: 'Closed'
  },
  {
    id: 'INC-2026-042',
    category: 'Slip & Fall Hazard',
    location: 'Block A Staircase between 1st & 2nd floor',
    dateTime: '2026-10-22 08:45 AM',
    description: 'Condensation dripping from AC outdoor unit created slippery tile step.',
    reportedBy: 'Mr. Ashok Rout (Floor Manager)',
    severity: 'Low',
    assignedSupervisor: 'Mr. Ramesh Chandra Parida',
    reviewStatus: 'Under Correction',
    correctiveAction: 'Placed yellow Caution Wet Floor cone. HVAC technician rerouted drain hose.',
    resolutionStatus: 'Resolved'
  }
];

export const INITIAL_NOTIFICATIONS = [
  { id: 'NOTIF-01', type: 'URGENT', title: 'Campus Water Tank Disinfection Notice', message: 'Overhead reservoir chlorination scheduled for Saturday night 10:00 PM. Alternate booster pumps will supply hostels.', time: '10 mins ago', unread: true },
  { id: 'NOTIF-02', type: 'TASK', title: 'Work Order #WO-8801 Priority Escalated', message: 'Substation 2 63A MCB replacement upgraded to CRITICAL priority by Principal Secretariat.', time: '1 hour ago', unread: true },
  { id: 'NOTIF-03', type: 'SAFETY', title: 'Weather Advisory · Pre-Cyclone Wind Preparations', message: 'Check outdoor hoardings, solar panel anchor bolts, and clear storm water drains.', time: 'Yesterday', unread: false },
];

// Load from localStorage or initialize
function getStoredData() {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Campus operations storage load failed:', err);
  }
  return null;
}

function saveStoredData(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Campus operations storage save failed:', err);
  }
}

class CampusOperationsStore {
  constructor() {
    const existing = getStoredData();
    this.categories = existing?.categories || [...INITIAL_STAFF_CATEGORIES];
    this.staff = existing?.staff || [...INITIAL_STAFF_DIRECTORY];
    this.tasks = existing?.tasks || [...INITIAL_TASKS];
    this.maintenanceRequests = existing?.maintenanceRequests || [...INITIAL_MAINTENANCE_REQUESTS];
    this.preventiveMaintenance = existing?.preventiveMaintenance || [...INITIAL_PREVENTIVE_MAINTENANCE];
    this.visitors = existing?.visitors || [...INITIAL_VISITOR_RECORDS];
    this.housekeepingSchedules = existing?.housekeepingSchedules || [...INITIAL_HOUSEKEEPING_SCHEDULES];
    this.canteenChecklists = existing?.canteenChecklists || [...INITIAL_CANTEEN_CHECKLISTS];
    this.facilities = existing?.facilities || [...INITIAL_CAMPUS_FACILITIES];
    this.inventory = existing?.inventory || [...INITIAL_INVENTORY];
    this.dutyRoster = existing?.dutyRoster || [...INITIAL_DUTY_ROSTER];
    this.leaveRequests = existing?.leaveRequests || [...INITIAL_LEAVE_REQUESTS];
    this.safetyIncidents = existing?.safetyIncidents || [...INITIAL_SAFETY_INCIDENTS];
    this.notifications = existing?.notifications || [...INITIAL_NOTIFICATIONS];
  }

  save() {
    saveStoredData({
      categories: this.categories,
      staff: this.staff,
      tasks: this.tasks,
      maintenanceRequests: this.maintenanceRequests,
      preventiveMaintenance: this.preventiveMaintenance,
      visitors: this.visitors,
      housekeepingSchedules: this.housekeepingSchedules,
      canteenChecklists: this.canteenChecklists,
      facilities: this.facilities,
      inventory: this.inventory,
      dutyRoster: this.dutyRoster,
      leaveRequests: this.leaveRequests,
      safetyIncidents: this.safetyIncidents,
      notifications: this.notifications
    });
  }

  // Categories
  getCategories() {
    return [...this.categories];
  }
  addCategory(newCategory) {
    if (newCategory && !this.categories.includes(newCategory.trim())) {
      this.categories.push(newCategory.trim());
      this.save();
    }
    return [...this.categories];
  }

  // Staff
  getStaff() {
    return [...this.staff];
  }
  addStaff(member) {
    const id = `STF-OPS-${Math.floor(100 + Math.random() * 900)}`;
    const newStaff = {
      ...member,
      id: member.id || id,
      avatar: member.avatar || '/passport_photo_male.svg',
      status: member.status || 'On Duty',
      joiningDate: member.joiningDate || new Date().toISOString().split('T')[0]
    };
    this.staff.unshift(newStaff);
    this.save();
    return newStaff;
  }
  updateStaff(id, updates) {
    this.staff = this.staff.map(s => s.id === id ? { ...s, ...updates } : s);
    this.save();
  }

  // Tasks
  getTasks() {
    return [...this.tasks];
  }
  addTask(task) {
    const id = `WO-2026-${Math.floor(8800 + Math.random() * 1100)}`;
    const newTask = {
      ...task,
      id: task.id || id,
      createdDate: new Date().toISOString().split('T')[0],
      status: task.status || 'New',
      supervisorReviewStatus: task.supervisorReviewStatus || 'Pending Verification'
    };
    this.tasks.unshift(newTask);
    this.save();
    return newTask;
  }
  updateTaskStatus(id, newStatus, completionNotes) {
    this.tasks = this.tasks.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: newStatus,
          completionNotes: completionNotes !== undefined ? completionNotes : t.completionNotes
        };
      }
      return t;
    });
    this.save();
  }

  // Maintenance Requests
  getMaintenanceRequests() {
    return [...this.maintenanceRequests];
  }
  updateMaintenanceStatus(id, status, notes) {
    this.maintenanceRequests = this.maintenanceRequests.map(m => {
      if (m.id === id) {
        return { ...m, status, resolutionNotes: notes || m.resolutionNotes };
      }
      return m;
    });
    this.save();
  }

  // Visitors
  getVisitors() {
    return [...this.visitors];
  }
  checkInVisitor(record) {
    const id = `VIS-2026-${Math.floor(900 + Math.random() * 99)}`;
    const newRecord = {
      ...record,
      id,
      entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Inside Campus',
      exitTime: null
    };
    this.visitors.unshift(newRecord);
    this.save();
    return newRecord;
  }
  checkOutVisitor(id) {
    const exitTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.visitors = this.visitors.map(v => v.id === id ? { ...v, status: 'Departed', exitTime } : v);
    this.save();
  }

  // Inventory
  getInventory() {
    return [...this.inventory];
  }
  issueItem(id, qty) {
    this.inventory = this.inventory.map(item => {
      if (item.id === id) {
        const remaining = Math.max(0, item.availableQty - qty);
        return {
          ...item,
          availableQty: remaining,
          status: remaining <= item.minStock ? 'Low Stock Alert' : 'In Stock'
        };
      }
      return item;
    });
    this.save();
  }

  // Leave & Shift
  getLeaveRequests() {
    return [...this.leaveRequests];
  }
  updateLeaveStatus(id, status) {
    this.leaveRequests = this.leaveRequests.map(l => l.id === id ? { ...l, supervisorStatus: status } : l);
    this.save();
  }

  // Safety Incidents
  getSafetyIncidents() {
    return [...this.safetyIncidents];
  }
  addSafetyIncident(incident) {
    const id = `INC-2026-${Math.floor(40 + Math.random() * 50)}`;
    const newInc = {
      ...incident,
      id,
      dateTime: new Date().toLocaleString(),
      reviewStatus: 'Under Correction',
      resolutionStatus: 'Active'
    };
    this.safetyIncidents.unshift(newInc);
    this.save();
    return newInc;
  }

  // Facilities
  getFacilities() {
    return [...this.facilities];
  }

  // Duty Roster
  getDutyRoster() {
    return [...this.dutyRoster];
  }
  confirmDuty(id) {
    this.dutyRoster = this.dutyRoster.map(r => r.id === id ? { ...r, dutyConfirmed: true } : r);
    this.save();
  }

  // Notifications
  getNotifications() {
    return [...this.notifications];
  }
  markNotificationRead(id) {
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, unread: false } : n);
    this.save();
  }

  // Computed Overview Metrics
  getDashboardMetrics() {
    const tasks = this.tasks;
    const maintenance = this.maintenanceRequests;
    const incidents = this.safetyIncidents;

    const assigned = tasks.length;
    const pending = tasks.filter(t => ['New', 'Assigned', 'Accepted', 'In Progress'].includes(t.status)).length;
    const completed = tasks.filter(t => t.status === 'Completed' || t.status === 'Verified').length;
    const overdue = tasks.filter(t => t.priority === 'Critical' && t.status !== 'Completed').length;
    const newMaintenance = maintenance.filter(m => m.status === 'In Progress' || m.status === 'Accepted').length;
    const highPriority = tasks.filter(t => t.priority === 'Critical' || t.priority === 'High').length;
    const staffOnDuty = this.staff.filter(s => s.status === 'On Duty').length;
    const scheduledMaintenance = this.preventiveMaintenance.length;
    const openSafetyIncidents = incidents.filter(i => i.resolutionStatus !== 'Closed').length;
    const pendingSupervisorApprovals = this.leaveRequests.filter(l => l.supervisorStatus === 'Pending Review').length + tasks.filter(t => t.supervisorReviewStatus === 'Pending Verification').length;

    return {
      assigned,
      pending,
      completed,
      overdue,
      newMaintenance,
      highPriority,
      staffOnDuty,
      scheduledMaintenance,
      openSafetyIncidents,
      pendingSupervisorApprovals
    };
  }
}

export const campusOperationsStore = new CampusOperationsStore();
export default campusOperationsStore;
