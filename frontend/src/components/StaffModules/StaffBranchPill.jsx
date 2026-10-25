import React from 'react';
import { BRANCHES_CONFIG } from './labStaffData.js';
import { Building2, Shield, User, RefreshCw, Cpu, Monitor, Cog, TestTube, Zap, Dna, Compass, FlaskConical, CheckCircle, AlertTriangle } from 'lucide-react';

export default function StaffBranchPill({
  currentBranch,
  onSelectBranch,
  activeLabId,
  onSelectLab,
  laboratories = [],
  profile,
  onToggleRole,
  onOpenQuickAction
}) {
  const branchInfo = BRANCHES_CONFIG[currentBranch] || BRANCHES_CONFIG.CSE;
  const branchLabs = laboratories.filter(l => l.department === currentBranch);

  const getBranchIcon = (iconName) => {
    switch (iconName) {
      case 'Monitor': return <Monitor size={15} />;
      case 'Cpu': return <Cpu size={15} />;
      case 'Cog': return <Cog size={15} />;
      case 'Building2': return <Building2 size={15} />;
      case 'TestTube': return <TestTube size={15} />;
      case 'Zap': return <Zap size={15} />;
      case 'Dna': return <Dna size={15} />;
      case 'Compass': return <Compass size={15} />;
      case 'FlaskConical': return <FlaskConical size={15} />;
      default: return <Building2 size={15} />;
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #09152b 0%, #0d1e3d 100%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '12px 18px',
      marginBottom: '20px',
      color: '#ffffff',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '14px',
      boxShadow: '0 4px 18px rgba(9, 21, 43, 0.25)'
    }}>
      {/* Left: Department & Lab selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: '#2563eb',
            color: '#ffffff',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {getBranchIcon(branchInfo.icon)}
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: '#93c5fd', fontWeight: 700, letterSpacing: '0.05em' }}>
              ACTIVE BRANCH / DISCIPLINE
            </div>
            <select
              value={currentBranch}
              onChange={(e) => onSelectBranch(e.target.value)}
              style={{
                background: '#1e293b',
                color: '#ffffff',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
                marginTop: '2px'
              }}
              title="Select Engineering / Science Laboratory Branch"
            >
              {Object.keys(BRANCHES_CONFIG).map(bKey => (
                <option key={bKey} value={bKey}>
                  {BRANCHES_CONFIG[bKey].name} ({bKey})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lab selector within branch */}
        <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.12)', paddingLeft: '14px' }}>
          <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>
            LABORATORY LOCATION
          </div>
          <select
            value={activeLabId}
            onChange={(e) => onSelectLab(e.target.value)}
            style={{
              background: '#0f172a',
              color: '#38bdf8',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              marginTop: '2px',
              maxWidth: '280px'
            }}
          >
            {branchLabs.map(lab => (
              <option key={lab.id} value={lab.id}>
                {lab.id}: {lab.name}
              </option>
            ))}
          </select>
        </div>

        {/* Building tag */}
        <div style={{
          display: 'none',
          fontSize: '0.75rem',
          color: '#cbd5e1',
          background: 'rgba(255, 255, 255, 0.06)',
          padding: '6px 12px',
          borderRadius: '6px',
          alignItems: 'center',
          gap: '6px'
        }} className="sm:inline-flex">
          <Building2 size={13} color="#94a3b8" />
          <span>{branchInfo.building}</span>
        </div>
      </div>

      {/* Right: Role toggle & Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Role Toggle Pill */}
        <button
          type="button"
          onClick={onToggleRole}
          title="Click to toggle demonstration role between Lab In-Charge & Lab Technician"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: profile?.role === 'Lab In-Charge' ? 'rgba(37, 99, 235, 0.25)' : 'rgba(245, 158, 11, 0.2)',
            border: `1px solid ${profile?.role === 'Lab In-Charge' ? '#3b82f6' : '#f59e0b'}`,
            color: profile?.role === 'Lab In-Charge' ? '#bfdbfe' : '#fef3c7',
            padding: '5px 12px',
            borderRadius: '999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.18s ease'
          }}
        >
          <Shield size={13} />
          <span>ROLE: {profile?.role || 'Lab In-Charge'}</span>
          <RefreshCw size={11} style={{ opacity: 0.75 }} />
        </button>

        {/* Quick Action Button */}
        <button
          type="button"
          onClick={() => onOpenQuickAction && onOpenQuickAction()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#2563eb',
            color: '#ffffff',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)',
            transition: 'all 0.15s ease'
          }}
        >
          <span>⚡ Quick Actions</span>
        </button>
      </div>
    </div>
  );
}
