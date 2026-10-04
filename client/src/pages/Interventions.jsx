import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { interventionsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen, PlayCircle, FileQuestion, BookMarked,
  Clock, X, CheckCircle2, ChevronRight, Check,
  AlertCircle, RotateCcw, Award, Copy, Filter,
  ArrowRight, Zap, Lock, Target,
  TrendingUp, Trophy, BookMarked as BookIcon
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton, { SkeletonCard } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

/* ── Config ─────────────────────────────────────────────────────────────── */
const TYPE_CONFIG = {
  reading:      { emoji: '📖', label: 'Reading Guide',    color: '#0f766e', bg: 'linear-gradient(135deg,#0f766e,#14b8a6)' },
  video:        { emoji: '🎬', label: 'Video Lecture',    color: '#be123c', bg: 'linear-gradient(135deg,#be123c,#f43f5e)' },
  quiz:         { emoji: '🧩', label: 'Interactive Quiz', color: '#d97706', bg: 'linear-gradient(135deg,#d97706,#f59e0b)' },
  'case-study': { emoji: '📋', label: 'Case Study',       color: '#7c2d12', bg: 'linear-gradient(135deg,#7c2d12,#b45309)' },
};
const CONSTRUCT_CONFIG = {
  Attitude:            { label: 'Attitude',    icon: '💭', color: '#0f766e', bg: 'rgba(15,118,110,0.08)'  },
  SubjectiveNorm:      { label: 'Peer Norms',  icon: '👥', color: '#d97706', bg: 'rgba(217,119,6,0.08)'   },
  PBC:                 { label: 'Efficacy',    icon: '💪', color: '#7c2d12', bg: 'rgba(124,45,18,0.08)'   },
  BehavioralIntention: { label: 'Commitment',  icon: '🎯', color: '#15803d', bg: 'rgba(21,128,61,0.08)'   },
};
const DIFFICULTY = { reading: 'Beginner', video: 'Beginner', quiz: 'Intermediate', 'case-study': 'Advanced' };
const DIFF_COLOR  = { Beginner: '#10b981', Intermediate: '#d97706', Advanced: '#7c3aed' };

const MARKDOWN_COMPONENTS = {
  h1: ({ children }) => <h1 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', color: '#0b1c30' }}>{children}</h1>,
  h2: ({ children }) => <h2 style={{ fontSize: '1.15rem', margin: '1.25rem 0 0.5rem', color: '#0f766e' }}>{children}</h2>,
  h3: ({ children }) => <h3 style={{ fontSize: '1rem', margin: '1rem 0 0.35rem', color: '#0b1c30' }}>{children}</h3>,
  p:  ({ children }) => <p  style={{ marginBottom: '0.85rem', color: '#64748b', lineHeight: 1.7 }}>{children}</p>,
  strong: ({ children }) => <strong style={{ color: '#0b1c30', fontWeight: 600 }}>{children}</strong>,
  ul: ({ children }) => <ul style={{ margin: '0.5rem 0 1rem', paddingLeft: '1.25rem', listStyleType: 'disc' }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ margin: '0.5rem 0 1rem', paddingLeft: '1.25rem', listStyleType: 'decimal' }}>{children}</ol>,
  li: ({ children }) => <li style={{ marginBottom: '0.35rem', color: '#64748b', lineHeight: 1.6 }}>{children}</li>,
  a:  ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#0f766e', textDecoration: 'underline' }}>{children}</a>,
};

/* ── Progress Ring SVG ───────────────────────────────────────────────────── */
function ProgressRing({ pct, size = 100 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - pct / 100);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={10} />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke="#10b981" strokeWidth={10} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: dash }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
      <text x={size/2} y={size/2 + 5} textAnchor="middle"
        style={{ fontSize: '1.1rem', fontWeight: 800, fill: '#fff', transform: 'rotate(90deg)', transformOrigin: `${size/2}px ${size/2}px` }}>
        {pct}%
      </text>
    </svg>
  );
}

