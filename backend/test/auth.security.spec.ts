import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { AuthService } from '../src/auth/auth.service';
import { getJwtSecret } from '../src/config/env';

test('the former shared demo passwords cannot authenticate a stored account', async () => {
  const user = {
    id: 'user-id',
    email: 'student@example.test',
    identifier: 'STU-001',
    name: 'Student',
    role: 'STUDENT',
    passwordHash: await bcrypt.hash('different-private-password', 4),
    isActive: true,
    isActivated: true,
    permissions: [],
  };
  const service = new AuthService({
    user: { findFirst: async () => user },
  } as any);

  await assert.rejects(service.login({ identifier: 'STU-001', password: 'gift123' }), UnauthorizedException);
  await assert.rejects(service.login({ identifier: 'STU-001', password: 'password123' }), UnauthorizedException);
});

test('password recovery does not mint a token until an email delivery provider exists', async () => {
  let databaseLookups = 0;
  const service = new AuthService({
    user: { findFirst: async () => { databaseLookups += 1; return null; } },
  } as any);

  await assert.rejects(service.forgotPassword('person@example.test'), ServiceUnavailableException);
  assert.equal(databaseLookups, 0);
});

test('JWT signing configuration rejects missing or short secrets without a known fallback', () => {
  const previousSecret = process.env.JWT_SECRET;
  try {
    delete process.env.JWT_SECRET;
    assert.throws(getJwtSecret, /JWT_SECRET must be configured/);
    process.env.JWT_SECRET = 'short-secret';
    assert.throws(getJwtSecret, /JWT_SECRET must be configured/);
    process.env.JWT_SECRET = 'a'.repeat(32);
    assert.equal(getJwtSecret(), 'a'.repeat(32));
  } finally {
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});
