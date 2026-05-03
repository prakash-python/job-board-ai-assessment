/**
 * MyApplications Page — Customers view and track their own job applications.
 */

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { APPLICATION_ENDPOINTS } from '../constants/apiConstants';
import './MyApplications.css';

const STATUS_CONFIG = {
  APPLIED:     { label: 'Applied',      cls: 'status-applied',     icon: '📨', color: '#3b82f6', step: 1 },
  REVIEWED:    { label: 'Reviewed',     cls: 'status-reviewed',    icon: '👀', color: '#8b5cf6', step: 2 },
  SHORTLISTED: { label: 'Shortlisted',  cls: 'status-shortlisted', icon: '⭐', color: '#f59e0b', step: 3 },
  ACCEPTED:    { label: 'Accepted',     cls: 'status-accepted',    icon: '✅', color: '#10b981', step: 4 },
  REJECTED:    { label: 'Rejected',     cls: 'status-rejected',    icon: '❌', color: '#ef4444', step: 4 },
};

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawing, setWithdrawing] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  
  // Custom Modal State
  const [showConfirm, setShowConfirm] = useState(false);
  const [appToWithdraw, setAppToWithdraw] = useState(null);

  const fetchApplications = async () => {
    try {
      const res = await axiosInstance.get(APPLICATION_ENDPOINTS.LIST);
      const appData = res.data.results || res.data;
      setApplications(Array.isArray(appData) ? appData : []);
    } catch {
      setError('Failed to load your applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, []);

  const handleWithdrawClick = (appId) => {
    setAppToWithdraw(appId);
    setShowConfirm(true);
  };

  const confirmWithdraw = async () => {
    if (!appToWithdraw) return;
    const appId = appToWithdraw;
    setShowConfirm(false);
    setWithdrawing(appId);
    try {
      await axiosInstance.delete(APPLICATION_ENDPOINTS.DETAIL(appId));
      setApplications((prev) => prev.filter((a) => a.id !== appId));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to withdraw application.');
    } finally {
      setWithdrawing(null);
      setAppToWithdraw(null);
    }
  };

  // Stats
  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter(a => ['APPLIED', 'REVIEWED', 'SHORTLISTED'].includes(a.status)).length,
      accepted: applications.filter(a => a.status === 'ACCEPTED').length,
      rejected: applications.filter(a => a.status === 'REJECTED').length,
    };
  }, [applications]);

  // Filtered & Sorted List
  const processedApplications = useMemo(() => {
    let list = [...applications];
    
    if (filter !== 'ALL') {
      list = list.filter(a => a.status === filter);
    }

    list.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return list;
  }, [applications, filter, sortBy]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="my-apps-page">
      {/* Header Section */}
      <div className="my-apps-header-section fade-in">
        <div className="header-text">
          <h1>My Applications</h1>
          <p className="text-secondary">Track and manage your job applications in real-time.</p>
        </div>
        <Link to="/jobs" className="btn-browse-premium">
          <span>🔍</span> Browse More Jobs
        </Link>
      </div>

      {/* Summary Metrics */}
      <div className="stats-grid fade-in-up">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>📄</div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Applied</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>⏳</div>
          <div className="stat-info">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>🎉</div>
          <div className="stat-info">
            <span className="stat-value">{stats.accepted}</span>
            <span className="stat-label">Accepted</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>📁</div>
          <div className="stat-info">
            <span className="stat-value">{stats.rejected}</span>
            <span className="stat-label">Rejected</span>
          </div>
        </div>
      </div>

      {/* Filters & Sorting */}
      <div className="filters-bar fade-in">
        <div className="filter-group">
          {['ALL', 'APPLIED', 'REVIEWED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'].map(f => (
            <button 
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'ALL' ? 'All' : (STATUS_CONFIG[f]?.label || f)}
            </button>
          ))}
        </div>
        <select 
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Latest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Application List */}
      {processedApplications.length === 0 ? (
        <div className="empty-state-modern fade-in-up">
          <div className="empty-illustration">📭</div>
          <h2>No applications found</h2>
          <p>It looks like you haven't applied to any jobs that match this filter.</p>
          <Link to="/jobs" className="btn-primary-premium">Start Exploring Jobs</Link>
        </div>
      ) : (
        <div className="apps-list-grid">
          {processedApplications.map((app, idx) => (
            <ApplicationCard 
              key={app.id} 
              app={app} 
              onWithdraw={handleWithdrawClick}
              isWithdrawing={withdrawing === app.id}
              delay={idx}
            />
          ))}
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay fade-in">
          <div className="modal-content fade-in-up">
            <div className="modal-icon-warning">⚠️</div>
            <h2>Confirm Withdrawal</h2>
            <p>Are you sure you want to withdraw your application? This action cannot be undone and you may lose your progress in the hiring pipeline.</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn btn-danger-premium" onClick={confirmWithdraw}>Yes, Withdraw</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ApplicationCard = ({ app, onWithdraw, isWithdrawing, delay }) => {
  const config = STATUS_CONFIG[app.status] || { label: app.status, cls: 'status-gray', icon: '❓', step: 1 };
  const appliedDate = new Date(app.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const steps = [
    { label: 'Applied', step: 1, key: 'APPLIED' },
    { label: 'Reviewed', step: 2, key: 'REVIEWED' },
    { label: 'Shortlisted', step: 3, key: 'SHORTLISTED' },
    { label: 'Decision', step: 4, key: app.status === 'REJECTED' ? 'REJECTED' : 'ACCEPTED' }
  ];

  const currentStep = config.step;

  return (
    <div className={`app-card-premium fade-in-up`} style={{ animationDelay: `${delay * 0.1}s` }}>
      <div className="app-card-header">
        <div className="app-company-info">
          <div className="company-logo-placeholder">
            {app.job?.company_name?.charAt(0) || 'J'}
          </div>
          <div className="job-meta">
            <h3>{app.job?.title}</h3>
            <p>{app.job?.company_name} • {app.job?.location}</p>
          </div>
        </div>
        <div className={`status-badge ${config.cls}`}>
          {config.icon} {config.label}
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="app-timeline">
        {steps.map((s, i) => {
          const isCompleted = currentStep > s.step || (currentStep === 4 && s.step === 4);
          const isActive = currentStep === s.step;
          const isRejected = app.status === 'REJECTED' && s.step === 4;
          
          return (
            <div key={s.label} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isRejected ? 'rejected' : ''}`}>
              <div className="step-point">
                {isCompleted ? '✓' : (isRejected ? '✕' : '')}
              </div>
              <span className="step-label">{s.label}</span>
              {i < steps.length - 1 && <div className="step-line" />}
            </div>
          );
        })}
      </div>

      <div className="app-card-footer">
        <span className="applied-date">Applied on {appliedDate}</span>
        <div className="app-actions">
          <Link to={`/jobs/${app.job?.id}`} className="btn-view-job">View Job Details</Link>
          {app.status === 'APPLIED' && (
            <button 
              className="btn-withdraw" 
              onClick={() => onWithdraw(app.id)}
              disabled={isWithdrawing}
            >
              {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyApplications;
