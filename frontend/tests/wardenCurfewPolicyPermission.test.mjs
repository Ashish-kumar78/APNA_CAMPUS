import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage and window events for node environment
const store = new Map();
global.localStorage = {
  getItem: (key) => store.get(key) || null,
  setItem: (key, val) => store.set(key, String(val)),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear(),
};

global.window = {
  localStorage: global.localStorage,
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  CustomEvent: class CustomEvent {
    constructor(type, detail) {
      this.type = type;
      this.detail = detail;
    }
  }
};

global.CustomEvent = global.window.CustomEvent;

// Import stores
import {
  getWardenPermissions,
  updateWardenPermissions,
  applyPermissionsToAllWardens,
  getWardenIdFromAccount
} from '../src/services/wardenManagementStore.js';

import {
  getAllHostelRules,
  addHostelRule,
  updateHostelRule,
  deleteHostelRule,
  resetHostelRulesToDefault,
  getStudentRulesList,
  verifyRuleEditPermission
} from '../src/services/hostelRulesStore.js';

describe('Hostel Rules & Curfew Policy - Admin Permission Matrix & Warden Authority Verification', () => {
  beforeEach(() => {
    store.clear();
    resetHostelRulesToDefault();
  });

  test('1. Resolves correct warden ID from account object', () => {
    const warden102 = { role: 'warden', name: 'Mrs. Nibedita Das', id: 'WRD-102' };
    const warden103 = { role: 'warden', name: 'Mr. Tanmaya Kumar Routray', id: 'WRD-103' };
    const adminUser = { role: 'hostel_admin', name: 'Hostel Admin' };

    assert.equal(getWardenIdFromAccount(warden102), 'WRD-102');
    assert.equal(getWardenIdFromAccount(warden103), 'WRD-103');
    assert.equal(getWardenIdFromAccount(adminUser), null);
  });

  test('2. When admin has NOT granted "Edit Curfew & Policies" (editHostelConfiguration: false), mutations are blocked', () => {
    // WRD-103 has editHostelConfiguration: false by default
    const warden103 = { role: 'warden', name: 'Mr. Tanmaya Kumar Routray', id: 'WRD-103' };
    const perms = getWardenPermissions('WRD-103');
    assert.equal(perms.editHostelConfiguration, false);

    // Permission verification throws
    assert.throws(() => {
      verifyRuleEditPermission(warden103);
    }, /Permission Denied/);

    // Direct store mutation throws
    assert.throws(() => {
      addHostelRule({
        category: 'Curfew & Gate Timings',
        title: 'Unauthorized Weekend Curfew',
        value: '11:00 PM',
        description: 'Testing unauthorized mutation',
        user: warden103
      });
    }, /Permission Denied/);
  });

  test('3. When admin grants "Edit Curfew & Policies" to Warden (WRD-102 Mrs. Nibedita Das), warden can add, edit, and delete rules', () => {
    const warden102 = { role: 'warden', name: 'Mrs. Nibedita Das', id: 'WRD-102' };

    // Admin updates permission for WRD-102
    updateWardenPermissions('WRD-102', { editHostelConfiguration: true }, 'Admin enabled curfew & policy editing', false, false);
    const perms = getWardenPermissions('WRD-102');
    assert.equal(perms.editHostelConfiguration, true);

    // Permission check passes
    assert.equal(verifyRuleEditPermission(warden102), true);

    // Warden can add new rule
    const newRule = addHostelRule({
      category: 'Curfew & Gate Timings',
      title: 'Sarojini Special Library Late Night Curfew',
      value: '10:00 PM',
      description: 'Extended library study hours sanctioned for examination period.',
      author: 'Mrs. Nibedita Das (Resident Warden)',
      user: warden102
    });

    assert.ok(newRule.id);
    assert.equal(newRule.title, 'Sarojini Special Library Late Night Curfew');
    assert.equal(newRule.value, '10:00 PM');

    // Rule is immediately visible in student rules list
    const studentList = getStudentRulesList();
    const foundInStudentView = studentList.find(r => r.title === 'Sarojini Special Library Late Night Curfew');
    assert.ok(foundInStudentView);
    assert.equal(foundInStudentView.value, '10:00 PM');

    // Warden can edit existing rule
    const updatedRule = updateHostelRule(newRule.id, {
      category: 'Curfew & Gate Timings',
      title: 'Sarojini Special Library Late Night Curfew (Updated)',
      value: '10:30 PM',
      description: 'Revised study hours sanctioned.',
      author: 'Mrs. Nibedita Das (Resident Warden)',
      user: warden102
    });

    assert.equal(updatedRule.title, 'Sarojini Special Library Late Night Curfew (Updated)');
    assert.equal(updatedRule.value, '10:30 PM');

    // Warden can delete rule
    const deleteSuccess = deleteHostelRule(newRule.id, warden102);
    assert.equal(deleteSuccess, true);

    // Rule is removed from student view
    const studentListAfterDelete = getStudentRulesList();
    assert.equal(studentListAfterDelete.some(r => r.id === newRule.id), false);
  });

  test('4. Bulk matrix permission "Apply to ALL Hostel Wardens" grants or revokes edit permissions for all wardens', () => {
    // Admin applies editHostelConfiguration: true to all
    applyPermissionsToAllWardens({ editHostelConfiguration: true }, 'Admin bulk matrix update', false);
    assert.equal(getWardenPermissions('WRD-101').editHostelConfiguration, true);
    assert.equal(getWardenPermissions('WRD-102').editHostelConfiguration, true);
    assert.equal(getWardenPermissions('WRD-103').editHostelConfiguration, true);
    assert.equal(getWardenPermissions('WRD-104').editHostelConfiguration, true);

    // Admin revokes editHostelConfiguration from all
    applyPermissionsToAllWardens({ editHostelConfiguration: false }, 'Admin bulk matrix revoke', false);
    assert.equal(getWardenPermissions('WRD-101').editHostelConfiguration, false);
    assert.equal(getWardenPermissions('WRD-102').editHostelConfiguration, false);
    assert.equal(getWardenPermissions('WRD-103').editHostelConfiguration, false);
    assert.equal(getWardenPermissions('WRD-104').editHostelConfiguration, false);
  });

  test('5. Baseline rules match institutional regulations and seed structure', () => {
    const rules = getAllHostelRules();
    assert.ok(rules.length >= 4);

    const curfewCat = rules.find(c => c.category === 'Curfew & Gate Timings');
    assert.ok(curfewCat);
    assert.equal(curfewCat.items.length, 4);

    const visitorCat = rules.find(c => c.category === 'Visitor & Guest Policies');
    assert.ok(visitorCat);
    assert.equal(visitorCat.items.length, 3);

    const electricalCat = rules.find(c => c.category === 'Electrical & Room Safety');
    assert.ok(electricalCat);
    assert.equal(electricalCat.items.length, 2);

    const raggingCat = rules.find(c => c.category === 'Anti-Ragging & Code of Conduct');
    assert.ok(raggingCat);
    assert.equal(raggingCat.items.length, 2);
  });
});

