import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, ShieldCheck, GraduationCap } from 'lucide-react';
import PrismaLogo from '../PrismaLogo';

/**
 * AuthLayout — Prisma Authentication Frame.
 * Designed with a modern 2-column structure matching Prisma's Indigo/Teal/Violet design system:
 * - Clean Prisma surface background (#f8fafc / #f5f6fa)
 * - Top row: "← Back to Home" pill button + authentic Prisma logo & brand
 * - Left column:
 *    * Proactive Cyberbullying Intervention badge
 *    * Heading & description focused on Prisma's student bystander mission
 *    * 2 Prisma feature cards (Research-Grounded Scenarios & 100% Confidential)
 * - Right column:
 *    * White card (radius 28px) with [Create Account | Log In] segmented toggle
 *    * Scoped Prisma Indigo theme
 */
export default function AuthLayout({ activeTab = 'login', children }) {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Top bar: Back to Home + Authentic Prisma Logo */}
        <header className="auth-top-bar">
          <Link to="/" className="auth-back-link" aria-label="Back to Home">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>

          <Link to="/" className="navbar-brand auth-top-brand" aria-label="Prisma Home">
            <div className="brand-icon">
              <PrismaLogo size={34} />
            </div>
            <span>Prisma</span>
          </Link>
        </header>

        {/* Main Two-Column Layout */}
        <div className="auth-main-grid">
          {/* Left Column: Prisma Mission & Feature Highlights */}
          <section className="auth-hero-col" aria-label="Prisma System Overview">
            <div className="auth-hero-badge">
              <Shield size={14} />
              <span>AI-Guided Cyberbullying Intervention Platform</span>
            </div>

            <h1 className="auth-hero-title">
              Empowering university students to stand against online harassment.
            </h1>

            <p className="auth-hero-subtitle">
              Prisma combines behavioral science and scenario-based AI learning to help students recognize cyberbullying, build real confidence, and intervene safely.
            </p>

            <div className="auth-features-list">
              {/* Feature Card 1 */}
              <div className="auth-feature-card">
                <div className="auth-feature-icon icon-indigo" aria-hidden="true">
                  <ShieldCheck size={22} />
                </div>
                <div className="auth-feature-content">
                  <h2 className="auth-feature-title">Research-Grounded Scenarios</h2>
                  <p className="auth-feature-desc">
                    Realistic campus peer situations evaluate and build your constructive bystander intervention skills.
                  </p>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="auth-feature-card">
                <div className="auth-feature-icon icon-teal" aria-hidden="true">
                  <GraduationCap size={22} />
                </div>
                <div className="auth-feature-content">
                  <h2 className="auth-feature-title">100% Confidential &amp; Protected</h2>
                  <p className="auth-feature-desc">
                    Your student profile, assessment scores, and reflection responses are strictly private.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Form Card with Segmented Toggle */}
          <section className="auth-form-card" aria-label={activeTab === 'login' ? 'Log In' : 'Create Account'}>
            {/* Segmented Tab Navigation: [Create Account | Log In] */}
            <div
              className="auth-segmented-track"
              role="tablist"
              aria-label="Account Access Tabs"
            >
              <button
                type="button"
                role="tab"
                id="tab-register"
                aria-selected={activeTab === 'register'}
                aria-controls="auth-panel"
                className={`auth-segmented-btn ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => navigate('/register')}
              >
                Create Account
              </button>
              <button
                type="button"
                role="tab"
                id="tab-login"
                aria-selected={activeTab === 'login'}
                aria-controls="auth-panel"
                className={`auth-segmented-btn ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => navigate('/login')}
              >
                Log In
              </button>
            </div>

            {/* Child Form Content */}
            <div className="auth-card-body" id="auth-panel" role="tabpanel">
              {children}
            </div>

            {/* Subtle Divider & Confidentiality Footnote */}
            <div className="auth-card-divider" />
            <div className="auth-security-footnote">
              <ShieldCheck size={16} />
              <span>100% Confidential &amp; Student Privacy Protected</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
