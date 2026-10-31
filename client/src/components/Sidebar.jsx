/**
 * Sidebar.jsx — Persistent left navigation panel for authenticated pages.
 * Houses remaining workspace navigation items (Dashboard, Assessment, Learning, Feedback).
 * Profile is in the top navigation bar (ClickUp style).
 */

import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, BookOpen,
  MessageSquare, Shield, ChevronRight
} from 'lucide-react';
import PrismaLogo from './PrismaLogo';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/assessment', icon: ClipboardList, label: 'Assessment' },
  { to: '/interventions', icon: BookOpen, label: 'Learning' },
  { to: '/feedback', icon: MessageSquare, label: 'Feedback' },
];

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Persistent floating edge button on border line — always accessible to open/close */}
      <button
        type="button"
        className="sidebar-edge-toggle"
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronRight
          size={14}
          style={{
            transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </button>

      <div className="sidebar-inner">
        {/* Brand */}
        <div
          className={`sidebar-brand ${collapsed ? 'brand-clickable' : ''}`}
          onClick={() => collapsed && setCollapsed(false)}
          title={collapsed ? 'Click to expand sidebar' : undefined}
        >
          <div className="sidebar-logo">
            <PrismaLogo size={28} />
          </div>
          {!collapsed && (
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">Prisma</span>
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              className="sidebar-collapse-btn"
              onClick={(e) => {
                e.stopPropagation();
                setCollapsed(true);
              }}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronRight
                size={15}
                style={{ transform: 'rotate(180deg)', transition: '200ms' }}
              />
            </button>
          )}
        </div>

        {/* Remaining Nav Items in Sidebar */}
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

        {/* Mission Banner (shown only when expanded) */}
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
      </div>
    </aside>
  );
}
