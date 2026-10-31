/**
 * api/index.js — Axios instance with JWT auth interceptor.
 * All API modules import from this file.
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tpb_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tpb_token');
      localStorage.removeItem('tpb_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth API ──────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  checkAvailability: (field, value) => api.get('/auth/check-availability', { params: { field, value } }),
  // Student behavioral profile (onboarding)
  submitStudentProfile: (data) => api.post('/auth/student-profile', data),
  getStudentProfile: () => api.get('/auth/student-profile'),
  // Password Recovery
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyResetToken: (token) => api.get('/auth/verify-reset-token', { params: { token } }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// ── Assessment API ────────────────────────────────────────────────────────────

export const assessmentApi = {
  getStatus: () => api.get('/assessment/status'),
  getPreScenarios: () => api.get('/assessment/pre'),
  submitPre: (answers) => api.post('/assessment/pre', { answers }),
  getPostScenarios: () => api.get('/assessment/post'),
  submitPost: (answers) => api.post('/assessment/post', { answers }),
  reset: (stage = 'all') => api.post(`/assessment/reset?stage=${stage}`),
};

// ── Interventions API ─────────────────────────────────────────────────────────

export const interventionsApi = {
  getMyInterventions: () => api.get('/interventions/my'),
  startIntervention: (id) => api.post(`/interventions/${id}/start`),
  completeIntervention: (id) => api.post(`/interventions/${id}/complete`),
};

// ── Dashboard API ─────────────────────────────────────────────────────────────

export const dashboardApi = {
  getDashboard: () => api.get('/dashboard'),
  submitFeedback: (data) => api.post('/feedback', data),
  getMyFeedback: () => api.get('/feedback/my'),
};
