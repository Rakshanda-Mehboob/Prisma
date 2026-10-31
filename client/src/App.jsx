/**
 * App.jsx — Root Application Component with React Router and Auth Provider.
 * Connects all TPB modules, landing page, and student profile.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import Interventions from './pages/Interventions';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import NotFound from './pages/NotFound';

// Pages that hide global chrome entirely (auth/onboarding flow)
const AUTH_PAGES = ['/login', '/register', '/onboarding', '/forgot-password', '/reset-password'];

function AppShell() {
  const location = useLocation();
  const { user } = useAuth();

  const isAuthPage = AUTH_PAGES.some((p) => location.pathname.startsWith(p));
  // Show sidebar when: user is logged in AND not on an auth page AND not on landing
  const isLanding = location.pathname === '/';
  const showSidebar = !!user && !isAuthPage && !isLanding;

  return (
    <div className={`app-layout ${isAuthPage ? 'auth-mode' : ''} ${showSidebar ? 'with-sidebar' : ''}`}>
      {/* Top Navbar — only for landing page and auth pages */}
      {!showSidebar && !isAuthPage && <Navbar />}

      {/* Left Sidebar — authenticated app pages */}
      {showSidebar && <Sidebar />}

      {/* Content wrapper with ClickUp-style TopHeader for authenticated app pages */}
      <div className={showSidebar ? 'app-main-wrapper' : 'app-main-direct'}>
        {showSidebar && <TopHeader />}

        {/* Main content */}
        <main className={`page-content ${isAuthPage ? 'auth-main' : ''} ${showSidebar ? 'sidebar-main' : ''} ${isLanding ? 'landing-main' : ''}`}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes — Modules 1 to 4 & Operations */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessment"
              element={
                <ProtectedRoute>
                  <Assessment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interventions"
              element={
                <ProtectedRoute>
                  <Interventions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feedback"
              element={
                <ProtectedRoute>
                  <Feedback />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>

      {/* Footer — only on landing */}
      {isLanding && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
