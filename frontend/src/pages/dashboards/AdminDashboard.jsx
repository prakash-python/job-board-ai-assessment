import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { USER_ENDPOINTS, JOB_ENDPOINTS, APPLICATION_ENDPOINTS } from '../../constants/apiConstants';
import '../admin/Admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, jobs: 0, applications: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, jobsRes, appsRes] = await Promise.all([
          axiosInstance.get(USER_ENDPOINTS.LIST),
          axiosInstance.get(JOB_ENDPOINTS.LIST),
          axiosInstance.get(APPLICATION_ENDPOINTS.LIST),
        ]);
        setStats({
          users: usersRes.data.length,
          jobs: jobsRes.data.length,
          applications: appsRes.data.length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="admin-header fade-in-up">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="text-secondary">Overview of the platform.</p>
          </div>
        </div>

        <div className="grid-3 fade-in-up fade-in-up-delay-1">
          <div className="card text-center" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '3rem', color: 'var(--color-primary-light)' }}>{stats.users}</h2>
            <p className="text-secondary">Total Users</p>
          </div>
          <div className="card text-center" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '3rem', color: 'var(--color-accent-light)' }}>{stats.jobs}</h2>
            <p className="text-secondary">Total Jobs</p>
          </div>
          <div className="card text-center" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '3rem', color: 'var(--color-success)' }}>{stats.applications}</h2>
            <p className="text-secondary">Total Applications</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
