import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { JOB_ENDPOINTS, COMPANY_ENDPOINTS } from '../../constants/apiConstants';
import CreateJobModal from '../../components/CreateJobModal';
import './Admin.css';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const fetchJobs = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const params = { page: currentPage };
      if (search) params.search = search;
      if (filterStatus !== 'all') params.is_active = filterStatus === 'active';

      const res = await axiosInstance.get(JOB_ENDPOINTS.LIST, { params });
      const jobsData = res.data.results || res.data;
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setTotalCount(res.data.count || (Array.isArray(res.data) ? res.data.length : 0));
    } catch {
      setError('Failed to load jobs.');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await axiosInstance.get(COMPANY_ENDPOINTS.LIST);
      const companiesData = res.data.results || res.data;
      setCompanies(Array.isArray(companiesData) ? companiesData : []);
    } catch {
      console.error('Failed to load companies.');
    }
  };

  useEffect(() => {
    const initFetch = async () => {
      setLoading(true);
      await Promise.all([fetchJobs(), fetchCompanies()]);
      setLoading(false);
    };
    initFetch();
  }, []);

  useEffect(() => {
    // Only fetch jobs on dependency change, but don't show global loading
    fetchJobs();
  }, [currentPage, search, filterStatus]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus]);

  const openCreate = () => { setEditJob(null); setShowModal(true); };
  const openEdit = (job) => {
    setEditJob(job);
    setShowModal(true);
  };

  const handleSaveSuccess = () => {
    setShowModal(false);
    fetchJobs();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this job posting?')) return;
    try {
      await axiosInstance.delete(JOB_ENDPOINTS.DETAIL(id));
      setJobs(prev => prev.filter(j => j.id !== id));
    } catch {
      alert('Failed to delete job.');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1>Manage Jobs</h1>
          <p>{jobs.length} total job posting{jobs.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Create Job</button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Filter Bar */}
      <div className="filter-bar">
        <input
          className="filter-input"
          placeholder="🔍  Search by title or company..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card">
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Type</th>
                <th>Salary</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id}>
                  <td>
                    <div className="job-title-cell">
                      <span className="title">{job.title}</span>
                      <span className="meta">
                        {job.company?.name || job.company_name || '—'} · {job.location}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-gray">
                      {job.job_type_display || job.job_type}
                    </span>
                  </td>
                  <td>
                    {job.salary_min && job.salary_max
                      ? `₹${(job.salary_min / 100000).toFixed(1)}L – ₹${(job.salary_max / 100000).toFixed(1)}L`
                      : <span style={{ color: '#475569' }}>—</span>}
                  </td>
                  <td>
                    {job.deadline
                      ? new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : <span style={{ color: '#475569' }}>—</span>}
                  </td>
                  <td>
                    <span className={`badge ${job.is_active ? 'badge-active' : 'badge-inactive'}`}>
                      {job.is_active ? '● Active' : '● Closed'}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <Link to={`/jobs/${job.id}`} className="icon-btn" title="View">👁</Link>
                      <button className="icon-btn primary" title="Edit" onClick={() => openEdit(job)}>✏️</button>
                      <button className="icon-btn danger" title="Delete" onClick={() => handleDelete(job.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <div className="empty-icon">💼</div>
                      <p>{search ? 'No jobs match your search.' : 'No job postings yet. Create one!'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalCount > pageSize && (
        <div className="pagination-container" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
          <button 
            className="btn btn-ghost" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          >
            ← Previous
          </button>
          <span style={{ color: 'white', fontWeight: 600 }}>
            Page {currentPage} of {Math.ceil(totalCount / pageSize)}
          </span>
          <button 
            className="btn btn-ghost" 
            disabled={currentPage >= Math.ceil(totalCount / pageSize)}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <CreateJobModal 
          editJob={editJob}
          companies={companies}
          onClose={() => setShowModal(false)}
          onSuccess={handleSaveSuccess}
          onRefreshCompanies={fetchCompanies}
        />
      )}
    </div>
  );
};

export default AdminJobs;
