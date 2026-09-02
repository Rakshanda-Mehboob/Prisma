/**
 * pages/Interventions.jsx — Learning module library.
 * Shows assigned interventions with status, content viewer modal, and complete button.
 */

import { useState, useEffect } from 'react';
import { interventionsApi } from '../api';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, PlayCircle, FileQuestion, BookMarked,
  Clock, X, CheckCircle2, ChevronRight, Loader2
} from 'lucide-react';

const TYPE_CONFIG = {
  reading: { icon: <BookOpen size={18} />, color: '#6366f1', label: 'Reading', bg: 'rgba(99,102,241,0.12)' },
  video: { icon: <PlayCircle size={18} />, color: '#ef4444', label: 'Video', bg: 'rgba(239,68,68,0.12)' },
  quiz: { icon: <FileQuestion size={18} />, color: '#f59e0b', label: 'Quiz', bg: 'rgba(245,158,11,0.12)' },
  'case-study': { icon: <BookMarked size={18} />, color: '#06b6d4', label: 'Case Study', bg: 'rgba(6,182,212,0.12)' },
};

const CONSTRUCT_COLORS = {
  Attitude: '#6366f1',
  SubjectiveNorm: '#06b6d4',
  PBC: '#10b981',
};

function renderMarkdown(text) {
  if (!text) return '';
  // Very lightweight markdown renderer for the content viewer
  return text
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[a-z])/gm, '<p>$&</p>');
}

