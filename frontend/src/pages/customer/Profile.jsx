import { useState, useEffect } from 'react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import ResumeViewerModal from '../../components/ResumeViewerModal';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    dob: '',
    gender: '',
    education_details: '',
    linkedin_link: '',
    github_link: '',
    portfolio_link: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [existingResume, setExistingResume] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/accounts/profile/');
        setProfile({
          dob: res.data.dob || '',
          gender: res.data.gender || '',
          education_details: res.data.education_details || '',
          linkedin_link: res.data.linkedin_link || '',
          github_link: res.data.github_link || '',
          portfolio_link: res.data.portfolio_link || ''
        });
        if (res.data.resume_url) setExistingResume(res.data.resume_url);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);


  const handleViewResume = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const contentArea = document.querySelector('.sidebar-content');
    if (contentArea) contentArea.scrollTop = 0;
    setShowResumeModal(true);
  };

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setResumeFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    const formData = new FormData();
    if (profile.dob) formData.append('dob', profile.dob);
    formData.append('gender', profile.gender);
    formData.append('education_details', profile.education_details);
    formData.append('linkedin_link', profile.linkedin_link);
    formData.append('github_link', profile.github_link);
    formData.append('portfolio_link', profile.portfolio_link);
    if (resumeFile) formData.append('resume', resumeFile);

    try {
      const res = await api.put('/accounts/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Profile updated successfully!');
      if (res.data.resume_url) setExistingResume(res.data.resume_url);
      
      // Auto-hide success message
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to update profile.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="profile-dashboard fade-in-up">
      <div className="profile-header">
        <h1>Profile Settings</h1>
        <p className="text-secondary">Manage your personal information and resume.</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="profile-grid">
        {/* Left Column: User Card */}
        <div className="profile-sidebar">
          <div className="profile-card user-summary-card">
            <div className="profile-avatar-large">
              {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <h2 className="profile-name">{user?.name || user?.email?.split('@')[0] || 'User'}</h2>
            <div className="profile-role-badge">Candidate</div>
            
            <div className="profile-quick-info">
              <div className="info-row">
                <span className="info-icon">✉️</span>
                <span className="info-text" title={user?.email}>{user?.email}</span>
              </div>
              <div className="info-row">
                <span className="info-icon">📞</span>
                <span className="info-text">{user?.phone_number || 'Not provided'}</span>
              </div>
              
              {/* Social Links as Rows */}
              {profile.linkedin_link && (
                <a href={profile.linkedin_link} target="_blank" rel="noreferrer" className="info-row social-row" title="LinkedIn">
                  <span className="info-icon">🔗</span>
                  <span className="info-text">LinkedIn Profile</span>
                </a>
              )}
              {profile.github_link && (
                <a href={profile.github_link} target="_blank" rel="noreferrer" className="info-row social-row" title="GitHub">
                  <span className="info-icon">📁</span>
                  <span className="info-text">GitHub Profile</span>
                </a>
              )}
              {profile.portfolio_link && (
                <a href={profile.portfolio_link} target="_blank" rel="noreferrer" className="info-row social-row" title="Portfolio">
                  <span className="info-icon">🌐</span>
                  <span className="info-text">Personal Portfolio</span>
                </a>
              )}

              {existingResume && (
                <div className="info-row mt-4">
                  <button onClick={handleViewResume} className="resume-download-btn w-full">
                    📄 View Resume
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="profile-main">
          <div className="profile-card">
            <h3 className="card-title">Personal Details</h3>
            <form onSubmit={handleSubmit} className="profile-form">
              
              <div className="form-row">
                <div className="form-group-modern">
                  <label>Email Address</label>
                  <input type="email" value={user?.email || ''} disabled className="input-disabled" />
                </div>
                <div className="form-group-modern">
                  <label>Phone Number</label>
                  <input type="tel" value={user?.phone_number || ''} disabled className="input-disabled" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group-modern">
                  <label>Date of Birth</label>
                  <input type="date" name="dob" value={profile.dob} onChange={handleChange} />
                </div>
                <div className="form-group-modern">
                  <label>Gender</label>
                  <select name="gender" value={profile.gender} onChange={handleChange}>
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="form-group-modern">
                <label>Education Details</label>
                <textarea 
                  name="education_details" 
                  rows="3" 
                  value={profile.education_details} 
                  onChange={handleChange}
                  placeholder="E.g., B.Tech in Computer Science from XYZ University..."
                ></textarea>
              </div>

              {/* Social Links Form Section */}
              <h3 className="card-title mt-8 mb-4">Professional Links</h3>
              <div className="form-row">
                <div className="form-group-modern">
                  <label>LinkedIn Profile URL</label>
                  <input 
                    type="url" 
                    name="linkedin_link" 
                    value={profile.linkedin_link} 
                    onChange={handleChange} 
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group-modern">
                  <label>GitHub Profile URL</label>
                  <input 
                    type="url" 
                    name="github_link" 
                    value={profile.github_link} 
                    onChange={handleChange} 
                    placeholder="https://github.com/username"
                  />
                </div>
                <div className="form-group-modern">
                  <label>Portfolio / Personal Website</label>
                  <input 
                    type="url" 
                    name="portfolio_link" 
                    value={profile.portfolio_link} 
                    onChange={handleChange} 
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div className="form-group-modern mt-6">
                <label>Update Resume (PDF) <span style={{color: '#ef4444'}}>*</span></label>
                <div className="file-upload-wrapper">
                  <input type="file" onChange={handleFileChange} accept=".pdf" id="resume-upload" />
                  <label htmlFor="resume-upload" className="file-upload-label">
                    {resumeFile ? resumeFile.name : 'Choose a PDF file or drag it here'}
                  </label>
                </div>
              </div>

              <div className="form-actions mt-8">
                <button type="submit" className="btn btn-primary btn-save" disabled={saving}>
                  {saving ? (
                    <><span className="spinner-small"></span> Saving...</>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Shared Resume Viewer Modal */}
      {showResumeModal && (
        <ResumeViewerModal 
          fileUrl={existingResume} 
          userName={user?.name || "Your Profile"} 
          onClose={() => setShowResumeModal(false)} 
        />
      )}
    </div>
  );
};

export default Profile;
