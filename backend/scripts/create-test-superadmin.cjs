const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const identifier = 'test.superadmin';
  const email = 'test.superadmin@example.com';
  const password = 'CampusTest@2026!';

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ identifier }, { email }],
    },
    select: { id: true, identifier: true, email: true },
  });

  if (existing) {
    throw new Error(
      'An account with this identifier or email already exists. No changes made.'
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      identifier,
      email,
      passwordHash,
      name: 'Test Super Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
      isActivated: true,
    },
    select: {
      id: true,
      identifier: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });

  console.log('Test account created successfully:');
  console.log(JSON.stringify(user, null, 2));
  console.log('Temporary test password: CampusTest@2026!');
}

main()
  .catch((error) => {
    console.error('Account creation failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
