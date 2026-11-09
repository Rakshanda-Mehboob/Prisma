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
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import PageContainer from '../components/PageContainer';

// ── The Four TPB Constructs ──────────────────────────────────────────────────
const TPB_CONSTRUCTS = [
  {
    key: 'attitude_score',
    id: 'Attitude',
    label: 'Attitude',
    subLabel: 'How you view online behavior (harmful vs. acceptable)',
    icon: HeartHandshake,
    getSimpleSummary: (score) => {
      if (score >= 70) return "You recognize how hurtful online comments can be and clearly understand that cyberbullying is harmful.";
      return "You may need more guidance on noticing how online teasing, rumors, and unkind words affect others emotionally.";
    },
  },
  {
    key: 'subjective_norm_score',
    id: 'SubjectiveNorm',
    label: 'Subjective Norms',
    subLabel: 'What friends, classmates, and peers expect you to do',
    icon: Users,
    getSimpleSummary: (score) => {
      if (score >= 70) return "You feel positive peer support to stand up for others and help create a respectful student community.";
      return "You may feel group pressure to stay silent, but positive peer support can make speaking up much easier.";
    },
  },
  {
    key: 'pbc_score',
    id: 'PBC',
    label: 'Perceived Behavioral Control',
    subLabel: 'Your confidence and skills to take safe action',
    icon: Shield,
    getSimpleSummary: (score) => {
      if (score >= 70) return "You feel confident in your ability to step in safely, report issues, and offer help to a classmate.";
      return "You can build more confidence and learn practical ways to safely respond when online harassment happens.";
    },
  },
  {
    key: 'behavioral_intention_score',
    id: 'BehavioralIntention',
    label: 'Behavioral Intention',
    subLabel: 'Your readiness to act responsibly in future situations',
    icon: Target,
    getSimpleSummary: (score) => {
      if (score >= 70) return "You are prepared to support your peers, avoid participating in harmful comments, and take positive action.";
      return "With simple learning and practice, you can feel more prepared to support friends and take positive action.";
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
  onRetake,
  onStartPost,
}) {
  const navigate = useNavigate();
  const overall = activeScores.overall_score ?? Math.round(
    (

      (activeScores.attitude_score ?? 0) +

      (activeScores.subjective_norm_score ?? 0) +

      (activeScores.pbc_score ?? 0) +

      (activeScores.behavioral_intention_score ?? 0)

    ) / 4

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
    if (score >= 70) {
      return {
        rating: 'High Score (70–100)',
        risk: 'Good Readiness',
        simpleSummary: 'You show good awareness, confidence, and readiness to handle cyberbullying situations. You understand the impact of cyberbullying and are more prepared to take positive action.',
      };
    }
    return {
      rating: 'Low Score (0–69)',
      risk: 'Guidance Needed',
      simpleSummary: 'You may need more guidance and learning support to better understand cyberbullying situations and develop effective ways to respond.',
    };
  };

  const statusInfo = getRiskAndReadiness(overall);

  const hasBothAssessments = Boolean(preAssessment && postAssessment);
  const preOverall = preAssessment ? Math.round(
    (

      (preAssessment.attitude_score ?? 0) +

      (preAssessment.subjective_norm_score ?? 0) +

      (preAssessment.pbc_score ?? 0) +

      (preAssessment.behavioral_intention_score ?? 0)

    ) / 4

  ) : null;
  const postOverall = postAssessment ? Math.round(
    (

      (postAssessment.attitude_score ?? 0) +

      (postAssessment.subjective_norm_score ?? 0) +

      (postAssessment.pbc_score ?? 0) +

      (postAssessment.behavioral_intention_score ?? 0)

    ) / 4

  ) : null;
  const growthDelta = hasBothAssessments ? postOverall - preOverall : null;

  return (
    <PageContainer>
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
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Just now
                </span>
              )}
            </div>
            <h1 className="results-hero-title">Your Assessment Summary</h1>
            <p className="results-hero-subtitle">
              Your assessment result shows your current awareness, confidence, and readiness to respond to cyberbullying situations. These results help Prisma understand your learning needs and provide personalized recommendations to improve your knowledge and response skills.
            </p>
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
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  background: overall >= 70 ? 'rgba(5, 150, 105, 0.1)' : 'rgba(79, 70, 229, 0.08)',
                  color: overall >= 70 ? 'var(--color-success)' : 'var(--color-primary)',
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
            Your awareness and readiness across the four core cyberbullying assessment areas.
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
                      {item.score >= 70 ? 'Good Readiness' : 'Needs Support'}
                    </span>
                  </div>

                  <div className="results-bar-track">
                    <div
                      className="results-bar-fill"
                      style={{
                        width: `${item.score}%`,
                        background: item.score >= 70 ? 'var(--color-success)' : 'var(--color-primary)',
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
      {(() => {
        const weakConstructs = activeScores.weak_constructs !== undefined
          ? activeScores.weak_constructs
          : items.filter((i) => i.score < 70).map((i) => i.id);
        const hasIntervention = weakConstructs && weakConstructs.length > 0;

        return (
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
              {hasIntervention ? (
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
              ) : (
                <div className="results-action-item">
                  <div className="results-action-icon" style={{ background: 'rgba(5, 150, 105, 0.1)', color: 'var(--color-success)' }}>
                    <CheckCircle2 size={17} />
                  </div>
                  <div className="results-action-content">
                    <span className="results-action-title">No Intervention Required</span>
                    <p className="results-action-desc">
                      You scored 70% or higher across all constructs, demonstrating good readiness. No remedial modules are needed.
                    </p>
                  </div>
                </div>
              )}

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
                    : !hasIntervention
                    ? 'Great score! No intervention required.'
                    : 'Ready to start your personalized modules?'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {stage === 'post' || postAssessment || isPostDone
                    ? 'Review your updated progress and badges on the dashboard.'
                    : !hasIntervention
                    ? 'You have demonstrated solid readiness across all areas (Score ≥ 70%). You can return to your dashboard.'
                    : 'Modules are short, interactive, and self-paced.'}
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                iconRight={<ArrowRight size={16} />}
                onClick={() => {
                  if (stage === 'post' || postAssessment || isPostDone || !hasIntervention) {
                    navigate('/dashboard');
                  } else {
                    onContinue();
                  }
                }}
              >
                {stage === 'post' || postAssessment || isPostDone || !hasIntervention
                  ? 'Return to Dashboard'
                  : 'Continue to Learning Module'}
              </Button>

              {onRetake && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => onRetake()}
                >
                  Retake Assessment
                </Button>
              )}
            </div>
          </div>
        );
      })()}
    </motion.div>
    </PageContainer>
  );
}

