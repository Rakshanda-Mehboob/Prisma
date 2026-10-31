/**
 * TopHeader.jsx — ClickUp-style top navigation bar for authenticated pages.
 * Displays page title/breadcrumbs on the left, and User Profile with Sign Out on the right.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ClipboardList,
  BookOpen,
  MessageSquare,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Shield,
  GraduationCap
} from 'lucide-react';

const PAGE_META = {
  '/dashboard': {
    title: 'Dashboard',
    icon: LayoutDashboard,
  },
  '/assessment': {
    title: 'Assessment',
    icon: ClipboardList,
  },
  '/interventions': {
    title: 'Learning Modules',
    icon: BookOpen,
  },
  '/feedback': {
    title: 'Feedback',
    icon: MessageSquare,
  },
  '/profile': {
    title: 'Student Profile',
    icon: UserIcon,
  },
};

export default function TopHeader() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  // Get current page meta
  const currentPath = '/' + (location.pathname.split('/')[1] || 'dashboard');
  const meta = PAGE_META[currentPath] || {
    title: 'Prisma Campus',
    icon: Shield,
  };
  const PageIcon = meta.icon;

  return (
    <header className="app-top-header">
      {/* Left: Current Page Title */}
      <div className="top-header-left">
        <div className="top-header-page-badge">
          <PageIcon size={16} className="top-header-page-icon" />
          <span className="top-header-page-title">{meta.title}</span>
        </div>
      </div>

      {/* Right: Campus Indicator & Profile Trigger */}
      <div className="top-header-right">
        {/* Campus affiliation pill */}
        <div className="top-header-campus-pill">
          <GraduationCap size={14} className="top-header-campus-icon" />
          <span>Riphah Campus</span>
        </div>

        {/* User Profile Trigger & Dropdown */}
        <div className="top-header-profile-wrapper" ref={dropdownRef}>
          <button
            type="button"
            className={`top-header-profile-btn ${dropdownOpen ? 'active' : ''}`}
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
            aria-label="User profile menu"
          >
            <div className="top-header-avatar">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name || 'User'}
                  className="top-header-avatar-img"
                />
              ) : (
                <span>{initials}</span>
              )}
              <span className="top-header-status-dot" />
            </div>

            <div className="top-header-user-info">
              <span className="top-header-user-name">
                {user?.full_name?.split(' ')[0] || 'Student'}
              </span>
            </div>

            <ChevronDown
              size={14}
              className={`top-header-chevron ${dropdownOpen ? 'rotated' : ''}`}
            />
          </button>

          {/* Profile Dropdown Menu — Only User Info & Sign Out */}
          {dropdownOpen && (
            <div className="clickup-profile-dropdown" role="menu">
              {/* User Header Details */}
              <Link
                to="/profile"
                className="clickup-dropdown-header clickup-dropdown-header-link"
                onClick={() => setDropdownOpen(false)}
                title="View Profile"
              >
                <div className="clickup-dropdown-avatar">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name || 'User'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%',
                      }}
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className="clickup-dropdown-user-details">
                  <div className="clickup-dropdown-name">
                    {user?.full_name || 'Student'}
                  </div>
                  <div className="clickup-dropdown-email">
                    {user?.email || 'student@riphah.edu.pk'}
                  </div>
                  <span className="clickup-dropdown-cms-badge">
                    CMS: {user?.cms_number || 'ENROLLED'}
                  </span>
                </div>
              </Link>

              <div className="clickup-dropdown-divider" />

              {/* Sign Out Action */}
              <div className="clickup-dropdown-footer">
                <button
                  type="button"
                  className="clickup-logout-btn"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
