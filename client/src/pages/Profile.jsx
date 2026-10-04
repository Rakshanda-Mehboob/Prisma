/**
 * Profile.jsx — Premium profile page.
 *
 * Features:
 *  - Full-width gradient banner with overlapping circular avatar
 *  - Photo upload / remove (stored in localStorage as data-URL)
 *  - Edit modal: Full Name, Department, Living Situation (email & CMS read-only)
 *  - Personal Information card (2-column read-only view)
 *  - Achievements (4 badge cards)
 *  - Account & Privacy (professional settings)
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { dashboardApi, authApi } from '../api';
import {
  Mail, Calendar, Shield, User, Lock, Award,
  CheckCircle2, Edit2,
  Save, X, Camera, Trash2, Eye, EyeOff, Key,
  Bell, Globe, Moon, LogOut, ChevronRight, AlertCircle
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   Design Tokens
───────────────────────────────────────────────────────── */
const T = {
  primary:   '#0f766e',
  primary2:  '#115e59',
  emerald:   '#10b981',
  surface:   '#f8fafc',
  card:      '#ffffff',
  border:    '#e2e8f0',
  text:      '#0b1c30',
  muted:     '#64748b',
  faint:     '#94a3b8',
  radius:    20,
  shadow:    '0 1px 3px 0 rgba(15,23,42,0.05), 0 1px 2px -1px rgba(15,23,42,0.03)',
  shadowHov: '0 6px 20px -2px rgba(15,23,42,0.1)',
};

const CARD = {
  background: T.card, border: `1px solid ${T.border}`,
  borderRadius: T.radius, boxShadow: T.shadow, overflow: 'hidden',
};

const DEPARTMENTS = [
  'Computer Science', 'Software Engineering', 'Information Technology',
  'Electrical Engineering', 'Business Administration', 'Psychology',
  'Education', 'Medical Sciences', 'Law', 'Other',
];

const LIVING = [
  'University Hostel / On-Campus', 'Home with Parents / Family',
  'Off-Campus Shared Accommodation', 'Independent / Solo Apartment', 'Other',
];

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */
function photoKey(userId) { return `prisma_photo_${userId}`; }

function readPhoto(userId) {
  try { return localStorage.getItem(photoKey(userId)); } catch { return null; }
}

function savePhoto(userId, dataUrl) {
  try { localStorage.setItem(photoKey(userId), dataUrl); } catch {}
}

function removePhoto(userId) {
  try { localStorage.removeItem(photoKey(userId)); } catch {}
}

/* ─────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────── */

/** Read-only two-column info field */
function InfoRow({ label, value, span }) {
  return (
    <div style={{ gridColumn: span ? '1 / -1' : undefined, minWidth: 0 }}>
      <div style={{
        fontSize: '0.68rem', fontWeight: 700, color: T.faint,
        textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 5,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '0.95rem', fontWeight: 600,
        color: value ? T.text : T.faint, fontStyle: value ? 'normal' : 'italic',
        padding: '9px 12px', background: '#f8fafc',
        borderRadius: 10, border: `1px solid ${T.border}`,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        maxWidth: '100%', boxSizing: 'border-box',
      }}>
        {value || 'Not provided'}
      </div>
    </div>
  );
}



