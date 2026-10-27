import React, { useState, useMemo } from 'react';
import {
  Building,
  Plus,
  FileSpreadsheet,
  FileText,
  Printer,
  CheckCircle2,
  Trash2,
  Edit,
  ArrowUpDown,
  Search,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import {
  getAllHostels,
  saveHostel,
  deleteHostel
} from '../../services/hostelAttendanceStore.js';
import './HostelModules.css';

export default function ManageHostelsSection({ account }) {
  const [hostels, setHostels] = useState(() => getAllHostels());
  const [form, setForm] = useState({
    name: '',
    code: '',
    totalBeds: ''
  });
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim() || !form.totalBeds) {
      showToast('Please fill in Hostel Name, Code, and Total Beds.');
      return;
    }

    const updatedList = saveHostel({
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      totalBeds: Number(form.totalBeds),
      bedRooms: {
        11: '(not set)',
        10: '(not set)',
        9: '(not set)',
        8: '(not set)',
        7: '(not set)',
        6: '(not set)',
        5: '(not set)',
        4: `${Math.floor(Number(form.totalBeds) / 4)} Rooms`,
        3: '(not set)',
        2: '(not set)',
        1: '(not set)'
      }
    });

    setHostels(updatedList);
    setForm({ name: '', code: '', totalBeds: '' });
    showToast(`✓ Hostel "${form.name.trim()}" registered successfully!`);
  };

  const handleClear = () => {
    setForm({ name: '', code: '', totalBeds: '' });
  };

  const handleDelete = (hostelId, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} from hostel infrastructure?`)) {
      const updated = deleteHostel(hostelId);
      setHostels(updated);
      showToast(`Hostel ${name} removed.`);
    }
  };

  const toggleSort = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const sortedAndFilteredHostels = useMemo(() => {
    let list = [...hostels];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(h =>
        h.name.toLowerCase().includes(q) ||
        h.code.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [hostels, searchQuery, sortOrder]);

  const handleExportCsv = () => {
    const headers = [
      '#',
      'Hostel Name',
      'Hostel Code',
      'Total Beds',
      '11-Bed Rooms',
      '10-Bed Rooms',
      '9-Bed Rooms',
      '8-Bed Rooms',
      '7-Bed Rooms',
      '6-Bed Rooms',
      '5-Bed Rooms',
      '4-Bed Rooms',
      '3-Bed Rooms',
      '2-Bed Rooms',
      '1-Bed Rooms'
    ];
    const rows = sortedAndFilteredHostels.map((h, i) => [
      i + 1,
      h.name,
      h.code,
      h.totalBeds,
      h.bedRooms?.[11] || '(not set)',
      h.bedRooms?.[10] || '(not set)',
      h.bedRooms?.[9] || '(not set)',
      h.bedRooms?.[8] || '(not set)',
      h.bedRooms?.[7] || '(not set)',
      h.bedRooms?.[6] || '(not set)',
      h.bedRooms?.[5] || '(not set)',
      h.bedRooms?.[4] || '(not set)',
      h.bedRooms?.[3] || '(not set)',
      h.bedRooms?.[2] || '(not set)',
      h.bedRooms?.[1] || '(not set)'
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows]
        .map(e => e.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(','))
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Manage_Hostels_List_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ Manage Hostels table exported to Excel/CSV.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="hostel-unified-module manage-hostels-replica">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="hostel-toast-banner success">
          <CheckCircle2 size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Breadcrumb & User Tag (Matches Image 2) */}
      <div className="manage-hostel-top-header">
        <div className="breadcrumb-path">
          <span>Home</span> / <span>Hostel</span> / <span className="active-path">Manage Hostel(s)</span>
        </div>
        <div className="admin-user-profile-badge">
          <span>Mr. Tanmaya Kumar Routray ▾</span>
        </div>
      </div>

      {/* BOX 1: + Add Hostel Form (Exact Replica of Image 2) */}
      <div className="add-hostel-card">
        <div className="add-hostel-title">
          <span className="plus-symbol">+</span> Add Hostel
        </div>

        <form onSubmit={handleCreate} className="add-hostel-form">
          <div className="form-fields-row">
            <div className="input-group">
              <label className="required-label">Hostel Name *</label>
              <input
                type="text"
                placeholder="Hostel Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label className="required-label">Hostel Code *</label>
              <input
                type="text"
                placeholder="Hostel Code"
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label className="required-label">Total Beds *</label>
              <input
                type="number"
                placeholder="Total Beds"
                value={form.totalBeds}
                onChange={e => setForm({ ...form, totalBeds: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-buttons-row">
            <button type="submit" className="create-btn">
              Create
            </button>
            <button type="button" className="clear-btn" onClick={handleClear}>
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* BOX 2: Manage Hostel(s) Table (Exact Replica of Image 2) */}
      <div className="manage-hostels-table-card">
        <div className="table-card-header">
          <div className="header-title-with-icon">
            <span className="table-icon-bars">☰</span>
            <h3>Manage Hostel(s)</h3>
          </div>

          <div className="header-actions-group">
            <button
              type="button"
              className="export-action-btn pdf-btn"
              onClick={handlePrint}
              title="Export PDF Document"
            >
              PDF
            </button>
            <button
              type="button"
              className="export-action-btn excel-btn"
              onClick={handleExportCsv}
              title="Export Excel Spreadsheet"
            >
              EXCEL
            </button>
          </div>
        </div>

        {/* Search bar helper */}
        <div style={{ padding: '0 1.25rem 0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748b' }}>
            <span>Showing <strong>{sortedAndFilteredHostels.length}</strong> hostel complexes</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="text"
              placeholder="Search hostel..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                padding: '4px 8px',
                fontSize: '0.8rem',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Exact Table Grid with Bed-Count Breakdown */}
        <div className="matrix-table-scroll">
          <table className="manage-hostels-grid-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th className="sortable-th" onClick={toggleSort} title="Click to sort">
                  Hostel Name <span className="sort-indicator">↓≡</span>
                </th>
                <th>Hostel Code</th>
                <th>Total Beds</th>
                <th>11-Bed Rooms</th>
                <th>10-Bed Rooms</th>
                <th>9-Bed Rooms</th>
                <th>8-Bed Rooms</th>
                <th>7-Bed Rooms</th>
                <th>6-Bed Rooms</th>
                <th>5-Bed Rooms</th>
                <th>4-Bed Rooms</th>
                <th>3-Bed Rooms</th>
                <th>2-Bed Rooms</th>
                <th>1-Bed Rooms</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredHostels.map((h, index) => (
                <tr key={h.id || h.code}>
                  <td className="center-cell">{index + 1}</td>
                  <td className="hostel-name-cell">{h.name}</td>
                  <td className="code-cell">{h.code}</td>
                  <td className="beds-cell">{h.totalBeds}</td>
                  <td className="bed-spec-cell">{h.bedRooms?.[11] || '(not set)'}</td>
                  <td className="bed-spec-cell">{h.bedRooms?.[10] || '(not set)'}</td>
                  <td className="bed-spec-cell">{h.bedRooms?.[9] || '(not set)'}</td>
                  <td className="bed-spec-cell">{h.bedRooms?.[8] || '(not set)'}</td>
                  <td className="bed-spec-cell">{h.bedRooms?.[7] || '(not set)'}</td>
                  <td className="bed-spec-cell">{h.bedRooms?.[6] || '(not set)'}</td>
                  <td className="bed-spec-cell">{h.bedRooms?.[5] || '(not set)'}</td>
                  <td className="bed-spec-cell highlight">{h.bedRooms?.[4] || '(not set)'}</td>
                  <td className="bed-spec-cell highlight">{h.bedRooms?.[3] || '(not set)'}</td>
                  <td className="bed-spec-cell">{h.bedRooms?.[2] || '(not set)'}</td>
                  <td className="bed-spec-cell">{h.bedRooms?.[1] || '(not set)'}</td>
                  <td className="center-cell">
                    <button
                      type="button"
                      className="delete-icon-btn"
                      onClick={() => handleDelete(h.id, h.name)}
                      title="Delete hostel"
                    >
                      <Trash2 size={13} color="#ef4444" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
