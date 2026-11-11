import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { interventionsApi, dashboardApi } from '../api';
import {
  BookOpen, PlayCircle, FileQuestion, BookMarked,
  Clock, CheckCircle2, ChevronRight, ChevronLeft,
  AlertCircle, Check, RotateCcw, Award, Lightbulb,
  ArrowRight, ShieldCheck, Target, Compass, Lock,
  ExternalLink, Sparkles, HelpCircle, UserCheck, ShieldAlert
} from 'lucide-react';
import Button from '../components/ui/Button';
import Skeleton, { SkeletonCard } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import PageContainer from '../components/PageContainer';

// ─── TPB Construct Colors & Badges ───────────────────────────────────────────
const CONSTRUCT_THEMES = {
  'Attitude': {
    color: '#4f46e5',
    bg: 'rgba(79, 70, 229, 0.08)',
    border: 'rgba(79, 70, 229, 0.25)',
  },
  'attitude': {
    color: '#4f46e5',
    bg: 'rgba(79, 70, 229, 0.08)',
    border: 'rgba(79, 70, 229, 0.25)',
  },
  'Perceived Behavioral Control': {
    color: '#7c3aed',
    bg: 'rgba(124, 58, 237, 0.08)',
    border: 'rgba(124, 58, 237, 0.25)',
  },
  'Perceived Behavioural Control': {
    color: '#7c3aed',
    bg: 'rgba(124, 58, 237, 0.08)',
    border: 'rgba(124, 58, 237, 0.25)',
  },
  'pbc': {
    color: '#7c3aed',
    bg: 'rgba(124, 58, 237, 0.08)',
    border: 'rgba(124, 58, 237, 0.25)',
  },
  'Subjective Norms': {
    color: '#0891b2',
    bg: 'rgba(8, 145, 178, 0.08)',
    border: 'rgba(8, 145, 178, 0.25)',
  },
  'Subjective Norm': {
    color: '#0891b2',
    bg: 'rgba(8, 145, 178, 0.08)',
    border: 'rgba(8, 145, 178, 0.25)',
  },
  'subjective_norm': {
    color: '#0891b2',
    bg: 'rgba(8, 145, 178, 0.08)',
    border: 'rgba(8, 145, 178, 0.25)',
  },
  'Behavioral Intention': {
    color: '#059669',
    bg: 'rgba(5, 150, 105, 0.08)',
    border: 'rgba(5, 150, 105, 0.25)',
  },
  'Behavioural Intention': {
    color: '#059669',
    bg: 'rgba(5, 150, 105, 0.08)',
    border: 'rgba(5, 150, 105, 0.25)',
  },
  'behavioral_intention': {
    color: '#059669',
    bg: 'rgba(5, 150, 105, 0.08)',
    border: 'rgba(5, 150, 105, 0.25)',
  },
};

const COURSERA_MD = {
  h1: ({ children }) => (
    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '1.25rem 0 0.5rem', color: 'var(--color-text-primary)' }}>
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '1.1rem 0 0.4rem', color: 'var(--color-primary)' }}>
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 style={{ fontSize: '0.98rem', fontWeight: 600, margin: '0.85rem 0 0.35rem', color: 'var(--color-text-primary)' }}>
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p style={{ marginBottom: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.75, fontSize: '0.94rem' }}>
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul style={{ margin: '0.5rem 0 1rem', paddingLeft: '1.25rem', listStyleType: 'disc', color: 'var(--color-text-secondary)', fontSize: '0.94rem' }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol style={{ margin: '0.5rem 0 1rem', paddingLeft: '1.25rem', listStyleType: 'decimal', color: 'var(--color-text-secondary)', fontSize: '0.94rem' }}>
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li style={{ marginBottom: '0.4rem', lineHeight: 1.65 }}>
      {children}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote style={{
      margin: '1rem 0',
      padding: '0.85rem 1.25rem',
      borderRadius: 'var(--radius-md)',
      background: 'rgba(217, 119, 6, 0.08)',
      borderLeft: '4px solid #d97706',
      color: 'var(--color-text-primary)',
      fontSize: '0.92rem',
      lineHeight: 1.65
    }}>
      {children}
    </blockquote>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
      {children}
    </strong>
  ),
};

