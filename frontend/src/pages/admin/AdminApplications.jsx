import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { APPLICATION_ENDPOINTS } from '../../constants/apiConstants';
import './Admin.css';

const STATUS_OPTIONS = [
  { value: 'APPLIED', label: 'Applied' },
  { value: 'REVIEWED', label: 'Reviewed' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Rejected' },
];

const STATUS_BADGE = {
  APPLIED: 'badge-applied',
  REVIEWED: 'badge-reviewed',
  SHORTLISTED: 'badge-shortlisted',
  ACCEPTED: 'badge-accepted',
  REJECTED: 'badge-rejected',
};

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axiosInstance.get(APPLICATION_ENDPOINTS.LIST);
        setApplications(Array.isArray(res.data) ? res.data : []);
      } catch {
        setError('Failed to fetch applications.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const filtered = applications.filter(app => {
    const name = app.user?.name || app.user?.email || '';
    const jobTitle = app.job?.title || '';
    const matchSearch = !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      jobTitle.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || app.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axiosInstance.put(APPLICATION_ENDPOINTS.DETAIL(id), { status: newStatus });
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    } catch {
      alert('Failed to update status.');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1>Review Applications</h1>
          <p>{applications.length} total application{applications.length !== 1 ? 's' : ''} received</p>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Filter Bar */}
      <div className="filter-bar">
        <input
          className="filter-input"
          placeholder="🔍  Search by candidate or job..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Card List */}
      {filtered.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <p>{search || filterStatus !== 'all' ? 'No applications match your filters.' : 'No applications received yet.'}</p>
          </div>
        </div>
      ) : (
        <div className="application-list">
          {filtered.map(app => (
            <div key={app.id}>
              <div className="application-card">
                {/* Left — Candidate Info */}
                <div className="app-candidate">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <div className="avatar-circle" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>
                      {(app.user?.name || app.user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="name">{app.user?.name || 'Unknown'}</span>
                  </div>
                  <span className="email">{app.user?.email}</span>
                  <span className="date">
                    Applied {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Center — Job Info */}
                <div className="app-job">
                  <span className="job-title">{app.job?.title || '—'}</span>
                  <span className="company">{app.job?.company?.name || app.job?.company_name || '—'}</span>
                  <span className={`badge ${STATUS_BADGE[app.status] || 'badge-gray'}`} style={{ marginTop: 8, alignSelf: 'flex-start' }}>
                    {app.status}
                  </span>
                </div>

                {/* Right — Actions */}
                <div className="app-actions">
                  <select
                    className="status-select-modern"
                    value={app.status}
                    onChange={e => handleStatusChange(app.id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <div className="app-row-actions">
                    <Link
                      to={`/admin/applications/${app.id}`}
                      className="icon-btn primary"
                      title="View Full Details"
                    >
                      👁
                    </Link>
                    <button
                      className="icon-btn"
                      title={expandedId === app.id ? 'Hide Cover Letter' : 'View Cover Letter'}
                      onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                    >
                      💬
                    </button>
                  </div>
                </div>
              </div>

              {/* Expandable Cover Letter */}
              {expandedId === app.id && (
                <div className="cover-letter-row">
                  <strong style={{ color: '#818cf8', fontSize: '0.85rem' }}>Cover Letter</strong>
                  <p>{app.cover_letter || 'No cover letter provided.'}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminApplications;
