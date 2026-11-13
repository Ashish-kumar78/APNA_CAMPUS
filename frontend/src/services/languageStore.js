/**
 * Multi-Language (English / Hindi / Odia) Translation Store & Engine
 * Supports seamless, instant switching across the entire CMS interface without page reloads.
 * Preserves user-entered data (names, notes, IDs, numbers, records).
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳' },
  { code: 'or', label: 'Odia', nativeLabel: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
];

export const HINDI_DICTIONARY = {
  // Navigation & Sections
  'OVERVIEW': 'अवलोकन',
  'HOSTEL': 'छात्रावास',
  'RESIDENTIAL OPERATIONS': 'आवासीय संचालन',
  'LEAVES & DIGITAL PASSES': 'अवकाश एवं डिजिटल पास',
  'SERVICES & ASSETS': 'सेवाएं एवं संपत्ति',
  'POLICIES & REPORTS': 'नीतियां एवं रिपोर्ट्स',
  'REPORTS & POLICIES': 'रिपोर्ट्स एवं नीतियां',
  'WARDEN MANAGEMENT': 'वार्डन प्रबंधन',
  'ATTENDANCE & MOVEMENT': 'उपस्थिति एवं आवागमन',
  'SAFETY & DISCIPLINE': 'सुरक्षा एवं अनुशासन',
  'ACADEMICS': 'अकादमिक',
  'EXAMINATION': 'परीक्षा',
  'FEES & ACCOUNTS': 'शुल्क एवं खाते',
  'CAMPUS OPERATIONS': 'परिसर संचालन',
  'ADMISSIONS': 'प्रवेश',
  'LIBRARY': 'पुस्तकालय',
  'TRANSPORT': 'परिवहन',
  'PLACEMENT': 'प्लेसमेंट',
  'FACULTY MANAGEMENT': 'संकाय प्रबंधन',
  'STUDENT AFFAIRS': 'छात्र मामले',

  // Dashboards & Portals
  'Dashboard': 'डैशबोर्ड',
  'Super Admin dashboard': 'सुपर एडमिन डैशबोर्ड',
  'Super Admin Dashboard': 'सुपर एडमिन डैशबोर्ड',
  'Admin Dashboard': 'एडमिन डैशबोर्ड',
  'Hostel Admin Dashboard': 'छात्रावास एडमिन डैशबोर्ड',
  'Warden Dashboard': 'वार्डन डैशबोर्ड',
  'Principal Dashboard': 'प्राचार्य डैशबोर्ड',
  "Principal's Executive Dashboard": 'प्राचार्य का कार्यकारी डैशबोर्ड',
  'Faculty Dashboard': 'संकाय डैशबोर्ड',
  'Student Dashboard': 'छात्र डैशबोर्ड',
  'HOD Dashboard': 'विभागाध्यक्ष डैशबोर्ड',
  'Management Dashboard': 'प्रबंधन डैशबोर्ड',
  'Examination Dashboard': 'परीक्षा डैशबोर्ड',
  'Library Dashboard': 'पुस्तकालय डैशबोर्ड',
  'Transport Dashboard': 'परिवहन डैशबोर्ड',
  'Placement Dashboard': 'प्लेसमेंट डैशबोर्ड',
  'Security Dashboard': 'सुरक्षा डैशबोर्ड',
  'Campus Security': 'परिसर सुरक्षा',
  'Gate Overview': 'गेट अवलोकन',
  'QR Scanner & Roll Lookup': 'क्यूआर स्कैनर एवं रोल खोज',
  'Approved Gate Passes': 'स्वीकृत गेट पास',
  'Visitor Management': 'आगंतुक प्रबंधन',
  'Movement History': 'आवागमन इतिहास',
  'Security Alerts': 'सुरक्षा अलर्ट',
  'Mess Manager': 'मेस प्रबंधक',
  'Mess Management': 'मेस प्रबंधन',
  'Mess Dashboard': 'मेस डैशबोर्ड',
  'Weekly Menu': 'साप्ताहिक मेनू',
  'Meal Feedback': 'भोजन प्रतिक्रिया',
  'Complaints & Issues': 'शिकायतें एवं समस्याएं',
  'Meal Count / Attendance': 'भोजन गणना / उपस्थिति',
  'Mess Notices': 'मेस सूचनाएं',
  'Overview': 'अवलोकन',

  // Sidebar Menu Items
  'Take Hostel Attendance': 'छात्रावास उपस्थिति दर्ज करें',
  'View Hostel Attendance': 'छात्रावास उपस्थिति देखें',
  'Room Allotment': 'कमरा आवंटन',
  'Hostel Blocks & Wings': 'छात्रावास ब्लॉक और विंग',
  'Rooms & Bed Allotment': 'कमरे और बेड आवंटन',
  'Hostel Leaves': 'छात्रावास अवकाश',
  'Apply Leave': 'अवकाश आवेदन',
  'Digital Gate Passes': 'डिजिटल गेट पास',
  'Visitor Logs': 'आगंतुक लॉग',
  'Visitor Register': 'आगंतुक रजिस्टर',
  'Disciplinary Records': 'अनुशासनात्मक रिकॉर्ड',
  'Disciplinary Reviews': 'अनुशासनात्मक समीक्षा',
  'Emergency Contacts': 'आपातकालीन संपर्क',
  'Mess & Food Feedback': 'मेस और भोजन प्रतिक्रिया',
  'Mess & Food Feedback Management': 'मेस और भोजन प्रतिक्रिया प्रबंधन',
  'Room Cleanliness Complaints': 'कमरा स्वच्छता शिकायतें',
  'Room Cleanliness Complaints & SLA': 'कमरा स्वच्छता शिकायतें और एसएलए',
  'Room Maintenance Complaints': 'कमरा रखरखाव शिकायतें',
  'Maintenance Complaints & SLA': 'रखरखाव शिकायतें और एसएलए',
  'Furniture & Inventory': 'फर्नीचर और इन्वेंट्री',
  'Furniture & Inventory Requisitions': 'फर्नीचर और इन्वेंट्री मांग',
  'Warden & Caretaker Roster': 'वार्डन और केयरटेकर रोस्टर',
  'Staff & Caretaker Roster': 'कर्मचारी और केयरटेकर रोस्टर',
  'Hostel Rules & Curfew': 'छात्रावास नियम और कर्फ्यू',
  'Hostel Fee Ledger': 'छात्रावास शुल्क बही',
  'Warden Directory': 'वार्डन निर्देशिका',
  'Warden Assignments': 'वार्डन कार्यभार',
  'Warden Permissions': 'वार्डन अनुमतियां',
  'Duty & Leave Management': 'ड्यूटी और अवकाश प्रबंधन',
  'Warden Performance': 'वार्डन कार्यप्रदर्शन',
  'Add New Warden': 'नया वार्डन जोड़ें',
  'Hostel Buildings & Blocks': 'छात्रावास भवन और ब्लॉक',
  'Rooms & Bed Capacity': 'कमरे और बेड क्षमता',
  'Attendance Monitoring': 'उपस्थिति निगरानी',
  'Attendance Verification & Override': 'उपस्थिति सत्यापन और बदलाव',
  'Student Leave Approvals': 'छात्र अवकाश स्वीकृति',
  'Central Approval Center': 'केंद्रीय स्वीकृति केंद्र',
  'Reports & Compliance Analytics': 'रिपोर्ट और अनुपालन विश्लेषण',
  'Administrative Audit Logs': 'प्रशासनिक ऑडिट लॉग',

  // Core CMS Modules & Portals
  'Students': 'छात्र',
  'Student': 'छात्र',
  'Student Directory': 'छात्र निर्देशिका',
  'Faculty': 'संकाय',
  'Faculty Directory': 'संकाय निर्देशिका',
  'Teachers': 'शिक्षक',
  'Attendance': 'उपस्थिति',
  'Take Attendance': 'उपस्थिति लें',
  'View Attendance': 'उपस्थिति देखें',
  'Examination': 'परीक्षा',
  'Exam Cell': 'परीक्षा प्रकोष्ठ',
  'Marks & Grades': 'अंक और ग्रेड',
  'Fees & Payments': 'शुल्क और भुगतान',
  'Fee Management': 'शुल्क प्रबंधन',
  'Hostel': 'छात्रावास',
  'Library': 'पुस्तकालय',
  'Transport': 'परिवहन',
  'Placement': 'प्लेसमेंट',
  'Placement Cell': 'प्लेसमेंट प्रकोष्ठ',
  'Admissions': 'प्रवेश',
  'Complaints': 'शिकायतें',
  'Cleanliness': 'स्वच्छता',
  'Maintenance': 'रखरखाव',
  'Staff': 'कर्मचारी',
  'Settings': 'सेटिंग्स',
  'Reports': 'रिपोर्ट्स',
  'Notices': 'सूचनाएं',
  'Official College Notices': 'आधिकारिक कॉलेज सूचनाएं',
  'My Classes & Sections': 'मेरी कक्षाएं और अनुभाग',
  "Today's Schedule": 'आज की समय सारणी',
  'Marks Entry': 'अंक प्रविष्टि',
  'Internal Assessment': 'आंतरिक मूल्यांकन',
  'Assignment Management': 'असाइनमेंट प्रबंधन',
  'Student Mentoring': 'छात्र मार्गदर्शन',
  'Lesson Plans': 'पाठ योजनाएं',
  'Research & Publications': 'अनुसंधान और प्रकाशन',
  'Apply For Leave': 'अवकाश के लिए आवेदन करें',
  'Class Timetable': 'कक्षा समय सारणी',
  'Subject': 'विषय',
  'Semester': 'सत्र',
  'Section': 'अनुभाग',
  'Time': 'समय',
  'Room': 'कमरा',
  'Mark Attendance': 'उपस्थिति लगाएं',
  'Enter Marks': 'अंक दर्ज करें',
  'Upload Material': 'अध्ययन सामग्री अपलोड करें',
  'Submitted Assignments': 'जमा किए गए असाइनमेंट',
  'Attendance Summary': 'उपस्थिति सारांश',
  'Upcoming Examinations': 'आगामी परीक्षाएं',
  'Fee Dues & Receipts': 'शुल्क बकाया और रसीदें',
  'Hostel & Room Allotment': 'छात्रावास और कमरा आवंटन',
  'Hostel Leave Application': 'छात्रावास अवकाश आवेदन',
  'Digital Gate Pass': 'डिजिटल गेट पास',
  'Library Books Issued': 'जारी की गई पुस्तकें',
  'Assignments & Submissions': 'असाइनमेंट और सबमिशन',
  'Report a Complaint': 'शिकायत दर्ज करें',
  'Food Feedback': 'भोजन प्रतिक्रिया',
  'Maintenance Requests': 'रखरखाव अनुरोध',
  'Bonafide Certificate Apply': 'बोनाफाइड प्रमाणपत्र आवेदन',
  'My Grades & CGPA': 'मेरे ग्रेड और सीजीपीए',
  'Download Hall Ticket': 'प्रवेश पत्र डाउनलोड करें',
  'Pay Fees Online': 'शुल्क का ऑनलाइन भुगतान करें',

  // Topbar / Header
  'Notifications': 'सूचनाएं',
  'Campus Notifications': 'परिसर सूचनाएं',
  'Search anything... (e.g. students, marks, notices)': 'कुछ भी खोजें... (उदा. छात्र, अंक, नोटिस)',
  'Search anything...': 'कुछ भी खोजें...',
  'Sign In': 'साइन इन',
  'Sign Out': 'साइन आउट',
  'Logout': 'लॉग आउट',
  'Log Out': 'लॉग आउट',
  'Language': 'भाषा',
  'Select Language': 'भाषा चुनें',
  'Select Language (Current: English)': 'भाषा चुनें (वर्तमान: English)',
  'Select Language (Current: Hindi)': 'भाषा चुनें (वर्तमान: हिंदी)',
  'Select Language (Current: Odia)': 'भाषा चुनें (वर्तमान: ଓଡ଼ିଆ)',
  'English': 'English',
  'Hindi': 'हिन्दी',
  'Odia': 'ଓଡ଼ିଆ',
  'Theme': 'थीम',
  'Light Mode': 'लाइट मोड',
  'Dark Mode': 'डार्क मोड',
  'Switch to Light Mode': 'लाइट मोड पर स्विच करें',
  'Switch to Dark Mode': 'डार्क मोड पर स्विच करें',
  'NAAC A++ AUTONOMOUS INSTITUTION': 'नैक ए++ स्वायत्त संस्थान',
  'User Account Menu': 'उपयोगकर्ता खाता मेनू',
  'User Profile': 'उपयोगकर्ता प्रोफ़ाइल',
  'Profile': 'प्रोफ़ाइल',
  'Role & Access': 'भूमिका एवं पहुंच',
  'Preferences': 'प्राथमिकताएं',
  'No new notifications': 'कोई नई सूचना नहीं है',
  'Mark all as read': 'सभी को पढ़ा हुआ चिह्नित करें',

  // Common Buttons & Actions
  'Add': 'जोड़ें',
  'Add Note': 'नोट जोड़ें',
  'Edit': 'संपादित करें',
  'Edit Note': 'नोट संपादित करें',
  'Delete': 'हटाएं',
  'Delete Note': 'नोट हटाएं',
  'Save': 'सहेजें',
  'Save Note': 'नोट सहेजें',
  'Submit': 'जमा करें',
  'Submit Note': 'नोट जमा करें',
  'Submit (Complete)': 'जमा करें (पूर्ण)',
  'Submit (Complete Task)': 'जमा करें (कार्य पूर्ण करें)',
  'Update': 'अपडेट करें',
  'Close': 'बंद करें',
  'Cancel': 'रद्द करें',
  'Confirm': 'पुष्टि करें',
  'View': 'देखें',
  'View Full Details': 'पूर्ण विवरण देखें',
  'View Document': 'दस्तावेज़ देखें',
  'Download': 'डाउनलोड करें',
  'Export': 'निर्यात करें',
  'Print': 'प्रिंट करें',
  'Search': 'खोजें',
  'Filter': 'फ़िल्टर',
  'Reset': 'रीसेट',
  'Verify': 'सत्यापित करें',
  'Approve': 'स्वीकृत करें',
  'Reject': 'अस्वीकृत करें',
  'Inspect': 'निरीक्षण करें',
  'Vacate': 'खाली करें',
  'Apply': 'आवेदन करें',
  'Register': 'पंजीकृत करें',
  'Back': 'वापस जाएं',
  'Next': 'अगला',
  'Previous': 'पिछला',
  'Refresh': 'ताज़ा करें',
  'Add Floor': 'फ्लोर जोड़ें',
  'Add Room': 'कमरा जोड़ें',
  'Add Bed': 'बेड जोड़ें',
  'Allocate New Bed': 'नया बेड आवंटित करें',
  'Add Complex': 'परिसर जोड़ें',
  'Add Hostel Complex': 'छात्रावास परिसर जोड़ें',
  'Print Duty Roster': 'ड्यूटी रोस्टर प्रिंट करें',
  'Raise Indent': 'मांग पत्र बनाएं',
  'Quick Connect': 'त्वरित संपर्क',
  'Save Note / Schedule Task': 'नोट सहेजें / कार्य निर्धारित करें',
  'Lodge Maintenance Request': 'रखरखाव अनुरोध दर्ज करें',
  'Confirm Resolved': 'समाधान की पुष्टि करें',
  'Reopen Issue': 'समस्या पुनः खोलें',
  'Approve & Assign': 'स्वीकृत करें एवं सौंपें',

  // Hostel Residence & Maintenance
  'My Hostel Residence & Accommodation': 'मेरा छात्रावास निवास एवं आवास',
  'Room allocation, roommates, hostel guidelines, and 24/7 maintenance desk': 'कमरा आवंटन, रूममेट्स, छात्रावास दिशानिर्देश और 24/7 रखरखाव डेस्क',
  'ALLOCATED ROOM': 'आवंटित कमरा',
  'RESIDENCE COMPLEX': 'आवासीय परिसर',
  'HOSTEL FEE STATUS': 'छात्रावास शुल्क स्थिति',
  'Partially Paid': 'आंशिक भुगतान',
  'Paid': 'भुगतान किया गया',
  'Balance Due': 'शेष देय',
  'Mess Clearance: Active': 'मेस क्लीयरेंस: सक्रिय',
  'Roommates': 'कमरे के साथी',
  'Hostel Regulations & Code of Conduct': 'छात्रावास नियम एवं आचार संहिता',
  'My Maintenance Complaints': 'मेरी रखरखाव शिकायतें',
  'Details Recorded': 'विवरण दर्ज',
  'Assigned Resident Warden': 'आवंटित आवासीय वार्डन',
  'Auto-routed by Hostel & Block': 'छात्रावास एवं ब्लॉक द्वारा स्वतः अग्रेषित',
  'Auto-assigned by workload': 'कार्यभार के आधार पर स्वतः आवंटित',
  'Awaiting Resident Warden approval and technician assignment': 'आवासीय वार्डन अनुमोदन एवं तकनीशियन आवंटन प्रतीक्षित',
  'Status Log': 'स्थिति लॉग',

  // Landing Page
  'Welcome Back': 'वापसी पर स्वागत है',
  'Sign in to your Apna Campus account': 'अपने अपना कैंपस खाते में साइन इन करें',
  'College ID or Registration Number': 'कॉलेज आईडी या पंजीकरण संख्या',
  'Password': 'पासवर्ड',
  'Remember my credentials on this device': 'इस उपकरण पर मेरा विवरण याद रखें',
  'Need help signing in? Contact Campus IT Desk': 'साइन इन करने में सहायता चाहिए? कैंपस आईटी डेस्क से संपर्क करें',
  'APNA CAMPUS': 'अपना कैंपस',
  'COLLEGE MANAGEMENT ERP': 'कॉलेज प्रबंधन ईआरपी',
  'AUTONOMOUS HIGHER EDUCATION PORTAL': 'स्वायत्त उच्च शिक्षा पोर्टल',
  'NAAC A++ ACCREDITED': 'नैक ए++ मान्यता प्राप्त',
  'LEARN': 'सीखें',
  'GROW': 'बढ़ें',
  'CONNECT': 'जुड़ें',
  'A Smarter': 'एक अधिक स्मार्ट',
  'Campus Experience.': 'कैंपस अनुभव।',
  'People': 'लोग',
  'Administration': 'प्रशासन',
  'Opportunities': 'अवसर',
  'Smart Timetable': 'स्मार्ट समय सारणी',
  'Digital Evaluations': 'डिजिटल मूल्यांकन',
  'Smart Attendance': 'स्मार्ट उपस्थिति',
  'STUDENTS': 'छात्र',
  'FACULTY': 'संकाय',
  'PROGRAMS': 'कार्यक्रम',

  // Statuses & Table Headers
  'Status': 'स्थिति',
  'Active': 'सक्रिय',
  'Inactive': 'निष्क्रिय',
  'Pending': 'लंबित',
  'Completed': 'पूर्ण',
  'Approved': 'स्वीकृत',
  'Rejected': 'अस्वीकृत',
  'Submitted': 'जमा किया गया',
  'In Progress': 'प्रगति पर',
  'Awaiting Student Verification': 'छात्र सत्यापन प्रतीक्षित',
  'Awaiting Verification': 'सत्यापन प्रतीक्षित',
  'Resolved': 'समाधान हो गया',
  'Reopened': 'पुनः खोला गया',
  'Overdue': 'अतिदेय',
  'High': 'उच्च',
  'Medium': 'मध्यम',
  'Low': 'कम',
  'Urgent': 'अति आवश्यक',
  'Plumbing': 'नलसाजी (प्लंबिंग)',
  'Electrical': 'विद्युत (इलेक्ट्रिकल)',
  'Cleaning': 'सफाई (क्लीनिंग)',
  'Furniture': 'फर्नीचर',
  'Civil': 'सिविल निर्माण',
  'Present': 'उपस्थित',
  'Absent': 'अनुपस्थित',
  'On Leave': 'अवकाश पर',
  'On Duty': 'ड्यूटी पर',
  'Action': 'कार्रवाई',
  'Actions': 'कार्रवाइयां',
};

export const ODIA_DICTIONARY = {
  // Navigation & Sections
  'OVERVIEW': 'ସମୀକ୍ଷା',
  'HOSTEL': 'ଛାତ୍ରାବାସ',
  'RESIDENTIAL OPERATIONS': 'ଆବାସିକ କାର୍ଯ୍ୟକଳାପ',
  'LEAVES & DIGITAL PASSES': 'ଛୁଟି ଏବଂ ଡିଜିଟାଲ୍ ପାସ୍',
  'SERVICES & ASSETS': 'ସେବା ଏବଂ ସମ୍ପତ୍ତି',
  'POLICIES & REPORTS': 'ନୀତି ଏବଂ ବିବରଣୀ',
  'REPORTS & POLICIES': 'ବିବରଣୀ ଏବଂ ନୀତି',
  'WARDEN MANAGEMENT': 'ୱାର୍ଡେନ୍ ପରିଚାଳନା',
  'ATTENDANCE & MOVEMENT': 'ଉପସ୍ଥିତି ଏବଂ ଚଳପ୍ରଚଳ',
  'SAFETY & DISCIPLINE': 'ସୁରକ୍ଷା ଏବଂ ଶୃଙ୍ଖଳା',
  'ACADEMICS': 'ଶିକ୍ଷାଗତ',
  'EXAMINATION': 'ପରୀକ୍ଷା',
  'FEES & ACCOUNTS': 'ଫିସ୍ ଏବଂ ହିସାବ',
  'CAMPUS OPERATIONS': 'କ୍ୟାମ୍ପସ କାର୍ଯ୍ୟକଳାପ',
  'ADMISSIONS': 'ନାମଲେଖା',
  'LIBRARY': 'ଗ୍ରନ୍ଥାଗାର',
  'TRANSPORT': 'ପରିବହନ',
  'PLACEMENT': 'ନିଯୁକ୍ତି',
  'FACULTY MANAGEMENT': 'ଅଧ୍ୟାପକ ପରିଚାଳନା',
  'STUDENT AFFAIRS': 'ଛାତ୍ର ବ୍ୟାପାର',

  // Dashboards & Portals
  'Dashboard': 'ଡ୍ୟାସବୋର୍ଡ',
  'Super Admin dashboard': 'ମୁଖ୍ୟ ପ୍ରଶାସକ ଡ୍ୟାସବୋର୍ଡ',
  'Super Admin Dashboard': 'ମୁଖ୍ୟ ପ୍ରଶାସକ ଡ୍ୟାସବୋର୍ଡ',
  'Admin Dashboard': 'ପ୍ରଶାସକ ଡ୍ୟାସବୋର୍ଡ',
  'Hostel Admin Dashboard': 'ଛାତ୍ରାବାସ ପ୍ରଶାସକ ଡ୍ୟାସବୋର୍ଡ',
  'Warden Dashboard': 'ୱାର୍ଡେନ୍ ଡ୍ୟାସବୋର୍ଡ',
  'Principal Dashboard': 'ଅଧ୍ୟକ୍ଷ ଡ୍ୟାସବୋର୍ଡ',
  "Principal's Executive Dashboard": 'ଅଧ୍ୟକ୍ଷଙ୍କ କାର୍ଯ୍ୟନିର୍ବାହୀ ଡ୍ୟାସବୋର୍ଡ',
  'Faculty Dashboard': 'ଅଧ୍ୟାପକ ଡ୍ୟାସବୋର୍ଡ',
  'Student Dashboard': 'ଛାତ୍ର ଡ୍ୟାସବୋର୍ଡ',
  'HOD Dashboard': 'ବିଭାଗୀୟ ମୁଖ୍ୟ ଡ୍ୟାସବୋର୍ଡ',
  'Management Dashboard': 'ପରିଚାଳନା ଡ୍ୟାସବୋର୍ଡ',
  'Examination Dashboard': 'ପରୀକ୍ଷା ଡ୍ୟାସବୋର୍ଡ',
  'Library Dashboard': 'ଗ୍ରନ୍ଥାଗାର ଡ୍ୟାସବୋର୍ଡ',
  'Transport Dashboard': 'ପରିବହନ ଡ୍ୟାସବୋର୍ଡ',
  'Placement Dashboard': 'ନିଯୁକ୍ତି ଡ୍ୟାସବୋର୍ଡ',
  'Security Dashboard': 'ସୁରକ୍ଷା ଡ୍ୟାସବୋର୍ଡ',
  'Campus Security': 'କ୍ୟାମ୍ପସ ସୁରକ୍ଷା',
  'Gate Overview': 'ଗେଟ୍ ସମୀକ୍ଷା',
  'QR Scanner & Roll Lookup': 'କ୍ୟୁଆର୍ ସ୍କାନର୍ ଓ ରୋଲ୍ ସନ୍ଧାନ',
  'Approved Gate Passes': 'ଅନୁମୋଦିତ ଗେଟ୍ ପାସ୍',
  'Visitor Management': 'ଦର୍ଶକ ପରିଚାଳନା',
  'Movement History': 'ଗମନାଗମନ ଇତିହାସ',
  'Security Alerts': 'ସୁରକ୍ଷା ସତର୍କତା',
  'Mess Manager': 'ମେସ୍ ପରିଚାଳକ',
  'Mess Management': 'ମେସ୍ ପରିଚାଳନା',
  'Mess Dashboard': 'ମେସ୍ ଡ୍ୟାସବୋର୍ଡ',
  'Weekly Menu': 'ସାପ୍ତାହିକ ଖାଦ୍ୟ ତାଲିକା',
  'Meal Feedback': 'ଭୋଜନ ମତାମତ',
  'Complaints & Issues': 'ଅଭିଯୋଗ ଓ ସମସ୍ୟା',
  'Meal Count / Attendance': 'ଭୋଜନ ଗଣନା / ଉପସ୍ଥିତି',
  'Mess Notices': 'ମେସ୍ ନୋଟିସ୍',
  'Overview': 'ସମୀକ୍ଷା',

  // Sidebar Menu Items
  'Take Hostel Attendance': 'ଛାତ୍ରାବାସ ଉପସ୍ଥିତି ନିଅନ୍ତୁ',
  'View Hostel Attendance': 'ଛାତ୍ରାବାସ ଉପସ୍ଥିତି ଦେଖନ୍ତୁ',
  'Room Allotment': 'କୋଠରୀ ବଣ୍ଟନ',
  'Hostel Blocks & Wings': 'ଛାତ୍ରାବାସ ବ୍ଲକ୍ ଓ ୱିଙ୍ଗ୍',
  'Rooms & Bed Allotment': 'କୋଠରୀ ଓ ଶଯ୍ୟା ବଣ୍ଟନ',
  'Hostel Leaves': 'ଛାତ୍ରାବାସ ଛୁଟି',
  'Apply Leave': 'ଛୁଟି ଆବେଦନ',
  'Digital Gate Passes': 'ଡିଜିଟାଲ୍ ଗେଟ୍ ପାସ୍',
  'Visitor Logs': 'ଦର୍ଶକ ଲଗ୍',
  'Visitor Register': 'ଦର୍ଶକ ରେଜିଷ୍ଟର',
  'Disciplinary Records': 'ଶୃଙ୍ଖଳାଗତ ରେକର୍ଡ',
  'Disciplinary Reviews': 'ଶୃଙ୍ଖଳାଗତ ସମୀକ୍ଷା',
  'Emergency Contacts': 'ଜରୁରୀକାଳୀନ ସମ୍ପର୍କ',
  'Mess & Food Feedback': 'ମେସ୍ ଓ ଭୋଜନ ମତାମତ',
  'Mess & Food Feedback Management': 'ମେସ୍ ଓ ଭୋଜନ ମତାମତ ପରିଚାଳନା',
  'Room Cleanliness Complaints': 'କୋଠରୀ ସ୍ୱଚ୍ଛତା ଅଭିଯୋଗ',
  'Room Cleanliness Complaints & SLA': 'କୋଠରୀ ସ୍ୱଚ୍ଛତା ଅଭିଯୋଗ ଓ ଏସ୍.ଏଲ୍.ଏ.',
  'Room Maintenance Complaints': 'କୋଠରୀ ରକ୍ଷଣାବେକ୍ଷଣ ଅଭିଯୋଗ',
  'Maintenance Complaints & SLA': 'ରକ୍ଷଣାବେକ୍ଷଣ ଅଭିଯୋଗ ଓ ଏସ୍.ଏଲ୍.ଏ.',
  'Furniture & Inventory': 'ଆସବାବପତ୍ର ଓ ସାମଗ୍ରୀ',
  'Furniture & Inventory Requisitions': 'ଆସବାବପତ୍ର ଓ ସାମଗ୍ରୀ ଚାହିଦା',
  'Warden & Caretaker Roster': 'ୱାର୍ଡେନ୍ ଓ ତତ୍ତ୍ୱାବଧାରକ ତାଲିକା',
  'Staff & Caretaker Roster': 'କର୍ମଚାରୀ ଓ ତତ୍ତ୍ୱାବଧାରକ ତାଲିକା',
  'Hostel Rules & Curfew': 'ଛାତ୍ରାବାସ ନିୟମ ଓ ସନ୍ଧ୍ୟା ସମୟ',
  'Hostel Fee Ledger': 'ଛାତ୍ରାବାସ ଫିସ୍ ଖାତା',
  'Warden Directory': 'ୱାର୍ଡେନ୍ ନିର୍ଦ୍ଦେଶିକା',
  'Warden Assignments': 'ୱାର୍ଡେନ୍ ଦାୟିତ୍ୱ',
  'Warden Permissions': 'ୱାର୍ଡେନ୍ ଅନୁମତି',
  'Duty & Leave Management': 'କର୍ତ୍ତବ୍ୟ ଓ ଛୁଟି ପରିଚାଳନା',
  'Warden Performance': 'ୱାର୍ଡେନ୍ କାର୍ଯ୍ୟଦକ୍ଷତା',
  'Add New Warden': 'ନୂତନ ୱାର୍ଡେନ୍ ଯୋଡ଼ନ୍ତୁ',
  'Hostel Buildings & Blocks': 'ଛାତ୍ରାବାସ ଭବନ ଓ ବ୍ଲକ୍',
  'Rooms & Bed Capacity': 'କୋଠରୀ ଓ ଶଯ୍ୟା କ୍ଷମତା',
  'Attendance Monitoring': 'ଉପସ୍ଥିତି ନିରୀକ୍ଷଣ',
  'Attendance Verification & Override': 'ଉପସ୍ଥିତି ଯାଞ୍ଚ ଓ ପରିବର୍ତ୍ତନ',
  'Student Leave Approvals': 'ଛାତ୍ର ଛୁଟି ଅନୁମୋଦନ',
  'Central Approval Center': 'କେନ୍ଦ୍ରୀୟ ଅନୁମୋଦନ କେନ୍ଦ୍ର',
  'Reports & Compliance Analytics': 'ବିବରଣୀ ଓ ଅନୁପାଳନ ବିଶ୍ଳେଷଣ',
  'Administrative Audit Logs': 'ପ୍ରଶାସନିକ ଅଡିଟ୍ ଲଗ୍',

  // Core CMS Modules & Portals
  'Students': 'ଛାତ୍ରଛାତ୍ରୀ',
  'Student': 'ଛାତ୍ର',
  'Student Directory': 'ଛାତ୍ର ନିର୍ଦ୍ଦେଶିକା',
  'Faculty': 'ଅଧ୍ୟାପକ ବୃନ୍ଦ',
  'Faculty Directory': 'ଅଧ୍ୟାପକ ନିର୍ଦ୍ଦେଶିକା',
  'Teachers': 'ଶିକ୍ଷକ ବୃନ୍ଦ',
  'Attendance': 'ଉପସ୍ଥିତି',
  'Take Attendance': 'ଉପସ୍ଥିତି ନିଅନ୍ତୁ',
  'View Attendance': 'ଉପସ୍ଥିତି ଦେଖନ୍ତୁ',
  'Examination': 'ପରୀକ୍ଷା',
  'Exam Cell': 'ପରୀକ୍ଷା ବିଭାଗ',
  'Marks & Grades': 'ମାର୍କ ଓ ଗ୍ରେଡ୍',
  'Fees & Payments': 'ଫିସ୍ ଓ ଦେୟ',
  'Fee Management': 'ଫିସ୍ ପରିଚାଳନା',
  'Hostel': 'ଛାତ୍ରାବାସ',
  'Library': 'ଗ୍ରନ୍ଥାଗାର',
  'Transport': 'ପରିବହନ',
  'Placement': 'ନିଯୁକ୍ତି',
  'Placement Cell': 'ନିଯୁକ୍ତି ସେଲ୍',
  'Admissions': 'ନାମଲେଖା',
  'Complaints': 'ଅଭିଯୋଗ',
  'Cleanliness': 'ସ୍ୱଚ୍ଛତା',
  'Maintenance': 'ରକ୍ଷଣାବେକ୍ଷଣ',
  'Staff': 'କର୍ମଚାରୀ',
  'Settings': 'ସେଟିଙ୍ଗ୍ସ',
  'Reports': 'ବିବରଣୀ',
  'Notices': 'ବିଜ୍ଞପ୍ତି',
  'Official College Notices': 'ସରକାରୀ କଲେଜ ବିଜ୍ଞପ୍ତି',
  'My Classes & Sections': 'ମୋର କ୍ଲାସ୍ ଓ ସେକ୍ସନ୍',
  "Today's Schedule": 'ଆଜିର କାର୍ଯ୍ୟସୂଚୀ',
  'Marks Entry': 'ମାର୍କ ପ୍ରବେଶ',
  'Internal Assessment': 'ଆଭ୍ୟନ୍ତରୀଣ ମୂଲ୍ୟାୟନ',
  'Assignment Management': 'ଅସାଇନ୍‌ମେଣ୍ଟ୍ ପରିଚାଳନା',
  'Student Mentoring': 'ଛାତ୍ର ପରାମର୍ଶ',
  'Lesson Plans': 'ପାଠ୍ୟ ଯୋଜନା',
  'Research & Publications': 'ଗବେଷଣା ଓ ପ୍ରକାଶନ',
  'Apply For Leave': 'ଛୁଟି ପାଇଁ ଆବେଦନ କରନ୍ତୁ',
  'Class Timetable': 'କ୍ଲାସ୍ ସମୟ ସାରଣୀ',
  'Subject': 'ବିଷୟ',
  'Semester': 'ସେମିଷ୍ଟାର୍',
  'Section': 'ସେକ୍ସନ୍',
  'Time': 'ସମୟ',
  'Room': 'କୋଠରୀ',
  'Mark Attendance': 'ଉପସ୍ଥିତି ଦିଅନ୍ତୁ',
  'Enter Marks': 'ମାର୍କ ଦିଅନ୍ତୁ',
  'Upload Material': 'ପାଠ୍ୟ ଉପକରଣ ଅପଲୋଡ୍ କରନ୍ତୁ',
  'Submitted Assignments': 'ଦାଖଲ ହୋଇଥିବା ଅସାଇନ୍‌ମେଣ୍ଟ୍',
  'Attendance Summary': 'ଉପସ୍ଥିତି ସାରାଂଶ',
  'Upcoming Examinations': 'ଆଗାମୀ ପରୀକ୍ଷା',
  'Fee Dues & Receipts': 'ବାକି ଫିସ୍ ଓ ରସିଦ',
  'Hostel & Room Allotment': 'ଛାତ୍ରାବାସ ଓ କୋଠରୀ ବଣ୍ଟନ',
  'Hostel Leave Application': 'ଛାତ୍ରାବାସ ଛୁଟି ଆବେଦନ',
  'Digital Gate Pass': 'ଡିଜିଟାଲ୍ ଗେଟ୍ ପାସ୍',
  'Library Books Issued': 'ପ୍ରଦତ୍ତ ପୁସ୍ତକ',
  'Assignments & Submissions': 'ଅସାଇନ୍‌ମେଣ୍ଟ୍ ଓ ଦାଖଲ',
  'Report a Complaint': 'ଅଭିଯୋଗ ଦାଖଲ କରନ୍ତୁ',
  'Food Feedback': 'ଭୋଜନ ମତାମତ',
  'Maintenance Requests': 'ରକ୍ଷଣାବେକ୍ଷଣ ଅନୁରୋଧ',
  'Bonafide Certificate Apply': 'ବୋନାଫାଇଡ୍ ପ୍ରମାଣପତ୍ର ଆବେଦନ',
  'My Grades & CGPA': 'ମୋର ଗ୍ରେଡ୍ ଓ ସିଜିପିଏ',
  'Download Hall Ticket': 'ପ୍ରବେଶ ପତ୍ର ଡାଉନଲୋଡ୍ କରନ୍ତୁ',
  'Pay Fees Online': 'ଅନଲାଇନ୍ ଫିସ୍ ପ୍ରଦାନ କରନ୍ତୁ',

  // Topbar / Header
  'Notifications': 'ବିଜ୍ଞପ୍ତି',
  'Campus Notifications': 'କ୍ୟାମ୍ପସ ବିଜ୍ଞପ୍ତି',
  'Search anything... (e.g. students, marks, notices)': 'ସନ୍ଧାନ କରନ୍ତୁ... (ଉଦା. ଛାତ୍ର, ମାର୍କ, ନୋଟିସ୍)',
  'Search anything...': 'ସନ୍ଧାନ କରନ୍ତୁ...',
  'Sign In': 'ଲଗ୍ ଇନ୍ କରନ୍ତୁ',
  'Sign Out': 'ଲଗ୍ ଆଉଟ୍ କରନ୍ତୁ',
  'Logout': 'ଲଗ୍ ଆଉଟ୍',
  'Log Out': 'ଲଗ୍ ଆଉଟ୍',
  'Language': 'ଭାଷା',
  'Select Language': 'ଭାଷା ଚୟନ କରନ୍ତୁ',
  'Select Language (Current: English)': 'ଭାଷା ଚୟନ (ବର୍ତ୍ତମାନ: English)',
  'Select Language (Current: Hindi)': 'ଭାଷା ଚୟନ (ବର୍ତ୍ତମାନ: हिन्दी)',
  'Select Language (Current: Odia)': 'ଭାଷା ଚୟନ (ବର୍ତ୍ତମାନ: ଓଡ଼ିଆ)',
  'English': 'English',
  'Hindi': 'हिन्दी',
  'Odia': 'ଓଡ଼ିଆ',
  'Theme': 'ଥିମ୍',
  'Light Mode': 'ଲାଇଟ୍ ମୋଡ୍',
  'Dark Mode': 'ଡାର୍କ ମୋଡ୍',
  'Switch to Light Mode': 'ଲାଇଟ୍ ମୋଡ୍ ବଦଳାନ୍ତୁ',
  'Switch to Dark Mode': 'ଡାର୍କ ମୋଡ୍ ବଦଳାନ୍ତୁ',
  'NAAC A++ AUTONOMOUS INSTITUTION': 'ନ୍ୟାକ୍ ଏ++ ସ୍ୱୟଂଶାସିତ ଅନୁଷ୍ଠାନ',
  'User Account Menu': 'ବ୍ୟବହାରକାରୀ ଖାତା ମେନୁ',
  'User Profile': 'ବ୍ୟବହାରକାରୀ ପ୍ରୋଫାଇଲ୍',
  'Profile': 'ପ୍ରୋଫାଇଲ୍',
  'Role & Access': 'ଭୂମିକା ଓ ଅନୁମତି',
  'Preferences': 'ପସନ୍ଦ',
  'No new notifications': 'କୌଣସି ନୂତନ ବିଜ୍ଞପ୍ତି ନାହିଁ',
  'Mark all as read': 'ସମସ୍ତ ପଠିତ ଚିହ୍ନିତ କରନ୍ତୁ',

  // Common Buttons & Actions
  'Add': 'ଯୋଡ଼ନ୍ତୁ',
  'Add Note': 'ନୋଟ୍ ଯୋଡ଼ନ୍ତୁ',
  'Edit': 'ସମ୍ପାଦନା କରନ୍ତୁ',
  'Edit Note': 'ନୋଟ୍ ସମ୍ପାଦନା କରନ୍ତୁ',
  'Delete': 'ହଟାନ୍ତୁ',
  'Delete Note': 'ନୋଟ୍ ହଟାନ୍ତୁ',
  'Save': 'ସାଇତନ୍ତୁ',
  'Save Note': 'ନୋଟ୍ ସାଇତନ୍ତୁ',
  'Submit': 'ଦାଖଲ କରନ୍ତୁ',
  'Submit Note': 'ନୋଟ୍ ଦାଖଲ କରନ୍ତୁ',
  'Submit (Complete)': 'ଦାଖଲ କରନ୍ତୁ (ସମ୍ପୂର୍ଣ୍ଣ)',
  'Submit (Complete Task)': 'ଦାଖଲ କରନ୍ତୁ (କାର୍ଯ୍ୟ ସମ୍ପୂର୍ଣ୍ଣ)',
  'Update': 'ଅଦ୍ୟତନ କରନ୍ତୁ',
  'Close': 'ବନ୍ଦ କରନ୍ତୁ',
  'Cancel': 'ବାତିଲ୍ କରନ୍ତୁ',
  'Confirm': 'ନିଶ୍ଚିତ କରନ୍ତୁ',
  'View': 'ଦେଖନ୍ତୁ',
  'View Full Details': 'ସମ୍ପୂର୍ଣ୍ଣ ବିବରଣୀ ଦେଖନ୍ତୁ',
  'View Document': 'ଦସ୍ତାବିଜ୍ ଦେଖନ୍ତୁ',
  'Download': 'ଡାଉନଲୋଡ୍ କରନ୍ତୁ',
  'Export': 'ରପ୍ତାନି କରନ୍ତୁ',
  'Print': 'ମୁଦ୍ରଣ କରନ୍ତୁ',
  'Search': 'ସନ୍ଧାନ କରନ୍ତୁ',
  'Filter': 'ଫିଲ୍ଟର୍',
  'Reset': 'ପୁନଃସ୍ଥାପନ କରନ୍ତୁ',
  'Verify': 'ଯାଞ୍ଚ କରନ୍ତୁ',
  'Approve': 'ଅନୁମୋଦନ କରନ୍ତୁ',
  'Reject': 'ଅଗ୍ରାହ୍ୟ କରନ୍ତୁ',
  'Inspect': 'ପରୀକ୍ଷଣ କରନ୍ତୁ',
  'Vacate': 'ଖାଲି କରନ୍ତୁ',
  'Apply': 'ଆବେଦନ କରନ୍ତୁ',
  'Register': 'ପଞ୍ଜୀକରଣ କରନ୍ତୁ',
  'Back': 'ପଛକୁ',
  'Next': 'ପରବର୍ତ୍ତୀ',
  'Previous': 'ପୂର୍ବବର୍ତ୍ତୀ',
  'Refresh': 'ପୁନର୍ତାଜା କରନ୍ତୁ',
  'Add Floor': 'ମହଲା ଯୋଡ଼ନ୍ତୁ',
  'Add Room': 'କୋଠରୀ ଯୋଡ଼ନ୍ତୁ',
  'Add Bed': 'ଶଯ୍ୟା ଯୋଡ଼ନ୍ତୁ',
  'Allocate New Bed': 'ନୂତନ ଶଯ୍ୟା ବଣ୍ଟନ କରନ୍ତୁ',
  'Add Complex': 'ପରିସର ଯୋଡ଼ନ୍ତୁ',
  'Add Hostel Complex': 'ଛାତ୍ରାବାସ ପରିସର ଯୋଡ଼ନ୍ତୁ',
  'Print Duty Roster': 'କର୍ତ୍ତବ୍ୟ ତାଲିକା ପ୍ରିଣ୍ଟ୍ କରନ୍ତୁ',
  'Raise Indent': 'ଚାହିଦା ପତ୍ର ଦିଅନ୍ତୁ',
  'Quick Connect': 'ଶୀଘ୍ର ସମ୍ପର୍କ',
  'Save Note / Schedule Task': 'ନୋଟ୍ ସାଇତନ୍ତୁ / କାର୍ଯ୍ୟ ନିର୍ଦ୍ଧାରଣ କରନ୍ତୁ',
  'Lodge Maintenance Request': 'ରକ୍ଷଣାବେକ୍ଷଣ ଅନୁରୋଧ କରନ୍ତୁ',
  'Confirm Resolved': 'ସମାଧାନ ନିଶ୍ଚିତ କରନ୍ତୁ',
  'Reopen Issue': 'ସମସ୍ୟା ପୁନଃ ଖୋଲନ୍ତୁ',
  'Approve & Assign': 'ଅନୁମୋଦନ ଓ ଦାୟିତ୍ୱ ପ୍ରଦାନ',

  // Hostel Residence & Maintenance
  'My Hostel Residence & Accommodation': 'ମୋର ଛାତ୍ରାବାସ ନିବାସ ଓ ରହଣି',
  'Room allocation, roommates, hostel guidelines, and 24/7 maintenance desk': 'କୋଠରୀ ବଣ୍ଟନ, ରୁମମେଟ୍ସ, ଛାତ୍ରାବାସ ନିୟମାବଳୀ ଏବଂ ୨୪/୭ ରକ୍ଷଣାବେକ୍ଷଣ ଡେସ୍କ',
  'ALLOCATED ROOM': 'ଆବଣ୍ଟିତ କୋଠରୀ',
  'RESIDENCE COMPLEX': 'ଆବାସିକ ପରିସର',
  'HOSTEL FEE STATUS': 'ଛାତ୍ରାବାସ ଫିସ୍ ସ୍ଥିତି',
  'Partially Paid': 'ଆଂଶିକ ପୈଠ',
  'Paid': 'ପୈଠ ହୋଇଛି',
  'Balance Due': 'ବାକି ରାଶି',
  'Mess Clearance: Active': 'ମେସ୍ କ୍ଲିୟରାନ୍ସ: ସକ୍ରିୟ',
  'Roommates': 'ରୁମମେଟ୍ସ',
  'Hostel Regulations & Code of Conduct': 'ଛାତ୍ରାବାସ ନିୟମ ଓ ଆଚରଣ ବିଧି',
  'My Maintenance Complaints': 'ମୋର ରକ୍ଷଣାବେକ୍ଷଣ ଅଭିଯୋଗ',
  'Details Recorded': 'ବିବରଣୀ ଲିପିବଦ୍ଧ',
  'Assigned Resident Warden': 'ନିଯୁକ୍ତ ଆବାସିକ ୱାର୍ଡେନ୍',
  'Auto-routed by Hostel & Block': 'ଛାତ୍ରାବାସ ଓ ବ୍ଲକ୍ ଦ୍ୱାରା ସ୍ୱୟଂଚାଳିତ',
  'Auto-assigned by workload': 'କାର୍ଯ୍ୟଭାର ଅନୁଯାୟୀ ସ୍ୱୟଂଚାଳିତ ନିଯୁକ୍ତ',
  'Awaiting Resident Warden approval and technician assignment': 'ଆବାସିକ ୱାର୍ଡେନ୍ ଅନୁମୋଦନ ଓ ଟେକ୍ନିସିଆନ୍ ନିଯୁକ୍ତି ଅପେକ୍ଷାରେ',
  'Status Log': 'ସ୍ଥିତି ଲଗ୍',

  // Landing Page
  'Welcome Back': 'ସ୍ୱାଗତମ୍',
  'Sign in to your Apna Campus account': 'ଆପଣଙ୍କ ଆପଣା କ୍ୟାମ୍ପସ ଖାତାରେ ଲଗ୍ ଇନ୍ କରନ୍ତୁ',
  'College ID or Registration Number': 'କଲେଜ ଆଇଡି କିମ୍ବା ପଞ୍ଜୀକରଣ ସଂଖ୍ୟା',
  'Password': 'ପାସୱାର୍ଡ',
  'Remember my credentials on this device': 'ଏହି ଡିଭାଇସରେ ମୋର ତଥ୍ୟ ମନେ ରଖନ୍ତୁ',
  'Need help signing in? Contact Campus IT Desk': 'ଲଗ୍ ଇନ୍ କରିବାରେ ସାହାଯ୍ୟ ଦରକାର? କ୍ୟାମ୍ପସ ଆଇଟି ଡେସ୍କ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ',
  'APNA CAMPUS': 'ଆପଣା କ୍ୟାମ୍ପସ',
  'COLLEGE MANAGEMENT ERP': 'କଲେଜ ପରିଚାଳନା ଇଆରପି',
  'AUTONOMOUS HIGHER EDUCATION PORTAL': 'ସ୍ୱୟଂଶାସିତ ଉଚ୍ଚଶିକ୍ଷା ପୋର୍ଟାଲ୍',
  'NAAC A++ ACCREDITED': 'ନ୍ୟାକ୍ ଏ++ ମାନ୍ୟତାପ୍ରାପ୍ତ',
  'LEARN': 'ଶିଖନ୍ତୁ',
  'GROW': 'ବଢ଼ନ୍ତୁ',
  'CONNECT': 'ଯୋଡ଼ି ହୁଅନ୍ତୁ',
  'A Smarter': 'ଏକ ଉନ୍ନତତର',
  'Campus Experience.': 'କ୍ୟାମ୍ପସ ଅନୁଭୂତି।',
  'People': 'ଲୋକମାନେ',
  'Administration': 'ପ୍ରଶାସନ',
  'Opportunities': 'ସୁଯୋଗ',
  'Smart Timetable': 'ସ୍ମାର୍ଟ ସମୟ ସାରଣୀ',
  'Digital Evaluations': 'ଡିଜିଟାଲ୍ ମୂଲ୍ୟାୟନ',
  'Smart Attendance': 'ସ୍ମାର୍ଟ ଉପସ୍ଥିତି',
  'STUDENTS': 'ଛାତ୍ରଛାତ୍ରୀ',
  'FACULTY': 'ଅଧ୍ୟାପକ',
  'PROGRAMS': 'ପାଠ୍ୟକ୍ରମ',

  // Statuses & Table Headers
  'Status': 'ସ୍ଥିତି',
  'Active': 'ସକ୍ରିୟ',
  'Inactive': 'ନିଷ୍କ୍ରିୟ',
  'Pending': 'ବିଚାରାଧୀନ',
  'Completed': 'ସମ୍ପୂର୍ଣ୍ଣ',
  'Approved': 'ଅନୁମୋଦିତ',
  'Rejected': 'ଅଗ୍ରାହ୍ୟ',
  'Submitted': 'ଦାଖଲ ହୋଇଛି',
  'In Progress': 'ଚାଲୁ ରହିଛି',
  'Awaiting Student Verification': 'ଛାତ୍ର ଯାଞ୍ଚ ଅପେକ୍ଷାରେ',
  'Awaiting Verification': 'ଯାଞ୍ଚ ଅପେକ୍ଷାରେ',
  'Resolved': 'ସମାହିତ',
  'Reopened': 'ପୁନର୍ବାର ଖୋଲାଯାଇଛି',
  'Overdue': 'ସମୟାତୀତ',
  'High': 'ଉଚ୍ଚ',
  'Medium': 'ମଧ୍ୟମ',
  'Low': 'ନିମ୍ନ',
  'Urgent': 'ଜରୁରୀ',
  'Plumbing': 'ପାଇପ୍ କାମ (ପ୍ଲମ୍ବିଙ୍ଗ୍)',
  'Electrical': 'ବିଦ୍ୟୁତ୍ (ଇଲେକ୍ଟ୍ରିକାଲ୍)',
  'Cleaning': 'ସଫେଇ (କ୍ଲିନିଙ୍ଗ୍)',
  'Furniture': 'ଆସବାବପତ୍ର (ଫର୍ନିଚର୍)',
  'Civil': 'ନିର୍ମାଣ (ସିଭିଲ୍)',
  'Present': 'ଉପସ୍ଥିତ',
  'Absent': 'ଅନୁପସ୍ଥିତ',
  'On Leave': 'ଛୁଟିରେ',
  'On Duty': 'କର୍ତ୍ତବ୍ୟରତ',
  'Action': 'କାର୍ଯ୍ୟାନୁଷ୍ଠାନ',
  'Actions': 'କାର୍ଯ୍ୟାନୁଷ୍ଠାନ',
};

// Subphrase token mappings
export const SUBPHRASE_MAPPINGS_HINDI = [
  ['Pending Calendar Reminders & Tasks', 'लंबित कैलेंडर अनुस्मारक और कार्य'],
  ['Close (Review Later)', 'बंद करें (बाद में समीक्षा करें)'],
  ['Submit (Complete Task)', 'जमा करें (कार्य पूर्ण करें)'],
  ['Submit (Complete)', 'जमा करें (पूर्ण)'],
  ['Overdue (Pending)', 'अतिदेय (लंबित)'],
  ["Today's Task", 'आज का कार्य'],
  ['Upcoming Task', 'आगामी कार्य'],
  ['Completed Tasks', 'पूर्ण कार्य'],
  ['No notes scheduled for this date.', 'इस तिथि के लिए कोई नोट निर्धारित नहीं है।'],
  ['Click "+ Add Note" below to schedule your task or reminder.', 'अपना कार्य या अनुस्मारक निर्धारित करने के लिए नीचे "+ नोट जोड़ें" पर क्लिक करें।'],
  ['Save Note / Schedule Task', 'नोट सहेजें / कार्य निर्धारित करें'],
  ['General / 24x7 Resident', 'सामान्य / 24x7 निवासी'],
  ['Central Dining Hall', 'केंद्रीय भोजन कक्ष'],
  ['Boys Residence', 'छात्र निवास'],
  ['Girls Residence', 'छात्रा निवास'],
  ['All Hostels', 'सभी छात्रावास'],
  ['Floors', 'मंज़िलें'],
  ['Rooms', 'कमरे'],
  ['Central Dining Mess Hall', 'केंद्रीय भोजन मेस हॉल'],
  ['500 Mbps Wi-Fi', '500 Mbps वाई-फ़ाई'],
];

export const SUBPHRASE_MAPPINGS_ODIA = [
  ['Pending Calendar Reminders & Tasks', 'ବିଚାରାଧୀନ କ୍ୟାଲେଣ୍ଡର ସ୍ମାରକୀ ଓ କାର୍ଯ୍ୟ'],
  ['Close (Review Later)', 'ବନ୍ଦ କରନ୍ତୁ (ପରେ ଦେଖନ୍ତୁ)'],
  ['Submit (Complete Task)', 'ଦାଖଲ କରନ୍ତୁ (କାର୍ଯ୍ୟ ସମ୍ପୂର୍ଣ୍ଣ)'],
  ['Submit (Complete)', 'ଦାଖଲ କରନ୍ତୁ (ସମ୍ପୂର୍ଣ୍ଣ)'],
  ['Overdue (Pending)', 'ସମୟାତୀତ (ବିଚାରାଧୀନ)'],
  ["Today's Task", 'ଆଜିର କାର୍ଯ୍ୟ'],
  ['Upcoming Task', 'ଆଗାମୀ କାର୍ଯ୍ୟ'],
  ['Completed Tasks', 'ସମ୍ପୂର୍ଣ୍ଣ କାର୍ଯ୍ୟ'],
  ['No notes scheduled for this date.', 'ଏହି ତାରିଖ ପାଇଁ କୌଣସି ଟିପ୍ପଣୀ ନିର୍ଦ୍ଧାରିତ ନାହିଁ।'],
  ['Click "+ Add Note" below to schedule your task or reminder.', 'ଆପଣଙ୍କ କାର୍ଯ୍ୟ ବା ସ୍ମାରକୀ ନିର୍ଦ୍ଧାରଣ କରିବା ପାଇଁ ତଳେ "+ ନୋଟ୍ ଯୋଡ଼ନ୍ତୁ" କ୍ଲିକ୍ କରନ୍ତୁ।'],
  ['Save Note / Schedule Task', 'ନୋଟ୍ ସାଇତନ୍ତୁ / କାର୍ଯ୍ୟ ନିର୍ଦ୍ଧାରଣ କରନ୍ତୁ'],
  ['General / 24x7 Resident', 'ସାଧାରଣ / ୨୪x୭ ଆବାସିକ'],
  ['Central Dining Hall', 'କେନ୍ଦ୍ରୀୟ ଭୋଜନ ଶାଳା'],
  ['Boys Residence', 'ଛାତ୍ର ନିବାସ'],
  ['Girls Residence', 'ଛାତ୍ରୀ ନିବାସ'],
  ['All Hostels', 'ସମସ୍ତ ଛାତ୍ରାବାସ'],
  ['Floors', 'ମହଲାଗୁଡ଼ିକ'],
  ['Rooms', 'କୋଠରୀଗୁଡ଼ିକ'],
  ['Central Dining Mess Hall', 'କେନ୍ଦ୍ରୀୟ ମେସ୍ ଭୋଜନ ଶାଳା'],
  ['500 Mbps Wi-Fi', '୫୦୦ ଏମବିପିଏସ ୱାଇ-ଫାଇ'],
];

// Build reverse dictionaries for restoring English
export const REVERSE_HINDI_DICTIONARY = {};
for (const [en, hi] of Object.entries(HINDI_DICTIONARY)) {
  REVERSE_HINDI_DICTIONARY[hi] = en;
}

export const REVERSE_ODIA_DICTIONARY = {};
for (const [en, od] of Object.entries(ODIA_DICTIONARY)) {
  REVERSE_ODIA_DICTIONARY[od] = en;
}

/**
 * Checks if a string looks like user-entered personal content
 * (names, emails, phone numbers, codes, currency, dates, IDs) that must NOT be translated.
 */