/* ── Quiz Viewer ─────────────────────────────────────────────────────────── */
function InteractiveQuizViewer({ quizData, record, onComplete, onClose }) {
  const { intervention, status } = record;
  const questions = quizData.questions || [];
  const [answers, setAnswers] = useState({});
  const total = questions.length;
  const answered = Object.keys(answers).length;
  const allDone = total > 0 && answered === total;
  let correct = 0;
  questions.forEach(q => { if (answers[q.id] === q.correct_index) correct++; });
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(79,70,229,0.06))',
        border: '1px solid rgba(124,58,237,0.18)',
        borderRadius: 16, padding: '1.25rem 1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={20} /> Interactive Scenario Quiz
          </div>
          <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: 4 }}>
            {quizData.instructions || 'Select the most ethically responsible response for each scenario.'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', fontFamily: 'var(--font-mono)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Answered</div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: allDone ? '#10b981' : '#0b1c30' }}>{answered}/{total}</div>
          </div>
          {answered > 0 && (
            <div style={{ textAlign: 'center', borderLeft: '1px solid #e2e8f0', paddingLeft: '1.5rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Score</div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: score >= 75 ? '#10b981' : '#f59e0b' }}>{score}%</div>
            </div>
          )}
        </div>
      </div>

      {questions.map((q, idx) => {
        const sel = answers[q.id];
        const has = sel !== undefined;
        const ok  = sel === q.correct_index;
        return (
          <div key={q.id} style={{
            background: '#fff', borderRadius: 16, padding: '1.5rem',
            border: `1px solid ${has ? (ok ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)') : '#e2e8f0'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: has ? (ok ? '#ecfdf5' : '#fef2f2') : 'rgba(15,118,110,0.08)',
                border: `2px solid ${has ? (ok ? '#10b981' : '#ef4444') : '#14b8a6'}`,
                color: has ? (ok ? '#10b981' : '#ef4444') : '#0f766e',
                fontSize: '0.78rem', fontWeight: 700,
              }}>
                {has ? (ok ? <Check size={13} /> : <AlertCircle size={13} />) : idx + 1}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Question {idx + 1} of {total}</span>
              {has && <span style={{ fontSize: '0.76rem', fontWeight: 700, padding: '2px 10px', borderRadius: 999, background: ok ? '#ecfdf5' : '#fef2f2', color: ok ? '#047857' : '#dc2626' }}>{ok ? 'Correct ✓' : 'Incorrect'}</span>}
            </div>
            <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0b1c30', marginBottom: '1rem', lineHeight: 1.5 }}>{q.question}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {q.options.map((opt, i) => {
                const isSelected = sel === i;
                const isCorrect  = i === q.correct_index;
                let bg = '#f8fafc', border = '#e2e8f0';
                if (has) {
                  if (isCorrect) { bg = 'rgba(16,185,129,0.07)'; border = 'rgba(16,185,129,0.4)'; }
                  else if (isSelected) { bg = 'rgba(239,68,68,0.07)'; border = 'rgba(239,68,68,0.4)'; }
                }
                return (
                  <button key={i} type="button"
                    onClick={() => setAnswers(prev => ({ ...prev, [q.id]: i }))}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.85rem',
                      textAlign: 'left', padding: '0.85rem 1rem',
                      borderRadius: 10, border: `1px solid ${border}`, background: bg,
                      color: '#0b1c30', cursor: 'pointer', fontSize: '0.88rem',
                      transition: 'all 0.15s', width: '100%',
                    }}
                  >
                    <span style={{
                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700,
                      background: isSelected ? (isCorrect ? '#10b981' : '#ef4444') : has && isCorrect ? '#10b981' : '#e2e8f0',
                      color: isSelected || (has && isCorrect) ? '#fff' : '#64748b',
                    }}>
                      {has && isCorrect ? <Check size={13} /> : String.fromCharCode(65 + i)}
                    </span>
                    <span style={{ flex: 1 }}>{opt}</span>
                  </button>
                );
              })}
            </div>
            {has && (
              <div style={{
                marginTop: '1rem', padding: '0.9rem 1.1rem', borderRadius: 10,
                background: ok ? 'rgba(16,185,129,0.07)' : 'rgba(245,158,11,0.07)',
                borderLeft: `3px solid ${ok ? '#10b981' : '#f59e0b'}`,
                fontSize: '0.84rem', color: '#64748b', lineHeight: 1.6,
              }}>
                <strong style={{ color: ok ? '#047857' : '#b45309', display: 'block', marginBottom: 4 }}>💡 Explanation:</strong>
                {q.explanation}
              </div>
            )}
          </div>
        );
      })}

      {allDone && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.07), rgba(20,184,166,0.06))',
          border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, padding: '2rem',
          textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
        }}>
          <div style={{ fontSize: '2.5rem' }}>🎉</div>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#047857' }}>
            Quiz Complete! Score: {correct}/{total} ({score}%)
          </h4>
          <p style={{ fontSize: '0.86rem', color: '#64748b', maxWidth: 440 }}>
            Great work! Click below to mark this module as completed.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="secondary" size="sm" onClick={() => setAnswers({})} icon={<RotateCcw size={14} />}>Retry Quiz</Button>
            {status !== 'completed' && (
              <Button variant="primary" size="sm"
                onClick={() => { onComplete(record.progress_id, intervention.id); onClose(); }}
                iconRight={<CheckCircle2 size={14} />}>
                Mark Complete
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Content Modal ───────────────────────────────────────────────────────── */
function ContentModal({ record, onClose, onStart, onComplete }) {
  const { intervention, status } = record;
  const cfg = TYPE_CONFIG[intervention.content_type] || TYPE_CONFIG.reading;
  const isVideo = intervention.content_type === 'video';
  const isQuiz  = intervention.content_type === 'quiz';
  const videoUrl = isVideo ? intervention.content_body?.split('\n')[0]?.trim() : null;
  let quizData = null;
  if (isQuiz) { try { quizData = JSON.parse(intervention.content_body); } catch {} }

  useEffect(() => {
    if (status === 'assigned') onStart(record.progress_id, intervention.id);
  }, []);

  return (
    <div className="content-viewer-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="content-viewer">
        <div className="content-viewer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
              {cfg.emoji}
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1c30' }}>{intervention.title}</h2>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 3 }}>
                <Badge variant="primary">{cfg.label}</Badge>
                {intervention.estimated_minutes && (
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {intervention.estimated_minutes} min
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => navigator.clipboard.writeText(intervention.content_body || '')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }} title="Copy">
              <Copy size={16} />
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}>
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="content-viewer-body">
          {isQuiz && quizData?.questions ? (
            <InteractiveQuizViewer quizData={quizData} record={record} onComplete={onComplete} onClose={onClose} />
          ) : (
            <>
              {isVideo && videoUrl && (
                <div style={{ marginBottom: '1.5rem', borderRadius: 12, overflow: 'hidden', background: '#000', border: '1px solid #e2e8f0' }}>
                  <iframe src={videoUrl.replace('watch?v=', 'embed/')} width="100%" height="320" frameBorder="0" allowFullScreen title={intervention.title} style={{ display: 'block' }} />
                </div>
              )}
              <ReactMarkdown components={MARKDOWN_COMPONENTS}>
                {isVideo ? intervention.content_body?.split('\n').slice(1).join('\n').trim() || '' : intervention.content_body || ''}
              </ReactMarkdown>
            </>
          )}
        </div>
        <div className="content-viewer-footer">
          <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
          {!isQuiz && status !== 'completed' && (
            <Button variant="primary" size="sm"
              onClick={() => { onComplete(record.progress_id, intervention.id); onClose(); }}
              iconRight={<CheckCircle2 size={14} />}>
              Mark as Completed
            </Button>
          )}
          {status === 'completed' && <Badge variant="success"><CheckCircle2 size={12} /> Completed</Badge>}
        </div>
      </div>
    </div>
  );
}

/* ── Course Card (Coursera Style) ────────────────────────────────────────── */
function CourseCard({ record, onOpen, onComplete, actionLoading }) {
  const { intervention, status } = record;
  const cfg  = TYPE_CONFIG[intervention.content_type] || TYPE_CONFIG.reading;
  const cc   = CONSTRUCT_CONFIG[intervention.target_construct] || CONSTRUCT_CONFIG.Attitude;
  const diff = DIFFICULTY[intervention.content_type] || 'Beginner';
  const diffColor = DIFF_COLOR[diff] || '#10b981';

  const isCompleted  = status === 'completed';
  const isInProgress = status === 'in-progress';
  const progressPct  = isCompleted ? 100 : isInProgress ? 60 : 0;

  let previewText = '';
  if (intervention.content_type === 'quiz') {
    try { const q = JSON.parse(intervention.content_body); previewText = q.instructions || 'Test your ethical judgment in realistic scenarios.'; }
    catch { previewText = 'Interactive scenario quiz with ethical decision-making challenges.'; }
  } else {
    previewText = (intervention.content_body?.replace(/[#*[\]]/g, '').slice(0, 100) || '') + '…';
  }

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(15,23,42,0.1)' }}
      transition={{ duration: 0.2 }}
      style={{
        background: '#fff', borderRadius: 20, overflow: 'hidden',
        border: isCompleted ? '1px solid rgba(16,185,129,0.25)' : '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
        display: 'flex', flexDirection: 'column', position: 'relative',
      }}
    >
      {/* Thumbnail */}
      <div style={{
        height: 100, background: cfg.bg, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2.5rem',
      }}>
        {cfg.emoji}
        {isCompleted && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: '#10b981', color: '#fff',
            borderRadius: 999, padding: '3px 10px',
            fontSize: '0.7rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <CheckCircle2 size={11} /> Done
          </div>
        )}
        {isInProgress && !isCompleted && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: 'rgba(245,158,11,0.9)', color: '#fff',
            borderRadius: 999, padding: '3px 10px',
            fontSize: '0.7rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Zap size={10} /> In Progress
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '1rem 1.15rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {/* Tags */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: cc.bg, color: cc.color }}>
            {cc.icon} {cc.label}
          </span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: `${diffColor}15`, color: diffColor }}>
            {diff}
          </span>
        </div>

        <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0b1c30', lineHeight: 1.4, margin: 0 }}>
          {intervention.title}
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.55, margin: 0, flex: 1 }}>
          {previewText}
        </p>

        {/* Meta */}
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.76rem', color: '#94a3b8', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} /> {intervention.estimated_minutes || '—'} min</span>
          <span>{cfg.label}</span>
        </div>

        {/* Progress bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.72rem', color: '#94a3b8' }}>
            <span>Progress</span><span style={{ fontWeight: 700 }}>{progressPct}%</span>
          </div>
          <div style={{ height: 5, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 999,
              width: `${progressPct}%`,
              background: isCompleted ? '#10b981' : isInProgress ? '#0f766e' : '#e2e8f0',
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '0 1.15rem 1.15rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => onOpen(record)}
          style={{
            flex: 1, padding: '9px 14px', borderRadius: 10, cursor: 'pointer',
            fontSize: '0.84rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            border: isCompleted ? '1px solid #a7f3d0' : 'none',
            background: isCompleted ? '#ecfdf5' : '#0f766e',
            color: isCompleted ? '#047857' : '#fff',
            transition: 'all 0.15s',
          }}
        >
          {isCompleted ? '✓ Review' : isInProgress ? 'Continue' : 'Start Module'}
          {!isCompleted && <ChevronRight size={14} />}
        </button>
        {!isCompleted && (
          <button
            onClick={() => onComplete(record.progress_id, intervention.id)}
            disabled={actionLoading}
            title="Quick mark complete"
            style={{
              width: 36, height: 36, borderRadius: 10, border: '1px solid #e2e8f0',
              background: '#f8fafc', cursor: 'pointer', color: '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={16} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ── Roadmap Node ────────────────────────────────────────────────────────── */
function RoadmapNode({ record, index, onOpen, isLast }) {
  const { intervention, status } = record;
  const done   = status === 'completed';
  const active = status === 'in-progress';
  return (
    <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
      {!isLast && (
        <div style={{
          position: 'absolute', left: 19, top: 42, width: 2, height: 'calc(100% - 4px)',
          background: done ? '#10b981' : '#e2e8f0',
        }} />
      )}
      <div style={{
        width: 40, height: 40, borderRadius: '50%', flexShrink: 0, zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: done ? '#ecfdf5' : active ? 'rgba(15,118,110,0.1)' : '#f8fafc',
        border: `2px solid ${done ? '#10b981' : active ? '#0f766e' : '#e2e8f0'}`,
        color: done ? '#10b981' : active ? '#0f766e' : '#94a3b8',
        boxShadow: active ? '0 0 0 4px rgba(15,118,110,0.1)' : 'none',
        fontSize: done ? '1rem' : '0.82rem',
      }}>
        {done ? <CheckCircle2 size={18} /> : active ? <Zap size={16} /> : <Lock size={14} />}
      </div>
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : '1.5rem' }}>
        <div style={{
          background: '#fff', border: `1px solid ${active ? 'rgba(15,118,110,0.2)' : '#e2e8f0'}`,
          borderRadius: 12, padding: '0.9rem 1.1rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem',
          boxShadow: active ? '0 2px 8px rgba(15,118,110,0.08)' : 'none',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 3 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>MODULE {index + 1}</span>
              {active && <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '1px 8px', borderRadius: 999, background: 'rgba(15,118,110,0.08)', color: '#0f766e' }}>● Active</span>}
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0b1c30' }}>{intervention.title}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
              {done ? 'Completed ✓' : active ? 'In progress — continue learning' : 'Locked'}
            </div>
          </div>
          {(active || done) && (
            <button onClick={() => onOpen(record)} style={{
              padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: done ? '#ecfdf5' : '#0f766e', color: done ? '#047857' : '#fff',
              fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4,
            }}>
              {done ? 'Review' : 'Resume →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function Interventions() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const [records, setRecords]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [openRecord, setOpenRecord]       = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [constructFilter, setConstructFilter] = useState('ALL');
  const [typeFilter, setTypeFilter]       = useState('ALL');

  const load = async () => {
    try {
      const res = await interventionsApi.getMyInterventions();
      setRecords(res.data);
    } catch {
      setError('Could not load your learning modules. Please refresh.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const handleStart = async (progressId, interventionId) => {
    try { await interventionsApi.startIntervention(interventionId); } catch {}
    setRecords(rs => rs.map(r => r.progress_id === progressId ? { ...r, status: 'in-progress' } : r));
  };
  const handleComplete = async (progressId, interventionId) => {
    setActionLoading(true);
    try {
      await interventionsApi.completeIntervention(interventionId);
      setRecords(rs => rs.map(r => r.progress_id === progressId ? { ...r, status: 'completed' } : r));
    } catch {}
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="220px" width="100%" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </div>
    );
  }

  const total   = records.length;
  const done    = records.filter(r => r.status === 'completed').length;
  const inProg  = records.filter(r => r.status === 'in-progress').length;
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0;
  const allDone = total > 0 && done === total;
  const currentModule = records.find(r => r.status === 'in-progress') || records.find(r => r.status === 'assigned');

  const filtered = records.filter(r => {
    if (constructFilter !== 'ALL' && r.intervention.target_construct !== constructFilter) return false;
    if (typeFilter !== 'ALL' && r.intervention.content_type !== typeFilter) return false;
    return true;
  });

  const userName = user?.full_name?.split(' ')[0] || 'Student';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}
    >
      {error && <div className="alert alert-danger">{error}</div>}

      {/* ── Hero Section (Coursera-Style) ────────────────────────────────── */}
      {total > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 50%, #10b981 100%)',
          borderRadius: 24, padding: '2.25rem 2rem', color: '#fff',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(15,118,110,0.25)',
        }}>
          {/* Background decorative circles */}
          {[{s:220,x:'80%',y:'-30%',o:0.07},{s:160,x:'90%',y:'60%',o:0.06},{s:90,x:'15%',y:'80%',o:0.08}].map((c,i) => (
            <div key={i} style={{
              position: 'absolute', left: c.x, top: c.y,
              width: c.s, height: c.s, borderRadius: '50%',
              background: `rgba(255,255,255,${c.o})`,
              transform: 'translate(-50%,-50%)', pointerEvents: 'none',
            }} />
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', position: 'relative' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
                Welcome back, {userName}! 👋
              </div>
              <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)', marginBottom: '1.25rem' }}>
                Continue your cyberbullying intervention learning journey
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {[
                  `${pct}% Overall Progress`,
                  `${done} of ${total} Modules Done`,
                  inProg > 0 ? `${inProg} In Progress ⚡` : 'All caught up!',
                ].map(label => (
                  <span key={label} style={{
                    padding: '6px 14px', borderRadius: 999, fontSize: '0.82rem', fontWeight: 700,
                    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                    backdropFilter: 'blur(6px)',
                  }}>
                    {label}
                  </span>
                ))}
              </div>
              {currentModule && (
                <button
                  onClick={() => setOpenRecord(currentModule)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '11px 22px', borderRadius: 12, border: 'none',
                    background: '#fff', color: '#0f766e', fontSize: '0.9rem', fontWeight: 800,
                    cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,23,42,0.15)',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Zap size={16} /> Resume Learning
                </button>
              )}
            </div>

            {/* Progress Ring */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <ProgressRing pct={pct} size={110} />
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Curriculum Done</span>
            </div>
          </div>
        </div>
      )}

      {/* ── XP / Level Card ─────────────────────────────────────────────── */}
      {total > 0 && (
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20,
          padding: '1.25rem 1.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem',
          boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
        }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', marginBottom: 4 }}>
              <Trophy size={14} style={{ marginRight: 5, verticalAlign: 'middle' }} />
              Your Level: <span style={{ color: '#0f766e' }}>Cyber Safety Learner</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#94a3b8', marginBottom: 4 }}>
              <span>Level 2</span><span style={{ fontWeight: 700 }}>{Math.round(pct * 10)} / 1000 XP</span>
            </div>
            <div style={{ height: 8, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 1.0, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #0f766e, #14b8a6)' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { label: '🛡️ Enrolled',   earned: true  },
              { label: '📋 Pre-Done',    earned: true  },
              { label: '🔒 All Modules', earned: allDone },
              { label: '🔒 Certified',   earned: false },
            ].map(({ label, earned }) => (
              <span key={label} style={{
                fontSize: '0.76rem', fontWeight: 700, padding: '4px 12px', borderRadius: 999,
                background: earned ? '#ecfdf5' : '#f8fafc',
                color: earned ? '#047857' : '#94a3b8',
                border: `1px solid ${earned ? '#a7f3d0' : '#e2e8f0'}`,
              }}>
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── All Done Banner ─────────────────────────────────────────────── */}
      {allDone && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(20,184,166,0.07))',
            border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, padding: '1.5rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2rem' }}>🎉</div>
            <div>
              <div style={{ fontWeight: 700, color: '#047857', fontSize: '1rem' }}>All Modules Completed!</div>
              <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: 2 }}>Your post-assessment is now unlocked. Measure your growth!</div>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={() => navigate('/assessment?stage=post')} iconRight={<ArrowRight size={14} />}>
            Start Post-Assessment
          </Button>
        </motion.div>
      )}

      {/* ── Empty State ─────────────────────────────────────────────────── */}
      {total === 0 && (
        <EmptyState
          icon={<BookOpen size={36} color="#0f766e" />}
          title="No Modules Assigned Yet"
          description="Complete the pre-assessment first. Your personalized modules will appear here based on your results."
          actionLabel="Take Pre-Assessment"
          onAction={() => navigate('/assessment?stage=pre')}
        />
      )}

      {/* ── Continue Where You Left Off ──────────────────────────────────── */}
      {currentModule && !allDone && (
        <div style={{
          background: '#fff', border: '1px solid rgba(15,118,110,0.15)', borderRadius: 20,
          padding: '1.5rem', display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center',
          boxShadow: '0 2px 12px rgba(15,118,110,0.08)',
        }}>
          {/* Thumbnail */}
          <div style={{
            width: 120, height: 80, borderRadius: 12, flexShrink: 0,
            background: (TYPE_CONFIG[currentModule.intervention.content_type] || TYPE_CONFIG.reading).bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem',
          }}>
            {(TYPE_CONFIG[currentModule.intervention.content_type] || TYPE_CONFIG.reading).emoji}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Continue Learning
            </div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0b1c30', marginBottom: 6 }}>
              {currentModule.intervention.title}
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 999 }}>
                <div style={{ height: '100%', width: currentModule.status === 'in-progress' ? '60%' : '0%', background: '#0f766e', borderRadius: 999 }} />
              </div>
              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>{currentModule.status === 'in-progress' ? '60%' : '0%'} done</span>
            </div>
          </div>
          <button onClick={() => setOpenRecord(currentModule)} style={{
            padding: '10px 20px', borderRadius: 10, border: 'none',
            background: '#0f766e', color: '#fff', fontWeight: 700, fontSize: '0.88rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            Resume <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* ── Learning Path Roadmap ─────────────────────────────────────────── */}
      {total > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '1.5rem', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1c30', margin: '0 0 0.35rem 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={17} color="#0f766e" /> Your Learning Path
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1.5rem' }}>
            Sequential competencies grounded in the Theory of Planned Behavior
          </p>
          {records.map((record, i) => (
            <RoadmapNode key={record.progress_id} record={record} index={i}
              onOpen={setOpenRecord} isLast={i === records.length - 1} />
          ))}
        </div>
      )}

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      {total > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[
              { key: 'ALL', label: 'All Modules' },
              { key: 'Attitude',       label: '💭 Attitude' },
              { key: 'SubjectiveNorm', label: '👥 Peer Norms' },
              { key: 'PBC',            label: '💪 Efficacy' },
            ].map(({ key, label }) => {
              const active = constructFilter === key;
              return (
                <button key={key} type="button" onClick={() => setConstructFilter(key)} style={{
                  padding: '6px 14px', borderRadius: 999, fontSize: '0.82rem', fontWeight: 700,
                  border: `1px solid ${active ? '#0f766e' : '#e2e8f0'}`,
                  background: active ? 'rgba(15,118,110,0.08)' : '#fff',
                  color: active ? '#0f766e' : '#64748b', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {label}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={14} color="#64748b" />
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="form-input"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem', height: 34 }}>
              <option value="ALL">All Types</option>
              <option value="quiz">Quizzes</option>
              <option value="video">Videos</option>
              <option value="reading">Readings</option>
              <option value="case-study">Case Studies</option>
            </select>
          </div>
        </div>
      )}

      {/* ── Course Cards Grid ─────────────────────────────────────────────── */}
      {total > 0 && (
        filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0' }}>
            No modules match the selected filters.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {filtered.map(record => (
              <CourseCard key={record.progress_id} record={record}
                onOpen={setOpenRecord} onComplete={handleComplete} actionLoading={actionLoading} />
            ))}
          </div>
        )
      )}



      {/* ── Content Modal ────────────────────────────────────────────────── */}
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
