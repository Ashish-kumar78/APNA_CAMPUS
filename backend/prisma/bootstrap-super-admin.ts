import 'dotenv/config';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();
const BOOTSTRAP_LOCK_KEY = 'security:initial-super-admin-bootstrap:v1';

function getDevelopmentDatabaseName(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is missing. Configure backend/.env first.');

  let databaseName: string;
  try {
    const parsed = new URL(databaseUrl);
    if (!['mongodb:', 'mongodb+srv:'].includes(parsed.protocol)) {
      throw new Error('The configured database is not MongoDB.');
    }
    databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
  } catch {
    throw new Error('DATABASE_URL is invalid or does not point to MongoDB.');
  }

  if (!databaseName || !/(^|[-_])(dev|development|test|testing)([-_]|$)/i.test(databaseName)) {
    throw new Error('Refusing to bootstrap: the database name must contain a dev or test marker.');
  }
  return databaseName;
}

async function readHidden(prompt: string): Promise<string> {
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
    throw new Error('Run this command in an interactive terminal so the password can be entered privately.');
  }

  stdout.write(prompt);
  stdin.setEncoding('utf8');
  stdin.setRawMode(true);
  stdin.resume();

  return new Promise((resolve, reject) => {
    let value = '';
    const finish = (error?: Error) => {
      stdin.removeListener('data', onData);
      stdin.setRawMode(false);
      stdout.write('\n');
      if (error) reject(error);
      else resolve(value);
    };
    const onData = (chunk: string) => {
      for (const character of chunk) {
        if (character === '\u0003') return finish(new Error('Cancelled.'));
        if (character === '\r' || character === '\n') return finish();
        if (character === '\u007f' || character === '\b') value = value.slice(0, -1);
        else if (character >= ' ') value += character;
      }
    };
    stdin.on('data', onData);
  });
}

async function main() {
  const databaseName = getDevelopmentDatabaseName();
  const rl = createInterface({ input: stdin, output: stdout });
  let name: string;
  let email: string;
  let identifier: string;
  try {
    stdout.write(`Development database: ${databaseName}\n`);
    const confirmation = (await rl.question(`Type the database name exactly to continue: `)).trim();
    if (confirmation !== databaseName) throw new Error('Database confirmation did not match. No account was created.');

    name = (await rl.question('Super Admin full name: ')).trim();
    email = (await rl.question('Super Admin email: ')).trim().toLowerCase();
    identifier = (await rl.question('Login identifier (for example, SA-001): ')).trim();
  } finally {
    rl.close();
  }

  if (name.length < 2 || name.length > 120) throw new Error('Name must be between 2 and 120 characters.');
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
  if (identifier.length < 2 || identifier.length > 64) throw new Error('Identifier must be between 2 and 64 characters.');

  const password = await readHidden('Create a private password (12–72 bytes): ');
  const passwordConfirmation = await readHidden('Confirm password: ');
  if (password !== passwordConfirmation) throw new Error('Passwords did not match. No account was created.');
  if (password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('Password must be between 12 and 72 bytes. No account was created.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.$transaction(async (tx) => {
    const existingSuperAdmins = await tx.user.count({ where: { role: Role.SUPER_ADMIN } });
    if (existingSuperAdmins > 0) throw new Error('A Super Admin already exists. Bootstrap is allowed only once.');

    const createdUser = await tx.user.create({
      data: {
        name,
        email,
        identifier,
        passwordHash,
        role: Role.SUPER_ADMIN,
        department: 'System Administration',
        designation: 'Super Administrator',
        isActive: true,
        isActivated: true,
        permissions: ['*'],
      },
      select: { id: true, name: true, email: true, identifier: true, role: true },
    });

    await tx.systemSetting.create({
      data: {
        key: BOOTSTRAP_LOCK_KEY,
        value: createdUser.id,
        category: 'Security',
        updatedBy: createdUser.identifier,
      },
    });
    return createdUser;
  });

  console.log(`Created ${user.role} account for ${user.name}.`);
  console.log(`Login identifier: ${user.identifier}`);
  console.log('The password was stored as a bcrypt hash. Save your password privately; it cannot be retrieved from the database.');
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Bootstrap failed.');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
