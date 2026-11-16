
/**
 * pages/Assessment.jsx — Scenario-Based Assessment Module (v2.0)
 *
 * Implements:
 *   - Exactly 3 profile-tailored digital situations
 *   - Multiple questions grouped under each situation (~8 items per scenario, 2 per TPB construct)
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
                    <div className="results-action-icon" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)' }}>
                      <BookOpen size={17} />
                    </div>
                    <div className="results-action-content">
                      <span className="results-action-title">Personalized Enhancement Module</span>
                      <p className="results-action-desc">
                        All your scores are 70% or higher. Prisma has recommended a personalized enhancement module to strengthen your skills even further.
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
                      : 'Ready to start your personalized learning?'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {stage === 'post' || postAssessment || isPostDone
                      ? 'Review your updated progress and badges on the dashboard.'
                      : hasIntervention
                        ? 'Modules are short, interactive, and self-paced.'
                        : 'Explore your recommended enhancement module to strengthen your cyberbullying response skills.'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {stage === 'post' || postAssessment || isPostDone ? (
                    <Button
                      variant="primary"
                      size="md"
                      iconRight={<ArrowRight size={16} />}
                      onClick={() => navigate('/dashboard')}
                    >
                      Return to Dashboard
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="primary"
                        size="md"
                        iconRight={<ArrowRight size={16} />}
                        onClick={onContinue}
                      >
                        Continue to Learning Module
                      </Button>
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => navigate('/dashboard')}
                      >
                        Return to Dashboard
                      </Button>
                    </>
                  )}

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

// ── Construct Configuration for Question Badges ──────────────────────────────
const CONSTRUCT_CONFIG = {
  Attitude: {
    label: 'Attitude',
    color: '#db2777',
    bgColor: 'rgba(219, 39, 119, 0.08)',
    borderColor: 'rgba(219, 39, 119, 0.22)',
    icon: HeartHandshake,
  },
  SubjectiveNorm: {
    label: 'Subjective Norm',
    color: '#7c3aed',
    bgColor: 'rgba(124, 58, 237, 0.08)',
    borderColor: 'rgba(124, 58, 237, 0.22)',
    icon: Users,
  },
  PBC: {
    label: 'PBC',
    color: '#0891b2',
    bgColor: 'rgba(8, 145, 178, 0.08)',
    borderColor: 'rgba(8, 145, 178, 0.22)',
    icon: Shield,
  },
  BehavioralIntention: {
    label: 'Behavioral Intention',
    color: '#059669',
    bgColor: 'rgba(5, 150, 105, 0.08)',
    borderColor: 'rgba(5, 150, 105, 0.22)',
    icon: Target,
  },
};

/**
 * Splits a single continuous scenario description into 2 to 3 logical paragraphs.
 */
