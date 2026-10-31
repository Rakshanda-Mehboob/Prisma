import React from 'react';
import { motion } from 'framer-motion';
import { Brain, BookOpen, TrendingUp } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Take the assessment',
    description:
      'Answer realistic campus scenarios that evaluate your bystander attitudes, perceived norms, and behavioral control.',
    icon: Brain,
    badge: 'Baseline Evaluation',
  },
  {
    step: '02',
    title: 'Get personalised lessons',
    description:
      'Receive targeted, bite-sized lessons with interactive exercises and AI-guided suggestions tailored to your growth areas.',
    icon: BookOpen,
    badge: 'Tailored Modules',
  },
  {
    step: '03',
    title: 'Track your progress',
    description:
      'Evaluate your development post-learning and view measurable score improvements in constructive peer intervention.',
    icon: TrendingUp,
    badge: 'Measurable Growth',
  },
];

export default function HowItWorks() {
  return (
    <section className="landing-section how-it-works-section" id="how-it-works">
      <div className="section-header">
        <span className="section-eyebrow"></span>
        <h2 className="section-title">How Prisma works</h2>
        <p className="section-subtitle">
          Three clear steps grounded in behavioural science to move from awareness to action.
        </p>
      </div>

      <div className="how-it-works-container">
        {/* Visual Connector Line (desktop) */}
        <div className="how-it-works-line" aria-hidden="true" />

        <div className="how-it-works-grid">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                className="step-card"
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.12 }}
              >
                <div className="step-card-top">
                  <div className="step-icon-box">
                    <Icon size={24} />
                  </div>
                  <span className="step-number">{step.step}</span>
                </div>

                <div className="step-card-badge">{step.badge}</div>

                <h3 className="step-card-title">{step.title}</h3>
                <p className="step-card-desc">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
