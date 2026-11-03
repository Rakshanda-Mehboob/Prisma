import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { dashboardApi } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight, TrendingUp, BookOpen, ClipboardList,
  Trophy, AlertTriangle, Activity, Sparkles,
  Lock, ChevronRight, Check
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton, { SkeletonCard } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import PageContainer from '../components/PageContainer';

const CONSTRUCTS = [
  { key: 'attitude',             label: 'Attitude',                     color: '#4f46e5' },
  { key: 'subjective_norm',      label: 'Subjective Norms',              color: '#0891b2' },
  { key: 'pbc',                  label: 'Perceived Behavioural Control', color: '#7c3aed' },
  { key: 'behavioral_intention', label: 'Behavioural Intention',         color: '#059669' },
];

function ConstructScoreRow({ label, score, color, preScore, postScore }) {
  const displayScore = score ?? 0;
  const delta = (postScore != null && preScore != null) ? Math.round(postScore - preScore) : null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {delta != null && (
            <span style={{
              fontSize: '0.78rem', fontWeight: 700, padding: '0.1rem 0.4rem',
              borderRadius: 'var(--radius-full)',
              background: delta >= 0 ? 'rgba(5,150,105,0.1)' : 'rgba(220,38,38,0.08)',
              color: delta >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
            }}>{delta >= 0 ? '+' : ''}{delta}</span>
          )}
          <span style={{ fontSize: '0.88rem', fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>
            {Math.round(displayScore)}%
          </span>
        </div>
      </div>
      <div style={{ height: 7, borderRadius: 999, background: 'var(--color-surface-3)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.max(4, Math.min(100, displayScore))}%`,
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          borderRadius: 999,
          transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }} />
      </div>
    </div>
  );
}

function JourneyStep({ label, icon, done, active, route, navigate }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: '0.65rem',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-lg)',
        background: done ? 'rgba(5,150,105,0.06)' : active ? 'rgba(79,70,229,0.06)' : 'var(--color-surface-2)',
        border: done ? '1px solid rgba(5,150,105,0.2)' : active ? '1px solid rgba(79,70,229,0.2)' : '1px solid var(--color-border)',
        cursor: active ? 'pointer' : 'default',
        transition: 'var(--transition)',
      }}
      onClick={() => active && navigate(route)}
    >
      <span style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
        background: done ? 'rgba(5,150,105,0.12)' : active ? 'rgba(79,70,229,0.12)' : 'var(--color-surface-3)',
      }}>{done ? <Check size={16} /> : icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '0.86rem', fontWeight: 600,
          color: done ? 'var(--color-success)' : active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        }}>{label}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
          {done ? 'Completed' : active ? 'Up next' : 'Locked'}
        </div>
      </div>
      {active && <ChevronRight size={16} color="var(--color-primary)" />}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi.getDashboard()
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load your dashboard. Please refresh and try again.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Skeleton height="80px" width="55%" />
          <div className="stats-grid"><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
          <Skeleton height="260px" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <div style={{ paddingTop: '2rem' }}>
        <div className="alert alert-danger"><AlertTriangle size={18} /><div><strong>Something went wrong:</strong> {error}</div></div>
        <Button variant="secondary" onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const pre  = data?.pre_scores;
  const post = data?.post_scores;
  const pct  = data?.completion_percent ?? 0;
  const intervDone  = data?.completed_interventions ?? 0;
  const intervTotal = data?.total_interventions ?? 0;
  const postUnlocked = data?.post_unlocked ?? false;
  const currentUser = data?.user || user;
  const rawName = (currentUser?.full_name || '').trim();
  const welcomeName = rawName && !/^\d+$/.test(rawName)
    ? rawName.split(' ')[0]
    : 'Student';
  const isNew = currentUser?.login_count <= 1;

  const ctaLabel = !pre ? 'Start Pre-Assessment'
    : intervDone < intervTotal ? `Resume Learning (${intervTotal - intervDone} left)`
    : postUnlocked && !post ? 'Take Post-Assessment'
    : 'Review Learning Modules';
  const ctaRoute = !pre ? '/assessment?stage=pre'
    : intervDone < intervTotal ? '/interventions'
    : postUnlocked && !post ? '/assessment?stage=post&mode=take'
    : '/interventions';

  const journeySteps = [
    { label: 'Pre-Assessment',   icon: '📋', done: !!pre,                                        active: !pre,                     route: pre ? '/assessment?stage=pre&mode=results' : '/assessment?stage=pre' },
    { label: 'Learning Modules', icon: '📖', done: intervDone > 0 && intervDone === intervTotal, active: !!pre && intervDone < intervTotal, route: '/interventions' },
    { label: 'Post-Assessment',  icon: '🎯', done: !!post,                                       active: postUnlocked && !post,    route: post ? '/assessment?stage=post&mode=results' : '/assessment?stage=post&mode=take' },
    { label: 'Feedback',         icon: '💬', done: false,                                        active: !!post,                   route: '/feedback' },
  ];

  const displayScores = post || pre;

  return (
    <PageContainer
      as="div"
    >
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}
    >
      {/* Welcome Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(79,70,229,0.06), rgba(8,145,178,0.03)), var(--color-surface)',
        border: '1px solid rgba(79,70,229,0.12)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1.5rem', boxShadow: 'var(--shadow-sm)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Badge variant="primary" icon={<Sparkles size={12} />}>Active Session</Badge>
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
            {isNew ? <>👋 Welcome, {welcomeName}!</> : <>👋 Welcome back, {welcomeName}</>}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', maxWidth: '560px', lineHeight: 1.6 }}>
            {!pre ? "Let's get started — take the Pre-Assessment to discover your personalised learning path."
              : intervDone < intervTotal ? 'Keep going! Complete your learning modules to unlock the Post-Assessment.'
              : post ? 'You have completed the full program. Review your progress below.'
              : 'All modules done! You can now take the Post-Assessment.'}
          </p>
        </div>
        <Link to={ctaRoute}>
          <Button variant="primary" size="lg" iconRight={<ArrowRight size={16} />}>{ctaLabel}</Button>
        </Link>
      </div>

      {/* 4 Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Pre-Assessment</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(79,70,229,0.09)', color: 'var(--color-primary)' }}><ClipboardList size={20} /></div>
          </div>
          <div className="stat-value" style={{ color: pre ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>{pre ? 'Done' : 'Not Started'}</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>{pre ? 'Assessment completed' : 'Start here first'}</span>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Learning Modules</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(13,148,136,0.1)', color: 'var(--color-secondary)' }}><BookOpen size={20} /></div>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-secondary)' }}>{intervDone}/{intervTotal}</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
            {intervTotal === 0 ? 'Assigned after assessment' : `${intervTotal - intervDone} module${intervTotal - intervDone !== 1 ? 's' : ''} remaining`}
          </span>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Overall Progress</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(212,160,23,0.12)', color: 'var(--color-accent)' }}><Activity size={20} /></div>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-accent)' }}>{pct.toFixed(0)}%</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>{postUnlocked ? 'Post-Assessment ready!' : 'Keep going!'}</span>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Post-Assessment</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(22,163,74,0.1)', color: 'var(--color-success)' }}><Trophy size={20} /></div>
          </div>
          <div className="stat-value" style={{ color: post ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>{post ? 'Completed' : postUnlocked ? 'Ready!' : 'Locked'}</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>{post ? 'Program complete!' : postUnlocked ? 'You can take it now' : 'Finish all modules first'}</span>
        </div>
      </div>

      {/* Two-column: Journey + TPB Scores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

        <Card glow="primary">
          <div className="card-header" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h2 className="card-title">Your Learning Journey</h2>
              <p className="card-subtitle">Four steps to complete the program</p>
            </div>
            <span className="badge badge-primary">{post ? 'Done' : `${pct.toFixed(0)}%`}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {journeySteps.map((s) => (
              <JourneyStep key={s.label} {...s} navigate={navigate} />
            ))}
          </div>
        </Card>

        {displayScores ? (
          <Card glow="cyan">
            <div className="card-header" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h2 className="card-title">
                  <TrendingUp size={17} color="var(--color-primary)" style={{ marginRight: 6 }} />
                  TPB Construct Scores
                </h2>
                <p className="card-subtitle">
                  {post ? 'Post-assessment scores — showing improvement after learning.' : 'Your baseline scores from the Pre-Assessment.'}
                </p>
              </div>
              {data?.deltas && (
                <Badge variant="success">
                  +{(((data.deltas.attitude || 0) + (data.deltas.subjective_norm || 0) + (data.deltas.pbc || 0) + (data.deltas.behavioral_intention || 0)) / 4).toFixed(1)} avg
                </Badge>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {CONSTRUCTS.map((c) => (
                <ConstructScoreRow
                  key={c.key}
                  label={c.label}
                  score={displayScores[c.key]}
                  color={c.color}
                  preScore={pre?.[c.key]}
                  postScore={post?.[c.key]}
                />
              ))}
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.76rem', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
              Scores below 60% are targeted for personalised learning.
              {post && ' Delta badges show improvement since Pre-Assessment.'}
            </div>
          </Card>
        ) : (
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 220, textAlign: 'center', gap: '1rem', color: 'var(--color-text-muted)' }}>
              <Lock size={32} strokeWidth={1.5} />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>TPB Scores Locked</div>
                <div style={{ fontSize: '0.84rem' }}>Complete the Pre-Assessment to see your construct scores.</div>
              </div>
              <Link to="/assessment?stage=pre">
                <Button variant="primary" size="sm" iconRight={<ArrowRight size={14} />}>Take Pre-Assessment</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>

      {/* Personalized Feedback */}
      {data?.feedback_text?.length > 0 && (
        <Card glow="primary">
          <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>
            <Sparkles size={17} color="var(--color-accent)" style={{ marginRight: 6 }} />
            Your Personalized Feedback
          </h2>
          <div className="feedback-messages">
            {data.feedback_text.map((msg, i) => (
              <div key={i} className="feedback-message">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <Sparkles size={15} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: 3 }} />
                  <div>{msg}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty state */}
      {!pre && (
        <EmptyState
          icon={<ClipboardList size={36} color="var(--color-primary)" />}
          title="Ready to Get Started?"
          description="You haven't taken the Pre-Assessment yet. It only takes about 10 minutes and will create a personalised learning plan just for you."
          actionLabel="Take the Pre-Assessment"
          onAction={() => navigate('/assessment?stage=pre')}
        />
      )}

    </motion.div>
    </PageContainer>
  );
}
