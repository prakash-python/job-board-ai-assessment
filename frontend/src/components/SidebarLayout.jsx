import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SidebarLayout.css';

const SidebarLayout = ({ type }) => {
  const { user, logout, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const adminLinks = [
    { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/admin/jobs', icon: '💼', label: 'Manage Jobs' },
    { to: '/admin/applications', icon: '📄', label: 'Applications' },
    { to: '/admin/users', icon: '👥', label: 'Manage Users' },
    { to: '/jobs', icon: '🔍', label: 'Browse Jobs' },
    { to: '/companies', icon: '🏢', label: 'Companies' },
  ];

  const customerLinks = [
    { to: '/customer/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/customer/profile', icon: '👤', label: 'My Profile' },
    { to: '/my-applications', icon: '📄', label: 'My Applications' },
    { to: '/jobs', icon: '🔍', label: 'Browse Jobs' },
    { to: '/companies', icon: '🏢', label: 'Companies' },
  ];

  const links = type === 'admin' ? adminLinks : customerLinks;
  const hubLabel = type === 'admin' ? 'Employer Hub' : 'Candidate Hub';
  const roleLabel = isAdmin ? 'Admin' : 'Candidate';

  return (
    <div className="sidebar-layout">
      <aside className="sidebar">
        {/* Brand Header */}
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="sidebar-brand-icon">💼</div>
            <div>
              <h2>Hireloop</h2>
              <p className="sidebar-header-sub">{hubLabel}</p>
            </div>
          </div>
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            ⋮
          </button>
        </div>

        {/* Navigation */}
        <nav className={`sidebar-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <p className="sidebar-nav-title">Main Menu</p>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{link.icon}</span>
              <span className="sidebar-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div className={`sidebar-footer ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="sidebar-user-card">
            <div className="user-avatar-small">
              {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="user-info-text">
              <span className="user-name-text">{user?.name || 'User'}</span>
              <span className="user-role-badge">{roleLabel}</span>
            </div>
          </div>
          <button className="sidebar-logout-btn" onClick={logout}>
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="sidebar-content">
        <div className="sidebar-content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;
