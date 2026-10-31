import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Quote,
  BookOpen,
  HeartHandshake,
  ShieldCheck,
  Scale,
  Compass,
  Pause,
  Play,
  Sparkles
} from 'lucide-react';

const REFLECTION_SLIDES = [
  {
    id: 'kindness',
    num: '01',
    pillar: 'Respectful Discourse',
    arabic: 'وَقُولُوا لِلنَّاسِ حُسْنًا',
    verse: 'And speak to people good words...',
    reference: 'Surah Al-Baqarah 2:83',
    explanation: 'Kind and respectful communication helps create healthier digital communities.',
    takeaway: 'Before commenting or messaging in student forums, frame your speech constructively. Words left on a screen carry lasting emotional weight.',
    icon: HeartHandshake,
    accentColor: '#38bdf8', // Sky / Cyan
    badgeLabel: 'Civility & Tone',
  },
  {
    id: 'dignity',
    num: '02',
    pillar: 'Human Dignity & Anti-Ridicule',
    arabic: 'لَا يَسْخَرْ قَوْمٌ مِنْ قَوْمٍ',
    verse: 'Do not ridicule one another...',
    reference: 'Surah Al-Hujurat 49:11',
    explanation: 'Everyone deserves dignity and respect in online interactions.',
    takeaway: 'Refuse to participate in mocking memes, derogatory labeling, or public cyber-shaming. Anonymity behind a keyboard never strips someone of their human dignity.',
    icon: ShieldCheck,
    accentColor: '#818cf8', // Indigo / Blue
    badgeLabel: 'Anti-Harassment',
  },
  {
    id: 'justice',
    num: '03',
    pillar: 'Justice & Active Empathy',
    arabic: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ',
    verse: 'Indeed, Allah commands justice and good conduct...',
    reference: 'Surah An-Nahl 16:90',
    explanation: 'Fairness and empathy are essential for responsible digital behaviour.',
    takeaway: 'Practice active, positive bystander behavior. When you witness unfair digital targeting, stand with the individual through fair intervention and empathetic support.',
    icon: Scale,
    accentColor: '#a78bfa', // Purple / Violet
    badgeLabel: 'Ethical Bystander',
  },
  {
    id: 'verification',
    num: '04',
    pillar: 'Truth & Verification',
    arabic: 'فَتَبَيَّنُوا أَنْ تُصِيبُوا قَوْمًا بِجَهَالَةٍ',
    verse: 'If a troublemaker brings you news, verify it...',
    reference: 'Surah Al-Hujurat 49:6',
    explanation: 'Verifying information before sharing stops the spread of defamatory rumors and misinformation.',
    takeaway: 'Pause and fact-check before forwarding screenshots, unverified rumors, or harmful allegations across campus communication channels.',
    icon: Compass,
    accentColor: '#c084fc', // Bright Purple
    badgeLabel: 'Digital Integrity',
  },
];

/**
 * GeometricIslamicPattern
 * Subtle mathematical 8-pointed star & rosette motif inspired by Islamic architectural geometry.
 * Clean, minimal, low-opacity watermark.
 */
