import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 2: Safe Database Additions & Migration', () => {
  const schemaPath = path.resolve(__dirname, '../../backend/prisma/schema.prisma');

  it('HostelVisitor model preserves all original fields and adds backward-compatible security fields', () => {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Original fields preserved
    expect(schema).toContain('model HostelVisitor {');
    expect(schema).toContain('visitorName            String');
    expect(schema).toContain('relation               String');
    expect(schema).toContain('studentName            String');
    expect(schema).toContain('rollNumber             String');
    expect(schema).toContain('inTime                 String');
    expect(schema).toContain('outTime                String?');
    expect(schema).toContain('passNumber             String');
    expect(schema).toContain('purpose                String');

    // Additive security fields
    expect(schema).toContain('phone                  String?');
    expect(schema).toContain('idProofNumber          String?');
    expect(schema).toContain('badgeNumber            String?');
    expect(schema).toContain('verificationCode       String?');
    expect(schema).toContain('preApprovedByStudentId String?');
    expect(schema).toContain('registeredByGuardId    String?');
    expect(schema).toContain('gateNumber             String?');
  });

  it('CampusGateMovement model is defined with complete turnstile & audit fields', () => {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    expect(schema).toContain('model CampusGateMovement {');
    expect(schema).toContain('movementCode   String');
    expect(schema).toContain('passId         String');
    expect(schema).toContain('rollNumber     String');
    expect(schema).toContain('studentName    String');
    expect(schema).toContain('direction      String');
    expect(schema).toContain('gateName       String');
    expect(schema).toContain('guardId        String');
    expect(schema).toContain('guardName      String');
    expect(schema).toContain('status         String');
    expect(schema).toContain('isLate         Boolean');
    expect(schema).toContain('parentNotified Boolean');
    expect(schema).toContain('offlineSyncId  String?');
    expect(schema).toContain('@@map("campus_gate_movements")');
  });

  it('Prisma Client contains campusGateMovement and hostelVisitor delegates', () => {
    const prismaIndexDts = path.resolve(__dirname, '../../backend/node_modules/.prisma/client/index.d.ts');
    if (fs.existsSync(prismaIndexDts)) {
      const dts = fs.readFileSync(prismaIndexDts, 'utf8');
      expect(dts).toContain('campusGateMovement');
      expect(dts).toContain('CampusGateMovement');
      expect(dts).toContain('HostelVisitor');
    }
  });
});
