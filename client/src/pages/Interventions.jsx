import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { interventionsApi, dashboardApi } from '../api';
import {
  BookOpen, PlayCircle, FileQuestion, BookMarked,
  Clock, CheckCircle2, ChevronRight, ChevronLeft,
  AlertCircle, Check, RotateCcw, Award, Lightbulb,
  ArrowRight, ShieldCheck, Target, Compass, ExternalLink
} from 'lucide-react';
import Button from '../components/ui/Button';
import Skeleton, { SkeletonCard } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

// ─── Construct Definitions & Metadata (TPB) ──────────────────────────────────
const CONSTRUCT_CONFIG = {
  'Attitude': {
    name: 'Attitude',
    key: 'attitude',
    themeColor: '#4f46e5',
    headline: 'Strengthening Your Attitude Toward Digital Empathy',
    tagline: 'Deepen empathy and recognize the real human consequences of online interactions.',
    whyAssigned: 'Identified as your top area for growth from your diagnostic assessment. This module focuses on building empathy, identifying subtle online harms, and understanding the emotional impact of cyberbullying.',
    example: {
      title: 'The Group Chat Meme',
      scenario: 'In a class study group chat, someone posts an edited screenshot mocking a classmate who asked a simple question. Laugh emojis follow, but the student stops attending lectures.',
      takeaway: 'Humor ceases to be harmless when it targets an individual. Intent does not erase emotional and academic impact on the victim.'
    },
    tips: [
      'Pause before sending: If you would hesitate to say it face-to-face, do not post it online.',
      'Differentiate banter from bullying: Persistent or targeted mockery is harm, not friendly humor.',
      'Reach out privately: A brief direct message saying "I saw that and you did not deserve it" provides crucial emotional support.'
    ],
    reflectionPrompt: 'Think of an online interaction where someone was mocked. What made that exchange cross the line from humor into harm?'
  },
  'Subjective Norm': {
    name: 'Subjective Norm',
    key: 'subjective_norm',
    themeColor: '#0891b2',
    headline: 'Fostering Positive Peer Influence and Community Standards',
    tagline: 'Empower active peer intervention and establish a culture of digital respect.',
    whyAssigned: 'Identified as your top area for growth from your diagnostic assessment. This module focuses on overcoming the bystander effect and setting constructive peer expectations in group chats and online forums.',
    example: {
      title: 'Breaking the Silence',
      scenario: 'During group project work on Discord, hostile remarks were directed at one student. One member posted: "Let us keep this space respectful and focus on our slides." Three others immediately backed them up.',
      takeaway: 'Silence is often mistaken for agreement. When a single student speaks up, it creates permission for everyone else to defend community standards.'
    },
    tips: [
      'Break the bystander cycle: Inaction reinforces negative behaviour. Speaking up resets the social standard.',
      'Publicly support peers: Upvoting or affirming respectful contributions shifts the group climate.',
      'Establish group expectations: Agree on simple ground rules for respectful group chats early on.'
    ],
    reflectionPrompt: 'How do your peers typically react when someone is targeted online? What would make it easier for your group to speak up?'
  },
  'Perceived Behavioral Control': {
    name: 'Perceived Behavioral Control',
    key: 'pbc',
    themeColor: '#7c3aed',
    headline: 'Building Practical Response Skills and Digital Confidence',
    tagline: 'Equip yourself with practical reporting, documentation, and de-escalation tools.',
    whyAssigned: 'Identified as your top area for growth from your diagnostic assessment. This module focuses on practical strategies to respond confidently and safely when witnessing or facing cyberbullying.',
    example: {
      title: 'The 3-Step Response Plan',
      scenario: 'When targeted with unverified rumors online, a student avoided public retaliation. Instead, they took dated screenshots, muted the offender, and reported through platform safety tools to a student advisor.',
      takeaway: 'You do not have to fight hostility with retaliation. Taking measured, structured steps gives you full control.'
    },
    tips: [
      'Document evidence first: Take clear screenshots with timestamps and handles before blocking or reporting.',
      'Use platform tools effectively: Master the mute, restrict, block, and report functions on modern apps.',
      'Support privately without escalating: Defuse public tension and offer private solidarity to protect well-being.'
    ],
    reflectionPrompt: 'Which response tool (screenshotting evidence, platform reporting, or contacting support) do you feel most confident using right now?'
  },
  'Behavioral Intention': {
    name: 'Behavioral Intention',
    key: 'behavioral_intention',
    themeColor: '#059669',
    headline: 'Turning Prosocial Intentions into Decisive Action',
    tagline: 'Commit to proactive, decisive intervention whenever digital harm occurs.',
    whyAssigned: 'Identified as your top area for growth from your diagnostic assessment. This module bridges the intention-behavior gap with concrete commitment strategies and decision-making scenarios.',
    example: {
      title: 'Decisive Allyship in High-Stakes Situations',
      scenario: 'When an escalating harassment thread appeared on a campus forum, a student committed in advance to act as an ally by reporting the thread and checking in on the target within 10 minutes.',
      takeaway: 'Pre-committing to a specific action plan eliminates hesitation when cyberbullying happens.'
    },
    tips: [
      'Pre-commit to action: Decide now what specific steps you will take if you witness cyberbullying.',
      'Prioritize victim well-being: Focus on supporting the person targeted rather than getting into public debates.',
      'Sustain prosocial habits: Make proactive peer support a routine part of your online engagement.'
    ],
    reflectionPrompt: 'What is one concrete commitment you will make this week to support a respectful digital environment?'
  }
};