function ContentModal({ record, onClose, onStart, onComplete }) {
  const { intervention, status } = record;
  const cfg = TYPE_CONFIG[intervention.content_type] || TYPE_CONFIG.reading;
  const isVideo = intervention.content_type === 'video';
  const videoUrl = isVideo ? intervention.content_body?.split('\n')[0]?.trim() : null;

  // Auto-start on open
  useEffect(() => {
    if (status === 'assigned') { onStart(record.progress_id, intervention.id); }
  }, []);

  return (
    <div className="content-viewer-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="content-viewer">
        <div className="content-viewer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
            <div className="intervention-type-icon" style={{ background: cfg.bg, color: cfg.color, flexShrink: 0 }}>
              {cfg.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.15rem' }}>{intervention.title}</h2>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                {intervention.estimated_minutes && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={11} /> {intervention.estimated_minutes} min
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', flexShrink: 0 }}>
            <X size={20} />
          </button>
        </div>

        <div className="content-viewer-body">
          {isVideo && videoUrl && (
            <div style={{ marginBottom: '1.25rem', borderRadius: 8, overflow: 'hidden', background: '#000' }}>
              <iframe
                src={videoUrl.replace('watch?v=', 'embed/')}
                width="100%"
                height="280"
                frameBorder="0"
                allowFullScreen
                title={intervention.title}
                style={{ display: 'block' }}
              />
            </div>
          )}
          <div
            dangerouslySetInnerHTML={{ __html: renderMarkdown(isVideo
              ? intervention.content_body?.split('\n').slice(1).join('\n').trim()
              : intervention.content_body
            )}}
            style={{ lineHeight: 1.7 }}
          />
        </div>

        <div className="content-viewer-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          {status !== 'completed' && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => { onComplete(record.progress_id, intervention.id); onClose(); }}
            >
              <CheckCircle2 size={14} /> Mark Complete
            </button>
          )}
          {status === 'completed' && (
            <span className="badge badge-success"><CheckCircle2 size={12} /> Completed</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Interventions() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openRecord, setOpenRecord] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    try {
      const res = await interventionsApi.getMyInterventions();
      setRecords(res.data);
    } catch {
      setError('Failed to load learning modules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStart = async (progressId, interventionId) => {
    try { await interventionsApi.startIntervention(interventionId); } catch {}
    setRecords((rs) => rs.map((r) => r.progress_id === progressId ? { ...r, status: 'in-progress' } : r));
  };

  const handleComplete = async (progressId, interventionId) => {
    setActionLoading(true);
    try {
      await interventionsApi.completeIntervention(interventionId);
      setRecords((rs) => rs.map((r) => r.progress_id === progressId ? { ...r, status: 'completed' } : r));
    } catch {}
    setActionLoading(false);
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const total = records.length;
  const done = records.filter((r) => r.status === 'completed').length;
  const pct = total > 0 ? (done / total) * 100 : 0;
  const allDone = total > 0 && done === total;

  // Group by construct
  const groups = records.reduce((acc, r) => {
    const c = r.intervention.target_construct;
    if (!acc[c]) acc[c] = [];
    acc[c].push(r);
    return acc;
  }, {});

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-greeting">Learning Modules</h1>
        <p className="dashboard-subtitle">
          Complete all assigned modules to unlock the post-assessment
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Progress */}
      {total > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 600 }}>{done} of {total} modules complete</span>
            <span style={{ fontWeight: 700, color: allDone ? 'var(--color-success)' : 'var(--color-accent)' }}>
              {pct.toFixed(0)}%
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          {allDone && (
            <div className="alert alert-success" style={{ marginTop: '1rem', marginBottom: 0 }}>
              🎉 All modules complete! You can now take the post-assessment.
              <button className="btn btn-primary btn-sm" style={{ marginLeft: '1rem' }}
                onClick={() => navigate('/assessment?stage=post')}>
                Take Post-Assessment
              </button>
            </div>
          )}
        </div>
      )}

      {total === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <div className="empty-title">No modules assigned yet</div>
          <div className="empty-desc">
            Complete the pre-assessment first. Modules will be assigned based on your results.
          </div>
          <button className="btn btn-primary" style={{ marginTop: '1.25rem' }}
            onClick={() => navigate('/assessment')}>
            Take Pre-Assessment
          </button>
        </div>
      )}

      {/* Grouped by Construct */}
      {Object.entries(groups).map(([construct, recs]) => (
        <div key={construct} style={{ marginBottom: '2rem' }}>
          <div className="section-title" style={{ color: CONSTRUCT_COLORS[construct] }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: CONSTRUCT_COLORS[construct], display: 'inline-block'
            }} />
            {construct === 'SubjectiveNorm' ? 'Subjective Norm' : construct} Track
          </div>

          <div className="intervention-grid">
            {recs.map((record) => {
              const { intervention, status } = record;
              const cfg = TYPE_CONFIG[intervention.content_type] || TYPE_CONFIG.reading;

              return (
                <div key={record.progress_id} className="intervention-card">
                  <div className="intervention-card-top">
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <span className="badge" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                        {status === 'completed' && <span className="badge badge-success"><CheckCircle2 size={10} /> Done</span>}
                        {status === 'in-progress' && <span className="badge badge-warning">In Progress</span>}
                        {status === 'assigned' && <span className="badge badge-muted">Not Started</span>}
                      </div>
                      <h3 className="intervention-title">{intervention.title}</h3>
                    </div>
                    <div className="intervention-type-icon" style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.icon}
                    </div>
                  </div>

                  <div className="intervention-body">
                    <div className="intervention-meta">
                      {intervention.estimated_minutes && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Clock size={12} /> {intervention.estimated_minutes} min
                        </span>
                      )}
                    </div>
                    <p className="intervention-preview">
                      {intervention.content_body?.replace(/[#*\[\]]/g, '').slice(0, 140)}...
                    </p>
                  </div>

                  <div className="intervention-footer">
                    <button
                      className={`btn btn-primary btn-sm`}
                      style={{ flex: 1 }}
                      onClick={() => setOpenRecord(record)}
                    >
                      {status === 'completed' ? 'Review' : status === 'in-progress' ? 'Continue' : 'Start'}{' '}
                      <ChevronRight size={13} />
                    </button>
                    {status !== 'completed' && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleComplete(record.progress_id, intervention.id)}
                        disabled={actionLoading}
                      >
                        <CheckCircle2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Content Modal */}
      {openRecord && (
        <ContentModal
          record={openRecord}
          onClose={() => { setOpenRecord(null); load(); }}
          onStart={handleStart}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