// ── Scenario SVG Illustrations ──────────────────────────────────────────────
function ScenarioIllustration1() {
  return (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxHeight: '200px' }} aria-hidden="true">
      {/* Background glow */}
      <ellipse cx="160" cy="110" rx="130" ry="90" fill="rgba(79,70,229,0.06)" />
      {/* Laptop body */}
      <rect x="60" y="60" width="200" height="120" rx="10" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2" />
      <rect x="68" y="68" width="184" height="104" rx="6" fill="#fff" />
      {/* Laptop base */}
      <rect x="40" y="180" width="240" height="10" rx="5" fill="#c7d2fe" stroke="#6366f1" strokeWidth="1.5" />
      {/* Screen content lines */}
      <rect x="80" y="80" width="80" height="8" rx="4" fill="#6366f1" opacity="0.5" />
      <rect x="80" y="96" width="140" height="6" rx="3" fill="#c7d2fe" />
      <rect x="80" y="108" width="120" height="6" rx="3" fill="#c7d2fe" />
      {/* Warning notification card */}
      <rect x="120" y="120" width="110" height="44" rx="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
      <text x="135" y="136" fontSize="10" fontWeight="700" fill="#b45309" fontFamily="system-ui">⚠ Suspicious Link</text>
      <text x="135" y="150" fontSize="8" fill="#92400e" fontFamily="system-ui">Verify before clicking</text>
      {/* Shield icon on screen */}
      <circle cx="100" cy="140" r="14" fill="rgba(99,102,241,0.12)" stroke="#6366f1" strokeWidth="1.5" />
      <text x="93" y="145" fontSize="13" fontFamily="system-ui" fill="#4f46e5">🛡</text>
      {/* Floating notification badge */}
      <circle cx="230" cy="78" r="12" fill="#ef4444" />
      <text x="225" y="83" fontSize="11" fontWeight="700" fill="#fff" fontFamily="system-ui">!</text>
    </svg>
  );
}

