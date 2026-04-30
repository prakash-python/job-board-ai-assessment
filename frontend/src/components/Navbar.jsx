/**
 * Navbar component — responsive top navigation bar.
 * Shows different links based on auth state and user role.
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const isActive = (path, hash = '') => {
    if (hash) return location.pathname === path && location.hash === hash;
    return location.pathname === path && !location.hash;
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">💼</span>
          <span className="brand-text">JobBoard</span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="navbar-links">
          <li>
            <Link to="/#jobs" className={`nav-link ${isActive('/', '#jobs') ? 'active' : ''}`}>
              Browse Jobs
            </Link>
          </li>
          <li>
            <Link to="/#about" className={`nav-link ${isActive('/', '#about') ? 'active' : ''}`}>
              About
            </Link>
          </li>
          <li>
            <Link to="/#contact" className={`nav-link ${isActive('/', '#contact') ? 'active' : ''}`}>
              Contact
            </Link>
          </li>
          {user && isAdmin && (
            <>
              <li>
                <Link to="/admin/jobs" className={`nav-link ${isActive('/admin/jobs') ? 'active' : ''}`}>
                  Manage Jobs
                </Link>
              </li>
              <li>
                <Link to="/admin/applications" className={`nav-link ${isActive('/admin/applications') ? 'active' : ''}`}>
                  Applications
                </Link>
              </li>
              <li>
                <Link to="/admin/users" className={`nav-link ${isActive('/admin/users') ? 'active' : ''}`}>
                  Users
                </Link>
              </li>
            </>
          )}
          {user && !isAdmin && (
            <li>
              <Link to="/my-applications" className={`nav-link ${isActive('/my-applications') ? 'active' : ''}`}>
                My Applications
              </Link>
            </li>
          )}
        </ul>

        {/* Auth Actions */}
        <div className="navbar-actions">
          {user ? (
            <div className="user-menu">
              <div className="user-avatar" title={user.name}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className={`user-role-badge ${isAdmin ? 'admin' : 'customer'}`}>
                  {user.role}
                </span>
              </div>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          <button 
            className="theme-toggle-btn btn btn-ghost btn-sm" 
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            style={{ fontSize: '1.2rem', padding: '0.4rem', marginLeft: '0.5rem' }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {/* Mobile hamburger */}
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/#jobs" onClick={() => setMenuOpen(false)}>Browse Jobs</Link>
          <Link to="/#about" onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/#contact" onClick={() => setMenuOpen(false)}>Contact</Link>
          {user && isAdmin && (
            <>
              <Link to="/admin/jobs" onClick={() => setMenuOpen(false)}>Manage Jobs</Link>
              <Link to="/admin/applications" onClick={() => setMenuOpen(false)}>Applications</Link>
              <Link to="/admin/users" onClick={() => setMenuOpen(false)}>Users</Link>
            </>
          )}
          {user && !isAdmin && (
            <Link to="/my-applications" onClick={() => setMenuOpen(false)}>My Applications</Link>
          )}
          {user ? (
            <button onClick={handleLogout} className="btn btn-danger btn-sm">Logout</button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
