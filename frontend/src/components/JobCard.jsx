import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLogoUrl, getAvatarColor } from '../utils/formatters';
import './JobCard.css';

const JobCard = ({ job }) => {
  const [imgError, setImgError] = useState(false);
  const [logoVersion, setLogoVersion] = useState(Date.now());
  const companyName = job.company?.name || job.company_name || 'Unknown Company';
  const rawLogoUrl = getLogoUrl(job.company?.logo);
  const logoUrl = rawLogoUrl ? `${rawLogoUrl}?v=${logoVersion}` : null;
  
  // Calculate relative time
  const daysAgo = Math.floor((new Date() - new Date(job.created_at)) / (1000 * 60 * 60 * 24));
  let timeText = daysAgo === 0 ? 'Today' : `${daysAgo}d ago`;

  useEffect(() => {
    setImgError(false);
    setLogoVersion(Date.now());
  }, [job]);

  const formatSalary = (salary) => {
    if (!salary) return '';
    return (salary / 100000).toFixed(1) + ' LPA';
  };
  const salaryText = job.salary_min && job.salary_max 
    ? `${formatSalary(job.salary_min)} - ${formatSalary(job.salary_max)}` 
    : 'Not Disclosed';

  return (
    <div className="job-card-premium fade-in">
      <div className="job-card-header">
        {logoUrl && !imgError ? (
          <img 
            src={logoUrl} 
            alt={companyName} 
            className="company-logo-img" 
            onError={() => setImgError(true)} 
          />
        ) : (
          <div 
            className="company-logo-fallback" 
            style={{ backgroundColor: getAvatarColor(companyName) }}
          >
            {companyName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="job-post-time">{timeText}</span>
      </div>

      <div className="job-card-body">
        <h3 className="job-title">{job.title}</h3>
        <p className="job-company">{companyName}</p>
        
        <div className="job-details-row">
          <span className="detail-item">📍 {job.location}</span>
          <span className="detail-item">💰 {salaryText}</span>
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
