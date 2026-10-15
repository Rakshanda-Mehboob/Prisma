import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthInfo from './pages/AuthInfo';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import Interventions from './pages/Interventions';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function AppContent() {
  const { pathname } = useLocation();
  const isAuthLayout = ['/login', '/register', '/terms', '/privacy', '/support'].includes(pathname);
  return (
    <div className="app-layout">
      {!isAuthLayout && <Navbar />}
      <main className={isAuthLayout ? 'page-content auth-page-content' : 'page-content'}
        style={isAuthLayout ? { padding: 0, margin: 0, maxWidth: 'none', width: '100%', flex: 1 } : undefined}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/terms" element={<AuthInfo kind="terms" />} />
          <Route path="/privacy" element={<AuthInfo kind="privacy" />} />
          <Route path="/support" element={<AuthInfo kind="support" />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
          <Route path="/interventions" element={<ProtectedRoute><Interventions /></ProtectedRoute>} />
          <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAuthLayout && <Footer />}
    </div>
  );
}
export default function App() {
  return <BrowserRouter><AuthProvider><AppContent /></AuthProvider></BrowserRouter>;
}
