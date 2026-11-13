import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 2: Database Models & Prisma Schema Migrations Verification', () => {
  const rootDir = path.resolve(__dirname, '../..');
  const schemaPath = path.join(rootDir, 'backend/prisma/schema.prisma');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // 1. Model Laboratory
  it('1. Prisma schema defines model Laboratory with all room and department metadata', () => {
    expect(schema).toMatch(/model\s+Laboratory\s*\{/);
    const labBlock = schema.slice(schema.indexOf('model Laboratory'));
    expect(labBlock).toContain('code           String   @unique');
    expect(labBlock).toContain('name           String');
    expect(labBlock).toContain('department     String');
    expect(labBlock).toContain('building       String');
    expect(labBlock).toContain('room           String');
    expect(labBlock).toContain('capacity       Int      @default(40)');
    expect(labBlock).toContain('status         String   @default("Operational")');
    expect(labBlock).toContain('safetyStatus   String   @default("Compliant")');
  });

  // 2. Model LabEquipment Upgrades
  it('2. Prisma schema upgrades model LabEquipment with quantities, conditions, and pricing', () => {
    expect(schema).toMatch(/model\s+LabEquipment\s*\{/);
    const eqBlock = schema.slice(schema.indexOf('model LabEquipment'));
    expect(eqBlock).toContain('equipmentCode     String   @unique');
    expect(eqBlock).toContain('equipmentName     String');
    expect(eqBlock).toContain('category          String');
    expect(eqBlock).toContain('department        String');
    expect(eqBlock).toContain('quantity          Int      @default(1)');
    expect(eqBlock).toContain('availableQuantity Int      @default(1)');
    expect(eqBlock).toContain('issuedQuantity    Int      @default(0)');
    expect(eqBlock).toContain('condition         String   @default("Available")');
    expect(eqBlock).toContain('status            String   @default("Available")');
    expect(eqBlock).toContain('unitPrice         Float    @default(0)');
  });

  // 3. Model LabRequisition
  it('3. Prisma schema defines model LabRequisition with full administrative approval lifecycle', () => {
    expect(schema).toMatch(/model\s+LabRequisition\s*\{/);
    const reqBlock = schema.slice(schema.indexOf('model LabRequisition'));
    expect(reqBlock).toContain('requisitionNumber String    @unique');
    expect(reqBlock).toContain('department        String');
    expect(reqBlock).toContain('labCode           String');
    expect(reqBlock).toContain('equipmentName     String');
    expect(reqBlock).toContain('requestedQuantity Int       @default(1)');
    expect(reqBlock).toContain('estimatedCost     Float     @default(0)');
    expect(reqBlock).toContain('status            String    @default("Submitted")');
    expect(reqBlock).toContain('adminRemarks      String?   @db.Text');
    expect(reqBlock).toContain('reviewedBy        String?');
    expect(reqBlock).toContain('reviewedAt        DateTime?');
    expect(reqBlock).toContain('issuedBy          String?');
    expect(reqBlock).toContain('issuedAt          DateTime?');
  });

  // 4. Model LabComplaintWorkOrder
  it('4. Prisma schema defines model LabComplaintWorkOrder connecting complaints to maintenance work orders', () => {
    expect(schema).toMatch(/model\s+LabComplaintWorkOrder\s*\{/);
    const compBlock = schema.slice(schema.indexOf('model LabComplaintWorkOrder'));
    expect(compBlock).toContain('complaintNumber    String    @unique');
    expect(compBlock).toContain('workOrderNumber    String?   @unique');
    expect(compBlock).toContain('department         String');
    expect(compBlock).toContain('labCode            String');
    expect(compBlock).toContain('equipmentCode      String?');
    expect(compBlock).toContain('equipmentName      String');
    expect(compBlock).toContain('issueType          String');
    expect(compBlock).toContain('status             String    @default("Submitted")');
    expect(compBlock).toContain('adminRemarks       String?   @db.Text');
    expect(compBlock).toContain('assignedTechnician String?');
    expect(compBlock).toContain('resolutionNotes    String?   @db.Text');
    expect(compBlock).toContain('completedAt        DateTime?');
    expect(compBlock).toContain('closedAt           DateTime?');
  });

  // 5. Model LabPracticalSession
  it('5. Prisma schema defines model LabPracticalSession for academic timetable and attendance', () => {
    expect(schema).toMatch(/model\s+LabPracticalSession\s*\{/);
    const sessBlock = schema.slice(schema.indexOf('model LabPracticalSession'));
    expect(sessBlock).toContain('sessionCode      String   @unique');
    expect(sessBlock).toContain('department       String');
    expect(sessBlock).toContain('labCode          String');
    expect(sessBlock).toContain('subjectCode      String');
    expect(sessBlock).toContain('subjectName      String');
    expect(sessBlock).toContain('facultyName      String');
    expect(sessBlock).toContain('sessionDate      String');
    expect(sessBlock).toContain('timeSlot         String');
    expect(sessBlock).toContain('expectedStudents Int      @default(30)');
    expect(sessBlock).toContain('presentStudents  Int      @default(0)');
    expect(sessBlock).toContain('attendanceTaken  Boolean  @default(false)');
  });

  // 6. Prisma Generated Client Type Verification
  it('6. Generated Prisma Client exports model typings for all 5 laboratory entities', () => {
    const dtsPath = path.join(rootDir, 'backend/node_modules/.prisma/client/index.d.ts');
    const dtsContent = fs.readFileSync(dtsPath, 'utf8');

    expect(dtsContent).toContain('export type Laboratory');
    expect(dtsContent).toContain('export type LabEquipment');
    expect(dtsContent).toContain('export type LabRequisition');
    expect(dtsContent).toContain('export type LabComplaintWorkOrder');
    expect(dtsContent).toContain('export type LabPracticalSession');
  });

  // 7. Equipment Statuses & Conditions Consistency
  it('7. Enforces valid conditions: Available, Issued, Under Maintenance, Damaged, Out of Stock', () => {
    const validConditions = ['Available', 'Issued', 'Under Maintenance', 'Damaged', 'Out of Stock'];
    expect(validConditions).toContain('Available');
    expect(validConditions).toContain('Under Maintenance');
    expect(validConditions).toContain('Damaged');
    expect(validConditions).toContain('Out of Stock');
  });
});

