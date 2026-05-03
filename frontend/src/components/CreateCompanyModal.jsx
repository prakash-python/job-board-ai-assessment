import { useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/api';
import { COMPANY_ENDPOINTS } from '../constants/apiConstants';

const CreateCompanyModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: '',
    location: '',
    description: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('location', form.location);
    formData.append('description', form.description);
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    try {
      const res = await api.post(COMPANY_ENDPOINTS.LIST, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onSuccess(res.data);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create company. Please check the details.');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="modal-overlay" style={{ zIndex: 3000 }}>
      <div className="modal-container" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🏢 Add New Company</h3>
          <button className="close-modal-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="alert alert-error mb-4">{error}</div>}
          
          <div className="form-group-modern">
            <label>Company Name <span style={{ color: '#ef4444' }}>*</span></label>
            <input 
              type="text" 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              required 
              placeholder="e.g. Acme Corp" 
            />
          </div>

          <div className="form-group-modern">
            <label>Location <span style={{ color: '#ef4444' }}>*</span></label>
            <input 
              type="text" 
              name="location" 
              value={form.location} 
              onChange={handleChange} 
              required 
              placeholder="e.g. San Francisco, CA" 
            />
          </div>

          <div className="form-group-modern">
            <label>Company Logo (Optional)</label>
            <div className="file-upload-wrapper">
              <input 
                type="file" 
                name="logo" 
                id="logo-upload"
                accept="image/*"
                onChange={handleFileChange} 
                style={{ display: 'none' }}
              />
              {!logoPreview ? (
                <label htmlFor="logo-upload" className="custom-file-upload">
                  <span>📁 Click to upload logo</span>
                  <div className="upload-hint">JPG, PNG, SVG (Max 2MB)</div>
                </label>
              ) : (
                <div className="logo-preview-container">
                  <img src={logoPreview} alt="Logo preview" className="logo-preview" />
                  <div className="preview-overlay">
                    <button type="button" className="change-logo-btn" onClick={() => document.getElementById('logo-upload').click()}>Change</button>
                    <button type="button" className="remove-logo-btn" onClick={() => { setLogoFile(null); setLogoPreview(null); }}>Remove</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-group-modern">
            <label>Description <span style={{ color: '#ef4444' }}>*</span></label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              rows="4" 
              required 
              placeholder="Briefly describe the company..." 
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creating...' : 'Create Company'}
            </button>
          </div>
        </form>
        <style>{`
          .file-upload-wrapper {
            margin-top: 8px;
          }
          .custom-file-upload {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            padding: 24px;
            background: rgba(255, 255, 255, 0.03);
            border: 2px dashed rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-top: 8px;
          }
          .custom-file-upload:hover {
            background: rgba(255, 255, 255, 0.06);
            border-color: var(--color-primary);
          }
          .custom-file-upload span {
            color: #fff;
            font-weight: 600;
            margin-bottom: 4px;
          }
          .upload-hint {
            font-size: 0.75rem;
            color: #64748b;
          }
          .logo-preview-container {
            margin-top: 12px;
            position: relative;
            width: 100%;
            height: 120px;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: #fff;
          }
          .logo-preview {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          .preview-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            opacity: 0;
            transition: opacity 0.2s ease;
          }
          .logo-preview-container:hover .preview-overlay {
            opacity: 1;
          }
          .change-logo-btn, .remove-logo-btn {
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: transform 0.2s ease;
          }
          .change-logo-btn {
            background: var(--color-primary);
            color: white;
          }
          .remove-logo-btn {
            background: #ef4444;
            color: white;
          }
          .change-logo-btn:hover, .remove-logo-btn:hover {
            transform: scale(1.05);
          }
        `}</style>
      </div>
    </div>,
    document.body
  );
};

export default CreateCompanyModal;
