import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/api';
import { JOB_ENDPOINTS } from '../constants/apiConstants';
import CompanySelect from './CompanySelect';
import CreateCompanyModal from './CreateCompanyModal';

const EMPTY_FORM = {
  title: '', 
  company: '', 
  location: '', 
  job_type: 'full-time',
  description: '', 
  salary_min: '', 
  salary_max: '', 
  deadline: '', 
  is_active: true,
};

const CreateJobModal = ({ editJob, companies, onClose, onSuccess, onRefreshCompanies }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showAddCompany, setShowAddCompany] = useState(false);

  useEffect(() => {
    console.log("CreateJobModal mounted with editJob:", editJob);
    if (editJob) {
      setForm({
        title: editJob.title || '', 
        company: editJob.company?.id || '',
        location: editJob.location || '', 
        job_type: editJob.job_type || 'full-time',
        description: editJob.description || '', 
        salary_min: editJob.salary_min || '',
        salary_max: editJob.salary_max || '', 
        deadline: editJob.deadline || '',
        is_active: editJob.is_active,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editJob]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCompanyChange = (companyId) => {
    setForm(prev => ({ ...prev, company: companyId }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editJob) {
        await api.put(JOB_ENDPOINTS.DETAIL(editJob.id), form);
      } else {
        await api.post(JOB_ENDPOINTS.LIST, form);
      }
      onSuccess();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save job. Check all required fields.');
    } finally {
      setSaving(false);
    }
  };

  const handleCompanyCreated = (newCompany) => {
    onRefreshCompanies(); 
    setForm(prev => ({ ...prev, company: newCompany.id }));
    setShowAddCompany(false);
  };

  return createPortal(
    <>
      <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2500 }}>
        <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
          <div className="modal-header">
            <h3>{editJob ? '✏️ Edit Job Posting' : '+ Create New Job'}</h3>
            <button className="close-modal-btn" onClick={onClose}>✕</button>
          </div>
          <form onSubmit={handleSave} className="modal-body">
            {error && <div className="alert alert-error mb-4">{error}</div>}
            
            <div className="form-row">
              <div className="form-group-modern">
                <label>Job Title <span style={{ color: '#ef4444' }}>*</span></label>
                <input 
                  type="text" 
                  name="title" 
                  value={form.title} 
                  onChange={handleFormChange} 
                  required 
                  placeholder="e.g. Senior React Developer" 
                />
              </div>
              <div className="form-group-modern">
                <label>Company <span style={{ color: '#ef4444' }}>*</span></label>
                <CompanySelect 
                  companies={companies} 
                  value={form.company} 
                  onChange={handleCompanyChange} 
                  onAddNew={() => setShowAddCompany(true)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group-modern">
                <label>Location <span style={{ color: '#ef4444' }}>*</span></label>
                <input 
                  type="text" 
                  name="location" 
                  value={form.location} 
                  onChange={handleFormChange} 
                  required 
                  placeholder="e.g. Hyderabad, India" 
                />
              </div>
              <div className="form-group-modern">
                <label>Job Type</label>
                <select name="job_type" value={form.job_type} onChange={handleFormChange}>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="remote">Remote</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group-modern">
                <label>Min Salary (₹)</label>
                <input 
                  type="number" 
                  name="salary_min" 
                  value={form.salary_min} 
                  onChange={handleFormChange} 
                  placeholder="e.g. 500000" 
                />
              </div>
              <div className="form-group-modern">
                <label>Max Salary (₹)</label>
                <input 
                  type="number" 
                  name="salary_max" 
                  value={form.salary_max} 
                  onChange={handleFormChange} 
                  placeholder="e.g. 1200000" 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group-modern">
                <label>Application Deadline</label>
                <input 
                  type="date" 
                  name="deadline" 
                  value={form.deadline} 
                  onChange={handleFormChange} 
                />
              </div>
              <div className="form-group-modern" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '28px' }}>
                <input 
                  type="checkbox" 
                  id="is_active" 
                  name="is_active" 
                  checked={form.is_active} 
                  onChange={handleFormChange} 
                  style={{ width: 'auto', accentColor: '#6366f1' }} 
                />
                <label htmlFor="is_active" style={{ marginBottom: 0, cursor: 'pointer' }}>Publish job listing</label>
              </div>
            </div>

            <div className="form-group-modern">
              <label>Job Description <span style={{ color: '#ef4444' }}>*</span></label>
              <textarea 
                name="description" 
                value={form.description} 
                onChange={handleFormChange} 
                rows="5" 
                required 
                placeholder="Describe the role, responsibilities, and requirements..." 
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : editJob ? 'Update Job' : 'Create Job'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showAddCompany && (
        <CreateCompanyModal 
          onClose={() => setShowAddCompany(false)} 
          onSuccess={handleCompanyCreated}
        />
      )}
    </>,
    document.body
  );
};

export default CreateJobModal;
