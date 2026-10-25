import React, { useState } from 'react';
import {
  Award,
  Search,
  Filter,
  PlusCircle,
  Edit3,
  Copy,
  Trash2,
  Calendar,
  Layers,
  ChevronRight,
  IndianRupee,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  AlertCircle,
  Users,
  Eye,
  SlidersHorizontal,
  Building,
  RefreshCw,
  X
} from 'lucide-react';

export default function ScholarshipSchemesTab({
  schemes,
  applications,
  onUpdateSchemes,
  onNavigateTab,
  onSelectApplication,
  initialCategoryFilter = 'All'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState(initialCategoryFilter);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form State for Scheme Creation / Editing
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: 'Government',
    fundingSource: '',
    sponsorName: '',
    category: 'Merit-Based',
    academicYear: '2026-27',
    eligibleDepts: 'All Departments',
    eligibleSemesters: 'All Semesters',
    incomeCeiling: '',
    minCgpa: '7.5',
    awardAmount: '50000',
    awardType: 'Fixed Annual Grant',
    totalSlots: '50',
    openingDate: '01 Aug 2026',
    closingDate: '30 Nov 2026',
    status: 'Open',
    renewable: true,
    requiredDocs: 'Income Certificate, Previous Marksheet, Bank Passbook, Aadhaar Card',
    description: ''
  });

  // Filter schemes
  const filteredSchemes = schemes.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sponsorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.fundingSource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'All' ? true :
      typeFilter === 'Government' ? s.type === 'Government' :
      typeFilter === 'Institutional' ? s.type === 'Institutional' :
      typeFilter === 'Merit' ? (s.category.includes('Merit') || s.type === 'Merit-Based') :
      typeFilter === 'Need' ? (s.category.includes('Need') || s.type === 'Need-Based') :
      typeFilter === 'Category' ? (s.category.includes('Category') || s.type === 'Category-Based') :
      typeFilter === 'Private' ? (s.type === 'Private/Sponsored' || s.type === 'Private') : true;

    const matchesStatus = statusFilter === 'All' ? true : s.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleOpenCreate = () => {
    setFormData({
      id: `SCH-SCHEME-${String(schemes.length + 1).padStart(2, '0')}`,
      name: '',
      type: 'Government',
      fundingSource: 'State ST/SC Welfare Department',
      sponsorName: 'Govt. of Odisha / Central Portal',
      category: 'Merit-Based',
      academicYear: '2026-27',
      eligibleDepts: 'All Departments',
      eligibleSemesters: 'All Semesters',
      incomeCeiling: '250000',
      minCgpa: '7.0',
      awardAmount: '45000',
      awardType: 'Direct Annual Grant',
      totalSlots: '60',
      openingDate: '01 Aug 2026',
      closingDate: '30 Nov 2026',
      status: 'Open',
      renewable: true,
      requiredDocs: 'Income Certificate, Marksheet, Caste Certificate, Bank Passbook Copy',
      description: 'Autonomous financial aid scheme for students.'
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveCreate = (e) => {
    e.preventDefault();
    const newScheme = {
      ...formData,
      awardAmount: Number(formData.awardAmount) || 0,
      incomeCeiling: formData.incomeCeiling ? Number(formData.incomeCeiling) : null,
      minCgpa: Number(formData.minCgpa) || 6.0,
      totalSlots: Number(formData.totalSlots) || 30,
      filledSlots: 0,
      eligibleDepts: formData.eligibleDepts.split(',').map(d => d.trim()),
      eligibleSemesters: formData.eligibleSemesters.split(',').map(s => s.trim()),
      requiredDocs: formData.requiredDocs.split(',').map(r => r.trim())
    };

    onUpdateSchemes([newScheme, ...schemes]);
    setIsCreateModalOpen(false);
  };

  const handleOpenEdit = (scheme) => {
    setFormData({
      ...scheme,
      eligibleDepts: Array.isArray(scheme.eligibleDepts) ? scheme.eligibleDepts.join(', ') : scheme.eligibleDepts,
      eligibleSemesters: Array.isArray(scheme.eligibleSemesters) ? scheme.eligibleSemesters.join(', ') : scheme.eligibleSemesters,
      requiredDocs: Array.isArray(scheme.requiredDocs) ? scheme.requiredDocs.join(', ') : scheme.requiredDocs,
      incomeCeiling: scheme.incomeCeiling || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const updated = schemes.map(s => {
      if (s.id === formData.id) {
        return {
          ...s,
          ...formData,
          awardAmount: Number(formData.awardAmount) || s.awardAmount,
          incomeCeiling: formData.incomeCeiling ? Number(formData.incomeCeiling) : null,
          minCgpa: Number(formData.minCgpa) || s.minCgpa,
          totalSlots: Number(formData.totalSlots) || s.totalSlots,
          eligibleDepts: typeof formData.eligibleDepts === 'string' ? formData.eligibleDepts.split(',').map(d => d.trim()) : formData.eligibleDepts,
          eligibleSemesters: typeof formData.eligibleSemesters === 'string' ? formData.eligibleSemesters.split(',').map(s => s.trim()) : formData.eligibleSemesters,
          requiredDocs: typeof formData.requiredDocs === 'string' ? formData.requiredDocs.split(',').map(r => r.trim()) : formData.requiredDocs,
        };
      }
      return s;
    });
    onUpdateSchemes(updated);
    if (selectedScheme?.id === formData.id) {
      setSelectedScheme(updated.find(s => s.id === formData.id));
    }
    setIsEditModalOpen(false);
  };

  const handleDuplicateScheme = (scheme) => {
    const clone = {
      ...scheme,
      id: `SCH-SCHEME-${String(schemes.length + 1).padStart(2, '0')}`,
      name: `${scheme.name} (Copy Template)`,
      status: 'Draft',
      filledSlots: 0
    };
    onUpdateSchemes([clone, ...schemes]);
  };

  const handleToggleStatus = (schemeId) => {
    const updated = schemes.map(s => {
      if (s.id === schemeId) {
        const nextStatus = s.status === 'Open' ? 'Closed' : s.status === 'Closed' ? 'Open' : 'Open';
        return { ...s, status: nextStatus };
      }
      return s;
    });
    onUpdateSchemes(updated);
  };

  return (
    <div className="scholarship-module-wrap">
      {/* Top Action & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search scheme name, funding agency, sponsor, or scheme ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="All">All Types & Funding</option>
              <option value="Government">Government Statutory</option>
              <option value="Institutional">Institutional Aid</option>
              <option value="Merit">Merit-Based</option>
              <option value="Need">Need-Based</option>
              <option value="Category">Category-Based</option>
              <option value="Private">Private / Corporate CSR</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Closing Soon">Closing Soon</option>
              <option value="Closed">Closed</option>
              <option value="Draft">Draft</option>
              <option value="Under Review">Under Review</option>
            </select>

            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <PlusCircle size={15} /> Add Scheme
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 flex-wrap">
          <span className="text-[11px] font-bold text-slate-500 mr-2 uppercase tracking-wider">
            Quick Categories:
          </span>
          {[
            { id: 'All', label: 'All Schemes' },
            { id: 'Government', label: 'Government (PRERANA/NSP)' },
            { id: 'Institutional', label: 'Institutional (Endowment/Kalam)' },
            { id: 'Merit', label: 'Merit-Based' },
            { id: 'Need', label: 'Need-Based' },
            { id: 'Private', label: 'Corporate CSR' }
          ].map(pill => (
            <button
              key={pill.id}
              onClick={() => setTypeFilter(pill.id)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
                typeFilter === pill.id
                  ? 'bg-blue-100 text-blue-700 font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
          <span className="text-xs text-slate-400 ml-auto font-medium">
            Showing {filteredSchemes.length} of {schemes.length} schemes
          </span>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSchemes.map(scheme => {
          const associatedApps = applications.filter(a => a.schemeId === scheme.id);
          const percentFilled = Math.min(100, Math.round((scheme.filledSlots / scheme.totalSlots) * 100));

          return (
            <div
              key={scheme.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {scheme.id}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    scheme.status === 'Open' ? 'bg-emerald-100 text-emerald-800' :
                    scheme.status === 'Closing Soon' ? 'bg-amber-100 text-amber-800' :
                    scheme.status === 'Draft' ? 'bg-slate-100 text-slate-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {scheme.status}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                  {scheme.name}
                </h4>

                <div className="text-xs text-slate-500 mb-3">
                  Sponsor: <span className="font-medium text-slate-700">{scheme.sponsorName}</span>
                </div>

                {/* Key Attributes Pills */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Annual Award</span>
                    <span className="font-bold text-slate-800">₹{scheme.awardAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Eligibility CGPA</span>
                    <span className="font-bold text-slate-800">≥ {scheme.minCgpa} CGPA</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Income Ceiling</span>
                    <span className="font-bold text-slate-800">
                      {scheme.incomeCeiling ? `≤ ₹${(scheme.incomeCeiling / 100000).toFixed(1)} Lakhs` : 'No Ceiling (Merit)'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Deadlines</span>
                    <span className="font-bold text-slate-800 truncate block">{scheme.closingDate}</span>
                  </div>
                </div>

                {/* Slot quota meter */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500">Available Quota Slots</span>
                    <span className="font-semibold text-slate-800">
                      {scheme.filledSlots} / {scheme.totalSlots} Filled ({percentFilled}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        percentFilled > 85 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${percentFilled}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                <button
                  onClick={() => setSelectedScheme(scheme)}
                  className="px-2.5 py-1.5 text-xs text-blue-600 hover:bg-blue-50 font-semibold rounded-md flex items-center gap-1 transition"
                >
                  <Eye size={13} /> Details
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicateScheme(scheme)}
                    title="Duplicate as Template"
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(scheme)}
                    title="Edit Scheme Parameters"
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(scheme.id)}
                    className={`px-2 py-1 text-[11px] font-semibold rounded ${
                      scheme.status === 'Open'
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {scheme.status === 'Open' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scheme Detailed Inspection Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-wider block">
                  {selectedScheme.id} · {selectedScheme.type}
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  {selectedScheme.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedScheme(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-900">
                <span className="font-bold block mb-0.5">Scheme Purpose & Scope:</span>
                {selectedScheme.description}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Funding Source</span>
                  <strong className="text-slate-800 text-sm">{selectedScheme.fundingSource}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Sponsor / Trust</span>
                  <strong className="text-slate-800 text-sm">{selectedScheme.sponsorName}</strong>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 font-bold text-slate-700">
                  Eligibility Specifications & Constraints
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Minimum Academic Threshold:</span>
                    <span className="font-bold text-slate-800">≥ {selectedScheme.minCgpa} CGPA (Zero Active Backlogs)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Maximum Annual Family Income:</span>
                    <span className="font-bold text-slate-800">
                      {selectedScheme.incomeCeiling ? `₹${selectedScheme.incomeCeiling.toLocaleString('en-IN')}` : 'No ceiling (Pure Merit)'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Eligible Departments:</span>
                    <span className="font-bold text-slate-800">
                      {Array.isArray(selectedScheme.eligibleDepts) ? selectedScheme.eligibleDepts.join(', ') : selectedScheme.eligibleDepts}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Eligible Study Semesters:</span>
                    <span className="font-bold text-slate-800">
                      {Array.isArray(selectedScheme.eligibleSemesters) ? selectedScheme.eligibleSemesters.join(', ') : selectedScheme.eligibleSemesters}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Application Window:</span>
                    <span className="font-bold text-slate-800">
                      {selectedScheme.openingDate} to {selectedScheme.closingDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Renewable for Subsequent Years:</span>
                    <span className="font-bold text-emerald-700">
                      {selectedScheme.renewable ? 'Yes (Subject to CGPA maintenance)' : 'No (One-time award)'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1.5">Mandatory Required Documents:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(selectedScheme.requiredDocs) ? selectedScheme.requiredDocs : selectedScheme.requiredDocs.split(',')).map((doc, idx) => (
                    <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded font-medium">
                      ✓ {doc.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Linked Applications for this scheme */}
              <div>
                <span className="font-bold text-slate-800 block mb-1.5">
                  Linked Student Applications ({applications.filter(a => a.schemeId === selectedScheme.id).length}):
                </span>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {applications.filter(a => a.schemeId === selectedScheme.id).map(app => (
                    <div
                      key={app.id}
                      onClick={() => {
                        setSelectedScheme(null);
                        onSelectApplication(app);
                      }}
                      className="p-2 rounded bg-slate-50 border border-slate-100 hover:bg-blue-50 cursor-pointer flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-800">{app.studentName} ({app.studentId})</span>
                      <span className="text-[11px] font-semibold text-blue-600">{app.reviewStatus} · ₹{app.recommendedAmount}</span>
                    </div>
                  ))}
                  {applications.filter(a => a.schemeId === selectedScheme.id).length === 0 && (
                    <span className="text-slate-400 italic">No applications received yet for this scheme.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedScheme(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const s = selectedScheme;
                  setSelectedScheme(null);
                  handleOpenEdit(s);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs"
              >
                Edit Scheme Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Scheme Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Award size={16} className="text-blue-600" />
                {isCreateModalOpen ? 'Configure New Scholarship Scheme' : `Edit Scheme: ${formData.id}`}
              </h3>
              <button
                onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={isCreateModalOpen ? handleSaveCreate : handleSaveEdit}
              className="p-5 overflow-y-auto space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Scheme ID</label>
                  <input
                    type="text"
                    value={formData.id}
                    disabled={isEditModalOpen}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-slate-50 font-mono text-xs outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Scholarship Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                  >
                    <option value="Government">Government Statutory</option>
                    <option value="Institutional">Institutional Aid</option>
                    <option value="Private/Sponsored">Private / Corporate CSR</option>
                    <option value="Alumni Fellowship">Alumni Fellowship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Scheme Full Title</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Chief Minister Higher Education Scholarship..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Funding Agency / Department</label>
                  <input
                    type="text"
                    value={formData.fundingSource}
                    onChange={(e) => setFormData({ ...formData, fundingSource: e.target.value })}
                    placeholder="e.g. Higher Education Dept / Tata Trust"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Sponsor Name</label>
                  <input
                    type="text"
                    value={formData.sponsorName}
                    onChange={(e) => setFormData({ ...formData, sponsorName: e.target.value })}
                    placeholder="e.g. Govt of Odisha / Trustee Council"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Annual Award (₹)</label>
                  <input
                    type="number"
                    value={formData.awardAmount}
                    onChange={(e) => setFormData({ ...formData, awardAmount: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Income Ceiling (₹/Yr)</label>
                  <input
                    type="number"
                    placeholder="Leave blank for merit"
                    value={formData.incomeCeiling}
                    onChange={(e) => setFormData({ ...formData, incomeCeiling: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Minimum CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.minCgpa}
                    onChange={(e) => setFormData({ ...formData, minCgpa: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Total Available Slots</label>
                  <input
                    type="number"
                    value={formData.totalSlots}
                    onChange={(e) => setFormData({ ...formData, totalSlots: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Opening Date</label>
                  <input
                    type="text"
                    value={formData.openingDate}
                    onChange={(e) => setFormData({ ...formData, openingDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Closing Date</label>
                  <input
                    type="text"
                    value={formData.closingDate}
                    onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Eligible Departments (comma separated)</label>
                <input
                  type="text"
                  value={formData.eligibleDepts}
                  onChange={(e) => setFormData({ ...formData, eligibleDepts: e.target.value })}
                  placeholder="All Departments or CSE, AIML, ECE..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mandatory Documents Required (comma separated)</label>
                <input
                  type="text"
                  value={formData.requiredDocs}
                  onChange={(e) => setFormData({ ...formData, requiredDocs: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Scheme Overview & Terms</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of terms, eligibility exceptions, or committee notes..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                />
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 -mx-5 -mb-5 mt-4">
                <button
                  type="button"
                  onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow"
                >
                  {isCreateModalOpen ? 'Create Scheme' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
