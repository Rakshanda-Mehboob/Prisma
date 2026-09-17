import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { interventionsApi } from '../api';
import {
  BookOpen, PlayCircle, FileQuestion, BookMarked,
  Clock, X, CheckCircle2, ChevronRight, Loader2,
  AlertCircle, Check, RotateCcw, Award, Printer,
  Copy, Share2, Sparkles, Filter, Shield, ArrowRight
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton, { SkeletonCard } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const TYPE_CONFIG = {
  reading: { icon: <BookOpen size={18} />, color: '#8b5cf6', label: 'Reading Guide', bg: 'rgba(124, 58, 237, 0.15)' },
  video: { icon: <PlayCircle size={18} />, color: '#ef4444', label: 'Video Lecture', bg: 'rgba(239, 68, 68, 0.15)' },
  quiz: { icon: <FileQuestion size={18} />, color: '#f59e0b', label: 'Interactive Quiz', bg: 'rgba(245, 158, 11, 0.15)' },
  'case-study': { icon: <BookMarked size={18} />, color: '#00f5ff', label: 'Case Simulation', bg: 'rgba(0, 245, 255, 0.15)' },
};

const CONSTRUCT_COLORS = {
  Attitude: '#8b5cf6',
  SubjectiveNorm: '#00f5ff',
  PBC: '#10b981',
};

function renderMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/^# (.+)$/gm, '<h1 style="font-size: 1.4rem; margin-bottom: 0.75rem; color: #fff;">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size: 1.15rem; margin: 1.25rem 0 0.5rem; color: #a78bfa;">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size: 1rem; margin: 1rem 0 0.35rem; color: #fff;">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color: #fff;">$1</strong>')
    .replace(/^- (.+)$/gm, '<li style="margin-left: 1.25rem; margin-bottom: 0.35rem; color: var(--color-text-muted);">$1</li>')
    .replace(/(<li[\s\S]+?<\/li>)/g, '<ul style="margin: 0.5rem 0 1rem;">$1</ul>')
    .replace(/\n\n/g, '</p><p style="margin-bottom: 0.85rem;">')
    .replace(/^(?!<[a-z])/gm, '<p style="margin-bottom: 0.85rem; color: var(--color-text-muted); line-height: 1.7;">$&</p>');
}

