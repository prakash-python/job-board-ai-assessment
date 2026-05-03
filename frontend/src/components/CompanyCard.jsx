import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getLogoUrl, getAvatarColor } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const CompanyCard = ({ company, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { isAdmin } = useAuth();
  const logoUrl = getLogoUrl(company.logo);

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      onDelete(company.id);
    }
  };

  return (
    <div className={`company-card ${isExpanded ? 'expanded' : ''}`}>
      {/* Admin Actions - Top Right */}
      {isAdmin && (
        <div className="company-card-actions">
          <button
            className="action-btn edit-btn"
            onClick={() => onEdit(company)}
            title="Edit company"
            aria-label="Edit company"
          >
            ✏️
          </button>
          <button
            className="action-btn delete-btn"
            onClick={handleDeleteClick}
            title="Delete company"
            aria-label="Delete company"
          >
            🗑️
          </button>
        </div>
      )}
      
      <div className="company-card-header">
        <div className="company-logo" style={{ background: imgError || !logoUrl ? getAvatarColor(company.name) : '#ffffff', overflow: 'hidden', padding: '6px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.5rem', color: '#fff' }}>
          {logoUrl && !imgError ? (
            <img 
              src={logoUrl} 
              alt={`${company.name} logo`} 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              onError={() => setImgError(true)} 
            />
          ) : (
            company.name.charAt(0).toUpperCase()
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
