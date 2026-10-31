import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '../ui/Button';

export default function CTA({ user }) {
  return (
    <section className="landing-section cta-section">
      <motion.div
        className="cta-banner"
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="cta-banner-bg" aria-hidden="true">
          <div className="cta-glow-circle cta-glow-1" />
          <div className="cta-glow-circle cta-glow-2" />
        </div>

        <div className="cta-content">
          <div className="cta-pill">
            <ShieldCheck size={14} />
            <span>Join Your University Peers</span>
          </div>

          <h2 className="cta-headline">
            Build healthier online communities today.
          </h2>

          <p className="cta-subtext">
            Start with a 10-minute assessment to understand your bystander strengths and
            unlock personalised, evidence-based learning.
          </p>

          <div className="cta-actions">
            <Link to={user ? '/dashboard' : '/register'}>
              <Button
                variant="primary"
                size="lg"
                className="cta-btn-primary"
                iconRight={<ArrowRight size={17} className="hero-btn-arrow" />}
              >
                {user ? 'Open Your Dashboard' : "Get Started — it's free"}
              </Button>
            </Link>

            <Link to={user ? '/assessment' : '/login'}>
              <button type="button" className="cta-btn-secondary">
                {user ? 'Take Assessment' : 'Sign In'}
              </button>
            </Link>
          </div>

          <p className="cta-footnote">
            Free for university students · No credit card required · 100% private
          </p>
        </div>
      </motion.div>
    </section>
  );
}
