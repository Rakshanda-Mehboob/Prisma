import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, ClipboardList, BookOpen, MessageSquare,
  LogOut, User as UserIcon, Menu, X, ArrowRight
} from 'lucide-react';
import PrismaLogo from './PrismaLogo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Monitor scroll position to apply elevated styling and shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setMobileMenuOpen(false);
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSectionScroll = (sectionId) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    }
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      {/* Brand */}
      <Link to="/" className="navbar-brand">
        <div className="brand-icon">
          <PrismaLogo size={32} />
        </div>
        <span>Prisma</span>
      </Link>

      {/* Desktop Navigation Links */}
      {user ? (
        <nav className="navbar-nav" aria-label="Main User Navigation">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={15} />
            Dashboard
          </NavLink>
          <NavLink to="/assessment" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <ClipboardList size={15} />
            Assessment
          </NavLink>
          <NavLink to="/interventions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <BookOpen size={15} />
            Learning
          </NavLink>
          <NavLink to="/feedback" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <MessageSquare size={15} />
            Feedback
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <UserIcon size={15} />
            Profile
          </NavLink>
        </nav>
      ) : (
        <nav className="navbar-nav landing-nav" aria-label="Landing Page Navigation">
          <button
            type="button"
            className="nav-link landing-nav-btn"
            onClick={() => handleSectionScroll('platform')}
          >
            Platform
          </button>
          <button
            type="button"
            className="nav-link landing-nav-btn"
            onClick={() => handleSectionScroll('how-it-works')}
          >
            How it works
          </button>

          <button
            type="button"
            className="nav-link landing-nav-btn"
            onClick={() => handleSectionScroll('about')}
          >
            About
          </button>
        </nav>
      )}

      {/* Right Controls */}
      <div className="navbar-right">
        {user ? (
          <>
            <Link to="/profile" className="user-chip" title="View Profile">
              <div className="user-avatar" style={{ overflow: 'hidden', padding: 0 }}>
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name || 'User'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  initials
                )}
              </div>
              <span>{user.full_name?.split(' ')[0]}</span>
            </Link>
            <button
              className="btn btn-sm btn-danger"
              onClick={handleLogout}
              title="Logout session"
              style={{ padding: '0.45rem 0.65rem' }}
            >
              <LogOut size={15} />
            </button>
          </>
        ) : (
          <div className="navbar-auth-actions">
            <Link to="/login" className="btn btn-secondary btn-sm navbar-signin-btn">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm navbar-getstarted-btn">
              <span>Get Started</span>
              <ArrowRight size={14} className="hero-btn-arrow" />
            </Link>
          </div>
        )}

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="navbar-mobile-toggle"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-drawer">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link to="/assessment" className="nav-link mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                <ClipboardList size={16} /> Assessment
              </Link>
              <Link to="/interventions" className="nav-link mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                <BookOpen size={16} /> Learning Modules
              </Link>
              <Link to="/feedback" className="nav-link mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                <MessageSquare size={16} /> Module Feedback
              </Link>
              <Link to="/profile" className="nav-link mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                <UserIcon size={16} /> User Profile
              </Link>
              <div className="mobile-divider" />
              <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                <LogOut size={15} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="nav-link mobile-nav-link"
                onClick={() => handleSectionScroll('platform')}
              >
                Platform Overview
              </button>
              <button
                type="button"
                className="nav-link mobile-nav-link"
                onClick={() => handleSectionScroll('how-it-works')}
              >
                How it works
              </button>
              <button
                type="button"
                className="nav-link mobile-nav-link"
                onClick={() => handleSectionScroll('features')}
              >
                Features
              </button>
              <button
                type="button"
                className="nav-link mobile-nav-link"
                onClick={() => handleSectionScroll('about')}
              >
                About & Values
              </button>
              <div className="mobile-divider" />
              <Link to="/login" className="btn btn-secondary mobile-auth-btn" onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary mobile-auth-btn" onClick={() => setMobileMenuOpen(false)}>
                Get Started — it's free
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