function ScenarioIllustration2() {
  return (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxHeight: '200px' }} aria-hidden="true">
      <ellipse cx="160" cy="110" rx="130" ry="90" fill="rgba(8,145,178,0.06)" />
      {/* Three people avatars */}
      {/* Person 1 */}
      <circle cx="80" cy="90" r="22" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="2" />
      <circle cx="80" cy="84" r="10" fill="#93c5fd" />
      <path d="M60 110 Q80 100 100 110" stroke="#3b82f6" strokeWidth="2" fill="none" />
      {/* Person 2 */}
      <circle cx="160" cy="80" r="26" fill="#c7d2fe" stroke="#6366f1" strokeWidth="2" />
      <circle cx="160" cy="73" r="12" fill="#a5b4fc" />
      <path d="M136 100 Q160 88 184 100" stroke="#6366f1" strokeWidth="2" fill="none" />
      {/* Person 3 */}
      <circle cx="240" cy="90" r="22" fill="#bbf7d0" stroke="#059669" strokeWidth="2" />
      <circle cx="240" cy="84" r="10" fill="#86efac" />
      <path d="M220 110 Q240 100 260 110" stroke="#059669" strokeWidth="2" fill="none" />
      {/* Speech bubbles */}
      <rect x="38" y="118" width="84" height="28" rx="8" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.5" />
      <polygon points="68,118 76,118 72,112" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1" />
      <text x="52" y="131" fontSize="8" fill="#1d4ed8" fontFamily="system-ui">Be an upstander!</text>
      <text x="52" y="141" fontSize="8" fill="#1d4ed8" fontFamily="system-ui">Speak up 💬</text>

      <rect x="198" y="118" width="84" height="28" rx="8" fill="#f0fdf4" stroke="#059669" strokeWidth="1.5" />
      <polygon points="224,118 232,118 228,112" fill="#f0fdf4" stroke="#059669" strokeWidth="1" />
      <text x="210" y="131" fontSize="8" fill="#065f46" fontFamily="system-ui">Report &amp; block</text>
      <text x="210" y="141" fontSize="8" fill="#065f46" fontFamily="system-ui">the bully ✅</text>
      {/* Connect lines */}
      <line x1="102" y1="90" x2="130" y2="82" stroke="#c7d2fe" strokeWidth="2" strokeDasharray="4 2" />
      <line x1="190" y1="82" x2="216" y2="88" stroke="#c7d2fe" strokeWidth="2" strokeDasharray="4 2" />
    </svg>
  );
}

