/**
 * JobCard component — displays a job posting summary.
 */
import { Link } from 'react-router-dom';
import './JobCard.css';

const JOB_TYPE_BADGE = {
  'full-time':  'badge-success',
  'part-time':  'badge-warning',
  'contract':   'badge-accent',
  'remote':     'badge-primary',
  'internship': 'badge-gray',
};

const JOB_TYPE_ICON = {
  'full-time':  '🏢',
  'part-time':  '🕐',
  'contract':   '📋',
  'remote':     '🌐',
  'internship': '🎓',
};

const JobCard = ({ job }) => {
  const badgeClass = JOB_TYPE_BADGE[job.job_type] || 'badge-gray';
  const icon = JOB_TYPE_ICON[job.job_type] || '💼';
  const createdDate = new Date(job.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
  
  const deadlineDate = job.deadline ? new Date(job.deadline).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  }) : null;

  return (
    <div className="job-card card fade-in-up">
      <div className="job-card-header">
        <div className="job-company-logo">{icon}</div>
        <div className="job-card-meta">
          <span className={`badge ${badgeClass}`}>{job.job_type_display || job.job_type}</span>
          {!job.is_active && <span className="badge badge-danger">Closed</span>}
        </div>
      </div>

      <h3 className="job-title">{job.title}</h3>
      <p className="job-company">{job.company}</p>

      <div className="job-card-info">
        <span className="job-info-item">
          <span className="info-icon">📍</span>
          {job.location}
        </span>
        <span className="job-info-item">
          <span className="info-icon">🗓</span>
          Posted: {createdDate}
        </span>
        {deadlineDate && (
          <span className="job-info-item text-danger">
            <span className="info-icon">⌛</span>
            Deadline: {deadlineDate}
          </span>
        )}
      </div>

      <p className="job-description-preview">
        {job.description?.length > 120
          ? job.description.substring(0, 120) + '...'
          : job.description}
      </p>

      <div className="job-card-footer">
        <span className="posted-by text-xs text-muted">
          By {job.created_by?.name || 'Admin'}
        </span>
        <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-sm">
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