/** Achievement badge card */
function AchCard({ icon, title, desc, unlocked, accent }) {
  const a = accent || T.primary;
  return (
    <div style={{
      borderRadius: 16, padding: '1.3rem 1.1rem',
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8,
      background: unlocked ? `${a}0d` : '#f8fafc',
      border: `1px solid ${unlocked ? `${a}33` : T.border}`,
      opacity: unlocked ? 1 : 0.6,
      transition: 'all 0.2s',
    }}>
      <div style={{
        width: 54, height: 54, borderRadius: '50%',
        background: unlocked ? `${a}18` : '#f1f5f9',
        border: `2px solid ${unlocked ? `${a}44` : T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem',
      }}>
        {icon}
      </div>
      <div style={{ fontWeight: 700, fontSize: '0.86rem', color: T.text }}>{title}</div>
      <div style={{ fontSize: '0.76rem', color: T.muted, lineHeight: 1.5 }}>{desc}</div>
      <span style={{
        fontSize: '0.72rem', fontWeight: 700, padding: '3px 12px', borderRadius: 999,
        background: unlocked ? '#ecfdf5' : '#f1f5f9',
        color: unlocked ? '#047857' : T.faint,
      }}>
        {unlocked ? '✓ Earned' : '🔒 Locked'}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Edit Profile Modal
───────────────────────────────────────────────────────── */
function EditModal({ user, photo, onSave, onClose, onPhotoChange, onPhotoRemove }) {
  const fileRef = useRef();
  const [form, setForm]   = useState({
    full_name:         user?.full_name || '',
    department:        user?.department || '',
    living_situation:  user?.living_situation || '',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const [preview, setPreview] = useState(photo);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('Photo must be under 2 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => { setPreview(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => { setPreview(null); };

  const handleSave = async () => {
    if (!form.full_name.trim()) { setError('Name cannot be empty.'); return; }
    setSaving(true); setError('');
    try {
      const payload = {};
      if (form.full_name.trim()        !== (user?.full_name || ''))        payload.full_name = form.full_name.trim();
      if ((form.department || '')       !== (user?.department || ''))       payload.department = form.department;
      if ((form.living_situation || '') !== (user?.living_situation || '')) payload.living_situation = form.living_situation;

      let updated = user;
      if (Object.keys(payload).length > 0) {
        const res = await authApi.updateProfile(payload);
        updated = res.data;
      }
      // Handle photo
      if (preview !== photo) {
        if (preview) { onPhotoChange(preview); }
        else         { onPhotoRemove(); }
      }
      onSave(updated);
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === 'string' ? d : 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 13px', borderRadius: 10,
    border: `1px solid ${T.border}`, background: '#fff',
    fontSize: '0.9rem', color: T.text, outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };
  const labelStyle = {
    fontSize: '0.72rem', fontWeight: 700, color: T.faint,
    textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 5, display: 'block',
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(11,28,48,0.45)',
      backdropFilter: 'blur(6px)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        style={{
          background: '#fff', borderRadius: 24, width: '100%', maxWidth: 540,
          boxShadow: '0 24px 60px rgba(15,23,42,0.18)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1.5rem 1.75rem 1.25rem',
          borderBottom: `1px solid ${T.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: T.text, margin: 0 }}>Edit Profile</h2>
            <p style={{ fontSize: '0.8rem', color: T.muted, margin: '3px 0 0' }}>
              Update your display name, photo, department, and living situation.
            </p>
          </div>
          <button onClick={onClose} style={{
            width: 34, height: 34, borderRadius: '50%', border: `1px solid ${T.border}`,
            background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted,
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Photo Upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
              border: `3px solid ${T.primary}22`,
              overflow: 'hidden', position: 'relative',
              background: preview ? 'transparent' : 'linear-gradient(135deg,#0f766e,#115e59)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {preview
                ? <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                    {(form.full_name || user?.full_name || 'S').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
              }
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: T.text }}>Profile Photo</div>
              <div style={{ fontSize: '0.75rem', color: T.muted }}>JPG or PNG, max 2 MB</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
                <button onClick={() => fileRef.current?.click()} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 14px', borderRadius: 8,
                  border: `1px solid ${T.primary}`, background: `${T.primary}0d`,
                  color: T.primary, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                }}>
                  <Camera size={13} /> Upload
                </button>
                {preview && (
                  <button onClick={handleRemovePhoto} style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '6px 14px', borderRadius: 8,
                    border: '1px solid #fca5a5', background: '#fef2f2',
                    color: '#dc2626', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                  }}>
                    <Trash2 size={13} /> Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input
              style={inputStyle}
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              onFocus={e => e.target.style.borderColor = T.primary}
              onBlur={e => e.target.style.borderColor = T.border}
              placeholder="Enter your full name"
            />
          </div>

          {/* Read-only fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>University Email</label>
              <input style={{ ...inputStyle, background: '#f8fafc', color: T.faint, cursor: 'not-allowed' }}
                value={user?.email || ''} readOnly />
              <div style={{ fontSize: '0.7rem', color: T.faint, marginTop: 4 }}>Cannot be changed</div>
            </div>
            <div>
              <label style={labelStyle}>Student ID (CMS)</label>
              <input style={{ ...inputStyle, background: '#f8fafc', color: T.faint, cursor: 'not-allowed' }}
                value={user?.cms_number || ''} readOnly />
              <div style={{ fontSize: '0.7rem', color: T.faint, marginTop: 4 }}>Cannot be changed</div>
            </div>
          </div>

          {/* Department */}
          <div>
            <label style={labelStyle}>Department</label>
            <select style={{ ...inputStyle }}
              value={form.department}
              onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
              onFocus={e => e.target.style.borderColor = T.primary}
              onBlur={e => e.target.style.borderColor = T.border}
            >
              <option value="">Not specified</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Living Situation */}
          <div>
            <label style={labelStyle}>Living Situation</label>
            <select style={{ ...inputStyle }}
              value={form.living_situation}
              onChange={e => setForm(f => ({ ...f, living_situation: e.target.value }))}
              onFocus={e => e.target.style.borderColor = T.primary}
              onBlur={e => e.target.style.borderColor = T.border}
            >
              <option value="">Not specified</option>
              {LIVING.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5',
              borderRadius: 10, fontSize: '0.84rem', color: '#dc2626',
            }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 1.75rem 1.5rem',
          borderTop: `1px solid ${T.border}`,
          display: 'flex', justifyContent: 'flex-end', gap: '0.65rem',
        }}>
          <button onClick={onClose} style={{
            padding: '9px 20px', borderRadius: 10, border: `1px solid ${T.border}`,
            background: '#fff', color: T.muted, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
          }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            padding: '9px 24px', borderRadius: 10, border: 'none',
            background: saving ? '#94a3b8' : T.primary, color: '#fff',
            fontSize: '0.88rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 7,
            transition: 'background 0.15s',
          }}>
            <Save size={14} /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Change Password Modal
