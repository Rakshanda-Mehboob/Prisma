/**
 * pages/Assessment.jsx — TPB-Based Cyberbullying Behavioral Assessment
 *
 * Implements:
 *   - 4 TPB Constructs: Attitude, Subjective Norm, PBC, Behavioral Intention
 *   - 3 Scenario Blocks × 8 Questions = 24 Diagnostic Items
 *   - Personalized & student-friendly UI with zero exam/survey pressure
 *   - 7-point Likert response scale (1–7)
 *   - Construct-specific feedback and intervention recommendations
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { assessmentApi, authApi } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  ChevronLeft, ChevronRight, Send, Lock,
  AlertTriangle, Sparkles, BookOpen, Trophy,
  ListFilter, Check, Shield, Clock, HeartHandshake,
  Compass, ArrowRight, CheckCircle2, UserCheck,
  MessageSquareQuote, Layers, HelpCircle, RotateCcw,
  BarChart2, CheckCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import ThreatGauge from '../components/cyber/ThreatGauge';

const CONSTRUCT_INFO = {
  Attitude: {
    label: 'Attitude (Harm Evaluation)',
    shortLabel: 'Harm Attitude',
    color: '#0f766e',
    badge: 'primary',
    emoji: '💭',
    description: 'How you evaluate digital actions as harmful, acceptable, or constructive.',
  },
  SubjectiveNorm: {
    label: 'Subjective Norm (Peer Culture)',
    shortLabel: 'Peer Norms',
    color: '#d97706',
    badge: 'warning',
    emoji: '👥',
    description: 'Perceived social expectations and cultural norms among your peers.',
  },
  PBC: {
    label: 'Perceived Control (Intervention)',
    shortLabel: 'Control & Efficacy',
    color: '#7c2d12',
    badge: 'secondary',
    emoji: '💪',
    description: 'Your confidence and perceived capability to intervene or report safely.',
  },
  BehavioralIntention: {
    label: 'Behavioral Intention (Commitment)',
    shortLabel: 'Action Commitment',
    color: '#15803d',
    badge: 'success',
    emoji: '🎯',
    description: 'Your readiness and intention to act prosocially in upcoming interactions.',
  },
};

const SUPPORTIVE_MESSAGES = [
  'Answer based on what you would realistically do in this situation.',
  'There are no right or wrong answers — this is a supportive self-discovery tool.',
  'Everyone experiences online communication and campus culture differently.',
  'Your responses help Prisma personalize your learning modules accurately.',
];

const LIKERT_LABELS = {
  1: 'Strongly Disagree / Completely Inappropriate',
  2: 'Disagree / Mostly Inappropriate',
  3: 'Slightly Disagree / Somewhat Questionable',
  4: 'Neutral / Context Dependent',
  5: 'Slightly Agree / Somewhat Constructive',
  6: 'Agree / Mostly Constructive',
  7: 'Strongly Agree / Highly Constructive & Responsible',
};

export default function Assessment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const stage = searchParams.get('stage') || 'pre';

  const [scenarios, setScenarios] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { scenarioId: score (1-7) }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [studentProfile, setStudentProfile] = useState(null);

  const [assessmentStatus, setAssessmentStatus] = useState(null);
  const [showHub, setShowHub] = useState(false);
  const mode = searchParams.get('mode'); // 'take', 'retake', or null

  // Helper to calculate composite overall score from construct scores
  const calcOverallScore = (assessment) => {
    if (!assessment) return 0;
    return Math.round(
      ((assessment.attitude_score ?? 0) * 0.22) +
      ((assessment.subjective_norm_score ?? 0) * 0.22) +
      ((assessment.pbc_score ?? 0) * 0.28) +
      ((assessment.behavioral_intention_score ?? 0) * 0.28)
    );
  };

  // Load status, profile and scenario items
  const loadAssessmentData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statusRes, profileRes] = await Promise.allSettled([
        assessmentApi.getStatus(),
        authApi.getStudentProfile(),
      ]);

      if (profileRes.status === 'fulfilled') {
        setStudentProfile(profileRes.value.data);
      }

      let statusData = null;
      if (statusRes.status === 'fulfilled') {
        statusData = statusRes.value.data;
        setAssessmentStatus(statusData);
      }

      // Check if user should see the Assessment Overview Hub
      const isPreDone = Boolean(statusData?.pre_completed);
      const isPostDone = Boolean(statusData?.post_completed);

      // Enforce strict one-time assessment rule:
      // If user arrives without explicit mode and has completed pre or both, show the Hub
      if (!mode && (isPreDone || isPostDone)) {
        setShowHub(true);
        setLoading(false);
        return;
      }

      // Pre-assessment is one-time only: if already done, show Hub with scores
      if (stage === 'pre' && isPreDone) {
        setShowHub(true);
        setLoading(false);
        return;
      }

      // Post-assessment is one-time only: if already done, show Hub with scores
      if (stage === 'post' && isPostDone) {
        setShowHub(true);
        setLoading(false);
        return;
      }

      // If trying to take post-assessment but it is locked:
      if (stage === 'post' && !statusData?.post_unlocked) {
        setShowHub(true);
        setLoading(false);
        return;
      }

      // Load scenarios for current stage
      const res = stage === 'pre'
        ? await assessmentApi.getPreScenarios()
        : await assessmentApi.getPostScenarios();

      setScenarios(res.data || []);
      setShowHub(false);
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to load ${stage}-assessment scenarios.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessmentData();
  }, [stage, mode]);

  // Handler for resetting/retaking assessments
  const handleRetake = async (stageToReset = 'all') => {
    if (!window.confirm(`Are you sure you want to retake the ${stageToReset === 'all' ? 'entire' : stageToReset} assessment? Your previous answers will be cleared.`)) {
      return;
    }
    setLoading(true);
    try {
      await assessmentApi.reset(stageToReset);
      setAnswers({});
      setCurrentIdx(0);
      setSubmitted(false);
      setResult(null);
      setHasStarted(false);
      const targetStage = stageToReset === 'post' ? 'post' : 'pre';
      navigate(`/assessment?stage=${targetStage}&mode=retake`);
      await loadAssessmentData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalQ = scenarios.length;
  const current = scenarios[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const progress = totalQ > 0 ? Math.round((answeredCount / totalQ) * 100) : 0;

  // Group scenarios into 3 blocks (8 items per block)
  const blocks = useMemo(() => {
    if (!scenarios.length) return [];
    const grouped = [];
    const blockSize = Math.ceil(scenarios.length / 3) || 8;
    for (let i = 0; i < scenarios.length; i += blockSize) {
      grouped.push(scenarios.slice(i, i + blockSize));
    }
    return grouped;
  }, [scenarios]);

  const currentBlockIndex = Math.floor(currentIdx / 8);
  const questionInBlockIndex = (currentIdx % 8) + 1;

  const selectOption = (scenarioId, score) => {
    setAnswers((prev) => ({ ...prev, [scenarioId]: score }));
  };

  const goNext = () => {
    if (currentIdx < totalQ - 1) setCurrentIdx((i) => i + 1);
  };
  const goPrev = () => {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1);
  };

  // Keyboard navigation support (1-7 keys & arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!hasStarted) return;
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (current && ['1', '2', '3', '4', '5', '6', '7'].includes(e.key)) {
        const scoreNum = parseInt(e.key, 10);
        selectOption(current.id, scoreNum);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx, totalQ, current, hasStarted]);

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
        scenario_id: parseInt(scenario_id, 10),
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

  // ── Assessment Overview Hub (for viewing completed statuses & scores) ────────
  if (showHub && assessmentStatus) {
    const pre = assessmentStatus.pre_assessment;
    const post = assessmentStatus.post_assessment;
    const isPreDone = Boolean(assessmentStatus.pre_completed);
    const isPostDone = Boolean(assessmentStatus.post_completed);
    const isPostUnlocked = Boolean(assessmentStatus.post_unlocked);

    const preOverall = calcOverallScore(pre);
    const postOverall = calcOverallScore(post);

    const constructDefs = [
      { key: 'attitude_score', label: 'Harm Attitude', color: CONSTRUCT_INFO.Attitude.color, emoji: '💭' },
      { key: 'subjective_norm_score', label: 'Peer Norms', color: CONSTRUCT_INFO.SubjectiveNorm.color, emoji: '👥' },
      { key: 'pbc_score', label: 'Control & Efficacy', color: CONSTRUCT_INFO.PBC.color, emoji: '💪' },
      { key: 'behavioral_intention_score', label: 'Action Commitment', color: CONSTRUCT_INFO.BehavioralIntention.color, emoji: '🎯' },
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        {/* Hub Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <Badge variant="primary" icon={<Sparkles size={12} />}>
                TPB Assessment Hub
              </Badge>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                Theory of Planned Behavior Model
              </span>
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 0.5rem' }}>
              Digital Interaction Assessment
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', margin: 0, maxWidth: '640px' }}>
              Review your baseline diagnostic metrics, track your behavioral growth across intervention modules, or retake assessments to recalibrate.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              size="sm"
              icon={<BarChart2 size={14} />}
              onClick={() => navigate('/dashboard')}
            >
              View Analytics
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<BookOpen size={14} />}
              onClick={() => navigate('/interventions')}
            >
              Go to Learning Modules
            </Button>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* Both Assessment Stage Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {/* 1. Baseline Pre-Assessment Card */}
          <Card glow={isPreDone ? 'cyan' : 'default'} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                    Baseline Assessment
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Pre-Intervention Diagnostic</span>
                </div>
              </div>
              {isPreDone ? (
                <Badge variant="success" icon={<CheckCircle2 size={12} />}>
                  Completed
                </Badge>
              ) : (
                <Badge variant="warning">Not Started</Badge>
              )}
            </div>

            {isPreDone && pre ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Composite TPB Score</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                      {preOverall} <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>/ 100</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                    Taken on<br />
                    <strong>{new Date(pre.submitted_at).toLocaleDateString()}</strong>
                  </div>
                </div>

                {/* Construct breakdown bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {constructDefs.map((c) => {
                    const val = pre[c.key] ?? 0;
                    return (
                      <div key={c.key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                          <span style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span>{c.emoji}</span>
                            <span>{c.label}</span>
                          </span>
                          <span style={{ fontWeight: 700, color: c.color, fontFamily: 'var(--font-mono)' }}>
                            {val.toFixed(1)}%
                          </span>
                        </div>
                        <div className="score-bar-track">
                          <div className="score-bar-fill" style={{ width: `${val}%`, background: c.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--color-primary)', background: 'var(--color-primary-subtle)', padding: '0.65rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontWeight: 600 }}>
                  <CheckCircle2 size={16} /> Baseline Recorded • One-Time Diagnostic Complete
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem 1rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Take this 24-question diagnostic to map your attitudes, peer norms, confidence, and action intentions.
                </p>
                <Button
                  variant="primary"
                  iconRight={<ArrowRight size={16} />}
                  onClick={() => {
                    setShowHub(false);
                    navigate('/assessment?stage=pre&mode=take');
                  }}
                >
                  Start Baseline Assessment
                </Button>
              </div>
            )}
          </Card>

          {/* 2. Post-Intervention Assessment Card */}
          <Card glow={isPostDone ? 'success' : isPostUnlocked ? 'primary' : 'default'} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: isPostDone ? 'rgba(5, 150, 105, 0.1)' : 'rgba(8, 145, 178, 0.1)', color: isPostDone ? 'var(--color-success)' : 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trophy size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                    Post-Intervention Review
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Outcome Audit & Growth Delta</span>
                </div>
              </div>
              {isPostDone ? (
                <Badge variant="success" icon={<CheckCircle2 size={12} />}>
                  Completed
                </Badge>
              ) : isPostUnlocked ? (
                <Badge variant="primary" icon={<Sparkles size={12} />}>
                  Ready to Take
                </Badge>
              ) : (
                <Badge variant="secondary" icon={<Lock size={12} />}>
                  Locked
                </Badge>
              )}
            </div>

            {isPostDone && post ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Post-Audit Score</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>
                      {postOverall} <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>/ 100</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Growth Delta</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: postOverall >= preOverall ? 'var(--color-success)' : 'var(--color-warning)' }}>
                      {postOverall >= preOverall ? `+${(postOverall - preOverall).toFixed(1)} pts` : `${(postOverall - preOverall).toFixed(1)} pts`}
                    </div>
                  </div>
                </div>

                {/* Construct breakdown bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {constructDefs.map((c) => {
                    const val = post[c.key] ?? 0;
                    return (
                      <div key={c.key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                          <span style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span>{c.emoji}</span>
                            <span>{c.label}</span>
                          </span>
                          <span style={{ fontWeight: 700, color: c.color, fontFamily: 'var(--font-mono)' }}>
                            {val.toFixed(1)}%
                          </span>
                        </div>
                        <div className="score-bar-track">
                          <div className="score-bar-fill" style={{ width: `${val}%`, background: c.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--color-success)', background: 'var(--color-success-glow)', padding: '0.65rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontWeight: 600 }}>
                  <CheckCircle2 size={16} /> Post-Intervention Audit Complete • Final Evaluation Saved
                </div>
              </div>
            ) : isPostUnlocked ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem 1rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  You have completed all assigned learning modules! Take the post-assessment to measure your growth and update your profile badges.
                </p>
                <Button
                  variant="primary"
                  iconRight={<ArrowRight size={16} />}
                  onClick={() => {
                    setShowHub(false);
                    navigate('/assessment?stage=post&mode=take');
                  }}
                >
                  Start Post-Assessment
                </Button>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Lock size={22} />
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                  Post-Assessment Locked
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Complete your assigned learning modules in the Learning Hub to unlock your post-assessment review.
                </p>
                <Button
                  variant="secondary"
                  icon={<BookOpen size={16} />}
                  onClick={() => navigate('/interventions')}
                >
                  Go to Learning Modules
                </Button>
              </div>
            )}
          </Card>
        </div>
      </motion.div>
    );
  }

  // ── Welcome / Introduction Screen ──────────────────────────────────────────
  if (!hasStarted && !submitted) {
    const degreeName = studentProfile?.degree_program || user?.department || 'Academic';
    const platformsList = studentProfile?.platforms_used?.slice(0, 3).join(', ') || 'WhatsApp & campus networks';

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ maxWidth: '860px', margin: '0 auto' }}
      >
        <Card glow="primary" style={{ padding: '3rem 2.5rem', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <Badge variant="primary" icon={<Sparkles size={12} />}>
              {stage === 'pre' ? 'Baseline Assessment' : 'Post-Intervention Review'}
            </Badge>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Theory of Planned Behavior Model
            </span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.25, marginBottom: '1rem' }}>
            Welcome to Prisma's Digital Interaction Assessment
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '720px' }}>
            This short activity helps us understand how students respond to different online situations.
            There are <strong>no right or wrong answers</strong>, and this is not a test. Your honest responses help Prisma provide personalized guidance and tailored micro-interventions.
          </p>

          {/* Contextual personalization teaser */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.06), rgba(8, 145, 178, 0.04))',
              border: '1px solid rgba(79, 70, 229, 0.15)',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
            }}
          >
            <Compass size={22} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                Contextually Personalized Scenarios
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
                Your scenarios reflect realistic interactions in {degreeName} group chats, project collaborations, and digital spaces like {platformsList}.
              </p>
            </div>
          </div>

          {/* Info grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2.5rem',
            }}
          >
            <div style={{ padding: '1rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', marginBottom: '0.35rem' }}>
                <Clock size={16} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Time Commitment</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                ~7–10 minutes (3 scenario blocks, 24 questions)
              </p>
            </div>

            <div style={{ padding: '1rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-secondary)', marginBottom: '0.35rem' }}>
                <Layers size={16} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>4 TPB Constructs</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Attitude, Norms, Control & Action Intention
              </p>
            </div>

            <div style={{ padding: '1rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', marginBottom: '0.35rem' }}>
                <Shield size={16} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Privacy Reassurance</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                100% confidential & used exclusively for guidance
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setHasStarted(true)}
              iconRight={<ArrowRight size={18} />}
            >
              Begin Assessment
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  // ── Submitted / Results Celebration Screen ──────────────────────────────────
  if (submitted && result) {
    const scores = [
      {
        key: 'Attitude',
        label: 'Harm Attitude',
        value: result.attitude_score,
        color: CONSTRUCT_INFO.Attitude.color,
        description: 'Recognition of digital harm and moral accountability.',
      },
      {
        key: 'SubjectiveNorm',
        label: 'Subjective Norms',
        value: result.subjective_norm_score,
        color: CONSTRUCT_INFO.SubjectiveNorm.color,
        description: 'Perceived positive peer culture and standing up against bullying.',
      },
      {
        key: 'PBC',
        label: 'Perceived Control',
        value: result.pbc_score,
        color: CONSTRUCT_INFO.PBC.color,
        description: 'Confidence in reporting, resolving conflict, and using safe tools.',
      },
      {
        key: 'BehavioralIntention',
        label: 'Behavioral Intention',
        value: result.behavioral_intention_score,
        color: CONSTRUCT_INFO.BehavioralIntention.color,
        description: 'Readiness and commitment to act prosocially in future moments.',
      },
    ];

    const overallScore = result.overall_score ?? Math.round(
      (result.attitude_score * 0.22) +
      (result.subjective_norm_score * 0.22) +
      (result.pbc_score * 0.28) +
      (result.behavioral_intention_score * 0.28)
    );

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        style={{ maxWidth: '860px', margin: '0 auto' }}
      >
        <Card glow="primary" style={{ textAlign: 'center', padding: '3.5rem 2.5rem', position: 'relative' }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              margin: '0 auto 1.5rem',
              boxShadow: '0 8px 24px var(--color-primary-glow)',
            }}
          >
            <Trophy size={38} />
          </div>

          <Badge variant="primary" icon={<Sparkles size={12} />} style={{ marginBottom: '1rem' }}>
            Assessment Record Verified
          </Badge>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
            {stage === 'pre' ? 'Baseline Assessment Completed!' : 'Post-Intervention Audit Complete!'}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '580px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            {stage === 'pre'
              ? 'Your behavioral decision-making baseline has been mapped across all four TPB dimensions. Prisma has synthesized personalized guidance for you.'
              : 'Outstanding effort! Your post-assessment behavioral delta has been recorded. Check out your growth and updated profile metrics.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', alignItems: 'center', marginBottom: '2.5rem', textAlign: 'left' }}>
            <ThreatGauge score={overallScore} label="Composite TPB Anti-Bullying Index" size={180} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {scores.map((s) => (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{s.label}</span>
                    <span style={{ fontWeight: 700, color: s.color, fontFamily: 'var(--font-mono)' }}>
                      {(s.value ?? 0).toFixed(1)} / 100
                    </span>
                  </div>
                  <div className="score-bar-track">
                    <div
                      className="score-bar-fill"
                      style={{ width: `${s.value ?? 0}%`, background: s.color, boxShadow: `0 2px 8px ${s.color}33` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supportive constructive focus note */}
          {result.weak_constructs?.length > 0 && stage === 'pre' && (
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(79, 70, 229, 0.06)',
                border: '1px solid rgba(79, 70, 229, 0.2)',
                textAlign: 'left',
                marginBottom: '2.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '0.35rem' }}>
                <HeartHandshake size={18} />
                <span>Personalized Guidance & Growth Focus</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', lineHeight: 1.6, margin: 0 }}>
                Prisma identified areas where additional support could help you handle online situations more confidently:{' '}
                <strong>{result.weak_constructs.map((c) => CONSTRUCT_INFO[c]?.shortLabel || c).join(', ')}</strong>.
                Tailored micro-learning modules have been added to your Learning hub to bolster these skills.
              </p>
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

  // ── Active Assessment Question View ─────────────────────────────────────────
  const constructInfo = current ? (CONSTRUCT_INFO[current.construct] || CONSTRUCT_INFO.Attitude) : CONSTRUCT_INFO.Attitude;
  const supportiveMessage = SUPPORTIVE_MESSAGES[currentIdx % SUPPORTIVE_MESSAGES.length];

  return (
    <div className="assessment-container">
      {/* Assessment Top Banner */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Badge variant="primary">
              {stage === 'pre' ? 'Baseline Pre-Assessment' : 'Post-Intervention Audit'}
            </Badge>
            <span style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Scenario Block {currentBlockIndex + 1} of 3 • Question {currentIdx + 1} of {totalQ}
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

      {error && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Encouragement Hint */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.6rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)',
          marginBottom: '1.25rem',
        }}
      >
        <HelpCircle size={15} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
        <span>{supportiveMessage}</span>
      </div>

      {/* Scenario Card with Framer Motion Transition */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
            className="scenario-card"
          >
            {/* Scenario Top */}
            <div className="scenario-top">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div
                  className="scenario-construct-tag"
                  style={{
                    color: constructInfo.color,
                    background: `${constructInfo.color}15`,
                    border: `1px solid ${constructInfo.color}30`,
                  }}
                >
                  {constructInfo.emoji} {constructInfo.label}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  Block {currentBlockIndex + 1} • Item {questionInBlockIndex} of 8
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <MessageSquareQuote size={20} style={{ color: 'var(--color-primary)', marginTop: '3px', flexShrink: 0 }} />
                <p className="scenario-text" style={{ fontSize: '1.02rem', lineHeight: 1.65, margin: 0 }}>
                  {current.scenario_text}
                </p>
              </div>
            </div>

            {/* Question + 7-Point Likert Options */}
            <div className="scenario-bottom">
              <p className="scenario-question" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '1.25rem' }}>
                {current.question_text}
              </p>

              <div className="options-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {current.options && current.options.length > 0 ? (
                  current.options
                    .slice()
                    .sort((a, b) => b.score - a.score)
                    .map((opt) => {
                      const selected = answers[current.id] === opt.score;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          className={`option-btn ${selected ? 'selected' : ''}`}
                          onClick={() => selectOption(current.id, opt.score)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.85rem',
                            textAlign: 'left',
                            padding: '0.85rem 1.15rem',
                            border: selected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                            background: selected ? 'var(--color-surface-2)' : 'var(--color-surface)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            transition: 'var(--transition)',
                          }}
                        >
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              border: selected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                              background: selected ? 'var(--color-primary)' : 'transparent',
                              color: selected ? '#ffffff' : 'var(--color-text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              fontFamily: 'var(--font-mono)',
                              flexShrink: 0,
                            }}
                          >
                            {opt.score}
                          </div>
                          <span style={{ flex: 1, fontSize: '0.92rem', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                            {opt.option_text}
                          </span>
                        </button>
                      );
                    })
                ) : (
                  // Fallback standard 7-point scale if options array is empty
                  [7, 6, 5, 4, 3, 2, 1].map((scoreNum) => {
                    const selected = answers[current.id] === scoreNum;
                    return (
                      <button
                        key={scoreNum}
                        type="button"
                        className={`option-btn ${selected ? 'selected' : ''}`}
                        onClick={() => selectOption(current.id, scoreNum)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.85rem',
                          textAlign: 'left',
                          padding: '0.85rem 1.15rem',
                        }}
                      >
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            border: selected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                            background: selected ? 'var(--color-primary)' : 'transparent',
                            color: selected ? '#ffffff' : 'var(--color-text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {scoreNum}
                        </div>
                        <span style={{ flex: 1, fontSize: '0.92rem' }}>
                          {LIKERT_LABELS[scoreNum]}
                        </span>
                      </button>
                    );
                  })
                )}
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
          marginTop: '1.25rem',
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

        {/* Jump matrix grouped into 3 blocks */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
          {blocks.map((block, bIdx) => (
            <div
              key={bIdx}
              style={{
                display: 'flex',
                gap: '0.25rem',
                padding: '0.25rem 0.35rem',
                borderRadius: 'var(--radius-md)',
                background: bIdx === currentBlockIndex ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                border: bIdx === currentBlockIndex ? '1px solid rgba(79, 70, 229, 0.2)' : '1px solid transparent',
              }}
            >
              {block.map((s, itemIdx) => {
                const globalIndex = bIdx * 8 + itemIdx;
                const isAnswered = answers[s.id] != null;
                const isCur = globalIndex === currentIdx;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCurrentIdx(globalIndex)}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 'var(--radius-sm)',
                      border: isCur ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      cursor: 'pointer',
                      fontSize: '0.72rem',
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
                    title={`Question ${globalIndex + 1} (${s.construct}) - ${isAnswered ? 'Answered' : 'Unanswered'}`}
                  >
                    {globalIndex + 1}
                  </button>
                );
              })}
            </div>
          ))}
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
          <div className="content-viewer" style={{ maxWidth: '720px' }}>
            <div className="content-viewer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ListFilter size={18} color="var(--color-primary)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Review Diagnostic Answers</h3>
              </div>
              <span className="badge badge-primary">
                {answeredCount} of {totalQ} Answered
              </span>
            </div>

            <div className="content-viewer-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {scenarios.map((s, idx) => {
                  const ans = answers[s.id];
                  const hasAnswer = ans != null;
                  const cInfo = CONSTRUCT_INFO[s.construct] || CONSTRUCT_INFO.Attitude;

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
                      <div style={{ paddingRight: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: cInfo.color, fontWeight: 600 }}>
                          <span>{cInfo.emoji}</span>
                          <span>Question {idx + 1} • {cInfo.shortLabel}</span>
                        </div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--color-text-primary)', marginTop: 3 }}>
                          {s.question_text || s.scenario_text?.slice(0, 80) + '...'}
                        </div>
                      </div>

                      <div style={{ flexShrink: 0 }}>
                        {hasAnswer ? (
                          <span className="badge badge-success">
                            <Check size={12} /> Score: {ans}/7
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
