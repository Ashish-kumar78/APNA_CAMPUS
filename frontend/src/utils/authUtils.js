/**
 * Shared utility to determine if an authenticated account is an official seed/demo account
 * vs. an authentically created new account.
 * 
 * Demo accounts retain complete synthetic demonstration data (marks, attendance, assignments, fees).
 * Newly registered/created accounts start with clean blank states awaiting institutional allocation.
 */
export function isDemoAccount(account) {
  if (!account) return false;

  // Explicit flag checks
  if (account.isDemo === true) return true;
  if (account.isNewlyRegistered === true) return false;

  const regNo = String(
    account.registrationNumber ||
    account.rollNumber ||
    account.studentId ||
    account.identifier ||
    account.id ||
    ''
  ).trim().toUpperCase();

  const email = String(account.email || '').trim().toLowerCase();
  const name = String(account.name || '').trim().toLowerCase();
  const role = String(account.role || '').trim().toLowerCase();

  // 1. Demo Students: Rakesh Das (2305201001), Bishnu Prasad Sahoo (2401432265), Aarav Sharma (2301289140)
  if (
    regNo === '2305201001' ||
    regNo === '2401432265' ||
    regNo === '2301289140' ||
    regNo === 'STD-1' ||
    regNo === 'GIFT-2023-1001' ||
    name === 'rakesh das' ||
    name === 'bishnu prasad sahoo' ||
    name === 'aarav sharma' ||
    email === 'student@gift.edu.in' ||
    email === 'rakesh.das@gift.edu.in' ||
    regNo === 'STUDENT'
  ) {
    return true;
  }

  // 2. Demo Faculty: Dr. S. Mohanty (FAC-042)
  if (
    regNo === 'FAC-042' ||
    regNo === 'FAC-001' ||
    regNo === 'FACULTY' ||
    name.includes('mohanty') ||
    email === 'faculty@gift.edu.in'
  ) {
    return true;
  }

  // 3. Demo HOD: Dr. P. K. Pattnaik (HOD-CSE)
  if (
    regNo === 'HOD-CSE' ||
    regNo === 'HOD-CSE-001' ||
    regNo === 'HOD' ||
    name.includes('pattnaik') ||
    email === 'hod@gift.edu.in' ||
    email === 'hod.cse@gift.edu.in' ||
    email === 'hod.cse@apnacampus.edu.in'
  ) {
    return true;
  }

  // 4. Other institutional demo personas
  const knownDemoIdentities = [
    'DIR-001',
    'OFF-PRIN-01',
    'ADM-001',
    'ACC-012',
    'COE-EXAM-01',
    'EXAM-001',
    'LIB-001',
    'LIB-HEAD-01',
    'WRD-102',
    'HSTL-001',
    'WRD-ADM-01',
    'SYS-SUPER-01',
    'GOV-CHAIR-01',
    'MGMT-001',
    'TPO-001',
    'CANT-001',
    'ADM-OFF-01',
    'SCH-001',
    'TRN-001'
  ];

  if (knownDemoIdentities.includes(regNo)) {
    return true;
  }

  return false;
}

