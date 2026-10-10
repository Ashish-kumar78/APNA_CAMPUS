-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'MANAGEMENT', 'PRINCIPAL', 'ADMIN', 'HOD', 'FACULTY', 'STUDENT', 'EXAM_CELL', 'ACCOUNTS', 'LIBRARY', 'PLACEMENT', 'TRANSPORT', 'HOSTEL', 'STAFF', 'WARDEN', 'CANTEEN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "department" TEXT,
    "designation" TEXT,
    "phone" TEXT,
    "detail" TEXT,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastLogin" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "studentId" TEXT NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "gender" TEXT DEFAULT 'Female',
    "dob" TEXT DEFAULT '15-03-2005',
    "bloodGroup" TEXT DEFAULT 'O+',
    "category" TEXT DEFAULT 'General',
    "religion" TEXT DEFAULT 'Hindu',
    "department" TEXT NOT NULL DEFAULT 'Computer Science & Engineering',
    "deptCode" TEXT NOT NULL DEFAULT 'CSE',
    "semester" TEXT NOT NULL DEFAULT 'Semester 5',
    "section" TEXT NOT NULL DEFAULT 'Section A',
    "academicYear" TEXT NOT NULL DEFAULT '2026-27',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "cgpa" DOUBLE PRECISION NOT NULL DEFAULT 8.42,
    "attendance" INTEGER NOT NULL DEFAULT 92,
    "walletBalance" DOUBLE PRECISION NOT NULL DEFAULT 1450.0,
    "hostelName" TEXT DEFAULT 'Sarojini Girls Residence (Block A)',
    "roomNumber" TEXT DEFAULT '204',
    "bedNumber" TEXT DEFAULT 'Bed 01 (Window Side)',
    "floor" TEXT DEFAULT 'Floor 2',
    "wardenName" TEXT DEFAULT 'Mrs. Nibedita Das',
    "wardenContact" TEXT DEFAULT '+91 94370 33445',
    "transferConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "transferCampus" TEXT,
    "transferCity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guardian" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "contactNumber" TEXT,
    "email" TEXT,

    CONSTRAINT "Guardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Permanent',
    "addressLine" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "pincode" TEXT NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Verified',
    "verifiedByAdmin" BOOLEAN NOT NULL DEFAULT true,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faculty" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "department" TEXT NOT NULL DEFAULT 'Computer Science & Engineering',
    "designation" TEXT NOT NULL DEFAULT 'Associate Professor',
    "assignedSubjects" TEXT[],
    "assignedSections" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hod" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "department" TEXT NOT NULL DEFAULT 'Computer Science & Engineering',
    "deptCode" TEXT NOT NULL DEFAULT 'CSE',
    "experience" TEXT NOT NULL DEFAULT '18 Years',
    "qualification" TEXT NOT NULL DEFAULT 'Ph.D in AI & Systems',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hod" TEXT NOT NULL,
    "hodEmail" TEXT NOT NULL,
    "studentsCount" INTEGER NOT NULL DEFAULT 0,
    "facultyCount" INTEGER NOT NULL DEFAULT 0,
    "subjectsCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Active',

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Semester" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL DEFAULT '2026-27',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "subjectsCount" INTEGER NOT NULL DEFAULT 6,
    "studentsCount" INTEGER NOT NULL DEFAULT 540,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "studentsCount" INTEGER NOT NULL DEFAULT 0,
    "classRepresentative" TEXT,
    "room" TEXT,
    "facultyCoordinator" TEXT,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT NOT NULL DEFAULT 'CSE',
    "semester" TEXT NOT NULL DEFAULT 'Semester 5',
    "credits" INTEGER NOT NULL DEFAULT 4,
    "type" TEXT NOT NULL DEFAULT 'Theory + Lab',
    "assignedFaculty" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarkingScheme" (
    "id" TEXT NOT NULL,
    "assessmentType" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "maxMarks" DOUBLE PRECISION NOT NULL,
    "weightage" DOUBLE PRECISION NOT NULL,
    "formula" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',

    CONSTRAINT "MarkingScheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentMark" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "subjectCode" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "semester" TEXT NOT NULL DEFAULT 'Semester 5',
    "section" TEXT NOT NULL DEFAULT 'Section A',
    "modular1" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "modular2" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quiz1" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quiz2" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quiz3" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quiz4" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quiz5" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quiz6" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "assignment1" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "assignment2" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "surpriseTest1" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "surpriseTest2" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "labWork" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalMarks" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalWeightage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentMark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalQueue" (
    "id" TEXT NOT NULL,
    "subjectCode" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "faculty" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "submittedDate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "hodRemarks" TEXT,
    "reviewedAt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "targetStudent" TEXT,
    "subject" TEXT,
    "assessment" TEXT,
    "oldMark" TEXT,
    "newMark" TEXT,
    "changedAt" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectCode" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "faculty" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Theory',
    "held" INTEGER NOT NULL DEFAULT 0,
    "attended" INTEGER NOT NULL DEFAULT 0,
    "percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiometricLog" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "point" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "BiometricLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeStructure" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "tuitionFee" DOUBLE PRECISION NOT NULL,
    "developmentFee" DOUBLE PRECISION NOT NULL,
    "labLibraryFee" DOUBLE PRECISION NOT NULL,
    "examinationFee" DOUBLE PRECISION NOT NULL,
    "hostelMessFee" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FeeStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeTransaction" (
    "id" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "head" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueAmount" DOUBLE PRECISION DEFAULT 0,
    "mode" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Verified',
    "receiptNo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scholarship" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "authority" TEXT NOT NULL,
    "benefit" TEXT NOT NULL,
    "beneficiaries" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',

    CONSTRAINT "Scholarship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hostel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "totalFloors" INTEGER NOT NULL,
    "totalRooms" INTEGER NOT NULL,
    "totalBeds" INTEGER NOT NULL,
    "occupiedBeds" INTEGER NOT NULL,
    "availableBeds" INTEGER NOT NULL,
    "warden" TEXT NOT NULL,
    "contact" TEXT NOT NULL,

    CONSTRAINT "Hostel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelRoom" (
    "id" TEXT NOT NULL,
    "hostelId" TEXT NOT NULL,
    "hostelName" TEXT NOT NULL,
    "floor" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "occupied" INTEGER NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "HostelRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelComplaint" (
    "id" TEXT NOT NULL,
    "studentId" TEXT,
    "studentName" TEXT NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "hostel" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "filedDate" TEXT NOT NULL,
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostelComplaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelVisitor" (
    "id" TEXT NOT NULL,
    "visitorName" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "inTime" TEXT NOT NULL,
    "outTime" TEXT DEFAULT 'Pending Sign-out',
    "passNumber" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HostelVisitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "prepTime" TEXT NOT NULL,
    "calories" TEXT NOT NULL,

    CONSTRAINT "FoodItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanteenOrder" (
    "id" TEXT NOT NULL,
    "studentId" TEXT,
    "studentName" TEXT NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "paymentMode" TEXT NOT NULL DEFAULT 'RFID Smart Card',
    "orderedAt" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CanteenOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffRoster" (
    "id" TEXT NOT NULL,
    "staffType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT,
    "roleOrCategory" TEXT,
    "outletOrZone" TEXT,
    "assignedHostelOrPost" TEXT,
    "roomOffice" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "shift" TEXT NOT NULL,
    "badgeNumber" TEXT,
    "fssaiLicense" TEXT,
    "emergencyContact" TEXT,
    "speciality" TEXT,
    "qualification" TEXT,
    "assignedAgency" TEXT,
    "bloodGroup" TEXT,
    "residentsCount" INTEGER,
    "totalBeds" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "joiningYear" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffRoster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notice" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "dept" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackSurvey" (
    "id" TEXT NOT NULL,
    "formType" TEXT NOT NULL,
    "targetId" TEXT,
    "targetName" TEXT,
    "rating" INTEGER NOT NULL,
    "comments" TEXT,
    "studentId" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackSurvey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "unread" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holiday" (
    "id" TEXT NOT NULL,
    "rawDate" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "daysLeft" INTEGER,

    CONSTRAINT "Holiday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamSchedule" (
    "id" TEXT NOT NULL,
    "examCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "department" TEXT NOT NULL DEFAULT 'All Departments',
    "session" TEXT NOT NULL DEFAULT 'Morning (10:00 AM - 01:00 PM)',
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Scheduled',
    "totalAppeared" INTEGER NOT NULL DEFAULT 0,
    "passPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hallTicketLive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryBook" (
    "id" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "department" TEXT NOT NULL DEFAULT 'General',
    "category" TEXT NOT NULL DEFAULT 'Textbook',
    "totalCopies" INTEGER NOT NULL DEFAULT 5,
    "availableCopies" INTEGER NOT NULL DEFAULT 5,
    "shelfLocation" TEXT NOT NULL DEFAULT 'Stack A-1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryTransaction" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "bookTitle" TEXT NOT NULL,
    "studentRoll" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "issueDate" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "returnDate" TEXT,
    "fineAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Issued',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlacementDrive" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "packageLPA" DOUBLE PRECISION NOT NULL,
    "minCgpa" DOUBLE PRECISION NOT NULL DEFAULT 6.5,
    "eligibleBranches" TEXT[],
    "driveDate" TEXT NOT NULL,
    "venue" TEXT NOT NULL DEFAULT 'Auditorium / Online',
    "registeredCount" INTEGER NOT NULL DEFAULT 0,
    "shortlistedCount" INTEGER NOT NULL DEFAULT 0,
    "selectedCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlacementDrive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlacementApplication" (
    "id" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "studentRoll" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "cgpa" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Applied',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlacementApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportRoute" (
    "id" TEXT NOT NULL,
    "routeNumber" TEXT NOT NULL,
    "routeName" TEXT NOT NULL,
    "busNumber" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverContact" TEXT NOT NULL,
    "totalCapacity" INTEGER NOT NULL DEFAULT 45,
    "allocatedCount" INTEGER NOT NULL DEFAULT 0,
    "departureTime" TEXT NOT NULL DEFAULT '07:15 AM',
    "stops" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabEquipment" (
    "id" TEXT NOT NULL,
    "equipmentCode" TEXT NOT NULL,
    "equipmentName" TEXT NOT NULL,
    "labName" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "condition" TEXT NOT NULL DEFAULT 'Operational',
    "lastServiced" TEXT NOT NULL,
    "inCharge" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowRequest" (
    "id" TEXT NOT NULL,
    "workflowType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "requesterName" TEXT NOT NULL,
    "requesterRole" TEXT NOT NULL,
    "department" TEXT,
    "details" JSONB NOT NULL,
    "currentStage" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "approverId" TEXT,
    "approverName" TEXT,
    "approvalNotes" TEXT,
    "history" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_identifier_key" ON "User"("identifier");

-- CreateIndex
CREATE INDEX "User_identifier_idx" ON "User"("identifier");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentId_key" ON "Student"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_rollNumber_key" ON "Student"("rollNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE INDEX "Student_rollNumber_idx" ON "Student"("rollNumber");

-- CreateIndex
CREATE INDEX "Student_studentId_idx" ON "Student"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_userId_key" ON "Faculty"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_employeeId_key" ON "Faculty"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_email_key" ON "Faculty"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Hod_userId_key" ON "Hod"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Hod_employeeId_key" ON "Hod"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Hod_email_key" ON "Hod"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Semester_number_key" ON "Semester"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_code_key" ON "Subject"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentMark_studentId_subjectCode_key" ON "AssessmentMark"("studentId", "subjectCode");

-- CreateIndex
CREATE UNIQUE INDEX "FeeTransaction_receiptNo_key" ON "FeeTransaction"("receiptNo");

-- CreateIndex
CREATE UNIQUE INDEX "HostelVisitor_passNumber_key" ON "HostelVisitor"("passNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CanteenOrder_token_key" ON "CanteenOrder"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ExamSchedule_examCode_key" ON "ExamSchedule"("examCode");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryBook_isbn_key" ON "LibraryBook"("isbn");

-- CreateIndex
CREATE UNIQUE INDEX "TransportRoute_routeNumber_key" ON "TransportRoute"("routeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LabEquipment_equipmentCode_key" ON "LabEquipment"("equipmentCode");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faculty" ADD CONSTRAINT "Faculty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hod" ADD CONSTRAINT "Hod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentMark" ADD CONSTRAINT "AssessmentMark_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiometricLog" ADD CONSTRAINT "BiometricLog_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelComplaint" ADD CONSTRAINT "HostelComplaint_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanteenOrder" ADD CONSTRAINT "CanteenOrder_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

