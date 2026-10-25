import React, { useState } from 'react';
import {
  HardDrive,
  Share2,
  Calendar,
  Package,
  Layers,
  AlertTriangle,
  AlertOctagon,
  Search,
  Filter,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  CheckCircle,
  X,
  Clock,
  Sparkles,
  Download
} from 'lucide-react';
import { labStaffStore } from '../../services/labStaffStore.js';
import { BRANCHES_CONFIG } from './labStaffData.js';

export default function EquipmentInventoryTab({
  subTab = 'register',
  currentBranch,
  activeLabId,
  profile,
  equipment = [],
  issueReturn = [],
  consumables = [],
  stockMovements = [],
  onSuccessToast,
  onOpenQuickAction
}) {
  const [activeSubTab, setActiveSubTab] = useState(subTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedAssetDetail, setSelectedAssetDetail] = useState(null);
  const [showAddEqModal, setShowAddEqModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockActionItem, setStockActionItem] = useState(null);

  // Return asset modal state
  const [returningIssue, setReturningIssue] = useState(null);
  const [returnCondition, setReturnCondition] = useState('Good');
  const [returnRemarks, setReturnRemarks] = useState('');

  // Stock Movement Form state
  const [stockFormData, setStockFormData] = useState({
    movementType: 'Stock In',
    quantity: 5,
    reason: 'Stock replenishment'
  });

  // Filtered Equipment
  const branchEquipment = equipment.filter(e => e.department === currentBranch);
  const filteredEquipment = branchEquipment.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.serialNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'ALL' || e.category === filterCategory;
    const matchesStat = filterStatus === 'ALL' || e.status === filterStatus;
    return matchesSearch && matchesCat && matchesStat;
  });

  // Filtered Consumables
  const branchConsumables = consumables.filter(c => c.department === currentBranch);
  const filteredConsumables = branchConsumables.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Issue / Return list
  const branchIssueReturn = issueReturn.filter(i => i.department === currentBranch);

  const handleReturnConfirm = () => {
    if (!returningIssue) return;
    labStaffStore.returnEquipment(returningIssue.id, returnCondition, returnRemarks);
    onSuccessToast?.(`Asset #${returningIssue.assetId} returned successfully with status "${returnCondition}"!`);
    setReturningIssue(null);
  };

  const handleStockSubmit = (e) => {
    e.preventDefault();
    if (!stockActionItem) return;
    try {
      labStaffStore.recordStockMovement({
        itemId: stockActionItem.id,
        movementType: stockFormData.movementType,
        quantity: Number(stockFormData.quantity),
        requestedBy: profile.name,
        reason: stockFormData.reason
      });
      onSuccessToast?.(`Stock movement (${stockFormData.movementType}: ${stockFormData.quantity} ${stockActionItem.unit}) recorded!`);
      setShowStockModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const branchConfig = BRANCHES_CONFIG[currentBranch] || BRANCHES_CONFIG.CSE;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Subtab Navigation Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '12px',
        overflowX: 'auto'
      }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('register')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'register' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'register' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'register' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <HardDrive size={16} /> Equipment Register ({branchEquipment.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('issue-return')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'issue-return' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'issue-return' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'issue-return' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <Share2 size={16} /> Issue &amp; Return Log ({branchIssueReturn.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('calibration')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'calibration' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'calibration' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'calibration' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <Calendar size={16} /> Calibration Register
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('inventory')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'inventory' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'inventory' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'inventory' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <Package size={16} /> Consumables Inventory ({branchConsumables.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('movements')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'movements' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'movements' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'movements' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <Layers size={16} /> Stock Movements ({stockMovements.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('damaged')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'damaged' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'damaged' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'damaged' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <AlertOctagon size={16} /> Damaged Equipment
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. EQUIPMENT REGISTER */}
      {/* ========================================================================= */}
      {activeSubTab === 'register' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filter Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            background: '#ffffff',
            padding: '14px 18px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Search equipment by name, asset ID, or serial number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '0.86rem', width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Calibration Due">Calibration Due</option>
                <option value="Damaged">Damaged</option>
              </select>

              <button
                type="button"
                onClick={() => onOpenQuickAction?.('register-equipment')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} /> Register Asset
              </button>
            </div>
          </div>

          {/* Equipment Table */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '12px 14px' }}>Asset ID</th>
                    <th style={{ padding: '12px 14px' }}>Equipment Name &amp; Model</th>
                    <th style={{ padding: '12px 14px' }}>Category</th>
                    <th style={{ padding: '12px 14px' }}>Lab Location</th>
                    <th style={{ padding: '12px 14px' }}>Condition</th>
                    <th style={{ padding: '12px 14px' }}>Calibration Due</th>
                    <th style={{ padding: '12px 14px' }}>Availability Status</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEquipment.map((eq, idx) => (
                    <tr key={eq.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0f172a' }}>
                        {eq.id}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{eq.name}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          Model: {eq.model} · S/N: {eq.serialNo}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#475569' }}>{eq.category}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{eq.assignedLab}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: eq.condition === 'Excellent' ? '#dcfce7' : (eq.condition === 'Good' ? '#e0f2fe' : '#fee2e2'),
                          color: eq.condition === 'Excellent' ? '#15803d' : (eq.condition === 'Good' ? '#0369a1' : '#b91c1c')
                        }}>
                          {eq.condition}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: '#475569' }}>
                        {eq.nextCalibration || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: eq.status === 'Available' ? '#dcfce7' : (eq.status === 'In Use' ? '#dbeafe' : (eq.status === 'Under Maintenance' ? '#fff7ed' : '#fee2e2')),
                          color: eq.status === 'Available' ? '#15803d' : (eq.status === 'In Use' ? '#1e40af' : (eq.status === 'Under Maintenance' ? '#c2410c' : '#b91c1c'))
                        }}>
                          ● {eq.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedAssetDetail(eq)}
                          style={{
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#1d4ed8',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EQUIPMENT ISSUE & RETURN */}
      {/* ========================================================================= */}
      {activeSubTab === 'issue-return' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '18px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Equipment Issue, Custody &amp; Return Register
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Track apparatus issued to students, faculty, and research scholars with expected return dates.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenQuickAction?.('issue-equipment')}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Share2 size={15} /> Issue Equipment
            </button>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '12px 14px' }}>Issue ID</th>
                    <th style={{ padding: '12px 14px' }}>Asset ID &amp; Name</th>
                    <th style={{ padding: '12px 14px' }}>Borrower Details</th>
                    <th style={{ padding: '12px 14px' }}>Issue Date</th>
                    <th style={{ padding: '12px 14px' }}>Expected Return</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {branchIssueReturn.map((iss, idx) => (
                    <tr key={iss.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700 }}>{iss.id}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{iss.assetName}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Asset: {iss.assetId}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600 }}>{iss.borrowerName}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{iss.borrowerRoll} ({iss.borrowerType})</div>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#475569' }}>{iss.issueDate}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: iss.status === 'Overdue' ? '#dc2626' : '#0f172a' }}>
                        {iss.expectedReturnDate}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: iss.status === 'Returned' ? '#dcfce7' : (iss.status === 'Overdue' ? '#fee2e2' : '#e0f2fe'),
                          color: iss.status === 'Returned' ? '#15803d' : (iss.status === 'Overdue' ? '#b91c1c' : '#0369a1')
                        }}>
                          {iss.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        {iss.status !== 'Returned' && (
                          <button
                            type="button"
                            onClick={() => setReturningIssue(iss)}
                            style={{
                              background: '#10b981',
                              color: '#ffffff',
                              border: 'none',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Return Asset
                          </button>
                        )}
                        {iss.status === 'Returned' && (
                          <span style={{ fontSize: '0.76rem', color: '#16a34a', fontWeight: 600 }}>
                            ✓ In Stock ({iss.returnCondition})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CALIBRATION REGISTER */}
      {/* ========================================================================= */}
      {activeSubTab === 'calibration' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '22px'
        }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
            Apparatus Calibration &amp; Metrology Register
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: '#64748b' }}>
            NABL / ISO-17025 certified calibration tracking for precision measurement equipment.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {branchEquipment.map(eq => (
              <div
                key={eq.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px',
                  background: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>{eq.id}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563eb' }}>{eq.assignedLab}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.94rem', color: '#1e293b' }}>{eq.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                  <div>Last Calibration: <strong>{eq.lastCalibration || 'N/A'}</strong></div>
                  <div>Next Due: <strong style={{ color: '#dc2626' }}>{eq.nextCalibration || 'N/A'}</strong></div>
                  <div>Certificate Ref: <strong>NABL-CAL-2026/894</strong></div>
                </div>
                <button
                  type="button"
                  onClick={() => onSuccessToast?.(`Calibration certificate for ${eq.id} downloaded!`)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    padding: '6px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '4px'
                  }}
                >
                  Download Traceable Certificate (PDF)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CONSUMABLES INVENTORY */}
      {/* ========================================================================= */}
      {activeSubTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '18px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Consumables &amp; Laboratory Materials Inventory — {currentBranch}
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Stock balances, reorder points, batch numbers, and chemical safety classifications.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenQuickAction?.('submit-requisition')}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              + Raise Material Indent
            </button>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '12px 14px' }}>Item ID &amp; Name</th>
                    <th style={{ padding: '12px 14px' }}>Category</th>
                    <th style={{ padding: '12px 14px' }}>Current Stock</th>
                    <th style={{ padding: '12px 14px' }}>Min Level</th>
                    <th style={{ padding: '12px 14px' }}>Storage Location</th>
                    <th style={{ padding: '12px 14px' }}>Stock Status</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConsumables.map((con, idx) => (
                    <tr key={con.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{con.name}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>ID: {con.id} · Batch: {con.batchNo}</div>
                        {con.hazardClass && con.hazardClass !== 'None' && (
                          <div style={{ fontSize: '0.68rem', color: '#b91c1c', fontWeight: 700, marginTop: '2px' }}>
                            ⚠️ {con.hazardClass}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#475569' }}>{con.category}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: con.currentStock === 0 ? '#dc2626' : (con.currentStock <= con.minStock ? '#ea580c' : '#0f172a') }}>
                          {con.currentStock} {con.unit}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#64748b' }}>{con.minStock} {con.unit}</td>
                      <td style={{ padding: '12px 14px', fontSize: '0.78rem' }}>{con.storageLocation}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: con.status === 'Adequate' ? '#dcfce7' : (con.status === 'Low Stock' ? '#fef3c7' : '#fee2e2'),
                          color: con.status === 'Adequate' ? '#15803d' : (con.status === 'Low Stock' ? '#b45309' : '#b91c1c')
                        }}>
                          {con.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setStockActionItem(con);
                            setShowStockModal(true);
                          }}
                          style={{
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#1d4ed8',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Stock In/Out
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. STOCK MOVEMENTS REGISTER */}
      {/* ========================================================================= */}
      {activeSubTab === 'movements' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '22px'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
            Consumable Stock Inward / Outward Transaction Audit Log
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                <tr>
                  <th style={{ padding: '12px 14px' }}>Transaction ID</th>
                  <th style={{ padding: '12px 14px' }}>Item Name</th>
                  <th style={{ padding: '12px 14px' }}>Type</th>
                  <th style={{ padding: '12px 14px' }}>Quantity</th>
                  <th style={{ padding: '12px 14px' }}>Date &amp; Time</th>
                  <th style={{ padding: '12px 14px' }}>Requested By</th>
                  <th style={{ padding: '12px 14px' }}>Reason</th>
                </tr>
              </thead>
              <tbody>
                {stockMovements.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>{m.id}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{m.itemName}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: m.movementType === 'Stock In' ? '#dcfce7' : '#fee2e2',
                        color: m.movementType === 'Stock In' ? '#15803d' : '#b91c1c'
                      }}>
                        {m.movementType}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>{m.quantity} {m.unit}</td>
                    <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: '#64748b' }}>{m.date}</td>
                    <td style={{ padding: '12px 14px', color: '#1e293b' }}>{m.requestedBy}</td>
                    <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.8rem' }}>{m.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DAMAGED EQUIPMENT REGISTER */}
      {/* ========================================================================= */}
      {activeSubTab === 'damaged' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '22px'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
            Damaged, Condemned &amp; Decommissioned Equipment Ledger
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: '#64748b' }}>
            Audit records for apparatus damaged during practical turns or requiring write-off board approval.
          </p>

          <div style={{ border: '1px solid #fee2e2', background: '#fef2f2', borderRadius: '8px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertOctagon size={24} color="#dc2626" />
              <div>
                <strong style={{ color: '#991b1b' }}>0 Equipment Currently Condemned in {currentBranch}</strong>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#7f1d1d' }}>
                  All broken instruments are immediately triaged via Maintenance Work Orders or repaired under AMC.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenQuickAction?.('raise-maintenance')}
              style={{
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Report Breakdown →
            </button>
          </div>
        </div>
      )}

      {/* Return Asset Modal */}
      {returningIssue && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '480px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ background: '#0b1830', color: '#ffffff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Record Equipment Return</h3>
              <button type="button" onClick={() => setReturningIssue(null)} style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Asset Being Returned:</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{returningIssue.assetName}</div>
                <div style={{ fontSize: '0.78rem', color: '#2563eb' }}>ID: {returningIssue.assetId} · Borrower: {returningIssue.borrowerName}</div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Inspection Condition on Return</label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                >
                  <option value="Excellent">Excellent (No defects)</option>
                  <option value="Good">Good (Working fine)</option>
                  <option value="Fair">Fair (Slight wear)</option>
                  <option value="Damaged">Damaged (Faulty / Tag Out)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Staff Remarks</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Tested probes, all accessories returned in box."
                  value={returnRemarks}
                  onChange={(e) => setReturnRemarks(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setReturningIssue(null)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReturnConfirm}
                  style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  ✓ Accept Return &amp; Restock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock In / Out Modal */}
      {showStockModal && stockActionItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '460px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ background: '#0b1830', color: '#ffffff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Update Stock: {stockActionItem.name}</h3>
              <button type="button" onClick={() => setShowStockModal(false)} style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStockSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', fontSize: '0.8rem' }}>
                Current Balance: <strong>{stockActionItem.currentStock} {stockActionItem.unit}</strong> · Min Level: {stockActionItem.minStock} {stockActionItem.unit}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Transaction Type</label>
                <select
                  value={stockFormData.movementType}
                  onChange={(e) => setStockFormData({ ...stockFormData, movementType: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                >
                  <option value="Stock In">Stock In (Receipt from central store)</option>
                  <option value="Stock Out">Stock Out (Issue to practical turn)</option>
                  <option value="Adjustment">Adjustment (Physical audit tally)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Quantity ({stockActionItem.unit})</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockFormData.quantity}
                  onChange={(e) => setStockFormData({ ...stockFormData, quantity: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Reason / Practical Session</label>
                <input
                  type="text"
                  placeholder="e.g. Issued for Networking Practical turn"
                  value={stockFormData.reason}
                  onChange={(e) => setStockFormData({ ...stockFormData, reason: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Confirm Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
