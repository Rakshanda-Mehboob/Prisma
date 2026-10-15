import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, LifeBuoy } from 'lucide-react';
import PrismaLogo from '../components/PrismaLogo';
import './AuthInfo.css';

const details = {
  terms: {
    title: 'Terms of Service',
    message: 'The official Terms of Service for PRISMA have not been published yet. Please ask the project administrator for the approved terms before relying on this page.'
  },
  privacy: {
    title: 'Privacy Policy',
    message: 'The official Privacy Policy for PRISMA has not been published yet. Please ask the project administrator how your assessment responses and account details are handled before submitting sensitive information.'
  },
  support: {
    title: 'Support',
    message: 'For help with your account, including password recovery, please contact the PRISMA project administrator or university project team. An online support form and automated password reset are not configured yet.'
  }
};
export default function AuthInfo({ kind }) {
  const location = useLocation();
  const item = details[kind] || details.support;
  return (
    <main className="pr-info-page">
      <div className="pr-info-card">
        <header className="pr-info-header">
          <Link to="/" className="pr-info-brand"><PrismaLogo size={43} /><strong>PRISMA</strong></Link>
          <Link to="/" className="pr-info-exit"><ArrowLeft size={16} /> Back to Website</Link>
        </header>
        <section className="pr-info-content">
          <LifeBuoy size={30} color="#6c63ff" />
          <h1>{location.state?.topic === 'password-reset' ? 'Password Recovery' : item.title}</h1>
          <p>{item.message}</p>
          <Link to="/login" className="pr-info-return">Return to Sign In</Link>
        </section>
        <nav className="pr-info-footer" aria-label="Information links">
          <Link to="/terms">Terms of Service</Link><Link to="/privacy">Privacy Policy</Link><Link to="/support">Support</Link>
        </nav>
      </div>
    </main>
  );
}
