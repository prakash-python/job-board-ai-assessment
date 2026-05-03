import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import { APPLICATION_ENDPOINTS } from '../../constants/apiConstants';
import ResumeViewerModal from '../../components/ResumeViewerModal';
import './Admin.css';

const STATUS_OPTIONS = [
  { value: 'APPLIED', label: 'Applied' },
  { value: 'REVIEWED', label: 'Reviewed' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Rejected' },
];

const STATUS_BADGE = {
  APPLIED: 'badge-applied',
  REVIEWED: 'badge-reviewed',
  SHORTLISTED: 'badge-shortlisted',
  ACCEPTED: 'badge-accepted',
  REJECTED: 'badge-rejected',
};

const InfoRow = ({ label, value, href }) => {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8', fontSize: '0.9rem', wordBreak: 'break-all' }}>{value}</a>
      ) : (
        <span style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{value}</span>
      )}
    </div>
  );
};

const AdminApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await api.get(APPLICATION_ENDPOINTS.DETAIL(id));
        setApp(res.data);
      } catch {
        setError('Application not found or you do not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  // Ensure scroll is reset to top when data loads
  useEffect(() => {
    if (!loading) {
      const contentArea = document.querySelector('.sidebar-content');
      if (contentArea) contentArea.scrollTop = 0;
      window.scrollTo(0, 0);
    }
  }, [loading]);

  const handleViewResume = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const contentArea = document.querySelector('.sidebar-content');
    if (contentArea) contentArea.scrollTop = 0;
    setShowResumeModal(true);
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await api.put(APPLICATION_ENDPOINTS.DETAIL(id), { status: newStatus });
      setApp(prev => ({ ...prev, status: newStatus }));
    } catch {
      alert('Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;
  if (error) return (
    <div className="admin-page">
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
        <p style={{ color: '#64748b' }}>{error}</p>
        <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginTop: 16 }}>← Go Back</button>
      </div>
    </div>
  );

  const profile = app.user?.profile;
  const user = app.user;
  const job = app.job;

  return (
    <div className="admin-page">
      {/* Back Nav */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => navigate('/admin/applications')}
          style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
        >
          ← Back to Applications
        </button>
      </div>

      {/* Header */}
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="avatar-circle" style={{ width: 52, height: 52, fontSize: '1.2rem' }}>
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{user?.name || 'Unknown Applicant'}</h1>
            <p style={{ margin: '4px 0 0', color: '#64748b' }}>Application for <strong style={{ color: '#a5b4fc' }}>{job?.title}</strong></p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className={`badge ${STATUS_BADGE[app.status] || 'badge-gray'}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
            {app.status}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left — Candidate Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Personal Details */}
          <div className="glass-card" style={{ padding: '20px 24px' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>👤 Candidate Details</h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.78rem', color: '#475569' }}>Personal & contact information</p>
            <InfoRow label="Full Name" value={user?.name} />
            <InfoRow label="Email Address" value={user?.email} href={`mailto:${user?.email}`} />
            <InfoRow label="Phone Number" value={user?.phone_number || 'Not provided'} />
            <InfoRow label="Date of Birth" value={profile?.dob || 'Not provided'} />
            <InfoRow label="Gender" value={profile?.gender || 'Not provided'} />
            <InfoRow label="Education" value={profile?.education_details || 'Not provided'} />
          </div>

          {/* Social Links */}
          <div className="glass-card" style={{ padding: '20px 24px' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>🔗 Social Links</h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.78rem', color: '#475569' }}>Online profiles and portfolio</p>
            {profile?.linkedin_link ? (
              <InfoRow label="LinkedIn" value={profile.linkedin_link} href={profile.linkedin_link} />
            ) : <InfoRow label="LinkedIn" value="Not provided" />}
            {profile?.github_link ? (
              <InfoRow label="GitHub" value={profile.github_link} href={profile.github_link} />
            ) : <InfoRow label="GitHub" value="Not provided" />}
            {profile?.portfolio_link ? (
              <InfoRow label="Portfolio" value={profile.portfolio_link} href={profile.portfolio_link} />
            ) : <InfoRow label="Portfolio" value="Not provided" />}
          </div>

          {/* Resume */}
          <div className="glass-card" style={{ padding: '20px 24px' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>📄 Resume</h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.78rem', color: '#475569' }}>Candidate's uploaded resume</p>
            {profile?.resume_url ? (
              <button
                className="btn btn-primary"
                onClick={handleViewResume}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                📄 View Resume
              </button>
            ) : (
              <p style={{ color: '#475569', fontSize: '0.88rem' }}>No resume uploaded.</p>
            )}
          </div>
        </div>

        {/* Right — Job & Application Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Job Details */}
          <div className="glass-card" style={{ padding: '20px 24px' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>💼 Job Details</h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.78rem', color: '#475569' }}>Position being applied for</p>
            <InfoRow label="Job Title" value={job?.title} />
            <InfoRow label="Company" value={job?.company?.name || job?.company_name} />
            <InfoRow label="Location" value={job?.location} />
            <InfoRow label="Job Type" value={job?.job_type_display || job?.job_type} />
            {job?.salary_min && job?.salary_max && (
              <InfoRow label="Salary Range" value={`₹${(job.salary_min / 100000).toFixed(1)}L – ₹${(job.salary_max / 100000).toFixed(1)}L per annum`} />
            )}
            <InfoRow label="Applied On" value={new Date(app.created_at).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
          </div>

          {/* Update Status */}
          <div className="glass-card" style={{ padding: '20px 24px' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>⚡ Update Status</h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.78rem', color: '#475569' }}>Change the applicant's current status</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  disabled={updatingStatus || app.status === opt.value}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 10,
                    border: `1px solid ${app.status === opt.value ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    background: app.status === opt.value ? 'rgba(99,102,241,0.15)' : 'transparent',
                    color: app.status === opt.value ? '#a5b4fc' : '#64748b',
                    fontWeight: app.status === opt.value ? 700 : 500,
                    cursor: app.status === opt.value ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.88rem',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>{opt.label}</span>
                  {app.status === opt.value && <span style={{ fontSize: '0.75rem' }}>✓ Current</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Cover Letter */}
          <div className="glass-card" style={{ padding: '20px 24px' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>💬 Cover Letter</h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.78rem', color: '#475569' }}>Message from the applicant</p>
            {app.cover_letter ? (
              <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: '0.88rem', whiteSpace: 'pre-wrap', margin: 0 }}>
                {app.cover_letter}
              </p>
            ) : (
              <p style={{ color: '#475569', fontSize: '0.88rem', margin: 0 }}>No cover letter provided.</p>
            )}
          </div>
        </div>
      </div>

      {/* Shared Resume Modal */}
      {showResumeModal && (
        <ResumeViewerModal 
          fileUrl={profile?.resume_url} 
          userName={user?.name || 'Applicant'} 
          onClose={() => setShowResumeModal(false)} 
        />
      )}
    </div>
  );
};

export default AdminApplicationDetail;