function formatScenarioParagraphs(text) {
  if (!text) return [];
  if (text.includes('\n\n')) {
    return text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  }
  const sentences = text.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g) || [text];
  if (sentences.length <= 2) {
    return [text];
  }
  if (sentences.length <= 4) {
    const mid = Math.ceil(sentences.length / 2);
    return [
      sentences.slice(0, mid).join(' ').trim(),
      sentences.slice(mid).join(' ').trim(),
    ].filter(Boolean);
  }
  const total = sentences.length;
  const perChunk = Math.ceil(total / 3);
  const paragraphs = [];
  for (let i = 0; i < total; i += perChunk) {
    paragraphs.push(sentences.slice(i, i + perChunk).join(' ').trim());
  }
  return paragraphs.filter(Boolean);
}

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

        // If post-assessment is not yet unlocked (learning modules not finished)
        if (!_isPostUnlocked) {
          setError(
            'Complete all assigned learning modules before taking the post-assessment. ' +
            'Your personalized learning path must be finished first.'
          );
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

      const submittedResult = res.data;
      setResult(submittedResult);
      setSubmitted(true);
      setReviewModalOpen(false);

      // Refresh assessment status after submission so post_unlocked reflects new state
      if (stage === 'pre') {
        try {
          const freshStatus = await assessmentApi.getStatus();
          setAssessmentStatus(freshStatus.data);
        } catch (_) { }
      }

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
      const isPostUnlocked = Boolean(assessmentStatus.post_unlocked);

      return (
        <AssessmentResultsView
          stage={isViewingPost ? 'post' : 'pre'}
          activeScores={activeAssessment}
          preAssessment={assessmentStatus.pre_assessment}
          postAssessment={assessmentStatus.post_assessment}
          isPostDone={isPostDone}
          isPostUnlocked={isPostUnlocked}
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
            <Button
              variant="primary"
              size="xl"
              onClick={() => setHasStarted(true)}
              iconRight={<ArrowRight size={20} />}
            >
              Begin Assessment
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }
  // ── Submitted / Results Screen — uses the clean AssessmentResultsView ────────
  if (submitted && result) {
    const weakConstructs = result?.weak_constructs ?? [];
    const allScoresHigh = weakConstructs.length === 0;

    return (
      <AssessmentResultsView
        stage={stage}
        activeScores={result}
        preAssessment={stage === 'post' ? assessmentStatus?.pre_assessment ?? null : null}
        postAssessment={stage === 'post' ? result : null}
        isPostDone={stage === 'post'}
        isPostUnlocked={allScoresHigh || Boolean(assessmentStatus?.post_unlocked)}
        isJustSubmitted
        onContinue={() => navigate(stage === 'pre' ? '/interventions' : '/dashboard')}
        onRetake={user?.role === 'admin' ? (retakeStage) => handleRetake(retakeStage || stage) : null}
        onStartPost={() => navigate('/assessment?stage=post&mode=take')}
      />
    );
  }

  // ── Active Assessment Flow: 3 Situations with Grouped Questions ─────────────
  const estRemainingMinutes = Math.max(1, Math.ceil(Math.max(0, totalQuestionsCount - answeredQuestionsCount) * 0.75));
  const userInitial = (user?.full_name || user?.username || 'Student').charAt(0).toUpperCase();

  return (
    <PageContainer>
      <div className="assessment-modern-container">

        {/* ── 1. MERGED ASSESSMENT TITLE & PROGRESS CARD ── */}
        <header className="assessment-sticky-header">
          <div className="assessment-header-content-wrap">
            {/* Top row: Title + Badges and Top Meta */}
            <div className="assessment-header-top-row">
              <div className="assessment-header-heading-line">
                <h1 className="assessment-main-page-title">
                  Online Interaction Assessment
                </h1>
                <Badge variant="primary">
                  {stage === 'post' ? 'Post-Learning' : 'Baseline'}
                </Badge>
                <Badge variant="outline">
                  {currentScenario?.category || 'Online Interaction'}
                </Badge>
                <span className="assessment-situation-badge">
                  Situation {currentScenarioIdx + 1} of {scenarios.length || 3}
                </span>
              </div>
              <div className="assessment-header-top-meta">
                <div className="assessment-time-chip" title="Estimated remaining time">
                  <Clock size={13} style={{ color: 'var(--color-primary)' }} />
                  <span>~{estRemainingMinutes} min{estRemainingMinutes === 1 ? '' : 's'} left</span>
                </div>
                <div
                  className="assessment-user-avatar"
                  title={user?.full_name || user?.username || 'Student'}
                >
                  {userInitial}
                </div>
              </div>
            </div>

            {/* Subtitle below with comfortable space */}
            <p className="assessment-page-subtitle">
              Read each scenario carefully and choose your genuine response. No right or wrong answers.
            </p>

            {/* Progress bar on its own row with space above it */}
            <div className="assessment-header-progress-row">
              <div className="assessment-progress-meta-row">
                <span className="assessment-progress-label">
                  Progress: <strong>{progressPercent}%</strong> ({answeredQuestionsCount}/{totalQuestionsCount} questions)
                </span>
              </div>
              <div className="assessment-header-progress-track">
                <div
                  className="assessment-header-progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </header>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* ── 2. COMPACT SITUATION STEPPER (Single row, ~56px tall, inline progress) ── */}
        <div className="assessment-stepper-grid">
          {scenarios.map((sc, idx) => {
            const isCurrent = idx === currentScenarioIdx;
            const scQuestions = sc.questions || [];
            const answeredInSc = scQuestions.filter((q) => answers[q.id] != null).length;
            const isComplete = scQuestions.length > 0 && answeredInSc === scQuestions.length;
            const isStarted = answeredInSc > 0 && !isComplete;
            const progressPct = scQuestions.length > 0 ? Math.round((answeredInSc / scQuestions.length) * 100) : 0;

            return (
              <button
                key={sc.id || idx}
                type="button"
                onClick={() => {
                  setCurrentScenarioIdx(idx);
                  setCurrentQuestionIdx(0);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`situation-tab-card ${isCurrent ? 'active' : ''} ${isComplete ? 'complete' : ''}`}
              >
                <div className="situation-tab-left">
                  <div className="situation-tab-number">
                    {isComplete ? <Check size={14} strokeWidth={2.8} /> : idx + 1}
                  </div>
                  <div className="situation-tab-text">
                    <span className="situation-tab-title">
                      Situation {idx + 1}
                    </span>
                    <span className="situation-tab-subtitle">
                      {answeredInSc} of {scQuestions.length} answered
                    </span>
                  </div>
                </div>

                <div className="situation-tab-right">
                  {isComplete ? (
                    <span className="situation-badge-done">
                      <Check size={10} strokeWidth={3} /> Done
                    </span>
                  ) : isStarted ? (
                    <span className="situation-badge-active">
                      Active
                    </span>
                  ) : (
                    <span className="situation-badge-pending">
                      {progressPct}%
                    </span>
                  )}
                  {/* Inline Progress Bar */}
                  <div className="situation-tab-progress-track">
                    <div
                      className="situation-tab-progress-fill"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── 3. ACTIVE SITUATION CONTENT ── */}
        {currentScenario && (() => {
          const currentTheme = SCENARIO_THEMES[currentScenarioIdx] || SCENARIO_THEMES[0];
          const currentQuestion = currentScenarioQuestions[currentQuestionIdx] || currentScenarioQuestions[0];
          const selectedOption = currentQuestion ? answers[currentQuestion.id] : undefined;
          const isCurrentQuestionAnswered = selectedOption != null;
          const questionError = currentQuestion ? questionErrors[currentQuestion.id] : undefined;
          const isLastQuestionInScenario = currentQuestionIdx === currentScenarioQuestions.length - 1;
          const isLastScenario = currentScenarioIdx === scenarios.length - 1;
          const isFirstQuestionOverall = currentScenarioIdx === 0 && currentQuestionIdx === 0;

          const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
          const fallbackImgUrl = `${apiBase}/static/scenario_images/fallback_situation_${(currentScenarioIdx % 3) + 1}_${currentScenarioIdx === 0 ? 'social' : currentScenarioIdx === 1 ? 'chat' : 'academic'}.svg`;
          const rawImgUrl = currentScenario?.image_url;
          const displayedImgSrc = rawImgUrl
            ? (rawImgUrl.startsWith('http') ? rawImgUrl : `${apiBase}${rawImgUrl}`)
            : fallbackImgUrl;
          const scenarioTitle = currentScenario?.title || currentTheme.title;

          // Construct mapping for Question badge
          const constructKey = currentQuestion?.tpb_construct ||
            (currentQuestionIdx % 4 === 0 ? 'Attitude' :
             currentQuestionIdx % 4 === 1 ? 'SubjectiveNorm' :
             currentQuestionIdx % 4 === 2 ? 'PBC' : 'BehavioralIntention');
          const construct = CONSTRUCT_CONFIG[constructKey] || CONSTRUCT_CONFIG['Attitude'];
          const ConstructIcon = construct.icon;

          // Timeline connecting line fill %
          const lineProgressPct = currentScenarioQuestions.length > 1
            ? Math.min(100, Math.max(0, (currentQuestionIdx / (currentScenarioQuestions.length - 1)) * 100))
            : 0;

          return (
            <div className="assessment-active-situation-wrap">

              {/* ── SPLIT SCENARIO CARD (Left ~36% Illustration | Right ~64% Text) ── */}
              <div className="assessment-split-scenario-card">
                {/* Left: Illustration pane (clean, compact frame, non-interactive) */}
                <div className="scenario-left-illustration-pane">
                  {currentScenario?.image_status === 'pending' && !currentScenario?.image_url ? (
                    <div style={{ width: '100%', height: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <div className="skeleton-shimmer" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
                        Generating visual illustration…
                      </span>
                    </div>
                  ) : (
                    <img
                      src={displayedImgSrc}
                      alt={currentScenario.image_alt_text || scenarioTitle || `Scenario ${currentScenarioIdx + 1} illustration`}
                      onError={(e) => {
                        if (e.currentTarget.src !== fallbackImgUrl) {
                          e.currentTarget.src = fallbackImgUrl;
                        }
                      }}
                    />
                  )}
                </div>

                {/* Right: Content pane */}
                <div className="scenario-right-content-pane">
                  <div className="scenario-meta-row">
                    <Badge variant="primary">{currentScenario?.category || 'Scenario'}</Badge>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                      Situation {currentScenarioIdx + 1} of {scenarios.length}
                    </span>
                  </div>

                  <h2 className="scenario-content-title">
                    {scenarioTitle}
                  </h2>

                  <div className="scenario-description-container">
                    {formatScenarioParagraphs(currentScenario.scenario_text).map((para, pIdx) => (
                      <p key={pIdx} className="scenario-description-para">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── QUESTION AREA: ELEVATED CARD WITH INTEGRATED NAVIGATOR ── */}
              <div className="scenario-question-panel">
                <AnimatePresence mode="wait">
                  {currentQuestion && (
                    <motion.div
                      key={`${currentScenarioIdx}-${currentQuestion.id || currentQuestionIdx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className={`assessment-question-card-elevated ${questionError ? 'has-error' : ''}`}
                      role="group"
                      aria-labelledby={`q-title-${currentQuestion.id}`}
                      aria-invalid={Boolean(questionError)}
                      aria-describedby={questionError ? `q-error-${currentQuestion.id}` : undefined}
                    >
                      {/* Integrated Question Header & Timeline Navigation */}
                      <div className="question-card-top-nav-row">
                        <div className="question-card-meta-left">
                          <span className="question-num-indicator">
                            Question {currentQuestionIdx + 1} of {currentScenarioQuestions.length}
                          </span>
                          <span style={{ color: 'var(--color-border)' }}>•</span>
                          <span
                            className="question-construct-chip"
                            style={{
                              color: construct.color,
                              background: construct.bgColor,
                              border: `1px solid ${construct.borderColor}`,
                            }}
                          >
                            <ConstructIcon size={12} strokeWidth={2.2} />
                            {construct.label}
                          </span>
                        </div>

                        {/* Interactive question timeline nodes directly in question card */}
                        <div className="question-timeline-track-wrap compact">
                          <div className="question-timeline-line-base" />
                          <div
                            className="question-timeline-line-active"
                            style={{
                              width: currentScenarioQuestions.length > 1
                                ? `calc(${lineProgressPct}% * (100% - 28px) / 100)`
                                : '0%'
                            }}
                          />
                          {currentScenarioQuestions.map((q, qIdx) => {
                            const isQAnswered = answers[q.id] != null;
                            const isQCurrent = qIdx === currentQuestionIdx;
                            const hasQError = Boolean(questionErrors[q.id]);
                            return (
                              <button
                                key={q.id || qIdx}
                                type="button"
                                onClick={() => setCurrentQuestionIdx(qIdx)}
                                title={`Question ${qIdx + 1}${isQAnswered ? ' (Answered)' : ''}`}
                                className={`question-timeline-node-btn ${isQCurrent ? 'current' : ''} ${isQAnswered && !isQCurrent ? 'completed' : ''} ${hasQError ? 'has-error' : ''}`}
                              >
                                {isQAnswered && !isQCurrent ? <Check size={12} strokeWidth={2.8} /> : qIdx + 1}
                              </button>
                            );
                          })}
                        </div>

                        <div className="question-card-meta-right">
                          {isCurrentQuestionAnswered ? (
                            <Badge variant="success" icon={<Check size={11} />}>
                              Answered
                            </Badge>
                          ) : (
                            <Badge variant="warning">
                              Required
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Question Text Title */}
                      <h3
                        id={`q-title-${currentQuestion.id}`}
                        className="assessment-question-text-title"
                      >
                        {currentQuestion.question_text}
                      </h3>

                      {/* Answer Options: Premium selectable cards */}
                      <div
                        className="assessment-options-vertical-stack"
                        role="radiogroup"
                        aria-labelledby={`q-title-${currentQuestion.id}`}
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
                              className={`assessment-option-card-premium ${isSelected ? 'selected' : ''}`}
                            >
                              {/* Large Radio Indicator */}
                              <div className="assessment-radio-circle">
                                {isSelected && <Check size={13} strokeWidth={3} />}
                              </div>

                              {/* Option Letter Badge */}
                              <div className="assessment-option-letter-badge">
                                {optionLetter}
                              </div>

                              {/* Option Text */}
                              <span className="assessment-option-text-body">
                                {opt.text}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Inline Error Directly Beneath Options */}
                      {questionError && (
                        <div id={`q-error-${currentQuestion.id}`} className="question-inline-error" role="alert" style={{ margin: 0, fontSize: '0.85rem' }}>
                          <AlertCircle size={15} />
                          <span>{questionError}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── STICKY BOTTOM FOOTER NAVIGATION ── */}
              <div className="assessment-sticky-footer-bar">
                <Button
                  variant="secondary"
                  onClick={handlePrevQuestion}
                  disabled={isFirstQuestionOverall}
                  icon={<ChevronLeft size={16} />}
                >
                  Previous Question
                </Button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    Question {currentQuestionIdx + 1} of {currentScenarioQuestions.length}
                  </span>
                  <button
                    type="button"
                    className="assessment-review-link"
                    onClick={() => setReviewModalOpen(true)}
                  >
                    Review All
                  </button>
                </div>

                <button
                  type="button"
                  className="assessment-next-btn-gradient"
                  onClick={handleNextQuestion}
                >
                  <span>
                    {isLastQuestionInScenario
                      ? isLastScenario
                        ? 'Review & Submit'
                        : `Next Situation (${currentScenarioIdx + 2} of ${scenarios.length})`
                      : 'Next Question'}
                  </span>
                  {isLastQuestionInScenario && isLastScenario ? <Send size={15} /> : <ChevronRight size={16} />}
                </button>
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
