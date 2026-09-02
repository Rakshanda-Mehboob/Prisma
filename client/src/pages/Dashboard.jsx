/**
 * pages/Dashboard.jsx — Main student dashboard.
 * Shows: stage progress, pre/post score comparison charts,
 * intervention completion %, personalized feedback messages.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { dashboardApi } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight, TrendingUp, BookOpen, ClipboardList,
  CheckCircle2, Lock, Trophy, Zap
} from 'lucide-react';

const CONSTRUCT_LABELS = {
  attitude: 'Attitude',
  subjective_norm: 'Subjective Norm',
  pbc: 'PBC',
};

const CONSTRUCT_COLORS = {
  attitude: '#6366f1',
  subjective_norm: '#06b6d4',
  pbc: '#10b981',
};

function ScoreBar({ label, preScore, postScore, color }) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{label}</span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {preScore != null && (
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)' }}>Pre: {preScore.toFixed(0)}</span>
          )}
          {postScore != null && (
            <>
              <span style={{ color: 'var(--color-border)' }}>→</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color }}>Post: {postScore.toFixed(0)}</span>
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
            style={{ width: `${postScore ?? preScore}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}
          />
        )}
      </div>
    </div>
  );
}

function StageSteps({ preCompleted, intervCompleted, postCompleted }) {
  const steps = [
    { label: 'Pre-Assessment', done: preCompleted, icon: '📋' },
    { label: 'Learning Modules', done: intervCompleted, icon: '📚' },
    { label: 'Post-Assessment', done: postCompleted, icon: '📊' },
    { label: 'Results', done: postCompleted, icon: '🏆' },
  ];

  const currentIdx = steps.findIndex((s) => !s.done);

  return (
    <div className="stage-steps">
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'contents' }}>
          <div className="stage-step">
            <div className={`stage-dot ${s.done ? 'done' : i === currentIdx ? 'active' : ''}`}>
              {s.done ? '✓' : s.icon}
            </div>
            <span className="stage-label">{s.label}</span>
          </div>
          {i < steps.length - 1 && <div className="stage-line" />}
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi.getDashboard()
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const pre = data?.pre_scores;
  const post = data?.post_scores;

  // Build data for bar chart
  const barData = [
    { name: 'Attitude', Pre: pre?.attitude, Post: post?.attitude },
    { name: 'Subj. Norm', Pre: pre?.subjective_norm, Post: post?.subjective_norm },
    { name: 'PBC', Pre: pre?.pbc, Post: post?.pbc },
  ];

  // Radar chart data
  const radarData = [
    { subject: 'Attitude', Pre: pre?.attitude ?? 0, Post: post?.attitude ?? 0 },
    { subject: 'Subj. Norm', Pre: pre?.subjective_norm ?? 0, Post: post?.subjective_norm ?? 0 },
    { subject: 'PBC', Pre: pre?.pbc ?? 0, Post: post?.pbc ?? 0 },
  ];

  const pct = data?.completion_percent ?? 0;
  const intervDone = data?.completed_interventions ?? 0;
  const intervTotal = data?.total_interventions ?? 0;

  return (
    <div>
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-greeting">
          Hello, {user?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="dashboard-subtitle">
          Your cyberbullying awareness journey — Theory of Planned Behavior framework
        </p>
      </div>

      {/* Stage Progress */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h2 className="card-title">Your Progress</h2>
          <p className="card-subtitle">Complete each stage to unlock the next</p>
        </div>
        <StageSteps
          preCompleted={!!pre}
          intervCompleted={intervTotal > 0 && intervDone === intervTotal}
          postCompleted={!!post}
        />
      </div>

      {/* Stats Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.1)' }}>📋</div>
          <div className="stat-value" style={{ color: 'var(--color-primary-light)' }}>
            {pre ? '✓' : '—'}
          </div>
          <div className="stat-label">Pre-Assessment</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.1)' }}>📚</div>
          <div className="stat-value" style={{ color: 'var(--color-accent)' }}>
            {intervDone}/{intervTotal}
          </div>
          <div className="stat-label">Modules Complete</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>⚡</div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>
            {pct.toFixed(0)}%
          </div>
          <div className="stat-label">Overall Progress</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>🏆</div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>
            {post ? '✓' : '—'}
          </div>
          <div className="stat-label">Post-Assessment</div>
        </div>
      </div>

      {/* Progress Bar */}
      {intervTotal > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span className="card-title" style={{ fontSize: '0.9rem' }}>Module Completion</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-accent)' }}>{pct.toFixed(0)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Charts */}
      {pre && (
        <div className="charts-grid">
          {/* Bar Chart */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>
              <TrendingUp size={16} style={{ display: 'inline', marginRight: 6 }} />
              Score Comparison
            </h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                  labelStyle={{ color: '#f1f5f9', fontSize: 12 }}
                  itemStyle={{ color: '#94a3b8', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                <Bar dataKey="Pre" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={32} />
                {post && <Bar dataKey="Post" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={32} />}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>
              <Zap size={16} style={{ display: 'inline', marginRight: 6 }} />
              TPB Profile
            </h2>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData} outerRadius={85}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Radar name="Pre" dataKey="Pre" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.25} strokeWidth={2} />
                {post && <Radar name="Post" dataKey="Post" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />}
                <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                  labelStyle={{ color: '#f1f5f9', fontSize: 12 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Score detail */}
      {pre && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>Construct Scores (0–100)</h2>
          <ScoreBar label="Attitude" preScore={pre.attitude} postScore={post?.attitude} color="#6366f1" />
          <ScoreBar label="Subjective Norm" preScore={pre.subjective_norm} postScore={post?.subjective_norm} color="#06b6d4" />
          <ScoreBar label="Perceived Behavioral Control" preScore={pre.pbc} postScore={post?.pbc} color="#10b981" />
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginTop: '0.75rem' }}>
            Scores below 60 indicate areas targeted for intervention. Higher = more positive anti-cyberbullying behavior.
          </p>
        </div>
      )}

      {/* Personalized Feedback */}
      {data?.feedback_text?.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 className="card-title" style={{ marginBottom: '1rem' }}>
            <Trophy size={16} style={{ display: 'inline', marginRight: 6, color: 'var(--color-warning)' }} />
            Personalized Feedback
          </h2>
          <div className="feedback-messages">
            {data.feedback_text.map((msg, i) => (
              <div key={i} className="feedback-message">{msg}</div>
            ))}
          </div>
        </div>
      )}

      {/* CTA — Next Step */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.05))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontWeight: 600, marginBottom: '0.3rem' }}>
              {!pre ? '📋 Start Pre-Assessment'
               : intervDone < intervTotal ? '📚 Continue Learning Modules'
               : data?.post_unlocked && !post ? '📊 Take Post-Assessment'
               : post ? '🎉 Journey Complete!'
               : '📚 Complete All Modules to Unlock Post-Assessment'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              {!pre ? 'Begin your behavioral assessment to get personalized learning modules.'
               : intervDone < intervTotal ? `${intervTotal - intervDone} module(s) remaining before post-assessment unlocks.`
               : data?.post_unlocked && !post ? 'All modules done! Take the post-assessment to see your growth.'
               : post ? 'View your results and share feedback on the modules.'
               : 'Complete all assigned modules to unlock the post-assessment.'}
            </p>
          </div>
          {!post && (
            <Link
              to={!pre ? '/assessment' : intervDone < intervTotal ? '/interventions' : '/assessment'}
              className="btn btn-primary"
              style={{ flexShrink: 0 }}
            >
              Continue <ArrowRight size={14} />
            </Link>
          )}
          {post && (
            <Link to="/feedback" className="btn btn-secondary" style={{ flexShrink: 0 }}>
              Give Feedback <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