function ScenarioIllustration3() {
  return (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxHeight: '200px' }} aria-hidden="true">
      <ellipse cx="160" cy="110" rx="130" ry="90" fill="rgba(5,150,105,0.06)" />
      {/* Large shield */}
      <path d="M160 50 L210 70 L210 120 Q210 155 160 175 Q110 155 110 120 L110 70 Z" fill="#d1fae5" stroke="#059669" strokeWidth="2.5" />
      {/* Shield inner */}
      <path d="M160 62 L200 78 L200 118 Q200 148 160 165 Q120 148 120 118 L120 78 Z" fill="#a7f3d0" stroke="#059669" strokeWidth="1.5" />
      {/* Check mark */}
      <path d="M142 112 L155 125 L178 100" stroke="#065f46" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {/* Lock icon top-right */}
      <rect x="225" y="55" width="40" height="34" rx="8" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2" />
      <rect x="232" y="66" width="26" height="18" rx="4" fill="#6366f1" />
      <circle cx="245" cy="75" r="4" fill="#fff" />
      <rect x="243" y="75" width="4" height="6" rx="2" fill="#fff" />
      <path d="M237 66 Q237 56 245 56 Q253 56 253 66" stroke="#6366f1" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Settings gear bottom-left */}
      <circle cx="78" cy="155" r="18" fill="#fef9c3" stroke="#f59e0b" strokeWidth="2" />
      <circle cx="78" cy="155" r="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="66" y="161" fontSize="16" fontFamily="system-ui">⚙</text>
      {/* Stars */}
      <text x="230" y="145" fontSize="14" fontFamily="system-ui">⭐</text>
      <text x="58" y="85" fontSize="12" fontFamily="system-ui">✨</text>
    </svg>
  );
}

const SCENARIO_THEMES = [
  { label: 'Situation 1', title: 'Digital Threat Awareness', subtitle: 'Recognizing online dangers & cyberbullying', icon: Users, Illustration: ScenarioIllustration1 },
  { label: 'Situation 2', title: 'Social Influence & Peer Norms', subtitle: 'How peers shape online behavior', icon: MessageSquareQuote, Illustration: ScenarioIllustration2 },
  { label: 'Situation 3', title: 'Taking Control & Staying Safe', subtitle: 'Building confidence to respond & protect', icon: Shield, Illustration: ScenarioIllustration3 },
];

