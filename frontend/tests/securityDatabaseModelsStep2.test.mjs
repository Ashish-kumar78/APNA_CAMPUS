import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('STEP 2: Student Gate Pass Backend Persistence & Database Models Suite', () => {
  const backendDir = path.resolve(__dirname, '../../backend');
  const schemaPath = path.join(backendDir, 'prisma/schema.prisma');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // 1. StudentMovementRequest Model Verification
  it('1. StudentMovementRequest contains all required application fields for gate passes', () => {
    expect(schema).toContain('model StudentMovementRequest');
    expect(schema).toContain('requestCode');
    expect(schema).toContain('studentRoll');
    expect(schema).toContain('studentName');
    expect(schema).toContain('movementType');
    expect(schema).toContain('reason');
    expect(schema).toContain('destination');
    expect(schema).toContain('outDateTime');
    expect(schema).toContain('expectedInDateTime');
    expect(schema).toContain('status');
    expect(schema).toContain('wardenRemarks');
    expect(schema).toContain('@@map("student_movement_requests")');
  });

  // 2. CampusGateMovement Model Verification
  it('2. CampusGateMovement contains all required gate telemetry fields', () => {
    expect(schema).toContain('model CampusGateMovement');
    expect(schema).toContain('movementCode');
    expect(schema).toContain('passId');
    expect(schema).toContain('rollNumber');
    expect(schema).toContain('direction');
    expect(schema).toContain('movementTime');
    expect(schema).toContain('guardId');
    expect(schema).toContain('guardName');
    expect(schema).toContain('status');
    expect(schema).toContain('method');
    expect(schema).toContain('syncedAt');
    expect(schema).toContain('offlineSyncId');
    expect(schema).toContain('@@map("campus_gate_movements")');
  });

  // 3. HostelVisitor Model Verification
  it('3. HostelVisitor model contains pre-approval and walk-in fields', () => {
    expect(schema).toContain('model HostelVisitor');
    expect(schema).toContain('visitorName');
    expect(schema).toContain('phone');
    expect(schema).toContain('studentId');
    expect(schema).toContain('verificationCode');
    expect(schema).toContain('verificationCodeHash');
    expect(schema).toContain('purpose');
    expect(schema).toContain('visitDate');
    expect(schema).toContain('expectedArrival');
    expect(schema).toContain('actualEntry');
    expect(schema).toContain('actualExit');
    expect(schema).toContain('status');
    expect(schema).toContain('badgeNumber');
  });

  // 4. SecurityShiftNote & ShiftHandoverLog Verification
  it('4. SecurityShiftNote and ShiftHandoverLog models are defined', () => {
    expect(schema).toContain('model SecurityShiftNote');
    expect(schema).toContain('securityUserId');
    expect(schema).toContain('shiftDate');
    expect(schema).toContain('note');
    expect(schema).toContain('@@map("security_shift_notes")');

    expect(schema).toContain('model ShiftHandoverLog');
    expect(schema).toContain('shiftCode');
    expect(schema).toContain('outgoingGuardId');
    expect(schema).toContain('incomingGuardId');
    expect(schema).toContain('equipmentStatus');
    expect(schema).toContain('acknowledgedByIncoming');
  });

  // 5. DynamicQrToken Model Verification
  it('5. DynamicQrToken stores single-use token hashes for replay prevention', () => {
    expect(schema).toContain('model DynamicQrToken');
    expect(schema).toContain('tokenHash');
    expect(schema).toContain('userId');
    expect(schema).toContain('userRole');
    expect(schema).toContain('nonce');
    expect(schema).toContain('expiresAt');
    expect(schema).toContain('isUsed');
    expect(schema).toContain('@@map("dynamic_qr_tokens")');
  });

  // 6. OverdueReturnRecord & GateCheckpoint Verification
  it('6. OverdueReturnRecord and GateCheckpoint track perimeter integrity', () => {
    expect(schema).toContain('model OverdueReturnRecord');
    expect(schema).toContain('studentRoll');
    expect(schema).toContain('expectedReturnTime');
    expect(schema).toContain('actualReturnTime');
    expect(schema).toContain('wardenAlertSent');

    expect(schema).toContain('model GateCheckpoint');
    expect(schema).toContain('gateCode');
    expect(schema).toContain('type');
    expect(schema).toContain('hardwareStatus');
  });

  // 7. SecurityIncident Model Enhancements
  it('7. SecurityIncident supports gate perimeter alert attribution', () => {
    expect(schema).toContain('model SecurityIncident');
    expect(schema).toContain('reportedByGuardId');
    expect(schema).toContain('reportedByGuardName');
    expect(schema).toContain('studentRoll');
    expect(schema).toContain('location');
  });

  // 8. StudentGatePassSection connects to backend API
  it('8. StudentGatePassSection triggers submitStudentMovementRequest upon form submission', () => {
    const componentPath = path.resolve(__dirname, '../src/components/StudentGatePassSection.jsx');
    const componentCode = fs.readFileSync(componentPath, 'utf8');

    expect(componentCode).toContain('api.submitStudentMovementRequest');
    expect(componentCode).toContain('createGatePass');
  });
});
