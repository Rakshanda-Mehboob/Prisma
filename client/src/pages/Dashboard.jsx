import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { dashboardApi } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight, TrendingUp, BookOpen, ClipboardList,
  Trophy, Shield, AlertTriangle,
  Activity, Sparkles, Zap
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton, { SkeletonCard } from '../components/ui/Skeleton';
import ThreatGauge from '../components/cyber/ThreatGauge';
import EmptyState from '../components/ui/EmptyState';

const CONSTRUCT_COLORS = {
  attitude: 'var(--color-primary)',
  subjective_norm: 'var(--color-secondary)',
  pbc: 'var(--color-accent)',
  behavioral_intention: '#059669',
};

function ScoreBar({ label, preScore, postScore, color }) {
  const currentScore = postScore ?? preScore ?? 0;
  const isWeak = currentScore < 60;

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{label}</span>
          {isWeak && preScore != null && (
            <Badge variant="warning" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>
              Target Area
            </Badge>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', fontFamily: 'var(--font-mono)' }}>
          {preScore != null && (
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
              Pre: {preScore.toFixed(0)}
            </span>
          )}
          {postScore != null && (
            <>
              <span style={{ color: 'var(--color-border)' }}>→</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color }}>
                Post: {postScore.toFixed(0)}
              </span>
              {preScore != null && (
                <span className={`delta-badge ${postScore - preScore >= 0 ? 'delta-positive' : 'delta-negative'}`}>
                  {postScore - preScore >= 0 ? '+' : ''}{(postScore - preScore).toFixed(1)}
                </span>
              )}
            </>
          )}
        </div>
      </div>
      <div className="score-bar-track">
        {preScore != null && (
          <div
            className="score-bar-fill"
            style={{
              width: `${Math.min(100, Math.max(5, currentScore))}%`,
              background: `linear-gradient(90deg, ${color}88, ${color})`,
              boxShadow: `0 2px 6px ${color}33`,
            }}
          />
        )}
      </div>
    </div>
  );
}

