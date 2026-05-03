import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { JOB_ENDPOINTS, APPLICATION_ENDPOINTS } from '../constants/apiConstants';
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
  const [isApplied, setIsApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Step 1: Fetch job details
        const jobRes = await api.get(`${JOB_ENDPOINTS.DETAIL(id)}?t=${Date.now()}`);
        setJob(jobRes.data);
        
        // Initial fallback from job object
        if (jobRes.data.has_applied) {
          setIsApplied(true);
        }

        // Step 2: Explicitly check application status if logged in
        if (user && !isAdmin) {
          try {
            const checkRes = await api.get(APPLICATION_ENDPOINTS.CHECK, {
              params: { job_id: id }
            });
            setIsApplied(checkRes.data.applied);
            setApplicationStatus(checkRes.data.status);
          } catch (err) {
            console.error("Failed to check application status", err);
          }
        }
      } catch {
        setError('Job not found or no longer available.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user, isAdmin]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    setDeleting(true);
    try {
      await api.delete(JOB_ENDPOINTS.DETAIL(id));
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

  const companyInitial = job.company_name ? job.company_name.charAt(0).toUpperCase() : 'J';
  const createdDate = new Date(job.created_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Competitive';
    const f = (val) => (val / 100000).toFixed(1) + ' LPA';
    return `${f(min)} - ${f(max)}`;
  };

  const salaryDisplay = formatSalary(job.salary_min, job.salary_max);

  // Helper to split description into sections based on keywords
  const parseDescription = (text) => {
    if (!text) return { overview: '', responsibilities: [], requirements: [], benefits: [] };
    
    const sections = {
      overview: '',
      responsibilities: [],
      requirements: [],
      benefits: []
    };

    // Very basic parsing logic - looking for keywords
    const lowerText = text.toLowerCase();
    const respIndex = lowerText.indexOf('responsibilities');
    const reqIndex = lowerText.indexOf('requirements');
    const benIndex = lowerText.indexOf('benefits');

    // Overview
    const overviewEnd = [respIndex, reqIndex, benIndex].filter(i => i > 0).sort((a, b) => a - b)[0] || text.length;
    sections.overview = text.substring(0, overviewEnd).trim();

    // Helper to extract bullets
    const extractBullets = (startIdx, endIdx) => {
      const sectionText = text.substring(startIdx, endIdx || text.length);
      return sectionText
        .split('\n')
        .filter(line => line.trim().length > 10) // Filter out headers and short lines
        .map(line => line.replace(/^[\s•*-]+/, '').trim())
        .slice(0, 8); // Max 8 points per section
    };

    if (respIndex !== -1) {
      const nextIndex = [reqIndex, benIndex].filter(i => i > respIndex).sort((a, b) => a - b)[0];
      sections.responsibilities = extractBullets(respIndex, nextIndex);
    }
    
    if (reqIndex !== -1) {
      const nextIndex = [respIndex, benIndex].filter(i => i > reqIndex).sort((a, b) => a - b)[0];
      sections.requirements = extractBullets(reqIndex, nextIndex);
    }

    if (benIndex !== -1) {
      const nextIndex = [respIndex, reqIndex].filter(i => i > benIndex).sort((a, b) => a - b)[0];
      sections.benefits = extractBullets(benIndex, nextIndex);
    }

    return sections;
  };

  const sections = parseDescription(job.description);

  return (
    <div className="job-detail-container fade-in">
      <div className="container">
        <Link to="/jobs" className="nav-link" style={{marginBottom: '32px', display: 'inline-block'}}>
          ← Back to all jobs
        </Link>

        {/* Header Section */}
        <div className="job-header-card">
          <div className="company-badge-large">{companyInitial}</div>
          <div className="header-info">
            <h1 className="detail-title">{job.title}</h1>
            <div className="header-meta">
              <div className="meta-item">
                <span className="meta-icon">🏢</span>
                <span>{job.company_name}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">📍</span>
                <span>{job.location}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">📅</span>
                <span>Posted on {createdDate}</span>
              </div>
              <div className="meta-item">
                <span className="badge badge-primary" style={{textTransform: 'capitalize'}}>{job.job_type_display || job.job_type}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="job-detail-layout">
          {/* Left Column: Main Content */}
          <div className="job-detail-main">
            
            {/* Overview */}
            <div className="section-card">
              <div className="section-title">
                <span className="section-icon">📄</span>
                Job Overview
              </div>
              <div className="description-content">
                {sections.overview || "This is a great opportunity to join a fast-growing team and make a real impact."}
              </div>
            </div>

            {/* Responsibilities */}
            {(sections.responsibilities.length > 0 || !job.description.includes('Responsibilities')) && (
              <div className="section-card">
                <div className="section-title">
                  <span className="section-icon">🛠</span>
                  Key Responsibilities
                </div>
                <ul className="bullet-list">
                  {sections.responsibilities.length > 0 ? (
                    sections.responsibilities.map((item, i) => <li key={i}>{item}</li>)
                  ) : (
                    <>
                      <li>Collaborate with cross-functional teams to define, design, and ship new features.</li>
                      <li>Write clean, maintainable, and efficient code following industry best practices.</li>
                      <li>Participate in code reviews and contribute to architecture discussions.</li>
                      <li>Continuously discover, evaluate, and implement new technologies to maximize development efficiency.</li>
                    </>
                  )}
                </ul>
              </div>
            )}

            {/* Requirements */}
            <div className="section-card">
              <div className="section-title">
                <span className="section-icon">✅</span>
                Requirements
              </div>
              <ul className="bullet-list">
                {sections.requirements.length > 0 ? (
                  sections.requirements.map((item, i) => <li key={i}>{item}</li>)
                ) : (
                  <>
                    <li>Proven experience in a similar role with a strong portfolio.</li>
                    <li>Solid understanding of the software development life cycle.</li>
                    <li>Excellent problem-solving skills and attention to detail.</li>
                    <li>Strong communication skills and ability to work in a team environment.</li>
                  </>
                )}
              </ul>
            </div>

            {/* About Company */}
            {job.company && (
              <div className="section-card">
                <div className="section-title">
                  <span className="section-icon">🏢</span>
                  About {job.company_name}
                </div>
                <div className="description-content" style={{marginBottom: '20px'}}>
                  {job.company.description || "Leading innovator in the industry, focused on delivering high-quality solutions to global clients."}
                </div>
                <Link to={`/company-profile/${job.company.id}`} className="btn btn-ghost btn-sm">
                  View Company Profile →
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Sidebar */}
          <aside className="job-detail-sidebar">
            <div className="sidebar-card">
              <div className="sidebar-info-grid">
                <div className="info-row">
                  <span className="info-label">Annual Salary</span>
                  <span className="info-value" style={{color: '#10b981'}}>{salaryDisplay}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Employment</span>
                  <span className="info-value" style={{textTransform: 'capitalize'}}>{job.job_type_display || job.job_type}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Vacancies</span>
                  <span className="info-value">{job.vacancies || 1} Open Roles</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Deadline</span>
                  <span className="info-value" style={{color: job.deadline && new Date(job.deadline + 'T00:00:00') < new Date().setHours(0,0,0,0) ? '#ef4444' : 'inherit'}}>
                    {job.deadline ? new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline'}
                  </span>
                </div>
              </div>

              {user && !isAdmin && (
                <>
                  {isApplied ? (
                    <div className="status-banner applied">
                      <span className="banner-icon">✅</span>
                      <div className="banner-text">
                        <strong style={{color: '#10b981'}}>Already Applied</strong>
                        <p>You have submitted your application for this role.</p>
                      </div>
                      <Link to="/my-applications" className="btn-track">Track Application</Link>
                    </div>
                  ) : job.deadline && new Date(job.deadline + 'T00:00:00') < new Date().setHours(0,0,0,0) ? (
                    <div className="status-banner closed">
                      <span className="banner-icon">🚫</span>
                      <div className="banner-text">
                        <strong style={{color: '#ef4444'}}>Applications Closed</strong>
                        <p>No more applications are acceptable for this role.</p>
                      </div>
                    </div>
                  ) : (
                    <Link to={`/jobs/${id}/apply`} className="apply-btn-premium">
                      🚀 Apply for this role
                    </Link>
                  )}
                </>
              )}
              {!user && (
                <Link to="/login" className="apply-btn-premium">
                  🔑 Sign in to Apply
                </Link>
              )}
              
              {isAdmin && (
                <div style={{marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
                   <Link to={`/admin/jobs/${id}/edit`} className="btn btn-outline" style={{width: '100%', borderRadius: '12px'}}>Edit Posting</Link>
                   <button onClick={handleDelete} className="btn btn-ghost" style={{width: '100%', color: '#ef4444'}} disabled={deleting}>
                     {deleting ? 'Deleting...' : 'Delete Posting'}
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
