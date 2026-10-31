import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, BarChart3 } from 'lucide-react';

// Feature definitions matching the design brief
const FEATURES = [
  {
    icon: Sparkles,
    color: '#4f46e5',
    colorBg: 'rgba(79,70,229,0.08)',
    tag: 'AI-Guided',
    title: 'Smart, scenario‑based learning',
    tagline: 'Real campus situations. Instant feedback.',
    visual: (
      <div className="feat-visual feat-visual-ai">
        <div className="feat-chat-bubble feat-bubble-q">
          "You see a classmate being harassed online. What do you do?"
        </div>
        <div className="feat-chat-options">
          <span className="feat-option">Ignore it</span>
          <span className="feat-option feat-option-active">Support privately ✓</span>
          <span className="feat-option">Retaliate</span>
        </div>
        <div className="feat-chat-bubble feat-bubble-ai">
          <span className="feat-ai-label">AI Feedback</span>
          Great choice — bystander support reduces escalation by 57%.
        </div>
      </div>
    ),
  },
  {
    icon: ShieldCheck,
    color: '#059669',
    colorBg: 'rgba(5,150,105,0.08)',
    tag: 'Privacy‑First',
    title: 'Your data stays yours',
    tagline: 'No names. No exposure. Just growth.',
    visual: (
      <div className="feat-visual feat-visual-privacy">
        <div className="feat-privacy-shield">
          <ShieldCheck size={36} strokeWidth={1.5} />
        </div>
        <div className="feat-privacy-rows">
          <div className="feat-privacy-row">
            <span className="feat-privacy-dot feat-dot-green" />
            <span>Your responses</span>
            <span className="feat-privacy-badge">Private</span>
          </div>
          <div className="feat-privacy-row">
            <span className="feat-privacy-dot feat-dot-green" />
            <span>Your scores</span>
            <span className="feat-privacy-badge">Private</span>
          </div>
          <div className="feat-privacy-row">
            <span className="feat-privacy-dot feat-dot-green" />
            <span>Your identity</span>
            <span className="feat-privacy-badge">Protected</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: BarChart3,
    color: '#0891b2',
    colorBg: 'rgba(8,145,178,0.08)',
    tag: 'Progress',
    title: "See how far you've come",
    tagline: 'Before vs. after. Clear and measurable.',
    visual: (
      <div className="feat-visual feat-visual-progress">
        <div className="feat-progress-labels">
          <span>Before</span>
          <span>After</span>
        </div>
        <div className="feat-bars">
          <div className="feat-bar-row">
            <span className="feat-bar-label">Bystander Action</span>
            <div className="feat-bar-track">
              <div className="feat-bar feat-bar-before" style={{ width: '42%' }} />
            </div>
            <div className="feat-bar-track">
              <div className="feat-bar feat-bar-after" style={{ width: '78%' }} />
            </div>
          </div>
          <div className="feat-bar-row">
            <span className="feat-bar-label">Social Norms</span>
            <div className="feat-bar-track">
              <div className="feat-bar feat-bar-before" style={{ width: '55%' }} />
            </div>
            <div className="feat-bar-track">
              <div className="feat-bar feat-bar-after" style={{ width: '85%' }} />
            </div>
          </div>
          {/* Confidence row removed per request */}
        </div>
      </div>
    ),
  },
];

export default function Features() {
  return (
    <section className="landing-section features-section" id="features">
      <div className="section-header">
        <span className="section-eyebrow">Platform Features</span>
        <h2 className="section-title">Everything you need, nothing you don&apos;t</h2>
        <p className="section-subtitle">
          Three focused tools that work together to build real digital bystander confidence.
        </p>
      </div>
      <div className="features-visual-grid">
        {FEATURES.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              className="feature-visual-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.12 }}
            >
              {/* Card Header */}
              <div className="fvc-header">
                <div className="fvc-icon-box" style={{ background: feature.colorBg, color: feature.color }}>
                  <Icon size={20} />
                </div>
                <span className="fvc-tag" style={{ color: feature.color, background: feature.colorBg }}>
                  {feature.tag}
                </span>
              </div>

              <h3 className="fvc-title">{feature.title}</h3>
              <p className="fvc-tagline">{feature.tagline}</p>

              {/* Visual Preview */}
              <div className="fvc-visual-area">
                {feature.visual}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
