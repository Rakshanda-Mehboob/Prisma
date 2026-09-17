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
  Trophy, Zap, Shield, AlertTriangle,
  Activity, Sparkles, Terminal
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton, { SkeletonCard } from '../components/ui/Skeleton';
import ThreatGauge from '../components/cyber/ThreatGauge';
import EmptyState from '../components/ui/EmptyState';

const CONSTRUCT_COLORS = {
  attitude: '#8b5cf6',
  subjective_norm: '#00f5ff',
  pbc: '#10b981',
};

function ScoreBar({ label, preScore, postScore, color }) {
  const currentScore = postScore ?? preScore ?? 0;
  const isWeak = currentScore < 60;

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text)' }}>{label}</span>
          {isWeak && preScore != null && (
            <Badge variant="warning" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>
              Target Area
            </Badge>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', fontFamily: 'var(--font-mono)' }}>
          {preScore != null && (
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-subtle)' }}>
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
              background: `linear-gradient(90deg, ${color}66, ${color})`,
              boxShadow: `0 0 10px ${color}44`,
            }}
          />
        )}
      </div>
    </div>
  );
}

function StageSteps({ preCompleted, intervCompleted, postCompleted }) {
  const steps = [
    { label: 'Baseline Audit', done: preCompleted, icon: '📋', route: '/assessment?stage=pre' },
    { label: 'Targeted Modules', done: intervCompleted, icon: '📚', route: '/interventions' },
    { label: 'Post-Audit', done: postCompleted, icon: '📊', route: '/assessment?stage=post' },
    { label: 'Evaluation & ROI', done: postCompleted, icon: '🏆', route: '/feedback' },
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
              <span className="stage-label" style={{ color: s.done ? 'var(--color-success-light)' : isCurrent ? '#fff' : 'var(--color-text-subtle)' }}>
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
      .catch(() => setError('Failed to connect with security telemetry engine.'))
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
            <strong>Telemetry Connection Error:</strong> {error}
          </div>
        </div>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Retry Telemetry Sync
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

  // Average attitude & behavioral health index (0 - 100)
  const currentScores = post || pre;
  const meanScore = currentScores
    ? Math.round(((currentScores.attitude || 0) + (currentScores.subjective_norm || 0) + (currentScores.pbc || 0)) / 3)
    : 0;

  // Data for bar chart
  const barData = [
    { name: 'Attitude', Pre: pre?.attitude, Post: post?.attitude },
    { name: 'Subj. Norm', Pre: pre?.subjective_norm, Post: post?.subjective_norm },
    { name: 'PBC', Pre: pre?.pbc, Post: post?.pbc },
  ];

  // Radar chart data
  const radarData = [
    { subject: 'Harm Empathy (Attitude)', Pre: pre?.attitude ?? 0, Post: post?.attitude ?? 0, fullMark: 100 },
    { subject: 'Peer Climate (Norms)', Pre: pre?.subjective_norm ?? 0, Post: post?.subjective_norm ?? 0, fullMark: 100 },
    { subject: 'Reporting Efficacy (PBC)', Pre: pre?.pbc ?? 0, Post: post?.pbc ?? 0, fullMark: 100 },
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
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.18), rgba(0, 245, 255, 0.08)), var(--color-surface)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <Badge variant="cyan" icon={<Sparkles size={12} />}>
              Active Session
            </Badge>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', fontFamily: 'var(--font-mono)' }}>
              CMS: {user?.cms_number || 'ENROLLED'}
            </span>
          </div>

          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
            Welcome back, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', maxWidth: '620px', lineHeight: 1.6 }}>
            Your cognitive cyber defense telemetry is active. Follow your intervention pipeline to reinforce online bystander intervention and reporting readiness.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {!pre ? (
            <Link to="/assessment?stage=pre">
              <Button variant="cyan" size="lg" iconRight={<ArrowRight size={16} />}>
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
              <Button variant="cyan" size="lg" iconRight={<ArrowRight size={16} />}>
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
            <h2 className="card-title">Intervention Pipeline</h2>
            <p className="card-subtitle">Complete all four security stages to graduate your cohort audit</p>
          </div>
          <span className="badge badge-primary">
            {post ? 'Pipeline Completed' : `${pct.toFixed(0)}% Completed`}
          </span>
        </div>
        <StageSteps
          preCompleted={!!pre}
          intervCompleted={intervTotal > 0 && intervDone === intervTotal}
          postCompleted={!!post}
        />
      </Card>

      {/* 4 Telemetry Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Baseline Audit</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(124, 58, 237, 0.12)', color: 'var(--color-primary-light)' }}>
              <ClipboardList size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: pre ? 'var(--color-primary-light)' : 'var(--color-text-subtle)' }}>
            {pre ? 'COMPLETED' : 'PENDING'}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)' }}>
            {pre ? 'Pre-stage diagnostic verified' : 'Required before module release'}
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Active Modules</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(0, 245, 255, 0.12)', color: 'var(--color-accent)' }}>
              <BookOpen size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-accent)' }}>
            {intervDone}/{intervTotal}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)' }}>
            {intervTotal === 0 ? 'No modules assigned yet' : `${intervTotal - intervDone} modules remaining`}
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Module Completion</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--color-warning)' }}>
              <Activity size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>
            {pct.toFixed(0)}%
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)' }}>
            {postUnlocked ? 'Post-assessment unlocked' : 'Post-assessment locked'}
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Post-Intervention Audit</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-success-light)' }}>
              <Trophy size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: post ? 'var(--color-success-light)' : 'var(--color-text-subtle)' }}>
            {post ? 'VERIFIED' : postUnlocked ? 'UNLOCKED' : 'LOCKED'}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)' }}>
            {post ? 'Behavioral delta computed' : postUnlocked ? 'Ready to take now' : 'Requires module completion'}
          </span>
        </div>
      </div>

      {/* Main Analytics: Threat Gauge & TPB Profile Radar */}
      {pre && (
        <div className="charts-grid">
          {/* Left: Threat Gauge & Construct Bars */}
          <Card glow="cyan">
            <h2 className="card-title" style={{ marginBottom: '1.5rem' }}>
              <Shield size={18} color="var(--color-accent)" />
              Cyber Risk Posture & Construct Breakdown
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
              <ThreatGauge score={meanScore} label="Composite TPB Anti-Bullying Score" />

              <div>
                <ScoreBar
                  label="Harm Attitude"
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
                  label="Perceived Control (PBC)"
                  preScore={pre.pbc}
                  postScore={post?.pbc}
                  color={CONSTRUCT_COLORS.pbc}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginTop: '0.75rem' }}>
                  Scores below 60/100 indicate high-risk vulnerability points targeted by intervention.
                </div>
              </div>
            </div>
          </Card>

          {/* Right: TPB Radar Visualizer */}
          <Card glow="primary">
            <h2 className="card-title" style={{ marginBottom: '1rem' }}>
              <Zap size={18} color="var(--color-primary-light)" />
              TPB Multi-Axis Cognitive Profile
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Compares pre-baseline footprint against post-intervention behavioral maturation.
            </p>

            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} outerRadius={85}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar
                  name="Pre-Assessment"
                  dataKey="Pre"
                  stroke="#7c3aed"
                  fill="#7c3aed"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                {post && (
                  <Radar
                    name="Post-Assessment"
                    dataKey="Post"
                    stroke="#00f5ff"
                    fill="#00f5ff"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                )}
                <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ background: '#0d1224', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                  labelStyle={{ color: '#f8fafc', fontSize: 12 }}
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
                <TrendingUp size={18} color="var(--color-accent)" />
                Trajectory Score Comparison (0–100)
              </h2>
              <p className="card-subtitle">
                {post
                  ? 'Verifiable shift across behavioral attitude, peer norms, and intervention efficacy'
                  : 'Baseline metrics recorded. Complete modules and post-assessment to view comparative growth.'}
              </p>
            </div>
            {data?.deltas && (
              <Badge variant="success">
                Avg Delta: +{(((data.deltas.attitude || 0) + (data.deltas.subjective_norm || 0) + (data.deltas.pbc || 0)) / 3).toFixed(1)}
              </Badge>
            )}
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0d1224', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                labelStyle={{ color: '#f8fafc', fontSize: 12 }}
                itemStyle={{ fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              <Bar dataKey="Pre" fill="#7c3aed" radius={[6, 6, 0, 0]} maxBarSize={36} />
              {post && <Bar dataKey="Post" fill="#00f5ff" radius={[6, 6, 0, 0]} maxBarSize={36} />}
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Personalized AI / Rule-Based Feedback Messages */}
      {data?.feedback_text?.length > 0 && (
        <Card glow="primary">
          <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>
            <Trophy size={18} color="var(--color-warning)" />
            AI Diagnostic Insights & Personalized Feedback
          </h2>
          <div className="feedback-messages">
            {data.feedback_text.map((msg, i) => (
              <div key={i} className="feedback-message">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <Sparkles size={16} color="var(--color-primary-light)" style={{ flexShrink: 0, marginTop: 3 }} />
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
          icon={<ClipboardList size={36} color="var(--color-accent)" />}
          title="No Baseline Telemetry Recorded"
          description="You have not completed your TPB baseline pre-assessment yet. Take the 10-minute diagnostic to unlock personalized learning modules and start monitoring your cyber risk footprint."
          actionLabel="Start Pre-Assessment Now"
          onAction={() => navigate('/assessment?stage=pre')}
        />
      )}

      {/* Quick Actions & Security Audit Trail */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Quick Actions Launchpad */}
        <Card>
          <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>
            <Zap size={16} color="var(--color-accent)" />
            Quick Launchpad
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              to="/assessment"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem 1rem',
                background: 'var(--color-surface-2)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                transition: 'var(--transition)',
              }}
              className="card-hover"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ClipboardList size={18} color="var(--color-primary-light)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Assessment Center</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>
                    {pre ? (post ? 'Assessments complete' : 'Post-assessment') : 'Start pre-assessment'}
                  </div>
                </div>
              </div>
              <ChevronRight size={16} color="var(--color-text-subtle)" />
            </Link>

            <Link
              to="/interventions"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem 1rem',
                background: 'var(--color-surface-2)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                transition: 'var(--transition)',
              }}
              className="card-hover"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <BookOpen size={18} color="var(--color-accent)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Assigned Learning Modules</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>
                    {intervDone} of {intervTotal} completed
                  </div>
                </div>
              </div>
              <ChevronRight size={16} color="var(--color-text-subtle)" />
            </Link>

            <Link
              to="/feedback"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem 1rem',
                background: 'var(--color-surface-2)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                transition: 'var(--transition)',
              }}
              className="card-hover"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Trophy size={18} color="var(--color-warning)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Evaluation & Feedback</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>
                    Submit module rating & thoughts
                  </div>
                </div>
              </div>
              <ChevronRight size={16} color="var(--color-text-subtle)" />
            </Link>
          </div>
        </Card>

        {/* Security Audit Feed */}
        <Card>
          <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>
            <Terminal size={16} color="var(--color-primary-light)" />
            Session Audit Trail
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>AUTH: Token validated</span>
              <span style={{ color: 'var(--color-success)' }}>SUCCESS</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>PRE_AUDIT: {pre ? 'Archived' : 'Awaiting initialization'}</span>
              <span style={{ color: pre ? 'var(--color-accent)' : 'var(--color-warning)' }}>
                {pre ? 'VERIFIED' : 'PENDING'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>MODULE_ENGINE: {intervTotal} items mapped</span>
              <span style={{ color: intervDone === intervTotal && intervTotal > 0 ? 'var(--color-success)' : 'var(--color-text-subtle)' }}>
                {intervDone}/{intervTotal}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>POST_GATEWAY: {postUnlocked ? 'Unlocked' : 'Locked'}</span>
              <span style={{ color: postUnlocked ? 'var(--color-success)' : 'var(--color-text-subtle)' }}>
                {postUnlocked ? 'ACTIVE' : 'LOCKED'}
              </span>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.65rem', color: 'var(--color-text-subtle)', fontSize: '0.75rem' }}>
              Encryption: TLS 1.3 • Zero-Trust Access Token
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

function ChevronRight({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
