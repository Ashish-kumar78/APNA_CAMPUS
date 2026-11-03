CREATE TABLE "ClassNote" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "subjectCode" TEXT,
    "lectureDate" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "description" TEXT,
    "semester" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "fileData" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "reviewerRemarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FacultyQuiz" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "subjectCode" TEXT NOT NULL,
    "section" TEXT NOT NULL DEFAULT 'Section A',
    "semester" TEXT NOT NULL DEFAULT 'Semester 5',
    "date" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "totalMarks" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "assessmentSlot" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "questions" JSONB NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacultyQuiz_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuizSubmission" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizSubmission_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ClassNote_status_subject_idx" ON "ClassNote"("status", "subject");
CREATE INDEX "ClassNote_studentId_idx" ON "ClassNote"("studentId");
CREATE INDEX "FacultyQuiz_subjectCode_section_status_idx" ON "FacultyQuiz"("subjectCode", "section", "status");
CREATE UNIQUE INDEX "QuizSubmission_quizId_studentId_key" ON "QuizSubmission"("quizId", "studentId");
CREATE INDEX "QuizSubmission_studentId_submittedAt_idx" ON "QuizSubmission"("studentId", "submittedAt");

ALTER TABLE "ClassNote"
ADD CONSTRAINT "ClassNote_studentId_fkey"
FOREIGN KEY ("studentId") REFERENCES "Student"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QuizSubmission"
ADD CONSTRAINT "QuizSubmission_quizId_fkey"
FOREIGN KEY ("quizId") REFERENCES "FacultyQuiz"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QuizSubmission"
ADD CONSTRAINT "QuizSubmission_studentId_fkey"
FOREIGN KEY ("studentId") REFERENCES "Student"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