export function isUserEnteredContent(str) {
  if (!str || typeof str !== 'string') return true;
  const trimmed = str.trim();
  if (!trimmed) return true;

  // Pure digits or dates
  if (/^\d+$/.test(trimmed)) return true;
  if (/^[\d\s\-\+\(\)\:\.\,\/]+$/.test(trimmed)) return true;

  // Email address
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) return true;

  // Phone number (e.g. +91 94370 11223)
  if (/^\+?\d[\d\s\-]{8,}\d$/.test(trimmed)) return true;

  // Currency (e.g. Rs. 3,063.04 or ₹20,000)
  if (/^(Rs\.|₹)\s*[\d\.\,]+/i.test(trimmed)) return true;

  // System IDs and codes (e.g. STF-101, REQ-MAT, S-211, F-301, CMP-2026-381)
  if (/^[A-Z]{1,6}\-[\d]+[A-Za-z0-9\-]*$/.test(trimmed)) return true;

  // Personal human names with salutations: Mr. Rajesh Jena, Mrs. Nibedita Das, Dr. S. Mohanty
  if (/^(Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/.test(trimmed)) return true;

  return false;
}

/**
 * Translate a single text string into targetLang ('en' | 'hi' | 'or')
 */
export function translateText(text, targetLang = 'en') {
  if (!text || typeof text !== 'string') return text;
  const trimmed = text.trim();
  if (!trimmed) return text;

  const leading = text.match(/^\s*/)[0];
  const trailing = text.match(/\s*$/)[0];

  // If restoring to English
  if (targetLang === 'en') {
    if (REVERSE_HINDI_DICTIONARY[trimmed]) {
      return `${leading}${REVERSE_HINDI_DICTIONARY[trimmed]}${trailing}`;
    }
    if (REVERSE_ODIA_DICTIONARY[trimmed]) {
      return `${leading}${REVERSE_ODIA_DICTIONARY[trimmed]}${trailing}`;
    }
    let restored = trimmed;
    for (const [hi, en] of SUBPHRASE_MAPPINGS_HINDI.map(([en, hi]) => [hi, en])) {
      if (restored.includes(hi)) restored = restored.replaceAll(hi, en);
    }
    for (const [od, en] of SUBPHRASE_MAPPINGS_ODIA.map(([en, od]) => [od, en])) {
      if (restored.includes(od)) restored = restored.replaceAll(od, en);
    }
    return `${leading}${restored}${trailing}`;
  }

  // Strict check: preserve user personal content
  if (isUserEnteredContent(text)) {
    return text;
  }

  const dict = targetLang === 'hi' ? HINDI_DICTIONARY : ODIA_DICTIONARY;
  const subphrases = targetLang === 'hi' ? SUBPHRASE_MAPPINGS_HINDI : SUBPHRASE_MAPPINGS_ODIA;

  // 1. First, if incoming text is in the other language, convert back to English base first
  let enBase = trimmed;
  if (targetLang === 'or' && REVERSE_HINDI_DICTIONARY[trimmed]) {
    enBase = REVERSE_HINDI_DICTIONARY[trimmed];
  } else if (targetLang === 'hi' && REVERSE_ODIA_DICTIONARY[trimmed]) {
    enBase = REVERSE_ODIA_DICTIONARY[trimmed];
  }

  // Tier 1: Exact dictionary match
  if (dict[enBase]) {
    return `${leading}${dict[enBase]}${trailing}`;
  }

  // Tier 2: Subphrase & token replacement
  let transformed = enBase;
  let hasReplaced = false;

  for (const [en, translation] of subphrases) {
    if (transformed.includes(en)) {
      transformed = transformed.replaceAll(en, translation);
      hasReplaced = true;
    }
  }

  if (hasReplaced) {
    return `${leading}${transformed}${trailing}`;
  }

  // Case-insensitive fallback
  for (const [enKey, transVal] of Object.entries(dict)) {
    if (enKey.toLowerCase() === enBase.toLowerCase()) {
      return `${leading}${transVal}${trailing}`;
    }
  }

  return text;
}

