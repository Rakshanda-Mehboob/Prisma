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
 * Clean, minimal, low-opacity watermark suitable for an academic university platform.
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
      <g stroke="currentColor" strokeWidth="1.2" opacity="0.85">
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
    x: direction > 0 ? 40 : -40,
    opacity: 0,
    scale: 0.985,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.38,
      ease: [0.25, 1, 0.5, 1],
    },
  },
  exit: (direction) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
    scale: 0.985,
    transition: {
      duration: 0.28,
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
      style={{
        padding: '0 0 clamp(3.5rem, 6vw, 5rem)',
        position: 'relative',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Section Header ── */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.08), rgba(79, 70, 229, 0.08))',
            border: '1px solid rgba(8, 145, 178, 0.22)',
            borderRadius: 'var(--radius-full)',
            padding: '0.35rem 0.95rem',
            marginBottom: '1rem',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--color-secondary)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          <Sparkles size={13} />
          Ethical Foundations for Digital Citizenship
        </div>

        <h2
          style={{
            fontSize: 'clamp(1.6rem, 3vw, 2.3rem)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: 'var(--color-text-primary)',
            marginBottom: '0.75rem',
          }}
        >
          Digital Values Reflection
        </h2>

        <p
          style={{
            color: 'var(--color-text-muted)',
            fontSize: 'clamp(0.92rem, 1.8vw, 1.05rem)',
            maxWidth: '640px',
            margin: '0 auto',
            lineHeight: 1.65,
          }}
        >
          Timeless reflections on kindness, dignity, and justice — connecting ethical
          traditions with research-driven cyberbullying prevention for campus communities.
        </p>

        {/* Quick Pillar selector tabs for desktop/tablet */}
        <div
          role="tablist"
          aria-label="Reflection Topics"
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginTop: '1.75rem',
          }}
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
                className="digital-values-tab-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.42rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: isCurrent ? 600 : 500,
                  borderRadius: 'var(--radius-full)',
                  border: isCurrent
                    ? `1px solid ${slide.accentBorder}`
                    : '1px solid var(--color-border)',
                  background: isCurrent ? slide.accentBg : 'var(--color-surface)',
                  color: isCurrent ? slide.accentColor : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isCurrent ? 'var(--shadow-xs)' : 'none',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    opacity: isCurrent ? 1 : 0.6,
                  }}
                >
                  {slide.num}
                </span>
                <span>{slide.pillar}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Reflection Carousel Card ── */}
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={{
          position: 'relative',
          maxWidth: '920px',
          margin: '0 auto',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
          outline: 'none',
        }}
        className="card-hover digital-values-card"
        aria-roledescription="carousel"
        aria-label="Digital ethics quotes and behavioral explanations"
      >
        {/* Subtle Watermark Motifs (Top Right & Bottom Left) */}
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '180px',
            height: '180px',
            opacity: 0.05,
            color: activeSlide.accentColor,
            pointerEvents: 'none',
            transition: 'color 0.4s ease',
          }}
        >
          <GeometricIslamicPattern style={{ width: '100%', height: '100%' }} />
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '-40px',
            left: '-40px',
            width: '160px',
            height: '160px',
            opacity: 0.035,
            color: 'var(--color-primary)',
            pointerEvents: 'none',
          }}
        >
          <GeometricIslamicPattern style={{ width: '100%', height: '100%' }} />
        </div>

        {/* Top Progress bar for auto-play */}
        <div
          style={{
            height: '3px',
            width: '100%',
            background: 'rgba(99, 102, 241, 0.08)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {isPlaying && !isHovered && (
            <motion.div
              key={currentIndex}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 7, ease: 'linear' }}
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${activeSlide.accentColor}, var(--color-primary))`,
              }}
            />
          )}
        </div>

        {/* Card Body with Animated Presence */}
        <div
          style={{
            padding: 'clamp(1.75rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem) clamp(1.5rem, 3vw, 2.25rem)',
            minHeight: '360px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
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
              style={{ width: '100%' }}
            >
              {/* Top metadata row: badge & scripture reference */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  marginBottom: '1.75rem',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    background: activeSlide.accentBg,
                    border: `1px solid ${activeSlide.accentBorder}`,
                    color: activeSlide.accentColor,
                    borderRadius: 'var(--radius-full)',
                    padding: '0.28rem 0.75rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                  }}
                >
                  <IconComponent size={14} />
                  <span>{activeSlide.pillar}</span>
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.82rem',
                    color: 'var(--color-text-secondary)',
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                    background: 'var(--color-surface-2)',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <BookOpen size={13} color={activeSlide.accentColor} />
                  <span>{activeSlide.reference}</span>
                </div>
              </div>

              {/* Arabic Calligraphy Snippet (Subtle, restrained, beautiful) */}
              <div
                lang="ar"
                dir="rtl"
                style={{
                  fontFamily: "'Amiri', 'Scheherazade New', 'Traditional Arabic', 'Noto Naskh Arabic', 'Segoe UI', Tahoma, serif",
                  fontSize: 'clamp(1.15rem, 2.4vw, 1.45rem)',
                  lineHeight: 1.8,
                  color: 'var(--color-text-primary)',
                  opacity: 0.78,
                  marginBottom: '0.75rem',
                  letterSpacing: '0.02em',
                }}
              >
                {activeSlide.arabic}
              </div>

              {/* Main Verse Quote */}
              <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <Quote
                  size={32}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    left: '-4px',
                    opacity: 0.12,
                    color: activeSlide.accentColor,
                    pointerEvents: 'none',
                  }}
                />
                <blockquote
                  style={{
                    margin: 0,
                    paddingLeft: '0',
                    fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)',
                    fontWeight: 700,
                    lineHeight: 1.35,
                    color: 'var(--color-text-primary)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  "{activeSlide.verse.replace(/^["']|["']$/g, '')}"
                </blockquote>
              </div>

              {/* Explanatory Connection Box — Linking to Cyberbullying & Behavioral Science */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.8))',
                  border: '1px solid var(--color-border)',
                  borderLeft: `4px solid ${activeSlide.accentColor}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '1.15rem 1.35rem',
                  marginTop: '1.25rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.5rem',
                    marginBottom: '0.4rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: activeSlide.accentColor,
                    }}
                  >
                    Positive Online Behaviour
                  </span>
                </div>

                <p
                  style={{
                    fontSize: 'clamp(0.92rem, 1.6vw, 1rem)',
                    color: 'var(--color-text-primary)',
                    fontWeight: 500,
                    lineHeight: 1.6,
                    margin: '0 0 0.5rem',
                  }}
                >
                  {activeSlide.explanation}
                </p>

                <p
                  style={{
                    fontSize: '0.84rem',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  <strong style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Campus Action: </strong>
                  {activeSlide.takeaway}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ── Footer Controls: Prev/Next, Dots, Play/Pause & Counter ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
              marginTop: '2rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            {/* Left: Auto-play toggle & Slide Counter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                aria-label={isPlaying ? 'Pause slider auto-play' : 'Resume slider auto-play'}
                title={isPlaying ? 'Pause auto-rotation' : 'Play auto-rotation'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: isPlaying ? 'var(--color-text-muted)' : activeSlide.accentColor,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              </button>

              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  color: 'var(--color-text-subtle)',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                }}
              >
                <span style={{ color: 'var(--color-text-primary)' }}>{activeSlide.num}</span>
                {' / '}
                {String(REFLECTION_SLIDES.length).padStart(2, '0')}
              </span>
            </div>

            {/* Center: Navigation Indicator Dots */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
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
                    style={{
                      height: '8px',
                      width: isActive ? '28px' : '8px',
                      borderRadius: 'var(--radius-full)',
                      background: isActive
                        ? slide.accentColor
                        : 'var(--color-surface-3)',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                );
              })}
            </div>

            {/* Right: Prev & Next Arrow Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => paginate(-1)}
                aria-label="Previous reflection slide"
                className="digital-values-nav-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                onClick={() => paginate(1)}
                aria-label="Next reflection slide"
                className="digital-values-nav-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Academic Footer Attribution Note */}
      <div
        style={{
          textAlign: 'center',
          marginTop: '1.25rem',
          fontSize: '0.78rem',
          color: 'var(--color-text-subtle)',
          letterSpacing: '0.01em',
        }}
      >
        <span>Prisma University Behavioral Research • Integrating ethical frameworks with evidence-based anti-cyberbullying modules</span>
      </div>
    </section>
  );
}