const TYPE_CONFIG = {
  reading: { icon: <BookOpen size={16} />, label: 'Reading Guide' },
  video: { icon: <PlayCircle size={16} />, label: 'Video Lesson' },
  quiz: { icon: <FileQuestion size={16} />, label: 'Interactive Check' },
  'case-study': { icon: <BookMarked size={16} />, label: 'Practical Scenario' },
};

function normalizeConstruct(raw) {
  if (!raw) return 'Attitude';
  const str = String(raw).toLowerCase().replace(/[^a-z]/g, '');
  if (str.includes('attitude')) return 'Attitude';
  if (str.includes('norm')) return 'Subjective Norm';
  if (str.includes('intention')) return 'Behavioral Intention';
  if (str.includes('pbc') || str.includes('control') || str.includes('behavioral')) return 'Perceived Behavioral Control';
  return 'Attitude';
}

function sanitizeContent(rawText) {
  if (!rawText) return '';
  return rawText
    .replace(/\*+(?:Sources|References):[^*]+\*+/gi, '')
    .replace(/\([A-Z][a-zA-Z\s&]+,?\s*(?:19|20)\d{2}[a-z]?\)/g, '')
    .replace(/In the Theory of Planned Behavior.*?,?\s*Subjective Norms refer to/gi, 'Subjective Norm refers to')
    .replace(/In the Theory of Planned Behavior.*?,?\s*Perceived Behavioral Control \(PBC\) refers to/gi, 'Perceived Behavioral Control refers to')
    .replace(/According to Icek Ajzen\'s Theory of Planned Behavior \(1991\),?/gi, '')
    .replace(/\bPBC\b/g, 'Perceived Behavioral Control')
    .trim();
}

const COURSERA_MD = {
  h1: ({ children }) => (
    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '1.25rem 0 0.5rem', color: 'var(--color-text-primary)' }}>
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '1rem 0 0.4rem', color: 'var(--color-primary)' }}>
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
  strong: ({ children }) => (
    <strong style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
      {children}
    </strong>
  ),
};

