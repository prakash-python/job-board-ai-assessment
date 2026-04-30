/**
 * MyApplications Page — Customers view their own job applications.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { APPLICATION_ENDPOINTS } from '../constants/apiConstants';
import './MyApplications.css';

const STATUS_BADGE = {
  APPLIED:   { cls: 'badge-accent',   icon: '📨' },
  ACCEPTED:  { cls: 'badge-success',  icon: '✅' },
  REJECTED:  { cls: 'badge-danger',   icon: '❌' },
};

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawing, setWithdrawing] = useState(null);

  const fetchApplications = async () => {
    try {
      const res = await axiosInstance.get(APPLICATION_ENDPOINTS.LIST);
      setApplications(res.data);
    } catch {
      setError('Failed to load your applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, []);

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Withdraw this application?')) return;
    setWithdrawing(appId);
    try {
      await axiosInstance.delete(APPLICATION_ENDPOINTS.DETAIL(appId));
      setApplications((prev) => prev.filter((a) => a.id !== appId));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to withdraw application.');
    } finally {
      setWithdrawing(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="my-apps-header fade-in-up">
          <div>
            <h1>My Applications</h1>
            <p className="text-secondary">Track the status of your job applications.</p>
          </div>
          <Link to="/jobs" className="btn btn-primary">Browse More Jobs →</Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {applications.length === 0 ? (
          <div className="empty-state fade-in-up">
            <div className="empty-state-icon">📭</div>
            <h3>No applications yet</h3>
            <p>You haven't applied to any jobs. Start browsing!</p>
            <Link to="/jobs" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="my-apps-list fade-in-up">
            {applications.map((app, index) => {
              const badge = STATUS_BADGE[app.status] || { cls: 'badge-gray', icon: '❓' };
              const appliedDate = new Date(app.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              });
              return (
                <div
                  key={app.id}
                  className={`app-item card fade-in-up fade-in-up-delay-${Math.min(index + 1, 3)}`}
                >
                  <div className="app-item-left">
                    <div className="app-company-logo">💼</div>
                    <div className="app-item-info">
                      <h3 className="app-job-title">{app.job?.title}</h3>
                      <p className="app-job-company">{app.job?.company} · {app.job?.location}</p>
                      <p className="app-date text-muted text-xs">Applied {appliedDate}</p>
                    </div>
                  </div>

                  <div className="app-item-right">
                    <span className={`badge ${badge.cls}`}>
                      {badge.icon} {app.status_display || app.status}
                    </span>
                    <div className="app-item-actions">
                      <Link to={`/jobs/${app.job?.id}`} className="btn btn-ghost btn-sm">
                        View Job
                      </Link>
                      {app.status === 'APPLIED' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleWithdraw(app.id)}
                          disabled={withdrawing === app.id}
                        >
                          {withdrawing === app.id ? 'Withdrawing...' : 'Withdraw'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
