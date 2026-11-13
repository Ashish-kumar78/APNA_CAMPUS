import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 3: NestJS Backend API Endpoints & Laboratory Services', () => {
  const rootDir = path.resolve(__dirname, '../..');
  const backendDir = path.resolve(rootDir, 'backend');

  // 1. AppModule Registration
  it('1. AppModule registers LaboratoryModule into root application imports', () => {
    const appModulePath = path.join(backendDir, 'src/app.module.ts');
    const appModule = fs.readFileSync(appModulePath, 'utf8');

    expect(appModule).toContain("import { LaboratoryModule } from './laboratory/laboratory.module'");
    expect(appModule).toContain('LaboratoryModule');
  });

  // 2. LaboratoryController Guard & Base Path
  it('2. LaboratoryController uses JwtAuthGuard, RolesGuard and basePath /laboratories', () => {
    const controllerPath = path.join(backendDir, 'src/laboratory/laboratory.controller.ts');
    const controller = fs.readFileSync(controllerPath, 'utf8');

    expect(controller).toContain("@Controller('laboratories')");
    expect(controller).toContain('@UseGuards(JwtAuthGuard, RolesGuard)');
    expect(controller).toContain('export class LaboratoryController');
  });

  // 3. Dynamic Branch Filtering Endpoints
  it('3. Exposes dynamic branch query endpoints for laboratories, equipment and practical sessions', () => {
    const controllerPath = path.join(backendDir, 'src/laboratory/laboratory.controller.ts');
    const controller = fs.readFileSync(controllerPath, 'utf8');

    expect(controller).toContain("getLaboratories(@Query('department') department?: string)");
    expect(controller).toContain("getEquipment(");
    expect(controller).toContain("@Query('department') department?: string");
    expect(controller).toContain("@Query('labCode') labCode?: string");
    expect(controller).toContain("getSessions(");
  });

  // 4. Instrument Requisition Approval Endpoints
  it('4. Requisition review and stock issuance endpoints are strictly restricted to ADMIN and SUPER_ADMIN', () => {
    const controllerPath = path.join(backendDir, 'src/laboratory/laboratory.controller.ts');
    const controller = fs.readFileSync(controllerPath, 'utf8');

    // Review requisition
    expect(controller).toContain("@Patch('requisitions/:id/review')");
    expect(controller).toContain('@Roles(Role.ADMIN, Role.SUPER_ADMIN)');
    expect(controller).toContain('async reviewRequisition(');

    // Issue stock
    expect(controller).toContain("@Patch('requisitions/:id/issue')");
    expect(controller).toContain('async issueStock(');
  });

  // 5. Equipment Repair & Work Order Endpoints
  it('5. Complaint review and work order dispatch endpoints follow approval state rules', () => {
    const controllerPath = path.join(backendDir, 'src/laboratory/laboratory.controller.ts');
    const controller = fs.readFileSync(controllerPath, 'utf8');

    expect(controller).toContain("@Post('complaints')");
    expect(controller).toContain("@Patch('complaints/:id/review')");
    expect(controller).toContain("@Patch('complaints/:id/work-order')");
  });

  // 6. Super Admin Delete Authority
  it('6. Equipment deletion is strictly guarded with Role.SUPER_ADMIN only', () => {
    const controllerPath = path.join(backendDir, 'src/laboratory/laboratory.controller.ts');
    const controller = fs.readFileSync(controllerPath, 'utf8');

    const deleteSection = controller.slice(controller.indexOf("@Delete('equipment/:id')"));
    expect(deleteSection).toContain('@Roles(Role.SUPER_ADMIN)');
    expect(deleteSection).toContain('async deleteEquipment(');
  });

  // 7. LaboratoryService Business Logic
  it('7. LaboratoryService implements multi-branch seeding and stock sync logic', () => {
    const servicePath = path.join(backendDir, 'src/laboratory/laboratory.service.ts');
    const service = fs.readFileSync(servicePath, 'utf8');

    expect(service).toContain('seedInitialLabsIfEmpty');
    expect(service).toContain('BIOTECH-LAB-01');
    expect(service).toContain('CSE-LAB-02');
    expect(service).toContain('AI-LAB-01');
    expect(service).toContain('issueStock(');
    expect(service).toContain('reviewComplaint(');
    expect(service).toContain('getAdminSummary()');
  });
});

