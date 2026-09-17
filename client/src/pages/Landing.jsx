import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Cpu, Brain, Zap, ChevronRight,
  Lock, ArrowRight, BarChart3, Activity, Users, HelpCircle,
  Sparkles, BookOpen, Layers
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import CyberBackground from '../components/cyber/CyberBackground';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: 'What is the Theory of Planned Behavior (TPB) in cyberbullying prevention?',
      a: 'TPB posits that human behavior is governed by three key psychological constructs: Attitude (evaluations of cyberbullying harm), Subjective Norms (perceptions of social and peer approval), and Perceived Behavioral Control (confidence in intervening, reporting, or standing against toxic behavior). By evaluating and targeting these constructs, our AI system modifies intent before cyberbullying occurs.'
    },
    {
      q: 'How does the AI personalize learning interventions?',
      a: 'Following the baseline pre-assessment, our diagnostic engine identifies which TPB constructs fall below safe threshold scores (e.g. scores under 60/100). The system automatically curates interactive scenarios, quizzes, and multimedia modules specifically calibrated to strengthen those vulnerable areas.'
    },
    {
      q: 'How is student privacy and anonymity preserved?',
      a: 'All assessment telemetry and responses are strictly anonymized and encrypted. Assessment scores are calculated on-the-fly and tied to secure CMS tokens. Academic supervisors receive aggregated cohort telemetry without exposing private student self-evaluations.'
    },
    {
      q: 'Can this platform be scaled to other academic institutions?',
      a: 'Yes. The system is built on a high-throughput FastAPI asynchronous architecture with modular scenario generation powered by OpenAI GPT-4o, making it effortlessly deployable across colleges, universities, and secondary institutions.'
    },
  ];

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <CyberBackground />

      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '4rem 1rem 5rem',
          maxWidth: '1240px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Badge variant="cyan" icon={<Sparkles size={13} />}>
            Next-Gen AI Behavioral Defense Architecture
          </Badge>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', fontFamily: 'var(--font-mono)' }}>
            v1.0 • Riphah Final Year Project
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.04em',
            maxWidth: '960px',
            margin: '0 auto 1.5rem',
            background: 'linear-gradient(180deg, #FFFFFF 30%, #A78BFA 85%, #00F5FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Proactive Cyberbullying Intervention Powered by Behavioral AI
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--color-text-muted)',
            maxWidth: '740px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
          }}
        >
          An enterprise-grade cognitive security platform utilizing the <strong>Theory of Planned Behavior (TPB)</strong> and <strong>Generative AI</strong> to diagnose, predict, and mitigate hostile online behaviors across academic digital ecosystems.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
          <Link to={user ? '/dashboard' : '/register'}>
            <Button variant="cyan" size="lg" iconRight={<ArrowRight size={18} />}>
              {user ? 'Open Security Dashboard' : 'Start Free Assessment'}
            </Button>
          </Link>
          <Link to={user ? '/assessment' : '/login'}>
            <Button variant="secondary" size="lg" icon={<Shield size={18} />}>
              {user ? 'Take Assessment' : 'Sign In with CMS ID'}
            </Button>
          </Link>
        </div>

        {/* High-Tech Terminal Hero Card */}
        <div
          style={{
            maxWidth: '920px',
            margin: '0 auto',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-lg), 0 0 50px rgba(124, 58, 237, 0.15)',
            overflow: 'hidden',
            textAlign: 'left',
          }}
        >
          {/* Terminal Top Bar */}
          <div
            style={{
              background: 'var(--color-surface-2)',
              padding: '0.85rem 1.25rem',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              <span style={{ marginLeft: '0.75rem', fontSize: '0.78rem', color: 'var(--color-text-subtle)', fontFamily: 'var(--font-mono)' }}>
                tpb-sentinel://behavioral-diagnostics-engine.py
              </span>
            </div>
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
              ENGINE ONLINE
            </span>
          </div>

          {/* Terminal Body */}
          <div
            style={{
              padding: '1.75rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.88rem',
              lineHeight: 1.8,
              color: 'var(--color-text-muted)',
            }}
          >
            <p style={{ color: 'var(--color-accent)' }}>
              &gt; Initializing TPB Tri-Construct Multi-Factor Assessment Model...
            </p>
            <p>
              [+] Attitude Index: <span style={{ color: '#10b981' }}>EVALUATING</span> (Social Harm vs. Detachment)
            </p>
            <p>
              [+] Subjective Norm Vector: <span style={{ color: '#60a5fa' }}>MONITORING</span> (Peer Bystander Effect)
            </p>
            <p>
              [+] Perceived Behavioral Control: <span style={{ color: '#a78bfa' }}>CALIBRATING</span> (Intervention Efficacy)
            </p>
            <div
              style={{
                marginTop: '1rem',
                padding: '0.85rem 1rem',
                background: 'rgba(124, 58, 237, 0.1)',
                border: '1px solid rgba(124, 58, 237, 0.3)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
              }}
            >
              <strong>⚡ Active Diagnosis:</strong> Detected high bystander inertia in online forums. Generating targeted micro-intervention module: <em>"De-escalation Strategies in Group Chats"</em>.
            </div>
          </div>
        </div>
      </section>

      {/* 4-Stage Architecture Section (How It Works) */}
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '4rem 1rem',
          maxWidth: '1240px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <Badge variant="primary" icon={<Layers size={13} />}>
            The Lifecycle
          </Badge>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            How Prisma Works
          </h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            A four-stage closed-loop psychological framework designed to produce quantifiable behavioral improvement.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {/* Step 1 */}
          <Card glow="primary" hover>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(124, 58, 237, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-light)' }}>
                <Brain size={22} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-subtle)' }}>01</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>TPB Baseline Audit</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Students undergo scenario-based testing across Attitude, Subjective Norms, and Perceived Control using empirical Likert metrics.
            </p>
          </Card>

          {/* Step 2 */}
          <Card glow="cyan" hover>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(0, 245, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
                <Activity size={22} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-subtle)' }}>02</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Cognitive Risk Scoring</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              The scoring algorithm isolates weak constructs (&lt;60/100) and maps risk vectors into personalized intervention requirements.
            </p>
          </Card>

          {/* Step 3 */}
          <Card glow="primary" hover>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success-light)' }}>
                <BookOpen size={22} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-subtle)' }}>03</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Targeted Interventions</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Interactive quizzes, real-world case simulations, and multimedia resources provide tangible bystander de-escalation skills.
            </p>
          </Card>

          {/* Step 4 */}
          <Card glow="cyan" hover>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-warning-light)' }}>
                <BarChart3 size={22} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-subtle)' }}>04</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Post-Audit Delta</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Post-assessment measures behavioral growth (Post − Pre delta) and generates a verifiable, exportable cybersecurity reflection report.
            </p>
          </Card>
        </div>
      </section>

      {/* Key Product Features */}
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '4rem 1rem',
          maxWidth: '1240px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <Badge variant="cyan" icon={<Zap size={13} />}>
            Platform Capabilities
          </Badge>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            Built with Cybersecurity Standards
          </h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Engineered from the ground up for resilience, privacy, and scientific rigor.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <Card hover>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(124, 58, 237, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-light)', flexShrink: 0 }}>
                <Lock size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Zero-Trust Privacy</h4>
                <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  JWT token authentication with PBKDF2-SHA256 password hashing. Individual response records are kept confidential to encourage honest self-reporting.
                </p>
              </div>
            </div>
          </Card>

          <Card hover>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(0, 245, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', flexShrink: 0 }}>
                <Cpu size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>OpenAI GPT-4o Hybrid Scenarios</h4>
                <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  Dynamic AI scenario generator creates realistic university online bullying dilemmas (Discord, WhatsApp, anonymous confession pages) paired with human-vetted baselines.
                </p>
              </div>
            </div>
          </Card>

          <Card hover>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success-light)', flexShrink: 0 }}>
                <BarChart3 size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Interactive Recharts Analytics</h4>
                <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  Real-time radar profiles, pre vs. post delta comparative bars, and progress rings that translate psychological concepts into clear visuals.
                </p>
              </div>
            </div>
          </Card>

          <Card hover>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-warning-light)', flexShrink: 0 }}>
                <Users size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Faculty & Cohort Admin Telemetry</h4>
                <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  Comprehensive institutional analytics to spot high-risk departments, monitor intervention adherence, and download research-ready datasets.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '4rem 1rem',
          maxWidth: '860px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Badge variant="primary" icon={<HelpCircle size={13} />}>
            Frequently Asked Questions
          </Badge>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            Platform Science & Architecture
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                transition: 'var(--transition)',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                style={{
                  width: '100%',
                  padding: '1.25rem 1.5rem',
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>{faq.q}</span>
                <ChevronRight
                  size={18}
                  style={{
                    transform: activeFaq === idx ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.2s ease',
                    color: 'var(--color-primary-light)',
                    flexShrink: 0,
                    marginLeft: '1rem',
                  }}
                />
              </button>
              {activeFaq === idx && (
                <div
                  style={{
                    padding: '0 1.5rem 1.25rem',
                    color: 'var(--color-text-muted)',
                    fontSize: '0.92rem',
                    lineHeight: 1.7,
                    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                    paddingTop: '1rem',
                  }}
                >
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '5rem 1rem 6rem',
          maxWidth: '1240px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(0, 245, 255, 0.12)), var(--color-surface)',
            border: '1px solid rgba(124, 58, 237, 0.4)',
            borderRadius: 'var(--radius-xl)',
            padding: '4rem 2rem',
            boxShadow: 'var(--shadow-lg), 0 0 50px rgba(124, 58, 237, 0.15)',
          }}
        >
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '1rem' }}>
            Elevate Your Campus Cognitive Defense
          </h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '620px', margin: '0 auto 2rem', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Ready to experience an evidence-based cyberbullying intervention platform built for modern academic communities?
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to={user ? '/dashboard' : '/register'}>
              <Button variant="cyan" size="lg" iconRight={<ArrowRight size={18} />}>
                {user ? 'Go to Dashboard' : 'Create Free Account'}
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Faculty & Student Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
