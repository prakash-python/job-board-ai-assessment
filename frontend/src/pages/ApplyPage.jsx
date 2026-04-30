/**
 * ApplyPage — Customer applies to a specific job.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { JOB_ENDPOINTS, APPLICATION_ENDPOINTS } from '../constants/apiConstants';
import './ApplyPage.css';

const ApplyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axiosInstance.get(JOB_ENDPOINTS.DETAIL(id));
        setJob(res.data);
      } catch {
        setError('Job not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await axiosInstance.post(APPLICATION_ENDPOINTS.LIST, {
        job_id: parseInt(id),
        cover_letter: coverLetter,
      });
      setSuccess('Application submitted! A confirmation email has been sent to you.');
      setTimeout(() => navigate('/my-applications'), 2500);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.detail || data?.non_field_errors?.[0] || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="alert alert-error">{error}</div>
          <Link to="/jobs" className="btn btn-outline">← Back to Jobs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container apply-container">
        {/* Job Summary */}
        <div className="apply-job-summary card fade-in-up">
          <div className="apply-job-logo">💼</div>
          <div>
            <h2 className="apply-job-title">{job?.title}</h2>
            <p className="apply-job-company">{job?.company} · {job?.location}</p>
            <span className="badge badge-success">{job?.job_type_display || job?.job_type}</span>
          </div>
        </div>

        {/* Application Form */}
        <div className="card apply-form-card fade-in-up fade-in-up-delay-1">
          <div className="apply-form-header">
            <h1>Submit Your Application</h1>
            <p className="text-secondary text-sm">
              Fill in the details below. A confirmation email will be sent upon submission.
            </p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="cover-letter">
                Cover Letter <span className="text-muted text-xs">(Optional)</span>
              </label>
              <textarea
                id="cover-letter"
                className="form-textarea"
                placeholder="Tell us why you're a great fit for this role..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={8}
                style={{ minHeight: '200px' }}
              />
            </div>

            <div className="apply-actions">
              <Link to={`/jobs/${id}`} className="btn btn-ghost">
                ← Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={submitting || !!success}
              >
                {submitting ? 'Submitting...' : '🚀 Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyPage;
