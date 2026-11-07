import { describe, it, expect } from 'vitest';
import {
  resolveAcademicProfile,
  DEFAULT_FACULTY_PROFILE,
  DEFAULT_HOD_PROFILE,
  DEFAULT_PRINCIPAL_PROFILE
} from '../src/components/Profile/academicProfilesData.js';
import { generateInstitutionalAcademicDocumentPdf } from '../src/utils/academicDocumentService.js';

describe('Academic Official Employee Profile Suite', () => {
  it('resolves Faculty profile correctly with dashboard information', () => {
    const facultyAccount = {
      role: 'faculty',
      name: 'Dr. S. Mohanty',
      identity: 'FAC-042',
      department: 'Computer Science & Engineering',
      designation: 'Assistant Professor',
      email: 's.mohanty@apnacampus.edu.in',
      phone: '9437011223'
    };

    const profile = resolveAcademicProfile(facultyAccount, 'faculty');

    expect(profile.name).toBe('Dr. S. Mohanty');
    expect(profile.employeeId).toBe('FAC-042');
    expect(profile.department).toBe('Computer Science & Engineering');
    expect(profile.designation).toBe('Assistant Professor');
    expect(profile.emailId).toBe('s.mohanty@apnacampus.edu.in');
    expect(profile.mobileNo).toBe('9437011223');
    expect(profile.category).toBe('Teaching');
    expect(profile.activeRolePerspective).toBe('Faculty Member / Assistant Professor');

    // Check tabs data
    expect(profile.title).toBe('Dr.');
    expect(profile.firstName).toBe('S.');
    expect(profile.lastName).toBe('Mohanty');
    expect(profile.gender).toBe('MALE');
    expect(profile.totalExperience).toContain('12 Year(s)');
    expect(profile.bloodGroup).toBe('B+');

    // Guardians
    expect(profile.fatherName).toContain('Mohanty');
    expect(profile.spouseName).toContain('Mohanty');
    expect(profile.relationship).toBe('Spouse');

    // Address
    expect(profile.presentCity).toBe('Bhubaneswar');
    expect(profile.presentDistrict).toBe('Khordha');

    // Other Info
    expect(profile.qualification).toContain('Ph.D.');
    expect(profile.specialization).toContain('Artificial Intelligence');
    expect(profile.papersPublished).toContain('Scopus');

    // Documents
    expect(profile.documents.length).toBeGreaterThanOrEqual(4);
    expect(profile.documents[0].name).toContain('Faculty Appointment Order');

    // Health
    expect(profile.physicalFitness).toContain('Fit for Full-Time Academic Teaching');
    expect(profile.bloodPressure).toBe('120/80 mmHg');
  });

  it('resolves HOD profile correctly with department leadership information', () => {
    const hodAccount = {
      role: 'hod',
      name: 'Dr. P. K. Pattnaik',
      identity: 'HOD-CSE-001',
      department: 'Computer Science & Engineering',
      designation: 'Professor & Head of Department',
      email: 'hod.cse@apnacampus.edu.in',
      phone: '+91 94370 55102'
    };

    const profile = resolveAcademicProfile(hodAccount, 'hod');

    expect(profile.name).toBe('Dr. P. K. Pattnaik');
    expect(profile.employeeId).toBe('HOD-CSE-001');
    expect(profile.department).toBe('Computer Science & Engineering');
    expect(profile.designation).toBe('Professor & Head of Department');
    expect(profile.activeRolePerspective).toBe('Department Head (HOD)');
    expect(profile.qualification).toContain('Ph.D.');
    expect(profile.specialization).toContain('Distributed Systems');
    expect(profile.rdProjectUndertaken).toContain('DST-SERB');
    expect(profile.documents.some(d => d.name.includes('Head of Department'))).toBe(true);
  });

  it('resolves Principal profile correctly with executive governance information', () => {
    const principalAccount = {
      role: 'principal',
      name: 'Dr. B. K. Sarap',
      identity: 'OFF-PRIN-01',
      department: 'Office of the Principal',
      designation: 'Principal & Autonomous Campus Director',
      email: 'principal@apnacampus.edu.in'
    };

    const profile = resolveAcademicProfile(principalAccount, 'principal');

    expect(profile.name).toBe('Dr. B. K. Sarap');
    expect(profile.employeeId).toBe('OFF-PRIN-01');
    expect(profile.designation).toBe('Principal & Autonomous Campus Director');
    expect(profile.activeRolePerspective).toBe('Principal & Campus Director');
    expect(profile.category).toBe('Institutional Academic Leadership');
    expect(profile.totalExperience).toContain('28 Year(s)');
    expect(profile.qualification).toContain('IIT Kharagpur');
  });

  it('generates institutional academic credential PDF without errors', () => {
    const profile = DEFAULT_FACULTY_PROFILE;
    const doc = profile.documents[0];

    const pdf = generateInstitutionalAcademicDocumentPdf(doc, profile);
    expect(pdf).toBeDefined();
    expect(pdf.internal.pageSize.getWidth()).toBeGreaterThan(0);
    expect(pdf.internal.pageSize.getHeight()).toBeGreaterThan(0);
  });
});

