import { useState, useEffect } from 'react';
import api from '../api/api';
import { COMPANY_ENDPOINTS } from '../constants/apiConstants';
import './EditCompanyModal.css';

const EditCompanyModal = ({ company, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    industry: '',
    description: '',
    website: '',
    logoFile: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill form with company data when modal opens
  useEffect(() => {
    if (company && isOpen) {
      setFormData({
        name: company.name || '',
        location: company.location || '',
        industry: company.industry || '',
        description: company.description || '',
        website: company.website || '',
        logoFile: null,
      });
      setError('');
    }
  }, [company, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      logoFile: file || null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let updateData;
      let config = {};

      if (formData.logoFile) {
        updateData = new FormData();
        updateData.append('name', formData.name);
        updateData.append('location', formData.location);
        updateData.append('industry', formData.industry);
        updateData.append('description', formData.description);
        if (formData.website) {
          updateData.append('website', formData.website);
        }
        updateData.append('logo', formData.logoFile);
        config = {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
      } else {
        updateData = {
          name: formData.name,
          location: formData.location,
          industry: formData.industry,
          description: formData.description,
        };
        if (formData.website) {
          updateData.website = formData.website;
        }
      }

      const response = await api.put(
        COMPANY_ENDPOINTS.DETAIL(company.id),
        updateData,
        config
      );

      // Call the success callback with updated company
      onSuccess(response.data);
      onClose();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to update company');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="edit-company-modal">
        <div className="modal-header">
          <h2>Edit Company</h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Error Message */}
          {error && (
            <div className="form-error-alert">
              ⚠️ {error}
            </div>
          )}

          {/* Company Name */}
          <div className="form-group">
            <label htmlFor="name">Company Name *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter company name"
              required
              className="form-input"
            />
          </div>

          {/* Location */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                id="location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., San Francisco, CA"
                required
                className="form-input"
              />
            </div>

            {/* Industry */}
            <div className="form-group">
              <label htmlFor="industry">Industry *</label>
              <input
                id="industry"
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                placeholder="e.g., Technology"
                required
                className="form-input"
              />
            </div>
          </div>

          {/* Website and Logo */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="logo">Company Logo (Image)</label>
              <input
                id="logo"
                type="file"
                name="logo"
                accept="image/*"
                onChange={handleFileChange}
                className="form-input"
                style={{ padding: '8px' }}
              />
              {company?.logo && !formData.logoFile && (
                <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                  Current logo: {typeof company.logo === 'string' ? company.logo.split('/').pop() : 'Uploaded'}
                </small>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter company description"
              required
              className="form-textarea"
              rows="6"
            ></textarea>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Company'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditCompanyModal;
