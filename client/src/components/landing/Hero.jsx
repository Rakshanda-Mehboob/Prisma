import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Check,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import Button from '../ui/Button';

const TRUST_POINTS = [
  'Based on proven research',
  'Personalised lessons',
  'Track your progress',
  'Free and private',
];

export default function Hero({ user }) {
  return (
    <section className="hero-section" id="platform">
      {/* Background Ambience: Gradient Glows, Dot Grid & Blurred Blobs */}
      <div className="hero-bg-container" aria-hidden="true">
        <div className="hero-dot-grid" />
        <div className="hero-radial-glow" />
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
      </div>

      <div className="hero-container">
        {/* Left Column: Headline, Copy, CTAs, Trust Grid */}
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Badge */}
          <div className="hero-badge">
            <span className="hero-badge-icon">
              <Shield size={14} />
            </span>
            <span>Cyberbullying Awareness Program</span>
          </div>

          {/* Headline */}
          <h1 className="hero-title">
            Build healthier online communities{' '}
            <span className="hero-gradient-text">through behavioural science.</span>
          </h1>

          {/* Subtext */}
          <p className="hero-description">
            Prisma helps university students understand and improve their response to
            cyberbullying through personalised assessments and AI-guided learning modules.
          </p>

          {/* CTAs */}
          <div className="hero-actions">
            <Link to={user ? '/dashboard' : '/register'} className="hero-cta-link">
              <Button
                variant="primary"
                size="lg"
                className="hero-primary-btn"
                iconRight={<ArrowRight size={17} className="hero-btn-arrow" />}
              >
                {user ? 'Go to Dashboard' : "Get Started — it's free"}
              </Button>
            </Link>

            <Link to={user ? '/assessment' : '/login'} className="hero-cta-link">
              <Button variant="secondary" size="lg" className="hero-secondary-btn">
                {user ? 'Take Assessment' : 'Sign In'}
              </Button>
            </Link>
          </div>

          {/* Trust Points in a clean 2x2 grid */}
          <div className="hero-trust-grid">
            {TRUST_POINTS.map((point) => (
              <div key={point} className="hero-trust-item">
                <span className="hero-trust-icon">
                  <CheckCircle2 size={16} />
                </span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Column: Interactive Product Preview Visual */}
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
        >
          <div className="hero-preview-wrapper">
            {/* Layer A: Sample Scenario Card */}
            <div className="preview-card scenario-card">
              <div className="scenario-card-header">
                <div className="scenario-header-left">
                  <span className="scenario-live-dot" />
                  <span className="scenario-badge">Scenario Simulation</span>
                </div>
                <span className="scenario-module-tag">Module 1 · Bystander Action</span>
              </div>

              <div className="scenario-question-box">
                <div className="scenario-prompt-icon">
                  <MessageSquare size={16} />
                </div>
                <p className="scenario-question">
                  Someone comments on your post: <br />
                  <span className="scenario-quote">
                    "You have no right to speak on this. Delete your account."
                  </span>
                  <br />
                  How would you respond?
                </p>
              </div>

              <div className="scenario-options-list">
                {/* Option 1 */}
                <div className="scenario-option">
                  <span className="option-radio" />
                  <span className="option-text">Fire back with an angry response to defend myself</span>
                </div>

                {/* Option 2 (Selected / Healthy Choice) */}
                <div className="scenario-option active">
                  <span className="option-radio active">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="option-text">
                    Pause, preserve screenshot evidence, and report safely
                  </span>
                  <span className="option-badge">Constructive</span>
                </div>

                {/* Option 3 */}
                <div className="scenario-option">
                  <span className="option-radio" />
                  <span className="option-text">Ignore it and leave the community entirely</span>
                </div>
              </div>
            </div>

            {/* Layer B: Resilience Score Ring Card */}
            <div className="preview-card floating-score-card">
              <div className="score-ring-container">
                <svg className="score-ring-svg" viewBox="0 0 80 80">
                  <circle
                    className="score-ring-bg"
                    cx="40"
                    cy="40"
                    r="34"
                  />
                  <circle
                    className="score-ring-progress"
                    cx="40"
                    cy="40"
                    r="34"
                    strokeDasharray="213.6"
                    strokeDashoffset="47"
                  />
                </svg>
                <div className="score-ring-content">
                  <span className="score-number">78%</span>
                </div>
              </div>

              <div className="score-details">
                <span className="score-label">Resilience Score</span>
                <span className="score-status">
                  <TrendingUp size={12} />
                  +14% from baseline
                </span>
              </div>
            </div>

            {/* Layer C: AI Tip Bubble */}
            <div className="preview-card floating-tip-card">
              <div className="tip-icon-box">
                <Sparkles size={16} />
              </div>
              <div className="tip-text-box">
                <span className="tip-tag">AI Guidance</span>
                <p className="tip-content">
                  De-escalate and preserve documentation without engaging in public retaliation.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
