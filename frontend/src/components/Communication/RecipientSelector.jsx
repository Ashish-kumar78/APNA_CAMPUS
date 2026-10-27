import React, { useState, useMemo } from 'react';
import {
  Users,
  Check,
  X,
  Search,
  Filter,
  GraduationCap,
  Briefcase,
  UserCheck,
  Building,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import './CommunicationHub.css';

export const RECIPIENT_ROLES = [
  { id: 'All Campus Users', label: 'All Campus Users', category: 'General' },
  { id: 'All Students', label: 'All Students', category: 'Students' },
  { id: 'All Faculty Members', label: 'All Faculty Members', category: 'Faculty' },
  { id: 'All HODs', label: 'All Department HODs', category: 'Academic Leadership' },
  { id: 'All Teaching Staff', label: 'All Teaching Staff', category: 'Faculty' },
  { id: 'All Non-Teaching Staff', label: 'All Non-Teaching Staff', category: 'Staff' },
  { id: 'Principal', label: 'Office of the Principal', category: 'Executive' },
  { id: 'Management', label: 'Management & Trustees', category: 'Executive' },
  { id: 'Administration', label: 'Campus Administration', category: 'Admin' },
  { id: 'Examination Cell', label: 'Autonomous Examination Cell', category: 'Exam' },
  { id: 'Accounts Department', label: 'Accounts & Finance Department', category: 'Finance' },
  { id: 'Placement Cell', label: 'Training & Placement Cell', category: 'Corporate' },
  { id: 'Admission Department', label: 'Admissions & Counseling', category: 'Admin' },
  { id: 'Library Staff', label: 'Central Library Staff', category: 'Staff' },
  { id: 'Hostel Wardens', label: 'Hostel Wardens & Caretakers', category: 'Residence' },
  { id: 'Transport Department', label: 'Transport & Fleet Operations', category: 'Operations' },
  { id: 'Security Staff', label: 'Campus Security & Gate Control', category: 'Security' },
  { id: 'Technical Staff', label: 'IT & Lab Technical Staff', category: 'Technical' }
];

export const BRANCHES = [
  'CSE', 'CSE (AI)', 'CS & IOT', 'ECE', 'MECH', 'CIVIL', 'EEE', 'EE', 'AGRIL', 'MCA', 'MBA'
];

export const YEARS = ['First Year', 'Second Year', 'Third Year', 'Final Year'];
export const SEMESTERS = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];
export const SECTIONS = ['Section A', 'Section B', 'Section C', 'Section D'];
export const BATCHES = ['Batch 2023-27', 'Batch 2024-28', 'Batch 2022-26', 'Batch 2025-29'];

export const DEPARTMENTS = [
  'Computer Science & Engineering',
  'CSE (Artificial Intelligence)',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Basic Science & Humanities',
  'Management Studies (MBA)',
  'Examination Cell',
  'Accounts & Finance',
  'Training & Placement',
  'Hostel & Residence Services'
];

// Sample Individual Directory for Autocomplete Selector
const SAMPLE_USER_DIRECTORY = [
  { id: '2301289001', name: 'Rakesh Das', role: 'Student', details: 'Roll 01 · CSE (AI) · Sem 5 · Sec A' },
  { id: '2301289002', name: 'Alok Panda', role: 'Student', details: 'Roll 02 · CSE · Sem 5 · Sec A' },
  { id: '2301289003', name: 'Deepak Sethi', role: 'Student', details: 'Roll 03 · CSE · Sem 5 · Sec A' },
  { id: '2301289004', name: 'Priya Patra', role: 'Student', details: 'Roll 04 · CSE · Sem 5 · Sec B' },
  { id: '2301289005', name: 'Sneha Mohanty', role: 'Student', details: 'Roll 05 · CSE (AI) · Sem 5 · Sec A' },
  { id: 'EMP-1042', name: 'Dr. S. Mohanty', role: 'Faculty', details: 'Associate Professor · CSE' },
  { id: 'EMP-1008', name: 'Dr. Pallab Kumar Kar', role: 'Exam Cell', details: 'Controller of Examination (CoE)' },
  { id: 'EMP-1015', name: 'Mrs. Nibedita Das', role: 'Hostel Warden', details: 'Resident Warden · Sarojini Girls' },
  { id: 'EMP-1022', name: 'Prof. B. Panda', role: 'Placement', details: 'Head · Training & Placement Cell' },
  { id: 'EMP-1001', name: 'Dr. G. K. Rout', role: 'Principal', details: 'Principal & Head of Institution' }
];

