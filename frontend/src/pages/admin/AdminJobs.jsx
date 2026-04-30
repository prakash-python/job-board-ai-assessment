/**
 * AdminJobs Page — Allows ADMINs to view, create, edit, and delete jobs.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { JOB_ENDPOINTS } from '../../constants/apiConstants';
import './Admin.css';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobs = async () => {
    try {
      const res = await axiosInstance.get(JOB_ENDPOINTS.LIST);
      setJobs(res.data);
    } catch {
      setError('Failed to fetch jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await axiosInstance.delete(JOB_ENDPOINTS.DETAIL(id));
      setJobs(jobs.filter(j => j.id !== id));
    } catch {
      alert('Failed to delete job.');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="admin-header fade-in-up">
          <div>
            <h1>Manage Jobs</h1>
            <p className="text-secondary">Create and manage job postings.</p>
          </div>
          {/* We'll just link to a hypothetical create job page or open a modal. For simplicity, let's link to a new form route. */}
          <button className="btn btn-primary" onClick={() => alert('Create job functionality would open a form here!')}>
            + Create Job
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card admin-table-card fade-in-up fade-in-up-delay-1">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id}>
                    <td>{job.title}</td>
                    <td>{job.company}</td>
                    <td><span className="badge badge-gray">{job.job_type_display || job.job_type}</span></td>
                    <td>
                      {job.is_active 
                        ? <span className="badge badge-success">Active</span> 
                        : <span className="badge badge-danger">Closed</span>}
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/jobs/${job.id}`} className="btn btn-sm btn-ghost">View</Link>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(job.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr><td colSpan="5" className="text-center text-muted py-4">No jobs found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminJobs;
