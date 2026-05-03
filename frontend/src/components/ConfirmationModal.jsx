import React from 'react';

const ConfirmationModal = ({ 
  show, 
  title = "Confirm Action", 
  message = "Are you sure you want to perform this action? This cannot be undone.", 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  onConfirm, 
  onCancel,
  variant = "danger" // "danger" or "primary"
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '450px' }}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-modal-btn" onClick={onCancel}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ color: '#cbd5e1', marginBottom: '24px' }}>
            {message}
          </p>
          <div className="form-actions">
            <button 
              className="close-modal-btn" 
              style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 20px' }}
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button 
              className="btn btn-primary" 
              style={{ 
                background: variant === 'danger' ? '#ef4444' : '#6366f1', 
                border: 'none', 
                padding: '10px 24px' 
              }}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
