import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ShieldAlert,
  Send,
  X,
  UserCheck,
  Check,
  XCircle,
  FileCheck2,
  FolderOpen
} from 'lucide-react';
import { labStaffStore } from '../../services/labStaffStore.js';

export default function RequestsAdminTab({
  subTab = 'requisitions',
  currentBranch,
  activeLabId,
  profile,
  requisitions = [],
  purchaseRequests = [],
  dispatchRecords = [],
  handovers = [],
  onSuccessToast,
  onOpenQuickAction
}) {
  const [activeSubTab, setActiveSubTab] = useState(subTab);
  const [selectedReqDetail, setSelectedReqDetail] = useState(null);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [newHandover, setNewHandover] = useState({
    incomingStaff: 'Mr. Tushar K. Mishra (Evening Practical & Research Shift)',
    equipmentStatus: 'All workstations inspected; 1 workstation monitor power cable swapped.',
    pendingWorkOrders: 'None pending; all UPS banks operating normally.',
    inventoryDiscrepancies: 'None; tools accounted for.',
    outstandingPrep: 'Prepare 35 stations for tomorrow morning 09:00 AM practical turn.',
    safetyIssues: 'All windows latched, secondary fire door locked, emergency main breaker switch active.'
  });

  const branchReqs = requisitions.filter(r => r.department === currentBranch);
  const branchPRs = purchaseRequests.filter(p => p.department === currentBranch);
  const branchDispatch = dispatchRecords.filter(d => d.department === currentBranch || d.department === 'All Departments');
  const branchHandovers = handovers.filter(h => h.department === currentBranch);

  const handleApproveRequisition = (id) => {
    labStaffStore.updateRequisitionStatus(id, 'Approved', 'Approved by Laboratory In-Charge during review.');
    onSuccessToast?.(`Requisition #${id} marked as Approved!`);
    if (selectedReqDetail) {
      setSelectedReqDetail({ ...selectedReqDetail, status: 'Approved' });
    }
  };

  const handleRejectRequisition = (id) => {
    labStaffStore.updateRequisitionStatus(id, 'Rejected', 'Rejected due to available alternative stock.');
    onSuccessToast?.(`Requisition #${id} marked as Rejected.`);
    if (selectedReqDetail) {
      setSelectedReqDetail({ ...selectedReqDetail, status: 'Rejected' });
    }
  };

  const handleCreateHandover = (e) => {
    e.preventDefault();
    const created = labStaffStore.createHandover({
      labId: activeLabId,
      department: currentBranch,
      incomingStaff: newHandover.incomingStaff,
      equipmentStatus: newHandover.equipmentStatus,
      pendingWorkOrders: newHandover.pendingWorkOrders,
      inventoryDiscrepancies: newHandover.inventoryDiscrepancies,
      outstandingPrep: newHandover.outstandingPrep,
      safetyIssues: newHandover.safetyIssues
    });
    setShowHandoverModal(false);
    onSuccessToast?.(`Shift Handover #${created.id} signed and logged!`);
  };

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
          onClick={() => setActiveSubTab('requisitions')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'requisitions' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'requisitions' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'requisitions' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <FileText size={16} /> Consumable Requisitions ({branchReqs.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('capex')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'capex' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'capex' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'capex' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <DollarSign size={16} /> Equipment Purchase Proposals ({branchPRs.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('dispatch')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'dispatch' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'dispatch' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'dispatch' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <FolderOpen size={16} /> Office Dispatch &amp; Circulars ({branchDispatch.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('handover')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'handover' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'handover' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'handover' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <FileCheck2 size={16} /> Lab Handover Register ({branchHandovers.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. CONSUMABLE REQUISITIONS */}
      {/* ========================================================================= */}
      {activeSubTab === 'requisitions' && (
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
                Consumable Material Requisitions &amp; Indents — {currentBranch}
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Electronic indents routed to Department HOD and Central Store Purchase Officer.
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
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={15} /> Raise Requisition
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
                    <th style={{ padding: '12px 14px' }}>Req Number</th>
                    <th style={{ padding: '12px 14px' }}>Item Requested</th>
                    <th style={{ padding: '12px 14px' }}>Quantity</th>
                    <th style={{ padding: '12px 14px' }}>Priority</th>
                    <th style={{ padding: '12px 14px' }}>Requesting Staff</th>
                    <th style={{ padding: '12px 14px' }}>Required By</th>
                    <th style={{ padding: '12px 14px' }}>Approval Status</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {branchReqs.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                        {r.requisitionNo}
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{r.requestDate}</div>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{r.itemName}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700 }}>{r.quantity} {r.unit}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: r.priority === 'Critical' ? '#fee2e2' : (r.priority === 'High' ? '#ffedd5' : '#f1f5f9'),
                          color: r.priority === 'Critical' ? '#b91c1c' : (r.priority === 'High' ? '#c2410c' : '#475569')
                        }}>
                          {r.priority}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#475569' }}>{r.requestingStaff}</td>
                      <td style={{ padding: '12px 14px', color: '#0f172a', fontWeight: 600 }}>{r.requiredDate}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: r.status === 'Approved' ? '#dcfce7' : (r.status === 'Pending Approval' ? '#fef3c7' : (r.status === 'Fulfilled' ? '#e0f2fe' : '#fee2e2')),
                          color: r.status === 'Approved' ? '#15803d' : (r.status === 'Pending Approval' ? '#b45309' : (r.status === 'Fulfilled' ? '#0369a1' : '#b91c1c'))
                        }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedReqDetail(r)}
                            style={{
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Timeline
                          </button>

                          {/* Role-based approval buttons for demonstration */}
                          {profile.role === 'Lab In-Charge' && r.status === 'Pending Approval' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApproveRequisition(r.id)}
                                title="Approve indent as Lab In-Charge"
                                style={{
                                  background: '#10b981',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectRequisition(r.id)}
                                style={{
                                  background: '#ef4444',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
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
      {/* 2. EQUIPMENT PURCHASE PROPOSALS (CAPEX) */}
      {/* ========================================================================= */}
      {activeSubTab === 'capex' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '22px'
        }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
            Capital Equipment (Capex) Purchase Proposals
          </h3>
          <p style={{ margin: '0 0 18px', fontSize: '0.82rem', color: '#64748b' }}>
            High-value institutional research and laboratory equipment funding proposals.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
            {branchPRs.map(pr => (
              <div
                key={pr.id}
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
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#2563eb' }}>{pr.refNo}</span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: '#e0f2fe',
                    color: '#0369a1'
                  }}>
                    {pr.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                  {pr.itemDescription} (Qty: {pr.quantity})
                </div>

                <div style={{ fontSize: '0.78rem', color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '6px' }}>
                  <div><strong>Technical Specs:</strong> {pr.technicalSpecs}</div>
                  <div style={{ marginTop: '4px' }}><strong>Academic Justification:</strong> {pr.justification}</div>
                  <div style={{ marginTop: '4px', color: '#16a34a', fontWeight: 700 }}>
                    Estimated Budget: ₹{(pr.estimatedCost).toLocaleString()}
                  </div>
                </div>

                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 'auto' }}>
                  Endorsed: <strong>{pr.hodEndorsement}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. OFFICE DISPATCH & CIRCULARS */}
      {/* ========================================================================= */}
      {activeSubTab === 'dispatch' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '22px'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
            Administrative Clerical Inward / Outward Dispatch &amp; Official Records
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                <tr>
                  <th style={{ padding: '12px 14px' }}>Ref Number &amp; Date</th>
                  <th style={{ padding: '12px 14px' }}>Document Classification</th>
                  <th style={{ padding: '12px 14px' }}>Subject Matter</th>
                  <th style={{ padding: '12px 14px' }}>Sender / Authority</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {branchDispatch.map(doc => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>
                      {doc.refNumber}
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{doc.date}</div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#2563eb', fontWeight: 600 }}>{doc.documentType}</td>
                    <td style={{ padding: '12px 14px', maxWidth: '300px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{doc.subject}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{doc.remarks}</div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>{doc.senderRecipient}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#16a34a' }}>
                        ● {doc.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => onSuccessToast?.(`Simulated attachment for ${doc.refNumber} downloaded!`)}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Attachment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. LAB HANDOVER REGISTER */}
      {/* ========================================================================= */}
      {activeSubTab === 'handover' && (
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
                Shift Handover &amp; Custody Exchange Register
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Formal sign-off of laboratory equipment status, open work orders, and session preparations between staff.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowHandoverModal(true)}
              style={{
                background: '#09152b',
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
              <Plus size={15} /> Execute Handover
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {branchHandovers.map(h => (
              <div
                key={h.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>{h.id} — {h.labName}</span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>
                    ✓ {h.signoffStatus}
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                  Handover Time: <strong>{h.handoverDate}</strong> · Outgoing: <strong>{h.outgoingStaff}</strong> → Incoming: <strong>{h.incomingStaff}</strong>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '0.78rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div><strong>Equipment Status:</strong> {h.equipmentStatus}</div>
                  <div><strong>Pending Work Orders:</strong> {h.pendingWorkOrders}</div>
                  <div><strong>Tomorrow's Preparation:</strong> {h.outstandingPrep}</div>
                  <div><strong>Safety &amp; Lock-up:</strong> {h.safetyIssues}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requisition Timeline Modal */}
      {selectedReqDetail && (
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
            maxWidth: '540px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ background: '#0b1830', color: '#ffffff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Approval Timeline: {selectedReqDetail.requisitionNo}</h3>
              <button type="button" onClick={() => setSelectedReqDetail(null)} style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '0.84rem' }}>
                <div><strong>Item:</strong> {selectedReqDetail.itemName}</div>
                <div><strong>Quantity:</strong> {selectedReqDetail.quantity} {selectedReqDetail.unit}</div>
                <div><strong>Justification:</strong> {selectedReqDetail.reason}</div>
              </div>

              <div>
                <h5 style={{ margin: '0 0 10px', fontSize: '0.84rem', fontWeight: 800 }}>Workflow Progression</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedReqDetail.approvalTimeline?.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.8rem' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: step.status === 'Completed' || step.status === 'Approved' ? '#10b981' : '#f59e0b',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.68rem',
                        fontWeight: 800
                      }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{step.step}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>By {step.by} · {step.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedReqDetail(null)}
                  style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Close Timeline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Execute Handover Modal */}
      {showHandoverModal && (
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
            maxWidth: '520px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ background: '#0b1830', color: '#ffffff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Sign-off Shift Handover</h3>
              <button type="button" onClick={() => setShowHandoverModal(false)} style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateHandover} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Incoming Staff Member *</label>
                <input
                  type="text"
                  required
                  value={newHandover.incomingStaff}
                  onChange={(e) => setNewHandover({ ...newHandover, incomingStaff: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Equipment Status Summary</label>
                <input
                  type="text"
                  value={newHandover.equipmentStatus}
                  onChange={(e) => setNewHandover({ ...newHandover, equipmentStatus: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Outstanding Practical Preparations</label>
                <textarea
                  rows={2}
                  value={newHandover.outstandingPrep}
                  onChange={(e) => setNewHandover({ ...newHandover, outstandingPrep: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowHandoverModal(false)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#09152b', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Sign &amp; Complete Handover
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
