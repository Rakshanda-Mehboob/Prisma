import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, ClipboardList, BookOpen, MessageSquare,
  LogOut, User as UserIcon, Menu, X
} from 'lucide-react';
import PrismaLogo from './PrismaLogo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="navbar">
      {/* Brand */}
      <Link to="/" className="navbar-brand">
        <div className="brand-icon">
          <PrismaLogo size={32} />
        </div>
        <span>Prisma</span>
        <span className="brand-badge">Cyber AI</span>
      </Link>

      {/* Desktop Nav Links */}
      {user ? (
        <nav className="navbar-nav">
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
        <nav className="navbar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Platform
          </NavLink>
          <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Sign In
          </NavLink>
        </nav>
      )}

      {/* Right Controls */}
      <div className="navbar-right">
        {user ? (
          <>
            <Link to="/profile" className="user-chip" title="View Profile">
              <div className="user-avatar">{initials}</div>
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
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/login" className="btn btn-secondary btn-sm">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>
        )}

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            padding: 4,
          }}
          className="navbar-mobile-toggle"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 70,
            left: 0,
            right: 0,
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            zIndex: 99,
          }}
        >
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link to="/assessment" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                <ClipboardList size={16} /> Assessment
              </Link>
              <Link to="/interventions" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                <BookOpen size={16} /> Learning Modules
              </Link>
              <Link to="/feedback" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                <MessageSquare size={16} /> Module Feedback
              </Link>
              <Link to="/profile" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                <UserIcon size={16} /> User Profile
              </Link>
              <div style={{ height: 1, background: 'var(--color-border)', margin: '0.5rem 0' }} />
              <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                <LogOut size={15} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Platform Overview
              </Link>
              <Link to="/login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>
                Create Account
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
