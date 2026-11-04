import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sliders,
  Calendar,
  Layers,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Cpu,
  X,
  Building2,
  BookOpen,
  Users,
  Plus,
  Clock,
  ShieldCheck,
  CheckSquare,
  Square,
  MapPin,
  Coffee,
  Palette,
  Check
} from 'lucide-react';
import { api } from '../../services/api';

export default function TimetableGeneratorModal({
  isOpen,
  onClose,
  onGenerated,
  userDepartment = 'CSE',
  isEmbedded = false, // true when rendered inside the "Generate Timetable" tab
}) {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Academic Information
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [department, setDepartment] = useState(userDepartment || 'CSE');
  const [branch, setBranch] = useState('CSE (AI & ML)');
  const [studyYear, setStudyYear] = useState('3rd Year');
  const [semester, setSemester] = useState('Semester 5');
  const [selectedSections, setSelectedSections] = useState(['Section A', 'Section B']);
  const [workingDays, setWorkingDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
  const [startTime, setStartTime] = useState('08:30 AM');
  const [endTime, setEndTime] = useState('04:30 PM');

  // Master Data Lists (Loaded from DB)
  const [academicYearsList, setAcademicYearsList] = useState(['2026-27', '2025-26', '2027-28']);
  const [departmentsList, setDepartmentsList] = useState(['CSE', 'ECE', 'MECH', 'CIVIL', 'EE']);
  const [branchesList, setBranchesList] = useState(['CSE (AI & ML)', 'CSE (Data Science)', 'Computer Science & Engg', 'Information Technology']);
  const [semestersList, setSemestersList] = useState(['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8']);
  const [sectionsList, setSectionsList] = useState(['Section A', 'Section B', 'Section C', 'Section D']);
  const [subjectsList, setSubjectsList] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [roomsList, setRoomsList] = useState([]);

  // Step 2 & 3: Curriculum Subjects & Multi-Faculty Mapping
  const [subjectAllocations, setSubjectAllocations] = useState([]);

  // Step 4 & 5: Teacher Workload & Gap Constraints
  const [enforceTeacherGap, setEnforceTeacherGap] = useState(true);
  const [minGapMinutes, setMinGapMinutes] = useState(60);
  const [maxDailyFacultyHours, setMaxDailyFacultyHours] = useState(4);
  const [maxConsecutiveTheory, setMaxConsecutiveTheory] = useState(2);

  // Step 6 & 7: Staggered Lunch & Compulsory Weekly Activities
  const [staggeredLunchEnabled, setStaggeredLunchEnabled] = useState(true);
  const [lunchWindowStart, setLunchWindowStart] = useState('12:00 PM');
  const [lunchWindowEnd, setLunchWindowEnd] = useState('02:00 PM');
  const [includeHobbyClub, setIncludeHobbyClub] = useState(true);
  const [hobbyClubDay, setHobbyClubDay] = useState('Thursday');
  const [hobbyClubTime, setHobbyClubTime] = useState('02:00 PM - 04:00 PM');
  const [includeLibrary, setIncludeLibrary] = useState(true);

  // Step 9: Solver Execution
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobStatus, setJobStatus] = useState(null);
  const [generationError, setGenerationError] = useState('');
  const [infeasibilityReport, setInfeasibilityReport] = useState(null);

  // Universal "+ Add New" Modals State
  const [activeModal, setActiveModal] = useState(null); // 'year', 'dept', 'branch', 'semester', 'section', 'subject', 'faculty', 'room'
  const [modalFormData, setModalFormData] = useState({});
  const [modalError, setModalError] = useState('');
  const [isModalSubmitting, setIsModalSubmitting] = useState(false);

  // Load Master Data from DB
  const loadMasterData = async () => {
    try {
      const [secRes, subRes, facRes, rmRes, brRes, yrRes] = await Promise.all([
        api.getTimetableSections({ department }).catch(() => ({ data: [] })),
        api.getSubjects(department, semester).catch(() => ({ data: [] })),
        api.getFaculty().catch(() => ({ data: [] })),
        api.getTimetableRooms({ department }).catch(() => ({ data: [] })),
        api.getTimetableBranches({ department }).catch(() => ({ data: [] })),
        api.getTimetableAcademicYears().catch(() => ({ data: [] })),
      ]);

      if (secRes?.data?.length > 0) {
        setSectionsList(Array.from(new Set(secRes.data.map((s) => s.section))));
      }
      if (brRes?.data?.length > 0) {
        setBranchesList(Array.from(new Set(brRes.data.map((b) => b.name))));
      }
      if (yrRes?.data?.length > 0) {
        setAcademicYearsList(Array.from(new Set(yrRes.data.map((y) => y.year))));
      }

      const facultyData = facRes?.data || [];
      setFacultyList(facultyData);

      const roomsData = rmRes?.data || [];
      setRoomsList(roomsData);

      let subs = subRes?.data || [];
      if (subs.length === 0) {
        // Fallback default autonomous syllabus
        subs = [
          { id: 'sub-1', code: 'CS501', name: 'Artificial Intelligence & Intelligent Agents', weeklyHours: 4, durationMinutes: 60, type: 'Theory', classroomType: 'CLASSROOM' },
          { id: 'sub-2', code: 'CS502', name: 'Machine Learning & Deep Neural Nets', weeklyHours: 3, durationMinutes: 90, type: 'Theory', classroomType: 'SMART_CLASSROOM' },
          { id: 'sub-3', code: 'CS503', name: 'Cloud Native Computing & Microservices', weeklyHours: 3, durationMinutes: 60, type: 'Theory', classroomType: 'CLASSROOM' },
          { id: 'sub-4', code: 'CS504', name: 'Compiler Engineering & Automata', weeklyHours: 4, durationMinutes: 60, type: 'Theory', classroomType: 'CLASSROOM' },
          { id: 'sub-5', code: 'CS505', name: 'Applied AI & Data Science Laboratory', weeklyHours: 3, durationMinutes: 90, type: 'Practical', classroomType: 'COMPUTER_LAB', isLab: true },
        ];
      }
      setSubjectsList(subs);

      // Initialize subject allocation rows
      setSubjectAllocations(
        subs.map((sub, idx) => ({
          subjectId: sub.id,
          code: sub.code,
          name: sub.name,
          type: sub.type || 'Theory',
          weeklyHours: sub.weeklyHours || 4,
          durationMinutes: sub.durationMinutes || 60, // 60 or 90
          classroomType: sub.classroomType || (sub.type?.includes('Lab') ? 'COMPUTER_LAB' : 'CLASSROOM'),
          isLab: Boolean(sub.isLab || sub.type?.toLowerCase().includes('lab') || sub.type?.toLowerCase().includes('practical')),
          assignedFacultyIds: facultyData.length > 0 ? [facultyData[idx % facultyData.length].id] : [],
        }))
      );
    } catch (err) {
      console.warn('Master data load warning:', err.message);
    }
  };

  useEffect(() => {
    if (isOpen || isEmbedded) {
      loadMasterData();
    }
  }, [isOpen, isEmbedded, department, semester]);

  // Handle Section Toggle
  const toggleSection = (secName) => {
    if (selectedSections.includes(secName)) {
      if (selectedSections.length === 1) return; // keep at least 1 section
      setSelectedSections(selectedSections.filter((s) => s !== secName));
    } else {
      setSelectedSections([...selectedSections, secName]);
    }
  };

  const selectAllSections = () => {
    setSelectedSections([...sectionsList]);
  };

  // Handle Day Toggle
  const toggleWorkingDay = (day) => {
    if (workingDays.includes(day)) {
      if (workingDays.length <= 4) return;
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  // Subject Allocation updates
  const updateSubjectRow = (index, field, value) => {
    const updated = [...subjectAllocations];
    updated[index] = { ...updated[index], [field]: value };
    setSubjectAllocations(updated);
  };

  // Toggle faculty assignment for subject
  const toggleFacultyForSubject = (subjectIndex, facId) => {
    const updated = [...subjectAllocations];
    const current = updated[subjectIndex].assignedFacultyIds || [];
    if (current.includes(facId)) {
      if (current.length === 1) return; // Keep at least 1 faculty
      updated[subjectIndex].assignedFacultyIds = current.filter((id) => id !== facId);
    } else {
      updated[subjectIndex].assignedFacultyIds = [...current, facId];
    }
    setSubjectAllocations(updated);
  };

  // ========================================================
  // UNIVERSAL "+ ADD NEW" MODAL HANDLER
  // Saves to PostgreSQL, refreshes list, auto-selects new item
  // ========================================================
  const handleOpenAddModal = (modalType) => {
    setActiveModal(modalType);
    setModalError('');
    setModalFormData({});
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    setIsModalSubmitting(true);
    setModalError('');

    try {
      if (activeModal === 'year') {
        const yr = modalFormData.year?.trim();
        if (!yr) throw new Error('Academic year is required');
        await api.createTimetableAcademicYear({ year: yr, isCurrent: true });
        setAcademicYearsList((prev) => Array.from(new Set([yr, ...prev])));
        setAcademicYear(yr);
      } else if (activeModal === 'branch') {
        const bName = modalFormData.name?.trim();
        if (!bName) throw new Error('Branch name is required');
        await api.createTimetableBranch({ name: bName, department });
        setBranchesList((prev) => Array.from(new Set([bName, ...prev])));
        setBranch(bName);
      } else if (activeModal === 'semester') {
        const semNum = Number(modalFormData.number) || 1;
        const semLabel = `Semester ${semNum}`;
        await api.createTimetableSemester({ number: semNum, label: semLabel, academicYear });
        setSemestersList((prev) => Array.from(new Set([...prev, semLabel])));
        setSemester(semLabel);
      } else if (activeModal === 'section') {
        const sec = modalFormData.section?.trim() || `Section ${modalFormData.name?.trim()}`;
        if (!sec) throw new Error('Section name is required');
        await api.createTimetableSection({ section: sec, semester, department });
        setSectionsList((prev) => Array.from(new Set([...prev, sec])));
        if (!selectedSections.includes(sec)) {
          setSelectedSections((prev) => [...prev, sec]);
        }
      } else if (activeModal === 'subject') {
        const code = modalFormData.code?.trim().toUpperCase();
        const name = modalFormData.name?.trim();
        const dur = Number(modalFormData.durationMinutes) || 60;
        const hours = Number(modalFormData.weeklyHours) || 4;
        const type = modalFormData.type || 'Theory';
        if (!code || !name) throw new Error('Subject code and name are required');

        await api.createTimetableSubject({
          code,
          name,
          department,
          semester,
          credits: hours,
          type,
        });

        const newSubObj = {
          id: `sub_${Date.now()}`,
          code,
          name,
          type,
          weeklyHours: hours,
          durationMinutes: dur,
          classroomType: type.includes('Lab') ? 'COMPUTER_LAB' : 'CLASSROOM',
          isLab: Boolean(type.toLowerCase().includes('lab') || type.toLowerCase().includes('practical')),
          assignedFacultyIds: facultyList.length > 0 ? [facultyList[0].id] : [],
        };

        setSubjectsList((prev) => [...prev, newSubObj]);
        setSubjectAllocations((prev) => [...prev, newSubObj]);
      } else if (activeModal === 'room') {
        const roomNumber = modalFormData.roomNumber?.trim();
        if (!roomNumber) throw new Error('Room Number is required');
        await api.createTimetableRoom({
          roomNumber,
          building: modalFormData.building || 'Main Academic Block',
          floor: modalFormData.floor || '3rd Floor',
          roomType: modalFormData.roomType || 'CLASSROOM',
          capacity: Number(modalFormData.capacity) || 65,
          isLab: Boolean(modalFormData.isLab),
          department,
        });
        await loadMasterData();
      }

      setActiveModal(null);
    } catch (err) {
      setModalError(err?.message || 'Failed to save record to database.');
    } finally {
      setIsModalSubmitting(false);
    }
  };

  // ========================================================
  // START SOLVER GENERATION (CP-SAT 30-MIN BASE UNIT ENGINE)
  // ========================================================
  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setGenerationError('');
    setInfeasibilityReport(null);
    setJobStatus({
      status: 'PENDING',
      progress: 15,
      stepName: 'Initiating APNA CAMPUS 30-Minute Base Unit CP-SAT Engine...',
    });

    try {
      // Build requirements formatted with durationUnits (1h = 2 units, 1.5h = 3 units)
      const formattedRequirements = [];

      for (const sec of selectedSections) {
        for (const sub of subjectAllocations) {
          const durMin = sub.durationMinutes === 90 ? 90 : 60;
          const durUnits = durMin === 90 ? 3 : 2;
          const totalHours = sub.weeklyHours || 4;
          const sessionsNeeded = Math.max(1, Math.round(totalHours / (durMin / 60)));

          // Faculty mapping
          const assignedFac = facultyList.find((f) => sub.assignedFacultyIds?.includes(f.id)) || facultyList[0];

          formattedRequirements.push({
            id: `req_${sec}_${sub.code}`,
            subjectCode: sub.code,
            subjectName: sub.name,
            section: sec,
            facultyId: assignedFac?.id,
            facultyName: assignedFac?.name,
            isLab: sub.isLab,
            durationMinutes: durMin,
            durationUnits: durUnits,
            requiredSessions: sessionsNeeded,
            credits: totalHours,
            sessionType: sub.type?.toUpperCase() || (sub.isLab ? 'LAB' : 'THEORY'),
          });
        }
      }

      const res = await api.generateTimetable({
        academicYear,
        department,
        branch,
        studyYear,
        semester,
        sections: selectedSections,
        workingDays,
        startTime,
        endTime,
        subjects: subjectAllocations,
        constraintsConfig: {
          enforceTeacherGap,
          minFacultyGapUnits: Math.max(1, Math.round(minGapMinutes / 30)),
          maxDailyFacultyHours,
          maxConsecutiveTheory,
          includeHobbyClub,
          hobbyClubDay,
          hobbyClubStartUnit: 11, // 14:00 (2 PM)
          includeLibrary,
          staggeredLunchEnabled,
          lunchWindowStartUnit: 7, // 12:00 PM
        },
      });

      if (!res.success) {
        throw new Error(res.message || 'Solver initialization failed');
      }

      const jobId = res.jobId;
      pollJobStatus(jobId);
    } catch (err) {
      setIsGenerating(false);
      setGenerationError(err?.message || 'Error communicating with timetable generation service.');
    }
  };

  const pollJobStatus = (jobId) => {
    const interval = setInterval(async () => {
      try {
        const jobRes = await api.getTimetableJob(jobId);
        const job = jobRes?.data;
        if (!job) return;

        setJobStatus(job);

        if (job.status === 'COMPLETED') {
          clearInterval(interval);
          setIsGenerating(false);
          if (onGenerated) {
            onGenerated(job.resultTimetableId);
          }
          if (onClose) onClose();
        } else if (job.status === 'INFEASIBLE') {
          clearInterval(interval);
          setIsGenerating(false);
          setInfeasibilityReport(job.infeasibilityReport || {
            likelyCauses: ['Hard constraint satisfaction failure: teacher gap or room capacity bottleneck.'],
            suggestedAction: 'Consider adjusting teacher daily limit hours or adding laboratory rooms.',
          });
        } else if (job.status === 'FAILED') {
          clearInterval(interval);
          setIsGenerating(false);
          setGenerationError(job.error || 'Optimization solver encountered an error.');
        }
      } catch (e) {
        // Continue polling until completed
      }
    }, 1500);
  };

  const renderContent = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '12px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '8px' }}>
          {[
            { num: 1, title: 'Academic Scope' },
            { num: 2, title: 'Subjects & Durations' },
            { num: 3, title: 'Faculty & Workload' },
            { num: 4, title: 'Breaks & Activities' },
            { num: 5, title: 'Generate Engine' },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => { if (!isGenerating) setCurrentStep(s.num); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isGenerating ? 'default' : 'pointer',
                opacity: currentStep === s.num ? 1 : 0.65,
                fontWeight: currentStep === s.num ? 700 : 500,
                color: currentStep === s.num ? '#2563eb' : '#475569',
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: currentStep === s.num ? '#2563eb' : '#cbd5e1',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}
              >
                {s.num}
              </div>
              <span style={{ fontSize: '0.82rem' }}>{s.title}</span>
            </div>
          ))}
        </div>

        {/* STEP 1: ACADEMIC SELECTION */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="tt-assistant-box">
              <Sparkles size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Step 1: Institutional Academic Information</strong>
                <div style={{ marginTop: '2px', fontSize: '0.78rem' }}>
                  Select target academic parameters and multiple sections. All selected sections will be solved simultaneously with zero shared teacher or room clashes.
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {/* Academic Year */}
              <div className="tt-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>Academic Year *</label>
                  <button type="button" onClick={() => handleOpenAddModal('year')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                    + Add New
                  </button>
                </div>
                <select className="tt-form-select" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
                  {academicYearsList.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div className="tt-form-group">
                <label>Department *</label>
                <select className="tt-form-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
                  {departmentsList.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Branch */}
              <div className="tt-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>Branch / Specialization *</label>
                  <button type="button" onClick={() => handleOpenAddModal('branch')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                    + Add New
                  </button>
                </div>
                <select className="tt-form-select" value={branch} onChange={(e) => setBranch(e.target.value)}>
                  {branchesList.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Study Year */}
              <div className="tt-form-group">
                <label>Study Year *</label>
                <select className="tt-form-select" value={studyYear} onChange={(e) => setStudyYear(e.target.value)}>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              {/* Semester */}
              <div className="tt-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>Semester *</label>
                  <button type="button" onClick={() => handleOpenAddModal('semester')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                    + Add New
                  </button>
                </div>
                <select className="tt-form-select" value={semester} onChange={(e) => setSemester(e.target.value)}>
                  {semestersList.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* MULTI-SECTION PICKER (Mandatory) */}
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                  Target Class Sections (Multi-Section Simultaneous Optimization) *
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={selectAllSections} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                    Select All
                  </button>
                  <button type="button" onClick={() => handleOpenAddModal('section')} style={{ background: 'none', border: 'none', color: '#059669', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                    + Add New Section
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {sectionsList.map((sec) => {
                  const isChecked = selectedSections.includes(sec);
                  return (
                    <div
                      key={sec}
                      onClick={() => toggleSection(sec)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: `1.5px solid ${isChecked ? '#2563eb' : '#cbd5e1'}`,
                        background: isChecked ? '#eff6ff' : '#ffffff',
                        color: isChecked ? '#1d4ed8' : '#475569',
                        fontWeight: isChecked ? 700 : 500,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isChecked ? <CheckSquare size={14} color="#2563eb" /> : <Square size={14} color="#94a3b8" />}
                      {sec}
                    </div>
                  );
                })}
              </div>
              <small style={{ color: '#64748b', fontSize: '0.74rem', marginTop: '6px', display: 'block' }}>
                Selected sections ({selectedSections.length}) will share teaching faculty and laboratories without schedule overlap.
              </small>
            </div>

            {/* Working Days & Timetable Hours */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="tt-form-group">
                <label>Working Days</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => toggleWorkingDay(d)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: workingDays.includes(d) ? '#2563eb' : '#cbd5e1',
                        background: workingDays.includes(d) ? '#2563eb' : '#ffffff',
                        color: workingDays.includes(d) ? '#ffffff' : '#334155',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {d.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div className="tt-form-group" style={{ flex: 1 }}>
                  <label>Start Time</label>
                  <input type="text" className="tt-form-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div className="tt-form-group" style={{ flex: 1 }}>
                  <label>End Time</label>
                  <input type="text" className="tt-form-input" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SUBJECT MANAGEMENT & SESSION DURATION RULE */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="tt-assistant-box" style={{ flex: 1, margin: 0 }}>
                <BookOpen size={18} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Session Duration Rule (Mandatory 1h or 1.5h per Subject):</strong>
                  <div style={{ fontSize: '0.78rem' }}>
                    Select 1.0 hour (60 min) or 1.5 hours (90 min) duration per subject. The engine uses 30-min discrete units (1h = 2 units, 1.5h = 3 units).
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="tt-btn tt-btn-primary"
                onClick={() => handleOpenAddModal('subject')}
                style={{ marginLeft: '12px', whiteSpace: 'nowrap' }}
              >
                <Plus size={14} /> + Add Subject
              </button>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '10px 12px' }}>Code</th>
                    <th style={{ padding: '10px 12px' }}>Course Title</th>
                    <th style={{ padding: '10px 12px' }}>Type</th>
                    <th style={{ padding: '10px 12px' }}>Weekly Hours</th>
                    <th style={{ padding: '10px 12px' }}>Session Duration</th>
                    <th style={{ padding: '10px 12px' }}>Sessions / Wk</th>
                    <th style={{ padding: '10px 12px' }}>Facility</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectAllocations.map((sub, idx) => {
                    const durHours = sub.durationMinutes / 60;
                    const calculatedSessions = Math.max(1, Math.round(sub.weeklyHours / durHours));

                    return (
                      <tr key={sub.code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1e3a8a' }}>{sub.code}</td>
                        <td style={{ padding: '10px 12px' }}>{sub.name}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', background: sub.isLab ? '#ecfdf5' : '#eff6ff', color: sub.isLab ? '#065f46' : '#1d4ed8', fontWeight: 600 }}>
                            {sub.type}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <input
                            type="number"
                            min="1"
                            max="8"
                            style={{ width: '60px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            value={sub.weeklyHours}
                            onChange={(e) => updateSubjectRow(idx, 'weeklyHours', Number(e.target.value))}
                          />
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <select
                            style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600 }}
                            value={sub.durationMinutes}
                            onChange={(e) => updateSubjectRow(idx, 'durationMinutes', Number(e.target.value))}
                          >
                            <option value="60">1.0 Hour (60m = 2 units)</option>
                            <option value="90">1.5 Hours (90m = 3 units)</option>
                          </select>
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#2563eb' }}>
                          {calculatedSessions} session(s)
                        </td>
                        <td style={{ padding: '10px 12px', color: '#64748b' }}>
                          {sub.classroomType || 'CLASSROOM'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STEP 3: FACULTY ALLOCATION & 60-MIN GAP */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="tt-assistant-box">
              <Users size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Faculty Workload &amp; 60-Minute Gap Rule:</strong>
                <div style={{ fontSize: '0.78rem' }}>
                  Assign teachers to subjects. Multiple teachers can share a subject. The engine enforces a <strong>minimum 60-minute gap</strong> between any two lectures of the same teacher across all sections.
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {subjectAllocations.map((sub, sIdx) => (
                <div key={sub.code} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>{sub.code}</span>
                    <span style={{ fontSize: '0.72rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                      {sub.weeklyHours} hrs/wk ({sub.durationMinutes}m)
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 8px' }}>{sub.name}</div>

                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569' }}>Assigned Faculty Instructor(s):</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {facultyList.map((f) => {
                      const isAssigned = sub.assignedFacultyIds?.includes(f.id);
                      return (
                        <button
                          type="button"
                          key={f.id}
                          onClick={() => toggleFacultyForSubject(sIdx, f.id)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            border: '1px solid',
                            borderColor: isAssigned ? '#2563eb' : '#cbd5e1',
                            background: isAssigned ? '#eff6ff' : '#ffffff',
                            color: isAssigned ? '#1d4ed8' : '#475569',
                            fontSize: '0.72rem',
                            fontWeight: isAssigned ? 700 : 500,
                            cursor: 'pointer',
                          }}
                        >
                          {f.name.split(' ').slice(0, 2).join(' ')} {isAssigned && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Gap and Daily Limit Configuration */}
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.84rem' }}>
                <input
                  type="checkbox"
                  checked={enforceTeacherGap}
                  onChange={(e) => setEnforceTeacherGap(e.target.checked)}
                />
                Enforce Hard 60-Minute Teacher Gap Between Classes
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
                <label>Max Daily Faculty Teaching Load:</label>
                <select
                  className="tt-select"
                  value={maxDailyFacultyHours}
                  onChange={(e) => setMaxDailyFacultyHours(Number(e.target.value))}
                >
                  <option value="3">3 Hours / Day</option>
                  <option value="4">4 Hours / Day (Standard)</option>
                  <option value="5">5 Hours / Day (Uneven)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: BREAKS, STAGGERED LUNCH & HOBBY CLUB */}
        {currentStep === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Staggered Lunch Section */}
            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '12px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#9f1239' }}>
                <Coffee size={18} /> Staggered 30-Minute Lunch Breaks (Mandatory Rule)
              </div>
              <p style={{ margin: '6px 0 10px', fontSize: '0.78rem', color: '#9f1239' }}>
                Lunch is 30 minutes per section, automatically staggered at DIFFERENT times across sections inside the 12:00 PM – 02:00 PM lunch window:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                {selectedSections.map((sec, idx) => {
                  const lunchStartMin = 12 * 60 + (idx % 4) * 30;
                  const formatT = (m) => {
                    const h = Math.floor(m / 60);
                    const min = m % 60;
                    return `${h % 12 === 0 ? 12 : h % 12}:${min === 0 ? '00' : min} PM`;
                  };
                  return (
                    <div key={sec} style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fecdd3', fontSize: '0.78rem' }}>
                      <strong>{sec}:</strong> {formatT(lunchStartMin)} – {formatT(lunchStartMin + 30)}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Thursday Hobby Club & Library */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Hobby Club */}
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#065f46' }}>
                  <Palette size={18} /> Thursday Hobby Club (2 Hours Fixed)
                </div>
                <p style={{ margin: '6px 0 8px', fontSize: '0.76rem', color: '#065f46' }}>
                  Fixed on Thursday from <strong>02:00 PM to 04:00 PM</strong> for ALL sections simultaneously. The engine assigns a distinct mentor and distinct activity room to each section.
                </p>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#065f46' }}>
                  ✓ Status: Enforced &amp; Active
                </div>
              </div>

              {/* Library */}
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#92400e' }}>
                  <BookOpen size={18} /> Compulsory Weekly Library (1 Hour)
                </div>
                <p style={{ margin: '6px 0 8px', fontSize: '0.76rem', color: '#92400e' }}>
                  Exactly 1 session of 1 hour per section per week, dispersed across Mon-Wed-Fri to respect campus library capacity.
                </p>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#92400e' }}>
                  ✓ Status: Enforced &amp; Active
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: GENERATION ENGINE EXECUTION */}
        {currentStep === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center', padding: '1rem 0' }}>
            {!isGenerating && !jobStatus && (
              <>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                  <Cpu size={32} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                    Ready to Generate Timetables
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b', maxWidth: '480px' }}>
                    The solver will optimize {selectedSections.length} section(s) simultaneously using 30-minute discrete units, enforcing 60-min faculty gaps, staggered lunch, and Thursday Hobby Club.
                  </p>
                </div>

                <button
                  type="button"
                  className="tt-btn tt-btn-primary"
                  onClick={handleStartGeneration}
                  style={{ padding: '0.75rem 2rem', fontSize: '0.95rem' }}
                >
                  <Sparkles size={18} /> GENERATE TIMETABLE NOW
                </button>
              </>
            )}

            {isGenerating && (
              <div style={{ width: '100%', maxWidth: '440px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#2563eb', marginBottom: '6px' }}>
                  <span>{jobStatus?.stepName || 'Executing OR-Tools CP-SAT Solver...'}</span>
                  <span>{jobStatus?.progress || 45}%</span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${jobStatus?.progress || 45}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px', fontSize: '0.78rem', color: '#64748b' }}>
                  <RefreshCw size={14} className="animate-spin" /> Verifying cross-section constraints &amp; 60-min teacher gaps...
                </div>
              </div>
            )}

            {infeasibilityReport && (
              <div className="tt-conflict-alert" style={{ width: '100%', textAlign: 'left', marginTop: '10px' }}>
                <AlertTriangle size={24} style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '0.95rem' }}>No Feasible Timetable Found Under Strict Constraints</strong>
                  <ul style={{ margin: '6px 0', paddingLeft: '1.2rem', fontSize: '0.8rem' }}>
                    {infeasibilityReport.likelyCauses?.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                  <div style={{ fontSize: '0.8rem', background: '#ffffff', padding: '6px 10px', borderRadius: '6px', marginTop: '6px' }}>
                    💡 <strong>Actionable Solution:</strong> {infeasibilityReport.suggestedAction}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Navigation Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                className="tt-btn tt-btn-secondary"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={isGenerating}
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {onClose && !isEmbedded && (
              <button type="button" className="tt-btn tt-btn-secondary" onClick={onClose} disabled={isGenerating}>
                Cancel
              </button>
            )}
            {currentStep < 5 && (
              <button
                type="button"
                className="tt-btn tt-btn-primary"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next Step <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* UNIVERSAL "+ ADD NEW" INLINE MODAL */}
        {activeModal && (
          <div className="tt-modal-overlay" style={{ zIndex: 10000 }}>
            <div className="tt-modal-card" style={{ maxWidth: '440px' }}>
              <div className="tt-modal-header">
                <h3>
                  <Plus size={18} color="#2563eb" /> Add New {activeModal.toUpperCase()}
                </h3>
                <button className="tt-modal-close" onClick={() => setActiveModal(null)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveModal}>
                <div className="tt-modal-body">
                  {modalError && (
                    <div className="tt-conflict-alert" style={{ padding: '8px', fontSize: '0.8rem' }}>
                      {modalError}
                    </div>
                  )}

                  {activeModal === 'year' && (
                    <div className="tt-form-group">
                      <label>Academic Year Code *</label>
                      <input
                        type="text"
                        className="tt-form-input"
                        placeholder="e.g. 2027-28"
                        required
                        value={modalFormData.year || ''}
                        onChange={(e) => setModalFormData({ ...modalFormData, year: e.target.value })}
                      />
                    </div>
                  )}

                  {activeModal === 'branch' && (
                    <div className="tt-form-group">
                      <label>Branch / Specialization Name *</label>
                      <input
                        type="text"
                        className="tt-form-input"
                        placeholder="e.g. CSE (Cyber Security)"
                        required
                        value={modalFormData.name || ''}
                        onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                      />
                    </div>
                  )}

                  {activeModal === 'semester' && (
                    <div className="tt-form-group">
                      <label>Semester Number *</label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        className="tt-form-input"
                        placeholder="e.g. 6"
                        required
                        value={modalFormData.number || ''}
                        onChange={(e) => setModalFormData({ ...modalFormData, number: e.target.value })}
                      />
                    </div>
                  )}

                  {activeModal === 'section' && (
                    <div className="tt-form-group">
                      <label>Section Name *</label>
                      <input
                        type="text"
                        className="tt-form-input"
                        placeholder="e.g. Section E"
                        required
                        value={modalFormData.section || ''}
                        onChange={(e) => setModalFormData({ ...modalFormData, section: e.target.value })}
                      />
                    </div>
                  )}

                  {activeModal === 'subject' && (
                    <>
                      <div className="tt-form-group">
                        <label>Subject Code *</label>
                        <input
                          type="text"
                          className="tt-form-input"
                          placeholder="e.g. CS507"
                          required
                          value={modalFormData.code || ''}
                          onChange={(e) => setModalFormData({ ...modalFormData, code: e.target.value })}
                        />
                      </div>
                      <div className="tt-form-group">
                        <label>Course Title *</label>
                        <input
                          type="text"
                          className="tt-form-input"
                          placeholder="e.g. Mobile Computing"
                          required
                          value={modalFormData.name || ''}
                          onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                        />
                      </div>
                      <div className="tt-form-row">
                        <div className="tt-form-group">
                          <label>Weekly Hours</label>
                          <input
                            type="number"
                            min="1"
                            max="8"
                            className="tt-form-input"
                            value={modalFormData.weeklyHours || 4}
                            onChange={(e) => setModalFormData({ ...modalFormData, weeklyHours: e.target.value })}
                          />
                        </div>
                        <div className="tt-form-group">
                          <label>Session Duration</label>
                          <select
                            className="tt-form-select"
                            value={modalFormData.durationMinutes || 60}
                            onChange={(e) => setModalFormData({ ...modalFormData, durationMinutes: e.target.value })}
                          >
                            <option value="60">1.0 Hour (60m)</option>
                            <option value="90">1.5 Hours (90m)</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {activeModal === 'room' && (
                    <>
                      <div className="tt-form-group">
                        <label>Room Number / Laboratory ID *</label>
                        <input
                          type="text"
                          className="tt-form-input"
                          placeholder="e.g. Room 402 or AI Lab-2"
                          required
                          value={modalFormData.roomNumber || ''}
                          onChange={(e) => setModalFormData({ ...modalFormData, roomNumber: e.target.value })}
                        />
                      </div>
                      <div className="tt-form-row">
                        <div className="tt-form-group">
                          <label>Capacity (Seats)</label>
                          <input
                            type="number"
                            className="tt-form-input"
                            value={modalFormData.capacity || 65}
                            onChange={(e) => setModalFormData({ ...modalFormData, capacity: e.target.value })}
                          />
                        </div>
                        <div className="tt-form-group">
                          <label>Facility Type</label>
                          <select
                            className="tt-form-select"
                            value={modalFormData.roomType || 'CLASSROOM'}
                            onChange={(e) => setModalFormData({ ...modalFormData, roomType: e.target.value, isLab: e.target.value.includes('LAB') })}
                          >
                            <option value="CLASSROOM">Theory Classroom</option>
                            <option value="SMART_CLASSROOM">Smart Classroom</option>
                            <option value="COMPUTER_LAB">Computer Lab</option>
                            <option value="HARDWARE_LAB">Hardware Lab</option>
                            <option value="SEMINAR_HALL">Seminar Hall</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="tt-modal-footer">
                  <button type="button" className="tt-btn tt-btn-secondary" onClick={() => setActiveModal(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="tt-btn tt-btn-primary" disabled={isModalSubmitting}>
                    {isModalSubmitting ? 'Saving to Database...' : 'Save & Auto-Select'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isEmbedded) {
    return (
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem' }}>
        {renderContent()}
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="tt-modal-overlay">
      <div className="tt-modal-card" style={{ maxWidth: '880px', width: '92%' }}>
        <div className="tt-modal-header">
          <h3>
            <Sparkles size={20} color="#2563eb" /> APNA CAMPUS Automated Timetable Generator
          </h3>
          <button className="tt-modal-close" onClick={onClose} disabled={isGenerating}>
            <X size={18} />
          </button>
        </div>
        <div className="tt-modal-body">{renderContent()}</div>
      </div>
    </div>
  );
}