function GeometricIslamicPattern({ className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
        ...style,
      }}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1" opacity="0.45">
        <rect x="35" y="35" width="130" height="130" rx="4" />
        <rect
          x="35"
          y="35"
          width="500"
          height="130"
          rx="4"
          transform="rotate(45 100 100)"
        />
        <rect x="55" y="55" width="90" height="90" rx="2" />
        <rect
          x="55"
          y="55"
          width="90"
          height="90"
          rx="2"
          transform="rotate(45 100 100)"
        />
        <circle cx="100" cy="100" r="26" strokeDasharray="3 3" />
        <circle cx="100" cy="100" r="12" />
        <circle cx="100" cy="100" r="3" fill="currentColor" />
        <line x1="100" y1="10" x2="100" y2="35" />
        <line x1="100" y1="165" x2="100" y2="190" />
        <line x1="10" y1="100" x2="35" y2="100" />
        <line x1="165" y1="100" x2="190" y2="100" />
      </g>
    </svg>
  );
}

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 30 : -30,
    opacity: 0,
    scale: 0.985,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.38,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: (direction) => ({
    x: direction > 0 ? -30 : 30,
    opacity: 0,
    scale: 0.985,
    transition: {
      duration: 0.24,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};

export default function DigitalValuesReflection() {
  const [[currentIndex, direction], setSlide] = useState([0, 0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);

  const activeSlide = REFLECTION_SLIDES[currentIndex];
  const IconComponent = activeSlide.icon;

  const paginate = useCallback((newDirection) => {
    setSlide(([prevIndex]) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = REFLECTION_SLIDES.length - 1;
      if (nextIndex >= REFLECTION_SLIDES.length) nextIndex = 0;
      return [nextIndex, newDirection];
    });
  }, []);

  const goToSlide = (targetIndex) => {
    if (targetIndex === currentIndex) return;
    const newDir = targetIndex > currentIndex ? 1 : -1;
    setSlide([targetIndex, newDir]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      paginate(-1);
    } else if (e.key === 'ArrowRight') {
      paginate(1);
    }
  };

  useEffect(() => {
    if (!isPlaying || isHovered) return;

    const timer = setInterval(() => {
      paginate(1);
    }, 7000);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered, paginate]);

  return (
    <section
      aria-label="Digital Values Reflection"
      className="digital-values-section"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Soft Ambient Mesh Background — Blue & Purple Theme */}
      <div className="digital-values-ambient-container" aria-hidden="true">
        <div className="values-mesh-layer" />
        <div className="values-glow-orb values-glow-indigo" />
        <div className="values-glow-orb values-glow-purple" />
        <div className="values-glow-orb values-glow-blue" />
        <div className="values-ambient-grid" />
      </div>

      <div className="digital-values-content-wrap">
        {/* Section Header */}
        <div className="digital-values-header">
          <div className="digital-values-badge">
            <Sparkles size={13} className="digital-values-sparkle" />
            <span>Ethical Foundations for Digital Citizenship</span>
          </div>

          <h2 className="digital-values-title">
            Digital Values Reflection
          </h2>

          <p className="digital-values-subtitle">
            Timeless reflections on kindness, dignity, and justice — connecting ethical
            traditions with research-driven cyberbullying prevention for campus communities.
          </p>

          {/* Top Quick Pillar Selector Pills */}
          <div
            role="tablist"
            aria-label="Reflection Topics"
            className="digital-values-tablist"
          >
            {REFLECTION_SLIDES.map((slide, idx) => {
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  role="tab"
                  aria-selected={isCurrent}
                  aria-controls={`reflection-panel-${slide.id}`}
                  id={`reflection-tab-${slide.id}`}
                  onClick={() => goToSlide(idx)}
                  className={`digital-values-tab-btn ${isCurrent ? 'active' : ''}`}
                >
                  <span className="digital-values-tab-num">{slide.num}</span>
                  <span>{slide.pillar}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main Verse Card (CyberMirror Style: Deep Navy-Blue #26282cff to Royal Purple/Indigo #793bc0ff) ── */}
        <div
          ref={containerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="cybermirror-quote-card"
          aria-roledescription="carousel"
          aria-label="Digital ethics quotes and behavioral explanations"
        >
          {/* Large Faded Decorative Quote Watermark at Top-Left */}
          <Quote
            size={10}
            className="cybermirror-watermark-quote"
            aria-hidden="true"
          />

          {/* Low-opacity Islamic Geometric Motifs in background corners */}
          <div className="cybermirror-corner-pattern top-right" aria-hidden="true">
            <GeometricIslamicPattern style={{ width: '100%', height: '100%' }} />
          </div>
          <div className="cybermirror-corner-pattern bottom-left" aria-hidden="true">
            <GeometricIslamicPattern style={{ width: '100%', height: '100%' }} />
          </div>

          {/* Top Center Controls: Category/Surah Chips + Indicator Dots + Play/Pause Toggle */}
          <div className="cybermirror-top-bar">
            {/* Category / Pillar Chip */}
            <div className="cybermirror-badge-pill">
              <IconComponent size={14} style={{ color: '#a78bfa' }} />
              <span>{activeSlide.pillar}</span>
            </div>

            {/* Navigation Dots with Purple/Indigo Active Pill */}
            <div className="cybermirror-dots-track" role="group" aria-label="Slide indicators">
              {REFLECTION_SLIDES.map((slide, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}: ${slide.pillar}`}
                    className={`cybermirror-dot ${isActive ? 'active' : ''}`}
                  />
                );
              })}
            </div>

            {/* Reference Badge & Pause/Play Control */}
            <div className="cybermirror-top-right-group">
              <div className="cybermirror-surah-pill">
                <BookOpen size={13} style={{ color: '#38bdf8' }} />
                <span>{activeSlide.reference}</span>
              </div>

              {/* Working Pause/Play Toggle Button */}
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                aria-label={isPlaying ? 'Pause slider auto-play' : 'Resume slider auto-play'}
                title={isPlaying ? 'Pause auto-rotation' : 'Play auto-rotation'}
                className="cybermirror-pause-btn"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>
            </div>
          </div>

          {/* Left Arrow Button (Round Glass Button on the Left Side) */}
          <button
            type="button"
            onClick={() => paginate(-1)}
            aria-label="Previous reflection slide"
            className="cybermirror-side-nav-btn prev-btn"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Right Arrow Button (Round Glass Button on the Right Side) */}
          <button
            type="button"
            onClick={() => paginate(1)}
            aria-label="Next reflection slide"
            className="cybermirror-side-nav-btn next-btn"
          >
            <ChevronRight size={22} />
          </button>

          {/* Central Verse Body Content */}
          <div className="cybermirror-center-body">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeSlide.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                role="tabpanel"
                id={`reflection-panel-${activeSlide.id}`}
                aria-labelledby={`reflection-tab-${activeSlide.id}`}
                className="cybermirror-slide-container"
              >
                {/* Large Arabic Verse (Lavender/Cyan Blue glow, Generous Line-Height) */}
                <div lang="ar" dir="rtl" className="cybermirror-arabic-text">
                  {activeSlide.arabic}
                </div>

                {/* English Translation (Large Bold Text, Clean Soft White/Ice Blue, ~2rem) */}
                <blockquote className="cybermirror-english-quote">
                  "{activeSlide.verse.replace(/^["']|["']$/g, '')}"
                </blockquote>

                {/* Short Blue/Purple Accent Line above Campus Action */}
                <div className="cybermirror-gold-accent-line" aria-hidden="true" />

                {/* Translucent Glass Panel (bg-white/10, backdrop-blur, border-white/20, light text) */}
                <div className="cybermirror-action-panel">
                  <div className="cybermirror-action-icon-box">
                    <IconComponent size={20} style={{ color: '#a78bfa' }} />
                  </div>
                  <div className="cybermirror-action-content">
                    <div className="cybermirror-action-header">
                      <span className="cybermirror-action-title">
                        Positive Online Behaviour · Campus Action
                      </span>
                      <span className="cybermirror-action-num">
                        {activeSlide.num} / {String(REFLECTION_SLIDES.length).padStart(2, '0')}
                      </span>
                    </div>
                    <p className="cybermirror-action-explanation">
                      {activeSlide.explanation}
                    </p>
                    <p className="cybermirror-action-takeaway">
                      <strong className="cybermirror-action-highlight">Campus Guideline: </strong>
                      {activeSlide.takeaway}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Subtle Auto-Play Bottom Progress Bar */}
          <div className="cybermirror-bottom-progress-track">
            {isPlaying && !isHovered && (
              <motion.div
                key={currentIndex}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 7, ease: 'linear' }}
                className="cybermirror-bottom-progress-fill"
              />
            )}
          </div>
        </div>

        {/* Subtle Academic Attribution Note */}
        <div className="digital-values-footer-note">
          <span>Prisma University Behavioral Research • Integrating ethical frameworks with evidence-based anti-cyberbullying modules</span>
        </div>
      </div>
    </section>
  );
}
