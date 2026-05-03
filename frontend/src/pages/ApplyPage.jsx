/**
 * ApplyPage — Customer applies to a specific job.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { JOB_ENDPOINTS, APPLICATION_ENDPOINTS } from '../constants/apiConstants';
import { useAuth } from '../context/AuthContext';
import './ApplyPage.css';

const ApplyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    phone_number: '',
    linkedin_link: '',
    github_link: '',
    portfolio_link: '',
    cover_letter: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [existingResumeName, setExistingResumeName] = useState('');

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch job details and profile data in parallel
        const [jobRes, profileRes] = await Promise.all([
          api.get(JOB_ENDPOINTS.DETAIL(id)),
          api.get('/accounts/profile/')
        ]);
        
        setJob(jobRes.data);
        
        // Pre-fill from latest user profile
        if (profileRes.data) {
          const profile = profileRes.data;
          setFormData(prev => ({
            ...prev,
            phone_number: user?.phone_number || '',
            linkedin_link: profile.linkedin_link || '',
            github_link: profile.github_link || '',
            portfolio_link: profile.portfolio_link || '',
          }));
          // We store the existing resume URL in a temporary state for display
          if (profile.resume) {
            setExistingResumeName(profile.resume.split('/').pop());
          }
        }
      } catch (err) {
        console.error('ApplyPage fetch error:', err);
        setError('Failed to load data. Please make sure you are logged in.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.phone_number || formData.phone_number.length < 10) {
        setError('Please enter a valid phone number.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    setError('');
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // If not on the final step, just advance to next step
    if (currentStep < 3) {
      nextStep();
      return;
    }

    // FINAL SUBMISSION VALIDATION (Step 3)
    // 1. Re-validate Step 1
    if (!formData.phone_number || formData.phone_number.length < 10) {
      setCurrentStep(1);
      setError('Please enter a valid phone number.');
      return;
    }

    // 2. Validate Resume (Either new file or existing one in profile)
    if (!resumeFile && !existingResumeName) {
      setError('Please upload your resume.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('job_id', id);
      data.append('cover_letter', formData.cover_letter);
      if (formData.phone_number) data.append('phone_number', formData.phone_number);
      if (formData.linkedin_link) data.append('linkedin_link', formData.linkedin_link);
      if (formData.github_link) data.append('github_link', formData.github_link);
      if (formData.portfolio_link) data.append('portfolio_link', formData.portfolio_link);
      if (resumeFile) data.append('resume', resumeFile);

      await api.post(APPLICATION_ENDPOINTS.LIST, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Application submitted! A confirmation email has been sent to you.');
      setCurrentStep(4);
      setTimeout(() => navigate('/my-applications'), 2500);
    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      if (typeof data === 'object') {
        const firstErr = Object.values(data)[0];
        setError(Array.isArray(firstErr) ? firstErr[0] : firstErr);
      } else {
        setError('Failed to submit application.');
      }
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

  const companyInitial = job?.company_name ? job.company_name.charAt(0).toUpperCase() : 'J';

  return (
    <div className="apply-page-container fade-in">
      {/* Unified Header & Stepper Card */}
      <div className="apply-header-card">
        <div className="header-content-wrapper">
          <div className="apply-job-info">
            <h1>{job?.title}</h1>
            <div className="apply-job-meta">
              <span>🏢 {job?.company_name}</span> • <span>📍 {job?.location}</span>
            </div>
          </div>
          <div className="apply-job-badge">
            <span className="badge badge-primary">{job?.job_type_display || job?.job_type}</span>
          </div>
        </div>

        {/* Progress Stepper - Now Inline */}
        <div className="apply-stepper-inline">
          <div className={`step-item ${currentStep >= 1 ? 'active' : ''}`}>
            <div className="step-circle">{currentStep > 1 ? '✓' : '1'}</div>
            <div className="step-label">Details</div>
          </div>
          <div className={`step-item ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="step-circle">{currentStep > 2 ? '✓' : '2'}</div>
            <div className="step-label">Professional</div>
          </div>
          <div className={`step-item ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-circle">{currentStep > 3 ? '✓' : '3'}</div>
            <div className="step-label">Upload</div>
          </div>
          <div className={`step-item ${currentStep === 4 ? 'active' : ''}`}>
            <div className="step-circle">✓</div>
            <div className="step-label">Submit</div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="apply-form-card">
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '32px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="form-section fade-in">
              <h3 className="form-section-title">
                <span className="section-icon">👤</span> Personal Information
              </h3>
              <div className="apply-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="input-group">
                  <label className="input-label">Email Address <span style={{color: '#ef4444'}}>*</span></label>
                  <div className="input-wrapper">
                    <span className="input-icon">📧</span>
                    <input type="text" className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Phone Number <span style={{color: '#ef4444'}}>*</span></label>
                  <div className="input-wrapper">
                    <span className="input-icon">📞</span>
                    <input 
                      type="tel" 
                      name="phone_number"
                      className="form-input" 
                      placeholder="10-digit mobile number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Socials */}
          {currentStep === 2 && (
            <div className="form-section fade-in">
              <h3 className="form-section-title">
                <span className="section-icon">🔗</span> Professional Links
              </h3>
              
              <p className="text-secondary mb-6">Add your professional profiles to help us know you better (Optional).</p>

              <div className="apply-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="input-group">
                  <label className="input-label">LinkedIn Profile</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔗</span>
                    <input 
                      type="url" 
                      name="linkedin_link"
                      className="form-input" 
                      placeholder="https://linkedin.com/in/..."
                      value={formData.linkedin_link}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">GitHub Profile</label>
                  <div className="input-wrapper">
                    <span className="input-icon">💻</span>
                    <input 
                      type="url" 
                      name="github_link"
                      className="form-input" 
                      placeholder="https://github.com/..."
                      value={formData.github_link}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Portfolio URL</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🌐</span>
                    <input 
                      type="url" 
                      name="portfolio_link"
                      className="form-input" 
                      placeholder="https://yourportfolio.com"
                      value={formData.portfolio_link}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Upload */}
          {currentStep === 3 && (
            <div className="form-section fade-in">
              <h3 className="form-section-title">
                <span className="section-icon">📄</span> Resume & Motivation
              </h3>
              
              <div className="input-group">
                <label className="input-label">Upload Resume (PDF) <span style={{color: '#ef4444'}}>*</span></label>
                <label className="custom-file-upload">
                  <input 
                    type="file" 
                    onChange={handleFileChange} 
                    style={{ display: 'none' }}
                    accept=".pdf,.doc,.docx"
                  />
                  <div className="upload-icon">📁</div>
                  <div className="upload-text">
                    {resumeFile ? 'Change Resume' : 'Upload your resume (PDF)'}
                  </div>
                  <div className="upload-hint">Select your professional CV</div>
                </label>
                {(resumeFile || existingResumeName) && (
                  <div className="file-name-display">
                    <span>📎</span>
                    {resumeFile ? resumeFile.name : `Using profile resume: ${existingResumeName}`}
                  </div>
                )}
              </div>

              <div className="input-group" style={{ marginTop: '32px' }}>
                <label className="input-label">Cover Letter (Optional)</label>
                <textarea
                  name="cover_letter"
                  className="form-input"
                  placeholder="Share your experience and motivation..."
                  value={formData.cover_letter}
                  onChange={handleInputChange}
                  rows={5}
                  style={{ paddingLeft: '16px', minHeight: '120px' }}
                />
              </div>
            </div>
          )}

          {/* Success Step */}
          {currentStep === 4 && (
            <div className="form-section fade-in text-center" style={{ padding: '40px 0' }}>
              <div className="success-icon" style={{ fontSize: '4rem', marginBottom: '24px' }}>🎉</div>
              <h2 style={{ marginBottom: '16px' }}>Application Submitted!</h2>
              <p className="text-secondary">
                We've received your application for <strong>{job?.title}</strong>. 
                Check your email for confirmation. Redirecting you to your applications...
              </p>
            </div>
          )}

          {/* Footer Actions */}
          {currentStep < 4 && (
            <div className="apply-footer-actions">
              {currentStep === 1 ? (
                <Link to={`/jobs/${id}`} className="btn-cancel">Cancel</Link>
              ) : (
                <button type="button" onClick={prevStep} className="btn-cancel">Back</button>
              )}
              
              {currentStep < 3 ? (
                <button type="button" onClick={nextStep} className="btn-submit-premium">Next Step</button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn-submit-premium"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : '🚀 Submit Application'}
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ApplyPage;
