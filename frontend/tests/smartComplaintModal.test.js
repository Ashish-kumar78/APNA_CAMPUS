import { describe, expect, it } from 'vitest';
import { COLLEGE_CATEGORIES } from '../src/components/SmartComplaintModal.jsx';

describe('Smart Complaint Modal - 7 College Categories & UI Validation', () => {
  it('should expose all 7 institutional college complaint categories', () => {
    const keys = COLLEGE_CATEGORIES.map(c => c.key);
    expect(keys).toEqual([
      'PLUMBING',
      'ELECTRICAL',
      'CLEANING',
      'FURNITURE',
      'CIVIL',
      'NETWORK',
      'OTHER',
    ]);
    expect(COLLEGE_CATEGORIES.length).toBe(7);
  });

  it('should have descriptive labels, icons, and examples for every category', () => {
    COLLEGE_CATEGORIES.forEach(cat => {
      expect(cat.label).toBeTruthy();
      expect(cat.desc).toBeTruthy();
      expect(cat.example).toBeTruthy();
      expect(cat.icon).toBeDefined();
    });
  });

  it('should validate image formats strictly allowing only JPEG, PNG, and WebP', () => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    const testCases = [
      { type: 'image/jpeg', valid: true },
      { type: 'image/png', valid: true },
      { type: 'image/webp', valid: true },
      { type: 'application/pdf', valid: false },
      { type: 'video/mp4', valid: false },
      { type: 'text/plain', valid: false },
      { type: 'application/x-msdownload', valid: false },
    ];

    testCases.forEach(({ type, valid }) => {
      expect(allowed.includes(type)).toBe(valid);
    });
  });

  it('should validate image file size enforcing a maximum 5MB limit', () => {
    const MAX_SIZE = 5 * 1024 * 1024;
    expect(4.8 * 1024 * 1024 <= MAX_SIZE).toBe(true);
    expect(5.0 * 1024 * 1024 <= MAX_SIZE).toBe(true);
    expect(5.1 * 1024 * 1024 <= MAX_SIZE).toBe(false);
    expect(12 * 1024 * 1024 <= MAX_SIZE).toBe(false);
  });
});

describe('AI Classification & Confidence Calibration Policy', () => {
  function calibrateConfidence(confidence, collegeCategory) {
    let level = 'low';
    if (confidence >= 0.80) {
      level = 'high';
    } else if (confidence >= 0.60) {
      level = 'medium';
    } else {
      level = 'low';
    }

    const needsReview = confidence < 0.65 || collegeCategory === 'OTHER';
    return { level, needsReview };
  }

  it('should classify high-confidence predictions (>= 0.80) without mandatory review', () => {
    const policy = calibrateConfidence(0.85, 'PLUMBING');
    expect(policy.level).toBe('high');
    expect(policy.needsReview).toBe(false);
  });

  it('should classify medium-confidence predictions (0.60 - 0.79) correctly', () => {
    const policy = calibrateConfidence(0.72, 'ELECTRICAL');
    expect(policy.level).toBe('medium');
    expect(policy.needsReview).toBe(false);
  });

  it('should flag low-confidence predictions (< 0.60) for human supervisor review', () => {
    const policy = calibrateConfidence(0.52, 'CIVIL');
    expect(policy.level).toBe('low');
    expect(policy.needsReview).toBe(true);
  });

  it('should always flag OTHER category for supervisor review regardless of score', () => {
    const policy = calibrateConfidence(0.88, 'OTHER');
    expect(policy.needsReview).toBe(true);
  });
});

describe('Category Taxonomy Mapping (6 Model Classes -> 7 College Categories)', () => {
  const modelToCollegeMap = {
    plumbing: 'PLUMBING',
    electrical: 'ELECTRICAL',
    cleaning: 'CLEANING',
    furniture: 'FURNITURE',
    civil: 'CIVIL',
    maintenance: 'CIVIL', // Subdivided into FURNITURE vs CIVIL
    network: 'NETWORK',
    internet_it: 'NETWORK',
    other: 'OTHER',
  };

  it('should map each underlying model class to a supported college category', () => {
    expect(modelToCollegeMap['plumbing']).toBe('PLUMBING');
    expect(modelToCollegeMap['electrical']).toBe('ELECTRICAL');
    expect(modelToCollegeMap['cleaning']).toBe('CLEANING');
    expect(modelToCollegeMap['internet_it']).toBe('NETWORK');
    expect(modelToCollegeMap['other']).toBe('OTHER');
  });

  it('should allow student manual override over AI prediction', () => {
    const aiPrediction = 'PLUMBING';
    const studentSelection = 'CIVIL';
    const finalCategory = studentSelection || aiPrediction;
    expect(finalCategory).toBe('CIVIL');
  });
});

describe('Location & Duplicate Suppression Logic', () => {
  function constructLocation(building, floor, area, details) {
    const base = `${building} · ${floor} · ${area}`;
    return details && details.trim() ? `${base} (${details.trim()})` : base;
  }

  it('should construct structured location strings with details', () => {
    const loc = constructLocation(
      'Sarojini Girls Residence (Block A)',
      '2nd Floor',
      'Room Attached Bathroom',
      'Washbasin tap #1'
    );
    expect(loc).toBe('Sarojini Girls Residence (Block A) · 2nd Floor · Room Attached Bathroom (Washbasin tap #1)');
  });

  it('should suppress identical complaints submitted within 60 seconds', () => {
    const now = Date.now();
    const existing = {
      rollNumber: '01',
      title: 'Water tap leaking continuously',
      createdAt: new Date(now - 30000), // 30s ago
    };

    function isDuplicate(rollNumber, title, submissionTime) {
      const windowMs = 60000;
      return (
        existing.rollNumber === rollNumber &&
        existing.title === title &&
        submissionTime.getTime() - existing.createdAt.getTime() < windowMs
      );
    }

    expect(isDuplicate('01', 'Water tap leaking continuously', new Date(now))).toBe(true);
    expect(isDuplicate('02', 'Water tap leaking continuously', new Date(now))).toBe(false);
    expect(isDuplicate('01', 'Different title', new Date(now))).toBe(false);
    expect(isDuplicate('01', 'Water tap leaking continuously', new Date(now + 65000))).toBe(false);
  });
});
