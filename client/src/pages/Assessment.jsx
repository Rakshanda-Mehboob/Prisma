import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { assessmentApi } from '../api';
import {
  ChevronLeft, ChevronRight, Send, Lock,
  AlertTriangle, Sparkles, BookOpen, Trophy,
  ListFilter, Check
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import ThreatGauge from '../components/cyber/ThreatGauge';

const CONSTRUCT_INFO = {
  Attitude: { label: 'Attitude (Harm Evaluation)', color: '#16a34a', badge: 'primary', emoji: '💭' },
  SubjectiveNorm: { label: 'Subjective Norm (Peer Culture)', color: '#0d9488', badge: 'secondary', emoji: '👥' },
  PBC: { label: 'Perceived Control (Intervention)', color: '#1a5632', badge: 'success', emoji: '💪' },
};

export default function Assessment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stage = searchParams.get('stage') || 'pre';

  const [scenarios, setScenarios] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { scenarioId: selectedScore }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const statusRes = await assessmentApi.getStatus();

        if (stage === 'post' && !statusRes.data.post_unlocked) {
          setError('Complete all assigned learning modules before taking the post-assessment.');
          setLoading(false);
          return;
        }
        if (stage === 'pre' && statusRes.data.pre_completed) {
          navigate('/assessment?stage=post');
          return;
        }
        if (stage === 'post' && statusRes.data.post_completed) {
          navigate('/dashboard');
          return;
        }

        const res = stage === 'pre'
          ? await assessmentApi.getPreScenarios()
          : await assessmentApi.getPostScenarios();
        setScenarios(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || `Failed to load ${stage}-assessment scenarios.`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [stage, navigate]);

  const current = scenarios[currentIdx];
  const totalQ = scenarios.length;
  const answeredCount = Object.keys(answers).length;
  const progress = totalQ > 0 ? Math.round((answeredCount / totalQ) * 100) : 0;

  const selectOption = (scenarioId, score) => {
    setAnswers((a) => ({ ...a, [scenarioId]: score }));
  };

  const goNext = () => { if (currentIdx < totalQ - 1) setCurrentIdx((i) => i + 1); };
  const goPrev = () => { if (currentIdx > 0) setCurrentIdx((i) => i - 1); };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (current && ['1', '2', '3', '4', '5'].includes(e.key)) {
        const scoreNum = parseInt(e.key);
        // Match option score if available
        const opt = current.options.find((o) => o.score === scoreNum);
        if (opt) selectOption(current.id, opt.score);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx, totalQ, current]);

  const handleSubmit = async () => {
    if (answeredCount < totalQ) {
      setError(`Please answer all ${totalQ} questions before submitting.`);
      setReviewModalOpen(true);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const responses = Object.entries(answers).map(([scenario_id, selected_score]) => ({
        scenario_id: parseInt(scenario_id),
        selected_score,
      }));
      const res = stage === 'pre'
        ? await assessmentApi.submitPre(responses)
        : await assessmentApi.submitPost(responses);
      setResult(res.data);
      setSubmitted(true);
      setReviewModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="60px" width="70%" />
        <Skeleton height="12px" width="100%" borderRadius="var(--radius-full)" />
        <Skeleton height="360px" width="100%" borderRadius="var(--radius-xl)" />
      </div>
    );
  }

  if (error && !scenarios.length) {
    return (
      <div style={{ maxWidth: '720px', margin: '2rem auto', textAlign: 'center' }}>
        <Card glow="primary" style={{ padding: '3rem 2rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Lock size={32} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
            {stage === 'post' ? 'Post-Assessment Locked' : 'Assessment Unavailable'}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
            {error}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            {stage === 'post' && (
              <Button variant="primary" onClick={() => navigate('/interventions')} icon={<BookOpen size={16} />}>
                Go to Learning Modules
              </Button>
            )}
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Submitted celebration screen
  if (submitted && result) {
    const scores = [
      { label: 'Harm Attitude', value: result.attitude_score, color: '#16a34a' },
      { label: 'Subjective Norms', value: result.subjective_norm_score, color: '#0d9488' },
      { label: 'Perceived Control (PBC)', value: result.pbc_score, color: '#1a5632' },
    ];
    const mean = Math.round((result.attitude_score + result.subjective_norm_score + result.pbc_score) / 3);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        style={{ maxWidth: '800px', margin: '0 auto' }}
      >
        <Card glow="primary" style={{ textAlign: 'center', padding: '3.5rem 2rem', position: 'relative' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              margin: '0 auto 1.5rem',
              boxShadow: '0 4px 20px var(--color-primary-glow)',
            }}
          >
            <Trophy size={36} />
          </div>

          <Badge variant="primary" icon={<Sparkles size={12} />} style={{ marginBottom: '1rem' }}>
            Assessment Record Verified
          </Badge>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
            {stage === 'pre' ? 'Baseline Assessment Recorded!' : 'Post-Assessment Completed!'}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '520px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            {stage === 'pre'
              ? 'Your cognitive baseline has been mapped. The system has diagnosed your TPB constructs and assigned personalized micro-interventions.'
              : 'Outstanding effort! Your post-assessment behavioral delta has been recorded. Review your growth in the dashboard.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', alignItems: 'center', marginBottom: '2.5rem', textAlign: 'left' }}>
            <ThreatGauge score={mean} label="Overall Anti-Bullying Score" size={170} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {scores.map((s) => (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>{s.label}</span>
                    <span style={{ fontWeight: 700, color: s.color, fontFamily: 'var(--font-mono)' }}>
                      {s.value.toFixed(1)} / 100
                    </span>
                  </div>
                  <div className="score-bar-track">
                    <div
                      className="score-bar-fill"
                      style={{ width: `${s.value}%`, background: s.color, boxShadow: `0 2px 6px ${s.color}33` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {result.weak_constructs?.length > 0 && stage === 'pre' && (
            <div className="alert alert-warning" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Vulnerability Focus Areas:</strong> {result.weak_constructs.join(', ')}<br />
                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-primary)' }}>
                  Personalized learning modules have been assigned to your Learning hub to bolster these constructs.
                </span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {stage === 'pre' ? (
              <Button variant="primary" size="lg" onClick={() => navigate('/interventions')} iconRight={<ChevronRight size={18} />}>
                Proceed to Learning Modules
              </Button>
            ) : (
              <Button variant="primary" size="lg" onClick={() => navigate('/dashboard')} iconRight={<ChevronRight size={18} />}>
                View Dashboard Analytics
              </Button>
            )}
            <Button variant="secondary" size="lg" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  const constructInfo = current ? CONSTRUCT_INFO[current.construct] : null;

  return (
    <div className="assessment-container">
      {/* Assessment Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Badge variant="primary">
              {stage === 'pre' ? 'Baseline Pre-Assessment' : 'Post-Intervention Audit'}
            </Badge>
            <span style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Scenario {currentIdx + 1} of {totalQ}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Button
              variant="outline"
              size="sm"
              icon={<ListFilter size={14} />}
              onClick={() => setReviewModalOpen(true)}
            >
              Review ({answeredCount}/{totalQ})
            </Button>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
              {progress}%
            </span>
          </div>
        </div>

        {/* Glowing Progress Bar */}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Scenario Card with Framer Motion Transition */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="scenario-card"
          >
            {/* Scenario Top */}
            <div className="scenario-top">
              <div
                className="scenario-construct-tag"
                style={{
                  color: constructInfo?.color,
                  background: `${constructInfo?.color}15`,
                  border: `1px solid ${constructInfo?.color}30`,
                }}
              >
                {constructInfo?.emoji} {constructInfo?.label}
              </div>
              <p className="scenario-text">{current.scenario_text}</p>
            </div>

            {/* Question + Likert Options */}
            <div className="scenario-bottom">
              <p className="scenario-question">{current.question_text}</p>

              <div className="options-list">
                {current.options
                  .slice()
                  .sort((a, b) => b.score - a.score)
                  .map((opt, idx) => {
                    const selected = answers[current.id] === opt.score;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`option-btn ${selected ? 'selected' : ''}`}
                        onClick={() => selectOption(current.id, opt.score)}
                      >
                        <div className="option-radio" />
                        <span style={{ flex: 1 }}>{opt.option_text}</span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: selected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            fontFamily: 'var(--font-mono)',
                            padding: '0.15rem 0.45rem',
                            borderRadius: 'var(--radius-sm)',
                            background: selected ? 'rgba(26, 86, 50, 0.1)' : 'transparent',
                          }}
                        >
                          Key {idx + 1}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginTop: '1rem',
        }}
      >
        <Button
          variant="secondary"
          onClick={goPrev}
          disabled={currentIdx === 0}
          icon={<ChevronLeft size={16} />}
        >
          Previous
        </Button>

        {/* Quick jump dot navigator */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {scenarios.map((s, i) => {
            const isAnswered = answers[s.id] != null;
            const isCur = i === currentIdx;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentIdx(i)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 'var(--radius-sm)',
                  border: isCur ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  background: isAnswered
                    ? 'var(--color-primary)'
                    : isCur
                    ? 'var(--color-surface-2)'
                    : 'transparent',
                  color: isAnswered ? '#ffffff' : isCur ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  transition: 'var(--transition)',
                }}
                title={`Question ${i + 1} - ${isAnswered ? 'Answered' : 'Unanswered'}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {currentIdx < totalQ - 1 ? (
          <Button variant="primary" onClick={goNext} iconRight={<ChevronRight size={16} />}>
            Next
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={() => setReviewModalOpen(true)}
            disabled={submitting}
            iconRight={<Send size={15} />}
          >
            Review & Submit
          </Button>
        )}
      </div>

      {/* Review Answers Modal */}
      {reviewModalOpen && (
        <div className="content-viewer-overlay" onClick={(e) => e.target === e.currentTarget && setReviewModalOpen(false)}>
          <div className="content-viewer" style={{ maxWidth: '680px' }}>
            <div className="content-viewer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ListFilter size={18} color="var(--color-primary)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Review Answers Summary</h3>
              </div>
              <span className="badge badge-primary">
                {answeredCount} of {totalQ} Answered
              </span>
            </div>

            <div className="content-viewer-body" style={{ maxHeight: '60vh' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {scenarios.map((s, idx) => {
                  const ans = answers[s.id];
                  const hasAnswer = ans != null;
                  return (
                    <div
                      key={s.id}
                      onClick={() => {
                        setCurrentIdx(idx);
                        setReviewModalOpen(false);
                      }}
                      style={{
                        padding: '0.85rem 1rem',
                        background: hasAnswer ? 'var(--color-surface-2)' : 'rgba(239, 68, 68, 0.08)',
                        border: hasAnswer ? '1px solid var(--color-border)' : '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                      className="card-hover"
                    >
                      <div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                          Question {idx + 1} • {s.construct}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', marginTop: 2 }}>
                          {s.scenario_text.slice(0, 75)}...
                        </div>
                      </div>

                      <div>
                        {hasAnswer ? (
                          <span className="badge badge-success">
                            <Check size={12} /> Score: {ans}/5
                          </span>
                        ) : (
                          <span className="badge badge-danger">Unanswered</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="content-viewer-footer">
              <Button variant="secondary" size="sm" onClick={() => setReviewModalOpen(false)}>
                Back to Questions
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                loading={submitting}
                disabled={answeredCount < totalQ}
                iconRight={<Send size={14} />}
              >
                Confirm & Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