// Map to remember original English text for each DOM text node
const originalTextMap = new WeakMap();

let globalObserver = null;
let currentActiveLang = 'en';

/**
 * Recursively walk DOM nodes and translate text, placeholders, and titles
 */
function walkAndTranslate(node, targetLang) {
  if (!node) return;

  if (node.nodeType === 3) {
    // Text node
    const val = node.nodeValue;
    if (!val || !val.trim()) return;

    const parent = node.parentElement;
    if (!parent) return;
    if (['SCRIPT', 'STYLE'].includes(parent.tagName)) return;
    if (
      parent.isContentEditable ||
      parent.classList?.contains('user-data-untranslated') ||
      parent.classList?.contains('apna-user-name') ||
      parent.closest('.user-data-untranslated') ||
      parent.closest('.apna-user-name')
    ) {
      return;
    }

    if (targetLang === 'hi' || targetLang === 'or' || targetLang === 'od') {
      const lang = targetLang === 'od' ? 'or' : targetLang;
      if (!originalTextMap.has(node)) {
        originalTextMap.set(node, val);
      }
      const original = originalTextMap.get(node);
      const translated = translateText(original, lang);
      if (translated !== val) {
        node.nodeValue = translated;
      }
    } else {
      // Restore English
      if (originalTextMap.has(node)) {
        const original = originalTextMap.get(node);
        if (node.nodeValue !== original) {
          node.nodeValue = original;
        }
      } else {
        const restored = translateText(val, 'en');
        if (restored !== val) {
          node.nodeValue = restored;
        }
      }
    }
  } else if (node.nodeType === 1) {
    // Element node
    const tag = node.tagName;
    if (['SCRIPT', 'STYLE'].includes(tag)) return;
    if (
      node.isContentEditable ||
      node.classList?.contains('user-data-untranslated') ||
      node.classList?.contains('apna-user-name')
    ) {
      return;
    }

    // Translate input & textarea placeholders
    if (tag === 'INPUT' || tag === 'TEXTAREA') {
      const ph = node.getAttribute('placeholder');
      if (ph) {
        if (targetLang === 'hi' || targetLang === 'or' || targetLang === 'od') {
          const lang = targetLang === 'od' ? 'or' : targetLang;
          if (!node.hasAttribute('data-orig-placeholder')) {
            node.setAttribute('data-orig-placeholder', ph);
          }
          const orig = node.getAttribute('data-orig-placeholder');
          const translated = translateText(orig, lang);
          if (ph !== translated) {
            node.setAttribute('placeholder', translated);
          }
        } else {
          if (node.hasAttribute('data-orig-placeholder')) {
            node.setAttribute('placeholder', node.getAttribute('data-orig-placeholder'));
          } else {
            node.setAttribute('placeholder', translateText(ph, 'en'));
          }
        }
      }
      return;
    }

    // Translate title attribute
    const title = node.getAttribute('title');
    if (title && !isUserEnteredContent(title)) {
      if (targetLang === 'hi' || targetLang === 'or' || targetLang === 'od') {
        const lang = targetLang === 'od' ? 'or' : targetLang;
        if (!node.hasAttribute('data-orig-title')) {
          node.setAttribute('data-orig-title', title);
        }
        const orig = node.getAttribute('data-orig-title');
        node.setAttribute('title', translateText(orig, lang));
      } else {
        if (node.hasAttribute('data-orig-title')) {
          node.setAttribute('title', node.getAttribute('data-orig-title'));
        }
      }
    }

    // Recurse children
    for (const child of node.childNodes) {
      walkAndTranslate(child, targetLang);
    }
  }
}

