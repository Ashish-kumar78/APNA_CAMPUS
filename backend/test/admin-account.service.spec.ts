import assert from 'node:assert/strict';
import { test } from 'node:test';
import bcrypt from 'bcryptjs';
import { AdminService } from '../src/admin/admin.service';

test('admin account creation hashes the provided password and returns a safe user record', async () => {
  let capturedCreate: any;
  const prisma = {
    user: {
      create: async (args: any) => {
        capturedCreate = args;
        return {
          id: 'new-user-id',
          identifier: args.data.identifier,
          name: args.data.name,
          email: args.data.email,
          role: args.data.role,
          department: args.data.department,
          designation: null,
          phone: null,
          isActive: true,
          createdAt: new Date(),
        };
      },
    },
    auditLog: { create: async ({ data }: any) => data },
  };
  const service = new AdminService(prisma as any);

  const result = await service.createUserAccount({
    identifier: 'FAC-001',
    name: 'Faculty Member',
    email: 'faculty@example.test',
    role: 'FACULTY',
    department: 'Computing',
    password: 'a-long-private-initial-password',
  }, { id: 'admin-id', name: 'Admin', role: 'ADMIN' });

  assert.equal(await bcrypt.compare('a-long-private-initial-password', capturedCreate.data.passwordHash), true);
  assert.notEqual(capturedCreate.data.passwordHash, 'a-long-private-initial-password');
  assert.equal('passwordHash' in result, false);
});

test('admin account creation refuses a missing initial password', async () => {
  let dbWriteCount = 0;
  const service = new AdminService({
    user: { create: async () => { dbWriteCount += 1; } },
  } as any);

  await assert.rejects(
    service.createUserAccount({ identifier: 'FAC-001', name: 'Faculty', email: 'faculty@example.test', role: 'FACULTY' }, { name: 'Admin' }),
  );
  assert.equal(dbWriteCount, 0);
});

test('updating account status returns only a safe user projection', async () => {
  let updateArgs: any;
  const service = new AdminService({
    user: {
      update: async (args: any) => {
        updateArgs = args;
        return { id: 'user-id', identifier: 'FAC-001', name: 'Faculty', role: 'FACULTY', isActive: false };
      },
    },
    auditLog: { create: async ({ data }: any) => data },
  } as any);

  const result = await service.updateUserStatus('user-id', false, { name: 'Admin', role: 'ADMIN' });

  assert.deepEqual(updateArgs.select, {
    id: true,
    identifier: true,
    name: true,
    role: true,
    isActive: true,
  });
  assert.equal('passwordHash' in result, false);
});
