const http = require('http');

const BASE_PORT = process.env.PORT || 4000;
const BASE_HOST = '127.0.0.1';

let globalAuthToken = null;

function request(method, path, body = null, customToken = undefined) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: BASE_HOST,
      port: BASE_PORT,
      path: path,
      method: method,
      headers: {
        'Accept': 'application/json',
      },
    };

    const tokenToUse = customToken !== undefined ? customToken : globalAuthToken;
    if (tokenToUse) {
      options.headers['Authorization'] = `Bearer ${tokenToUse}`;
    }

    if (payload) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch (e) {}
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });

    req.on('error', (err) => reject(err));
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log(`Starting Comprehensive Administration API test suite on http://${BASE_HOST}:${BASE_PORT}...`);
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}: ${err.message}`);
      failed++;
    }
  }

  // Helper to get response payload whether wrapped in .data or direct
  const getData = (res) => (res.body && res.body.data !== undefined ? res.body.data : res.body);

  // 1. Root & Base Health
  await test('GET /api - App root health', async () => {
    const res = await request('GET', '/api');
    if (res.status !== 200 || !res.body.message) throw new Error(`Unexpected status ${res.status}`);
  });

  // 2. Authentication Enforcement & Login
  await test('GET /api/admin/metrics - Reject unauthenticated access (401 Guard)', async () => {
    const res = await request('GET', '/api/admin/metrics', null, null);
    if (res.status !== 401) {
      throw new Error(`Expected 401 Unauthorized without token, got ${res.status}`);
    }
  });

  await test('POST /api/auth/login - Authenticate as Super Admin', async () => {
    const res = await request('POST', '/api/auth/login', {
      identifier: 'SYS-SUPER-01',
      password: 'gift123'
    }, null);
    if (res.status !== 200 && res.status !== 201) {
      throw new Error(`Login failed with status ${res.status}: ${JSON.stringify(res.body)}`);
    }
    if (!res.body.accessToken) {
      throw new Error('No accessToken returned in login response');
    }
    globalAuthToken = res.body.accessToken;
  });

  // 3. Metrics & Diagnostics (Authenticated)
  await test('GET /api/admin/metrics - Institutional metrics (Authenticated)', async () => {
    const res = await request('GET', '/api/admin/metrics');
    const data = getData(res);
    if (res.status !== 200 || typeof data.totalStudents !== 'number') {
      throw new Error(`Invalid metrics response: ${JSON.stringify(res.body)}`);
    }
  });

  await test('GET /api/admin/diagnostics - Subsystem diagnostics', async () => {
    const res = await request('GET', '/api/admin/diagnostics');
    const data = getData(res);
    if (res.status !== 200 || !data.subsystems || !Array.isArray(data.subsystems)) {
      throw new Error(`Diagnostics must return subsystems array, got ${JSON.stringify(data)}`);
    }
  });

  // 4. Security Alerts & Incidents
  await test('GET /api/admin/security-alerts - Security alert cards', async () => {
    const res = await request('GET', '/api/admin/security-alerts');
    const data = getData(res);
    if (res.status !== 200 || !Array.isArray(data)) {
      throw new Error(`Security alerts must return array`);
    }
  });

  let createdIncidentId = null;
  await test('POST /api/admin/incidents - Report new security incident', async () => {
    const res = await request('POST', '/api/admin/incidents', {
      title: 'Suspicious payload injection attempt',
      category: 'Network Security',
      severity: 'high',
      affectedAccount: 'FAC-CSE-01',
      description: 'Automated test suite detected anomaly',
      source: 'test-runner'
    });
    if (res.status !== 201 && res.status !== 200) throw new Error(`Failed to create incident: ${res.status}`);
    const data = getData(res);
    createdIncidentId = data.id || data.incidentCode;
  });

  await test('GET /api/admin/incidents - List incidents', async () => {
    const res = await request('GET', '/api/admin/incidents');
    const data = getData(res);
    if (res.status !== 200 || !Array.isArray(data)) throw new Error(`Expected array of incidents`);
  });

  await test('PATCH /api/admin/incidents/:id - Resolve incident', async () => {
    if (!createdIncidentId) throw new Error('No incident ID');
    const res = await request('PATCH', `/api/admin/incidents/${createdIncidentId}`, {
      status: 'resolved',
      resolutionNotes: 'Mitigated by firewall rule'
    });
    const data = getData(res);
    if (res.status !== 200 || data.status !== 'resolved') {
      throw new Error(`Failed to update incident: ${JSON.stringify(res.body)}`);
    }
  });

  // 5. System Logs
  await test('GET /api/admin/system-logs - Retrieve system logs with level filter', async () => {
    const res = await request('GET', '/api/admin/system-logs?level=INFO');
    const data = getData(res);
    const logs = Array.isArray(data) ? data : data.logs;
    if (res.status !== 200 || !Array.isArray(logs)) throw new Error(`System logs should return array`);
  });

  // 6. Active User Sessions
  let sessionIdToRevoke = null;
  let secondSessionIdToRevoke = null;
  await test('GET /api/admin/sessions - List active sessions', async () => {
    const res = await request('GET', '/api/admin/sessions');
    const data = getData(res);
    if (res.status !== 200 || !Array.isArray(data)) throw new Error(`Sessions should return array`);
    if (data.length > 0) sessionIdToRevoke = data[0].id;
    if (data.length > 1) secondSessionIdToRevoke = data[1].id;
  });

  await test('POST /api/admin/sessions/:id/revoke - Revoke user session', async () => {
    if (!sessionIdToRevoke) sessionIdToRevoke = 'session-sample-1';
    const res = await request('POST', `/api/admin/sessions/${sessionIdToRevoke}/revoke`);
    if (res.status !== 200) throw new Error(`Session revocation failed: ${res.status}`);
  });

  await test('DELETE /api/admin/sessions/:id - Revoke session via DELETE alias', async () => {
    if (!secondSessionIdToRevoke) secondSessionIdToRevoke = 'session-sample-2';
    const res = await request('DELETE', `/api/admin/sessions/${secondSessionIdToRevoke}`);
    if (res.status !== 200) throw new Error(`DELETE session failed: ${res.status}`);
  });

  // 7. External Integrations
  await test('GET /api/admin/integrations - List enterprise integrations', async () => {
    const res = await request('GET', '/api/admin/integrations');
    const data = getData(res);
    if (res.status !== 200 || !Array.isArray(data)) throw new Error(`Integrations should return array`);
  });

  await test('POST /api/admin/integrations/:id/test - Test integration handshake', async () => {
    const res = await request('POST', '/api/admin/integrations/payment_gateway/test', {});
    const data = getData(res);
    if (res.status !== 200 || (!data.id && !data.key)) throw new Error(`Integration test failed: ${JSON.stringify(res.body)}`);
  });

  await test('POST /api/admin/integrations/ping/:id - Ping integration via alias', async () => {
    const res = await request('POST', '/api/admin/integrations/ping/sms_gateway', {});
    const data = getData(res);
    if (res.status !== 200 || (!data.id && !data.key)) throw new Error(`Integration ping failed: ${JSON.stringify(res.body)}`);
  });

  // 8. Users Directory & Governance
  let provisionedUserId = null;
  await test('POST /api/admin/users/create - Provision admin/staff user', async () => {
    const email = `test.staff.${Date.now()}@apnacampus.edu`;
    const res = await request('POST', '/api/admin/users/create', {
      name: 'Integration Test Staff',
      email: email,
      role: 'STAFF',
      department: 'Computer Science'
    });
    if (res.status !== 201 && res.status !== 200) throw new Error(`Failed to provision user: ${res.status}`);
    const data = getData(res);
    provisionedUserId = data.id;
  });

  await test('POST /api/admin/users - Provision user via alias', async () => {
    const email = `test.staff.alias.${Date.now()}@apnacampus.edu`;
    const res = await request('POST', '/api/admin/users', {
      name: 'Integration Test Staff 2',
      email: email,
      role: 'STAFF',
      department: 'Mechanical Engineering'
    });
    if (res.status !== 201 && res.status !== 200) throw new Error(`Failed to provision user alias: ${res.status}`);
  });

  await test('GET /api/admin/users - List users directory with search', async () => {
    const res = await request('GET', '/api/admin/users?search=Staff');
    const data = getData(res);
    if (res.status !== 200 || !Array.isArray(data)) throw new Error(`Users must return array`);
  });

  await test('POST /api/admin/users/:id/status - Toggle account status', async () => {
    if (!provisionedUserId) throw new Error('No user id');
    const res = await request('POST', `/api/admin/users/${provisionedUserId}/status`, {
      isActive: false
    });
    const data = getData(res);
    if (res.status !== 200 || data.isActive !== false) throw new Error(`Failed to toggle status`);
  });

  await test('PATCH /api/admin/users/:id/status - Toggle status via PATCH alias', async () => {
    if (!provisionedUserId) throw new Error('No user id');
    const res = await request('PATCH', `/api/admin/users/${provisionedUserId}/status`, {
      isActive: true
    });
    const data = getData(res);
    if (res.status !== 200 || data.isActive !== true) throw new Error(`Failed to patch status`);
  });

  await test('POST /api/admin/users/:id/reset-password - Generate password reset token', async () => {
    if (!provisionedUserId) throw new Error('No user id');
    const res = await request('POST', `/api/admin/users/${provisionedUserId}/reset-password`, {});
    const data = getData(res);
    if (res.status !== 200 || !data.resetToken) throw new Error(`Failed to generate reset password token`);
  });

  await test('POST /api/admin/users/:id/reset-token - Reset token alias', async () => {
    if (!provisionedUserId) throw new Error('No user id');
    const res = await request('POST', `/api/admin/users/${provisionedUserId}/reset-token`, {});
    const data = getData(res);
    if (res.status !== 200 || !data.resetToken) throw new Error(`Failed to generate reset token alias`);
  });

  // 9. Backups & Disaster Recovery
  let backupSnapshotId = null;
  await test('POST /api/admin/backups/create - Trigger backup snapshot', async () => {
    const res = await request('POST', '/api/admin/backups/create', {});
    if (res.status !== 201 && res.status !== 200) throw new Error(`Backup snapshot failed: ${res.status}`);
    const data = getData(res);
    backupSnapshotId = data.id;
  });

  await test('POST /api/admin/backups - Trigger backup via alias', async () => {
    const res = await request('POST', '/api/admin/backups', {});
    if (res.status !== 201 && res.status !== 200) throw new Error(`Backup snapshot alias failed: ${res.status}`);
  });

  await test('GET /api/admin/backups - List snapshots', async () => {
    const res = await request('GET', '/api/admin/backups');
    const data = getData(res);
    if (res.status !== 200 || !Array.isArray(data)) throw new Error(`Backups must return array`);
  });

  await test('POST /api/admin/backups/:id/restore - Restore validation guard & recovery', async () => {
    if (!backupSnapshotId) throw new Error('No backup ID');
    // Without confirmation code, should reject with 400
    const failRes = await request('POST', `/api/admin/backups/${backupSnapshotId}/restore`, {
      confirmationCode: 'WRONG_CODE'
    });
    if (failRes.status !== 400) throw new Error(`Expected 400 rejection on wrong code, got ${failRes.status}`);

    // With confirmation code RESTORE-CONFIRM
    const passRes = await request('POST', `/api/admin/backups/${backupSnapshotId}/restore`, {
      confirmationCode: 'RESTORE-CONFIRM'
    });
    const passData = getData(passRes);
    if (passRes.status !== 200 || !passData.restoredAt) throw new Error(`Restore failed on valid code: ${JSON.stringify(passRes.body)}`);
  });

  // 10. Administrative Approvals
  let approvalId = null;
  await test('GET /api/admin/approvals - List pending approvals', async () => {
    const res = await request('GET', '/api/admin/approvals');
    const data = getData(res);
    if (res.status !== 200 || !Array.isArray(data)) throw new Error(`Approvals must return array`);
    if (data.length > 0) approvalId = data[0].id;
  });

  await test('POST /api/admin/approvals/:id/decide - Decide approval (approve/reject)', async () => {
    if (!approvalId) approvalId = 'approval-sample-1';
    const res = await request('POST', `/api/admin/approvals/${approvalId}/decide`, {
      decision: 'APPROVED',
      reason: 'Verified by integration test suite justification'
    });
    const data = getData(res);
    if (res.status !== 200 || data.status !== 'APPROVED') throw new Error(`Decision update failed: ${JSON.stringify(res.body)}`);
  });

  // 11. RBAC Matrix
  await test('GET /api/admin/rbac/permissions - Get role permissions matrix', async () => {
    const res = await request('GET', '/api/admin/rbac/permissions');
    const data = getData(res);
    if (res.status !== 200 || typeof data !== 'object') throw new Error(`RBAC must return object`);
  });

  await test('GET /api/admin/rbac - Get RBAC permissions alias', async () => {
    const res = await request('GET', '/api/admin/rbac');
    const data = getData(res);
    if (res.status !== 200 || typeof data !== 'object') throw new Error(`RBAC alias must return object`);
  });

  await test('POST /api/admin/rbac/permissions - Update role permissions', async () => {
    const res = await request('POST', '/api/admin/rbac/permissions', {
      roleKey: 'faculty',
      permissions: ['attendance_manage', 'marks_entry', 'leave_apply']
    });
    if (res.status !== 200) throw new Error(`RBAC update failed: ${JSON.stringify(res.body)}`);
  });

  await test('POST /api/admin/rbac - Update RBAC via matrix alias', async () => {
    const res = await request('POST', '/api/admin/rbac', {
      permissions: {
        admin: ['full_access', 'audit_view'],
        hod: ['department_manage', 'faculty_review']
      }
    });
    if (res.status !== 200) throw new Error(`RBAC matrix alias update failed: ${JSON.stringify(res.body)}`);
  });

  // 12. Institutional Settings
  await test('GET /api/admin/settings - Get institutional settings', async () => {
    const res = await request('GET', '/api/admin/settings');
    const data = getData(res);
    if (res.status !== 200 || typeof data !== 'object') throw new Error(`Settings must return object`);
  });

  await test('POST /api/admin/settings - Save institutional settings', async () => {
    const res = await request('POST', '/api/admin/settings', {
      collegeName: 'Apna Campus Institute of Technology',
      academicYear: '2026-2027',
      gradingSystem: 'Relative (Standard Deviation)'
    });
    const data = getData(res);
    if (res.status !== 200 || (!data.academicYear && !data.settings?.academicYear)) {
      throw new Error(`Settings save failed: ${JSON.stringify(res.body)}`);
    }
  });

  // 13. Staff Rosters (Wardens, Security, Canteen, Support)
  let staffId = null;
  await test('POST /api/admin/staff - Create staff roster entry', async () => {
    const res = await request('POST', '/api/admin/staff', {
      staffType: 'WARDEN',
      name: 'Ramesh Patel',
      phone: '+91 98765 43210',
      assignedHostelOrPost: 'Boys Hostel Block A',
      shift: 'Day Shift',
      status: 'Active'
    });
    if (res.status !== 201 && res.status !== 200) throw new Error(`Staff creation failed: ${res.status}`);
    const data = getData(res);
    staffId = data.id;
  });

  await test('GET /api/admin/staff - Query staff rosters', async () => {
    const res = await request('GET', '/api/admin/staff?type=WARDEN');
    const data = getData(res);
    if (res.status !== 200 || !Array.isArray(data)) throw new Error(`Staff query failed`);
    const found = data.some(s => s.name === 'Ramesh Patel');
    if (!found) throw new Error(`Newly created staff member not found in list`);
  });

  await test('PUT /api/admin/staff/:id - Update staff member', async () => {
    if (!staffId) throw new Error('No staff id');
    const res = await request('PUT', `/api/admin/staff/${staffId}`, {
      shift: 'Night Shift'
    });
    const data = getData(res);
    if (res.status !== 200 || data.shift !== 'Night Shift') throw new Error(`Staff update failed`);
  });

  await test('DELETE /api/admin/staff/:id - Delete staff member', async () => {
    if (!staffId) throw new Error('No staff id');
    const res = await request('DELETE', `/api/admin/staff/${staffId}`);
    if (res.status !== 200 && res.status !== 204) throw new Error(`Staff deletion failed`);
  });

  // 14. Audit Logs
  await test('POST /api/admin/audit-logs - Append enterprise audit trail log', async () => {
    const res = await request('POST', '/api/admin/audit-logs', {
      action: 'SYSTEM_SETTINGS_UPDATE',
      module: 'Administration',
      target: 'Academic Year 2026-2027',
      status: 'Success',
      reason: 'Automated test suite policy verification'
    });
    if (res.status !== 201 && res.status !== 200) throw new Error(`Audit log creation failed: ${res.status}`);
  });

  await test('GET /api/admin/audit-logs - Query audit trail with search and limit', async () => {
    const res = await request('GET', '/api/admin/audit-logs?limit=10&search=SYSTEM_SETTINGS');
    const data = getData(res);
    if (res.status !== 200 || !Array.isArray(data)) throw new Error(`Audit logs list failed`);
  });

  // 15. Academic Faculty Management
  let facultyId = null;
  await test('POST /api/admin/faculty - Create faculty member', async () => {
    const email = `anita.desai.${Date.now()}@apnacampus.edu`;
    const res = await request('POST', '/api/admin/faculty', {
      name: 'Dr. Anita Desai',
      email: email,
      department: 'Computer Science',
      designation: 'Associate Professor',
      qualification: 'Ph.D. Computer Science'
    });
    if (res.status !== 201 && res.status !== 200) throw new Error(`Faculty creation failed: ${res.status}`);
    const data = getData(res);
    facultyId = data.id;
  });

  await test('GET /api/admin/faculty - List faculty members', async () => {
    const res = await request('GET', '/api/admin/faculty?search=Anita');
    const data = getData(res);
    if (res.status !== 200 || !Array.isArray(data)) throw new Error(`Faculty list failed`);
  });

  await test('PUT /api/admin/faculty/:id - Update faculty member', async () => {
    if (!facultyId) throw new Error('No faculty ID');
    const res = await request('PUT', `/api/admin/faculty/${facultyId}`, {
      designation: 'Professor & Head'
    });
    const data = getData(res);
    if (res.status !== 200 || data.designation !== 'Professor & Head') throw new Error(`Faculty update failed`);
  });

  await test('DELETE /api/admin/faculty/:id - Remove faculty member', async () => {
    if (!facultyId) throw new Error('No faculty ID');
    const res = await request('DELETE', `/api/admin/faculty/${facultyId}`);
    if (res.status !== 200 && res.status !== 204) throw new Error(`Faculty deletion failed`);
  });

  // 16. HOD Management
  let hodId = null;
  await test('POST /api/admin/hods - Create HOD assignment', async () => {
    const email = `vikram.malhotra.${Date.now()}@apnacampus.edu`;
    const res = await request('POST', '/api/admin/hods', {
      name: 'Dr. Vikram Malhotra',
      email: email,
      department: 'Information Technology',
      status: 'Active'
    });
    if (res.status !== 201 && res.status !== 200) throw new Error(`HOD creation failed: ${res.status}`);
    const data = getData(res);
    hodId = data.id;
  });

  await test('GET /api/admin/hods - List HODs', async () => {
    const res = await request('GET', '/api/admin/hods');
    const data = getData(res);
    if (res.status !== 200 || !Array.isArray(data)) throw new Error(`HOD list failed`);
  });

  await test('PUT /api/admin/hods/:id - Update HOD assignment', async () => {
    if (!hodId) throw new Error('No HOD ID');
    const res = await request('PUT', `/api/admin/hods/${hodId}`, {
      phone: '+91 99887 76655'
    });
    if (res.status !== 200) throw new Error(`HOD update failed`);
  });

  await test('DELETE /api/admin/hods/:id - Remove HOD assignment', async () => {
    if (!hodId) throw new Error('No HOD ID');
    const res = await request('DELETE', `/api/admin/hods/${hodId}`);
    if (res.status !== 200 && res.status !== 204) throw new Error(`HOD deletion failed`);
  });

  // 17. Marking Schemes
  await test('GET /api/admin/marking-schemes - List marking schemes', async () => {
    const res = await request('GET', '/api/admin/marking-schemes');
    const data = getData(res);
    if (res.status !== 200 || !Array.isArray(data)) throw new Error(`Marking schemes list failed`);
  });

  await test('PUT /api/admin/marking-schemes/:id - Update marking scheme component', async () => {
    const res = await request('PUT', '/api/admin/marking-schemes/ms-01', {
      assessmentType: 'Mid-Term Exam (Updated)',
      count: 2,
      maxMarks: 25,
      weightage: 25,
      formula: 'Average of Best 2',
      status: 'Active'
    });
    const data = getData(res);
    if (res.status !== 200 || data.weightage !== 25) throw new Error(`Marking scheme update failed: ${JSON.stringify(res.body)}`);
  });

  console.log(`\n========================================`);
  console.log(`Test Execution Finished! Passed: ${passed}, Failed: ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
