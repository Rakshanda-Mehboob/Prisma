import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function NotFound() {
  return (
    <div style={{ maxWidth: '640px', margin: '3rem auto', textAlign: 'center' }}>
      <Card glow="primary" style={{ padding: '3.5rem 2rem' }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--color-danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          <ShieldAlert size={36} />
        </div>

        <Badge variant="danger" style={{ marginBottom: '1rem' }}>
          Page Not Found (404)
        </Badge>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
          We couldn't find that page
        </h1>

        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
          The page you're looking for might have been moved, renamed, or is temporarily unavailable.
        </p>

        {/* Terminal Diagnostic Box */}
        <div
          style={{
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--color-text-secondary)',
            textAlign: 'left',
            marginBottom: '2rem',
          }}
        >
          <div style={{ color: 'var(--color-danger)' }}>
            [!] ROUTE_FAULT: 404_NULL_POINTER
          </div>
          <div>[i] Path: {window.location.pathname}</div>
          <div>[i] Status: REJECTED • TLS: SECURE</div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/dashboard">
            <Button variant="primary" icon={<Home size={16} />}>
              Return to Dashboard
            </Button>
          </Link>
          <Link to="/">
            <Button variant="secondary" icon={<ArrowLeft size={16} />}>
              Platform Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
