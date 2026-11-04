// Automated Integration Test: Warden Pending Tasks & Backend Connectivity
import assert from 'node:assert/strict';

// 1. Test Backend Data Logic
import {
  getWardenPendingTasksBackend,
  updateWardenPendingTaskStatusBackend,
  batchActionWardenPendingTasksBackend,
  countPendingTasksForWarden,
  INITIAL_WARDEN_TASKS
} from '../../backend/dist/hostel/warden-pending-tasks.data.js';

console.log('--- TEST 1: Initial Warden Tasks Count Verification ---');
const countsExpected = {
  'WRD-101': 3,
  'WRD-102': 1,
  'WRD-103': 4,
  'WRD-104': 2,
  'WRD-105': 5,
  'WRD-106': 2,
  'WRD-107': 0
};

for (const [wId, expected] of Object.entries(countsExpected)) {
  const result = getWardenPendingTasksBackend(wId);
  console.log(`Warden ${wId}: got ${result.pendingCount} pending tasks (expected ${expected})`);
  assert.equal(result.pendingCount, expected, `Mismatch in pending count for ${wId}`);
}
console.log('✓ TEST 1 PASSED: All wardens match expected initial pending tasks counts.\n');

console.log('--- TEST 2: Task Structure & Details Verification ---');
const jenaTasks = getWardenPendingTasksBackend('WRD-101');
assert.ok(jenaTasks.tasks.length >= 3, 'Mr. Rajesh Jena should have at least 3 tasks');
const gatePassTask = jenaTasks.tasks.find(t => t.taskType === 'gate_pass');
assert.ok(gatePassTask, 'Should contain a gate pass task');
assert.equal(gatePassTask.docketNumber, 'GP-2026-4401');
assert.equal(gatePassTask.studentName, 'Rohan Mohanty');
assert.equal(gatePassTask.priority, 'High');
assert.equal(gatePassTask.status, 'Pending Warden Approval');
assert.equal(gatePassTask.parentConsentVerified, true);
console.log('✓ TEST 2 PASSED: Task contains complete docket, student, and verification details.\n');

console.log('--- TEST 3: Status Transition & Dynamic Count Recalculation ---');
// Approve gate pass task
const updateResult = updateWardenPendingTaskStatusBackend(
  'WRD-101',
  'TSK-101-1',
  { status: 'Approved', remarks: 'Parent SMS verified, leave approved for weekend.' },
  { name: 'Hostel Administrator', role: 'HOSTEL_ADMIN' }
);
assert.equal(updateResult.task.status, 'Approved');
assert.equal(updateResult.pendingCount, 2, 'Pending count should decrease from 3 to 2');
assert.ok(updateResult.task.history.length >= 3, 'Audit trail should record approval');
console.log(`✓ TEST 3 PASSED: Task approved. Pending count dynamically updated to ${updateResult.pendingCount}.\n`);

console.log('--- TEST 4: Category and Status Filters ---');
// Filter WRD-103 by category
const complaintsFiltered = getWardenPendingTasksBackend('WRD-103', { category: 'Room Maintenance' });
assert.ok(complaintsFiltered.tasks.every(t => t.category === 'Room Maintenance'), 'All tasks should be Room Maintenance');
console.log(`Filtered WRD-103 Room Maintenance tasks: ${complaintsFiltered.tasks.length}`);

// Filter WRD-103 by priority
const criticalFiltered = getWardenPendingTasksBackend('WRD-103', { priority: 'Critical' });
assert.ok(criticalFiltered.tasks.every(t => t.priority === 'Critical'), 'All tasks should be Critical');
console.log(`Filtered WRD-103 Critical tasks: ${criticalFiltered.tasks.length}`);
console.log('✓ TEST 4 PASSED: Category and Priority filtering works accurately.\n');

console.log('--- TEST 5: Batch Operations ---');
const batchResult = batchActionWardenPendingTasksBackend(
  'WRD-105',
  { taskIds: ['TSK-105-1', 'TSK-105-2'], action: 'resolve', remarks: 'Supervisor bulk verified' },
  { name: 'Hostel Administrator', role: 'ADMIN' }
);
assert.equal(batchResult.updatedCount, 2, 'Should update 2 tasks');
assert.equal(batchResult.pendingCount, 3, 'Pending count should decrease from 5 to 3');
console.log(`✓ TEST 5 PASSED: Batch action resolved 2 tasks. WRD-105 pending count updated to ${batchResult.pendingCount}.\n`);

console.log('--- TEST 6: Aggregated ALL Wardens Docket Query ---');
const allDockets = getWardenPendingTasksBackend('ALL');
assert.ok(allDockets.tasks.length > 10, 'Aggregated dockets across all wardens should be > 10');
assert.ok(allDockets.summary.total > 0, 'Summary should contain total count');
console.log(`Total dockets across campus: ${allDockets.summary.total}, currently pending: ${allDockets.summary.pending}`);
console.log('✓ TEST 6 PASSED: Campus-wide operational docket consolidation verified.\n');

console.log('====================================================');
console.log('ALL 6 WARDEN PENDING TASKS INTEGRATION TESTS PASSED!');
console.log('====================================================');
