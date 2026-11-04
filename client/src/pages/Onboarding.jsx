/**
 * pages/Onboarding.jsx — Multi-step Student Profile Setup
 *
 * Collects student background information:
 * - Academic environment (University, Department)
 * - Living situation (Hostel, Home with family, Private accommodation, Shared apartment, Other)
 * - Digital platform usage
 * - Student community context
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';
import OnboardingLayout from '../components/OnboardingLayout';
import {
  GraduationCap, Home, Smartphone, Users,
  CheckCircle2, Sparkles, ArrowRight, ShieldCheck, LayoutDashboard
} from 'lucide-react';

// ── Steps ─────────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 'welcome', label: 'Welcome', icon: Sparkles },
  { id: 'academic', label: 'Academic', icon: GraduationCap },
  { id: 'living', label: 'Accommodation', icon: Home },
  { id: 'digital', label: 'Digital Life', icon: Smartphone },
  { id: 'social', label: 'Community', icon: Users },
  { id: 'complete', label: 'Complete', icon: CheckCircle2 },
];

// ── Options ───────────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  { id: 'Computer Science', label: 'Computer Science', icon: '💻' },
  { id: 'Software Engineering', label: 'Software Engineering', icon: '⚙️' },
  { id: 'Information Technology', label: 'Information Technology', icon: '🌐' },
  { id: 'Engineering', label: 'Engineering', icon: '🔧' },
  { id: 'Psychology', label: 'Psychology', icon: '🧠' },
  { id: 'Medical / Health Sciences', label: 'Medical / Health Sciences', icon: '🏥' },
  { id: 'Business', label: 'Business', icon: '📊' },
  { id: 'Education', label: 'Education', icon: '📚' },
  { id: 'Social Sciences', label: 'Social Sciences', icon: '🏛️' },
  { id: 'Law', label: 'Law', icon: '⚖️' },
  { id: 'Other', label: 'Other', icon: '✏️' },
];

const LIVING_SITUATIONS = [
  {
    id: 'University hostel',
    title: 'University hostel',
    sub: 'On-campus dorms or halls',
    icon: '🏢',
  },
  {
    id: 'Home with family',
    title: 'Home with family',
    sub: 'Living at home & commuting',
    icon: '🏡',
  },
  {
    id: 'Private accommodation',
    title: 'Private housing',
    sub: 'Independent student flat',
    icon: '🛋️',
  },
  {
    id: 'Shared apartment',
    title: 'Shared apartment',
    sub: 'Rented flat with peers',
    icon: '🏘️',
  },
  {
    id: 'Other',
    title: 'Other',
    sub: 'Other living arrangement',
    icon: '📍',
  },
];

const PLATFORMS = [
  { id: 'WhatsApp', label: 'WhatsApp', icon: '💬' },
  { id: 'Instagram', label: 'Instagram', icon: '📸' },
  { id: 'Facebook', label: 'Facebook', icon: '👤' },
  { id: 'TikTok', label: 'TikTok', icon: '🎵' },
  { id: 'Discord', label: 'Discord', icon: '🎮' },
  { id: 'LinkedIn', label: 'LinkedIn', icon: '💼' },
  { id: 'Gaming communities', label: 'Gaming communities', icon: '🕹️' },
  { id: 'University portals', label: 'University portals', icon: '🎓' },
  { id: 'Other', label: 'Other', icon: '🌐' },
];

const INTERACTION_PARTNERS = [
  { id: 'Classmates', label: 'Classmates', icon: '👥' },
  { id: 'Friends', label: 'Friends', icon: '🤝' },
  { id: 'Teachers', label: 'Teachers', icon: '👨‍🏫' },
  { id: 'Professional groups', label: 'Professional groups', icon: '💼' },
  { id: 'Online communities', label: 'Online communities', icon: '🌍' },
  { id: 'Gaming communities', label: 'Gaming communities', icon: '🎮' },
  { id: 'None', label: 'None', icon: '🚫' },
];

const UNIVERSITIES = [
  'Air University',
  'Allama Iqbal Open University (AIOU)',
  'Bahria University',
  'Capital University of Science & Technology (CUST)',
  'COMSATS University Islamabad',
  'FAST – National University of Computer & Emerging Sciences (FAST-NUCES)',
  'Federal Urdu University of Arts, Sciences & Technology (FUUAST)',
  'Foundation University Islamabad',
  'HITEC University',
  'Institute of Space Technology (IST)',
  'International Islamic University Islamabad (IIUI)',
  'National Defence University (NDU)',
  'National Skills University (NSU)',
  'National University of Medical Sciences (NUMS)',
  'National University of Modern Languages (NUML)',
  'National University of Sciences & Technology (NUST)',
  'National University of Technology (NUTECH)',
  'Pakistan Institute of Development Economics (PIDE)',
  'Pakistan Institute of Engineering & Applied Sciences (PIEAS)',
  'Pir Mehr Ali Shah Arid Agriculture University (PMAS-AAUR)',
  'Quaid-i-Azam University (QAU)',
  'Rawalpindi Medical University (RMU)',
  'Rawalpindi Women University (RWU)',
  'Riphah International University',
  'Shaheed Zulfiqar Ali Bhutto Medical University (SZABMU)',
  'Shifa Tameer-e-Millat University',
  'Sir Syed CASE Institute of Technology',
  'Virtual University of Pakistan',
  'Other',
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uniSearch, setUniSearch] = useState('');
  const [uniDropdownOpen, setUniDropdownOpen] = useState(false);

  // Profile state — all start completely empty so nothing is pre-selected
  const [profile, setProfile] = useState({
    university: user?.university || '',
    degree_program: user?.department || '',
    custom_department: '',
    custom_university: '',
    academic_level: 'Undergraduate',
    academic_year: '1st Year',
    living_situation: user?.living_situation || '',
    platforms_used: [],
    online_activity_level: 'Frequently',
    main_interaction_with: '',
    university_groups_participation: '',
  });

  // Pre-fill from user context if user becomes available after mount
  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        university: prev.university || user.university || '',
        degree_program: prev.degree_program || user.department || '',
        living_situation: prev.living_situation || user.living_situation || '',
      }));
    }
  }, [user]);

  // Pre-load existing profile if present
  useEffect(() => {
    authApi.getStudentProfile()
      .then((res) => {
        if (res.data) {
          const d = res.data;
          setProfile((prev) => ({
            ...prev,
            university: d.university || prev.university,
            degree_program: d.degree_program || prev.degree_program,
            academic_level: d.academic_level || prev.academic_level || 'Undergraduate',
            academic_year: d.academic_year || prev.academic_year || '1st Year',
            living_situation: d.living_situation || prev.living_situation,
            platforms_used: d.platforms_used || prev.platforms_used,
            online_activity_level: d.online_activity_level || prev.online_activity_level || 'Frequently',
            main_interaction_with: d.main_interaction_with || prev.main_interaction_with,
            university_groups_participation: d.university_groups_participation || prev.university_groups_participation,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const set = (key, val) => setProfile((p) => ({ ...p, [key]: val }));

  const togglePlatform = (platformId) => {
    setProfile((prev) => {
      const withoutNone = prev.platforms_used.filter((p) => p !== 'None');
      const exists = withoutNone.includes(platformId);
      const updated = exists
        ? withoutNone.filter((p) => p !== platformId)
        : [...withoutNone, platformId];
      return { ...prev, platforms_used: updated };
    });
  };

  const selectNonePlatforms = () => {
    setProfile((prev) => ({
      ...prev,
      platforms_used: prev.platforms_used.includes('None') ? [] : ['None']
    }));
  };

  const totalSteps = STEPS.length;

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) {
      if (!profile.degree_program) return false;
      if (profile.degree_program === 'Other' && !profile.custom_department.trim()) return false;
      if (profile.university === 'Other') return Boolean(profile.custom_university && profile.custom_university.trim());
      return Boolean(profile.university && profile.university.trim() && profile.university !== 'Other');
    }
    if (step === 2) return Boolean(profile.living_situation);
    if (step === 3) return profile.platforms_used.length > 0;
    if (step === 4) return Boolean(profile.main_interaction_with && profile.university_groups_participation);
    return true;
  };

  const handleNext = async () => {
    setError('');
    if (step === totalSteps - 2) {
      // Save profile before moving to complete screen
      setSaving(true);
      try {
        const finalDepartment = profile.degree_program === 'Other' && profile.custom_department.trim()
          ? profile.custom_department.trim()
          : profile.degree_program;

        const payload = {
          university: (profile.university === 'Other'
            ? (profile.custom_university.trim() || 'Riphah International University')
            : (profile.university.trim() || 'Riphah International University')),
          degree_program: finalDepartment,
          faculty_department: finalDepartment,
          academic_level: profile.academic_level || 'Undergraduate',
          academic_year: profile.academic_year || '1st Year',
          living_situation: profile.living_situation,
          platforms_used: profile.platforms_used.length ? profile.platforms_used : ['None'],
          online_activity_level: profile.online_activity_level || 'Frequently',
          main_interaction_with: profile.main_interaction_with,
          university_groups_participation: profile.university_groups_participation,
        };

        await authApi.submitStudentProfile(payload);
        try {
          const meRes = await authApi.me();
          updateUser(meRes.data);
        } catch (_) {}
      } catch (err) {
        setError(err.response?.data?.detail || 'Could not save profile. Please try again.');
        setSaving(false);
        return;
      }
      setSaving(false);
    }

    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    }
  };

  const handleSkipAndSave = async () => {
    setSaving(true);
    try {
      const finalDepartment = profile.degree_program === 'Other' && profile.custom_department.trim()
        ? profile.custom_department.trim()
        : profile.degree_program;

      await authApi.submitStudentProfile({
        university: (profile.university === 'Other'
          ? (profile.custom_university.trim() || 'Riphah International University')
          : (profile.university.trim() || 'Riphah International University')),
        degree_program: finalDepartment,
        faculty_department: finalDepartment,
        academic_level: profile.academic_level || 'Undergraduate',
        academic_year: profile.academic_year || '1st Year',
        living_situation: profile.living_situation,
        platforms_used: profile.platforms_used.length ? profile.platforms_used : ['None'],
        online_activity_level: profile.online_activity_level || 'Frequently',
        main_interaction_with: profile.main_interaction_with,
        university_groups_participation: profile.university_groups_participation,
      });

      const meRes = await authApi.me();
      updateUser(meRes.data);
    } catch (_) {}
    setSaving(false);
    navigate('/dashboard');
  };

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      steps={STEPS}
      stepLabel={STEPS[step]?.label}
      error={error}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
      onNext={handleNext}
      onSkip={handleSkipAndSave}
      canProceed={canProceed()}
      saving={saving}
      showNav={step < totalSteps - 1}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.4rem 0.95rem', borderRadius: 999, background: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                <Sparkles size={16} />
                Welcome to Prisma
              </div>

              <h1 className="onb-heading">
                Welcome to Prisma
              </h1>

              <p className="onb-body-text w-full" style={{ marginBottom: '2.25rem' }}>
                Thank you for creating your account. Before starting your assessment, answer a few quick questions about your background and digital habits. This helps personalize your assessment and interventions. It takes about a minute.
              </p>

              {/* Full-width Safe, Confidential & Academic Box */}
              <div className="onb-privacy-box w-full">
                <div className="onb-privacy-icon">
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <div className="onb-privacy-title">
                    Safe, Confidential & Academic
                  </div>
                  <div className="onb-privacy-desc">
                    Your responses and details are kept strictly private. They are never shared with instructors, classmates, or university administration, and are exclusively utilized for your personalized learning path.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Academic — University & Department Only */}
          {step === 1 && (
            <div>
              <h2 className="onb-heading">
                Academic Details
              </h2>
              <p className="onb-body-text w-full" style={{ marginBottom: '2rem' }}>
                Tell us about your university and field of study.
              </p>

              {/* University / Institution — searchable combobox */}
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.65rem' }}>
                  University / Institution
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Select your University"
                    value={
                      profile.university && profile.university !== 'Other'
                        ? profile.university
                        : uniSearch
                    }
                    onChange={(e) => {
                      setUniSearch(e.target.value);
                      set('university', '');
                      setUniDropdownOpen(true);
                    }}
                    onFocus={() => setUniDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setUniDropdownOpen(false), 200)}
                    style={{ fontSize: '1rem', padding: '0.85rem 1.15rem', width: '100%', boxSizing: 'border-box' }}
                    autoComplete="off"
                  />
                  {uniDropdownOpen && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                      maxHeight: '240px', overflowY: 'auto', marginTop: '4px',
                    }}>
                      {UNIVERSITIES.filter((u) =>
                        u.toLowerCase().includes(uniSearch.toLowerCase())
                      ).map((u) => (
                        <div
                          key={u}
                          onMouseDown={() => {
                            set('university', u);
                            setUniSearch(u === 'Other' ? '' : u);
                            setUniDropdownOpen(false);
                          }}
                          style={{
                            padding: '0.65rem 1rem',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            color: profile.university === u ? 'var(--color-primary)' : 'var(--color-text)',
                            background: profile.university === u ? 'rgba(79,70,229,0.07)' : 'transparent',
                            fontWeight: profile.university === u ? 600 : 400,
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-2, rgba(255,255,255,0.05))'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = profile.university === u ? 'rgba(79,70,229,0.07)' : 'transparent'; }}
                        >
                          {u}
                        </div>
                      ))}
                      {UNIVERSITIES.filter((u) => u.toLowerCase().includes(uniSearch.toLowerCase())).length === 0 && (
                        <div style={{ padding: '0.65rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                          No matching university found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* "Other" — reveal free-text field */}
                {profile.university === 'Other' && (
                  <div style={{ marginTop: '0.85rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter your University Name"
                      value={profile.custom_university}
                      onChange={(e) => setProfile((p) => ({ ...p, custom_university: e.target.value }))}
                      style={{ fontSize: '1rem', padding: '0.85rem 1.15rem', width: '100%', boxSizing: 'border-box' }}
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* Department / Field of Study */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.65rem' }}>
                  Department / Field of Study
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {DEPARTMENTS.map((d) => {
                    const sel = profile.degree_program === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        className={`onb-chip-btn ${sel ? 'active' : ''}`}
                        onClick={() => set('degree_program', d.id)}
                        style={{ padding: '0.7rem 1.25rem', fontSize: '0.94rem' }}
                      >
                        <span style={{ fontSize: '1.25rem' }}>{d.icon}</span>
                        <span>{d.label}</span>
                        {sel && <CheckCircle2 size={16} style={{ color: 'var(--color-primary)' }} />}
                      </button>
                    );
                  })}
                </div>

                {profile.degree_program === 'Other' && (
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Type your department or major name…"
                    value={profile.custom_department}
                    onChange={(e) => set('custom_department', e.target.value)}
                    style={{ marginTop: '1rem', fontSize: '0.98rem', padding: '0.85rem 1.15rem', width: '100%' }}
                    autoFocus
                  />
                )}
              </div>
            </div>
          )}

          {/* Step 2: Living — 5 Compact Horizontal Cards in 1 Row */}
          {step === 2 && (
            <div>
              <h2 className="onb-heading">
                Accommodation
              </h2>
              <p className="onb-body-text w-full" style={{ marginBottom: '1.75rem' }}>
                Where do you currently reside during your university studies?
              </p>

              <div className="onb-living-grid">
                {LIVING_SITUATIONS.map((sit) => {
                  const sel = profile.living_situation === sit.id;
                  return (
                    <button
                      key={sit.id}
                      type="button"
                      className={`onb-living-card ${sel ? 'active' : ''}`}
                      onClick={() => set('living_situation', sit.id)}
                    >
                      <div className="onb-living-icon-wrap">
                        {sit.icon}
                      </div>
                      <div className="onb-living-title">
                        {sit.title}
                      </div>
                      <div className="onb-living-sub">
                        {sit.sub}
                      </div>
                      {sel && (
                        <div className="onb-living-check">
                          <CheckCircle2 size={14} />
                          <span>Selected</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Digital Life — Frequently Used Platforms Only */}
          {step === 3 && (
            <div>
              <h2 className="onb-heading">
                Digital Environment
              </h2>
              <p className="onb-body-text w-full" style={{ marginBottom: '2rem' }}>
                Which platforms and online channels do you use regularly? (Select all that apply)
              </p>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  Frequently Used Platforms
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                  {/* None option */}
                  <button
                    type="button"
                    className={`onb-chip-btn ${profile.platforms_used.includes('None') ? 'active' : ''}`}
                    onClick={selectNonePlatforms}
                    style={{ padding: '0.75rem 1.35rem', fontSize: '0.94rem' }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>🚫</span>
                    <span>None</span>
                    {profile.platforms_used.includes('None') && <CheckCircle2 size={16} style={{ color: 'var(--color-primary)' }} />}
                  </button>

                  {PLATFORMS.map((p) => {
                    const sel = profile.platforms_used.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        className={`onb-chip-btn ${sel ? 'active' : ''}`}
                        onClick={() => togglePlatform(p.id)}
                        style={{ padding: '0.75rem 1.35rem', fontSize: '0.94rem' }}
                      >
                        <span style={{ fontSize: '1.25rem' }}>{p.icon}</span>
                        <span>{p.label}</span>
                        {sel && <CheckCircle2 size={16} style={{ color: 'var(--color-primary)' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Community — Interaction Partners & Groups */}
          {step === 4 && (
            <div>
              <h2 className="onb-heading">
                Student Community
              </h2>
              <p className="onb-body-text w-full" style={{ marginBottom: '1.75rem' }}>
                Tell us about your peer interactions and university group participation.
              </p>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.65rem' }}>
                  Who do you mainly interact with online?
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
                  {INTERACTION_PARTNERS.map((partner) => {
                    const sel = profile.main_interaction_with === partner.id;
                    return (
                      <button
                        key={partner.id}
                        type="button"
                        className={`onb-chip-btn ${sel ? 'active' : ''}`}
                        onClick={() => set('main_interaction_with', partner.id)}
                        style={{ padding: '0.75rem 1.25rem' }}
                      >
                        <span style={{ fontSize: '1.25rem' }}>{partner.icon}</span>
                        <span>{partner.label}</span>
                        {sel && <CheckCircle2 size={15} style={{ color: 'var(--color-primary)' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.65rem' }}>
                  Do you participate in online university groups?
                </label>
                <div className="onb-grid-2col">
                  {[
                    { val: 'Yes', label: 'Yes, I participate', desc: 'Batch WhatsApp chats, LMS forums, Discord servers, or student societies', icon: '✅' },
                    { val: 'No', label: 'No, rarely or never', desc: 'Prefer direct 1-on-1 messages or independent study without large groups', icon: '❌' },
                  ].map((item) => {
                    const sel = profile.university_groups_participation === item.val;
                    return (
                      <button
                        key={item.val}
                        type="button"
                        className={`onb-card-option ${sel ? 'active' : ''}`}
                        onClick={() => set('university_groups_participation', item.val)}
                        style={{ padding: '1.15rem 1.25rem', textAlign: 'left' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '1.35rem' }}>{item.icon}</span>
                          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary)' }}>{item.label}</span>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                          {item.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Complete */}
          {step === 5 && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'rgba(5, 150, 105, 0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '1.75rem', boxShadow: '0 8px 24px -4px rgba(5, 150, 105, 0.25)' }}>
                <CheckCircle2 size={48} strokeWidth={2.5} />
              </div>

              <h2 className="onb-heading">
                Profile Setup Complete
              </h2>

              <p className="onb-body-text w-full" style={{ marginBottom: '2.5rem' }}>
                Your academic profile has been calibrated. You are now prepared to begin your baseline diagnostic assessment.
              </p>

              {/* Action Buttons: Both styled as genuine high-contrast buttons */}
              <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', alignItems: 'center', maxWidth: '560px', margin: '0 auto' }}>
                <button
                  type="button"
                  onClick={() => navigate('/assessment?stage=pre')}
                  className="onb-btn-continue"
                  style={{ minWidth: '240px', flex: '1 1 auto' }}
                >
                  <span>Start Baseline Assessment</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="onb-btn-secondary"
                  style={{ minWidth: '200px', flex: '1 1 auto' }}
                >
                  <LayoutDashboard size={18} style={{ color: '#4f46e5' }} />
                  <span>Go to Dashboard</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </OnboardingLayout>
  );
}