function InteractiveQuizViewer({ quizData, record, onComplete, onClose }) {
  const { intervention, status } = record;
  const questions = quizData.questions || [];
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = totalQuestions > 0 && answeredCount === totalQuestions;

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Quiz Banner & Live Score */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(124, 58, 237, 0.15))',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={20} /> Interactive Scenario Quiz
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
            {quizData.instructions || 'Select the most ethically responsible anti-cyberbullying action.'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontFamily: 'var(--font-mono)' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)', textTransform: 'uppercase' }}>Questions</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: isAllAnswered ? 'var(--color-success)' : '#fff' }}>
              {answeredCount} / {totalQuestions}
            </div>
          </div>
          {answeredCount > 0 && (
            <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)', textTransform: 'uppercase' }}>Score</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: scorePercent >= 75 ? 'var(--color-success-light)' : 'var(--color-warning)' }}>
                {correctCount}/{answeredCount} ({scorePercent}%)
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Question Cards */}
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
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                  Question {idx + 1} of {totalQuestions}
                </span>
                {hasAnswered && (
                  <span className={`badge ${isCorrect ? 'badge-success' : 'badge-danger'}`}>
                    {isCorrect ? <Check size={12} /> : <AlertCircle size={12} />}
                    {isCorrect ? 'Correct Decision' : 'Incorrect Choice'}
                  </span>
                )}
              </div>

              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '1.15rem', lineHeight: 1.5 }}>
                {q.question}
              </h4>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
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
                        alignItems: 'center',
                        gap: '0.85rem',
                        textAlign: 'left',
                        padding: '0.9rem 1.15rem',
                        borderRadius: 'var(--radius-md)',
                        border,
                        background: bg,
                        color: 'var(--color-text)',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'var(--transition)',
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
                          background: isThisSelected
                            ? isThisCorrect ? 'var(--color-success)' : 'var(--color-danger)'
                            : 'rgba(255,255,255,0.06)',
                          color: '#fff',
                          fontFamily: 'var(--font-mono)',
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

              {/* Rationale / Explanation Box */}
              {hasAnswered && (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.95rem 1.15rem',
                    borderRadius: 'var(--radius-md)',
                    background: isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    borderLeft: `4px solid ${isCorrect ? 'var(--color-success)' : 'var(--color-warning)'}`,
                    fontSize: '0.86rem',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: isCorrect ? 'var(--color-success-light)' : 'var(--color-warning-light)', display: 'block', marginBottom: 4 }}>
                    💡 Behavioral Analysis:
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
            padding: '1.75rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div style={{ fontSize: '2.5rem' }}>🎉</div>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-success-light)' }}>
            Module Finished! Final Score: {correctCount} / {totalQuestions} ({scorePercent}%)
          </h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', maxWidth: 500 }}>
            You have successfully verified your ethical de-escalation skills. Click below to register module completion in your telemetry pipeline.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="secondary" size="sm" onClick={handleReset} icon={<RotateCcw size={14} />}>
              Retry Quiz
            </Button>
            {status !== 'completed' && (
              <Button variant="cyan" size="sm" onClick={handleFinish} iconRight={<CheckCircle2 size={14} />}>
                Record Completion
              </Button>
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

  useEffect(() => {
    if (status === 'assigned') {
      onStart(record.progress_id, intervention.id);
    }
  }, []);

  const copyIntervention = () => {
    const text = `${intervention.title}\nConstruct: ${intervention.target_construct}\n\n${intervention.content_body}`;
    navigator.clipboard.writeText(text);
    alert('Intervention summary copied to clipboard!');
  };

  return (
    <div className="content-viewer-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="content-viewer">
        <div className="content-viewer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
            <div className="intervention-type-icon" style={{ background: cfg.bg, color: cfg.color, flexShrink: 0 }}>
              {cfg.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{intervention.title}</h2>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 2 }}>
                <Badge variant="primary">{cfg.label}</Badge>
                {intervention.estimated_minutes && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={11} /> {intervention.estimated_minutes} min read
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={copyIntervention}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              title="Copy module content"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              <X size={20} />
            </button>
          </div>
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
                <div style={{ marginBottom: '1.5rem', borderRadius: 12, overflow: 'hidden', background: '#000', border: '1px solid var(--color-border)' }}>
                  <iframe
                    src={videoUrl.replace('watch?v=', 'embed/')}
                    width="100%"
                    height="320"
                    frameBorder="0"
                    allowFullScreen
                    title={intervention.title}
                    style={{ display: 'block' }}
                  />
                </div>
              )}
              <div
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(
                    isVideo
                      ? intervention.content_body?.split('\n').slice(1).join('\n').trim()
                      : intervention.content_body
                  ),
                }}
              />
            </>
          )}
        </div>

        <div className="content-viewer-footer">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
          {!isQuiz && status !== 'completed' && (
            <Button
              variant="cyan"
              size="sm"
              onClick={() => {
                onComplete(record.progress_id, intervention.id);
                onClose();
              }}
              iconRight={<CheckCircle2 size={14} />}
            >
              Mark as Completed
            </Button>
          )}
          {status === 'completed' && (
            <Badge variant="success">
              <CheckCircle2 size={12} /> Module Completed
            </Badge>
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
  const [constructFilter, setConstructFilter] = useState('ALL'); // 'ALL' | 'Attitude' | 'SubjectiveNorm' | 'PBC'
  const [typeFilter, setTypeFilter] = useState('ALL');

  const load = async () => {
    try {
      const res = await interventionsApi.getMyInterventions();
      setRecords(res.data);
    } catch {
      setError('Failed to load personalized learning modules.');
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

  const printReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="70px" width="50%" />
        <Skeleton height="12px" width="100%" borderRadius="var(--radius-full)" />
        <div className="intervention-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const total = records.length;
  const done = records.filter((r) => r.status === 'completed').length;
  const pct = total > 0 ? (done / total) * 100 : 0;
  const allDone = total > 0 && done === total;

  // Filtered records
  const filteredRecords = records.filter((r) => {
    if (constructFilter !== 'ALL' && r.intervention.target_construct !== constructFilter) return false;
    if (typeFilter !== 'ALL' && r.intervention.content_type !== typeFilter) return false;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <Badge variant="cyan" icon={<Sparkles size={12} />}>
              Personalized Learning Path
            </Badge>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', fontFamily: 'var(--font-mono)' }}>
              MODULES: {total}
            </span>
          </div>
          <h1 className="dashboard-greeting">Targeted Cognitive Interventions</h1>
          <p className="dashboard-subtitle">
            Curated behavioral modules assigned based on your baseline diagnostic to mitigate hostility and boost intervention readiness.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" size="sm" onClick={printReport} icon={<Printer size={14} />}>
            Print Action Plan
          </Button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Progress & Unlock Banner */}
      {total > 0 && (
        <Card glow={allDone ? 'cyan' : 'primary'}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              Module Completion Progress: {done} of {total} Finished
            </span>
            <span style={{ fontWeight: 800, color: allDone ? 'var(--color-success)' : 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>
              {pct.toFixed(0)}%
            </span>
          </div>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>

          {allDone ? (
            <div
              style={{
                marginTop: '1.25rem',
                padding: '1rem 1.25rem',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <strong style={{ color: 'var(--color-success-light)' }}>
                  🎉 All Assigned Modules Completed!
                </strong>
                <div style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                  Your post-assessment audit is now unlocked. Take the post-audit to measure your behavioral delta!
                </div>
              </div>
              <Button
                variant="cyan"
                size="sm"
                onClick={() => navigate('/assessment?stage=post')}
                iconRight={<ArrowRight size={14} />}
              >
                Launch Post-Assessment
              </Button>
            </div>
          ) : (
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-subtle)', marginTop: '0.75rem' }}>
              Post-assessment unlocks automatically once all {total} modules are marked completed.
            </div>
          )}
        </Card>
      )}

      {/* Filter Tabs */}
      {total > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Construct Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['ALL', 'Attitude', 'SubjectiveNorm', 'PBC'].map((c) => {
              const isActive = constructFilter === c;
              const label =
                c === 'ALL' ? 'All Constructs' :
                c === 'SubjectiveNorm' ? 'Subjective Norms' :
                c === 'PBC' ? 'Perceived Control' : c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setConstructFilter(c)}
                  style={{
                    padding: '0.45rem 0.95rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                    background: isActive ? 'rgba(124, 58, 237, 0.2)' : 'var(--color-surface)',
                    color: isActive ? '#fff' : 'var(--color-text-muted)',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Type Select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={14} color="var(--color-text-subtle)" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="form-input"
              style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.84rem', height: 34 }}
            >
              <option value="ALL">All Media Types</option>
              <option value="quiz">Interactive Quizzes</option>
              <option value="video">Video Lectures</option>
              <option value="reading">Reading Guides</option>
              <option value="case-study">Case Studies</option>
            </select>
          </div>
        </div>
      )}

      {/* Empty State */}
      {total === 0 && (
        <EmptyState
          icon={<BookOpen size={36} color="var(--color-accent)" />}
          title="No Learning Modules Assigned"
          description="Learning modules are automatically curated based on the vulnerable constructs identified during your baseline assessment. Complete the pre-assessment to generate your modules."
          actionLabel="Take Pre-Assessment"
          onAction={() => navigate('/assessment?stage=pre')}
        />
      )}

      {/* Grid of Intervention Cards */}
      {total > 0 && (
        <div className="intervention-grid">
          {filteredRecords.map((record) => {
            const { intervention, status } = record;
            const cfg = TYPE_CONFIG[intervention.content_type] || TYPE_CONFIG.reading;

            let previewText = '';
            if (intervention.content_type === 'quiz') {
              try {
                const qData = JSON.parse(intervention.content_body);
                previewText = qData.instructions || 'Interactive skills quiz to test your practical knowledge and ethical de-escalation attitude.';
              } catch {
                previewText = 'Interactive skills quiz with multiple-choice dilemmas and real-time behavioral rationale.';
              }
            } else {
              previewText = intervention.content_body?.replace(/[#*\[\]]/g, '').slice(0, 140) + '...';
            }

            return (
              <div key={record.progress_id} className="intervention-card card-hover">
                <div className="intervention-card-top">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="badge" style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                      {status === 'completed' && (
                        <span className="badge badge-success">
                          <CheckCircle2 size={11} /> Done
                        </span>
                      )}
                      {status === 'in-progress' && (
                        <span className="badge badge-warning">In Progress</span>
                      )}
                      {status === 'assigned' && (
                        <span className="badge badge-muted">Not Started</span>
                      )}
                    </div>
                    <h3 className="intervention-title">{intervention.title}</h3>
                  </div>
                  <div className="intervention-type-icon" style={{ background: cfg.bg, color: cfg.color }}>
                    {cfg.icon}
                  </div>
                </div>

                <div className="intervention-body">
                  <div className="intervention-meta">
                    <span style={{ color: CONSTRUCT_COLORS[intervention.target_construct] || 'var(--color-primary-light)', fontWeight: 600 }}>
                      {intervention.target_construct}
                    </span>
                    {intervention.estimated_minutes && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        • <Clock size={12} /> {intervention.estimated_minutes} min
                      </span>
                    )}
                  </div>
                  <p className="intervention-preview">{previewText}</p>
                </div>

                <div className="intervention-footer">
                  <Button
                    variant="primary"
                    size="sm"
                    style={{ flex: 1 }}
                    onClick={() => setOpenRecord(record)}
                    iconRight={<ChevronRight size={14} />}
                  >
                    {status === 'completed' ? 'Review Content' : status === 'in-progress' ? 'Continue Module' : 'Start Module'}
                  </Button>
                  {status !== 'completed' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleComplete(record.progress_id, intervention.id)}
                      disabled={actionLoading}
                      title="Quick mark complete"
                    >
                      <CheckCircle2 size={15} />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Plan & Reflection Section */}
      {total > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <Card>
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>
              <Shield size={18} color="var(--color-primary-light)" />
              Personalized Cyberbully Mitigation Action Plan
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <CheckCircle2 size={16} color="var(--color-success-light)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span><strong>Active Bystander Intervention:</strong> Never like or share derogatory rumors or leaked messages in group chats.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <CheckCircle2 size={16} color="var(--color-success-light)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span><strong>Document Evidence:</strong> Capture non-tampered screenshots with timestamps before content deletion.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <CheckCircle2 size={16} color="var(--color-success-light)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span><strong>Campus Reporting:</strong> Escalate threats of intimidation to university student affair channels and forum admins.</span>
              </li>
            </ul>
          </Card>

          <Card>
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>
              <Sparkles size={18} color="var(--color-accent)" />
              Recommended Campus Safety Activities
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
              <div style={{ padding: '0.75rem 1rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontWeight: 600, color: '#fff' }}>1. Review Class Discord / WhatsApp Rules</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', marginTop: 2 }}>
                  Establish clear anti-harassment community guidelines in cohort chat groups.
                </div>
              </div>
              <div style={{ padding: '0.75rem 1rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontWeight: 600, color: '#fff' }}>2. Complete Feedback Form</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', marginTop: 2 }}>
                  Submit ratings on completed modules to help improve future cohort materials.
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Content Modal */}
      {openRecord && (
        <ContentModal
          record={openRecord}
          onClose={() => { setOpenRecord(null); load(); }}
          onStart={handleStart}
          onComplete={handleComplete}
        />
      )}
    </motion.div>
  );
}
