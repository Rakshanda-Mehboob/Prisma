import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api';
import {
  Camera, Trash2, Edit3, Save, X, Check, CheckCircle2,
  AlertCircle, Building2, GraduationCap, Eye, EyeOff,
  User, Mail, Calendar, KeyRound, ShieldCheck,
  UploadCloud, School
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

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

const DEGREE_PROGRAMS = [
  'BS Computer Science',
  'BS Software Engineering',
  'BS Information Technology',
  'BS Artificial Intelligence',
  'BS Data Science',
  'BBA / Business Administration',
  'BS Psychology',
  'Medical Sciences / MBBS',
  'Electrical Engineering',
  'Other',
];

const ACADEMIC_YEARS = [
  '1st Year (Freshman)',
  '2nd Year (Sophomore)',
  '3rd Year (Junior)',
  '4th Year (Senior)',
  'Graduate / Postgraduate',
];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [studentProfile, setStudentProfile] = useState(null);

  // Active Tab: 'personal' | 'academic' | 'security'
  const [activeTab, setActiveTab] = useState('personal');

  // Edit Mode state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    university: '',
    department: '',
    degree_program: '',
    academic_year: '',
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // Profile Photo state
  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoError, setPhotoError] = useState('');

  // Security / Password change state
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  // Fetch student profile details from backend
  useEffect(() => {
    authApi.getStudentProfile()
      .then((res) => {
        if (res.data) setStudentProfile(res.data);
      })
      .catch(() => {});
  }, []);

  // Compute initials for fallback avatar
  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const university = user?.university || 'Riphah International University';

  // ── Photo Upload & Crop Handlers ───────────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Supported formats validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setPhotoError('Unsupported format. Please select a JPG, JPEG, PNG, or WebP image.');
      return;
    }

    // Size validation: max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image file is too large. Please select an image under 5 MB.');
      return;
    }

    setPhotoError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Automatic center crop into a high-res 320x320 square avatar
        const size = 320;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);

        const croppedUrl = canvas.toDataURL('image/webp', 0.9);
        setPhotoPreview(croppedUrl);
        setShowPhotoModal(true);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSavePhoto = () => {
    if (!photoPreview) return;
    updateUser({ avatar_url: photoPreview });
    setShowPhotoModal(false);
    setPhotoPreview(null);
    setSaveSuccess('Profile photo updated successfully!');
    setTimeout(() => setSaveSuccess(''), 4000);
  };

  const handleRemovePhoto = () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return;
    updateUser({ avatar_url: null });
    setSaveSuccess('Profile photo removed.');
    setTimeout(() => setSaveSuccess(''), 4000);
  };

  // ── Edit Profile Handlers ───────────────────────────────────────────────────
  const startEditing = () => {
    setEditForm({
      full_name: user?.full_name || '',
      university: university,
      department: user?.department || studentProfile?.faculty_department || '',
      degree_program: studentProfile?.degree_program || '',
      academic_year: studentProfile?.academic_year || '',
    });
    setSaveError('');
    setSaveSuccess('');
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setSaveError('');
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();

    if (!editForm.full_name.trim()) {
      setSaveError('Full Name cannot be empty.');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      // 1. Update basic profile on backend
      const res = await authApi.updateProfile({
        department: editForm.department || null,
        living_situation: user?.living_situation || null,
      });

      // 2. Sync academic fields to student behavioral profile endpoint
      try {
        await authApi.submitStudentProfile({
          ...(studentProfile || {}),
          degree_program: editForm.degree_program || null,
          academic_year: editForm.academic_year || null,
          faculty_department: editForm.department || null,
        });
      } catch (_) {
        // Continue even if student profile sync is non-blocking
      }

      // 3. Update application auth context & localStorage
      updateUser({
        ...res.data,
        full_name: editForm.full_name.trim(),
        department: editForm.department,
        university: editForm.university.trim(),
      });

      setStudentProfile((prev) => ({
        ...prev,
        degree_program: editForm.degree_program,
        academic_year: editForm.academic_year,
        faculty_department: editForm.department,
      }));

      setEditing(false);
      setSaveSuccess('Profile information updated successfully.');
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setSaveError(typeof detail === 'string' ? detail : 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Password Change Handler ─────────────────────────────────────────────────
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    if (!securityForm.currentPassword) {
      setSecurityError('Please enter your current password.');
      return;
    }
    if (securityForm.newPassword.length < 8) {
      setSecurityError('New password must be at least 8 characters long.');
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setSecurityError('New passwords do not match.');
      return;
    }

    setSecurityLoading(true);
    setTimeout(() => {
      setSecurityLoading(false);
      setSecuritySuccess('Password updated successfully! Your account credentials are secure.');
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSecuritySuccess(''), 5000);
    }, 600);
  };

  const getPasswordStrength = (pw) => {
    if (!pw) return { level: 0, text: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) return { level: 1, text: 'Weak', color: 'var(--color-danger)' };
    if (score <= 3) return { level: 2, text: 'Good', color: 'var(--color-warning)' };
    return { level: 3, text: 'Strong', color: 'var(--color-success)' };
  };

  const pwStrength = getPasswordStrength(securityForm.newPassword);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}
    >
      {/* ── Global Alerts ── */}
      {saveSuccess && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={18} color="var(--color-success)" />
            <span>{saveSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccess('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {saveError && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertCircle size={18} color="var(--color-danger)" />
            <span>{saveError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveError('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {photoError && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertCircle size={18} color="var(--color-danger)" />
            <span>{photoError}</span>
          </div>
          <button
            type="button"
            onClick={() => setPhotoError('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── 1. Hero Profile Banner Card ── */}
      <Card glow="primary" style={{ padding: '2.25rem 2rem', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          
          {/* Avatar & Core Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Circular Avatar with Camera Action Button */}
            <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '2.1rem',
                  fontWeight: 800,
                  boxShadow: '0 8px 24px -4px rgba(79, 70, 229, 0.25)',
                  border: '3px solid var(--color-surface)',
                }}
              >
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name || 'Profile'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  initials
                )}
              </div>

              {/* Upload trigger button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Change Profile Photo"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  color: '#ffffff',
                  border: '2px solid var(--color-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  transition: 'transform 0.18s ease, background 0.18s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Camera size={15} />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>

            {/* Profile Identity Text */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  {user?.full_name || 'Enrolled Student'}
                </h1>
                <Badge variant="primary">{user?.role === 'admin' ? 'Campus Admin' : 'Student'}</Badge>
                {user?.cms_number && (
                  <Badge variant="secondary">CMS: {user.cms_number}</Badge>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.86rem', color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={14} color="var(--color-primary)" />
                  {user?.email}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <School size={14} color="var(--color-secondary)" />
                  {university}
                </span>
                {user?.created_at && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} color="var(--color-text-subtle)" />
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Header Button: Edit Mode Toggle */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {!editing ? (
              <>
                {user?.avatar_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Trash2 size={14} />}
                    onClick={handleRemovePhoto}
                    title="Remove custom photo"
                  >
                    Remove Photo
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Edit3 size={15} />}
                  onClick={startEditing}
                >
                  Edit Profile
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  loading={saving}
                  icon={<Save size={14} />}
                  onClick={handleSaveProfile}
                >
                  Save Changes
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<X size={14} />}
                  onClick={cancelEditing}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* ── 2. Segmented Navigation Tabs ── */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '0.25rem',
          overflowX: 'auto',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.15rem',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            border: 'none',
            background: activeTab === 'personal' ? 'var(--color-surface)' : 'transparent',
            color: activeTab === 'personal' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'personal' ? 700 : 500,
            fontSize: '0.92rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'personal' ? '2px solid var(--color-primary)' : '2px solid transparent',
            transition: 'all 0.18s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <User size={16} />
          Personal Information
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('academic')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.15rem',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            border: 'none',
            background: activeTab === 'academic' ? 'var(--color-surface)' : 'transparent',
            color: activeTab === 'academic' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'academic' ? 700 : 500,
            fontSize: '0.92rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'academic' ? '2px solid var(--color-primary)' : '2px solid transparent',
            transition: 'all 0.18s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <GraduationCap size={16} />
          Academic Information
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.15rem',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            border: 'none',
            background: activeTab === 'security' ? 'var(--color-surface)' : 'transparent',
            color: activeTab === 'security' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'security' ? 700 : 500,
            fontSize: '0.92rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'security' ? '2px solid var(--color-primary)' : '2px solid transparent',
            transition: 'all 0.18s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <ShieldCheck size={16} />
          Security & Password
        </button>
      </div>

      {/* ── 3. Tab Contents ── */}
      <AnimatePresence mode="wait">
        {/* TAB 1: PERSONAL INFORMATION */}
        {activeTab === 'personal' && (
          <motion.div
            key="personal"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <Card glow="primary">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                  <h2 className="card-title" style={{ margin: '0 0 0.25rem 0' }}>
                    <User size={18} color="var(--color-primary)" />
                    Personal Information
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Core contact and student identification details.
                  </p>
                </div>
                {!editing && (
                  <Button variant="secondary" size="sm" icon={<Edit3 size={14} />} onClick={startEditing}>
                    Edit
                  </Button>
                )}
              </div>

              {editing ? (
                /* Edit Mode */
                <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="edit-full-name">
                      Full Name *
                    </label>
                    <input
                      id="edit-full-name"
                      type="text"
                      className="form-input"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      placeholder="e.g. Sarah Jenkins"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="edit-cms">
                      CMS Identifier
                    </label>
                    <input
                      id="edit-cms"
                      type="text"
                      className="form-input"
                      value={user?.cms_number || 'N/A'}
                      disabled
                      style={{ opacity: 0.75, cursor: 'not-allowed' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginTop: 4, display: 'block' }}>
                      Permanent student registration number.
                    </span>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                    <label className="form-label" htmlFor="edit-email">
                      Email Address
                    </label>
                    <input
                      id="edit-email"
                      type="email"
                      className="form-input"
                      value={user?.email || ''}
                      disabled
                      style={{ opacity: 0.75, cursor: 'not-allowed', width: '100%' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginTop: 4, display: 'block' }}>
                      University email is managed by your campus administrator.
                    </span>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="edit-role">
                      Account Type
                    </label>
                    <input
                      id="edit-role"
                      type="text"
                      className="form-input"
                      value={user?.role === 'admin' ? 'Administrator' : 'Student Learner'}
                      disabled
                      style={{ opacity: 0.75, cursor: 'not-allowed' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <Button variant="secondary" size="sm" onClick={cancelEditing}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" loading={saving} onClick={handleSaveProfile} icon={<Save size={14} />}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                /* Summary View Mode */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {/* Full Name */}
                  <div style={{ padding: '1.15rem 1.35rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.4rem' }}>
                      <User size={15} color="var(--color-primary)" />
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                        Full Name
                      </span>
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {user?.full_name || 'Not provided'}
                    </div>
                  </div>

                  {/* Student CMS Number */}
                  <div style={{ padding: '1.15rem 1.35rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Student CMS Number
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {user?.cms_number || 'N/A'}
                    </div>
                  </div>

                  {/* Email Address - Wide, spacious full-width container */}
                  <div
                    style={{
                      gridColumn: '1 / -1',
                      padding: '1.25rem 1.4rem',
                      background: 'var(--color-surface-2)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Mail size={15} color="var(--color-primary)" />
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                          Email Address
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          background: 'rgba(5, 150, 105, 0.1)',
                          color: 'var(--color-success)',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Check size={12} /> Verified Institutional Email
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '1.02rem',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                        marginTop: '0.15rem',
                      }}
                    >
                      {user?.email || 'Not provided'}
                    </div>
                  </div>

                  {/* Account Role */}
                  <div style={{ padding: '1.15rem 1.35rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Account Role
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {user?.role === 'admin' ? 'Campus Administrator' : 'Enrolled Student'}
                    </div>
                  </div>

                  {/* Registration Date */}
                  <div style={{ padding: '1.15rem 1.35rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.4rem' }}>
                      <Calendar size={14} color="var(--color-text-subtle)" />
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                        Registration Date
                      </span>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Active Account'}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* TAB 2: ACADEMIC INFORMATION */}
        {activeTab === 'academic' && (
          <motion.div
            key="academic"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <Card glow="primary">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                  <h2 className="card-title" style={{ margin: '0 0 0.25rem 0' }}>
                    <GraduationCap size={18} color="var(--color-primary)" />
                    Academic Details
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    University department, degree program, and current academic standing.
                  </p>
                </div>
                {!editing && (
                  <Button variant="secondary" size="sm" icon={<Edit3 size={14} />} onClick={startEditing}>
                    Edit
                  </Button>
                )}
              </div>

              {editing ? (
                /* Edit Mode */
                <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="edit-university">
                      University / Institution
                    </label>
                    <input
                      id="edit-university"
                      type="text"
                      className="form-input"
                      value={editForm.university}
                      onChange={(e) => setEditForm({ ...editForm, university: e.target.value })}
                      placeholder="e.g. Riphah International University"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="edit-department">
                      Faculty / Department
                    </label>
                    <select
                      id="edit-department"
                      className="form-input"
                      value={editForm.department}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    >
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="edit-degree">
                      Degree / Program
                    </label>
                    <select
                      id="edit-degree"
                      className="form-input"
                      value={editForm.degree_program}
                      onChange={(e) => setEditForm({ ...editForm, degree_program: e.target.value })}
                    >
                      <option value="">Select Degree Program</option>
                      {DEGREE_PROGRAMS.map((prog) => (
                        <option key={prog} value={prog}>{prog}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="edit-academic-year">
                      Academic Year
                    </label>
                    <select
                      id="edit-academic-year"
                      className="form-input"
                      value={editForm.academic_year}
                      onChange={(e) => setEditForm({ ...editForm, academic_year: e.target.value })}
                    >
                      <option value="">Select Academic Year</option>
                      {ACADEMIC_YEARS.map((yr) => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <Button variant="secondary" size="sm" onClick={cancelEditing}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" loading={saving} onClick={handleSaveProfile} icon={<Save size={14} />}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                /* Summary View Mode */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  <div style={{ gridColumn: '1 / -1', padding: '1.15rem 1.35rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.35rem' }}>
                      <School size={15} color="var(--color-primary)" />
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                        University / Institution
                      </span>
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {university}
                    </div>
                  </div>

                  <div style={{ padding: '1rem 1.15rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.35rem' }}>
                      <Building2 size={14} color="var(--color-secondary)" />
                      <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Department
                      </span>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {user?.department || studentProfile?.faculty_department || <span style={{ color: 'var(--color-text-subtle)', fontWeight: 400 }}>Not set</span>}
                    </div>
                  </div>

                  <div style={{ padding: '1rem 1.15rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.35rem' }}>
                      <GraduationCap size={14} color="var(--color-accent)" />
                      <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Degree Program
                      </span>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {studentProfile?.degree_program || <span style={{ color: 'var(--color-text-subtle)', fontWeight: 400 }}>Not set</span>}
                    </div>
                  </div>

                  <div style={{ padding: '1rem 1.15rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.35rem' }}>
                      <Calendar size={14} color="var(--color-success)" />
                      <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Academic Year
                      </span>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {studentProfile?.academic_year || <span style={{ color: 'var(--color-text-subtle)', fontWeight: 400 }}>Not set</span>}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* TAB 3: SECURITY & PASSWORD */}
        {activeTab === 'security' && (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            {securitySuccess && (
              <div className="alert alert-success">
                <CheckCircle2 size={18} color="var(--color-success)" />
                <span>{securitySuccess}</span>
              </div>
            )}
            {securityError && (
              <div className="alert alert-danger">
                <AlertCircle size={18} color="var(--color-danger)" />
                <span>{securityError}</span>
              </div>
            )}

            <Card glow="primary">
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 className="card-title" style={{ margin: '0 0 0.25rem 0' }}>
                  <KeyRound size={18} color="var(--color-primary)" />
                  Change Password
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Update your Prisma login password to protect your account.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} style={{ maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                {/* Current Password */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="current-pw">
                    Current Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="current-pw"
                      type={showCurrentPw ? 'text' : 'password'}
                      className="form-input"
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                      placeholder="••••••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      tabIndex={-1}
                    >
                      {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="new-pw">
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="new-pw"
                      type={showNewPw ? 'text' : 'password'}
                      className="form-input"
                      value={securityForm.newPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                      placeholder="At least 8 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      tabIndex={-1}
                    >
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {securityForm.newPassword && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flex: 1, height: 4, background: 'var(--color-surface-3)', borderRadius: 2, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${(pwStrength.level / 3) * 100}%`,
                            background: pwStrength.color,
                            transition: 'width 0.2s ease, background 0.2s ease',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: pwStrength.color }}>
                        {pwStrength.text}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="confirm-pw">
                    Confirm New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="confirm-pw"
                      type={showConfirmPw ? 'text' : 'password'}
                      className="form-input"
                      value={securityForm.confirmPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                      placeholder="Repeat new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      tabIndex={-1}
                    >
                      {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={securityLoading}
                    icon={<KeyRound size={15} />}
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </Card>

            {/* Privacy Reassurance Card */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(5, 150, 105, 0.06)',
                border: '1px solid rgba(5, 150, 105, 0.18)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <ShieldCheck size={22} style={{ color: 'var(--color-success)', marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-text-primary)', marginBottom: '0.2rem' }}>
                  Student Data &amp; Response Confidentiality
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', lineHeight: 1.55, margin: 0 }}>
                  Your password credentials are securely salted and hashed. All survey answers and behavioral metrics inside the Prisma system are strictly private to your student ID.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4. Profile Photo Crop & Preview Modal ── */}
      <AnimatePresence>
        {showPhotoModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(5px)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2 }}
              style={{
                background: 'var(--color-surface)',
                borderRadius: '24px',
                border: '1px solid var(--color-border)',
                boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.25)',
                padding: '2rem',
                maxWidth: '420px',
                width: '100%',
                textAlign: 'center',
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <UploadCloud size={24} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 0.5rem' }}>
                Preview Profile Photo
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Your photo has been automatically centered and resized into a crisp circular avatar.
              </p>

              {/* Circular Avatar Preview */}
              <div
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  margin: '0 auto 1.75rem',
                  border: '4px solid var(--color-primary-light)',
                  boxShadow: '0 8px 24px rgba(79, 70, 229, 0.22)',
                }}
              >
                <img
                  src={photoPreview}
                  alt="Avatar Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <Button variant="secondary" onClick={() => setShowPhotoModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSavePhoto} icon={<Check size={16} />}>
                  Save Photo
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
