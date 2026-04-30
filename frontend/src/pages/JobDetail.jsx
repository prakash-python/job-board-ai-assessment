/**
 * JobDetail Page — Shows full details of a job posting.
 * Customers can navigate to Apply from here.
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { JOB_ENDPOINTS } from '../constants/apiConstants';
import { useAuth } from '../context/AuthContext';
import './JobDetail.css';

const JOB_TYPE_BADGE = {
  'full-time':  'badge-success',
  'part-time':  'badge-warning',
  'contract':   'badge-accent',
  'remote':     'badge-primary',
  'internship': 'badge-gray',
};

const JobDetail = () => {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axiosInstance.get(JOB_ENDPOINTS.DETAIL(id));
        setJob(res.data);
      } catch {
        setError('Job not found or no longer available.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(JOB_ENDPOINTS.DETAIL(id));
      navigate('/admin/jobs');
    } catch {
      setError('Failed to delete job.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading job details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="alert alert-error">{error}</div>
          <Link to="/jobs" className="btn btn-outline">← Back to Jobs</Link>
        </div>
      </div>
    );
  }

  const badgeClass = JOB_TYPE_BADGE[job.job_type] || 'badge-gray';
  const createdDate = new Date(job.created_at).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="job-detail-layout">

          {/* Main Content */}
          <div className="job-detail-main fade-in-up">
            <Link to="/jobs" className="back-link">← Back to Jobs</Link>

            <div className="card job-detail-card">
              {/* Header */}
              <div className="job-detail-header">
                <div className="job-detail-logo">💼</div>
                <div className="job-detail-title-group">
                  <div className="job-detail-badges">
                    <span className={`badge ${badgeClass}`}>{job.job_type_display || job.job_type}</span>
                    {!job.is_active && <span className="badge badge-danger">Closed</span>}
                  </div>
                  <h1 className="job-detail-title">{job.title}</h1>
                  <p className="job-detail-company">{job.company}</p>
                </div>
              </div>

              {/* Meta Info */}
              <div className="job-detail-meta">
                <div className="meta-item">
                  <span className="meta-icon">📍</span>
                  <div>
                    <span className="meta-label">Location</span>
                    <span className="meta-value">{job.location}</span>
                  </div>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">🗓</span>
                  <div>
                    <span className="meta-label">Posted On</span>
                    <span className="meta-value">{createdDate}</span>
                  </div>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">👤</span>
                  <div>
                    <span className="meta-label">Posted By</span>
                    <span className="meta-value">{job.created_by?.name || 'Admin'}</span>
                  </div>
                </div>
              </div>

              <div className="divider" />

              {/* Description */}
              <div className="job-description">
                <h2>Job Description</h2>
                <p>{job.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="job-detail-actions">
                {user && !isAdmin && job.is_active && (
                  <Link to={`/jobs/${id}/apply`} className="btn btn-primary btn-lg">
                    Apply Now →
                  </Link>
                )}
                {!user && (
                  <Link to="/login" className="btn btn-primary btn-lg">
                    Login to Apply
                  </Link>
                )}
                {isAdmin && (
                  <div className="admin-actions">
                    <Link to={`/admin/jobs/${id}/edit`} className="btn btn-outline">
                      ✏️ Edit Job
                    </Link>
                    <button
                      className="btn btn-danger"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting...' : '🗑 Delete Job'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="job-detail-sidebar fade-in-up fade-in-up-delay-1">
            <div className="card sidebar-card">
              <h3>Quick Summary</h3>
              <ul className="summary-list">
                <li><strong>Company:</strong> {job.company}</li>
                <li><strong>Location:</strong> {job.location}</li>
                <li><strong>Job Type:</strong> {job.job_type_display || job.job_type}</li>
                <li><strong>Status:</strong> {job.is_active ? '🟢 Active' : '🔴 Closed'}</li>
              </ul>
              {user && !isAdmin && job.is_active && (
                <Link to={`/jobs/${id}/apply`} className="btn btn-primary btn-full" style={{ marginTop: '1rem' }}>
                  Apply Now
                </Link>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default JobDetail;