/**
 * Apply language to entire DOM and set up dynamic observer for React updates
 */
export function applyLanguageToDOM(targetLang = 'en') {
  if (typeof document === 'undefined') return;

  const validLang = (targetLang === 'od' ? 'or' : targetLang) || 'en';
  currentActiveLang = validLang;
  const docEl = document.documentElement;
  docEl.setAttribute('lang', validLang);

  // 1. Initial full-page sweep
  walkAndTranslate(document.body, validLang);

  // 2. Setup dynamic MutationObserver so tab switching, modals, and React re-renders automatically stay translated
  if (!globalObserver && typeof MutationObserver !== 'undefined') {
    globalObserver = new MutationObserver((mutations) => {
      if (currentActiveLang === 'hi' || currentActiveLang === 'or') {
        for (const m of mutations) {
          if (m.type === 'childList') {
            for (const added of m.addedNodes) {
              walkAndTranslate(added, currentActiveLang);
            }
          }
        }
      }
    });

    globalObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}

/**
 * Get current stored language ('en' | 'hi' | 'or')
 */
export function getCurrentLanguage() {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('apna_language') || localStorage.getItem('collegeflow_user_lang');
    if (saved && (saved === 'en' || saved === 'hi' || saved === 'or' || saved === 'od')) {
      return saved === 'od' ? 'or' : saved;
    }
  }
  return currentActiveLang || 'en';
}

