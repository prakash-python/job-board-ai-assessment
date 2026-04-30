/**
 * Login Page — Authenticates user and redirects by role.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/customer/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split-layout fade-in-up">
        <div className="auth-side-banner">
          <img src="/auth_illustration.png" alt="Find your dream job" />
          <div className="banner-overlay">
            <h2>Find Your Dream Job</h2>
            <p>Access thousands of job opportunities across the globe.</p>
          </div>
        </div>
        <div className="auth-side-form">
          <div className="auth-card">
            <div className="auth-header">
          <div className="auth-logo">💼</div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle text-secondary">Sign in to your Job Board account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email" name="email" type="email" className="form-input"
              placeholder="you@example.com" value={form.email} onChange={handleChange} required autoComplete="email"
            />
          </div>

          <div className="form-group password-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password" name="password" type={showPassword ? "text" : "password"} className="form-input"
                placeholder="••••••••" value={form.password} onChange={handleChange} required autoComplete="current-password"
              />
              <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

          <p className="auth-footer text-secondary text-sm text-center">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Login;
