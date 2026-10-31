/**
 * pages/Register.jsx - Simplified Student Account Registration
 *
 * Collects only the three essential fields:
 *   1. Email Address
 *   2. SAP ID (Student Academic Portal ID)
 *   3. Password
 *
 * After successful registration the user is auto-logged-in and redirected
 * to /onboarding where they complete their profile.
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { authApi } from "../api";
import { useAuth } from "../context/AuthContext";
import {
  Mail, Hash, Lock, Eye, EyeOff,
  CheckCircle2, ArrowRight,
  ShieldCheck, AlertCircle, Check, Loader2,
} from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", cms_number: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]  = useState("");
  const [loading, setLoading] = useState(false);

  const [touched, setTouched] = useState({});
  const [errors, setErrors]   = useState({});

  const [asyncStatus, setAsyncStatus] = useState({
    cms_number: { loading: false, valid: false, message: "" },
    email:      { loading: false, valid: false, message: "" },
  });
  const debounceTimers = useRef({});

  useEffect(() => {
    const timers = debounceTimers.current;
    return () => Object.values(timers).forEach(clearTimeout);
  }, []);

  const passwordChecks = useMemo(() => {
    const p = form.password || "";
    return [
      { id: "length",    label: "At least 8 characters",  met: p.length >= 8 },
      { id: "uppercase", label: "One uppercase letter",    met: /[A-Z]/.test(p) },
      { id: "number",    label: "One number",              met: /[0-9]/.test(p) },
      { id: "special",   label: "One special character",   met: /[^A-Za-z0-9]/.test(p) },
    ];
  }, [form.password]);

  const allPasswordChecksMet = passwordChecks.every((c) => c.met);

  const validateField = (name, value) => {
    const v = typeof value === "string" ? value.trim() : value;
    switch (name) {
      case "cms_number":
        if (!v) return "SAP ID is required.";
        if (v.length < 3) return "SAP ID must be at least 3 characters.";
        return "";
      case "email":
        if (!v) return "Please enter your university email.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
        return "";
      case "password":
        if (!value) return "Password is required.";
        if (!allPasswordChecksMet) return "Password does not meet all requirements.";
        return "";
      default:
        return "";
    }
  };

  const checkAsync = async (field, raw) => {
    const val = (raw || "").trim();
    if (!val || validateField(field, val)) return;

    setAsyncStatus((s) => ({ ...s, [field]: { loading: true, valid: false, message: "" } }));
    try {
      const res = await authApi.checkAvailability(field === "cms_number" ? "sap_id" : field, val);
      if (!res.data.available) {
        setErrors((e) => ({ ...e, [field]: res.data.message }));
        setAsyncStatus((s) => ({ ...s, [field]: { loading: false, valid: false, message: res.data.message } }));
      } else {
        setErrors((e) => {
          const next = { ...e };
          if (next[field]?.includes("already registered")) delete next[field];
          return next;
        });
        setAsyncStatus((s) => ({ ...s, [field]: { loading: false, valid: true, message: res.data.message } }));
      }
    } catch {
      setAsyncStatus((s) => ({ ...s, [field]: { loading: false, valid: false, message: "" } }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));

    if (touched[name]) {
      const err = validateField(name, value);
      setErrors((errs) => {
        const next = { ...errs };
        if (err) next[name] = err;
        else if (next[name] && !next[name].includes("already registered")) delete next[name];
        return next;
      });
    }

    if (name === "cms_number" || name === "email") {
      setAsyncStatus((s) => ({ ...s, [name]: { loading: false, valid: false, message: "" } }));
      if (debounceTimers.current[name]) clearTimeout(debounceTimers.current[name]);
      debounceTimers.current[name] = setTimeout(() => {
        if (!validateField(name, value) && value.trim()) checkAsync(name, value);
      }, 500);
    }
  };

  const handleBlur = (name) => {
    setTouched((t) => ({ ...t, [name]: true }));
    const err = validateField(name, form[name]);
    setErrors((e) => {
      const next = { ...e };
      if (err) next[name] = err;
      else if (next[name] && !next[name].includes("already registered")) delete next[name];
      return next;
    });
    if (!err && (name === "cms_number" || name === "email")) {
      checkAsync(name, form[name]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const fields = ["email", "cms_number", "password"];
    const newTouched = Object.fromEntries(fields.map((f) => [f, true]));
    const newErrors  = Object.fromEntries(
      fields.map((f) => [f, validateField(f, form[f])]).filter(([, v]) => v)
    );
    setTouched((t) => ({ ...t, ...newTouched }));
    setErrors((e) => ({ ...e, ...newErrors }));

    if (Object.keys(newErrors).length > 0) return;

    const pending = fields.some((f) => asyncStatus[f]?.loading);
    if (pending) return;

    if (errors.email || errors.cms_number) return;

    setLoading(true);
    try {
      await authApi.register({
        email:      form.email.trim().toLowerCase(),
        cms_number: form.cms_number.trim(),
        password:   form.password,
      });
      await login(form.email.trim(), form.password);
      navigate("/onboarding");
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg || "Validation error").join(", "));
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("Registration failed. Please check your inputs and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const FieldStatus = ({ field }) => {
    const async = asyncStatus[field];
    if (async?.loading) return <Loader2 size={16} className="spin-slow" style={{ color: "var(--color-primary)" }} />;
    if (async?.valid && !errors[field]) return <CheckCircle2 size={16} style={{ color: "var(--color-success)" }} />;
    return null;
  };

  return (
    <AuthLayout activeTab="register">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div style={{ marginBottom: "1.75rem" }}>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 800, marginBottom: "0.4rem", color: "var(--color-text-primary)" }}>
            Create Your Account
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", lineHeight: 1.55 }}>
            Quick sign-up — just three fields. You will complete your profile right after.
          </p>
        </div>

        <div className="onb-privacy-notice" style={{ marginBottom: "1.5rem" }}>
          <ShieldCheck size={17} />
          <span>
            <strong>Secure & Confidential</strong> — your data is only used for your personalized cyberbullying assessment.
          </span>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* Email */}
          <div className="form-group" id="email-group" style={{ marginBottom: "1.25rem" }}>
            <label className="form-label" htmlFor="email" style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Mail size={14} /> University Email <span style={{ color: "var(--color-danger)" }}>*</span>
              </span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="email"
                type="email"
                name="email"
                className={`form-input ${touched.email && errors.email ? "is-invalid" : asyncStatus.email?.valid ? "is-valid" : ""}`}
                placeholder="e.g. student@riphah.edu.pk"
                value={form.email}
                onChange={handleChange}
                onBlur={() => handleBlur("email")}
                autoComplete="email"
                autoFocus
                required
              />
              <span style={{ position: "absolute", right: "0.85rem", top: "50%", transform: "translateY(-50%)" }}>
                <FieldStatus field="email" />
              </span>
            </div>
            {asyncStatus.email?.loading && (
              <div className="inline-field-checking">
                <Loader2 size={13} className="spin-slow" /><span>Checking email...</span>
              </div>
            )}
            {touched.email && errors.email && !asyncStatus.email?.loading && (
              <div id="email-error" className="inline-field-error" role="alert">
                <AlertCircle size={14} /><span>{errors.email}</span>
              </div>
            )}
            {asyncStatus.email?.valid && !errors.email && form.email.trim() && (
              <div className="inline-field-success">
                <CheckCircle2 size={14} /><span>Email is available.</span>
              </div>
            )}
          </div>

          {/* SAP ID */}
          <div className="form-group" id="cms_number-group" style={{ marginBottom: "1.25rem" }}>
            <label className="form-label" htmlFor="cms_number" style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Hash size={14} /> SAP ID <span style={{ color: "var(--color-danger)" }}>*</span>
              </span>
              <span style={{ color: "var(--color-text-subtle)", fontSize: "0.78rem", fontWeight: 400 }}>Student Academic Portal ID</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="cms_number"
                type="text"
                name="cms_number"
                className={`form-input ${touched.cms_number && errors.cms_number ? "is-invalid" : asyncStatus.cms_number?.valid ? "is-valid" : ""}`}
                placeholder="e.g. 20234567 or 2021-CS-042"
                value={form.cms_number}
                onChange={handleChange}
                onBlur={() => handleBlur("cms_number")}
                autoComplete="off"
                required
              />
              <span style={{ position: "absolute", right: "0.85rem", top: "50%", transform: "translateY(-50%)" }}>
                <FieldStatus field="cms_number" />
              </span>
            </div>
            {asyncStatus.cms_number?.loading && (
              <div className="inline-field-checking">
                <Loader2 size={13} className="spin-slow" /><span>Checking SAP ID...</span>
              </div>
            )}
            {touched.cms_number && errors.cms_number && !asyncStatus.cms_number?.loading && (
              <div id="cms_number-error" className="inline-field-error" role="alert">
                <AlertCircle size={14} /><span>{errors.cms_number}</span>
              </div>
            )}
            {asyncStatus.cms_number?.valid && !errors.cms_number && form.cms_number.trim() && (
              <div className="inline-field-success">
                <CheckCircle2 size={14} /><span>SAP ID is available.</span>
              </div>
            )}
          </div>

          {/* Password */}
          <div className="form-group" id="password-group" style={{ marginBottom: "1.5rem" }}>
            <label className="form-label" htmlFor="password" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Lock size={14} /> Password <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPass ? "text" : "password"}
                name="password"
                className={`form-input ${touched.password && errors.password ? "is-invalid" : allPasswordChecksMet ? "is-valid" : ""}`}
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                onBlur={() => handleBlur("password")}
                aria-describedby="password-requirements"
                style={{ paddingRight: "2.75rem" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? "Hide password" : "Show password"}
                style={{
                  position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)",
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div id="password-requirements" className="pwd-requirements-box" style={{ marginTop: "0.65rem" }}>
              <div style={{ fontSize: "0.73rem", fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: "0.3rem" }}>
                Password requirements:
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.3rem" }}>
                {passwordChecks.map((req) => (
                  <div key={req.id} className={`pwd-req-item ${req.met ? "met" : ""}`}>
                    <span className="pwd-req-icon" aria-hidden="true">
                      {req.met ? <Check size={11} strokeWidth={3} /> : "•"}
                    </span>
                    <span>{req.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {touched.password && errors.password && (
              <div className="inline-field-error" role="alert">
                <AlertCircle size={14} /><span>{errors.password}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            id="register-submit"
            className="auth-primary-btn"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {loading ? (
              <><Loader2 size={18} className="auth-btn-spinner" /><span>Creating account...</span></>
            ) : (
              <><ArrowRight size={18} aria-hidden="true" /><span>Create Account & Continue</span></>
            )}
          </button>

          <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.86rem", color: "var(--color-text-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Sign In</Link>
          </p>
        </form>
      </motion.div>
    </AuthLayout>
  );
}