/**
 * Switch global language across entire project
 */
export function setLanguage(langCode = 'en') {
  const code = (langCode === 'od' ? 'or' : langCode) || 'en';
  if (!['en', 'hi', 'or'].includes(code)) return;

  currentActiveLang = code;

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('apna_language', code);
      localStorage.setItem('collegeflow_user_lang', code);
    } catch (e) {
      console.warn('Failed to save language setting:', e);
    }
  }

  // Apply to DOM immediately
  applyLanguageToDOM(code);

  // Notify listeners
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent('apna_language_changed', { detail: { language: code } }));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
  }

  return code;
}

/**
 * Helper function for translating any specific string in components
 */
export function t(text) {
  return translateText(text, getCurrentLanguage());
}

/**
 * Subscribe to language changes
 */
export function subscribeLanguage(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleCustom = (e) => {
    callback(e.detail?.language || getCurrentLanguage());
  };

  const handleStorage = (e) => {
    if (!e || e.key === 'apna_language' || e.key === 'collegeflow_user_lang') {
      callback(getCurrentLanguage());
    }
  };

  window.addEventListener('apna_language_changed', handleCustom);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener('apna_language_changed', handleCustom);
    window.removeEventListener('storage', handleStorage);
  };
}

/**
 * Initialize language from storage and apply to DOM
 */
export function initLanguage() {
  const initLang = getCurrentLanguage();
  applyLanguageToDOM(initLang);
  return initLang;
}

// Initialize stored language on load
if (typeof window !== 'undefined') {
  const initLang = getCurrentLanguage();
  if (initLang && initLang !== 'en') {
    // Run after initial DOM load
    setTimeout(() => applyLanguageToDOM(initLang), 100);
  }
}
