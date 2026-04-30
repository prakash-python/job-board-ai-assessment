import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    pan_number: '',
    dob: '',
    gender: '',
    education_details: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [existingResume, setExistingResume] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get('/accounts/profile/');
        setProfile({
          pan_number: res.data.pan_number || '',
          dob: res.data.dob || '',
          gender: res.data.gender || '',
          education_details: res.data.education_details || ''
        });
        if (res.data.resume) setExistingResume(res.data.resume);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setResumeFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.append('pan_number', profile.pan_number);
    if (profile.dob) formData.append('dob', profile.dob);
    formData.append('gender', profile.gender);
    formData.append('education_details', profile.education_details);
    if (resumeFile) formData.append('resume', resumeFile);

    try {
      const res = await axiosInstance.put('/accounts/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Profile updated successfully!');
      if (res.data.resume) setExistingResume(res.data.resume);
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="fade-in-up">
          <h1>My Profile</h1>
          <p className="text-secondary">Update your personal details.</p>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="card fade-in-up fade-in-up-delay-1" style={{ padding: '2rem', marginTop: '1rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="text" className="form-input" value={user?.email} disabled />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="text" className="form-input" value={user?.phone_number || ''} disabled />
            </div>

            <div className="form-group">
              <label className="form-label">PAN Number</label>
              <input type="text" className="form-input" name="pan_number" value={profile.pan_number} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input type="date" className="form-input" name="dob" value={profile.dob} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-input" name="gender" value={profile.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Education Details</label>
              <textarea className="form-input" name="education_details" rows="3" value={profile.education_details} onChange={handleChange}></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Resume (PDF/Doc)</label>
              {existingResume && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <a href={`http://localhost:8000${existingResume}`} target="_blank" rel="noreferrer" className="text-primary">
                    View Current Resume
                  </a>
                </div>
              )}
              <input type="file" className="form-input" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
