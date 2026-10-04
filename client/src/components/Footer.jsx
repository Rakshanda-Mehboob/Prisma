import React from 'react';
import { Link } from 'react-router-dom';
import PrismaLogo from './PrismaLogo';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        padding: '1.25rem 1.5rem',
        marginTop: 'auto',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.85rem',
          color: 'var(--color-text-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PrismaLogo size={20} />
          </div>
          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Prisma</span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} Riphah International University
          </span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.82rem' }}>
          <Link to="/dashboard" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            Dashboard
          </Link>
          <Link to="/assessment" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            Assessment
          </Link>
          <Link to="/interventions" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            Modules
          </Link>
          <Link to="/feedback" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            Feedback
          </Link>
        </nav>
      </div>
    </footer>
  );
}
