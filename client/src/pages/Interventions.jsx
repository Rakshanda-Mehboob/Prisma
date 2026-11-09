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
  'Perceived Behavioral Control': {
    color: '#7c3aed',
    bg: 'rgba(124, 58, 237, 0.08)',
    border: 'rgba(124, 58, 237, 0.25)',
  },
  'Subjective Norms': {
    color: '#0891b2',
    bg: 'rgba(8, 145, 178, 0.08)',
    border: 'rgba(8, 145, 178, 0.25)',
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
  const items = activityData.items || [];
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
  const prompts = activityData.prompts || [];
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
  const checklist = activityData.checklist || [];
  const seqQ = activityData.response_sequence_question || {};
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
  const roles = activityData.roles || [];
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
  const [actionLoading, setActionLoading] = useState(false);

  // Active module and section state
  const [activeModuleNumber, setActiveModuleNumber] = useState(1);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);

  const loadLearningData = async () => {
    try {
      const res = await interventionsApi.getModules();
      setLearningPath(res.data);

      // Determine initial active module: first unlocked incomplete module or query param
      const paramMod = parseInt(searchParams.get('module'), 10);
      if (paramMod && [1, 2, 3, 4].includes(paramMod)) {
        setActiveModuleNumber(paramMod);
      } else {
        const firstActive = res.data.modules.find((m) => m.is_unlocked && m.status !== 'completed');
        if (firstActive) {
          setActiveModuleNumber(firstActive.module_number);
        } else if (res.data.modules.length > 0) {
          setActiveModuleNumber(res.data.modules[0].module_number);
        }
      }
    } catch (err) {
      setError('Unable to load your adaptive learning modules. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLearningData();
  }, []);

  const activeModule = useMemo(() => {
    if (!learningPath?.modules) return null;
    return learningPath.modules.find((m) => m.module_number === activeModuleNumber) || learningPath.modules[0];
  }, [learningPath, activeModuleNumber]);

  const activeConstructTheme = activeModule ? CONSTRUCT_THEMES[activeModule.target_construct] || CONSTRUCT_THEMES['Attitude'] : CONSTRUCT_THEMES['Attitude'];

  const handleSelectModule = (modNum) => {
    const target = learningPath?.modules?.find((m) => m.module_number === modNum);
    if (!target) return;
    if (!target.is_unlocked) {
      return; // Locked sequentially
    }
    setActiveModuleNumber(modNum);
    setActiveSectionIdx(0);
    setSearchParams({ module: modNum });

    // Mark as in-progress on start if currently assigned
    if (target.status === 'assigned') {
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
      const nextRequired = refreshed.data.modules.find((m) => m.is_required && m.is_unlocked && m.status !== 'completed');
      if (nextRequired) {
        setActiveModuleNumber(nextRequired.module_number);
        setActiveSectionIdx(0);
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
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </PageContainer>
    );
  }

  const assignment = learningPath?.assignment;
  const modules = learningPath?.modules || [];
  const requiredModules = modules.filter((m) => m.is_required);
  const completedRequiredCount = requiredModules.filter((m) => m.status === 'completed').length;
  const totalRequiredCount = requiredModules.length;
  const overallProgressPercent = totalRequiredCount > 0 ? Math.round((completedRequiredCount / totalRequiredCount) * 100) : 0;
  const allRequiredDone = learningPath?.all_required_completed;

  const isViewingActivity = activeSectionIdx >= (activeModule?.sections?.length || 0);

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="coursera-container"
        style={{ padding: 0 }}
      >
        {/* ─── Header Card: Adaptive Recommendations & Overview ─── */}
        <div className="coursera-header-card">
          <div className="coursera-header-top">
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    background: assignment?.is_reinforcement ? 'rgba(5, 150, 105, 0.1)' : 'rgba(79, 70, 229, 0.1)',
                    color: assignment?.is_reinforcement ? 'var(--color-success)' : 'var(--color-primary)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  }}
                >
                  <Target size={14} />
                  {assignment?.is_reinforcement ? 'Reinforcement Learning Path' : 'Personalized Adaptive Path'}
                </span>

                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--color-text-muted)',
                    background: 'var(--color-surface-2)',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  Diagnostic Threshold: {assignment?.threshold_used?.toFixed(1) || '4.0'} / 5.0
                </span>
              </div>

              <h1 className="coursera-title" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                Cyberbullying Prevention Learning Modules
              </h1>

              {/* Recommended For You Explanation Box */}
              <div
                style={{
                  marginTop: '0.85rem',
                  padding: '1rem 1.25rem',
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                }}
              >
                <Sparkles size={20} color="var(--color-primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: 2 }}>
                    Recommended For You:
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    {assignment?.recommendation_reason}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && <div className="alert alert-danger" style={{ marginTop: '1rem' }}>{error}</div>}

          {/* Progress Overview */}
          <div className="coursera-progress-block">
            <div className="coursera-progress-header">
              <span className="coursera-progress-title">
                <ShieldCheck size={16} color="var(--color-primary)" />
                Required Modules Progress: {completedRequiredCount} of {totalRequiredCount} Completed
              </span>
              <span style={{ fontWeight: 800, color: allRequiredDone ? 'var(--color-success)' : 'var(--color-primary)', fontSize: '0.92rem' }}>
                {overallProgressPercent}%
              </span>
            </div>

            <div className="progress-bar" style={{ height: 7, borderRadius: 999, background: 'var(--color-surface-3)' }}>
              <div
                className="progress-fill"
                style={{
                  width: `${overallProgressPercent}%`,
                  background: allRequiredDone
                    ? 'var(--color-success)'
                    : 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)',
                  borderRadius: 999,
                  transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
            </div>
          </div>

          {/* Post-Assessment Ready Alert Banner */}
          {allRequiredDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                marginTop: '1.25rem',
                padding: '1rem 1.25rem',
                background: 'rgba(5, 150, 105, 0.08)',
                border: '1px solid rgba(5, 150, 105, 0.3)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle2 size={24} color="var(--color-success)" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--color-success)' }}>
                    All Required Modules Finished!
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)' }}>
                    You have satisfied all diagnostic requirements. You can now unlock and take the post-assessment.
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleStartPostAssessment}
                iconRight={<ArrowRight size={14} />}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  borderRadius: 999,
                  fontWeight: 700,
                }}
              >
                Proceed to Post-Assessment
              </Button>
            </motion.div>
          )}
        </div>

        {/* ─── 4-Module Card Overview Grid ─── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          margin: '1.25rem 0',
        }}>
          {modules.map((m) => {
            const isSelected = activeModuleNumber === m.module_number;
            const theme = CONSTRUCT_THEMES[m.target_construct] || CONSTRUCT_THEMES['Attitude'];
            const isCompleted = m.status === 'completed';
            const isLocked = !m.is_unlocked;

            return (
              <div
                key={m.module_number}
                onClick={() => handleSelectModule(m.module_number)}
                style={{
                  background: isSelected ? 'var(--color-surface)' : 'var(--color-surface)',
                  border: isSelected ? `2px solid ${theme.color}` : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.15rem',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  opacity: isLocked ? 0.6 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  position: 'relative',
                  boxShadow: isSelected ? '0 8px 24px -4px rgba(79, 70, 229, 0.15)' : 'none',
                  transition: 'var(--transition)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {/* Target Construct Badge */}
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: theme.color,
                      background: theme.bg,
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    Target: {m.target_construct}
                  </span>

                  {/* Required vs Optional Tag */}
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      background: m.is_required ? 'rgba(79, 70, 229, 0.12)' : 'var(--color-surface-2)',
                      color: m.is_required ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {m.is_required ? 'Required' : 'Optional'}
                  </span>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 2 }}>
                    {m.title}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                    {m.subtitle}
                  </p>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {m.estimated_minutes} min
                  </span>

                  <div>
                    {isCompleted ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={13} /> Completed
                      </span>
                    ) : isLocked ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Lock size={12} /> Locked
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {m.status === 'in-progress' ? 'In Progress' : 'Start'} <ChevronRight size={12} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Active Module Interactive Player Layout ─── */}
        {activeModule && (
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
              <div className="coursera-breadcrumbs">
                <span>Learning Modules</span>
                <ChevronRight size={13} />
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
                        Complete Module {activeModule.module_number}
                      </Button>
                    ) : (
                      allRequiredDone ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleStartPostAssessment}
                          iconRight={<ArrowRight size={14} />}
                          style={{ background: 'var(--color-success)' }}
                        >
                          Proceed to Post-Assessment
                        </Button>
                      ) : (
                        <span style={{ fontSize: '0.84rem', color: 'var(--color-success)', fontWeight: 600 }}>
                          ✓ Module Completed
                        </span>
                      )
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
