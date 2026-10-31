/**
 * pages/Assessment.jsx — Scenario-Based Assessment Module (v2.0)
 *
 * Implements:
 *   - Exactly 3 profile-tailored digital situations
 *   - Multiple questions grouped under each situation (~6 items per scenario)
 *   - Zero internal research labels exposed to students (no TPB/construct/item codes)
 *   - Clean multi-situation flow with stepper, scenario context, and grouped questions
 *   - Full backward compatibility with the Dashboard scoring and Assessment Hub
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { assessmentApi, authApi } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  ChevronLeft, ChevronRight, Send, Lock,
  Sparkles, BookOpen,
  Check, Clock, ArrowRight, CheckCircle2,
  MessageSquareQuote, HelpCircle,
  Shield, Users, HeartHandshake,
  CheckCircle, AlertCircle, Target
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';

// ── The Four TPB Constructs ──────────────────────────────────────────────────
const TPB_CONSTRUCTS = [
  {
    key: 'attitude_score',
    id: 'Attitude',
    label: 'Attitude',
    subLabel: 'Empathy & Digital Awareness',
    icon: HeartHandshake,
    getSimpleSummary: (score) => {
      if (score >= 75) return "You easily recognize how online words impact others' emotions.";
      if (score >= 50) return "You recognize digital harm and can spot subtle teasing.";
      return "Practice noticing how online comments affect friends emotionally.";
    },
  },
  {
    key: 'subjective_norm_score',
    id: 'SubjectiveNorm',
    label: 'Peer Influence',
    subLabel: 'Social Standards & Norms',
    icon: Users,
    getSimpleSummary: (score) => {
      if (score >= 75) return "You value respectful communities and encourage positive peers.";
      if (score >= 50) return "You notice social pressure and are building confidence to speak up.";
      return "Learn how your voice can set a positive tone in group chats.";
    },
  },
  {
    key: 'pbc_score',
    id: 'PBC',
    label: 'Action Confidence',
    subLabel: 'Safety Tools & Control',
    icon: Shield,
    getSimpleSummary: (score) => {
      if (score >= 75) return "You feel confident using reporting tools and knowing how to respond.";
      if (score >= 50) return "You know basic safety tools and can practice using them more often.";
      return "Explore practical safety tools to handle online situations safely.";
    },
  },
  {
    key: 'behavioral_intention_score',
    id: 'BehavioralIntention',
    label: 'Action Intention',
    subLabel: 'Willingness to Support Peers',
    icon: Target,
    getSimpleSummary: (score) => {
      if (score >= 75) return "You are ready to step in and support peers when issues happen.";
      if (score >= 50) return "You want to help; having a simple plan makes taking action easier.";
      return "Practice small, safe bystander steps like checking in on friends.";
    },
  },
];

// ── Simplified, Clean Modern SaaS Assessment Results View ──────────────────
function AssessmentResultsView({
  stage = 'pre',
  activeScores,
  preAssessment = null,
  postAssessment = null,
  isPostDone = false,
  isPostUnlocked = false,
  isJustSubmitted = false,
  onContinue,
  onRetake: _onRetake,
  onStartPost,
}) {
  const overall = activeScores.overall_score ?? Math.round(
    ((activeScores.attitude_score ?? 0) * 0.22) +
    ((activeScores.subjective_norm_score ?? 0) * 0.22) +
    ((activeScores.pbc_score ?? 0) * 0.28) +
    ((activeScores.behavioral_intention_score ?? 0) * 0.28)
  );

  const items = TPB_CONSTRUCTS.map((c) => {
    const rawVal = activeScores[c.key] ?? 0;
    const val = Math.round(rawVal);
    const preVal = preAssessment ? Math.round(preAssessment[c.key] ?? 0) : null;
    const postVal = postAssessment ? Math.round(postAssessment[c.key] ?? 0) : null;
    return {
      ...c,
      score: val,
      preScore: preVal,
      postScore: postVal,
      summary: c.getSimpleSummary(val),
    };
  });

  let strongest = items[0];
  let focusArea = items[0];
  items.forEach((item) => {
    if (item.score > strongest.score) strongest = item;
    if (item.score < focusArea.score) focusArea = item;
  });

  const getRiskAndReadiness = (score) => {
    if (score >= 75) {
      return {
        rating: 'Strong Readiness',
        risk: 'High Readiness • Low Risk',
        simpleSummary: 'You have strong digital awareness and are well prepared to support peers online.',
      };
    }
    if (score >= 50) {
      return {
        rating: 'Moderate Readiness',
        risk: 'Moderate Readiness',
        simpleSummary: 'You have a solid foundation with practical skills to develop in your learning modules.',
      };
    }
    return {
      rating: 'Building Readiness',
      risk: 'Foundational Readiness',
      simpleSummary: 'Your upcoming modules will guide you with simple ways to handle difficult online situations.',
    };
  };

  const statusInfo = getRiskAndReadiness(overall);

  const hasBothAssessments = Boolean(preAssessment && postAssessment);
  const preOverall = preAssessment ? Math.round(
    ((preAssessment.attitude_score ?? 0) * 0.22) +
    ((preAssessment.subjective_norm_score ?? 0) * 0.22) +
    ((preAssessment.pbc_score ?? 0) * 0.28) +
    ((preAssessment.behavioral_intention_score ?? 0) * 0.28)
  ) : null;
  const postOverall = postAssessment ? Math.round(
    ((postAssessment.attitude_score ?? 0) * 0.22) +
    ((postAssessment.subjective_norm_score ?? 0) * 0.22) +
    ((postAssessment.pbc_score ?? 0) * 0.28) +
    ((postAssessment.behavioral_intention_score ?? 0) * 0.28)
  ) : null;
  const growthDelta = hasBothAssessments ? postOverall - preOverall : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="results-page-layout"
    >
      {/* ── TOP SECTION: Assessment Completed & Overall Score ── */}
      <div className="results-hero-card">
        <div className="results-hero-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <Badge variant="primary">
                {stage === 'post' || postAssessment ? 'Post-Learning Review' : 'Baseline Assessment'}
              </Badge>
              <Badge variant="success">
                <CheckCircle2 size={13} /> Assessment Completed
              </Badge>
              {isJustSubmitted && (
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Just now
                </span>
              )}
            </div>
            <h1 className="results-hero-title">Your Assessment Summary</h1>
            <p className="results-hero-subtitle">
              A quick, student-friendly breakdown of your digital awareness and bystander readiness.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              variant="primary"
              size="sm"
              iconRight={<ArrowRight size={14} />}
              onClick={onContinue}
            >
              {stage === 'post' || postAssessment || isPostDone ? 'Go to Dashboard' : 'Continue to Learning'}
            </Button>
          </div>
        </div>

        {/* Central Overall Score Display */}
        <div className="results-hero-score-row">
          <div className="results-hero-score-badge">
            <span className="results-hero-score-num">{overall}%</span>
            <span className="results-hero-score-label">Score</span>
          </div>

          <div className="results-hero-score-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h2 className="results-hero-readiness">{statusInfo.rating}</h2>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  background: overall >= 75 ? 'rgba(5, 150, 105, 0.1)' : 'rgba(79, 70, 229, 0.08)',
                  color: overall >= 75 ? 'var(--color-success)' : 'var(--color-primary)',
                }}
              >
                {statusInfo.risk}
              </span>
            </div>
            <p className="results-hero-interpretation">
              {hasBothAssessments
                ? `You demonstrated an overall growth of ${growthDelta >= 0 ? `+${growthDelta}%` : `${growthDelta}%`} across your learning modules.`
                : statusInfo.simpleSummary}
            </p>
          </div>
        </div>

        {/* Concise Key Takeaway Chips */}
        <div className="results-hero-chips">
          <div className="results-hero-chip">
            <span style={{ color: 'var(--color-text-muted)' }}>Strongest:</span>
            <strong style={{ color: 'var(--color-text-primary)' }}>{strongest.label} ({strongest.score}%)</strong>
          </div>
          <div className="results-hero-chip">
            <span style={{ color: 'var(--color-text-muted)' }}>Focus Area:</span>
            <strong style={{ color: 'var(--color-text-primary)' }}>{focusArea.label} ({focusArea.score}%)</strong>
          </div>
          {hasBothAssessments && (
            <div className="results-hero-chip">
              <span style={{ color: 'var(--color-text-muted)' }}>Progress:</span>
              <strong style={{ color: growthDelta >= 0 ? 'var(--color-success)' : 'var(--color-text-primary)' }}>
                {growthDelta >= 0 ? `+${growthDelta}%` : `${growthDelta}%`}
              </strong>
            </div>
          )}
        </div>

        {/* Post-assessment unlocked notification banner */}
        {isPostUnlocked && !isPostDone && (
          <div
            style={{
              padding: '0.85rem 1.15rem',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ fontSize: '0.86rem', color: 'var(--color-text-primary)' }}>
              <strong>Post-Assessment Unlocked:</strong> Test your skills after finishing your assigned modules.
            </div>
            <Button variant="primary" size="sm" onClick={onStartPost} iconRight={<ArrowRight size={14} />}>
              Start Post-Assessment
            </Button>
          </div>
        )}
      </div>

      {/* ── MIDDLE SECTION: 4 Key Insights in a Spacious 2x2 Grid ── */}
      <div>
        <div className="results-section-header">
          <h3 className="results-section-title">Key Behavioral Insights</h3>
          <p className="results-section-desc">
            Your readiness score across the four core digital bystander dimensions.
          </p>
        </div>

        <div className="results-tpb-grid">
          {items.map((item) => {
            const Icon = item.icon;
            const isHighest = item.id === strongest.id;
            const isLowest = item.id === focusArea.id && item.score < 75;

            return (
              <div key={item.id} className="results-tpb-card">
                <div>
                  <div className="results-card-top">
                    <div className="results-card-label-group">
                      <span className="results-card-icon"><Icon size={16} /></span>
                      <span className="results-card-title">{item.label}</span>
                    </div>

                    {isHighest ? (
                      <span className="results-card-status-badge strong">Top Strength</span>
                    ) : isLowest ? (
                      <span className="results-card-status-badge focus">Focus Area</span>
                    ) : (
                      <span className="results-card-status-badge neutral">
                        {item.score >= 75 ? 'Strong' : 'Moderate'}
                      </span>
                    )}
                  </div>

                  <div className="results-card-score-row">
                    <span className="results-card-score">{item.score}%</span>
                    <span className="results-card-level">
                      {item.score >= 75 ? 'Proficient' : item.score >= 50 ? 'Developing' : 'Foundational'}
                    </span>
                  </div>

                  <div className="results-bar-track">
                    <div
                      className="results-bar-fill"
                      style={{
                        width: `${item.score}%`,
                        background: item.score >= 75 ? 'var(--color-success)' : 'var(--color-primary)',
                      }}
                    />
                  </div>
                </div>

                <p className="results-card-summary">{item.summary}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BOTTOM SECTION: Short Recommendations & Action CTA ── */}
      <div className="results-bottom-card">
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 0.2rem' }}>
            Recommended Next Steps
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Simple, practical guidance based on your results.
          </p>
        </div>

        <div className="results-actions-grid">
          <div className="results-action-item">
            <div className="results-action-icon">
              <BookOpen size={17} />
            </div>
            <div className="results-action-content">
              <span className="results-action-title">Targeted Learning Module</span>
              <p className="results-action-desc">
                Start with your recommended <strong>{focusArea.label}</strong> module to build safe bystander skills.
              </p>
            </div>
          </div>

          <div className="results-action-item">
            <div className="results-action-icon">
              <Shield size={17} />
            </div>
            <div className="results-action-content">
              <span className="results-action-title">Everyday Peer Support</span>
              <p className="results-action-desc">
                Pause before commenting and reach out privately to check on friends when negativity happens.
              </p>
            </div>
          </div>
        </div>

        <div className="results-cta-bar">
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
              {stage === 'post' || postAssessment || isPostDone
                ? 'Ready to review your dashboard progress?'
                : 'Ready to start your personalized modules?'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Modules are short, interactive, and self-paced.
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            iconRight={<ArrowRight size={16} />}
            onClick={onContinue}
          >
            {stage === 'post' || postAssessment || isPostDone ? 'Return to Dashboard' : 'Continue to Learning Module'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

const SCENARIO_THEMES = [
  { label: 'Situation 1', title: 'Social Media Feed Interaction', icon: Users },
  { label: 'Situation 2', title: 'Private Group Communication', icon: MessageSquareQuote },
  { label: 'Situation 3', title: 'Campus & Community Forum', icon: Shield },
];

export default function Assessment() {
  const navigate = useNavigate();
  const { user: _user } = useAuth();
  const [searchParams] = useSearchParams();
  const stage = searchParams.get('stage') || 'pre';
  const mode = searchParams.get('mode'); // 'take', 'retake', or null

  const [assessmentInstance, setAssessmentInstance] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedScore }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [questionErrors, setQuestionErrors] = useState({}); // { [questionId]: errorMsg }
  const [hasStarted, setHasStarted] = useState(false);
  const [_studentProfile, setStudentProfile] = useState(null);

  const [assessmentStatus, setAssessmentStatus] = useState(null);
  const [showHub, setShowHub] = useState(false);

  // Helper to calculate composite score
  const calcOverallScore = (assessment) => {
    if (!assessment) return 0;
    return Math.round(
      ((assessment.attitude_score ?? 0) * 0.22) +
      ((assessment.subjective_norm_score ?? 0) * 0.22) +
      ((assessment.pbc_score ?? 0) * 0.28) +
      ((assessment.behavioral_intention_score ?? 0) * 0.28)
    );
  };

  // Flattened list of all questions across all 3 scenarios
  const allQuestions = useMemo(() => {
    const list = [];
    scenarios.forEach((sc, scIdx) => {
      (sc.questions || []).forEach((q, qIdx) => {
        list.push({
          ...q,
          scenarioId: sc.id,
          scenarioIndex: scIdx,
          scenarioText: sc.scenario_text,
          inScenarioQuestionNumber: qIdx + 1,
        });
      });
    });
    return list;
  }, [scenarios]);

  const totalQuestionsCount = allQuestions.length;
  const answeredQuestionsCount = Object.keys(answers).length;
  const progressPercent = totalQuestionsCount > 0
    ? Math.round((answeredQuestionsCount / totalQuestionsCount) * 100)
    : 0;

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

      const isPreDone = Boolean(statusData?.pre_completed);
      const isPostDone = Boolean(statusData?.post_completed);
      const isPostUnlocked = Boolean(statusData?.post_unlocked);

      // Explicit results view request
      if (mode === 'results') {
        setShowHub(true);
        setLoading(false);
        return;
      }

      // Determine active target stage
      const requestedStage = stage === 'post' ? 'post' : 'pre';

      // ── POST Assessment Flow ──
      if (requestedStage === 'post') {
        // If already completed and not in retake mode, display post results
        if (isPostDone && mode !== 'retake') {
          setShowHub(true);
          setLoading(false);
          return;
        }

        // If pre-assessment is not completed yet
        if (!isPreDone) {
          setError('Please complete your baseline assessment first.');
          setShowHub(false);
          setLoading(false);
          return;
        }

        // Load POST scenarios
        const res = await assessmentApi.getPostScenarios();
        const instanceData = res.data;
        setAssessmentInstance(instanceData);
        setScenarios(instanceData?.scenarios || (Array.isArray(instanceData) ? instanceData : []));
        setShowHub(false);
        setSubmitted(false);
        setResult(null);
        if (mode === 'take') {
          setHasStarted(true);
        }
        setLoading(false);
        return;
      }

      // ── PRE Assessment Flow ──
      if (requestedStage === 'pre') {
        // If already completed and not in retake mode, display pre results
        if (isPreDone && mode !== 'retake') {
          setShowHub(true);
          setLoading(false);
          return;
        }

        // Load PRE scenarios
        const res = await assessmentApi.getPreScenarios();
        const instanceData = res.data;
        setAssessmentInstance(instanceData);
        setScenarios(instanceData?.scenarios || (Array.isArray(instanceData) ? instanceData : []));
        setShowHub(false);
        setSubmitted(false);
        setResult(null);
        if (mode === 'take') {
          setHasStarted(true);
        }
        setLoading(false);
        return;
      }
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to load ${stage}-assessment scenarios.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessmentData();
  }, [stage, mode]);

  // Retake handler
  const handleRetake = async (stageToReset = 'all') => {
    if (!window.confirm(`Are you sure you want to retake the ${stageToReset === 'all' ? 'entire' : stageToReset} assessment? Your previous responses will be refreshed.`)) {
      return;
    }
    setLoading(true);
    try {
      await assessmentApi.reset(stageToReset);
      setAnswers({});
      setCurrentScenarioIdx(0);
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

  const handleSelectOption = (questionId, score) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: score,
    }));
    // Disappear inline error automatically once answered
    setQuestionErrors((prev) => {
      if (!prev[questionId]) return prev;
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const currentScenario = scenarios[currentScenarioIdx];
  const currentScenarioQuestions = currentScenario?.questions || [];
  const currentScenarioAnsweredCount = currentScenarioQuestions.filter(
    (q) => answers[q.id] != null
  ).length;
  const isCurrentScenarioComplete =
    currentScenarioQuestions.length > 0 &&
    currentScenarioAnsweredCount === currentScenarioQuestions.length;

  const handleNextScenario = () => {
    // Validate each question individually in the current situation
    const unanswered = currentScenarioQuestions.filter((q) => answers[q.id] == null);
    if (unanswered.length > 0) {
      const newErrors = {};
      unanswered.forEach((q) => {
        newErrors[q.id] = 'Please select an answer before continuing.';
      });
      setQuestionErrors((prev) => ({ ...prev, ...newErrors }));

      // Automatically scroll smoothly to the first unanswered question
      const firstUnanswered = unanswered[0];
      setTimeout(() => {
        const el = document.getElementById(`question-${firstUnanswered.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const firstOptionBtn = el.querySelector('button');
          if (firstOptionBtn) firstOptionBtn.focus();
        }
      }, 50);
      return;
    }

    if (currentScenarioIdx < scenarios.length - 1) {
      setCurrentScenarioIdx((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevScenario = () => {
    if (currentScenarioIdx > 0) {
      setCurrentScenarioIdx((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    // 1. Check current situation questions
    const unansweredInCurrent = currentScenarioQuestions.filter((q) => answers[q.id] == null);
    if (unansweredInCurrent.length > 0) {
      const newErrors = {};
      unansweredInCurrent.forEach((q) => {
        newErrors[q.id] = 'Please select an answer before continuing.';
      });
      setQuestionErrors((prev) => ({ ...prev, ...newErrors }));

      const firstUnanswered = unansweredInCurrent[0];
      setTimeout(() => {
        const el = document.getElementById(`question-${firstUnanswered.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const firstOptionBtn = el.querySelector('button');
          if (firstOptionBtn) firstOptionBtn.focus();
        }
      }, 50);
      return;
    }

    // 2. Check if any prior situation has unanswered questions
    for (let i = 0; i < scenarios.length; i++) {
      const sc = scenarios[i];
      const scUnanswered = (sc.questions || []).filter((q) => answers[q.id] == null);
      if (scUnanswered.length > 0) {
        setCurrentScenarioIdx(i);
        const newErrors = {};
        scUnanswered.forEach((q) => {
          newErrors[q.id] = 'Please select an answer before continuing.';
        });
        setQuestionErrors((prev) => ({ ...prev, ...newErrors }));

        const firstUnanswered = scUnanswered[0];
        setTimeout(() => {
          const el = document.getElementById(`question-${firstUnanswered.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const firstOptionBtn = el.querySelector('button');
            if (firstOptionBtn) firstOptionBtn.focus();
          }
        }, 80);
        return;
      }
    }

    setSubmitting(true);
    setError('');
    try {
      const answersPayload = Object.entries(answers).map(([question_id, selected_score]) => ({
        question_id: parseInt(question_id, 10),
        selected_score,
      }));

      const res = stage === 'pre'
        ? await assessmentApi.submitPre(answersPayload)
        : await assessmentApi.submitPost(answersPayload);

      setResult(res.data);
      setSubmitted(true);
      setReviewModalOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Submission failed. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading Skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
        <Skeleton height="50px" width="60%" />
        <Skeleton height="14px" width="100%" borderRadius="var(--radius-full)" />
        <Skeleton height="280px" width="100%" borderRadius="var(--radius-xl)" />
        <Skeleton height="320px" width="100%" borderRadius="var(--radius-xl)" />
      </div>
    );
  }

  // ── Error / Locked State ───────────────────────────────────────────────────
  if (error && !scenarios.length) {
    return (
      <div style={{ maxWidth: '720px', margin: '2rem auto', textAlign: 'center', padding: '1rem' }}>
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
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
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

  // ── Assessment Results Page (When viewing completed assessment results) ────
  if (showHub && assessmentStatus) {
    const isPreDone = Boolean(assessmentStatus.pre_completed);
    const isPostDone = Boolean(assessmentStatus.post_completed);
    const isViewingPost = isPostDone && (stage === 'post' || !isPreDone);
    const activeAssessment = isViewingPost
      ? assessmentStatus.post_assessment
      : (assessmentStatus.pre_assessment || assessmentStatus.post_assessment);

    if (activeAssessment && (isPreDone || isPostDone)) {
      return (
        <AssessmentResultsView
          stage={isViewingPost ? 'post' : 'pre'}
          activeScores={activeAssessment}
          preAssessment={assessmentStatus.pre_assessment}
          postAssessment={assessmentStatus.post_assessment}
          isPostDone={isPostDone}
          isPostUnlocked={Boolean(assessmentStatus.post_unlocked)}
          onContinue={() => navigate(isViewingPost ? '/dashboard' : '/interventions')}
          onRetake={(retakeStage) => handleRetake(retakeStage || (isViewingPost ? 'post' : 'pre'))}
          onStartPost={() => {
            setShowHub(false);
            setHasStarted(true);
            navigate('/assessment?stage=post&mode=take');
          }}
        />
      );
    }

    // Fallback if neither assessment is completed yet
    return (
      <div style={{ maxWidth: '640px', margin: '2rem auto', padding: '1rem', textAlign: 'center' }}>
        <Card style={{ padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
            No Assessment Results Found
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Please complete your baseline assessment to view your results across the four Theory of Planned Behavior areas.
          </p>
          <Button
            variant="primary"
            onClick={() => {
              setShowHub(false);
              navigate('/assessment?stage=pre&mode=take');
            }}
            iconRight={<ArrowRight size={16} />}
          >
            Start Baseline Assessment
          </Button>
        </Card>
      </div>
    );
  }

  // ── Welcome / Landing Screen ───────────────────────────────────────────────
  if (!hasStarted && !submitted) {
    const isPost = stage === 'post';

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          maxWidth: '680px',
          margin: '2rem auto 3rem auto',
          padding: '0 1rem',
        }}
      >
        <div
          style={{
            position: 'relative',
            background: 'var(--color-surface, #ffffff)',
            borderRadius: '24px',
            border: '1px solid rgba(99, 102, 241, 0.14)',
            boxShadow: '0 20px 48px -12px rgba(79, 70, 229, 0.09), 0 1px 3px rgba(0, 0, 0, 0.04)',
            padding: 'clamp(2.25rem, 5vw, 3.5rem) clamp(1.5rem, 4vw, 2.75rem)',
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-100px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '420px',
              height: '200px',
              background: 'radial-gradient(ellipse at center, rgba(79, 70, 229, 0.12), transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.3 }}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                margin: '0 auto 1.5rem auto',
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(8, 145, 178, 0.10))',
                border: '1px solid rgba(79, 70, 229, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px -6px rgba(79, 70, 229, 0.18)',
              }}
            >
              <Sparkles size={30} style={{ color: 'var(--color-primary, #4f46e5)' }} />
            </motion.div>

            <h1
              style={{
                fontSize: 'clamp(1.75rem, 3.6vw, 2.3rem)',
                fontWeight: 800,
                color: 'var(--color-text-primary, #18181b)',
                letterSpacing: '-0.025em',
                lineHeight: 1.25,
                margin: '0 0 0.75rem 0',
              }}
            >
              {isPost ? 'Adaptive Cyberbullying Review' : 'Personalised Behavioral Reflection'}
            </h1>

            <p
              style={{
                fontSize: 'clamp(0.95rem, 1.8vw, 1.05rem)',
                color: 'var(--color-text-muted, #71717a)',
                lineHeight: 1.6,
                maxWidth: '540px',
                margin: '0 auto 2.25rem auto',
              }}
            >
              Answer each question honestly based on the situation presented.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: '1rem',
                marginBottom: '2.5rem',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  background: 'var(--color-surface-2, #f8fafc)',
                  borderRadius: '16px',
                  border: '1px solid var(--color-border)',
                  padding: '1rem 1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'rgba(79, 70, 229, 0.1)',
                    color: 'var(--color-primary, #4f46e5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <MessageSquareQuote size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary, #18181b)' }}>
                    3 Real Scenarios
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted, #71717a)' }}>
                    Tailored to your digital life
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: 'var(--color-surface-2, #f8fafc)',
                  borderRadius: '16px',
                  border: '1px solid var(--color-border)',
                  padding: '1rem 1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'rgba(8, 145, 178, 0.1)',
                    color: 'var(--color-secondary, #0891b2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Clock size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary, #18181b)' }}>
                    5–8 Minutes
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted, #71717a)' }}>
                    Self-paced reflection
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: 'var(--color-surface-2, #f8fafc)',
                  borderRadius: '16px',
                  border: '1px solid var(--color-border)',
                  padding: '1rem 1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'rgba(5, 150, 105, 0.1)',
                    color: 'var(--color-success, #059669)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <HeartHandshake size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary, #18181b)' }}>
                    Zero Pressure
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted, #71717a)' }}>
                    No right or wrong answers
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
              <motion.button
                type="button"
                onClick={() => setHasStarted(true)}
                whileHover={{ scale: 1.025, boxShadow: '0 14px 30px -4px rgba(79, 70, 229, 0.45)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  padding: '1.05rem 2.85rem',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, var(--color-primary, #4f46e5) 0%, #6366f1 100%)',
                  color: '#ffffff',
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px -4px rgba(79, 70, 229, 0.38), 0 2px 6px rgba(79, 70, 229, 0.2)',
                  transition: 'background 0.2s ease, box-shadow 0.2s ease',
                  letterSpacing: '0.01em',
                  width: '100%',
                  maxWidth: '340px',
                }}
              >
                <span>Begin Assessment</span>
                <ArrowRight size={20} />
              </motion.button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  padding: '0.4rem 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'color 0.15s ease',
                }}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Submitted / Results Screen — uses the clean AssessmentResultsView ────────
  if (submitted && result) {
    return (
      <AssessmentResultsView
        stage={stage}
        activeScores={result}
        preAssessment={stage === 'post' ? assessmentStatus?.pre_assessment ?? null : null}
        postAssessment={stage === 'post' ? result : null}
        isPostDone={stage === 'post'}
        isPostUnlocked={Boolean(assessmentStatus?.post_unlocked)}
        isJustSubmitted
        onContinue={() => navigate(stage === 'pre' ? '/interventions' : '/dashboard')}
        onRetake={(retakeStage) => handleRetake(retakeStage || stage)}
        onStartPost={() => navigate('/assessment?stage=post&mode=take')}
      />
    );
  }

  // ── Active Assessment Flow: 3 Situations with Grouped Questions ─────────────
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '1rem' }}>
      {/* Top Header & Global Progress */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Badge variant="primary">
                {stage === 'post' ? 'Post-Learning Reflection' : 'Baseline Assessment'}
              </Badge>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Situation {currentScenarioIdx + 1} of {scenarios.length || 3}
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
              Online Interaction Reflection
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {answeredQuestionsCount} of {totalQuestionsCount} Completed ({progressPercent}%)
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>{error}</div>}

      {/* Situation Stepper Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${scenarios.length || 3}, 1fr)`,
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}
      >
        {scenarios.map((sc, idx) => {
          const isCurrent = idx === currentScenarioIdx;
          const scQuestions = sc.questions || [];
          const answeredInSc = scQuestions.filter((q) => answers[q.id] != null).length;
          const isComplete = scQuestions.length > 0 && answeredInSc === scQuestions.length;
          const theme = SCENARIO_THEMES[idx] || { label: `Situation ${idx + 1}`, title: 'Online Scenario' };

          return (
            <button
              key={sc.id || idx}
              type="button"
              onClick={() => {
                setCurrentScenarioIdx(idx);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-lg)',
                border: isCurrent
                  ? '2px solid var(--color-primary)'
                  : isComplete
                  ? '1px solid var(--color-success-light)'
                  : '1px solid var(--color-border)',
                background: isCurrent
                  ? 'rgba(79, 70, 229, 0.08)'
                  : isComplete
                  ? 'rgba(5, 150, 105, 0.04)'
                  : 'var(--color-surface)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'var(--transition)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isComplete
                    ? 'var(--color-success)'
                    : isCurrent
                    ? 'var(--color-primary)'
                    : 'var(--color-surface-2)',
                  color: isComplete || isCurrent ? '#ffffff' : 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {isComplete ? <Check size={16} /> : idx + 1}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isCurrent ? 'var(--color-primary)' : 'var(--color-text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {theme.label}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {answeredInSc} of {scQuestions.length} answered
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Situation Narrative Card & Questions */}
      <AnimatePresence mode="wait">
        {currentScenario && (
          <motion.div
            key={currentScenario.id || currentScenarioIdx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            {/* Scenario Narrative Box */}
            <div
              style={{
                background: 'var(--color-surface)',
                borderRadius: '20px',
                border: '1px solid rgba(99, 102, 241, 0.16)',
                padding: '2rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(79, 70, 229, 0.1)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MessageSquareQuote size={18} />
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Situation Context • {currentScenarioIdx + 1} of {scenarios.length}
                </span>
              </div>

              <p
                style={{
                  fontSize: '1.08rem',
                  lineHeight: 1.7,
                  color: 'var(--color-text-primary)',
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                {currentScenario.scenario_text}
              </p>
            </div>

            {/* Questions Group Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HelpCircle size={18} style={{ color: 'var(--color-primary)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                  Questions for this Situation
                </h3>
              </div>
              <span style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
                {currentScenarioAnsweredCount} of {currentScenarioQuestions.length} answered
              </span>
            </div>

            {/* Grouped Questions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {currentScenarioQuestions.map((question, qIdx) => {
                const selectedScore = answers[question.id];
                const isAnswered = selectedScore != null;
                const questionError = questionErrors[question.id];

                return (
                  <div
                    key={question.id}
                    id={`question-${question.id}`}
                    className={`assessment-question-card ${questionError ? 'has-error' : ''}`}
                    role="group"
                    aria-labelledby={`q-title-${question.id}`}
                    aria-invalid={Boolean(questionError)}
                    aria-describedby={questionError ? `q-error-${question.id}` : undefined}
                    style={{
                      background: 'var(--color-surface)',
                      borderRadius: '16px',
                      border: questionError
                        ? '2px solid var(--color-danger)'
                        : isAnswered
                        ? '1px solid rgba(99, 102, 241, 0.2)'
                        : '1px solid var(--color-border)',
                      padding: '1.5rem',
                      boxShadow: questionError
                        ? '0 0 0 3px rgba(220, 38, 38, 0.12), 0 4px 16px rgba(220, 38, 38, 0.06)'
                        : '0 2px 8px rgba(0, 0, 0, 0.02)',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      <span
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: questionError
                            ? 'rgba(220, 38, 38, 0.12)'
                            : isAnswered
                            ? 'rgba(79, 70, 229, 0.12)'
                            : 'var(--color-surface-2)',
                          color: questionError
                            ? 'var(--color-danger)'
                            : isAnswered
                            ? 'var(--color-primary)'
                            : 'var(--color-text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        {qIdx + 1}
                      </span>
                      <p
                        id={`q-title-${question.id}`}
                        style={{
                          fontSize: '1.02rem',
                          fontWeight: 600,
                          color: 'var(--color-text-primary)',
                          margin: 0,
                          lineHeight: 1.55,
                        }}
                      >
                        {question.question_text}
                      </p>
                    </div>

                    {/* Options list */}
                    <div
                      role="radiogroup"
                      aria-labelledby={`q-title-${question.id}`}
                      style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', paddingLeft: '2.25rem' }}
                    >
                      {(question.options || []).map((opt, optIdx) => {
                        const isSelected = selectedScore === opt.score;
                        const optionLetter = String.fromCharCode(65 + optIdx);

                        return (
                          <button
                            key={opt.id || optIdx}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => handleSelectOption(question.id, opt.score)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.85rem',
                              textAlign: 'left',
                              padding: '0.9rem 1.15rem',
                              borderRadius: '12px',
                              border: isSelected
                                ? '2px solid var(--color-primary)'
                                : '1px solid var(--color-border)',
                              background: isSelected
                                ? 'rgba(79, 70, 229, 0.06)'
                                : 'var(--color-surface-2)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              outline: 'none',
                            }}
                          >
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                border: isSelected
                                  ? '2px solid var(--color-primary)'
                                  : '1px solid var(--color-border)',
                                background: isSelected ? 'var(--color-primary)' : '#ffffff',
                                color: isSelected ? '#ffffff' : 'var(--color-text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {isSelected ? <Check size={14} /> : optionLetter}
                            </div>
                            <span
                              style={{
                                flex: 1,
                                fontSize: '0.94rem',
                                color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)',
                                fontWeight: isSelected ? 600 : 400,
                                lineHeight: 1.45,
                              }}
                            >
                              {opt.text}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Inline Error Directly Beneath Question */}
                    {questionError && (
                      <div id={`q-error-${question.id}`} className="question-inline-error" role="alert">
                        <AlertCircle size={15} />
                        <span>{questionError}</span>
                      </div>
                    )}
                  </div>
                );
              })}
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
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <Button
          variant="secondary"
          onClick={handlePrevScenario}
          disabled={currentScenarioIdx === 0}
          icon={<ChevronLeft size={16} />}
        >
          Previous Situation
        </Button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isCurrentScenarioComplete ? (
            <Badge variant="success" icon={<CheckCircle size={14} />}>
              Situation {currentScenarioIdx + 1} Complete
            </Badge>
          ) : (
            <span style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
              {currentScenarioQuestions.length - currentScenarioAnsweredCount} remaining in this situation
            </span>
          )}
        </div>

        {currentScenarioIdx < scenarios.length - 1 ? (
          <Button
            variant="primary"
            onClick={handleNextScenario}
            iconRight={<ChevronRight size={16} />}
          >
            Next Situation
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

      {/* Review & Submit Modal */}
      {reviewModalOpen && (
        <div
          className="content-viewer-overlay"
          onClick={(e) => e.target === e.currentTarget && setReviewModalOpen(false)}
        >
          <div className="content-viewer" style={{ maxWidth: '720px' }}>
            <div className="content-viewer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} color="var(--color-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Review Your Responses
                </h3>
              </div>
              <span className={`badge ${answeredQuestionsCount === totalQuestionsCount ? 'badge-success' : 'badge-warning'}`}>
                {answeredQuestionsCount} of {totalQuestionsCount} Answered
              </span>
            </div>

            <div className="content-viewer-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {scenarios.map((sc, scIdx) => {
                  const scQuestions = sc.questions || [];
                  const answeredCount = scQuestions.filter((q) => answers[q.id] != null).length;
                  const isScDone = answeredCount === scQuestions.length;

                  return (
                    <div
                      key={sc.id || scIdx}
                      style={{
                        background: 'var(--color-surface-2)',
                        borderRadius: '12px',
                        border: '1px solid var(--color-border)',
                        padding: '1rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>
                          Situation {scIdx + 1}
                        </div>
                        <span className={`badge ${isScDone ? 'badge-success' : 'badge-warning'}`}>
                          {answeredCount} of {scQuestions.length} answered
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {scQuestions.map((q, qIdx) => {
                          const isAnswered = answers[q.id] != null;
                          return (
                            <div
                              key={q.id}
                              onClick={() => {
                                setCurrentScenarioIdx(scIdx);
                                setReviewModalOpen(false);
                                setTimeout(() => {
                                  const el = document.getElementById(`question-${q.id}`);
                                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }, 100);
                              }}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.6rem 0.85rem',
                                background: 'var(--color-surface)',
                                borderRadius: '8px',
                                border: isAnswered ? '1px solid var(--color-border)' : '1px solid rgba(239, 68, 68, 0.4)',
                                cursor: 'pointer',
                              }}
                            >
                              <span style={{ fontSize: '0.86rem', color: 'var(--color-text-primary)', flex: 1, paddingRight: '0.75rem' }}>
                                Q{qIdx + 1}: {q.question_text?.slice(0, 75)}...
                              </span>
                              {isAnswered ? (
                                <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                                  <Check size={11} /> Complete
                                </span>
                              ) : (
                                <span className="badge badge-danger" style={{ fontSize: '0.72rem' }}>
                                  Missing
                                </span>
                              )}
                            </div>
                          );
                        })}
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
                disabled={answeredQuestionsCount < totalQuestionsCount}
                iconRight={<Send size={14} />}
              >
                Confirm & Submit Assessment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
