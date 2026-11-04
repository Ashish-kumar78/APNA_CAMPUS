const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  const hash = await bcrypt.hash('gift123', 10);
  const user = await prisma.user.upsert({
    where: { identifier: '2305201001' },
    update: { passwordHash: hash, isActive: true },
    create: {
      identifier: '2305201001',
      name: 'Rakesh Das',
      email: 'rakesh.das@apnacampus.edu.in',
      passwordHash: hash,
      role: 'STUDENT',
      isActive: true,
    },
  });
  console.log('User created/updated:', user.id);

  const student = await prisma.student.upsert({
    where: { studentId: '2305201001' },
    update: { user: { connect: { id: user.id } }, status: 'Active' },
    create: {
      user: { connect: { id: user.id } },
      studentId: '2305201001',
      rollNumber: '2305201001',
      name: 'Rakesh Das',
      email: 'rakesh.das@apnacampus.edu.in',
      department: 'Computer Science & Engineering',
      status: 'Active',
      semester: '5th',
      academicYear: '2023-2027',
      section: 'A',
    },
  });
  console.log('Student created/updated:', student.id);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
