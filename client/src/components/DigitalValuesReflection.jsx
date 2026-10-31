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
  Sparkles,
  ArrowRight
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
    accentColor: 'var(--color-secondary)', // Teal
    accentBg: 'rgba(8, 145, 178, 0.08)',
    accentBorder: 'rgba(8, 145, 178, 0.22)',
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
    accentColor: 'var(--color-primary)', // Indigo
    accentBg: 'rgba(79, 70, 229, 0.08)',
    accentBorder: 'rgba(79, 70, 229, 0.22)',
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
    accentColor: 'var(--color-success)', // Emerald
    accentBg: 'rgba(5, 150, 105, 0.08)',
    accentBorder: 'rgba(5, 150, 105, 0.22)',
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
    accentColor: 'var(--color-warning)', // Warm Amber
    accentBg: 'rgba(217, 119, 6, 0.08)',
    accentBorder: 'rgba(217, 119, 6, 0.22)',
    badgeLabel: 'Digital Integrity',
  },
];

/**
 * GeometricIslamicPattern
 * Subtle mathematical 8-pointed star & rosette motif inspired by Islamic architectural geometry.
 * Clean, minimal, very low-opacity watermark suitable for a premium academic university platform.
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
      <g stroke="currentColor" strokeWidth="1.2" opacity="0.6">
        {/* Outer square 1 */}
        <rect x="35" y="35" width="130" height="130" rx="4" />
        {/* Outer square 2 (rotated 45deg) */}
        <rect
          x="35"
          y="35"
          width="130"
          height="130"
          rx="4"
          transform="rotate(45 100 100)"
        />
        {/* Inner concentric octagram */}
        <rect x="55" y="55" width="90" height="90" rx="2" />
        <rect
          x="55"
          y="55"
          width="90"
          height="90"
          rx="2"
          transform="rotate(45 100 100)"
        />
        {/* Central rosette circle & diamond */}
        <circle cx="100" cy="100" r="26" strokeDasharray="3 3" />
        <circle cx="100" cy="100" r="12" />
        <circle cx="100" cy="100" r="3" fill="currentColor" />
        {/* Radiating corner accents */}
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
    x: direction > 0 ? 32 : -32,
    opacity: 0,
    scale: 0.99,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: (direction) => ({
    x: direction > 0 ? -32 : 32,
    opacity: 0,
    scale: 0.99,
    transition: {
      duration: 0.25,
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

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      paginate(-1);
    } else if (e.key === 'ArrowRight') {
      paginate(1);
    }
  };

  // Auto-play timer
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
      {/* ── Soft Gradient Mesh & Blurred Blobs (Apple/Linear style) ── */}
      <div className="digital-values-ambient-container" aria-hidden="true">
        <div className="values-mesh-layer" />
        <div className="values-glow-orb values-glow-indigo" />
        <div className="values-glow-orb values-glow-teal" />
        <div className="values-glow-orb values-glow-violet" />
        <div className="values-ambient-grid" />
      </div>

      <div className="digital-values-content-wrap">
        {/* ── Section Header ── */}
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

          {/* Quick Pillar selector tabs for desktop/tablet */}
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
                  style={{
                    borderColor: isCurrent ? slide.accentBorder : 'rgba(99, 102, 241, 0.12)',
                    background: isCurrent ? slide.accentBg : 'rgba(255, 255, 255, 0.7)',
                    color: isCurrent ? slide.accentColor : 'var(--color-text-secondary)',
                  }}
                >
                  <span className="digital-values-tab-num">
                    {slide.num}
                  </span>
                  <span>{slide.pillar}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main Reflection Carousel Glassmorphism Card (1150px max width) ── */}
        <div
          ref={containerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="digital-values-card"
          aria-roledescription="carousel"
          aria-label="Digital ethics quotes and behavioral explanations"
        >
          {/* Animated Light Sweep Reflection across the glass surface */}
          <div className="card-light-sweep" aria-hidden="true" />

          {/* Very low-opacity Islamic Geometric Motifs in background corners */}
          <div
            className="card-pattern-watermark top-right"
            style={{ color: activeSlide.accentColor }}
            aria-hidden="true"
          >
            <GeometricIslamicPattern style={{ width: '100%', height: '100%' }} />
          </div>

          <div
            className="card-pattern-watermark bottom-left"
            style={{ color: 'var(--color-primary)' }}
            aria-hidden="true"
          >
            <GeometricIslamicPattern style={{ width: '100%', height: '100%' }} />
          </div>

          {/* Top Progress bar for auto-play */}
          <div className="card-progress-track">
            {isPlaying && !isHovered && (
              <motion.div
                key={currentIndex}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 7, ease: 'linear' }}
                className="card-progress-fill"
                style={{
                  background: `linear-gradient(90deg, ${activeSlide.accentColor}, var(--color-primary))`,
                }}
              />
            )}
          </div>

          {/* Card Body with Animated Presence */}
          <div className="card-body-content">
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
                className="card-slide-motion"
              >
                {/* Top metadata row: badge & scripture reference */}
                <div className="card-meta-row">
                  <div
                    className="card-pillar-pill"
                    style={{
                      background: activeSlide.accentBg,
                      border: `1px solid ${activeSlide.accentBorder}`,
                      color: activeSlide.accentColor,
                    }}
                  >
                    <IconComponent size={15} />
                    <span>{activeSlide.pillar}</span>
                  </div>

                  <div className="card-reference-pill">
                    <BookOpen size={13} color={activeSlide.accentColor} />
                    <span>{activeSlide.reference}</span>
                  </div>
                </div>

                {/* Main Quote & Arabic Script Grid Layout */}
                <div className="card-quote-section">
                  {/* Arabic Calligraphy Snippet (clean, academic, elegant) */}
                  <div
                    lang="ar"
                    dir="rtl"
                    className="card-arabic-text"
                  >
                    {activeSlide.arabic}
                  </div>

                  {/* Main Verse Quote */}
                  <div className="card-verse-box">
                    <Quote
                      size={44}
                      className="card-quote-icon"
                      style={{ color: activeSlide.accentColor }}
                    />
                    <blockquote className="card-quote-text">
                      "{activeSlide.verse.replace(/^["']|["']$/g, '')}"
                    </blockquote>
                  </div>
                </div>

                {/* Explanatory Connection Box — Linking to Cyberbullying & Behavioral Science */}
                <div
                  className="card-explanation-box"
                  style={{
                    borderLeftColor: activeSlide.accentColor,
                  }}
                >
                  <div className="card-explanation-header">
                    <span
                      className="card-explanation-tag"
                      style={{ color: activeSlide.accentColor }}
                    >
                      Positive Online Behaviour & Science
                    </span>
                  </div>

                  <p className="card-explanation-desc">
                    {activeSlide.explanation}
                  </p>

                  <p className="card-explanation-action">
                    <strong className="card-action-label">Campus Action: </strong>
                    {activeSlide.takeaway}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* ── Footer Controls: Prev/Next, Dots, Play/Pause & Counter ── */}
            <div className="card-footer-controls">
              {/* Left: Auto-play toggle & Slide Counter */}
              <div className="card-autoplay-group">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  aria-label={isPlaying ? 'Pause slider auto-play' : 'Resume slider auto-play'}
                  title={isPlaying ? 'Pause auto-rotation' : 'Play auto-rotation'}
                  className="card-control-btn play-pause-btn"
                  style={{
                    color: isPlaying ? 'var(--color-text-muted)' : activeSlide.accentColor,
                  }}
                >
                  {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                </button>

                <span className="card-counter">
                  <span className="card-counter-current">{activeSlide.num}</span>
                  {' / '}
                  {String(REFLECTION_SLIDES.length).padStart(2, '0')}
                </span>
              </div>

              {/* Center: Navigation Indicator Dots */}
              <div
                className="card-dots-group"
                role="group"
                aria-label="Slide indicators"
              >
                {REFLECTION_SLIDES.map((slide, idx) => {
                  const isActive = idx === currentIndex;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => goToSlide(idx)}
                      aria-label={`Go to slide ${idx + 1}: ${slide.pillar}`}
                      className={`card-dot ${isActive ? 'active' : ''}`}
                      style={{
                        background: isActive
                          ? slide.accentColor
                          : 'rgba(99, 102, 241, 0.16)',
                      }}
                    />
                  );
                })}
              </div>

              {/* Right: Prev & Next Arrow Buttons */}
              <div className="card-arrows-group">
                <button
                  type="button"
                  onClick={() => paginate(-1)}
                  aria-label="Previous reflection slide"
                  className="digital-values-nav-btn card-arrow-btn"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => paginate(1)}
                  aria-label="Next reflection slide"
                  className="digital-values-nav-btn card-arrow-btn"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
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
