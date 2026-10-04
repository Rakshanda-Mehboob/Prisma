import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Brain, BookOpen, BarChart3, ArrowRight, CheckCircle2
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  {
    icon: Brain,
    label: 'Take the Assessment',
    description: 'Answer a few scenario-based questions to see how you currently think and feel about cyberbullying.',
    color: 'var(--color-primary)',
    bg: 'rgba(26, 86, 50, 0.08)',
    num: '01',
  },
  {
    icon: BarChart3,
    label: 'Get Your Results',
    description: 'We\'ll show you which areas you\'re strong in and which ones you could improve with a bit of learning.',
    color: 'var(--color-secondary)',
    bg: 'rgba(13, 148, 136, 0.08)',
    num: '02',
  },
  {
    icon: BookOpen,
    label: 'Complete Your Lessons',
    description: 'Work through short, personalised lessons — readings, examples, and activities — at your own pace.',
    color: 'var(--color-success)',
    bg: 'rgba(22, 163, 74, 0.08)',
    num: '03',
  },
  {
    icon: Shield,
    label: 'See How Far You\'ve Come',
    description: 'Take the Post Assessment and see a clear report showing how much your awareness and confidence has grown.',
    color: 'var(--color-accent)',
    bg: 'rgba(212, 160, 23, 0.08)',
    num: '04',
  },
];

const HIGHLIGHTS = [
  'Based on proven research in human behaviour',
  'Personalised lessons for every student',
  'Track your progress from start to finish',
  'Free and private — no personal data shared',
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div>

      {/* ── Hero ── */}
      <section
        style={{
          padding: 'clamp(3rem, 6vw, 5.5rem) 0 clamp(2.5rem, 4vw, 4rem)',
          textAlign: 'center',
        }}
      >
        {/* Platform badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--color-primary-subtle)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-full)',
            padding: '0.35rem 0.9rem',
            marginBottom: '1.75rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--color-primary)',
            letterSpacing: '0.02em',
          }}
        >
          <Shield size={13} />
          Cyberbullying Awareness Program
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.035em',
            color: 'var(--color-text-primary)',
            maxWidth: '820px',
            margin: '0 auto 1.25rem',
          }}
        >
          Build healthier online communities
          <span style={{ color: 'var(--color-primary)', display: 'block' }}>
            through behavioural science.
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
            color: 'var(--color-text-muted)',
            maxWidth: '580px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}
        >
          Prisma helps university students understand and improve their response to
          cyberbullying through personalised assessments and AI-guided learning modules.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <Link to={user ? '/dashboard' : '/register'}>
            <Button variant="primary" size="lg" iconRight={<ArrowRight size={17} />}>
              {user ? 'Go to Dashboard' : 'Get Started — it\'s free'}
            </Button>
          </Link>
          <Link to={user ? '/assessment' : '/login'}>
            <Button variant="secondary" size="lg">
              {user ? 'Take Assessment' : 'Sign In'}
            </Button>
          </Link>
        </div>

        {/* Quick trust bullets */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem 2rem',
            marginTop: '2.25rem',
          }}
        >
          {HIGHLIGHTS.map((text, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.82rem',
                color: 'var(--color-text-secondary)',
              }}
            >
              <CheckCircle2 size={14} color="var(--color-primary)" />
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0 0 4rem' }} />

      {/* ── How It Works ── */}
      <section style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: '0.6rem',
            }}
          >
            How Prisma works
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto' }}>
            Four simple steps to help you grow from awareness to action.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {STEPS.map(({ icon: Icon, label, description, color, bg, num }) => (
            <div
              key={num}
              className="card-hover"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.5rem',
                transition: 'var(--transition)',
                position: 'relative',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 'var(--radius-md)',
                  background: bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color,
                  marginBottom: '1rem',
                }}
              >
                <Icon size={20} />
              </div>

              <div
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--color-text-subtle)',
                  opacity: 0.6,
                }}
              >
                {num}
              </div>

              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  marginBottom: '0.5rem',
                }}
              >
                {label}
              </h3>
              <p
                style={{
                  fontSize: '0.86rem',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.08), rgba(217, 119, 6, 0.06))',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(2rem, 4vw, 3.5rem) 2rem',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: '0.75rem',
            }}
          >
            Ready to get started?
          </h2>
          <p
            style={{
              color: 'var(--color-text-muted)',
              maxWidth: '480px',
              margin: '0 auto 2rem',
              fontSize: '0.95rem',
              lineHeight: 1.65,
            }}
          >
            Create a free account and take the baseline assessment in under 15 minutes.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <Link to={user ? '/dashboard' : '/register'}>
              <Button variant="primary" size="lg" iconRight={<ArrowRight size={17} />}>
                {user ? 'Open Dashboard' : 'Create Account'}
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
