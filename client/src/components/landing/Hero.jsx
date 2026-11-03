import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import Button from '../ui/Button';
import StudentHeroIllustration from './StudentHeroIllustration';

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
            Know how to respond to{' '}
            <span className="hero-gradient-text">cyberbullying — before it happens.</span>
          </h1>

          {/* Subtext */}
          <p className="hero-description">
            Take a short assessment, get lessons matched to your results, and track your
            progress over time. Built for university students. Free and private.
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

        {/* Right Column: University Student-Centric Visual Illustration */}
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
        >
          <StudentHeroIllustration />
        </motion.div>
      </div>
    </section>
  );
}
