import React from 'react';
import { ShieldCheck, Cpu, Terminal, ExternalLink } from 'lucide-react';
import PrismaLogo from './PrismaLogo';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border)',
        background: 'rgba(5, 8, 22, 0.95)',
        padding: '3rem 2rem 2rem',
        marginTop: 'auto',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Col 1: Platform Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: 'drop-shadow(0 0 10px var(--color-primary-glow))',
              }}
            >
              <PrismaLogo size={28} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em' }}>
              Prisma
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
            AI-Augmented Cyberbullying Prevention & Behavioral Intervention Platform based on the Theory of Planned Behavior (TPB).
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--color-success)',
                boxShadow: '0 0 8px var(--color-success)',
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', fontFamily: 'var(--font-mono)' }}>
              Core Engine: Online & Operational
            </span>
          </div>
        </div>

        {/* Col 2: Architecture & TPB Pillars */}
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            TPB Behavioral Pillars
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            <li>
              <span style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>Attitude:</span> Harm evaluation & digital empathy
            </li>
            <li>
              <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Subjective Norms:</span> Peer culture & collective intervention
            </li>
            <li>
              <span style={{ color: 'var(--color-success-light)', fontWeight: 600 }}>Perceived Control:</span> Technical reporting & de-escalation efficacy
            </li>
          </ul>
        </div>

        {/* Col 3: Research & FYP Accreditation */}
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Academic Credentials
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            Final Year Project (BS Cyber Security)<br />
            Faculty of Computing & Applied Sciences<br />
            <strong>Riphah International University</strong>
          </p>
          <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--color-text-subtle)' }}>
            Authors: Rakshanda Mehboob, Ayesha Khalil, Areeza Afridi
          </div>
        </div>

        {/* Col 4: Technology Specifications */}
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Security Stack
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            <span className="badge badge-muted">FastAPI Python 3.12</span>
            <span className="badge badge-muted">React 19 & Vite</span>
            <span className="badge badge-muted">OpenAI GPT-4o</span>
            <span className="badge badge-muted">JWT Auth + BCrypt</span>
            <span className="badge badge-muted">Recharts 3</span>
            <span className="badge badge-muted">SQLite ACID</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--color-text-subtle)',
        }}
      >
        <div>
          © {new Date().getFullYear()} TPB-Based AI Cyberbullying Intervention System. All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <span>Privacy by Design</span>
          <span>Zero-Tolerance Policy</span>
          <span>ISO/IEC 27001 Aligned</span>
        </div>
      </div>
    </footer>
  );
}
