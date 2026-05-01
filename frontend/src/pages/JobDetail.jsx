import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { JOB_ENDPOINTS } from '../constants/apiConstants';
import { useAuth } from '../context/AuthContext';
import './JobDetail.css';

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
      <div className="job-detail-container">
        <div className="container">
          <div className="skeleton" style={{height: '400px', borderRadius: '24px'}}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-detail-container">
        <div className="container">
          <div className="alert alert-error">{error}</div>
          <Link to="/jobs" className="btn btn-ghost mt-6">← Back to Jobs</Link>
        </div>
      </div>
    );
  }

  const companyInitial = job.company ? job.company.charAt(0).toUpperCase() : 'J';
  const createdDate = new Date(job.created_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="job-detail-container fade-in">
      <div className="container">
        <div className="job-detail-layout">
          {/* Main Content */}
          <div className="job-detail-main">
            <Link to="/jobs" className="nav-link" style={{marginBottom: '20px', display: 'inline-block'}}>← Back to all jobs</Link>
            
            <div className="job-header-card">
              <div className="company-badge">{companyInitial}</div>
              <h1 className="detail-title">{job.title}</h1>
              <div className="detail-meta">
                <span>🏢 {job.company}</span>
                <span>📍 {job.location}</span>
                <span>📅 {createdDate}</span>
              </div>
            </div>

            <div className="description-card">
              <h2>Role Description</h2>
              <div className="description-content">
                {job.description}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="job-detail-sidebar">
            <div className="detail-sidebar-card">
              <div className="sidebar-info-group">
                <span className="sidebar-label">Salary Range</span>
                <span className="sidebar-value">{job.salary_range || '$120k - $160k'}</span>
              </div>
              <div className="sidebar-info-group">
                <span className="sidebar-label">Job Type</span>
                <span className="sidebar-value">{job.job_type_display || job.job_type}</span>
              </div>
              <div className="sidebar-info-group">
                <span className="sidebar-label">Workplace</span>
                <span className="sidebar-value">Remote</span>
              </div>

              {user && !isAdmin && (
                <Link to={`/jobs/${id}/apply`} className="btn btn-primary apply-btn-large">
                  Apply for this role
                </Link>
              )}
              {!user && (
                <Link to="/login" className="btn btn-primary apply-btn-large">
                  Sign in to apply
                </Link>
              )}
              {isAdmin && (
                <div style={{marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                   <Link to={`/admin/jobs/${id}/edit`} className="btn btn-ghost" style={{width: '100%'}}>Edit Job</Link>
                   <button onClick={handleDelete} className="btn btn-ghost" style={{width: '100%', color: '#ef4444'}} disabled={deleting}>
                     {deleting ? 'Deleting...' : 'Delete Job'}
                   </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
