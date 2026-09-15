/**
 * pages/Interventions.jsx — Learning module library.
 * Shows assigned interventions with status, interactive quiz viewer modal, and complete button.
 */

import { useState, useEffect } from 'react';
import { interventionsApi } from '../api';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, PlayCircle, FileQuestion, BookMarked,
  Clock, X, CheckCircle2, ChevronRight, Loader2,
  AlertCircle, Check, RotateCcw, Award
} from 'lucide-react';

const TYPE_CONFIG = {
  reading: { icon: <BookOpen size={18} />, color: '#6366f1', label: 'Reading', bg: 'rgba(99,102,241,0.12)' },
  video: { icon: <PlayCircle size={18} />, color: '#ef4444', label: 'Video', bg: 'rgba(239,68,68,0.12)' },
  quiz: { icon: <FileQuestion size={18} />, color: '#f59e0b', label: 'Interactive Quiz', bg: 'rgba(245,158,11,0.12)' },
  'case-study': { icon: <BookMarked size={18} />, color: '#06b6d4', label: 'Case Study', bg: 'rgba(6,182,212,0.12)' },
};

const CONSTRUCT_COLORS = {
  Attitude: '#6366f1',
  SubjectiveNorm: '#06b6d4',
  PBC: '#10b981',
};

function renderMarkdown(text) {
  if (!text) return '';
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

function InteractiveQuizViewer({ quizData, record, onComplete, onClose }) {
  const { intervention, status } = record;
  const questions = quizData.questions || [];
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = totalQuestions > 0 && answeredCount === totalQuestions;

  // Calculate live score
  let correctCount = 0;
  questions.forEach((q) => {
    if (selectedAnswers[q.id] === q.correct_index) {
      correctCount++;
    }
  });
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const handleSelectOption = (qId, optionIdx) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx,
    }));
  };

  const handleReset = () => {
    setSelectedAnswers({});
  };

  const handleFinish = () => {
    onComplete(record.progress_id, intervention.id);
    onClose();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Quiz Header & Score Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(99, 102, 241, 0.12))',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Award size={18} /> Interactive Knowledge Quiz
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 3 }}>
            {quizData.instructions || 'Select the best option for each question to test your knowledge.'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Progress</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: isAllAnswered ? 'var(--color-success)' : 'var(--color-text)' }}>
              {answeredCount} / {totalQuestions}
            </div>
          </div>
          {answeredCount > 0 && (
            <div style={{ textAlign: 'right', borderLeft: '1px solid var(--color-border)', paddingLeft: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: scorePercent >= 75 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                {correctCount}/{answeredCount} ({scorePercent}%)
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {questions.map((q, idx) => {
          const selected = selectedAnswers[q.id];
          const hasAnswered = selected !== undefined;
          const isCorrect = selected === q.correct_index;

          return (
            <div
              key={q.id}
              style={{
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--color-primary-light)', fontSize: '0.75rem' }}>
                  Question {idx + 1} of {totalQuestions}
                </span>
                {hasAnswered && (
                  <span className={`badge ${isCorrect ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {isCorrect ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '1rem', lineHeight: 1.5 }}>
                {q.question}
              </h3>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {q.options.map((opt, optIdx) => {
                  const isThisSelected = selected === optIdx;
                  const isThisCorrect = optIdx === q.correct_index;

                  let border = '1px solid var(--color-border)';
                  let bg = 'rgba(255, 255, 255, 0.02)';
                  let icon = null;

                  if (hasAnswered) {
                    if (isThisCorrect) {
                      border = '1px solid rgba(16, 185, 129, 0.6)';
                      bg = 'rgba(16, 185, 129, 0.12)';
                      icon = <Check size={16} color="var(--color-success)" />;
                    } else if (isThisSelected && !isThisCorrect) {
                      border = '1px solid rgba(239, 68, 68, 0.6)';
                      bg = 'rgba(239, 68, 68, 0.12)';
                      icon = <X size={16} color="var(--color-danger)" />;
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        textAlign: 'left',
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border,
                        background: bg,
                        color: 'var(--color-text)',
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                        lineHeight: 1.5,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: isThisSelected ? (isThisCorrect ? 'var(--color-success)' : 'var(--color-danger)') : 'rgba(255,255,255,0.06)',
                          color: '#fff',
                        }}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span style={{ flex: 1 }}>{opt}</span>
                      {icon}
                    </button>
                  );
                })}
              </div>

              {/* Instant Explanation Box */}
              {hasAnswered && (
                <div
                  style={{
                    marginTop: '0.9rem',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    borderLeft: `4px solid ${isCorrect ? 'var(--color-success)' : 'var(--color-warning)'}`,
                    fontSize: '0.84rem',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: isCorrect ? 'var(--color-success)' : 'var(--color-warning)', display: 'block', marginBottom: 2 }}>
                    💡 Explanation:
                  </strong>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Summary Card */}
      {isAllAnswered && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.6rem',
            marginTop: '0.5rem',
          }}
        >
          <div style={{ fontSize: '2rem' }}>🎉</div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-success)' }}>
            Quiz Completed! Final Score: {correctCount} / {totalQuestions} ({scorePercent}%)
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: 500 }}>
            You have successfully completed this interactive module. Click below to record your progress!
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleReset}>
              <RotateCcw size={14} /> Retry Quiz
            </button>
            {status !== 'completed' && (
              <button className="btn btn-primary btn-sm" onClick={handleFinish}>
                <CheckCircle2 size={14} /> Complete Module
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ContentModal({ record, onClose, onStart, onComplete }) {
  const { intervention, status } = record;
  const cfg = TYPE_CONFIG[intervention.content_type] || TYPE_CONFIG.reading;
  const isVideo = intervention.content_type === 'video';
  const isQuiz = intervention.content_type === 'quiz';
  const videoUrl = isVideo ? intervention.content_body?.split('\n')[0]?.trim() : null;

  let quizData = null;
  if (isQuiz) {
    try {
      quizData = JSON.parse(intervention.content_body);
    } catch {}
  }

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
          {isQuiz && quizData && Array.isArray(quizData.questions) ? (
            <InteractiveQuizViewer
              quizData={quizData}
              record={record}
              onComplete={onComplete}
              onClose={onClose}
            />
          ) : (
            <>
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
            </>
          )}
        </div>

        <div className="content-viewer-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          {!isQuiz && status !== 'completed' && (
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

              let previewText = '';
              if (intervention.content_type === 'quiz') {
                try {
                  const qData = JSON.parse(intervention.content_body);
                  previewText = qData.instructions || 'Interactive skills quiz to test your practical knowledge and attitudes.';
                } catch {
                  previewText = 'Interactive skills quiz with questions, multiple-choice options, and real-time feedback.';
                }
              } else {
                previewText = intervention.content_body?.replace(/[#*\[\]]/g, '').slice(0, 140) + '...';
              }

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
                    <p className="intervention-preview">{previewText}</p>
                  </div>

                  <div className="intervention-footer">
                    <button
                      className={`btn btn-primary btn-sm`}
                      style={{ flex: 1 }}
                      onClick={() => setOpenRecord(record)}
                    >
                      {status === 'completed' ? 'Review Quiz / Content' : status === 'in-progress' ? 'Continue' : 'Start'}{' '}
                      <ChevronRight size={13} />
                    </button>
                    {status !== 'completed' && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleComplete(record.progress_id, intervention.id)}
                        disabled={actionLoading}
                        title="Mark Complete"
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
