import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { JOB_ENDPOINTS, COMPANY_ENDPOINTS } from '../../constants/apiConstants';
import './Admin.css';

const EMPTY_FORM = {
  title: '', company: '', location: '', job_type: 'full-time',
  description: '', salary_min: '', salary_max: '', deadline: '', is_active: true,
};

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchData = async () => {
    try {
      const [jobsRes, companiesRes] = await Promise.all([
        axiosInstance.get(JOB_ENDPOINTS.LIST),
        axiosInstance.get(COMPANY_ENDPOINTS.LIST),
      ]);
      setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
      setCompanies(Array.isArray(companiesRes.data) ? companiesRes.data : []);
    } catch {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredJobs = jobs.filter(job => {
    const matchSearch = !search || job.title?.toLowerCase().includes(search.toLowerCase()) ||
      job.company?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && job.is_active) ||
      (filterStatus === 'closed' && !job.is_active);
    return matchSearch && matchStatus;
  });

  const openCreate = () => { setEditJob(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (job) => {
    setEditJob(job);
    setForm({
      title: job.title || '', company: job.company?.id || '',
      location: job.location || '', job_type: job.job_type || 'full-time',
      description: job.description || '', salary_min: job.salary_min || '',
      salary_max: job.salary_max || '', deadline: job.deadline || '',
      is_active: job.is_active,
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editJob) {
        await axiosInstance.put(JOB_ENDPOINTS.DETAIL(editJob.id), form);
      } else {
        await axiosInstance.post(JOB_ENDPOINTS.LIST, form);
      }
      setShowModal(false);
      fetchData();
    } catch {
      alert('Failed to save. Check all required fields.');
    } finally {
      setSaving(false);
    }
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
              {filteredJobs.map(job => (
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
              {filteredJobs.length === 0 && (
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

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editJob ? '✏️ Edit Job Posting' : '+ Create New Job'}</h3>
              <button className="close-modal-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="modal-body">
              <div className="form-row">
                <div className="form-group-modern">
                  <label>Job Title <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="text" name="title" value={form.title} onChange={handleFormChange} required placeholder="e.g. Senior React Developer" />
                </div>
                <div className="form-group-modern">
                  <label>Company <span style={{ color: '#ef4444' }}>*</span></label>
                  <select name="company" value={form.company} onChange={handleFormChange} required>
                    <option value="">Select Company</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group-modern">
                  <label>Location <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="text" name="location" value={form.location} onChange={handleFormChange} required placeholder="e.g. Hyderabad, India" />
                </div>
                <div className="form-group-modern">
                  <label>Job Type</label>
                  <select name="job_type" value={form.job_type} onChange={handleFormChange}>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="remote">Remote</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group-modern">
                  <label>Min Salary (₹)</label>
                  <input type="number" name="salary_min" value={form.salary_min} onChange={handleFormChange} placeholder="e.g. 500000" />
                </div>
                <div className="form-group-modern">
                  <label>Max Salary (₹)</label>
                  <input type="number" name="salary_max" value={form.salary_max} onChange={handleFormChange} placeholder="e.g. 1200000" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group-modern">
                  <label>Application Deadline</label>
                  <input type="date" name="deadline" value={form.deadline} onChange={handleFormChange} />
                </div>
                <div className="form-group-modern" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '28px' }}>
                  <input type="checkbox" id="is_active" name="is_active" checked={form.is_active} onChange={handleFormChange} style={{ width: 'auto', accentColor: '#6366f1' }} />
                  <label htmlFor="is_active" style={{ marginBottom: 0, cursor: 'pointer' }}>Publish job listing</label>
                </div>
              </div>
              <div className="form-group-modern">
                <label>Job Description <span style={{ color: '#ef4444' }}>*</span></label>
                <textarea name="description" value={form.description} onChange={handleFormChange} rows="5" required placeholder="Describe the role, responsibilities, and requirements..." />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editJob ? 'Update Job' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobs;
