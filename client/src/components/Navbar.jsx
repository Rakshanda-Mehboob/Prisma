/**
 * components/Navbar.jsx — Top navigation bar.
 * Shows different links depending on auth state.
 */

import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, ClipboardList, BookOpen, MessageSquare } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="brand-icon">🧠</div>
        <span>TPB Insight</span>
      </Link>

      {user && (
        <>
          <div className="navbar-nav">
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={14} style={{ display: 'inline', marginRight: 4 }} />
              Dashboard
            </NavLink>
            <NavLink to="/assessment" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <ClipboardList size={14} style={{ display: 'inline', marginRight: 4 }} />
              Assessment
            </NavLink>
            <NavLink to="/interventions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <BookOpen size={14} style={{ display: 'inline', marginRight: 4 }} />
              Learning
            </NavLink>
            <NavLink to="/feedback" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <MessageSquare size={14} style={{ display: 'inline', marginRight: 4 }} />
              Feedback
            </NavLink>
          </div>

          <div className="navbar-right">
            <div className="user-chip">
              <div className="user-avatar">{initials}</div>
              <span>{user.full_name.split(' ')[0]}</span>
            </div>
            <button className="btn btn-sm btn-danger" onClick={handleLogout} title="Logout">
              <LogOut size={14} />
            </button>
          </div>
        </>
      )}
    </nav>
  );
}