function StageSteps({ preCompleted, intervCompleted, postCompleted }) {
  const steps = [
    { label: 'Pre Assessment', done: preCompleted, icon: '📋', route: '/assessment?stage=pre' },
    { label: 'Learning Modules', done: intervCompleted, icon: '📚', route: '/interventions' },
    { label: 'Post Assessment', done: postCompleted, icon: '📊', route: '/assessment?stage=post' },
    { label: 'Feedback', done: postCompleted, icon: '🏆', route: '/feedback' },
  ];

  const currentIdx = steps.findIndex((s) => !s.done);

  return (
    <div className="stage-steps">
      {steps.map((s, i) => {
        const isCurrent = i === currentIdx;
        return (
          <React.Fragment key={i}>
            <div className="stage-step">
              <div className={`stage-dot ${s.done ? 'done' : isCurrent ? 'active' : ''}`}>
                {s.done ? '✓' : s.icon}
              </div>
              <span className="stage-label" style={{ color: s.done ? 'var(--color-success)' : isCurrent ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`stage-line ${steps[i].done && steps[i + 1].done ? 'filled' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="80px" width="50%" />
        <div className="stats-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <Skeleton height="320px" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ paddingTop: '2rem' }}>
        <div className="alert alert-danger">
          <AlertTriangle size={18} />
          <div>
            <strong>Something went wrong:</strong> {error}
          </div>
        </div>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  const pre = data?.pre_scores;
  const post = data?.post_scores;
  const pct = data?.completion_percent ?? 0;
  const intervDone = data?.completed_interventions ?? 0;
  const intervTotal = data?.total_interventions ?? 0;
  const postUnlocked = data?.post_unlocked ?? false;

  // Average attitude & behavioral health index (0 - 100) — weighted composite per TPB
  const currentScores = post || pre;
  const hasBI = currentScores?.behavioral_intention != null;
  const meanScore = currentScores
    ? Math.round(
        hasBI
          ? (currentScores.attitude || 0) * 0.22 +
            (currentScores.subjective_norm || 0) * 0.22 +
            (currentScores.pbc || 0) * 0.28 +
            (currentScores.behavioral_intention || 0) * 0.28
          : ((currentScores.attitude || 0) +
             (currentScores.subjective_norm || 0) +
             (currentScores.pbc || 0)) / 3
      )
    : 0;

  // Data for bar chart (all 4 constructs)
  const barData = [
    { name: 'Attitude', Pre: pre?.attitude, Post: post?.attitude },
    { name: 'Subj. Norm', Pre: pre?.subjective_norm, Post: post?.subjective_norm },
    { name: 'PBC', Pre: pre?.pbc, Post: post?.pbc },
    ...(pre?.behavioral_intention != null || post?.behavioral_intention != null
      ? [{ name: 'Action Intent', Pre: pre?.behavioral_intention, Post: post?.behavioral_intention }]
      : []),
  ];

  // Radar chart data (all constructs)
  const radarData = [
    { subject: 'Harm Empathy (Attitude)', Pre: pre?.attitude ?? 0, Post: post?.attitude ?? 0, fullMark: 100 },
    { subject: 'Peer Climate (Norms)', Pre: pre?.subjective_norm ?? 0, Post: post?.subjective_norm ?? 0, fullMark: 100 },
    { subject: 'Reporting Efficacy (PBC)', Pre: pre?.pbc ?? 0, Post: post?.pbc ?? 0, fullMark: 100 },
    ...(pre?.behavioral_intention != null || post?.behavioral_intention != null
      ? [{ subject: 'Action Intent (BI)', Pre: pre?.behavioral_intention ?? 0, Post: post?.behavioral_intention ?? 0, fullMark: 100 }]
      : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      {/* Welcome & Security Posture Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.08), rgba(217, 119, 6, 0.05)), var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <Badge variant="primary" icon={<Sparkles size={12} />}>
              Active Session
            </Badge>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
              CMS: {user?.cms_number || 'ENROLLED'}
            </span>
          </div>

          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
            {user?.login_count <= 1
              ? <>Welcome, {user?.full_name?.split(' ')[0]}! 👋</>
              : <>Welcome back, {user?.full_name?.split(' ')[0]} 👋</>
            }
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', maxWidth: '620px', lineHeight: 1.6 }}>
            {user?.login_count <= 1
              ? "Let's get started — take the Pre Assessment to find out which topics you need to learn about."
              : 'Keep going! Complete your lessons and take the Post Assessment to finish the program.'
            }
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {!pre ? (
            <Link to="/assessment?stage=pre">
              <Button variant="primary" size="lg" iconRight={<ArrowRight size={16} />}>
                Launch Pre-Assessment
              </Button>
            </Link>
          ) : intervDone < intervTotal ? (
            <Link to="/interventions">
              <Button variant="primary" size="lg" iconRight={<ArrowRight size={16} />}>
                Resume Learning ({intervTotal - intervDone} Left)
              </Button>
            </Link>
          ) : postUnlocked && !post ? (
            <Link to="/assessment?stage=post">
              <Button variant="primary" size="lg" iconRight={<ArrowRight size={16} />}>
                Start Post-Assessment
              </Button>
            </Link>
          ) : (
            <Link to="/interventions">
              <Button variant="secondary" size="lg" icon={<BookOpen size={16} />}>
                Review Modules
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stage Progress Stepper */}
      <Card glow="primary">
        <div className="card-header" style={{ marginBottom: '0.5rem' }}>
          <div>
            <h2 className="card-title">Your Learning Journey</h2>
            <p className="card-subtitle">Follow these four steps to complete the program</p>
          </div>
          <span className="badge badge-primary">
            {post ? 'All Done! 🎉' : `${pct.toFixed(0)}% Done`}
          </span>
        </div>
        <StageSteps
          preCompleted={!!pre}
          intervCompleted={intervTotal > 0 && intervDone === intervTotal}
          postCompleted={!!post}
        />
      </Card>

      {/* 4 Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Pre Assessment</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(79, 70, 229, 0.09)', color: 'var(--color-primary)' }}>
              <ClipboardList size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: pre ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
            {pre ? 'Done ✓' : 'Not Started'}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
            {pre ? 'Pre Assessment completed' : 'Start here to begin'}
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Learning Modules</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(13, 148, 136, 0.1)', color: 'var(--color-secondary)' }}>
              <BookOpen size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-secondary)' }}>
            {intervDone}/{intervTotal}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
            {intervTotal === 0 ? 'No Module assigned yet' : `${intervTotal - intervDone} Module${intervTotal - intervDone !== 1 ? 's' : ''} left`}
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Overall Progress</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(212, 160, 23, 0.12)', color: 'var(--color-accent)' }}>
              <Activity size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-accent)' }}>
            {pct.toFixed(0)}%
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
            {postUnlocked ? 'Post Assessment is ready!' : 'Keep going!'}
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Post Assessment</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(22, 163, 74, 0.1)', color: 'var(--color-success)' }}>
              <Trophy size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: post ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
            {post ? 'Completed ✓' : postUnlocked ? 'Ready!' : 'Locked'}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
            {post ? 'All done — great work!' : postUnlocked ? 'You can take it now' : 'Finish all Modules first'}
          </span>
        </div>
      </div>

      {/* Main Analytics: Threat Gauge & TPB Profile Radar */}
      {pre && (
        <div className="charts-grid">
          {/* Left: Threat Gauge & Construct Bars */}
          <Card glow="cyan">
            <h2 className="card-title" style={{ marginBottom: '1.5rem' }}>
              <Shield size={18} color="var(--color-primary)" />
              Cyber Risk Posture & Construct Breakdown
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
              <ThreatGauge score={meanScore} label="Composite TPB Anti-Bullying Score" />

              <div>
                <ScoreBar
                  label="Attitude"
                  preScore={pre.attitude}
                  postScore={post?.attitude}
                  color={CONSTRUCT_COLORS.attitude}
                />
                <ScoreBar
                  label="Subjective Norms"
                  preScore={pre.subjective_norm}
                  postScore={post?.subjective_norm}
                  color={CONSTRUCT_COLORS.subjective_norm}
                />
                <ScoreBar
                  label="Perceived Control"
                  preScore={pre.pbc}
                  postScore={post?.pbc}
                  color={CONSTRUCT_COLORS.pbc}
                />
                <ScoreBar
                  label="Action Intention"
                  preScore={pre.behavioral_intention}
                  postScore={post?.behavioral_intention}
                  color={CONSTRUCT_COLORS.behavioral_intention}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.75rem' }}>
                  Scores below 60 are targeted for personalized skill reinforcement.
                </div>
              </div>
            </div>
          </Card>

          {/* Right: TPB Radar Visualizer */}
          <Card glow="primary">
            <h2 className="card-title" style={{ marginBottom: '1rem' }}>
              <Zap size={18} color="var(--color-primary)" />
              Your Skill Profile
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Shows how your scores changed before and after completing the lessons.
            </p>

            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} outerRadius={85}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 10 }} />
                <Radar
                  name="Pre-Assessment"
                  dataKey="Pre"
                  stroke="#0f766e"
                  fill="#0f766e"
                  fillOpacity={0.16}
                  strokeWidth={2}
                />
                {post && (
                  <Radar
                    name="Post-Assessment"
                    dataKey="Post"
                    stroke="#d97706"
                    fill="#d97706"
                    fillOpacity={0.18}
                    strokeWidth={2}
                  />
                )}
                <Legend wrapperStyle={{ fontSize: 12, color: '#57534e' }} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  labelStyle={{ color: '#1c1917', fontSize: 12, fontWeight: 600 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Comparative Score Bar Chart (Pre vs Post) */}
      {pre && (
        <Card>
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <TrendingUp size={18} color="var(--color-primary)" />
                Score Comparison (0–100)
              </h2>
              <p className="card-subtitle">
                {post
                  ? 'See how much you improved across all four TPB dimensions after completing your lessons.'
                  : 'Your initial scores are saved. Finish your lessons and take the final quiz to see your improvement.'}
              </p>
            </div>
            {data?.deltas && (
              <Badge variant="success">
                Avg Delta: +{(((data.deltas.attitude || 0) + (data.deltas.subjective_norm || 0) + (data.deltas.pbc || 0) + (data.deltas.behavioral_intention || 0)) / 4).toFixed(1)}
              </Badge>
            )}
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fill: '#57534e', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#57534e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                labelStyle={{ color: '#1c1917', fontSize: 12, fontWeight: 600 }}
                itemStyle={{ fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: '#57534e' }} />
              <Bar dataKey="Pre" fill="#0f766e" radius={[6, 6, 0, 0]} maxBarSize={36} />
              {post && <Bar dataKey="Post" fill="#d97706" radius={[6, 6, 0, 0]} maxBarSize={36} />}
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Personalized AI / Rule-Based Feedback Messages */}
      {data?.feedback_text?.length > 0 && (
        <Card glow="primary">
          <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>
            <Trophy size={18} color="var(--color-accent)" />
            Your Personalized Feedback
          </h2>
          <div className="feedback-messages">
            {data.feedback_text.map((msg, i) => (
              <div key={i} className="feedback-message">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <Sparkles size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: 3 }} />
                  <div>{msg}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty State when no assessment started */}
      {!pre && (
        <EmptyState
          icon={<ClipboardList size={36} color="var(--color-primary)" />}
          title="Ready to Get Started?"
          description="You haven't taken the Pre Assessment yet. It only takes about 10 minutes and will help us create a personalised learning plan just for you."
          actionLabel="Take the Pre Assessment"
          onAction={() => navigate('/assessment?stage=pre')}
        />
      )}

    </motion.div>
  );
}