export default function Assessment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const stage = searchParams.get('stage') || 'pre';
  const mode = searchParams.get('mode'); // 'take', 'retake', or null

  const [_assessmentInstance, setAssessmentInstance] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedOptionIndex }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [questionErrors, setQuestionErrors] = useState({}); // { [questionId]: errorMsg }
  const [hasStarted, setHasStarted] = useState(false);
  const [_studentProfile, setStudentProfile] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  const [assessmentStatus, setAssessmentStatus] = useState(null);
  const [showHub, setShowHub] = useState(false);

  // Helper to calculate composite score (equal 25% weightage per TPB construct)

  // Overall = (Attitude + SubjectiveNorm + PBC + BehavioralIntention) / 4

  const _calcOverallScore = (assessment) => {

    if (!assessment) return 0;

    return Math.round(

      (

        (assessment.attitude_score ?? 0) +

        (assessment.subjective_norm_score ?? 0) +

        (assessment.pbc_score ?? 0) +

        (assessment.behavioral_intention_score ?? 0)

      ) / 4

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
      const _isPostUnlocked = Boolean(statusData?.post_unlocked);

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
      setCurrentQuestionIdx(0);
      setSubmitted(false);
      setResult(null);
      setHasStarted(false);
      const targetStage = stageToReset === 'post' ? 'post' : 'pre';
      navigate(`/assessment?stage=${targetStage}&mode=retake`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
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

      const firstUnanswered = unanswered[0];
      const qIdx = currentScenarioQuestions.findIndex((q) => q.id === firstUnanswered.id);
      if (qIdx !== -1) {
        setCurrentQuestionIdx(qIdx);
      }
      return;
    }

    if (currentScenarioIdx < scenarios.length - 1) {
      setCurrentScenarioIdx((prev) => prev + 1);
      setCurrentQuestionIdx(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevScenario = () => {
    if (currentScenarioIdx > 0) {
      setCurrentScenarioIdx((prev) => prev - 1);
      setCurrentQuestionIdx(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextQuestion = () => {
    const currentQ = currentScenarioQuestions[currentQuestionIdx];
    if (currentQ && answers[currentQ.id] == null) {
      setQuestionErrors((prev) => ({
        ...prev,
        [currentQ.id]: 'Please select an answer before continuing.',
      }));
      return;
    }

    if (currentQuestionIdx < currentScenarioQuestions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentScenarioIdx < scenarios.length - 1) {
      handleNextScenario();
    } else {
      setReviewModalOpen(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentScenarioIdx > 0) {
      const prevSc = scenarios[currentScenarioIdx - 1];
      const prevQuestions = prevSc?.questions || [];
      setCurrentScenarioIdx((prev) => prev - 1);
      setCurrentQuestionIdx(Math.max(0, prevQuestions.length - 1));
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
      const qIdx = currentScenarioQuestions.findIndex((q) => q.id === firstUnanswered.id);
      if (qIdx !== -1) {
        setCurrentQuestionIdx(qIdx);
      }
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
        const qIdx = (sc.questions || []).findIndex((q) => q.id === firstUnanswered.id);
        if (qIdx !== -1) {
          setCurrentQuestionIdx(qIdx);
        }
        return;
      }
    }

    setSubmitting(true);
    setError('');
    try {
      const answersPayload = Object.entries(answers).map(([question_id, selected_option]) => ({
        question_id: parseInt(question_id, 10),
        selected_option,
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
      <PageContainer>
        <div
          className="assessment-page-root"
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <Skeleton height="50px" width="40%" />
          <Skeleton height="14px" width="100%" borderRadius="var(--radius-full)" />
          <Skeleton height="240px" width="100%" borderRadius="var(--radius-xl)" />
          <Skeleton height="320px" width="100%" borderRadius="var(--radius-xl)" />
        </div>
      </PageContainer>
    );
  }

  // ── Error / Locked State ───────────────────────────────────────────────────
  if (error && !scenarios.length) {
    return (
      <PageContainer style={{ minHeight: 'calc(100vh - 60px)', alignItems: 'center', justifyContent: 'center' }}>
        <div
          className="assessment-page-root"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', flex: 1 }}
        >
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <Lock size={32} />
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
          {stage === 'post' ? 'Post-Assessment Locked' : 'Assessment Unavailable'}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '580px', margin: '0 auto 2rem' }}>
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
        </div>
      </PageContainer>
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
          onRetake={user?.role === 'admin' ? (retakeStage) => handleRetake(retakeStage || (isViewingPost ? 'post' : 'pre')) : null}
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
      <PageContainer style={{ minHeight: 'calc(100vh - 60px)', alignItems: 'center', justifyContent: 'center' }}>
        <div
          className="assessment-page-root"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', flex: 1 }}
        >
        <div style={{ maxWidth: '640px', width: '100%' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
            No Assessment Results Found
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
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
        </div>
        </div>
      </PageContainer>
    );
  }

  // ── Welcome / Landing Screen ───────────────────────────────────────────────
  if (!hasStarted && !submitted) {
    const isPost = stage === 'post';

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="assessment-page-root"
        style={{
          width: '100%',
          minHeight: 'calc(100vh - 60px)',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
          flex: 1,
        }}
      >
        {/* Soft ambient light */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '650px',
            height: '320px',
            background: 'radial-gradient(ellipse at center, rgba(79, 70, 229, 0.08), transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '980px', width: '100%' }}>
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05, duration: 0.3 }}
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '22px',
              margin: '0 auto 1.5rem auto',
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(8, 145, 178, 0.10))',
              border: '1px solid rgba(79, 70, 229, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px -6px rgba(79, 70, 229, 0.18)',
            }}
          >
            <Sparkles size={32} style={{ color: 'var(--color-primary, #4f46e5)' }} />
          </motion.div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.85rem)',
              fontWeight: 800,
              color: 'var(--color-text-primary, #18181b)',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              margin: '0 0 1rem 0',
            }}
          >
            {isPost ? 'Adaptive Cyberbullying Review' : 'Personalised Behavioral Reflection'}
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              color: 'var(--color-text-muted, #71717a)',
              lineHeight: 1.65,
              maxWidth: '680px',
              margin: '0 auto 2.75rem auto',
            }}
          >
            Answer each question honestly based on the situation presented.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
              marginBottom: '3rem',
              textAlign: 'left',
              width: '100%',
            }}
          >
            <div
              style={{
                background: 'var(--color-surface-2, #f8fafc)',
                borderRadius: '16px',
                border: '1px solid var(--color-border)',
                padding: '1.25rem 1.35rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(79, 70, 229, 0.1)',
                  color: 'var(--color-primary, #4f46e5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <MessageSquareQuote size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary, #18181b)' }}>
                  3 Real Scenarios
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted, #71717a)' }}>
                  Tailored to your digital life
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'var(--color-surface-2, #f8fafc)',
                borderRadius: '16px',
                border: '1px solid var(--color-border)',
                padding: '1.25rem 1.35rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(8, 145, 178, 0.1)',
                  color: 'var(--color-secondary, #0891b2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Clock size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary, #18181b)' }}>
                  5–8 Minutes
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted, #71717a)' }}>
                  Self-paced reflection
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'var(--color-surface-2, #f8fafc)',
                borderRadius: '16px',
                border: '1px solid var(--color-border)',
                padding: '1.25rem 1.35rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(5, 150, 105, 0.1)',
                  color: 'var(--color-success, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <HeartHandshake size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary, #18181b)' }}>
                  Zero Pressure
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted, #71717a)' }}>
                  No right or wrong answers
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
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
                padding: '1.15rem 3.25rem',
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
                maxWidth: '360px',
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
                fontSize: '0.9rem',
                cursor: 'pointer',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                transition: 'color 0.15s ease',
              }}
            >
              Back to Dashboard
            </button>
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
        onRetake={user?.role === 'admin' ? (retakeStage) => handleRetake(retakeStage || stage) : null}
        onStartPost={() => navigate('/assessment?stage=post&mode=take')}
      />
    );
  }

  // ── Active Assessment Flow: 3 Situations with Grouped Questions ─────────────
  return (
    <PageContainer>
    <div className="assessment-page-root" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1 }}>
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
        className="assessment-stepper-grid"
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
                setCurrentQuestionIdx(0);
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
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {answeredInSc} of {scQuestions.length} answered
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Situation: Dual-Panel Interactive Scenario Flow */}
      {currentScenario && (() => {
        const currentTheme = SCENARIO_THEMES[currentScenarioIdx] || SCENARIO_THEMES[0];
        const ScenarioIllustration = currentTheme.Illustration || ScenarioIllustration1;
        const currentQuestion = currentScenarioQuestions[currentQuestionIdx] || currentScenarioQuestions[0];
        const selectedOption = currentQuestion ? answers[currentQuestion.id] : undefined;
        const isCurrentQuestionAnswered = selectedOption != null;
        const questionError = currentQuestion ? questionErrors[currentQuestion.id] : undefined;
        const isLastQuestionInScenario = currentQuestionIdx === currentScenarioQuestions.length - 1;
        const isLastScenario = currentScenarioIdx === scenarios.length - 1;
        const isFirstQuestionOverall = currentScenarioIdx === 0 && currentQuestionIdx === 0;

        return (
          <div className="scenario-assessment-layout">
            {/* LEFT PANEL: Scenario Image & Context */}
            <div className="scenario-image-panel">
              {/* Scenario Header with Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'rgba(79, 70, 229, 0.1)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <currentTheme.icon size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                    Situation {currentScenarioIdx + 1} of {scenarios.length}
                  </span>
                  <h3 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
                    {currentTheme.title}
                  </h3>
                </div>
              </div>

              {/* Scenario Visual Illustration */}
              <div className="scenario-illustration-box">
                <ScenarioIllustration />
              </div>

              {/* Scenario Narrative Text */}
              <div className="scenario-narrative-text">
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Situation Context
                </div>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.75, color: 'var(--color-text-primary)', margin: 0, fontWeight: 500 }}>
                  {currentScenario.scenario_text}
                </p>
              </div>

              {/* Scenario Questions Progress Tracker */}
              <div className="scenario-questions-tracker">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                    Questions in this Situation
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {currentScenarioAnsweredCount} of {currentScenarioQuestions.length} completed
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                  {currentScenarioQuestions.map((q, qIdx) => {
                    const isQAnswered = answers[q.id] != null;
                    const isQCurrent = qIdx === currentQuestionIdx;
                    const hasQError = Boolean(questionErrors[q.id]);

                    return (
                      <button
                        key={q.id || qIdx}
                        type="button"
                        onClick={() => {
                          setCurrentQuestionIdx(qIdx);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        title={`Question ${qIdx + 1}${isQAnswered ? ' (Answered)' : ''}`}
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          border: isQCurrent
                            ? '2px solid var(--color-primary)'
                            : hasQError
                            ? '2px solid var(--color-danger)'
                            : isQAnswered
                            ? '1px solid var(--color-success)'
                            : '1px solid var(--color-border)',
                          background: isQCurrent
                            ? 'rgba(79, 70, 229, 0.12)'
                            : isQAnswered
                            ? 'rgba(5, 150, 105, 0.08)'
                            : 'var(--color-surface-2)',
                          color: isQCurrent
                            ? 'var(--color-primary)'
                            : hasQError
                            ? 'var(--color-danger)'
                            : isQAnswered
                            ? 'var(--color-success)'
                            : 'var(--color-text-muted)',
                          fontWeight: isQCurrent ? 800 : 600,
                          fontSize: '0.86rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isQAnswered && !isQCurrent ? <Check size={14} /> : qIdx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: Single Question View with Animated Transitions */}
            <div className="scenario-question-panel">
              <AnimatePresence mode="wait">
                {currentQuestion && (
                  <motion.div
                    key={`${currentScenarioIdx}-${currentQuestion.id || currentQuestionIdx}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className={`assessment-question-card ${questionError ? 'has-error' : ''}`}
                    role="group"
                    aria-labelledby={`q-title-${currentQuestion.id}`}
                    aria-invalid={Boolean(questionError)}
                    aria-describedby={questionError ? `q-error-${currentQuestion.id}` : undefined}
                    style={{
                      background: 'var(--color-surface)',
                      borderRadius: '20px',
                      border: questionError
                        ? '2px solid var(--color-danger)'
                        : isCurrentQuestionAnswered
                        ? '1px solid rgba(99, 102, 241, 0.25)'
                        : '1px solid var(--color-border)',
                      padding: '2rem 2.25rem',
                      boxShadow: questionError
                        ? '0 0 0 3px rgba(220, 38, 38, 0.12), 0 4px 16px rgba(220, 38, 38, 0.06)'
                        : '0 4px 20px rgba(0, 0, 0, 0.04)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.5rem',
                    }}
                  >
                    {/* Question Header & Meta */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: questionError
                              ? 'rgba(220, 38, 38, 0.12)'
                              : isCurrentQuestionAnswered
                              ? 'rgba(79, 70, 229, 0.12)'
                              : 'var(--color-surface-2)',
                            color: questionError
                              ? 'var(--color-danger)'
                              : isCurrentQuestionAnswered
                              ? 'var(--color-primary)'
                              : 'var(--color-text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {currentQuestionIdx + 1}
                        </span>
                        <span style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                          Question {currentQuestionIdx + 1} of {currentScenarioQuestions.length}
                        </span>
                      </div>

                      {isCurrentQuestionAnswered ? (
                        <Badge variant="success" icon={<Check size={12} />}>
                          Answered
                        </Badge>
                      ) : (
                        <Badge variant="warning">
                          Required
                        </Badge>
                      )}
                    </div>

                    {/* Question Text */}
                    <p
                      id={`q-title-${currentQuestion.id}`}
                      style={{
                        fontSize: '1.24rem',
                        fontWeight: 700,
                        color: 'var(--color-text-primary)',
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      {currentQuestion.question_text}
                    </p>

                    {/* Options Radiogroup */}
                    <div
                      className="assessment-options-group"
                      role="radiogroup"
                      aria-labelledby={`q-title-${currentQuestion.id}`}
                      style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
                    >
                      {(currentQuestion.options || []).map((opt, optIdx) => {
                        const isSelected = selectedOption === opt.index;
                        const optionLetter = String.fromCharCode(65 + optIdx);

                        return (
                          <button
                            key={opt.id || optIdx}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => handleSelectOption(currentQuestion.id, opt.index)}
                            className={`scenario-option-button ${isSelected ? 'selected' : ''}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              textAlign: 'left',
                              padding: '1.15rem 1.4rem',
                              borderRadius: '14px',
                              border: isSelected
                                ? '2px solid var(--color-primary)'
                                : '1px solid var(--color-border)',
                              background: isSelected
                                ? 'rgba(79, 70, 229, 0.07)'
                                : 'var(--color-surface-2)',
                              cursor: 'pointer',
                              transition: 'all 0.18s ease',
                              outline: 'none',
                            }}
                          >
                            <div
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                border: isSelected
                                  ? '2px solid var(--color-primary)'
                                  : '1px solid var(--color-border)',
                                background: isSelected ? 'var(--color-primary)' : '#ffffff',
                                color: isSelected ? '#ffffff' : 'var(--color-text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.92rem',
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {isSelected ? <Check size={16} strokeWidth={2.5} /> : optionLetter}
                            </div>
                            <span
                              style={{
                                flex: 1,
                                fontSize: '1.08rem',
                                color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)',
                                fontWeight: isSelected ? 650 : 450,
                                lineHeight: 1.55,
                              }}
                            >
                              {opt.text}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Inline Error Directly Beneath Options */}
                    {questionError && (
                      <div id={`q-error-${currentQuestion.id}`} className="question-inline-error" role="alert" style={{ margin: 0, fontSize: '0.92rem' }}>
                        <AlertCircle size={16} />
                        <span>{questionError}</span>
                      </div>
                    )}

                    {/* Question Card Bottom Navigation */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                        flexWrap: 'wrap',
                        marginTop: '0.75rem',
                        paddingTop: '1.25rem',
                        borderTop: '1px solid var(--color-border)',
                      }}
                    >
                      <Button
                        variant="secondary"
                        onClick={handlePrevQuestion}
                        disabled={isFirstQuestionOverall}
                        icon={<ChevronLeft size={16} />}
                      >
                        Previous Question
                      </Button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReviewModalOpen(true)}
                        >
                          Review All
                        </Button>

                        <Button
                          variant="primary"
                          onClick={handleNextQuestion}
                          iconRight={isLastQuestionInScenario && isLastScenario ? <Send size={15} /> : <ChevronRight size={16} />}
                        >
                          {isLastQuestionInScenario
                            ? isLastScenario
                              ? 'Review & Submit'
                              : `Next Situation (${currentScenarioIdx + 2} of ${scenarios.length})`
                            : 'Next Question'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })()}

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
                                setCurrentQuestionIdx(qIdx);
                                setReviewModalOpen(false);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
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
                              <span style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)', flex: 1, paddingRight: '0.75rem' }}>
                                Q{qIdx + 1}: {q.question_text?.slice(0, 75)}...
                              </span>
                              {isAnswered ? (
                                <span className="badge badge-success" style={{ fontSize: '0.78rem' }}>
                                  <Check size={11} /> Complete
                                </span>
                              ) : (
                                <span className="badge badge-danger" style={{ fontSize: '0.78rem' }}>
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
    </PageContainer>
  );
}
