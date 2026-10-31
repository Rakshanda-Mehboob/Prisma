import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Lock, Sparkles } from 'lucide-react';

const STATS = [
  {
    icon: BookOpen,
    label: '3 Learning Modules',
    detail: 'Theory of Planned Behavior',
  },
  {
    icon: Clock,
    label: '10-Minute Assessment',
    detail: 'Quick scenario evaluation',
  },
  {
    icon: Lock,
    label: '100% Private',
    detail: 'Zero personal data shared',
  },
  {
    icon: Sparkles,
    label: 'AI-Guided',
    detail: 'Context-aware suggestions',
  },
];

export default function Stats() {
  return (
    <section className="stats-section">
      <motion.div
        className="stats-strip"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        {STATS.map((item, index) => {
          const Icon = item.icon;
          return (
            <React.Fragment key={item.label}>
              <div className="stats-item">
                <div className="stats-icon-wrapper">
                  <Icon size={17} />
                </div>
                <div className="stats-text-block">
                  <span className="stats-label">{item.label}</span>
                  <span className="stats-detail">{item.detail}</span>
                </div>
              </div>
              {index < STATS.length - 1 && <span className="stats-divider" aria-hidden="true" />}
            </React.Fragment>
          );
        })}
      </motion.div>
    </section>
  );
}
