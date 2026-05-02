import { useState } from 'react';
import { Link } from 'react-router-dom';

const CompanyCard = ({ company }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`company-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="company-card-header">
        <div className="company-logo" style={{ background: '#ffffff', overflow: 'hidden', padding: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
          {company.logo && (company.logo.startsWith('http') || company.logo.startsWith('/')) ? (
            <img src={company.logo} alt={`${company.name} logo`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            company.logo || company.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="company-title-info">
          <h3 className="company-name">{company.name}</h3>
          <div className="company-meta">
            <span className="company-industry">{company.industry}</span>
            <span className="company-location">📍 {company.location}</span>
          </div>
        </div>
      </div>
      
      <p className={`company-description ${isExpanded ? 'full' : ''}`}>
        {company.description}
      </p>
      
      <button 
        className="read-more-link" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
      >
        {isExpanded ? 'Show Less' : 'Read More'}
      </button>
      
      <div className="company-card-footer">
        <span className="open-jobs-badge">{company.open_jobs || 0} Open Jobs</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to={`/company-profile/${company.id}`} className="btn btn-ghost btn-sm icon-btn" title="View Profile">
            👤
          </Link>
          <Link to={`/jobs?company_id=${company.id}`} className="btn btn-primary btn-sm icon-btn" title="View Jobs">
            💼
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;
