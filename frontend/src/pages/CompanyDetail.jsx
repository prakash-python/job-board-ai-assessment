import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { COMPANY_ENDPOINTS } from '../constants/apiConstants';
import './CompanyDetail.css';

const CompanyDetail = () => {
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [compRes, jobsRes] = await Promise.all([
          axiosInstance.get(COMPANY_ENDPOINTS.DETAIL(companyId)),
          axiosInstance.get(COMPANY_ENDPOINTS.JOBS(companyId))
        ]);
        setCompany(compRes.data);
        setJobs(jobsRes.data);
      } catch (err) {
        setError('Failed to load company profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [companyId]);

  if (loading) {
    return (
      <div className="company-detail-container">
        <div className="container">
          <div className="skeleton" style={{ height: '300px', borderRadius: '24px', marginBottom: '32px' }}></div>
          <div className="skeleton" style={{ height: '600px', borderRadius: '24px' }}></div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="company-detail-container">
        <div className="container">
          <div className="alert alert-error">{error || 'Company not found.'}</div>
          <Link to="/jobs" className="btn btn-ghost mt-6">← Back to Jobs</Link>
        </div>
      </div>
    );
  }

  const initial = company.name?.charAt(0).toUpperCase() || 'C';

  return (
    <div className="company-detail-container fade-in">
      <div className="container">
        {/* Profile Header */}
        <div className="company-profile-header">
          <div className="company-banner"></div>
          <div className="company-profile-main">
            <div className="company-logo-large">{initial}</div>
            <div className="company-info-hero">
              <div className="hero-top">
                <h1>{company.name}</h1>
                {company.industry && <span className="industry-tag">{company.industry}</span>}
              </div>
              <div className="hero-meta">
                <div className="meta-item">
                  <span className="meta-icon">📍</span>
                  <span>{company.location || 'Remote'}</span>
                </div>
                {company.website && (
                  <div className="meta-item">
                    <span className="meta-icon">🔗</span>
                    <a href={company.website} target="_blank" rel="noopener noreferrer">Visit Website</a>
                  </div>
                )}
                <div className="meta-item">
                  <span className="meta-icon">💼</span>
                  <span>{jobs.length} Active Openings</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="company-layout">
          {/* About Section */}
          <div className="company-main-content">
            <div className="company-section">
              <h2 className="section-title">About the Company</h2>
              <div className="company-description">
                {company.description || (
                  <p>
                    {company.name} is a leader in its industry, committed to innovation and excellence. 
                    They foster a culture of growth and are constantly looking for talented individuals 
                    to join their mission-driven team.
                  </p>
                )}
              </div>
            </div>

            {/* Culture/Mission Mock Sections for Richness */}
            <div className="company-section grid-2">
              <div className="info-box">
                <h3>Our Mission</h3>
                <p>Empowering teams to build world-class solutions that solve complex problems for global customers.</p>
              </div>
              <div className="info-box">
                <h3>Our Vision</h3>
                <p>To be the most trusted partner for digital transformation in the {company.industry || 'technology'} space.</p>
              </div>
            </div>
          </div>

          {/* Active Jobs Sidebar/Section */}
          <div className="company-jobs-section">
            <div className="section-header">
              <h2 className="section-title">Open Positions</h2>
              <span className="jobs-count">{jobs.length} jobs available</span>
            </div>

            {jobs.length === 0 ? (
              <div className="no-jobs-state">
                <p>There are currently no active job openings for this company.</p>
              </div>
            ) : (
              <div className="company-jobs-list">
                {jobs.map(job => (
                  <Link key={job.id} to={`/jobs/${job.id}`} className="company-job-card">
                    <div className="job-card-main">
                      <h4>{job.title}</h4>
                      <div className="job-card-meta">
                        <span>{job.job_type_display || job.job_type}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                      </div>
                    </div>
                    <div className="job-card-arrow">→</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