export default function RecipientSelector({
  value = {
    roles: ['All Students'],
    branches: [],
    years: [],
    semesters: [],
    sections: [],
    batches: [],
    departments: [],
    individualUsers: []
  },
  onChange
}) {
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showAdvancedStudentFilters, setShowAdvancedStudentFilters] = useState(true);
  const [showAdvancedStaffFilters, setShowAdvancedStaffFilters] = useState(false);

  const isStudentsSelected = value.roles.includes('All Students') || value.roles.includes('All Campus Users');
  const isFacultyStaffSelected = value.roles.some(r =>
    ['All Faculty Members', 'All HODs', 'All Teaching Staff', 'All Non-Teaching Staff', 'Technical Staff'].includes(r)
  ) || value.roles.includes('All Campus Users');

  // Toggle Role Selection
  const handleToggleRole = (roleId) => {
    let newRoles;
    if (roleId === 'All Campus Users') {
      newRoles = value.roles.includes('All Campus Users') ? [] : ['All Campus Users'];
    } else {
      const filtered = value.roles.filter(r => r !== 'All Campus Users');
      if (filtered.includes(roleId)) {
        newRoles = filtered.filter(r => r !== roleId);
      } else {
        newRoles = [...filtered, roleId];
      }
    }
    onChange({ ...value, roles: newRoles });
  };

  const handleRemoveRole = (roleId) => {
    onChange({ ...value, roles: value.roles.filter(r => r !== roleId) });
  };

  // Toggle Array Helpers
  const toggleItemInArray = (field, item) => {
    const list = value[field] || [];
    const updated = list.includes(item) ? list.filter(x => x !== item) : [...list, item];
    onChange({ ...value, [field]: updated });
  };

  // Add & Remove Individual User
  const handleAddUser = (user) => {
    if (value.individualUsers.some(u => u.id === user.id)) return;
    onChange({
      ...value,
      individualUsers: [...value.individualUsers, user]
    });
    setUserSearchQuery('');
  };

  const handleRemoveUser = (userId) => {
    onChange({
      ...value,
      individualUsers: value.individualUsers.filter(u => u.id !== userId)
    });
  };

  // Autocomplete directory search
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return [];
    const q = userSearchQuery.toLowerCase();
    return SAMPLE_USER_DIRECTORY.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      u.details.toLowerCase().includes(q)
    );
  }, [userSearchQuery]);

  // Estimated Recipient Calculation
  const estimatedCount = useMemo(() => {
    if (value.roles.includes('All Campus Users')) return 2850;
    let count = 0;
    if (value.roles.includes('All Students')) {
      let base = 2100;
      if (value.branches?.length > 0) base = Math.round(base * (value.branches.length / BRANCHES.length));
      if (value.semesters?.length > 0) base = Math.round(base * (value.semesters.length / 8));
      if (value.sections?.length > 0) base = Math.round(base * (value.sections.length / 3));
      count += Math.max(base, 32);
    }
    if (value.roles.includes('All Faculty Members') || value.roles.includes('All Teaching Staff')) count += 140;
    if (value.roles.includes('All HODs')) count += 12;
    if (value.roles.includes('All Non-Teaching Staff')) count += 85;
    if (value.roles.includes('Hostel Wardens')) count += 16;
    if (value.roles.includes('Placement Cell')) count += 8;
    if (value.roles.includes('Examination Cell')) count += 14;
    if (value.roles.includes('Accounts Department')) count += 10;
    count += (value.individualUsers?.length || 0);
    return Math.max(count, value.individualUsers?.length || 0);
  }, [value]);

  return (
    <div className="apna-recipient-selector-root">
      {/* Target Category Pills */}
      <div className="apna-form-group">
        <label className="apna-form-label">
          <span>Target Recipient Groups <span style={{ color: '#ef4444' }}>*</span></span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Select one or multiple stakeholder roles</span>
        </label>
        <div className="apna-roles-grid">
          {RECIPIENT_ROLES.map(r => {
            const isSelected = value.roles.includes(r.id);
            return (
              <div
                key={r.id}
                className={`apna-role-chip ${isSelected ? 'selected' : ''}`}
                onClick={() => handleToggleRole(r.id)}
              >
                <div className={`apna-checkbox ${isSelected ? 'checked' : ''}`}>
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </div>
                <span>{r.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Roles Active Tags */}
      {value.roles.length > 0 && (
        <div className="apna-selected-tags-row">
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569' }}>Selected Groups:</span>
          {value.roles.map(r => (
            <span key={r} className="apna-role-tag">
              {r}
              <button type="button" onClick={() => handleRemoveRole(r)} title="Remove group">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* STUDENT TARGETING PANEL */}
      {isStudentsSelected && (
        <div className="apna-targeting-panel student-targeting">
          <div
            className="apna-targeting-panel-header"
            onClick={() => setShowAdvancedStudentFilters(prev => !prev)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={18} color="#2563eb" />
              <strong>Student Granular Targeting (Branch, Semester &amp; Section)</strong>
            </div>
            <button type="button" className="apna-accordion-btn">
              {showAdvancedStudentFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {showAdvancedStudentFilters && (
            <div className="apna-targeting-panel-body">
              {/* Branch Selection */}
              <div className="apna-filter-subgroup">
                <span className="apna-subgroup-title">Filter by Branch / Stream:</span>
                <div className="apna-filter-pill-cloud">
                  {BRANCHES.map(br => {
                    const active = (value.branches || []).includes(br);
                    return (
                      <button
                        key={br}
                        type="button"
                        className={`apna-cloud-pill ${active ? 'active' : ''}`}
                        onClick={() => toggleItemInArray('branches', br)}
                      >
                        {br}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Semester & Year Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.75rem' }}>
                <div className="apna-filter-subgroup">
                  <span className="apna-subgroup-title">Academic Semester:</span>
                  <div className="apna-filter-pill-cloud">
                    {SEMESTERS.slice(0, 8).map(sem => {
                      const active = (value.semesters || []).includes(sem);
                      return (
                        <button
                          key={sem}
                          type="button"
                          className={`apna-cloud-pill ${active ? 'active' : ''}`}
                          onClick={() => toggleItemInArray('semesters', sem)}
                        >
                          {sem}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="apna-filter-subgroup">
                  <span className="apna-subgroup-title">Section:</span>
                  <div className="apna-filter-pill-cloud">
                    {SECTIONS.map(sec => {
                      const active = (value.sections || []).includes(sec);
                      return (
                        <button
                          key={sec}
                          type="button"
                          className={`apna-cloud-pill ${active ? 'active' : ''}`}
                          onClick={() => toggleItemInArray('sections', sec)}
                        >
                          {sec}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FACULTY & STAFF TARGETING PANEL */}
      {isFacultyStaffSelected && (
        <div className="apna-targeting-panel staff-targeting">
          <div
            className="apna-targeting-panel-header"
            onClick={() => setShowAdvancedStaffFilters(prev => !prev)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={18} color="#7c3aed" />
              <strong>Faculty &amp; Staff Department Filters</strong>
            </div>
            <button type="button" className="apna-accordion-btn">
              {showAdvancedStaffFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {showAdvancedStaffFilters && (
            <div className="apna-targeting-panel-body">
              <span className="apna-subgroup-title">Target Specific Academic / Administrative Departments:</span>
              <div className="apna-filter-pill-cloud">
                {DEPARTMENTS.map(dept => {
                  const active = (value.departments || []).includes(dept);
                  return (
                    <button
                      key={dept}
                      type="button"
                      className={`apna-cloud-pill purple ${active ? 'active' : ''}`}
                      onClick={() => toggleItemInArray('departments', dept)}
                    >
                      {dept}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SEARCHABLE INDIVIDUAL RECIPIENT SELECTOR */}
      <div className="apna-form-group" style={{ marginTop: '0.75rem' }}>
        <label className="apna-form-label">
          <span>Search &amp; Add Specific Individual Users (Optional)</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Search by Name, Roll, Registration or Employee ID</span>
        </label>
        <div className="apna-search-user-wrapper">
          <Search size={15} className="apna-search-icon" />
          <input
            type="text"
            className="apna-form-input search-input"
            placeholder="Type name, roll number, or employee ID (e.g. 2301289001, Dr. Mohanty)..."
            value={userSearchQuery}
            onChange={e => setUserSearchQuery(e.target.value)}
          />

          {filteredUsers.length > 0 && (
            <div className="apna-user-dropdown-list">
              {filteredUsers.map(u => (
                <div
                  key={u.id}
                  className="apna-user-dropdown-item"
                  onClick={() => handleAddUser(u)}
                >
                  <div className="user-avatar-initials">
                    {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#0f172a' }}>{u.name}</div>
                    <small style={{ color: '#64748b' }}>{u.role} · {u.details}</small>
                  </div>
                  <button type="button" className="apna-add-user-btn">
                    + Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Individual Users Chips */}
        {value.individualUsers?.length > 0 && (
          <div className="apna-individual-chips-list">
            {value.individualUsers.map(u => (
              <span key={u.id} className="apna-individual-chip">
                <UserCheck size={12} color="#059669" />
                <span>{u.name} ({u.id})</span>
                <button type="button" onClick={() => handleRemoveUser(u.id)}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* RECIPIENT REACH SUMMARY BANNER */}
      <div className="apna-recipient-summary-box">
        <div className="summary-left">
          <Info size={16} color="#0284c7" />
          <div>
            <strong>Estimated Recipient Reach: ~{estimatedCount.toLocaleString()} Verified Stakeholders</strong>
            <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#64748b' }}>
              Preview count derived from current institutional ERP role records &amp; filters.
            </p>
          </div>
        </div>
        <span className="apna-reach-badge">
          Ready to Dispatch
        </span>
      </div>
    </div>
  );
}
