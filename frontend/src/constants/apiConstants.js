/**
 * API base URL — sourced from environment variable.
 * Set VITE_API_BASE_URL in .env file.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// ─── Auth Endpoints ──────────────────────────────────────────────────────────
export const AUTH_ENDPOINTS = {
  REGISTER: '/accounts/register/',
  LOGIN: '/accounts/login/',
  ME: '/accounts/me/',
  TOKEN_REFRESH: '/token/refresh/',
};

// ─── User Management Endpoints ───────────────────────────────────────────────
export const USER_ENDPOINTS = {
  LIST: '/accounts/users/',
  DETAIL: (id) => `/accounts/users/${id}/`,
};

// ─── Job Endpoints ───────────────────────────────────────────────────────────
export const JOB_ENDPOINTS = {
  LIST: '/jobs/',
  DETAIL: (id) => `/jobs/${id}/`,
};

// ─── Application Endpoints ───────────────────────────────────────────────────
export const APPLICATION_ENDPOINTS = {
  LIST: '/applications/',
  DETAIL: (id) => `/applications/${id}/`,
};
