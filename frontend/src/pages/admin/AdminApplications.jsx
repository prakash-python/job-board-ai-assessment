/**
 * AdminApplications Page — Allows ADMINs to review all applications and update their status.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { APPLICATION_ENDPOINTS } from '../../constants/apiConstants';
import './Admin.css';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchApplications = async () => {
    try {
      const res = await axiosInstance.get(APPLICATION_ENDPOINTS.LIST);
      setApplications(res.data);
    } catch {
      setError('Failed to fetch applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axiosInstance.put(APPLICATION_ENDPOINTS.DETAIL(id), { status: newStatus });
      setApplications(applications.map(app => 
        app.id === id ? { ...app, status: newStatus, status_display: newStatus } : app
      ));
    } catch {
      alert('Failed to update status.');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="admin-header fade-in-up">
          <div>
            <h1>Review Applications</h1>
            <p className="text-secondary">Review applicant details and update statuses.</p>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card admin-table-card fade-in-up fade-in-up-delay-1">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Job</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id}>
                    <td>
                      <div><strong>{app.user?.name}</strong></div>
                      <div className="text-xs text-muted">{app.user?.email}</div>
                    </td>
                    <td>
                      <div><strong>{app.job?.title}</strong></div>
                      <div className="text-xs text-muted">{app.job?.company}</div>
                    </td>
                    <td>{new Date(app.created_at).toLocaleDateString()}</td>
                    <td>
                      <select 
                        className="form-select form-select-sm status-select"
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      >
                        <option value="APPLIED">Applied</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-ghost" onClick={() => alert(`Cover Letter:\n${app.cover_letter || 'None provided.'}`)}>View Letter</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {applications.length === 0 && (
                  <tr><td colSpan="5" className="text-center text-muted py-4">No applications found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminApplications;
