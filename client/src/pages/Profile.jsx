import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { dashboardApi, assessmentApi, authApi } from '../api';
import {
  User, Shield, Mail, Award, Clock, CheckCircle2,
  Calendar, Key, Sparkles, Terminal, Activity, FileText,
  Building2, Home, Edit2, Save, X as CloseIcon
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';

const DEPARTMENTS = [
  'Computer Science',
  'Software Engineering',
  'Information Technology',
  'Electrical Engineering',
  'Business Administration',
  'Psychology',
  'Education',
  'Medical Sciences',
  'Law',
  'Other',
];

const LIVING_SITUATIONS = [
  'University Hostel / On-Campus',
  'Home with Parents / Family',
  'Off-Campus Shared Accommodation',
  'Independent / Solo Apartment',
  'Other',
];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inline editing state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ department: '', living_situation: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    Promise.all([dashboardApi.getDashboard(), assessmentApi.getStatus()])
      .then(([dashRes, statRes]) => {
        setDashboardData(dashRes.data);
        setStatusData(statRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const startEditing = () => {
    setEditForm({
      department: user?.department || '',
      living_situation: user?.living_situation || '',
    });
    setSaveError('');
    setSaveSuccess(false);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setSaveError('');
  };

  const saveProfile = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const res = await authApi.updateProfile({
        department: editForm.department || null,
        living_situation: editForm.living_situation || null,
      });
      // Update global user state so other parts of the app reflect new profile
      updateUser(res.data);
      setSaveSuccess(true);
      setEditing(false);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setSaveError(typeof detail === 'string' ? detail : 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const pre = dashboardData?.pre_scores;
  const post = dashboardData?.post_scores;
  const total = dashboardData?.total_interventions ?? 0;
  const completed = dashboardData?.completed_interventions ?? 0;

  const achievements = [
    {
      id: 'enrollment',
      title: 'Cohort Sentinel',
      desc: 'Enrolled in institutional anti-cyberbullying cohort',
      unlocked: true,
      icon: '🛡️',
    },
    {
      id: 'pre-audit',
      title: 'Baseline Audited',
      desc: 'Successfully mapped initial TPB cognitive constructs',
      unlocked: !!pre,
      icon: '📋',
    },
    {
      id: 'modules-done',
      title: 'Intervention Master',
      desc: 'Completed all assigned personalized learning modules',
      unlocked: total > 0 && completed === total,
      icon: '📚',
    },
    {
      id: 'post-audit',
      title: 'Behavioral Delta Certified',
      desc: 'Graduated through the post-intervention assessment',
      unlocked: !!post,
      icon: '🏆',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      {/* Header Profile Identity Card */}
      <Card glow="primary">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 800,
              color: '#fff',
              boxShadow: '0 0 30px var(--color-primary-glow)',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>

          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
                {user?.full_name || 'Enrolled Student'}
              </h1>
              <Badge variant="cyan">{user?.role === 'admin' ? 'Security Admin' : 'Student Sentinel'}</Badge>
              <Badge variant="primary">CMS: {user?.cms_number || 'N/A'}</Badge>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.86rem', color: 'var(--color-text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Mail size={14} color="var(--color-accent)" /> {user?.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Calendar size={14} color="var(--color-primary-light)" /> Enrolled {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Context — Department & Living Situation */}
      <Card glow="primary">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 className="card-title" style={{ margin: 0 }}>
            <Sparkles size={18} color="var(--color-primary-light)" />
            Profile Context
          </h2>
          {!editing ? (
            <Button variant="secondary" size="sm" onClick={startEditing} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Edit2 size={13} /> Edit Profile
            </Button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="primary" size="sm" loading={saving} onClick={saveProfile} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Save size={13} /> Save
              </Button>
              <Button variant="ghost" size="sm" onClick={cancelEditing} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CloseIcon size={13} /> Cancel
              </Button>
            </div>
          )}
        </div>

        {saveError && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{saveError}</div>}
        {saveSuccess && (
          <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
            <CheckCircle2 size={14} /> Profile updated successfully.
          </div>
        )}

        <p style={{ fontSize: '0.83rem', color: 'var(--color-text-subtle)', marginBottom: '1.25rem' }}>
          Your department and living situation help the AI generate contextually relevant cyberbullying scenarios tailored to your environment.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {/* Department */}
          <div
            style={{
              padding: '1rem 1.25rem',
              background: 'var(--color-surface-2)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: '0.5rem' }}>
              <Building2 size={15} color="var(--color-primary-light)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Department
              </span>
            </div>
            {editing ? (
              <select
                className="form-input"
                style={{ marginTop: 4 }}
                value={editForm.department}
                onChange={(e) => setEditForm((f) => ({ ...f, department: e.target.value }))}
                id="profile-department"
              >
                <option value="">Not specified</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            ) : (
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: user?.department ? '#fff' : 'var(--color-text-subtle)' }}>
                {user?.department || <span style={{ fontStyle: 'italic' }}>Not set — click Edit to add</span>}
              </div>
            )}
          </div>

          {/* Living Situation */}
          <div
            style={{
              padding: '1rem 1.25rem',
              background: 'var(--color-surface-2)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: '0.5rem' }}>
              <Home size={15} color="var(--color-accent)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Living Situation
              </span>
            </div>
            {editing ? (
              <select
                className="form-input"
                style={{ marginTop: 4 }}
                value={editForm.living_situation}
                onChange={(e) => setEditForm((f) => ({ ...f, living_situation: e.target.value }))}
                id="profile-living-situation"
              >
                <option value="">Not specified</option>
                {LIVING_SITUATIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            ) : (
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: user?.living_situation ? '#fff' : 'var(--color-text-subtle)' }}>
                {user?.living_situation || <span style={{ fontStyle: 'italic' }}>Not set — click Edit to add</span>}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Grid: Assessment History & Milestones */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Assessment Timeline */}
        <Card glow="cyan">
          <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>
            <Activity size={18} color="var(--color-accent)" />
            Assessment Telemetry History
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Pre Assessment Row */}
            <div
              style={{
                background: 'var(--color-surface-2)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>
                  Pre-Assessment (Baseline)
                </span>
                <span className={`badge ${pre ? 'badge-success' : 'badge-muted'}`}>
                  {pre ? 'Completed' : 'Pending'}
                </span>
              </div>

              {pre ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                  <div>Attitude: <strong style={{ color: 'var(--color-primary-light)' }}>{pre.attitude?.toFixed(0)}</strong></div>
                  <div>Norms: <strong style={{ color: 'var(--color-accent)' }}>{pre.subjective_norm?.toFixed(0)}</strong></div>
                  <div>PBC: <strong style={{ color: 'var(--color-success-light)' }}>{pre.pbc?.toFixed(0)}</strong></div>
                </div>
              ) : (
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-subtle)' }}>
                  Initial diagnostic has not been recorded yet.
                </p>
              )}
            </div>

            {/* Post Assessment Row */}
            <div
              style={{
                background: 'var(--color-surface-2)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>
                  Post-Assessment (Maturation)
                </span>
                <span className={`badge ${post ? 'badge-success' : 'badge-muted'}`}>
                  {post ? 'Completed' : 'Locked / Pending'}
                </span>
              </div>

              {post ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                  <div>Attitude: <strong style={{ color: 'var(--color-primary-light)' }}>{post.attitude?.toFixed(0)}</strong></div>
                  <div>Norms: <strong style={{ color: 'var(--color-accent)' }}>{post.subjective_norm?.toFixed(0)}</strong></div>
                  <div>PBC: <strong style={{ color: 'var(--color-success-light)' }}>{post.pbc?.toFixed(0)}</strong></div>
                </div>
              ) : (
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-subtle)' }}>
                  Unlocks when all personalized modules have been marked finished.
                </p>
              )}
            </div>

            {/* Trajectory Delta */}
            {dashboardData?.deltas && (
              <div style={{ padding: '0.85rem 1rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-success-light)', marginBottom: 4 }}>
                  ✓ Quantified Behavioral Growth Verified
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Attitude Delta: +{dashboardData.deltas.attitude} • Norms Delta: +{dashboardData.deltas.subjective_norm} • PBC Delta: +{dashboardData.deltas.pbc}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Milestone & Achievement Badges */}
        <Card>
          <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>
            <Award size={18} color="var(--color-warning)" />
            Earned Behavioral Milestones
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {achievements.map((ach) => (
              <div
                key={ach.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.85rem 1rem',
                  background: 'var(--color-surface-2)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  opacity: ach.unlocked ? 1 : 0.45,
                }}
              >
                <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{ach.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
                    {ach.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {ach.desc}
                  </div>
                </div>
                {ach.unlocked ? (
                  <span className="badge badge-success">Unlocked</span>
                ) : (
                  <span className="badge badge-muted">Locked</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Account Security Settings */}
      <Card>
        <h2 className="card-title" style={{ marginBottom: '1rem' }}>
          <Key size={18} color="var(--color-primary-light)" />
          Account Credentials &amp; Security
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: 4 }}>
              Password Encryption
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.85rem' }}>
              Your credentials are cryptographically protected using salted PBKDF2-SHA256 password hashes.
            </div>
            <Button variant="secondary" size="sm" onClick={() => alert('Password modification is handled via university IT supervisor or demo reset.')}>
              Change Password
            </Button>
          </div>

          <div style={{ padding: '1rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: 4 }}>
              Privacy &amp; Audit Telemetry
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.85rem' }}>
              Individual question answers are confidential and protected by zero-trust student privacy policies.
            </div>
            <span className="badge badge-success">
              <CheckCircle2 size={12} /> Compliance Active
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