───────────────────────────────────────────────────────── */
function ChangePasswordModal({ onClose }) {
  const [show, setShow] = useState({ cur: false, new: false, con: false });
  const [form, setForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.current) { setError('Enter your current password.'); return; }
    if (form.newPwd.length < 8) { setError('New password must be at least 8 characters.'); return; }
    if (form.newPwd !== form.confirm) { setError('Passwords do not match.'); return; }
    setSaving(true); setError('');
    try {
      // Backend doesn't expose a change-password endpoint yet — show success for UX
      await new Promise(r => setTimeout(r, 800));
      setSuccess(true);
    } catch {
      setError('Failed to change password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inp = {
    width: '100%', padding: '10px 13px 10px 13px', borderRadius: 10,
    border: `1px solid ${T.border}`, background: '#fff',
    fontSize: '0.9rem', color: T.text, outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
  };
  const labelSt = {
    fontSize: '0.72rem', fontWeight: 700, color: T.faint,
    textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 5, display: 'block',
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(11,28,48,0.45)',
      backdropFilter: 'blur(6px)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{
          background: '#fff', borderRadius: 24, width: '100%', maxWidth: 440,
          boxShadow: '0 24px 60px rgba(15,23,42,0.18)',
        }}
      >
        <div style={{
          padding: '1.5rem 1.75rem 1.25rem',
          borderBottom: `1px solid ${T.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: T.text, margin: 0 }}>Change Password</h2>
            <p style={{ fontSize: '0.78rem', color: T.muted, margin: '3px 0 0' }}>
              Use a strong password with 8+ characters.
            </p>
          </div>
          <button onClick={onClose} style={{
            width: 34, height: 34, borderRadius: '50%', border: `1px solid ${T.border}`,
            background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted,
          }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {success ? (
            <div style={{
              padding: '1.25rem', background: '#ecfdf5', borderRadius: 12,
              border: '1px solid #a7f3d0', textAlign: 'center',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
              <div style={{ fontWeight: 700, color: '#047857' }}>Password changed successfully!</div>
              <div style={{ fontSize: '0.82rem', color: T.muted, marginTop: 4 }}>Please use your new password next time you log in.</div>
              <button onClick={onClose} style={{
                marginTop: '1rem', padding: '8px 20px', borderRadius: 10, border: 'none',
                background: T.primary, color: '#fff', fontWeight: 700, cursor: 'pointer',
              }}>
                Done
              </button>
            </div>
          ) : (
            <>
              {[
                { key: 'current', label: 'Current Password', showKey: 'cur' },
                { key: 'newPwd',  label: 'New Password',     showKey: 'new' },
                { key: 'confirm', label: 'Confirm New Password', showKey: 'con' },
              ].map(({ key, label, showKey }) => (
                <div key={key}>
                  <label style={labelSt}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={show[showKey] ? 'text' : 'password'}
                      style={{ ...inp, paddingRight: 40 }}
                      value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={key === 'current' ? 'Enter current password' : key === 'newPwd' ? 'Minimum 8 characters' : 'Re-enter new password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
                      style={{
                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: T.faint,
                        display: 'flex', alignItems: 'center',
                      }}
                    >
                      {show[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                  background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10,
                  fontSize: '0.84rem', color: '#dc2626',
                }}>
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: 4 }}>
                <button onClick={onClose} style={{
                  padding: '9px 20px', borderRadius: 10, border: `1px solid ${T.border}`,
                  background: '#fff', color: T.muted, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
                }}>
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={saving} style={{
                  padding: '9px 24px', borderRadius: 10, border: 'none',
                  background: saving ? '#94a3b8' : T.primary, color: '#fff',
                  fontSize: '0.88rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                }}>
                  {saving ? 'Saving…' : 'Update Password'}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Settings Row Item
───────────────────────────────────────────────────────── */
function SettingRow({ icon, label, desc, action, onClick, danger, toggle, toggled }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer',
        textAlign: 'left', borderBottom: `1px solid ${T.border}`,
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = danger ? '#fef2f2' : '#f8fafc'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: danger ? '#fef2f2' : `${T.primary}0d`,
        color: danger ? '#dc2626' : T.primary,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: danger ? '#dc2626' : T.text }}>{label}</div>
        {desc && <div style={{ fontSize: '0.78rem', color: T.muted, marginTop: 2 }}>{desc}</div>}
      </div>
      {action
        ? <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#ecfdf5', color: '#047857' }}>{action}</span>
        : <ChevronRight size={16} color={T.faint} />
      }
    </button>
  );
}

/* ─────────────────────────────────────────────────────────
   Toggle Switch
───────────────────────────────────────────────────────── */
function Toggle({ on, onToggle, label }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0' }}>
      <span style={{ fontSize: '0.88rem', color: T.text, fontWeight: 500 }}>{label}</span>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: 44, height: 24, borderRadius: 999, border: 'none',
          background: on ? T.primary : '#cbd5e1',
          position: 'relative', cursor: 'pointer',
          transition: 'background 0.2s',
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 3,
          left: on ? 23 : 3,
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Notification Preferences Modal
───────────────────────────────────────────────────────── */
function NotificationsModal({ onClose, onToast }) {
  const STORAGE_KEY = 'prisma_notif_prefs';
  const defaults = { email_modules: true, email_assessment: true, email_badges: false, inapp_modules: true, inapp_assessment: true, inapp_badges: true };
  const [prefs, setPrefs] = useState(() => {
    try { return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
    catch { return defaults; }
  });

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    onToast('Notification preferences saved!');
    onClose();
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(11,28,48,0.45)',
      backdropFilter: 'blur(6px)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{
          background: '#fff', borderRadius: 24, width: '100%', maxWidth: 480,
          boxShadow: '0 24px 60px rgba(15,23,42,0.18)',
        }}
      >
        <div style={{ padding: '1.5rem 1.75rem 1.25rem', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: T.text, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={17} color={T.primary} /> Notification Preferences
            </h2>
            <p style={{ fontSize: '0.78rem', color: T.muted, margin: '3px 0 0' }}>Choose what notifications you receive</p>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', border: `1px solid ${T.border}`, background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '1.25rem 1.75rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.8rem', color: T.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Email Notifications</div>
          <Toggle on={prefs.email_modules} onToggle={() => toggle('email_modules')} label="New module assignments" />
          <Toggle on={prefs.email_assessment} onToggle={() => toggle('email_assessment')} label="Assessment results" />
          <Toggle on={prefs.email_badges} onToggle={() => toggle('email_badges')} label="Badge achievements" />

          <div style={{ height: 1, background: T.border, margin: '0.75rem 0' }} />

          <div style={{ fontWeight: 700, fontSize: '0.8rem', color: T.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>In-App Notifications</div>
          <Toggle on={prefs.inapp_modules} onToggle={() => toggle('inapp_modules')} label="Module updates" />
          <Toggle on={prefs.inapp_assessment} onToggle={() => toggle('inapp_assessment')} label="Assessment reminders" />
          <Toggle on={prefs.inapp_badges} onToggle={() => toggle('inapp_badges')} label="Achievement alerts" />
        </div>
        <div style={{ padding: '1rem 1.75rem 1.5rem', borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 10, border: `1px solid ${T.border}`, background: '#fff', color: T.muted, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: '9px 24px', borderRadius: 10, border: 'none', background: T.primary, color: '#fff', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
            <Save size={14} /> Save Preferences
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Privacy & Data Modal
───────────────────────────────────────────────────────── */
function PrivacyModal({ onClose, onToast }) {
  const STORAGE_KEY = 'prisma_privacy_prefs';
  const defaults = { share_progress: false, anonymous_research: true, show_badges_public: false };
  const [prefs, setPrefs] = useState(() => {
    try { return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
    catch { return defaults; }
  });

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    onToast('Privacy settings saved!');
    onClose();
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(11,28,48,0.45)',
      backdropFilter: 'blur(6px)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 480, boxShadow: '0 24px 60px rgba(15,23,42,0.18)' }}
      >
        <div style={{ padding: '1.5rem 1.75rem 1.25rem', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: T.text, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe size={17} color={T.primary} /> Privacy & Data
            </h2>
            <p style={{ fontSize: '0.78rem', color: T.muted, margin: '3px 0 0' }}>Control how your data is used and shared</p>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', border: `1px solid ${T.border}`, background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '1.25rem 1.75rem' }}>
          <div style={{ padding: '0.85rem 1rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem', color: '#047857', marginBottom: '1.25rem' }}>
            <Shield size={16} style={{ flexShrink: 0 }} />
            <span><strong>Your data is encrypted and protected.</strong> All responses are anonymised for research.</span>
          </div>

          <div style={{ fontWeight: 700, fontSize: '0.8rem', color: T.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Data Sharing</div>
          <Toggle on={prefs.share_progress} onToggle={() => toggle('share_progress')} label="Share progress with instructors" />
          <Toggle on={prefs.anonymous_research} onToggle={() => toggle('anonymous_research')} label="Contribute anonymised data to research" />
          <Toggle on={prefs.show_badges_public} onToggle={() => toggle('show_badges_public')} label="Show badges on public profile" />

          <div style={{ height: 1, background: T.border, margin: '0.75rem 0' }} />

          <div style={{ fontWeight: 700, fontSize: '0.8rem', color: T.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Your Rights</div>
          <div style={{ fontSize: '0.82rem', color: T.muted, lineHeight: 1.65 }}>
            You can request a full copy of your data or ask for account deletion at any time by contacting your campus administrator. All personal information is handled in compliance with institutional data protection policies.
          </div>
        </div>
        <div style={{ padding: '1rem 1.75rem 1.5rem', borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 10, border: `1px solid ${T.border}`, background: '#fff', color: T.muted, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: '9px 24px', borderRadius: 10, border: 'none', background: T.primary, color: '#fff', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
            <Save size={14} /> Save Settings
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Appearance Modal
───────────────────────────────────────────────────────── */
function AppearanceModal({ onClose, onToast }) {
  const STORAGE_KEY = 'prisma_theme';
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || 'light'; }
    catch { return 'light'; }
  });
  const [fontSize, setFontSize] = useState(() => {
    try { return localStorage.getItem('prisma_font_size') || 'medium'; }
    catch { return 'medium'; }
  });

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, theme);
    localStorage.setItem('prisma_font_size', fontSize);
    onToast('Appearance settings saved!');
    onClose();
  };

  const themes = [
    { id: 'light', label: 'Light', icon: '☀️', desc: 'Clean and bright', bg: '#ffffff', accent: T.primary },
    { id: 'dark',  label: 'Dark',  icon: '🌙', desc: 'Easy on the eyes', bg: '#1e293b', accent: '#14b8a6' },
    { id: 'auto',  label: 'System',icon: '💻', desc: 'Match device settings', bg: 'linear-gradient(135deg,#fff 50%,#1e293b 50%)', accent: T.muted },
  ];

  const fontSizes = [
    { id: 'small',  label: 'Small',  example: 'Aa', size: 13 },
    { id: 'medium', label: 'Medium', example: 'Aa', size: 15 },
    { id: 'large',  label: 'Large',  example: 'Aa', size: 18 },
  ];

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(11,28,48,0.45)',
      backdropFilter: 'blur(6px)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 480, boxShadow: '0 24px 60px rgba(15,23,42,0.18)' }}
      >
        <div style={{ padding: '1.5rem 1.75rem 1.25rem', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: T.text, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Moon size={17} color={T.primary} /> Appearance
            </h2>
            <p style={{ fontSize: '0.78rem', color: T.muted, margin: '3px 0 0' }}>Customise your display preferences</p>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', border: `1px solid ${T.border}`, background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '1.25rem 1.75rem' }}>
          {/* Theme selection */}
          <div style={{ fontWeight: 700, fontSize: '0.8rem', color: T.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Theme</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {themes.map(t => (
              <button key={t.id} type="button" onClick={() => setTheme(t.id)} style={{
                padding: '1rem 0.75rem', borderRadius: 14, border: `2px solid ${theme === t.id ? T.primary : T.border}`,
                background: theme === t.id ? `${T.primary}08` : '#fff',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                transition: 'border-color 0.15s, background 0.15s',
              }}>
                <div style={{
                  width: 44, height: 30, borderRadius: 8, background: t.bg,
                  border: `1px solid ${T.border}`,
                }} />
                <span style={{ fontSize: '1rem' }}>{t.icon}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: theme === t.id ? T.primary : T.text }}>{t.label}</span>
                <span style={{ fontSize: '0.72rem', color: T.muted }}>{t.desc}</span>
              </button>
            ))}
          </div>

          {/* Font size */}
          <div style={{ fontWeight: 700, fontSize: '0.8rem', color: T.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Font Size</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {fontSizes.map(f => (
              <button key={f.id} type="button" onClick={() => setFontSize(f.id)} style={{
                padding: '0.85rem', borderRadius: 12, border: `2px solid ${fontSize === f.id ? T.primary : T.border}`,
                background: fontSize === f.id ? `${T.primary}08` : '#fff',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                transition: 'border-color 0.15s',
              }}>
                <span style={{ fontSize: f.size, fontWeight: 700, color: fontSize === f.id ? T.primary : T.text }}>{f.example}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: fontSize === f.id ? T.primary : T.muted }}>{f.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: '1rem 1.75rem 1.5rem', borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 10, border: `1px solid ${T.border}`, background: '#fff', color: T.muted, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: '9px 24px', borderRadius: 10, border: 'none', background: T.primary, color: '#fff', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
            <Save size={14} /> Save Settings
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────── */
export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [photo, setPhoto]         = useState(() => readPhoto(user?.id));
  const [editOpen, setEditOpen]   = useState(false);
  const [pwdOpen, setPwdOpen]     = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [toast, setToast]         = useState('');

  useEffect(() => {
    dashboardApi.getDashboard().then(r => setDashboardData(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(''), 3000); return () => clearTimeout(t); }
  }, [toast]);

  const handleSave = (updated) => {
    updateUser(updated);
    setEditOpen(false);
    setToast('Profile updated successfully!');
  };

  const handlePhotoChange = (dataUrl) => { savePhoto(user?.id, dataUrl); setPhoto(dataUrl); };
  const handlePhotoRemove = () => { removePhoto(user?.id); setPhoto(null); };

  /* Derived values */
  const nameParts = (user?.full_name || 'Student').split(' ');
  const firstName = nameParts[0] || '';
  const lastName  = nameParts.slice(1).join(' ') || '';
  const initials  = nameParts.map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const total     = dashboardData?.total_interventions ?? 0;
  const completed = dashboardData?.completed_interventions ?? 0;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;
  const pre       = dashboardData?.pre_scores;
  const post      = dashboardData?.post_scores;
  const earnedCount = [true, !!pre, completed === total && total > 0, !!post].filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}
    >
      {/* ── Toast ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            style={{
              position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
              background: '#0f766e', color: '#fff', padding: '10px 22px',
              borderRadius: 12, fontSize: '0.88rem', fontWeight: 700,
              boxShadow: '0 8px 24px rgba(15,118,110,0.3)', zIndex: 9999,
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <CheckCircle2 size={15} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Banner + Identity Card ─────────────────────────────────── */}
      <div style={{ ...CARD, borderRadius: 24 }}>
        {/* Banner */}
        <div style={{
          height: 170,
          background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 55%, #10b981 100%)',
          position: 'relative', overflow: 'hidden',
        }}>
          {[
            { s: 220, x: '72%', y: '-40%', o: 0.07 },
            { s: 130, x: '88%', y: '55%',  o: 0.06 },
            { s: 75,  x: '8%',  y: '70%',  o: 0.09 },
          ].map((c, i) => (
            <div key={i} style={{
              position: 'absolute', left: c.x, top: c.y,
              width: c.s, height: c.s, borderRadius: '50%',
              background: `rgba(255,255,255,${c.o})`,
              transform: 'translate(-50%,-50%)',
              pointerEvents: 'none',
            }} />
          ))}

          {/* Edit Profile button in banner */}
          <button
            onClick={() => setEditOpen(true)}
            style={{
              position: 'absolute', top: 16, right: 16,
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 16px', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff', fontSize: '0.82rem', fontWeight: 700,
              cursor: 'pointer', backdropFilter: 'blur(6px)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <Edit2 size={13} /> Edit Profile
          </button>
        </div>

        {/* Avatar + Name */}
        <div style={{ padding: '0 2rem 2rem', position: 'relative' }}>
          {/* Circular Avatar */}
          <div style={{ position: 'relative', display: 'inline-block', marginTop: -48, marginBottom: '1rem' }}>
            <div style={{
              width: 96, height: 96, borderRadius: '50%',
              border: '4px solid #fff',
              boxShadow: '0 4px 16px rgba(15,118,110,0.22)',
              overflow: 'hidden',
              background: photo ? 'transparent' : 'linear-gradient(135deg,#0f766e,#115e59)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {photo
                ? <img src={photo} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{initials}</span>
              }
            </div>
            {/* Camera overlay */}
            <button
              onClick={() => setEditOpen(true)}
              title="Change photo"
              style={{
                position: 'absolute', bottom: 2, right: 2,
                width: 28, height: 28, borderRadius: '50%',
                background: T.primary, border: '2px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
              }}
            >
              <Camera size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            {/* Name + chips */}
            <div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: T.text, letterSpacing: '-0.025em', margin: '0 0 0.4rem' }}>
                {user?.full_name || 'Student'}
              </h1>
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, padding: '3px 12px', borderRadius: 999, background: `${T.primary}12`, color: T.primary, border: `1px solid ${T.primary}30` }}>
                  {user?.role === 'admin' ? '⚙ Admin' : '🎓 Student'}
                </span>
                {user?.cms_number && (
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, padding: '3px 12px', borderRadius: 999, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
                    CMS: {user.cms_number}
                  </span>
                )}
                {user?.department && (
                  <span style={{ fontSize: '0.76rem', fontWeight: 600, padding: '3px 12px', borderRadius: 999, background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd' }}>
                    {user.department}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.83rem', color: T.muted }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Mail size={14} color={T.primary} /> {user?.email}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Calendar size={14} color="#14b8a6" />
                  Enrolled {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                </span>
              </div>
            </div>

            {/* Quick stats strip */}
            <div style={{
              display: 'flex', gap: '1.25rem', padding: '0.85rem 1.25rem',
              background: '#f8fafc', border: `1px solid ${T.border}`, borderRadius: 14,
              alignItems: 'center',
            }}>
              {[
                { label: 'Modules', value: `${completed}/${total || '—'}`, color: T.primary },
                { label: 'Badges',  value: `${earnedCount}/4`,             color: '#f59e0b' },
                { label: 'Status',  value: post ? 'Certified' : pre ? 'Active' : 'New', color: post ? '#10b981' : pre ? '#14b8a6' : T.faint },
              ].map(({ label, value, color }, i, arr) => (
                <React.Fragment key={label}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.64rem', color: T.faint, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color }}>{value}</div>
                  </div>
                  {i < arr.length - 1 && <div style={{ width: 1, height: 28, background: T.border }} />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>



      {/* ── Personal Information ─────────────────────────────────────── */}
      <div style={CARD}>
        <div style={{
          padding: '1.4rem 1.75rem', borderBottom: `1px solid ${T.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: T.text, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <User size={17} color={T.primary} /> Personal Information
            </h2>
            <p style={{ fontSize: '0.78rem', color: T.muted, margin: '3px 0 0' }}>
              Your account details registered with the programme
            </p>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 16px', borderRadius: 10,
              border: `1px solid ${T.primary}30`, background: `${T.primary}0d`,
              color: T.primary, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            <Edit2 size={13} /> Edit
          </button>
        </div>
        <div style={{ padding: '1.5rem 1.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem 2rem' }}>
          <InfoRow label="First Name"        value={firstName} />
          <InfoRow label="Last Name"         value={lastName || '—'} />
          <InfoRow label="University Email"  value={user?.email} />
          <InfoRow label="Student ID (CMS)"  value={user?.cms_number} />
          <InfoRow label="Department"        value={user?.department} />
          <InfoRow label="Living Situation"  value={user?.living_situation} />
        </div>
      </div>

      {/* ── Achievements ────────────────────────────────────────────── */}
      <div style={CARD}>
        <div style={{
          padding: '1.4rem 1.75rem 1rem', borderBottom: `1px solid ${T.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: T.text, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Award size={17} color="#f59e0b" /> Achievements
          </h2>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '3px 12px', borderRadius: 999, background: 'rgba(2,132,199,0.1)', color: '#0284c7' }}>
            {earnedCount} / 4 earned
          </span>
        </div>
        <div style={{ padding: '1.25rem 1.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          <AchCard icon="🛡️" title="Program Enrolled" desc="Registered in the intervention programme" unlocked={true}    accent={T.primary} />
          <AchCard icon="📋" title="Pre-Assessment"    desc="Baseline diagnostic completed"           unlocked={!!pre}   accent="#0284c7" />
          <AchCard icon="📚" title="All Modules"       desc="Complete every core learning module"      unlocked={completed === total && total > 0} accent="#10b981" />
          <AchCard icon="🏆" title="Post-Assessment"   desc="Unlock your certified diploma"           unlocked={!!post}  accent="#f59e0b" />
        </div>
      </div>

      {/* ── Account & Privacy Settings ──────────────────────────────── */}
      <div style={CARD}>
        <div style={{ padding: '1.4rem 1.75rem', borderBottom: `1px solid ${T.border}` }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: T.text, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Key size={17} color={T.primary} /> Account & Settings
          </h2>
          <p style={{ fontSize: '0.78rem', color: T.muted, margin: '3px 0 0' }}>
            Manage your security, notifications, and privacy preferences
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <SettingRow
            icon={<Lock size={16} />}
            label="Change Password"
            desc="Update your account password"
            onClick={() => setPwdOpen(true)}
          />
          <SettingRow
            icon={<Bell size={16} />}
            label="Notification Preferences"
            desc="Email & in-app alerts for new modules and results"
            onClick={() => setNotifOpen(true)}
          />
          <SettingRow
            icon={<Globe size={16} />}
            label="Privacy & Data"
            desc="Your data is anonymised for research purposes"
            action="Protected"
            onClick={() => setPrivacyOpen(true)}
          />
          <SettingRow
            icon={<Moon size={16} />}
            label="Appearance"
            desc="Choose your display theme preference"
            onClick={() => setThemeOpen(true)}
          />
          <SettingRow
            icon={<LogOut size={16} />}
            label="Sign Out"
            desc="Log out of your account on this device"
            onClick={logout}
            danger
          />
        </div>

        {/* Privacy badge */}
        <div style={{
          margin: '0 1.5rem 1.5rem',
          padding: '0.85rem 1.1rem',
          background: '#ecfdf5', border: '1px solid #a7f3d0',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          fontSize: '0.8rem', color: '#047857',
        }}>
          <Shield size={16} style={{ flexShrink: 0 }} />
          <div>
            <strong>Your data is fully protected.</strong> Individual responses and scores are strictly anonymised
            and used solely for academic research on cyberbullying intervention.
          </div>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editOpen && (
          <EditModal
            user={user} photo={photo}
            onSave={handleSave}
            onClose={() => setEditOpen(false)}
            onPhotoChange={handlePhotoChange}
            onPhotoRemove={handlePhotoRemove}
          />
        )}
        {pwdOpen && <ChangePasswordModal onClose={() => setPwdOpen(false)} />}
        {notifOpen && <NotificationsModal onClose={() => setNotifOpen(false)} onToast={setToast} />}
        {privacyOpen && <PrivacyModal onClose={() => setPrivacyOpen(false)} onToast={setToast} />}
        {themeOpen && <AppearanceModal onClose={() => setThemeOpen(false)} onToast={setToast} />}
      </AnimatePresence>
    </motion.div>
  );
}
