import React, { useState, useEffect } from 'react';
import {
  FileText, Download, Eye, ShieldCheck, Clock, Search, Filter,
  BookOpen, Sparkles, Plus, ExternalLink, CheckCircle2, X
} from 'lucide-react';
import { campusConnectStore } from '../../services/campusConnectStore';

export default function AcademicResourcesSection({ onOpenClassChat }) {
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [previewResource, setPreviewResource] = useState(null);

  const loadData = () => {
    const list = campusConnectStore.getAllSharedResources(searchQuery);
    setResources(list);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('campus_connect_updated', handleUpdate);
    return () => window.removeEventListener('campus_connect_updated', handleUpdate);
  }, [searchQuery]);

  const subjects = ['ALL', 'Data Structures', 'Artificial Intelligence', 'Database Management System', 'Operating Systems', 'Computer Networks'];

  const filteredResources = resources.filter(r => {
    if (subjectFilter !== 'ALL' && r.subject !== subjectFilter) return false;
    return true;
  });

  return (
    <div style={{ background: '#0b0f19', minHeight: '620px', borderRadius: 16, padding: '24px', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <BookOpen size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Central Academic Resources Repository</h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
              Verified lecture notes, laboratory manuals, assignment problem sheets, and question banks shared across Campus Connect.
            </p>
          </div>
        </div>

        {onOpenClassChat && (
          <button
            type="button"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #2563eb)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => onOpenClassChat('conv-ds')}
          >
            <Sparkles size={14} /> Open Class Chat & Discussions
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            style={{ width: '100%', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 14px 9px 38px', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
            placeholder="Search by topic, keyword, subject, or author..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {subjects.map(s => (
            <button
              key={s}
              type="button"
              style={{
                background: subjectFilter === s ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.05)',
                color: subjectFilter === s ? '#38bdf8' : '#94a3b8',
                border: subjectFilter === s ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.08)',
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              onClick={() => setSubjectFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {filteredResources.map((res, idx) => (
          <div
            key={res.id || idx}
            style={{
              background: '#131c2e',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              transition: 'transform 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#fff', lineHeight: 1.35 }}>
                    {res.title}
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: '#60a5fa', fontWeight: 600 }}>{res.subject}</span>
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div><strong style={{ color: '#64748b' }}>Topic:</strong> <span style={{ color: '#e2e8f0' }}>{res.topic || res.subject}</span></div>
              <div><strong style={{ color: '#64748b' }}>Uploader:</strong> <span style={{ color: '#38bdf8' }}>{res.uploadedBy}</span></div>
              <div><strong style={{ color: '#64748b' }}>Date:</strong> <span style={{ color: '#94a3b8' }}>{res.date}</span></div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {res.verified ? (
                <span style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34d399', fontSize: '0.7rem', padding: '3px 8px', borderRadius: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ShieldCheck size={12} /> ✓ Faculty Verified
                </span>
              ) : (
                <span style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.35)', color: '#fbbf24', fontSize: '0.7rem', padding: '3px 8px', borderRadius: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} /> Pending Review
                </span>
              )}

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#cbd5e1', padding: '6px 10px', borderRadius: 6, fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={() => setPreviewResource(res)}
                >
                  <Eye size={13} /> View
                </button>
                <a
                  href={res.downloadUrl || '/sample_documents/sample_document.pdf'}
                  download={res.title}
                  style={{ background: 'linear-gradient(135deg, #06b6d4, #2563eb)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: '0.74rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                >
                  <Download size={13} /> Download
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewResource && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }} onClick={() => setPreviewResource(null)}>
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, width: '100%', maxWidth: 600, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={18} color="#06b6d4" /> {previewResource.title}
              </h3>
              <button type="button" onClick={() => setPreviewResource(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ width: '100%', height: 260, background: '#0b0f19', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                <FileText size={44} color="#06b6d4" style={{ marginBottom: 12 }} />
                <h4 style={{ margin: '0 0 6px 0', color: '#fff' }}>{previewResource.topic || previewResource.subject}</h4>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem' }}>
                  Uploaded by {previewResource.uploadedBy} • {previewResource.date}
                </p>
                {previewResource.verified && (
                  <span style={{ marginTop: 12, background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '3px 10px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>
                    ✓ Verified by Faculty: {previewResource.verifiedBy}
                  </span>
                )}
              </div>
            </div>
            <div style={{ padding: '14px 20px', background: '#1e293b', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setPreviewResource(null)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>
                Close
              </button>
              <a
                href={previewResource.downloadUrl || '/sample_documents/sample_document.pdf'}
                download={previewResource.title}
                style={{ background: 'linear-gradient(135deg, #06b6d4, #2563eb)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 8, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Download size={14} /> Download File
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