// ─── Interactive Activity: Module 1 ("Rida's Story" Categorization) ──────────
function RidaStoryActivity({ activityData, savedData, onComplete, isCompleted, actionLoading }) {
  const items = activityData?.items || [];
  const [answers, setAnswers] = useState(savedData?.categorizations || {});
  const [submitted, setSubmitted] = useState(isCompleted);

  const handleSelect = (itemId, cat) => {
    setAnswers((prev) => ({ ...prev, [itemId]: cat }));
  };

  const isAllAnswered = items.length > 0 && items.every((it) => answers[it.id]);

  const handleSubmit = () => {
    if (!isAllAnswered) return;
    setSubmitted(true);
    onComplete({
      activity_type: 'categorization',
      responses: { categorizations: answers },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
      <div style={{
        background: 'rgba(79, 70, 229, 0.05)',
        border: '1px solid rgba(79, 70, 229, 0.2)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#4f46e5', marginBottom: 6 }}>
          <BookMarked size={18} />
          <span>{activityData.title}</span>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', lineHeight: 1.6 }}>
          {activityData.instructions}
        </p>
        <div style={{
          background: 'var(--color-surface)',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          borderLeft: '4px solid #4f46e5',
          fontSize: '0.9rem',
          lineHeight: 1.7,
          color: 'var(--color-text-primary)',
        }}>
          <ReactMarkdown components={COURSERA_MD}>{activityData.story}</ReactMarkdown>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {items.map((it, idx) => {
          const selected = answers[it.id];
          const isCorrect = selected === it.correct_category;

          return (
            <div
              key={it.id}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5', marginBottom: 4 }}>
                Incident {idx + 1}
              </div>
              <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.85rem' }}>
                {it.text}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                {it.options.map((opt) => {
                  const isThisSelected = selected === opt;
                  let border = '1px solid var(--color-border)';
                  let bg = 'var(--color-surface)';
                  if (submitted) {
                    if (opt === it.correct_category) {
                      border = '1px solid rgba(5, 150, 105, 0.5)';
                      bg = 'rgba(5, 150, 105, 0.08)';
                    } else if (isThisSelected && !isCorrect) {
                      border = '1px solid rgba(220, 38, 38, 0.4)';
                      bg = 'rgba(220, 38, 38, 0.06)';
                    }
                  } else if (isThisSelected) {
                    border = '1px solid #4f46e5';
                    bg = 'rgba(79, 70, 229, 0.08)';
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelect(it.id, opt)}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        border,
                        background: bg,
                        color: 'var(--color-text-primary)',
                        fontSize: '0.85rem',
                        fontWeight: isThisSelected ? 600 : 400,
                        textAlign: 'left',
                        cursor: submitted ? 'default' : 'pointer',
                        transition: 'var(--transition)',
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: isCorrect ? 'rgba(5, 150, 105, 0.08)' : 'rgba(217, 119, 6, 0.08)',
                  fontSize: '0.84rem',
                  color: 'var(--color-text-secondary)',
                }}>
                  <strong style={{ color: isCorrect ? 'var(--color-success)' : 'var(--color-warning)' }}>
                    {isCorrect ? '✓ Correct! ' : '💡 Explanation: '}
                  </strong>
                  {it.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isCompleted && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <Button
            variant="primary"
            size="sm"
            disabled={!isAllAnswered}
            loading={actionLoading}
            onClick={handleSubmit}
            iconRight={<CheckCircle2 size={16} />}
          >
            Submit Incident Categorization
          </Button>
        </div>
      )}
      {isCompleted && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(5, 150, 105, 0.08)', borderRadius: 'var(--radius-md)', color: 'var(--color-success)', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          <CheckCircle2 size={16} /> Activity successfully completed. You may now complete this module.
        </div>
      )}
    </div>
  );
}

// ─── Interactive Activity: Module 2 ("Fatima's Story" Empathy Training) ─────
function FatimaEmpathyActivity({ activityData, savedData, onComplete, isCompleted, actionLoading }) {
  const prompts = activityData?.prompts || [];
  const [reflections, setReflections] = useState(savedData?.reflections || { prompt_1: '', prompt_2: '' });
  const [submitted, setSubmitted] = useState(isCompleted);

  const handleChange = (pId, text) => {
    setReflections((prev) => ({ ...prev, [pId]: text }));
  };

  const isAllAnswered = prompts.every((p) => {
    const txt = (reflections[p.id] || '').trim();
    return txt.split(/\s+/).filter(Boolean).length >= (p.min_words || 10);
  });

  const handleSubmit = () => {
    if (!isAllAnswered) return;
    setSubmitted(true);
    onComplete({
      activity_type: 'empathy_training',
      responses: { reflections },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
      <div style={{
        background: 'rgba(79, 70, 229, 0.05)',
        border: '1px solid rgba(79, 70, 229, 0.2)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#4f46e5', marginBottom: 6 }}>
          <Lightbulb size={18} />
          <span>{activityData.title}</span>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', lineHeight: 1.6 }}>
          {activityData.instructions}
        </p>
        <div style={{
          background: 'var(--color-surface)',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          borderLeft: '4px solid #4f46e5',
          fontSize: '0.9rem',
          lineHeight: 1.7,
          color: 'var(--color-text-primary)',
        }}>
          <ReactMarkdown components={COURSERA_MD}>{activityData.story}</ReactMarkdown>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {prompts.map((p, idx) => {
          const text = reflections[p.id] || '';
          const words = text.trim().split(/\s+/).filter(Boolean).length;
          const meetsMin = words >= (p.min_words || 10);

          return (
            <div
              key={p.id}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5', marginBottom: 4 }}>
                Perspective Prompt {idx + 1}
              </div>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 6 }}>
                {p.question}
              </h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                {p.guidance}
              </p>

              <textarea
                rows={3}
                disabled={isCompleted}
                value={text}
                onChange={(e) => handleChange(p.id, e.target.value)}
                placeholder="Write your reflection here (minimum 10-15 words)..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: meetsMin ? '1px solid var(--color-border)' : '1px solid rgba(217, 119, 6, 0.4)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.88rem',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                <span style={{ fontSize: '0.76rem', color: meetsMin ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                  {words} words {!meetsMin && `(minimum ${p.min_words || 10})`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {!isCompleted && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <Button
            variant="primary"
            size="sm"
            disabled={!isAllAnswered}
            loading={actionLoading}
            onClick={handleSubmit}
            iconRight={<CheckCircle2 size={16} />}
          >
            Submit Empathy Reflections
          </Button>
        </div>
      )}
      {isCompleted && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(5, 150, 105, 0.08)', borderRadius: 'var(--radius-md)', color: 'var(--color-success)', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          <CheckCircle2 size={16} /> Reflections submitted and verified. You may now complete this module.
        </div>
      )}
    </div>
  );
}

// ─── Interactive Activity: Module 3 (Evidence Checklist & Simulation) ────────
function EvidenceSimulationActivity({ activityData, savedData, onComplete, isCompleted, actionLoading }) {
  const checklist = activityData?.checklist || [];
  const seqQ = activityData?.response_sequence_question || {};
  const [checkedIds, setCheckedIds] = useState(savedData?.checklist_verified || []);
  const [selectedSeq, setSelectedSeq] = useState(savedData?.response_sequence ?? null);
  const [submitted, setSubmitted] = useState(isCompleted);

  const toggleCheck = (id) => {
    if (isCompleted) return;
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isChecklistDone = checklist.length > 0 && checklist.every((c) => checkedIds.includes(c.id));
  const isAllAnswered = isChecklistDone && selectedSeq !== null;

  const handleSubmit = () => {
    if (!isAllAnswered) return;
    setSubmitted(true);
    onComplete({
      activity_type: 'practical_simulation',
      responses: {
        checklist_verified: checkedIds,
        response_sequence: selectedSeq,
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
      <div style={{
        background: 'rgba(124, 58, 237, 0.05)',
        border: '1px solid rgba(124, 58, 237, 0.2)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#7c3aed', marginBottom: 6 }}>
          <ShieldCheck size={18} />
          <span>{activityData.title}</span>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          {activityData.instructions}
        </p>
      </div>

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.85rem' }}>
          Part 1: Mandatory Evidence Preservation Checklist
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {checklist.map((item) => {
            const isChecked = checkedIds.includes(item.id);
            return (
              <label
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: isChecked ? 'rgba(124, 58, 237, 0.06)' : 'var(--color-surface-2)',
                  border: isChecked ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid transparent',
                  cursor: isCompleted ? 'default' : 'pointer',
                  fontSize: '0.88rem',
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.5,
                }}
              >
                <input
                  type="checkbox"
                  disabled={isCompleted}
                  checked={isChecked}
                  onChange={() => toggleCheck(item.id)}
                  style={{ marginTop: 3, accentColor: '#7c3aed' }}
                />
                <span>{item.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {seqQ.question && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.85rem' }}>
            Part 2: Incident Response Action Sequence
          </h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
            {seqQ.question}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {seqQ.options.map((opt, optIdx) => {
              const isSelected = selectedSeq === optIdx;
              const isCorrect = optIdx === seqQ.correct_index;
              let border = '1px solid var(--color-border)';
              let bg = 'var(--color-surface)';
              if (submitted) {
                if (isCorrect) {
                  border = '1px solid rgba(5, 150, 105, 0.5)';
                  bg = 'rgba(5, 150, 105, 0.08)';
                } else if (isSelected && !isCorrect) {
                  border = '1px solid rgba(220, 38, 38, 0.4)';
                  bg = 'rgba(220, 38, 38, 0.06)';
                }
              } else if (isSelected) {
                border = '1px solid #7c3aed';
                bg = 'rgba(124, 58, 237, 0.08)';
              }

              return (
                <button
                  key={optIdx}
                  type="button"
                  disabled={isCompleted}
                  onClick={() => setSelectedSeq(optIdx)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border,
                    background: bg,
                    color: 'var(--color-text-primary)',
                    textAlign: 'left',
                    fontSize: '0.86rem',
                    cursor: isCompleted ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: isSelected ? '#7c3aed' : 'var(--color-surface-2)',
                    color: isSelected ? '#fff' : 'var(--color-text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
                  }}>
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {submitted && (
            <div style={{
              marginTop: '0.85rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(5, 150, 105, 0.08)',
              borderLeft: '3px solid var(--color-success)',
              fontSize: '0.84rem',
              color: 'var(--color-text-secondary)',
            }}>
              <strong>Guidance: </strong>{seqQ.explanation}
            </div>
          )}
        </div>
      )}

      {!isCompleted && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <Button
            variant="primary"
            size="sm"
            disabled={!isAllAnswered}
            loading={actionLoading}
            onClick={handleSubmit}
            iconRight={<CheckCircle2 size={16} />}
          >
            Verify Checklist & Submit Sequence
          </Button>
        </div>
      )}
      {isCompleted && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(5, 150, 105, 0.08)', borderRadius: 'var(--radius-md)', color: 'var(--color-success)', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          <CheckCircle2 size={16} /> Skill simulation completed. You may now complete this module.
        </div>
      )}
    </div>
  );
}

// ─── Interactive Activity: Module 4 (Role-Selection Scenario Simulation) ────
function RoleScenarioActivity({ activityData, savedData, onComplete, isCompleted, actionLoading }) {
  const roles = activityData?.roles || [];
  const [selectedRoleId, setSelectedRoleId] = useState(savedData?.selected_role || null);
  const [submitted, setSubmitted] = useState(isCompleted);

  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const isUpstander = selectedRole?.is_upstander;

  const handleSubmit = () => {
    if (!selectedRoleId || !isUpstander) return;
    setSubmitted(true);
    onComplete({
      activity_type: 'role_scenario',
      responses: { selected_role: selectedRoleId },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
      <div style={{
        background: 'rgba(8, 145, 178, 0.05)',
        border: '1px solid rgba(8, 145, 178, 0.2)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#0891b2', marginBottom: 6 }}>
          <UserCheck size={18} />
          <span>{activityData.title}</span>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', lineHeight: 1.6 }}>
          {activityData.instructions}
        </p>
        <div style={{
          background: 'var(--color-surface)',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          borderLeft: '4px solid #0891b2',
          fontSize: '0.9rem',
          lineHeight: 1.7,
          color: 'var(--color-text-primary)',
        }}>
          {activityData.scenario}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {roles.map((r) => {
          const isSelected = selectedRoleId === r.id;
          return (
            <div
              key={r.id}
              onClick={() => !isCompleted && setSelectedRoleId(r.id)}
              style={{
                background: isSelected ? 'rgba(8, 145, 178, 0.06)' : 'var(--color-surface)',
                border: isSelected ? '2px solid #0891b2' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.15rem',
                cursor: isCompleted ? 'default' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                transition: 'var(--transition)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: isSelected ? '#0891b2' : 'var(--color-text-primary)' }}>
                  {r.role_title}
                </span>
                {isSelected && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0891b2', background: 'rgba(8, 145, 178, 0.15)', padding: '2px 8px', borderRadius: 999 }}>
                    Selected
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {r.action}
              </p>
            </div>
          );
        })}
      </div>

      {selectedRole && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: isUpstander ? 'rgba(5, 150, 105, 0.08)' : 'rgba(217, 119, 6, 0.08)',
          borderLeft: `4px solid ${isUpstander ? 'var(--color-success)' : 'var(--color-warning)'}`,
          fontSize: '0.88rem',
          lineHeight: 1.6,
          color: 'var(--color-text-primary)',
        }}>
          <ReactMarkdown components={COURSERA_MD}>{selectedRole.outcome}</ReactMarkdown>
        </div>
      )}

      {!isCompleted && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <Button
            variant="primary"
            size="sm"
            disabled={!isUpstander}
            loading={actionLoading}
            onClick={handleSubmit}
            iconRight={<CheckCircle2 size={16} />}
          >
            Confirm Upstander Choice
          </Button>
        </div>
      )}
      {isCompleted && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(5, 150, 105, 0.08)', borderRadius: 'var(--radius-md)', color: 'var(--color-success)', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          <CheckCircle2 size={16} /> Upstander role confirmed. You may now complete this module.
        </div>
      )}
    </div>
  );
}


// ─── Main Interventions Page Component ───────────────────────────────────────
export default function Interventions() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Active module and section state
  const [activeModuleNumber, setActiveModuleNumber] = useState(1);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  // Controls whether the module player view is open vs showing the overview
  const [isPlayerOpen, setIsPlayerOpen] = useState(() => Boolean(searchParams.get('module')));

  const loadLearningData = async () => {
    try {
      const res = await interventionsApi.getModules();
      setLearningPath(res.data);

      // Determine initial active module: query param or first unlocked incomplete module
      const modItems = res.data.modules || [];
      const paramMod = parseInt(searchParams.get('module'), 10);
      if (paramMod && modItems.some((m) => m.module_number === paramMod)) {
        setActiveModuleNumber(paramMod);
        setIsPlayerOpen(true);
      } else {
        const firstActive = modItems.find((m) => m.is_unlocked && m.status !== 'completed');
        if (firstActive) {
          setActiveModuleNumber(firstActive.module_number);
        } else if (modItems.length > 0) {
          setActiveModuleNumber(modItems[0].module_number);
        }
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setIsLocked(true);
        setLockMessage(
          err.response?.data?.detail ||
          'Complete your Pre-Assessment first to unlock your personalized learning modules.'
        );
      } else {
        setError('Unable to load your adaptive learning modules. Please refresh.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLearningData();
  }, []);

  const assignment = learningPath?.assignment;
  const modules = useMemo(() => learningPath?.modules || [], [learningPath]);

  const activeModule = useMemo(() => {
    if (!modules.length) return null;
    return modules.find((m) => m.module_number === activeModuleNumber) || modules[0] || null;
  }, [modules, activeModuleNumber]);

  const activeConstructTheme = activeModule
    ? CONSTRUCT_THEMES[activeModule.target_construct] || CONSTRUCT_THEMES['Attitude']
    : CONSTRUCT_THEMES['Attitude'];

  const requiredModuleIds = useMemo(() => {
    if (Array.isArray(assignment?.required_module_ids)) {
      return assignment.required_module_ids;
    }
    return modules.filter((m) => m.is_required).map((m) => m.module_number);
  }, [assignment, modules]);

  const optionalModuleIds = useMemo(() => {
    if (Array.isArray(assignment?.optional_module_ids)) {
      return assignment.optional_module_ids;
    }
    const optId = assignment?.optional_enhancement_module;
    return optId ? [optId] : modules.filter((m) => !m.is_required).map((m) => m.module_number);
  }, [assignment, modules]);

  // Exclusive rendering branches:
  // 1. If required_module_ids.length > 0 -> Show only mandatory learning modules
  // 2. If required_module_ids.length === 0 and optional_module_ids.length > 0 -> Show only congratulations + enhancement module
  const hasRequired = requiredModuleIds.length > 0;
  const isEnhancementOnly = !hasRequired && optionalModuleIds.length > 0;
  const allConstructsHigh = isEnhancementOnly || Boolean(assignment?.all_constructs_high);

  // For all-high users: the optional enhancement module
  const optionalEnhModule = useMemo(() => {
    if (!isEnhancementOnly) return null;
    const targetId = optionalModuleIds[0] || assignment?.optional_enhancement_module;
    if (targetId) {
      const found = modules.find((m) => m.module_number === targetId);
      if (found) return found;
    }
    return modules.find((m) => !m.is_required) || null;
  }, [isEnhancementOnly, optionalModuleIds, assignment, modules]);

  const optionalEnhConstruct =
    assignment?.optional_enhancement_construct ||
    optionalEnhModule?.target_construct_key;

  const requiredModules = modules.filter((m) => m.is_required);
  const completedRequiredCount = requiredModules.filter((m) => m.status === 'completed').length;
  const totalRequiredCount = requiredModules.length;
  const overallProgressPercent = totalRequiredCount > 0
    ? Math.round((completedRequiredCount / totalRequiredCount) * 100)
    : (isEnhancementOnly ? 100 : 0);
  const allRequiredDone = learningPath?.all_required_completed || isEnhancementOnly;

  const isViewingActivity = activeSectionIdx >= (activeModule?.sections?.length || 0);

  const handleSelectModule = (modNum) => {
    const target = modules.find((m) => m.module_number === modNum);
    if (!target) return;
    if (!target.is_unlocked) {
      return; // Locked sequentially
    }
    setActiveModuleNumber(modNum);
    setActiveSectionIdx(0);
    setIsPlayerOpen(true);
    setSearchParams({ module: modNum });

    // Mark as in-progress on start if currently assigned or optional
    if (target.status === 'assigned' || target.status === 'optional') {
      interventionsApi.startModule(modNum).then(() => {
        setLearningPath((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            modules: prev.modules.map((m) => (m.module_number === modNum ? { ...m, status: 'in-progress' } : m)),
          };
        });
      }).catch(() => {});
    }
  };

  const handleBackToOverview = () => {
    setIsPlayerOpen(false);
    setSearchParams({});
  };

  const handleCompleteActivity = async (payload) => {
    if (!activeModule) return;
    setActionLoading(true);
    try {
      await interventionsApi.submitActivity(activeModule.module_number, payload);
      setLearningPath((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          modules: prev.modules.map((m) =>
            m.module_number === activeModule.module_number
              ? { ...m, activity_completed: true, activity_data: payload.responses }
              : m
          ),
        };
      });
    } catch (err) {
      alert(err.response?.data?.detail || 'Activity submission failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteModule = async () => {
    if (!activeModule) return;
    setActionLoading(true);
    try {
      await interventionsApi.completeModule(activeModule.module_number);
      // Refresh learning path to get updated sequential unlocking
      const refreshed = await interventionsApi.getModules();
      setLearningPath(refreshed.data);

      // Auto-advance to next required module if available
      const nextRequired = refreshed.data.modules.find(
        (m) => m.is_required && m.is_unlocked && m.status !== 'completed'
      );
      if (nextRequired) {
        setActiveModuleNumber(nextRequired.module_number);
        setActiveSectionIdx(0);
      } else {
        // All required modules finished or optional module finished: return to overview
        handleBackToOverview();
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not complete module.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartPostAssessment = () => {
    navigate('/assessment?stage=post&mode=take');
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="coursera-container" style={{ padding: 0 }}>
          <Skeleton height="90px" width="70%" borderRadius="var(--radius-lg)" />
          <Skeleton height="140px" width="100%" borderRadius="var(--radius-lg)" style={{ margin: '1.25rem 0' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </PageContainer>
    );
  }

  // ── Locked: pre-assessment not yet completed ─────────────────────────────
  if (isLocked) {
    return (
      <PageContainer>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="coursera-container"
          style={{ padding: 0 }}
        >
          <EmptyState
            icon={<Lock size={36} color="var(--color-primary)" />}
            title="Learning Modules Locked"
            description={
              lockMessage ||
              'Complete your Pre-Assessment first to unlock your personalized learning modules. Your assessment results determine which learning content is recommended specifically for you.'
            }
            actionLabel="Start Pre-Assessment"
            onAction={() => navigate('/assessment?stage=pre&mode=take')}
          />
        </motion.div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="coursera-container"
        style={{ padding: 0 }}
      >
        {/* ─── Simplified Overview Interface (Visible when NOT in player mode) ─── */}
        {!isPlayerOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Header & Progress Card */}
            <div className="coursera-header-card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(79, 70, 229, 0.1)',
                        color: 'var(--color-primary)',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                      }}
                    >
                      <Sparkles size={14} />
                      {allConstructsHigh ? 'Personalized Enhancement' : 'Personalized Learning Path'}
                    </span>
                  </div>

                  <h1 className="coursera-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
                    {allConstructsHigh ? 'Recommended Enhancement Module' : 'Assigned Learning Modules'}
                  </h1>
                  <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0', lineHeight: 1.5 }}>
                    {allConstructsHigh
                      ? 'Based on your pre-assessment, here is your personalized enhancement module to strengthen your digital safety skills.'
                      : 'Complete your assigned modules to strengthen key digital safety competencies identified in your pre-assessment.'}
                  </p>
                </div>
              </div>

              {error && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{error}</div>}

              {/* Progress Bar & Status */}
              <div className="coursera-progress-block">
                <div className="coursera-progress-header" style={{ marginBottom: '0.5rem' }}>
                  <span className="coursera-progress-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.9rem' }}>
                    <ShieldCheck size={16} color="var(--color-primary)" />
                    {allConstructsHigh
                      ? `Module Progress: ${optionalEnhModule?.status === 'completed' ? '1 of 1 Completed' : '0 of 1 Completed'}`
                      : `Module Progress: ${completedRequiredCount} of ${totalRequiredCount} Completed`}
                  </span>
                  <span
                    style={{
                      fontWeight: 800,
                      color: (allConstructsHigh ? optionalEnhModule?.status === 'completed' : allRequiredDone)
                        ? 'var(--color-success)'
                        : 'var(--color-primary)',
                      fontSize: '0.92rem',
                    }}
                  >
                    {allConstructsHigh
                      ? (optionalEnhModule?.status === 'completed' ? '100%' : '0%')
                      : `${overallProgressPercent}%`}
                  </span>
                </div>

                <div className="progress-bar" style={{ height: 8, borderRadius: 999, background: 'var(--color-surface-3)' }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${allConstructsHigh ? (optionalEnhModule?.status === 'completed' ? 100 : 0) : overallProgressPercent}%`,
                      background: (allConstructsHigh ? optionalEnhModule?.status === 'completed' : allRequiredDone)
                        ? 'var(--color-success)'
                        : 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)',
                      borderRadius: 999,
                      transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ── Assigned Module(s) Display ── */}
            {allConstructsHigh ? (
              /* Single Recommended Enhancement Module Card */
              optionalEnhModule && (() => {
                const theme = CONSTRUCT_THEMES[optionalEnhModule.target_construct] || CONSTRUCT_THEMES['Attitude'];
                const isCompleted = optionalEnhModule.status === 'completed';
                const isInProgress = optionalEnhModule.status === 'in-progress';

                return (
                  <div
                    style={{
                      background: 'var(--color-surface)',
                      border: '1.5px solid rgba(79, 70, 229, 0.25)',
                      borderRadius: 'var(--radius-xl)',
                      padding: '1.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.25rem',
                      boxShadow: '0 4px 20px -2px rgba(79, 70, 229, 0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span
                          style={{
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            color: theme.color,
                            background: theme.bg,
                            padding: '0.25rem 0.75rem',
                            borderRadius: 'var(--radius-full)',
                            border: `1px solid ${theme.border}`,
                          }}
                        >
                          Target: {optionalEnhModule.target_construct}
                        </span>

                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: 'var(--color-primary)',
                            background: 'rgba(79, 70, 229, 0.08)',
                            padding: '0.25rem 0.65rem',
                            borderRadius: 'var(--radius-full)',
                          }}
                        >
                          Personalized Recommendation
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        <Clock size={14} />
                        <span>{optionalEnhModule.estimated_minutes} min</span>
                      </div>
                    </div>

                    <div>
                      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.3 }}>
                        {optionalEnhModule.title}
                      </h2>
                      <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', margin: '0.45rem 0 0', lineHeight: 1.6 }}>
                        {optionalEnhModule.subtitle}
                      </p>
                    </div>

                    {optionalEnhModule.why_recommended && (
                      <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
                        {optionalEnhModule.why_recommended}
                      </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                      <div>
                        {isCompleted ? (
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-success)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <CheckCircle2 size={16} /> Completed
                          </span>
                        ) : isInProgress ? (
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-warning)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            In Progress
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                            Not Started
                          </span>
                        )}
                      </div>

                      <Button
                        variant={isCompleted ? 'secondary' : 'primary'}
                        size="md"
                        onClick={() => handleSelectModule(optionalEnhModule.module_number)}
                        iconRight={<ChevronRight size={16} />}
                      >
                        {isCompleted
                          ? 'Review Enhancement Module'
                          : isInProgress
                          ? 'Continue Enhancement Module'
                          : 'Start Enhancement Module'}
                      </Button>
                    </div>
                  </div>
                );
              })()
            ) : (
              /* Grid of Mandatory Learning Modules */
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {requiredModules.map((m) => {
                  const theme = CONSTRUCT_THEMES[m.target_construct] || CONSTRUCT_THEMES['Attitude'];
                  const isCompleted = m.status === 'completed';
                  const isInProgress = m.status === 'in-progress';
                  const isLocked = !m.is_unlocked;

                  return (
                    <div
                      key={m.module_number}
                      onClick={() => !isLocked && handleSelectModule(m.module_number)}
                      style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '1.4rem',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        opacity: isLocked ? 0.6 : 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                        transition: 'var(--transition)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: theme.color,
                            background: theme.bg,
                            padding: '0.2rem 0.65rem',
                            borderRadius: 'var(--radius-full)',
                            border: `1px solid ${theme.border}`,
                          }}
                        >
                          Target: {m.target_construct}
                        </span>

                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={13} /> {m.estimated_minutes} min
                        </span>
                      </div>

                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.35 }}>
                          {m.title}
                        </h3>
                        <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', margin: '0.4rem 0 0', lineHeight: 1.5 }}>
                          {m.subtitle}
                        </p>
                      </div>

                      <div
                        style={{
                          marginTop: 'auto',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '0.75rem',
                          borderTop: '1px solid var(--color-border)',
                        }}
                      >
                        <div>
                          {isCompleted ? (
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle2 size={14} /> Completed
                            </span>
                          ) : isLocked ? (
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Lock size={13} /> Locked
                            </span>
                          ) : isInProgress ? (
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-warning)' }}>
                              In Progress
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                              Not Started
                            </span>
                          )}
                        </div>

                        {!isLocked && (
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                            {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'} <ChevronRight size={14} />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ─── Bottom Actions (Proceed to Post-Assessment & Return to Dashboard) ─── */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
                padding: '1.25rem 1.5rem',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                marginTop: '1rem',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--color-text-primary)' }}>
                  {allRequiredDone || allConstructsHigh
                    ? 'Ready for Post-Assessment?'
                    : 'Complete your assigned modules to unlock Post-Assessment.'}
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {allRequiredDone || allConstructsHigh
                    ? 'Measure your growth and see your progress report.'
                    : `${totalRequiredCount - completedRequiredCount} module${totalRequiredCount - completedRequiredCount === 1 ? '' : 's'} remaining.`}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate('/dashboard')}
                >
                  Return to Dashboard
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  disabled={!allRequiredDone && !allConstructsHigh}
                  onClick={handleStartPostAssessment}
                  iconRight={<ArrowRight size={16} />}
                >
                  Proceed to Post-Assessment
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Active Module Interactive Player Layout ─── */}
        {isPlayerOpen && activeModule && (
          <div className="coursera-course-layout">
            {/* Syllabus Navigation Sidebar */}
            <aside className="coursera-sidebar">
              <div className="coursera-sidebar-header">
                <span className="coursera-sidebar-title">
                  Module {activeModule.module_number} Outline
                </span>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                  Target: {activeModule.target_construct}
                </div>
              </div>

              <div className="coursera-lesson-list" style={{ background: 'transparent', padding: '0.75rem' }}>
                {activeModule.sections.map((sec, idx) => {
                  const isSecSelected = activeSectionIdx === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveSectionIdx(idx)}
                      className={`coursera-lesson-btn ${isSecSelected ? 'active' : ''}`}
                      style={{
                        padding: '0.75rem 0.9rem',
                        border: isSecSelected ? `1px solid ${activeConstructTheme.color}55` : '1px solid transparent',
                        background: isSecSelected ? `${activeConstructTheme.color}0a` : 'transparent',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 4,
                      }}
                    >
                      <div
                        style={{
                          width: 22, height: 22, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                          background: isSecSelected ? activeConstructTheme.color : 'var(--color-surface-2)',
                          color: isSecSelected ? '#fff' : 'var(--color-text-muted)',
                        }}
                      >
                        {idx + 1}
                      </div>
                      <span style={{
                        fontSize: '0.84rem',
                        fontWeight: isSecSelected ? 700 : 500,
                        color: isSecSelected ? activeConstructTheme.color : 'var(--color-text-primary)',
                        textAlign: 'left',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {sec.title}
                      </span>
                    </button>
                  );
                })}

                {/* Interactive Activity Tab */}
                <button
                  type="button"
                  onClick={() => setActiveSectionIdx(activeModule.sections.length)}
                  className={`coursera-lesson-btn ${isViewingActivity ? 'active' : ''}`}
                  style={{
                    padding: '0.75rem 0.9rem',
                    border: isViewingActivity ? `1px solid ${activeConstructTheme.color}55` : '1px solid rgba(79, 70, 229, 0.15)',
                    background: isViewingActivity ? `${activeConstructTheme.color}0a` : 'rgba(79, 70, 229, 0.04)',
                    borderRadius: 'var(--radius-md)',
                    marginTop: 6,
                  }}
                >
                  <div
                    style={{
                      width: 22, height: 22, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                      background: activeModule.activity_completed ? 'var(--color-success)' : activeConstructTheme.color,
                      color: '#fff',
                    }}
                  >
                    {activeModule.activity_completed ? <Check size={12} strokeWidth={3} /> : <Award size={12} />}
                  </div>
                  <div style={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      color: isViewingActivity ? activeConstructTheme.color : 'var(--color-text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      Interactive Activity
                    </div>
                    <div style={{ fontSize: '0.74rem', color: activeModule.activity_completed ? 'var(--color-success)' : 'var(--color-warning)' }}>
                      {activeModule.activity_completed ? 'Completed' : 'Required to finish'}
                    </div>
                  </div>
                </button>
              </div>

              <div style={{
                padding: '1.1rem 1.25rem',
                borderTop: '1px solid var(--color-border)',
                background: 'var(--color-surface-2)',
                marginTop: 'auto',
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}>
                  Target TPB Construct
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: activeConstructTheme.color, marginTop: 2 }}>
                  {activeModule.target_construct}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                  {activeModule.why_recommended}
                </div>
              </div>
            </aside>

            {/* Reading and Activity Content Player */}
            <section className="coursera-player-card">
              <div className="coursera-breadcrumbs" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  onClick={handleBackToOverview}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.86rem',
                    color: 'var(--color-primary)',
                    padding: '0.2rem 0',
                    fontWeight: 700,
                  }}
                >
                  <ChevronLeft size={16} /> Back to Overview
                </button>
                <span style={{ color: 'var(--color-border)', margin: '0 4px' }}>|</span>
                <span style={{ fontWeight: 600, color: activeConstructTheme.color }}>Module {activeModule.module_number}</span>
                <ChevronRight size={13} />
                <span>
                  {isViewingActivity ? 'Interactive Activity' : `Section ${activeSectionIdx + 1} of ${activeModule.sections.length}`}
                </span>
              </div>

              <div className="coursera-lesson-meta-bar">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: activeConstructTheme.color,
                        background: activeConstructTheme.bg,
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      <Target size={12} /> {activeModule.target_construct}
                    </span>

                    <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} /> {activeModule.estimated_minutes} min read
                    </span>
                  </div>

                  <h2 className="coursera-lesson-heading">{activeModule.title}</h2>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {activeModule.subtitle}
                  </p>
                </div>

                <div>
                  {activeModule.status === 'completed' ? (
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <CheckCircle2 size={16} /> Completed
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={15} /> In Progress
                    </span>
                  )}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="coursera-content-body" style={{ minHeight: 320 }}>
                {!isViewingActivity ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Objectives on Section 1 */}
                    {activeSectionIdx === 0 && (
                      <div style={{
                        background: 'rgba(79, 70, 229, 0.04)',
                        border: '1px solid rgba(79, 70, 229, 0.15)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem 1.25rem',
                      }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-primary)', marginBottom: 6 }}>
                          Learning Objectives:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.86rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                          {activeModule.learning_objectives.map((obj, i) => (
                            <li key={i}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="markdown-content">
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.75rem' }}>
                        {activeModule.sections[activeSectionIdx]?.title}
                      </h3>
                      <ReactMarkdown components={COURSERA_MD}>
                        {activeModule.sections[activeSectionIdx]?.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  /* Interactive Activity View */
                  <div>
                    {activeModule.module_number === 1 && (
                      <RidaStoryActivity
                        activityData={activeModule.activity}
                        savedData={activeModule.activity_data}
                        isCompleted={activeModule.activity_completed}
                        onComplete={handleCompleteActivity}
                        actionLoading={actionLoading}
                      />
                    )}
                    {activeModule.module_number === 2 && (
                      <FatimaEmpathyActivity
                        activityData={activeModule.activity}
                        savedData={activeModule.activity_data}
                        isCompleted={activeModule.activity_completed}
                        onComplete={handleCompleteActivity}
                        actionLoading={actionLoading}
                      />
                    )}
                    {activeModule.module_number === 3 && (
                      <EvidenceSimulationActivity
                        activityData={activeModule.activity}
                        savedData={activeModule.activity_data}
                        isCompleted={activeModule.activity_completed}
                        onComplete={handleCompleteActivity}
                        actionLoading={actionLoading}
                      />
                    )}
                    {activeModule.module_number === 4 && (
                      <RoleScenarioActivity
                        activityData={activeModule.activity}
                        savedData={activeModule.activity_data}
                        isCompleted={activeModule.activity_completed}
                        onComplete={handleCompleteActivity}
                        actionLoading={actionLoading}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Player Navigation & Completion Footer */}
              <div className="coursera-player-footer">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={activeSectionIdx === 0}
                  onClick={() => setActiveSectionIdx((i) => Math.max(0, i - 1))}
                  icon={<ChevronLeft size={14} />}
                >
                  Previous
                </Button>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {!isViewingActivity ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setActiveSectionIdx((i) => i + 1)}
                      iconRight={<ChevronRight size={14} />}
                    >
                      {activeSectionIdx === activeModule.sections.length - 1 ? 'Go to Interactive Activity' : 'Next Section'}
                    </Button>
                  ) : (
                    activeModule.status !== 'completed' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={!activeModule.activity_completed}
                        loading={actionLoading}
                        onClick={handleCompleteModule}
                        iconRight={<CheckCircle2 size={16} />}
                        title={!activeModule.activity_completed ? 'You must complete the activity first' : ''}
                      >
                        {isEnhancementOnly ? 'Complete Enhancement Module' : `Complete Module ${activeModule.module_number}`}
                      </Button>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBackToOverview}
                          icon={<ChevronLeft size={14} />}
                        >
                          Back to Overview
                        </Button>
                        {allRequiredDone && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleStartPostAssessment}
                            iconRight={<ArrowRight size={14} />}
                          >
                            Proceed to Post-Assessment
                          </Button>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </motion.div>
    </PageContainer>
  );
}
