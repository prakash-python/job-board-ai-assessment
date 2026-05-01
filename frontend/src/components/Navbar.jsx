import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/signin');
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
            <NavLink to="/post-job" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              For Employers
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Dashboard
            </NavLink>
          </li>
        </ul>

        {/* Auth Actions */}
        <div className="navbar-actions">
          {!user ? (
            <div className="auth-buttons">
              <NavLink to="/signin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Sign in
              </NavLink>
              <Link to="/post-job" className="btn btn-primary btn-sm">Post a Job</Link>
            </div>
          ) : (
            <div className="user-menu">
              <div className="user-avatar">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                Logout
              </button>
              <Link to="/post-job" className="btn btn-primary btn-sm hide-mobile">Post a Job</Link>
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
          <NavLink to="/post-job" onClick={() => setMenuOpen(false)}>For Employers</NavLink>
          <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
          {user ? (
            <>
              <button onClick={handleLogout} className="btn btn-danger btn-sm">Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/signin" onClick={() => setMenuOpen(false)}>Sign in</NavLink>
              <Link to="/post-job" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Post a Job</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