function CourseQuiz({ quizData, isCompleted, onCompleteQuiz, actionLoading }) {
  const questions = quizData.questions || [];
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = totalQuestions > 0 && answeredCount === totalQuestions;

  let correctCount = 0;
  questions.forEach((q) => {
    if (selectedAnswers[q.id] === q.correct_index) correctCount++;
  });
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const handleSelect = (qId, optIdx) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleReset = () => {
    setSelectedAnswers({});
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div
        style={{
          background: 'rgba(79, 70, 229, 0.04)',
          border: '1px solid rgba(79, 70, 229, 0.15)',
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
          <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Award size={18} /> Interactive Knowledge Check
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
            {quizData.instructions || 'Review each practical dilemma and select the most constructive response.'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Progress</div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: isAllAnswered ? 'var(--color-success)' : 'var(--color-text-primary)' }}>
              {answeredCount} of {totalQuestions} answered
            </div>
          </div>
          {answeredCount > 0 && (
            <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Score</div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: scorePercent >= 75 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                {correctCount}/{answeredCount} ({scorePercent}%)
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {questions.map((q, idx) => {
          const selected = selectedAnswers[q.id];
          const hasAnswered = selected !== undefined;
          const isCorrect = selected === q.correct_index;

          return (
            <div
              key={q.id}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', background: 'rgba(79, 70, 229, 0.08)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                  Question {idx + 1}
                </span>
                {hasAnswered && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isCorrect ? 'var(--color-success)' : 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {isCorrect ? <Check size={14} /> : <AlertCircle size={14} />}
                    {isCorrect ? 'Correct choice' : 'Review suggested choice'}
                  </span>
                )}
              </div>

              <h4 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                {q.question}
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {q.options.map((opt, optIdx) => {
                  const isThisSelected = selected === optIdx;
                  const isThisCorrect = optIdx === q.correct_index;

                  let border = '1px solid var(--color-border)';
                  let bg = 'var(--color-surface)';
                  if (hasAnswered) {
                    if (isThisCorrect) {
                      border = '1px solid rgba(5, 150, 105, 0.5)';
                      bg = 'rgba(5, 150, 105, 0.06)';
                    } else if (isThisSelected && !isThisCorrect) {
                      border = '1px solid rgba(220, 38, 38, 0.4)';
                      bg = 'rgba(220, 38, 38, 0.05)';
                    }
                  } else if (isThisSelected) {
                    border = '1px solid var(--color-primary)';
                    bg = 'rgba(79, 70, 229, 0.04)';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelect(q.id, optIdx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        textAlign: 'left',
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border,
                        background: bg,
                        color: 'var(--color-text-primary)',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'var(--transition)',
                      }}
                    >
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: isThisSelected
                            ? isThisCorrect ? 'var(--color-success)' : 'var(--color-danger)'
                            : 'var(--color-surface-2)',
                          color: isThisSelected ? '#fff' : 'var(--color-text-secondary)',
                        }}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span style={{ flex: 1, lineHeight: 1.4 }}>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {hasAnswered && (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.85rem 1.15rem',
                    borderRadius: 'var(--radius-md)',
                    background: isCorrect ? 'rgba(5, 150, 105, 0.06)' : 'rgba(217, 119, 6, 0.08)',
                    borderLeft: `3px solid ${isCorrect ? 'var(--color-success)' : 'var(--color-warning)'}`,
                    fontSize: '0.86rem',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: isCorrect ? 'var(--color-success)' : 'var(--color-warning)', display: 'block', marginBottom: 2 }}>
                    Practical Guidance:
                  </strong>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isAllAnswered && (
        <div
          style={{
            background: 'rgba(5, 150, 105, 0.06)',
            border: '1px solid rgba(5, 150, 105, 0.2)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-success)' }}>
            Knowledge Check Complete! Score: {correctCount} / {totalQuestions} ({scorePercent}%)
          </h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', maxWidth: 480 }}>
            You have answered all questions. Click below to register your completion and continue your learning path.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.35rem' }}>
            <Button variant="secondary" size="sm" onClick={handleReset} icon={<RotateCcw size={14} />}>
              Try Again
            </Button>
            {!isCompleted && (
              <Button
                variant="primary"
                size="sm"
                onClick={onCompleteQuiz}
                loading={actionLoading}
                iconRight={<CheckCircle2 size={14} />}
              >
                Record Lesson Completion
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Interventions() {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [userSelectedConstruct, setUserSelectedConstruct] = useState(null);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);

  const [reflectionText, setReflectionText] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);

  const loadData = async () => {
    try {
      const [intRes, dashRes] = await Promise.allSettled([
        interventionsApi.getMyInterventions(),
        dashboardApi.getDashboard(),
      ]);

      const recordsData = intRes.status === 'fulfilled' ? intRes.value.data : [];
      setRecords(recordsData);

      if (dashRes.status === 'fulfilled' && dashRes.value.data) {
        setDashboardData(dashRes.value.data);
      }
    } catch {
      setError('Unable to load your personalized learning module. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const { priorityConstructName, nextConstructName, constructScore } = useMemo(() => {
    const preScores = dashboardData?.pre_scores || dashboardData?.latest_scores;

    const recordsByConstruct = {};
    records.forEach((r) => {
      const cName = normalizeConstruct(r.intervention?.target_construct);
      if (!recordsByConstruct[cName]) recordsByConstruct[cName] = [];
      recordsByConstruct[cName].push(r);
    });

    const constructsOrdered = Object.keys(CONSTRUCT_CONFIG).sort((a, b) => {
      const keyA = CONSTRUCT_CONFIG[a].key;
      const keyB = CONSTRUCT_CONFIG[b].key;
      const scoreA = preScores?.[keyA] ?? 100;
      const scoreB = preScores?.[keyB] ?? 100;
      return scoreA - scoreB;
    });

    if (userSelectedConstruct && CONSTRUCT_CONFIG[userSelectedConstruct]) {
      const sc = preScores?.[CONSTRUCT_CONFIG[userSelectedConstruct].key];
      return {
        priorityConstructName: userSelectedConstruct,
        nextConstructName: null,
        constructScore: sc != null ? Math.round(sc) : null,
      };
    }

    let weakestIncomplete = null;
    let nextIncomplete = null;

    for (const cName of constructsOrdered) {
      const cRecords = recordsByConstruct[cName] || [];
      if (cRecords.length > 0) {
        const hasIncomplete = cRecords.some((r) => r.status !== 'completed');
        if (hasIncomplete) {
          if (!weakestIncomplete) {
            weakestIncomplete = cName;
          } else if (!nextIncomplete) {
            nextIncomplete = cName;
            break;
          }
        }
      }
    }

    if (weakestIncomplete) {
      const sc = preScores?.[CONSTRUCT_CONFIG[weakestIncomplete].key];
      return {
        priorityConstructName: weakestIncomplete,
        nextConstructName: nextIncomplete,
        constructScore: sc != null ? Math.round(sc) : null,
      };
    }

    const hasAnyRecords = records.length > 0;
    if (hasAnyRecords) {
      const firstAssigned = constructsOrdered.find((c) => recordsByConstruct[c]?.length > 0) || constructsOrdered[0];
      const sc = preScores?.[CONSTRUCT_CONFIG[firstAssigned].key];
      return {
        priorityConstructName: firstAssigned,
        nextConstructName: null,
        constructScore: sc != null ? Math.round(sc) : null,
      };
    }

    const defaultWeakest = constructsOrdered[0] || 'Attitude';
    const sc = preScores?.[CONSTRUCT_CONFIG[defaultWeakest].key];
    return {
      priorityConstructName: defaultWeakest,
      nextConstructName: null,
      constructScore: sc != null ? Math.round(sc) : null,
    };
  }, [dashboardData, records, userSelectedConstruct]);

  const activeConstruct = CONSTRUCT_CONFIG[priorityConstructName] || CONSTRUCT_CONFIG['Attitude'];

  const activeLessons = useMemo(() => {
    const assigned = records.filter(
      (r) => normalizeConstruct(r.intervention?.target_construct) === activeConstruct.name
    );

    if (assigned.length > 0) {
      return assigned.map((r, idx) => ({
        lessonNumber: idx + 1,
        id: r.intervention.id,
        progressId: r.progress_id,
        title: r.intervention.title,
        contentType: r.intervention.content_type || 'reading',
        contentBody: r.intervention.content_body || '',
        estimatedMinutes: r.intervention.estimated_minutes || 8,
        status: r.status,
        record: r,
      }));
    }

    return [
      {
        lessonNumber: 1,
        id: 'foundational-1',
        progressId: null,
        title: `${activeConstruct.name} Core Principles & Guidelines`,
        contentType: 'reading',
        contentBody: `### ${activeConstruct.headline}\n\n${activeConstruct.tagline}\n\n${activeConstruct.whyAssigned}\n\n### Key Focus Areas\n- Deepen understanding of digital peer culture\n- Practice empathetic and prosocial online behaviour\n- Recognize harm before sending or reacting to posts`,
        estimatedMinutes: 6,
        status: 'in-progress',
        record: null,
      },
      {
        lessonNumber: 2,
        id: 'foundational-2',
        progressId: null,
        title: `Practical Scenario: ${activeConstruct.example.title}`,
        contentType: 'case-study',
        contentBody: activeConstruct.example.scenario,
        estimatedMinutes: 8,
        status: 'assigned',
        record: null,
      },
      {
        lessonNumber: 3,
        id: 'foundational-3',
        progressId: null,
        title: `${activeConstruct.name} Response Toolkit`,
        contentType: 'reading',
        contentBody: activeConstruct.tips.map((t, i) => `${i + 1}. ${t}`).join('\n\n'),
        estimatedMinutes: 7,
        status: 'assigned',
        record: null,
      }
    ];
  }, [records, activeConstruct]);

  const totalLessonsCount = activeLessons.length;
  const completedLessonsCount = activeLessons.filter((l) => l.status === 'completed').length;
  const progressPercent = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;
  const isConstructDone = totalLessonsCount > 0 && completedLessonsCount === totalLessonsCount;

  const currentLesson = activeLessons[activeLessonIdx] || activeLessons[0];

  useEffect(() => {
    if (currentLesson?.record && currentLesson.status === 'assigned') {
      interventionsApi.startIntervention(currentLesson.id).catch(() => {});
      setRecords((rs) =>
        rs.map((r) => (r.progress_id === currentLesson.progressId ? { ...r, status: 'in-progress' } : r))
      );
    }
  }, [currentLesson]);

  const handleCompleteCurrentLesson = async () => {
    if (!currentLesson) return;
    setActionLoading(true);

    if (currentLesson.record && currentLesson.status !== 'completed') {
      try {
        await interventionsApi.completeIntervention(currentLesson.id);
        setRecords((rs) =>
          rs.map((r) => (r.progress_id === currentLesson.progressId ? { ...r, status: 'completed' } : r))
        );
      } catch {}
    } else if (!currentLesson.record) {
      currentLesson.status = 'completed';
    }

    setActionLoading(false);

    if (activeLessonIdx < activeLessons.length - 1) {
      setActiveLessonIdx((i) => i + 1);
    }
  };

  const handleSaveReflection = () => {
    if (reflectionText.trim()) {
      setReflectionSaved(true);
      setTimeout(() => setReflectionSaved(false), 3000);
    }
  };

  const handleStartPostAssessment = async () => {
    setActionLoading(true);
    try {
      const incomplete = records.filter((r) => r.status !== 'completed');
      for (const r of incomplete) {
        await interventionsApi.completeIntervention(r.intervention.id).catch(() => {});
      }
    } catch {}
    setActionLoading(false);
    navigate('/assessment?stage=post&mode=take');
  };

  if (loading) {
    return (
      <div className="coursera-container" style={{ padding: '2rem 1rem' }}>
        <Skeleton height="80px" width="60%" borderRadius="var(--radius-lg)" />
        <Skeleton height="100px" width="100%" borderRadius="var(--radius-lg)" style={{ margin: '1rem 0' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const hasAssessment = dashboardData?.has_assessment || dashboardData?.pre_scores != null;
  if (!hasAssessment && records.length === 0) {
    return (
      <div className="coursera-container" style={{ padding: '2rem 1rem' }}>
        <EmptyState
          icon={<Compass size={44} color="var(--color-primary)" />}
          title="Diagnostic Assessment Required"
          description="Your personalized learning module will be tailored specifically to your diagnostic assessment results across Attitude, Subjective Norm, and Perceived Behavioral Control. Take the 10-minute assessment to unlock your personalized learning path."
          actionLabel="Take Baseline Assessment"
          onAction={() => navigate('/assessment?stage=pre')}
        />
      </div>
    );
  }

  const isQuiz = currentLesson?.contentType === 'quiz';
  let quizData = null;
  if (isQuiz && currentLesson?.contentBody) {
    try {
      quizData = JSON.parse(currentLesson.contentBody);
    } catch {}
  }

  const isVideo = currentLesson?.contentType === 'video';
  const videoUrl = isVideo ? currentLesson?.contentBody?.split('\n')[0]?.trim() : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="coursera-container"
    >
      <div className="coursera-header-card">
        <div className="coursera-header-top">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  background: `${activeConstruct.themeColor}15`,
                  color: activeConstruct.themeColor,
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  letterSpacing: '0.02em',
                }}
              >
                <Target size={13} />
                Priority Area: {activeConstruct.name}
              </span>
              {constructScore != null && (
                <span
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: 'var(--color-text-muted)',
                    background: 'var(--color-surface-2)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  Diagnostic Score: {constructScore}%
                </span>
              )}
            </div>

            <h1 className="coursera-title" style={{ fontSize: '1.65rem', fontWeight: 800 }}>
              {activeConstruct.headline}
            </h1>
            <p className="coursera-subtitle" style={{ maxWidth: 720 }}>
              {activeConstruct.whyAssigned}
            </p>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="coursera-progress-block">
          <div className="coursera-progress-header">
            <span className="coursera-progress-title">
              <ShieldCheck size={16} color={activeConstruct.themeColor} />
              Module Progress: {completedLessonsCount} of {totalLessonsCount} Lessons Completed
            </span>
            <span style={{ fontWeight: 800, color: isConstructDone ? 'var(--color-success)' : activeConstruct.themeColor, fontSize: '0.92rem' }}>
              {progressPercent}%
            </span>
          </div>

          <div className="progress-bar" style={{ height: 7, borderRadius: 999, background: 'var(--color-surface-3)' }}>
            <div
              className="progress-fill"
              style={{
                width: `${progressPercent}%`,
                background: isConstructDone
                  ? 'var(--color-success)'
                  : `linear-gradient(90deg, ${activeConstruct.themeColor}99, ${activeConstruct.themeColor})`,
                borderRadius: 999,
                transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />
          </div>
        </div>

        {isConstructDone && reviewMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: '1rem 1.25rem',
              background: 'rgba(5, 150, 105, 0.08)',
              border: '1px solid rgba(5, 150, 105, 0.25)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>
              <strong>Review Mode:</strong> You have completed this module and can review all lessons.
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReviewMode(false)}
              >
                Back to Completion Screen
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartPostAssessment}
                loading={actionLoading}
                iconRight={<ArrowRight size={14} />}
              >
                Start Post Assessment
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ─── Dedicated Transition Screen: Learning Module Completed ─── */}
      {isConstructDone && !reviewMode ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{ maxWidth: '640px', margin: '2rem auto 3rem auto', padding: '0 1rem' }}
        >
          <div
            style={{
              background: 'var(--color-surface, #ffffff)',
              borderRadius: '24px',
              border: '1px solid rgba(5, 150, 105, 0.25)',
              boxShadow: '0 20px 48px -12px rgba(5, 150, 105, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)',
              padding: 'clamp(2.5rem, 5vw, 3.5rem) clamp(1.5rem, 4vw, 2.5rem)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.25rem',
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                background: 'rgba(5, 150, 105, 0.12)',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px -4px rgba(5, 150, 105, 0.25)',
              }}
            >
              <CheckCircle2 size={40} strokeWidth={2.2} />
            </div>

            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(5, 150, 105, 0.1)',
                  color: 'var(--color-success)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginBottom: '0.85rem',
                }}
              >
                <span>{activeConstruct.name} Module Completed</span>
              </div>

              <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.6rem' }}>
                Learning Module Completed
              </h2>

              <p style={{ fontSize: '1.02rem', color: 'var(--color-text-secondary)', lineHeight: 1.65, maxWidth: '480px', margin: '0 auto' }}>
                You have completed your personalized learning activity. You can now continue with the follow-up assessment.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', maxWidth: '340px', marginTop: '0.5rem' }}>
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartPostAssessment}
                loading={actionLoading}
                iconRight={<ArrowRight size={18} />}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '1rem 1.75rem',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, var(--color-primary, #4f46e5) 0%, #6366f1 100%)',
                  boxShadow: '0 8px 24px -4px rgba(79, 70, 229, 0.38)',
                }}
              >
                Start Post Assessment
              </Button>

              <button
                type="button"
                onClick={() => setReviewMode(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  padding: '0.35rem',
                  textDecoration: 'underline',
                }}
              >
                Review completed lessons
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="coursera-course-layout">
        <aside className="coursera-sidebar">
          <div className="coursera-sidebar-header">
            <span className="coursera-sidebar-title">Assigned Syllabus</span>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              {activeConstruct.name} Focus Path
            </div>
          </div>

          <div className="coursera-lesson-list" style={{ background: 'transparent', padding: '0.75rem' }}>
            {activeLessons.map((l, idx) => {
              const isSelected = activeLessonIdx === idx;
              const isDone = l.status === 'completed';
              const typeCfg = TYPE_CONFIG[l.contentType] || TYPE_CONFIG.reading;

              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setActiveLessonIdx(idx)}
                  className={`coursera-lesson-btn ${isSelected ? 'active' : ''}`}
                  style={{
                    position: 'relative',
                    padding: '0.8rem 0.95rem',
                    border: isSelected ? `1px solid ${activeConstruct.themeColor}55` : '1px solid transparent',
                    background: isSelected ? `${activeConstruct.themeColor}0a` : 'transparent',
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      flexShrink: 0,
                      background: isDone
                        ? 'var(--color-success)'
                        : isSelected
                        ? activeConstruct.themeColor
                        : 'var(--color-surface-2)',
                      color: isDone || isSelected ? '#fff' : 'var(--color-text-muted)',
                    }}
                  >
                    {isDone ? <Check size={12} strokeWidth={3} /> : idx + 1}
                  </div>

                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <div
                      style={{
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '0.85rem',
                        color: isSelected ? activeConstruct.themeColor : 'var(--color-text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {l.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                      {typeCfg.icon}
                      <span>{typeCfg.label}</span>
                      <span>•</span>
                      <span>{l.estimatedMinutes} min</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div
            style={{
              padding: '1.1rem 1.25rem',
              borderTop: '1px solid var(--color-border)',
              background: 'var(--color-surface-2)',
              marginTop: 'auto',
            }}
          >
            <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}>
              Why this was assigned
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
              {activeConstruct.tagline}
            </div>
          </div>
        </aside>

        <section className="coursera-player-card">
          <div className="coursera-breadcrumbs">
            <span>Personalized Learning</span>
            <ChevronRight size={13} />
            <span style={{ fontWeight: 600, color: activeConstruct.themeColor }}>{activeConstruct.name}</span>
            <ChevronRight size={13} />
            <span>Lesson {activeLessonIdx + 1} of {totalLessonsCount}</span>
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
                    color: activeConstruct.themeColor,
                    background: `${activeConstruct.themeColor}12`,
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {(TYPE_CONFIG[currentLesson?.contentType] || TYPE_CONFIG.reading).icon}
                  {(TYPE_CONFIG[currentLesson?.contentType] || TYPE_CONFIG.reading).label}
                </span>

                <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={13} /> {currentLesson?.estimatedMinutes || 8} min read
                </span>
              </div>

              <h2 className="coursera-lesson-heading">{currentLesson?.title}</h2>
            </div>

            <div>
              {currentLesson?.status === 'completed' ? (
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

          <div className="coursera-content-body" style={{ minHeight: 280 }}>
            {isQuiz && quizData ? (
              <CourseQuiz
                quizData={quizData}
                isCompleted={currentLesson?.status === 'completed'}
                onCompleteQuiz={handleCompleteCurrentLesson}
                actionLoading={actionLoading}
              />
            ) : isVideo && videoUrl ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div
                  style={{
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: activeConstruct.themeColor,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PlayCircle size={32} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      Interactive Video Lesson
                    </h3>
                    <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', marginTop: 4, maxWidth: 440 }}>
                      Watch this guided video case study to understand real-world peer dynamics and constructive intervention.
                    </p>
                  </div>
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '0.65rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      background: activeConstruct.themeColor,
                      color: '#fff',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    Open Video Resource <ExternalLink size={14} />
                  </a>
                </div>

                <div className="coursera-callout-card">
                  <div className="coursera-callout-header" style={{ color: activeConstruct.themeColor }}>
                    <Lightbulb size={16} /> Key Takeaway to Look For
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    Pay close attention to how the bystander paused before reacting, and how their measured response shifted the entire group dynamic without escalating conflict.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="markdown-content">
                  <ReactMarkdown components={COURSERA_MD}>
                    {sanitizeContent(currentLesson?.contentBody)}
                  </ReactMarkdown>
                </div>

                <div className="coursera-callout-card">
                  <div className="coursera-callout-header" style={{ color: activeConstruct.themeColor }}>
                    <BookMarked size={16} /> Real-World Case Dilemma: {activeConstruct.example.title}
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
                    {activeConstruct.example.scenario}
                  </p>
                  <div
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(79, 70, 229, 0.05)',
                      fontSize: '0.86rem',
                      color: 'var(--color-text-primary)',
                      lineHeight: 1.6,
                      borderLeft: `3px solid ${activeConstruct.themeColor}`,
                    }}
                  >
                    <strong>Practical Takeaway: </strong>
                    {activeConstruct.example.takeaway}
                  </div>
                </div>

                <div className="coursera-callout-card">
                  <div className="coursera-callout-header" style={{ color: 'var(--color-success)' }}>
                    <ShieldCheck size={16} /> Actionable Strategies You Can Use Right Away
                  </div>
                  <ul className="coursera-tips-list">
                    {activeConstruct.tips.map((tip, idx) => (
                      <li key={idx} className="coursera-tips-item">
                        <span style={{ color: 'var(--color-success)', fontWeight: 700, marginTop: 1 }}>✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  style={{
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Lightbulb size={16} color="var(--color-warning)" />
                    Personal Reflection
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    {activeConstruct.reflectionPrompt}
                  </p>
                  <textarea
                    rows={3}
                    placeholder="Write a brief reflection on how you would handle this situation..."
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.88rem',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem' }}>
                    {reflectionSaved && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 600 }}>
                        ✓ Reflection saved
                      </span>
                    )}
                    <Button variant="secondary" size="sm" onClick={handleSaveReflection}>
                      Save Reflection
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="coursera-player-footer">
            <Button
              variant="secondary"
              size="sm"
              disabled={activeLessonIdx === 0}
              onClick={() => setActiveLessonIdx((i) => Math.max(0, i - 1))}
              icon={<ChevronLeft size={14} />}
            >
              Previous Lesson
            </Button>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {currentLesson?.status !== 'completed' && !isQuiz ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCompleteCurrentLesson}
                  loading={actionLoading}
                  iconRight={<CheckCircle2 size={14} />}
                >
                  {activeLessonIdx === activeLessons.length - 1 ? 'Complete Module' : 'Complete & Continue'}
                </Button>
              ) : activeLessonIdx < activeLessons.length - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveLessonIdx((i) => i + 1)}
                  iconRight={<ChevronRight size={14} />}
                >
                  Next Lesson
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleStartPostAssessment}
                  loading={actionLoading}
                  iconRight={<ArrowRight size={14} />}
                >
                  Start Post Assessment
                </Button>
              )}
            </div>
          </div>
        </section>
      </div>
      )}
    </motion.div>
  );
}
