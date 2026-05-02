import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { USER_ENDPOINTS, JOB_ENDPOINTS, APPLICATION_ENDPOINTS } from '../../constants/apiConstants';
import '../admin/Admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, jobs: 0, applications: 0 });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, jobsRes, appsRes] = await Promise.all([
          axiosInstance.get(USER_ENDPOINTS.LIST),
          axiosInstance.get(JOB_ENDPOINTS.LIST),
          axiosInstance.get(APPLICATION_ENDPOINTS.LIST),
        ]);
        const users = Array.isArray(usersRes.data) ? usersRes.data : [];
        const jobs = Array.isArray(jobsRes.data) ? jobsRes.data : [];
        const apps = Array.isArray(appsRes.data) ? appsRes.data : [];
        setStats({ users: users.length, jobs: jobs.length, applications: apps.length });
        setRecentJobs(jobs.slice(0, 5));
        setRecentApps(apps.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  const statCards = [
    { icon: '👥', label: 'Total Users', value: stats.users, color: 'blue' },
    { icon: '💼', label: 'Total Jobs', value: stats.jobs, color: 'purple' },
    { icon: '📄', label: 'Applications', value: stats.applications, color: 'green' },
    { icon: '✅', label: 'Active Jobs', value: recentJobs.filter(j => j.is_active).length, color: 'orange' },
  ];

  const statusBadgeClass = {
    APPLIED: 'badge-applied', REVIEWED: 'badge-reviewed',
    SHORTLISTED: 'badge-shortlisted', ACCEPTED: 'badge-accepted', REJECTED: 'badge-rejected',
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Overview of platform performance and activity.</p>
        </div>
        <Link to="/admin/jobs" className="btn btn-primary">+ Post New Job</Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map(card => (
          <div className="stat-card" key={card.label}>
            <div className={`stat-icon ${card.color}`}>{card.icon}</div>
            <div className="stat-info">
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Grid */}
      <div className="recent-grid">
        {/* Recent Jobs */}
        <div className="admin-section">
          <div className="section-header">
            <h2 className="section-title">💼 Recent Jobs</h2>
            <Link to="/admin/jobs" style={{ fontSize: '0.8rem', color: '#6366f1', textDecoration: 'none' }}>View All →</Link>
          </div>
          <div className="glass-card">
            {recentJobs.length > 0 ? recentJobs.map(job => (
              <div className="recent-item" key={job.id}>
                <div className="recent-item-left">
                  <span className="recent-item-title">{job.title}</span>
                  <span className="recent-item-sub">{job.company?.name || job.company_name} · {job.location}</span>
                </div>
                <span className={`badge ${job.is_active ? 'badge-active' : 'badge-inactive'}`}>
                  {job.is_active ? 'Active' : 'Closed'}
                </span>
              </div>
            )) : (
              <div className="empty-state"><div className="empty-icon">💼</div><p>No jobs posted yet.</p></div>
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="admin-section">
          <div className="section-header">
            <h2 className="section-title">📄 Recent Applications</h2>
            <Link to="/admin/applications" style={{ fontSize: '0.8rem', color: '#6366f1', textDecoration: 'none' }}>View All →</Link>
          </div>
          <div className="glass-card">
            {recentApps.length > 0 ? recentApps.map(app => (
              <div className="recent-item" key={app.id}>
                <div className="recent-item-left">
                  <span className="recent-item-title">{app.user?.name || app.user?.email}</span>
                  <span className="recent-item-sub">{app.job?.title}</span>
                </div>
                <span className={`badge ${statusBadgeClass[app.status] || 'badge-gray'}`}>{app.status}</span>
              </div>
            )) : (
              <div className="empty-state"><div className="empty-icon">📄</div><p>No applications yet.</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
