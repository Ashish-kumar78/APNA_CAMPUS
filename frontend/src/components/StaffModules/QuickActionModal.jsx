import React, { useState } from 'react';
import {
  X,
  ClipboardCheck,
  PlayCircle,
  HardDrive,
  Share2,
  PackagePlus,
  AlertTriangle,
  FilePlus,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { labStaffStore } from '../../services/labStaffStore.js';

export default function QuickActionModal({
  isOpen,
  onClose,
  initialAction = 'record-attendance',
  onNavigateTab,
  onSuccessToast
}) {
  const [selectedAction, setSelectedAction] = useState(initialAction);
  const currentBranch = labStaffStore.getBranch();
  const profile = labStaffStore.getProfile();
  const activeLabId = labStaffStore.getActiveLabId();
  const equipment = labStaffStore.getEquipment(currentBranch);
  const consumables = labStaffStore.getConsumables(currentBranch);

  // Form states
  const [formData, setFormData] = useState({
    // Equipment
    eqName: '',
    eqCategory: 'Workstations & PCs',
    eqModel: '',
    eqSerial: '',
    // Issue
    issueAssetId: '',
    borrowerName: '',
    borrowerRoll: '',
    borrowerType: 'Student',
    expectedDays: '2',
    // Stock
    stockItemId: '',
    movementType: 'Stock In',
    quantity: '5',
    stockReason: 'Routine replenishment',
    // Maintenance
    maintAssetId: '',
    maintCategory: 'Hardware Breakdown',
    maintPriority: 'Medium',
    maintDesc: '',
    // Requisition
    reqItemName: '',
    reqQty: '5',
    reqUnit: 'Units',
    reqPriority: 'High',
    reqReason: '',
    // Safety
    safetyScore: '95',
    safetyNotes: 'Morning pre-session inspections cleared.'
  });

  if (!isOpen) return null;

  const actions = [
    { id: 'record-attendance', label: 'Record Attendance', icon: ClipboardCheck, color: '#2563eb' },
    { id: 'start-session', label: 'Start Practical Session', icon: PlayCircle, color: '#10b981' },
    { id: 'register-equipment', label: 'Register Equipment', icon: HardDrive, color: '#8b5cf6' },
    { id: 'issue-equipment', label: 'Issue Equipment', icon: Share2, color: '#0284c7' },
    { id: 'update-stock', label: 'Update Stock', icon: PackagePlus, color: '#f59e0b' },
    { id: 'raise-maintenance', label: 'Raise Maintenance', icon: AlertTriangle, color: '#ef4444' },
    { id: 'submit-requisition', label: 'Submit Requisition', icon: FilePlus, color: '#0d9488' },
    { id: 'safety-checklist', label: 'Safety Checklist', icon: ShieldCheck, color: '#16a34a' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedAction === 'record-attendance') {
      onClose();
      if (onNavigateTab) onNavigateTab('attendance');
      return;
    }

    if (selectedAction === 'start-session') {
      const timetable = labStaffStore.getTimetable(currentBranch);
      const scheduled = timetable.find(s => s.status === 'Scheduled');
      if (scheduled) {
        labStaffStore.updateSessionStatus(scheduled.id, 'In-Progress');
        onSuccessToast?.(`Session "${scheduled.subject}" is now In-Progress!`);
      } else {
        onSuccessToast?.('Active session updated successfully!');
      }
      onClose();
      if (onNavigateTab) onNavigateTab('sessions');
      return;
    }

    if (selectedAction === 'register-equipment') {
      if (!formData.eqName.trim()) {
        alert('Please enter equipment name');
        return;
      }
      labStaffStore.addEquipment({
        name: formData.eqName,
        category: formData.eqCategory,
        department: currentBranch,
        assignedLab: activeLabId,
        manufacturer: formData.eqModel || 'Generic Enterprise',
        model: formData.eqModel || 'Pro Series',
        serialNo: formData.eqSerial || `SN-${Date.now().toString().slice(-6)}`,
        purchaseDate: new Date().toISOString().split('T')[0],
        warrantyExpiry: '2028-10-24',
        condition: 'Excellent',
        status: 'Available'
      });
      onSuccessToast?.(`Equipment "${formData.eqName}" registered successfully!`);
      onClose();
      if (onNavigateTab) onNavigateTab('equipment');
      return;
    }

    if (selectedAction === 'issue-equipment') {
      const assetId = formData.issueAssetId || (equipment[0] ? equipment[0].id : null);
      if (!assetId || !formData.borrowerName.trim()) {
        alert('Please select an equipment asset and enter borrower name');
        return;
      }
      const asset = equipment.find(e => e.id === assetId) || { name: 'Laboratory Instrument' };
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + Number(formData.expectedDays || 2));

      labStaffStore.issueEquipment({
        assetId: assetId,
        assetName: asset.name,
        borrowerName: formData.borrowerName,
        borrowerRoll: formData.borrowerRoll || 'TEMP-ROLL',
        borrowerType: formData.borrowerType,
        department: currentBranch,
        issueDate: new Date().toISOString().split('T')[0],
        expectedReturnDate: expDate.toISOString().split('T')[0],
        remarks: `Issued via Quick Action by ${profile.name}`
      });
      onSuccessToast?.(`Asset #${assetId} successfully issued to ${formData.borrowerName}!`);
      onClose();
      if (onNavigateTab) onNavigateTab('issue_return');
      return;
    }

    if (selectedAction === 'update-stock') {
      const itemId = formData.stockItemId || (consumables[0] ? consumables[0].id : null);
      if (!itemId) {
        alert('No consumable item available in this branch');
        return;
      }
      try {
        labStaffStore.recordStockMovement({
          itemId,
          movementType: formData.movementType,
          quantity: formData.quantity,
          requestedBy: profile.name,
          reason: formData.stockReason
        });
        onSuccessToast?.(`Stock movement (${formData.movementType}: ${formData.quantity}) logged successfully!`);
        onClose();
        if (onNavigateTab) onNavigateTab('inventory');
      } catch (err) {
        alert(err.message);
      }
      return;
    }

    if (selectedAction === 'raise-maintenance') {
      if (!formData.maintDesc.trim()) {
        alert('Please provide an issue description');
        return;
      }
      const assetId = formData.maintAssetId || (equipment[0] ? equipment[0].id : 'FACILITY-GENERAL');
      const asset = equipment.find(e => e.id === assetId);

      labStaffStore.createMaintenanceOrder({
        labId: activeLabId,
        labName: `Lab ${activeLabId}`,
        department: currentBranch,
        assetId: assetId,
        assetName: asset ? asset.name : 'General Laboratory Infrastructure',
        category: formData.maintCategory,
        priority: formData.maintPriority,
        description: formData.maintDesc,
        targetDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        estimatedCost: 1500
      });
      onSuccessToast?.('Maintenance work order created and dispatched to campus engineering!');
      onClose();
      if (onNavigateTab) onNavigateTab('maintenance');
      return;
    }

    if (selectedAction === 'submit-requisition') {
      if (!formData.reqItemName.trim()) {
        alert('Please specify the consumable item to requisition');
        return;
      }
      labStaffStore.createRequisition({
        department: currentBranch,
        labId: activeLabId,
        itemName: formData.reqItemName,
        quantity: Number(formData.reqQty) || 1,
        unit: formData.reqUnit,
        priority: formData.reqPriority,
        reason: formData.reqReason || 'Lab practical replenishment',
        requiredDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0]
      });
      onSuccessToast?.(`Requisition for ${formData.reqItemName} submitted for HOD approval!`);
      onClose();
      if (onNavigateTab) onNavigateTab('requisitions');
      return;
    }

    if (selectedAction === 'safety-checklist') {
      labStaffStore.saveSafetyInspection({
        labId: activeLabId,
        department: currentBranch,
        score: Number(formData.safetyScore) || 95,
        overallStatus: Number(formData.safetyScore) >= 90 ? 'Compliant' : 'Attention Needed',
        criticalPassCount: 5,
        criticalTotalCount: 5,
        findings: formData.safetyNotes,
        correctiveAction: 'Continue scheduled monitoring.'
      });
      onSuccessToast?.('Laboratory safety inspection logged and signed off!');
      onClose();
      if (onNavigateTab) onNavigateTab('safety');
      return;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#0b1830',
          color: '#ffffff'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>⚡ Laboratory Quick Actions</h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#93c5fd' }}>
              Branch: <strong>{currentBranch}</strong> · Active Lab: <strong>{activeLabId}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              padding: '6px',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Type Selector Grid */}
        <div style={{
          padding: '14px 20px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px'
        }}>
          {actions.map(act => {
            const Icon = act.icon;
            const isSelected = selectedAction === act.id;
            return (
              <button
                key={act.id}
                type="button"
                onClick={() => setSelectedAction(act.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '8px 4px',
                  borderRadius: '8px',
                  border: isSelected ? `2px solid ${act.color}` : '1px solid #e2e8f0',
                  background: isSelected ? '#ffffff' : '#ffffff',
                  color: isSelected ? act.color : '#475569',
                  fontWeight: isSelected ? 700 : 600,
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: isSelected ? `0 2px 8px ${act.color}30` : 'none'
                }}
              >
                <Icon size={16} color={isSelected ? act.color : '#64748b'} />
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {selectedAction === 'record-attendance' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <ClipboardCheck size={48} color="#2563eb" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ margin: '0 0 8px', color: '#0f172a' }}>Take Practical Session Attendance</h4>
              <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '0.88rem' }}>
                Jump directly to the interactive student roster for {activeLabId} to mark Present, Absent, Late, or Excused and export CSV.
              </p>
              <button
                type="submit"
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Open Attendance Roster →
              </button>
            </div>
          )}

          {selectedAction === 'start-session' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <PlayCircle size={48} color="#10b981" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ margin: '0 0 8px', color: '#0f172a' }}>Start Practical Laboratory Session</h4>
              <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '0.88rem' }}>
                Set the scheduled session for {activeLabId} to <strong>In-Progress</strong> and initialize bench preparation status.
              </p>
              <button
                type="submit"
                style={{
                  background: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Confirm &amp; Start Session
              </button>
            </div>
          )}

          {selectedAction === 'register-equipment' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Equipment / Asset Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dell PowerEdge Server / Tektronix DSO"
                  value={formData.eqName}
                  onChange={(e) => setFormData({ ...formData, eqName: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Category</label>
                <select
                  value={formData.eqCategory}
                  onChange={(e) => setFormData({ ...formData, eqCategory: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                >
                  <option value="Workstations & PCs">Workstations &amp; PCs</option>
                  <option value="Networking & Racks">Networking &amp; Racks</option>
                  <option value="Testing & Measurement">Testing &amp; Measurement</option>
                  <option value="Power Equipment">Power Equipment</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Model / Brand</label>
                <input
                  type="text"
                  placeholder="e.g. Model Z4 / Catalyst 3850"
                  value={formData.eqModel}
                  onChange={(e) => setFormData({ ...formData, eqModel: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Serial Number</label>
                <input
                  type="text"
                  placeholder="e.g. SN-884102-HPE"
                  value={formData.eqSerial}
                  onChange={(e) => setFormData({ ...formData, eqSerial: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
            </div>
          )}

          {selectedAction === 'issue-equipment' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Select Asset *</label>
                <select
                  value={formData.issueAssetId}
                  onChange={(e) => setFormData({ ...formData, issueAssetId: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                >
                  {equipment.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.id} — {eq.name} ({eq.status})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Borrower Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Panda"
                  value={formData.borrowerName}
                  onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Borrower Roll / ID</label>
                <input
                  type="text"
                  placeholder="e.g. CSE-24-005"
                  value={formData.borrowerRoll}
                  onChange={(e) => setFormData({ ...formData, borrowerRoll: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Borrower Category</label>
                <select
                  value={formData.borrowerType}
                  onChange={(e) => setFormData({ ...formData, borrowerType: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                >
                  <option value="Student">Student</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Research Scholar">Research Scholar</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Expected Days</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.expectedDays}
                  onChange={(e) => setFormData({ ...formData, expectedDays: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
            </div>
          )}

          {selectedAction === 'update-stock' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Consumable Item *</label>
                <select
                  value={formData.stockItemId}
                  onChange={(e) => setFormData({ ...formData, stockItemId: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                >
                  {consumables.map(con => (
                    <option key={con.id} value={con.id}>
                      {con.name} (Cur: {con.currentStock} {con.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Transaction Type</label>
                <select
                  value={formData.movementType}
                  onChange={(e) => setFormData({ ...formData, movementType: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                >
                  <option value="Stock In">Stock In (Receipt)</option>
                  <option value="Stock Out">Stock Out (Issue to Lab)</option>
                  <option value="Adjustment">Adjustment (Physical Audit)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Reason / Practical Session</label>
                <input
                  type="text"
                  placeholder="e.g. Issued for CS-591 Practical Cabling Exercise"
                  value={formData.stockReason}
                  onChange={(e) => setFormData({ ...formData, stockReason: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
            </div>
          )}

          {selectedAction === 'raise-maintenance' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Affected Equipment / Asset</label>
                <select
                  value={formData.maintAssetId}
                  onChange={(e) => setFormData({ ...formData, maintAssetId: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                >
                  <option value="">General Facility / Power / AC</option>
                  {equipment.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.id} — {e.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Category</label>
                <select
                  value={formData.maintCategory}
                  onChange={(e) => setFormData({ ...formData, maintCategory: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                >
                  <option value="Hardware Breakdown">Hardware Breakdown</option>
                  <option value="Electrical & Power">Electrical &amp; Power</option>
                  <option value="Air Conditioning">Air Conditioning / Cooling</option>
                  <option value="Network Infrastructure">Network Infrastructure</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Priority</label>
                <select
                  value={formData.maintPriority}
                  onChange={(e) => setFormData({ ...formData, maintPriority: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical (Immediate Service)</option>
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Fault Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the failure symptom, error code, or observed smoke/noise..."
                  value={formData.maintDesc}
                  onChange={(e) => setFormData({ ...formData, maintDesc: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
            </div>
          )}

          {selectedAction === 'submit-requisition' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Material / Consumable Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cat6 RJ45 Boots & Connectors"
                  value={formData.reqItemName}
                  onChange={(e) => setFormData({ ...formData, reqItemName: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={formData.reqQty}
                  onChange={(e) => setFormData({ ...formData, reqQty: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Unit</label>
                <select
                  value={formData.reqUnit}
                  onChange={(e) => setFormData({ ...formData, reqUnit: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                >
                  <option value="Boxes">Boxes</option>
                  <option value="Units">Units</option>
                  <option value="Rolls">Rolls</option>
                  <option value="Litres">Litres</option>
                  <option value="Kg">Kg</option>
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Academic Justification</label>
                <input
                  type="text"
                  placeholder="e.g. Needed for semester end practical exams"
                  value={formData.reqReason}
                  onChange={(e) => setFormData({ ...formData, reqReason: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
            </div>
          )}

          {selectedAction === 'safety-checklist' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Calculated Safety Score (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.safetyScore}
                  onChange={(e) => setFormData({ ...formData, safetyScore: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Inspection Remarks</label>
                <textarea
                  rows={3}
                  value={formData.safetyNotes}
                  onChange={(e) => setFormData({ ...formData, safetyNotes: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
            </div>
          )}

          {selectedAction !== 'record-attendance' && selectedAction !== 'start-session' && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 22px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ✓ Submit Action
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
