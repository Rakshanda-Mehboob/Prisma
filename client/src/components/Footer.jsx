import React from 'react';
import PrismaLogo from './PrismaLogo';

export default function Footer() {
  return (
    <footer className="site-footer-compact">
      <div className="footer-compact-container">
        {/* Left: Brand & Copyright */}
        <div className="footer-compact-left">
          <div className="footer-compact-logo">
            <PrismaLogo size={20} />
          </div>
          <span className="footer-compact-brand">Prisma</span>
          <span className="footer-compact-dot" aria-hidden="true">·</span>
          <span className="footer-compact-copy">
            © {new Date().getFullYear()} Riphah International University
          </span>
        </div>

        {/* Right: Single-line Contact Support */}
        <div className="footer-compact-right">
          <span className="footer-compact-label">Contact Support:</span>
          <a
            href="mailto:rakshandamehboob123@gmail.com"
            className="footer-compact-email"
          >
            rakshandamehboob123@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
