/**
 * Sidebar.jsx — Persistent left navigation panel for authenticated pages.
 * Replaces the top Navbar for logged-in users on desktop (768px+).
 */

import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, ClipboardList, BookOpen,
  MessageSquare, User as UserIcon, LogOut,
  Shield, ChevronRight, Sparkles
} from 'lucide-react';
import PrismaLogo from './PrismaLogo';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/assessment', icon: ClipboardList, label: 'Assessment' },
  { to: '/interventions', icon: BookOpen, label: 'Learning' },
  { to: '/feedback', icon: MessageSquare, label: 'Feedback' },
  { to: '/profile', icon: UserIcon, label: 'Profile' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <PrismaLogo size={28} />
        </div>
        {!collapsed && (
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">Prisma</span>
          </div>
        )}
        <button
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronRight size={15} style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: '200ms' }} />
        </button>
      </div>
      {/* Nav Items */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="sidebar-nav-icon" />
            {!collapsed && <span className="sidebar-nav-label">{label}</span>}
            {!collapsed && location.pathname === to && (
              <span className="sidebar-nav-dot" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Mission Banner */}
      {!collapsed && (
        <div className="sidebar-mission">
          <div className="sidebar-mission-icon">
            <Shield size={14} />
          </div>
          <div className="sidebar-mission-text">
            <div className="sidebar-mission-title">Cyberbullying Awareness</div>
            <div className="sidebar-mission-sub">TPB-based learning</div>
          </div>
        </div>
      )}

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              initials
            )}
          </div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.full_name?.split(' ')[0] || 'Student'}</div>
              <div className="sidebar-user-cms">{user?.cms_number || 'ENROLLED'}</div>
            </div>
          )}
        </div>
        <button
          className="sidebar-logout-btn"
          onClick={handleLogout}
          title="Sign out"
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
}

