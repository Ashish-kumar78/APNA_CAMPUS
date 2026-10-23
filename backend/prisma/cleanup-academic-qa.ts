import 'dotenv/config';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function developmentDatabaseName(): string {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error('DATABASE_URL is missing.');
  const url = new URL(value);
  if (!['mongodb:', 'mongodb+srv:'].includes(url.protocol)) throw new Error('DATABASE_URL is not MongoDB.');
  const name = decodeURIComponent(url.pathname.replace(/^\//, ''));
  if (!name || !/(^|[-_])(dev|development|test|testing)([-_]|$)/i.test(name)) {
    throw new Error('Refusing cleanup: the database name must include a dev or test marker.');
  }
  return name;
}

async function main() {
  const databaseName = developmentDatabaseName();
  const readline = createInterface({ input: stdin, output: stdout });
  let confirmation = '';
  try {
    stdout.write(`This removes only academic QA fixtures from ${databaseName}. Existing non-QA data and audit logs are preserved.\n`);
    confirmation = (await readline.question('Type the database name exactly to continue: ')).trim();
  } finally {
    readline.close();
  }
  if (confirmation !== databaseName) throw new Error('Database confirmation did not match. No data was changed.');

  const [qaUsers, qaStudents, qaFaculty, qaHods, qaSections, qaOfferings, qaProgrammes, qaDepartments, qaSemesters, qaSubjects] = await Promise.all([
    prisma.user.count({ where: { identifier: { startsWith: 'QA-' } } }),
    prisma.student.count({ where: { studentId: { startsWith: 'QA-STU-' } } }),
    prisma.faculty.count({ where: { employeeId: { startsWith: 'QA-FAC-' } } }),
    prisma.hod.count({ where: { employeeId: { startsWith: 'QA-HOD-' } } }),
    prisma.section.count({ where: { department: { startsWith: 'QA TEST —' } } }),
    prisma.courseOffering.count({ where: { subjectCode: { startsWith: 'QA-' } } }),
    prisma.programme.count({ where: { code: { startsWith: 'QA-' } } }),
    prisma.department.count({ where: { name: { startsWith: 'QA TEST —' } } }),
    prisma.semester.count({ where: { label: { startsWith: 'QA TEST —' } } }),
    prisma.subject.count({ where: { code: { startsWith: 'QA-' } } }),
  ]);
  stdout.write(`QA fixture preflight: ${JSON.stringify({ qaUsers, qaStudents, qaFaculty, qaHods, qaSections, qaOfferings, qaProgrammes, qaDepartments, qaSemesters, qaSubjects })}\n`);

  const deleted = await prisma.$transaction(async (tx) => {
    const students = await tx.student.findMany({ where: { studentId: { startsWith: 'QA-STU-' } }, select: { id: true } });
    const studentIds = students.map(({ id }) => id);
    const faculty = await tx.faculty.findMany({ where: { employeeId: { startsWith: 'QA-FAC-' } }, select: { id: true } });
    const facultyIds = faculty.map(({ id }) => id);
    const offerings = await tx.courseOffering.findMany({ where: { subjectCode: { startsWith: 'QA-' } }, select: { id: true } });
    const offeringIds = offerings.map(({ id }) => id);
    const assignments = await tx.facultyAssignment.findMany({
      where: { OR: [
        ...(facultyIds.length ? [{ facultyId: { in: facultyIds } }] : []),
        ...(offeringIds.length ? [{ courseOfferingId: { in: offeringIds } }] : []),
      ] },
      select: { id: true },
    });
    const assignmentIds = assignments.map(({ id }) => id);
    const users = await tx.user.findMany({ where: { identifier: { startsWith: 'QA-' } }, select: { id: true } });
    const userIds = users.map(({ id }) => id);

    if (assignmentIds.length) await tx.attendanceSession.deleteMany({ where: { facultyAssignmentId: { in: assignmentIds } } });
    if (studentIds.length) {
      await tx.studentEnrollment.deleteMany({ where: { studentId: { in: studentIds } } });
      await tx.assessmentMark.deleteMany({ where: { studentId: { in: studentIds } } });
      await tx.attendanceRecord.deleteMany({ where: { studentId: { in: studentIds } } });
      await tx.guardian.deleteMany({ where: { studentId: { in: studentIds } } });
      await tx.address.deleteMany({ where: { studentId: { in: studentIds } } });
      await tx.document.deleteMany({ where: { studentId: { in: studentIds } } });
      await tx.biometricLog.deleteMany({ where: { studentId: { in: studentIds } } });
      await tx.hostelComplaint.deleteMany({ where: { studentId: { in: studentIds } } });
      await tx.canteenOrder.deleteMany({ where: { studentId: { in: studentIds } } });
      await tx.student.deleteMany({ where: { id: { in: studentIds } } });
    }
    if (assignmentIds.length) await tx.facultyAssignment.deleteMany({ where: { id: { in: assignmentIds } } });
    if (offeringIds.length) await tx.courseOffering.deleteMany({ where: { id: { in: offeringIds } } });
    await tx.section.deleteMany({ where: { department: { startsWith: 'QA TEST —' } } });
    if (facultyIds.length) await tx.faculty.deleteMany({ where: { id: { in: facultyIds } } });
    await tx.hod.deleteMany({ where: { employeeId: { startsWith: 'QA-HOD-' } } });
    await tx.subject.deleteMany({ where: { code: { startsWith: 'QA-' } } });
    await tx.programme.deleteMany({ where: { code: { startsWith: 'QA-' } } });
    await tx.department.deleteMany({ where: { name: { startsWith: 'QA TEST —' } } });
    await tx.semester.deleteMany({ where: { label: { startsWith: 'QA TEST —' } } });
    if (userIds.length) {
      await tx.userRole.deleteMany({ where: { userId: { in: userIds } } });
      await tx.user.deleteMany({ where: { id: { in: userIds } } });
    }
    return { users: userIds.length, students: studentIds.length, faculty: facultyIds.length, courseOfferings: offeringIds.length, facultyAssignments: assignmentIds.length };
  }, { maxWait: 10000, timeout: 60000 });

  stdout.write(`Removed QA fixtures: ${JSON.stringify(deleted)}. Audit logs were retained.\n`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Academic QA cleanup failed.');
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());
