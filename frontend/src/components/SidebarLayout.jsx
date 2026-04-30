import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SidebarLayout.css';

const SidebarLayout = ({ type }) => {
  const { logout } = useAuth();

  const adminLinks = [
    { to: '/admin/dashboard', label: '📊 Dashboard' },
    { to: '/admin/jobs', label: '💼 Manage Jobs' },
    { to: '/admin/applications', label: '📨 Applications' },
    { to: '/admin/users', label: '👥 Manage Users' },
  ];

  const customerLinks = [
    { to: '/customer/dashboard', label: '📊 Dashboard' },
    { to: '/customer/profile', label: '👤 My Profile' },
    { to: '/my-applications', label: '📨 My Applications' },
    { to: '/jobs', label: '🔍 Browse Jobs' },
  ];

  const links = type === 'admin' ? adminLinks : customerLinks;

  return (
    <div className="sidebar-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>{type === 'admin' ? 'Admin Panel' : 'Customer Panel'}</h2>
        </div>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="btn btn-ghost btn-full" onClick={logout}>
            🚪 Logout
          </button>
        </div>
      </aside>
      <main className="sidebar-content">
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarLayout;
