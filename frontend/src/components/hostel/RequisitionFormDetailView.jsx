import React from 'react';
import {
  FileText,
  Building,
  MapPin,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Check,
  X,
  Package,
  Wrench,
  ShieldAlert,
  ShieldCheck,
  Send,
  Eye,
  Paperclip,
  Printer,
  UploadCloud,
  Flame
} from 'lucide-react';
import './WardenInventoryRequisition.css';

/**
 * RequisitionFormDetailView
 * Replicates the exact 3-section layout of the application form from Image 1:
 * - Section A: Request Information
 * - Section B: Problem & Condition Details
 * - Section C: Supporting Attachments
 * - Section D: Administrative Workflow & Action Buttons
 * Used in both Hostel Warden ("My Requests") and Hostel Admin ("Indent Status").
 */
export default function RequisitionFormDetailView({
  item,
  isHostelAdmin = false,
  onApprove = null,
  onReject = null,
  onIssue = null,
  onSubmitDraft = null,
  onClose = null,
  isModal = false
}) {
  if (!item) return null;

  const priorityColors = {
    Urgent: { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' },
    High: { bg: '#ffedd5', color: '#ea580c', border: '#fdba74' },
    Medium: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
    Low: { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' }
  };

  const pConfig = priorityColors[item.priority] || priorityColors.Medium;

  return (
    <div className="warden-form-detail-view" style={{
      background: '#ffffff',
      borderRadius: isModal ? '12px' : '8px',
      padding: isModal ? '1.5rem' : '1.25rem 1.5rem',
      border: isModal ? 'none' : '1px solid #e2e8f0',
      boxShadow: isModal ? 'none' : '0 4px 16px rgba(0,0,0,0.04)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Top Banner with Indent Reference & Current Level */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '0.75rem 1.25rem',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{
            background: '#0284c7',
            color: '#ffffff',
            padding: '4px 10px',
            borderRadius: '6px',
            fontWeight: 800,
            fontSize: '0.84rem',
            fontFamily: 'monospace'
          }}>
            {item.referenceNo || `REQ-${item.indentNo}`}
          </div>
          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
            {item.requestTitle || item.productName}
          </span>
          <span style={{
            background: pConfig.bg,
            color: pConfig.color,
            border: `1px solid ${pConfig.border}`,
            padding: '2px 8px',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 700
          }}>
            {item.priority} Priority
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            background: item.isApproved ? '#dcfce7' : '#fef3c7',
            color: item.isApproved ? '#15803d' : '#b45309',
            border: `1px solid ${item.isApproved ? '#86efac' : '#fde68a'}`,
            padding: '3px 10px',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.78rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            {item.isApproved ? <Check size={13} strokeWidth={3} /> : <Clock size={13} />}
            {item.currentLevel || (item.isApproved ? 'Level-2 (Store Issued)' : 'Level-1 (Pending Review)')}
          </span>

          <button
            type="button"
            onClick={() => window.print()}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.76rem',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Print Requisition"
          >
            <Printer size={13} /> Print
          </button>
        </div>
      </div>

      {/* ====================================================================
          SECTION A: REQUEST INFORMATION (Matching Image 1)
          ==================================================================== */}
      <div className="warden-form-section" style={{ marginBottom: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem 1.25rem' }}>
        <div className="warden-section-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: '#0284c7',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.85rem'
          }}>
            A
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#0f172a' }}>Request Information</h4>
            <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Define the hostel issue, item needed, quantities, location, and priority.</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
          {/* Request Type */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              Request Type
            </label>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '7px 10px', fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>
              {item.requestType || 'General Hostel Supplies'}
            </div>
          </div>

          {/* Request Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              Request Title
            </label>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '7px 10px', fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>
              {item.requestTitle || item.productName}
            </div>
          </div>

          {/* Product / Material Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              Product / Material Name
            </label>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '7px 10px', fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>
              {item.materialName || item.productName} {item.code ? `(${item.code})` : ''}
              {item.isCustom && <span style={{ marginLeft: '6px', background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>Custom</span>}
            </div>
          </div>

          {/* Quantity & Unit */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Quantity
              </label>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '7px 10px', fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                {item.quantity}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Unit
              </label>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '7px 10px', fontSize: '0.84rem', color: '#475569' }}>
                {item.unit || 'Pieces'}
              </div>
            </div>
          </div>

          {/* Hostel / Building */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              Hostel / Building
            </label>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '7px 10px', fontSize: '0.84rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building size={14} color="#0284c7" />
              <span>{item.hostelName}</span>
            </div>
          </div>

          {/* Room / Location */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              Room / Location
            </label>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '7px 10px', fontSize: '0.84rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} color="#0284c7" />
              <span>{item.roomLocation || item.purpose || 'General Hostel Block'}</span>
            </div>
          </div>

          {/* Priority Level */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              Priority Level
            </label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['Low', 'Medium', 'High', 'Urgent'].map(p => {
                const isSelected = item.priority === p;
                return (
                  <div
                    key={p}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '6px 4px',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      border: isSelected ? '1px solid #0284c7' : '1px solid #e2e8f0',
                      background: isSelected ? '#0284c7' : '#f8fafc',
                      color: isSelected ? '#ffffff' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '3px'
                    }}
                  >
                    {p === 'Urgent' && <Flame size={12} color={isSelected ? '#ffffff' : '#ef4444'} />}
                    <span>{p}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expected Completion Date & Estimated Cost */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Expected Date
              </label>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '7px 10px', fontSize: '0.84rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={13} color="#64748b" />
                <span>{item.expectedDate}</span>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Estimated Total Cost
              </label>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '7px 10px', fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                {item.approxCost || `RS. ${Number(item.costNum || 0).toFixed(2)}`}
              </div>
            </div>
          </div>
        </div>

        {/* Request Description */}
        <div style={{ marginTop: '0.85rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
            Request Description
          </label>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px', fontSize: '0.84rem', color: '#334155', minHeight: '48px', lineHeight: 1.5 }}>
            {item.description || item.remarks || 'Standard requisition raised by hostel warden for maintenance and residential facilities.'}
          </div>
        </div>

        {/* Additional Remarks */}
        {(item.additionalRemarks || item.remarks) && (
          <div style={{ marginTop: '0.85rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              Additional Remarks
            </label>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px', fontSize: '0.84rem', color: '#334155', lineHeight: 1.5 }}>
              {item.additionalRemarks || item.remarks}
            </div>
          </div>
        )}
      </div>

      {/* ====================================================================
          SECTION B: PROBLEM & CONDITION DETAILS (Matching Image 1)
          ==================================================================== */}
      <div className="warden-form-section" style={{ marginBottom: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem 1.25rem' }}>
        <div className="warden-section-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: '#0284c7',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.85rem'
          }}>
            B
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#0f172a' }}>Problem &amp; Condition Details</h4>
            <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Adaptive diagnostic indicators tailored to your selected request type.</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
          {/* Current Item Condition */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              Current Item Condition
            </label>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '7px 10px', fontSize: '0.84rem', color: '#0f172a' }}>
              {item.itemCondition || (item.isCustom ? 'Damaged / Malfunctioning' : 'Routine Maintenance Requirement')}
            </div>
          </div>

          {/* Is On-Campus Repair Possible */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              Is On-Campus Repair Possible?
            </label>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '7px 10px', fontSize: '0.84rem', color: '#0f172a' }}>
              {item.repairPossible || 'Yes - Can be repaired on campus by technician'}
            </div>
          </div>

          {/* Replacement Required */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              Replacement Required?
            </label>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '7px 10px', fontSize: '0.84rem', color: '#0f172a' }}>
              {item.replacementRequired || (item.isCustom ? 'Yes - Complete item replacement' : 'Routine Refill / Store Issue')}
            </div>
          </div>

          {/* Number of Affected Rooms / Students */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              Affected Rooms / Students
            </label>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '7px 10px', fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
              {item.affectedRooms || 1} room(s) / student(s)
            </div>
          </div>
        </div>

        {/* Safety Hazard Checkbox Display matching Image 1 */}
        <div style={{
          marginTop: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: item.safetyHazard ? '#fef2f2' : '#f8fafc',
          border: `1px solid ${item.safetyHazard ? '#fca5a5' : '#e2e8f0'}`,
          borderRadius: '6px',
          padding: '9px 12px'
        }}>
          <input
            type="checkbox"
            checked={!!item.safetyHazard}
            readOnly
            style={{ width: '16px', height: '16px', accentColor: '#dc2626', cursor: 'default' }}
          />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: item.safetyHazard ? '#b91c1c' : '#475569' }}>
            Item presents an active safety hazard to resident students (e.g. electrical shock, loose fixtures, slipping hazard)
          </span>
          {item.safetyHazard && (
            <span style={{ marginLeft: 'auto', background: '#dc2626', color: '#ffffff', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
              HIGH RISK
            </span>
          )}
        </div>
      </div>

      {/* ====================================================================
          SECTION C: SUPPORTING ATTACHMENTS (Matching Image 1)
          ==================================================================== */}
      <div className="warden-form-section" style={{ marginBottom: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem 1.25rem' }}>
        <div className="warden-section-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: '#0284c7',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.85rem'
          }}>
            C
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#0f172a' }}>Supporting Attachments</h4>
            <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Attach photographs of damaged furniture, leaks, broken fittings, or quotations.</span>
          </div>
        </div>

        {/* Drag-and-drop file container matching Image 1 */}
        <div style={{
          background: '#f8fafc',
          border: '1.5px dashed #cbd5e1',
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <UploadCloud size={34} color="#0284c7" style={{ margin: '0 auto 8px', display: 'block' }} />
          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>
            {Array.isArray(item.attachments) && item.attachments.length > 0
              ? `${item.attachments.length} Supporting Attachment(s) Uploaded`
              : 'Click or drag photos and documents here'}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '4px' }}>
            Supports PNG, JPG, PDF up to 5MB per file
          </div>

          {Array.isArray(item.attachments) && item.attachments.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
              {item.attachments.map((att, i) => (
                <div key={i} style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#334155',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <Paperclip size={13} color="#0284c7" />
                  <span>{att.name || `Attachment-${i + 1}`}</span>
                  {att.size && <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>({att.size})</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ====================================================================
          SECTION D: WORKFLOW & ADMINISTRATIVE ACTIONS
          ==================================================================== */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '1rem 1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.82rem', color: '#475569' }}>
          <div>
            <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.72rem' }}>Raised By:</span>
            <strong>{item.raisedBy || 'Hostel Warden'}</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.72rem' }}>Hostel Admin Sanction:</span>
            <strong style={{ color: item.isApproved ? '#15803d' : item.status === 'Rejected' ? '#dc2626' : '#d97706' }}>
              {item.isApproved ? `✔ Approved by ${item.approvedBy || 'Admin'}` : item.status === 'Rejected' ? '✕ Rejected' : '⏳ Pending Review'}
            </strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.72rem' }}>Central Store Status:</span>
            <strong style={{ color: item.issued ? '#0284c7' : '#64748b' }}>
              {item.issued ? '✔ Store Dispatched' : '○ Awaiting Dispatch'}
            </strong>
          </div>
        </div>

        {/* Action Buttons for Hostel Admin or Warden */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isHostelAdmin && !item.isApproved && item.status !== 'Rejected' && (
            <>
              {onApprove && (
                <button
                  type="button"
                  onClick={() => onApprove(item.id)}
                  style={{
                    background: '#15803d',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '7px 14px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Check size={14} /> Approve Requisition
                </button>
              )}
              {onReject && (
                <button
                  type="button"
                  onClick={() => onReject(item.id)}
                  style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '7px 14px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <X size={14} /> Reject
                </button>
              )}
            </>
          )}

          {isHostelAdmin && item.isApproved && !item.issued && onIssue && (
            <button
              type="button"
              onClick={() => onIssue(item.id)}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '7px 14px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Package size={14} /> Mark Dispatched from Store
            </button>
          )}

          {item.isDraft && onSubmitDraft && (
            <button
              type="button"
              onClick={() => onSubmitDraft(item)}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '7px 14px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Send size={14} /> Submit Draft to Admin
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '7px 14px',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
