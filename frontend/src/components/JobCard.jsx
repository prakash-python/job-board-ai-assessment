import { Link } from 'react-router-dom';
import './JobCard.css';

const JobCard = ({ job }) => {
  const companyInitial = job.company ? job.company.charAt(0).toUpperCase() : 'J';
  
  // Calculate relative time
  const daysAgo = Math.floor((new Date() - new Date(job.created_at)) / (1000 * 60 * 60 * 24));
  let timeText = daysAgo === 0 ? 'Today' : `${daysAgo}d ago`;

  return (
    <div className="job-card-premium fade-in">
      <div className="job-card-header">
        <div className={`company-logo initial-${companyInitial.toLowerCase()}`}>
          {companyInitial}
        </div>
        <span className="job-post-time">{timeText}</span>
      </div>

      <div className="job-card-body">
        <h3 className="job-title">{job.title}</h3>
        <p className="job-company">{job.company}</p>
        
        <div className="job-details-row">
          <span className="detail-item">📍 {job.location}</span>
          <span className="detail-item">💰 {job.salary_range || '$120k - $160k'}</span>
        </div>
      </div>

      <div className="job-card-footer">
        <div className="job-tags">
          <span className="job-tag blue">{job.job_type_display || job.job_type}</span>
          <span className="job-tag cyan">Remote</span>
        </div>
        <Link to={`/jobs/${job.id}`} className="view-job-btn">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
