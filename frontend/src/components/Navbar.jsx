import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin, isCustomer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
    setMenuOpen(false);
  };

  const handleBrandClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand" onClick={handleBrandClick}>
          <div className="brand-logo-container">
            <span className="brand-icon">💼</span>
          </div>
          <span className="brand-text">Hireloop</span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="navbar-links">
          <li>
            <NavLink to="/jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Find Jobs
            </NavLink>
          </li>
          <li>
            <NavLink to="/companies" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Companies
            </NavLink>
          </li>
          <li>
            <NavLink to="/post-job" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Post a Job
            </NavLink>
          </li>
          {user && (
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                My Dashboard
              </NavLink>
            </li>
          )}
        </ul>

        {/* Auth Actions */}
        <div className="navbar-actions">
          {!user ? (
            <div className="auth-buttons">
              <Link to="/signin" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          ) : (
            <div className="user-menu" ref={dropdownRef}>
              <button 
                className="user-avatar-btn" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
              >
                <div className="user-avatar">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="dropdown-icon">▼</span>
              </button>
              
              {/* Profile Dropdown */}
              {dropdownOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <span className="user-name">{user.name || 'User'}</span>
                    <span className="user-role">{isAdmin ? 'Employer' : 'Candidate'}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    Dashboard
                  </Link>
                  <Link to={isAdmin ? '/admin/jobs' : '/customer/profile'} className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    Profile Settings
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item text-danger">
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

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
          <NavLink to="/jobs" onClick={() => setMenuOpen(false)}>Find Jobs</NavLink>
          <NavLink to="/companies" onClick={() => setMenuOpen(false)}>Companies</NavLink>
          <NavLink to="/post-job" onClick={() => setMenuOpen(false)}>Post a Job</NavLink>
          {user && (
            <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>My Dashboard</NavLink>
          )}
          {user ? (
            <>
              <Link to={isAdmin ? '/admin/jobs' : '/customer/profile'} onClick={() => setMenuOpen(false)}>Profile Settings</Link>
              <button onClick={handleLogout} className="btn btn-danger btn-sm" style={{marginTop: '20px'}}>Logout</button>
            </>
          ) : (
            <div className="mobile-auth-buttons">
              <Link to="/signin" className="btn btn-ghost btn-sm" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
