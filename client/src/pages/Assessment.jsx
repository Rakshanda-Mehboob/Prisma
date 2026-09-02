/**
 * pages/Assessment.jsx — Scenario-based assessment flow (pre and post stages).
 * One scenario card at a time, with progress bar and animated transitions.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { assessmentApi } from '../api';
import { ChevronLeft, ChevronRight, Send, CheckCircle2, Lock } from 'lucide-react';

const CONSTRUCT_INFO = {
  Attitude: { label: 'Attitude', color: '#6366f1', emoji: '💭' },
  SubjectiveNorm: { label: 'Subjective Norm', color: '#06b6d4', emoji: '👥' },
  PBC: { label: 'Perceived Behavioral Control', color: '#10b981', emoji: '💪' },
};

export default function Assessment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stage = searchParams.get('stage') || 'pre';

  const [status, setStatus] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { scenarioId: selectedScore }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const statusRes = await assessmentApi.getStatus();
        setStatus(statusRes.data);

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
        setError(err.response?.data?.detail || `Failed to load ${stage}-assessment.`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [stage, navigate]);

  const current = scenarios[currentIdx];
  const totalQ = scenarios.length;
  const answeredCount = Object.keys(answers).length;
  const progress = totalQ > 0 ? (answeredCount / totalQ) * 100 : 0;

  const selectOption = (scenarioId, score) => {
    setAnswers((a) => ({ ...a, [scenarioId]: score }));
  };

  const goNext = () => { if (currentIdx < totalQ - 1) setCurrentIdx((i) => i + 1); };
  const goPrev = () => { if (currentIdx > 0) setCurrentIdx((i) => i - 1); };

  const handleSubmit = async () => {
    if (answeredCount < totalQ) {
      setError(`Please answer all ${totalQ} questions before submitting.`);
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
    } catch (err) {
      setError(err.response?.data?.detail || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  if (error && !scenarios.length) {
    return (
      <div>
        <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 700 }}>
          {stage === 'pre' ? 'Pre' : 'Post'}-Assessment
        </h1>
        <div className="alert alert-danger">{error}</div>
        {stage === 'post' && (
          <div className="empty-state">
            <div className="empty-icon"><Lock size={40} /></div>
            <div className="empty-title">Post-Assessment Locked</div>
            <div className="empty-desc">Complete all assigned learning modules to unlock this stage.</div>
            <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => navigate('/interventions')}>
              Go to Learning Modules
            </button>
          </div>
        )}
      </div>
    );
  }

  if (submitted && result) {
    const scores = [
      { label: 'Attitude', value: result.attitude_score, color: '#6366f1' },
      { label: 'Subjective Norm', value: result.subjective_norm_score, color: '#06b6d4' },
      { label: 'PBC', value: result.pbc_score, color: '#10b981' },
    ];
    return (
      <div>
        <div className="card" style={{ textAlign: 'center', padding: '3rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {stage === 'pre' ? 'Pre' : 'Post'}-Assessment Complete!
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
            {stage === 'pre'
              ? 'Your scores have been recorded. Personalized learning modules have been assigned based on your results.'
              : 'Excellent! Your post-assessment results are saved. Check your dashboard for the full comparison.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
            {scores.map((s) => (
              <div key={s.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{s.label}</span>
                  <span style={{ fontWeight: 700, color: s.color }}>{s.value.toFixed(1)} / 100</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${s.value}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
          {result.weak_constructs?.length > 0 && stage === 'pre' && (
            <div className="alert alert-info" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <strong>Areas for improvement:</strong> {result.weak_constructs.join(', ')}<br/>
              <span style={{ fontSize: '0.82rem' }}>Personalized modules have been assigned in your Learning section.</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {stage === 'pre' && (
              <button className="btn btn-primary" onClick={() => navigate('/interventions')}>
                Go to Learning Modules
              </button>
            )}
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
              View Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const constructInfo = current ? CONSTRUCT_INFO[current.construct] : null;
  const isAnswered = current && answers[current.id] != null;

  return (
    <div>
      {/* Header */}
      <div className="assessment-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-primary">
            {stage === 'pre' ? 'Pre-Assessment' : 'Post-Assessment'}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Question {currentIdx + 1} of {totalQ}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
            {answeredCount} answered
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {current && (
        <div className="scenario-card">
          {/* Scenario Top */}
          <div className="scenario-top">
            <div className="scenario-construct-tag" style={{ color: constructInfo?.color, background: `${constructInfo?.color}20` }}>
              {constructInfo?.emoji} {constructInfo?.label}
            </div>
            <p className="scenario-text">{current.scenario_text}</p>
          </div>

          {/* Question + Options */}
          <div className="scenario-bottom">
            <p className="scenario-question">{current.question_text}</p>
            <div className="options-list">
              {current.options
                .slice()
                .sort((a, b) => b.score - a.score) // show most-positive first
                .map((opt) => {
                  const selected = answers[current.id] === opt.score;
                  return (
                    <button
                      key={opt.id}
                      className={`option-btn ${selected ? 'selected' : ''}`}
                      onClick={() => selectOption(current.id, opt.score)}
                    >
                      <div className="option-radio" />
                      <span>{opt.option_text}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          className="btn btn-secondary"
          onClick={goPrev}
          disabled={currentIdx === 0}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {scenarios.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              style={{
                width: 28, height: 28, borderRadius: '50%', border: 'none',
                cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600,
                background: answers[scenarios[i]?.id] != null
                  ? 'var(--color-primary)'
                  : i === currentIdx ? 'var(--color-surface-2)' : 'transparent',
                color: answers[scenarios[i]?.id] != null
                  ? 'white'
                  : i === currentIdx ? 'var(--color-text)' : 'var(--color-text-subtle)',
                outline: i === currentIdx ? '2px solid var(--color-primary)' : 'none',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {currentIdx < totalQ - 1 ? (
          <button className="btn btn-primary" onClick={goNext}>
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting || answeredCount < totalQ}
          >
            {submitting ? (
              <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Submitting...</>
            ) : (
              <><Send size={15} /> Submit Assessment</>
            )}
          </button>
        )}
      </div>

      {answeredCount < totalQ && currentIdx === totalQ - 1 && (
        <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--color-warning)' }}>
          ⚠ {totalQ - answeredCount} question(s) unanswered. Use the number buttons above to jump back.
        </p>
      )}
    </div>
  );
}
