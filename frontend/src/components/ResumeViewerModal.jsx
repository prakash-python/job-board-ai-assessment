import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axiosInstance from '../api/axiosInstance';

const ResumeViewerModal = ({ fileUrl, userName = "Candidate", onClose }) => {
  const [blobUrl, setBlobUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  useEffect(() => {
    let url = '';
    if (fileUrl) {
      setLoading(true);
      setError(false);
      const fetchBlob = async () => {
        try {
          const res = await axiosInstance.get(fileUrl, { responseType: 'blob' });
          url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
          setBlobUrl(url);
        } catch {
          setError(true);
        } finally {
          setLoading(false);
        }
      };
      fetchBlob();
    } else {
      setError(true);
      setLoading(false);
    }
    return () => { if (url) window.URL.revokeObjectURL(url); };
  }, [fileUrl]);

  return createPortal(
    <div className="resume-modal-overlay" onClick={onClose}>
      <div className="resume-modal-container" onClick={e => e.stopPropagation()}>
        <div className="resume-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.2rem' }}>📄</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Resume</h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>{userName}</p>
            </div>
          </div>
          <button className="close-modal-btn" onClick={onClose}>✕</button>
        </div>
        <div className="resume-modal-body">
          {loading && (
            <div className="resume-fallback">
              <div className="spinner-small" style={{borderTopColor: '#6366f1', marginBottom: 16}} />
              <p style={{ margin: 0, fontWeight: 500 }}>Loading document securely...</p>
            </div>
          )}
          {error && (
            <div className="resume-fallback">
              <span style={{ fontSize: '2rem', marginBottom: 8 }}>⚠️</span>
              <p style={{ margin: 0, fontWeight: 500 }}>Could not load resume. The file may have been removed.</p>
            </div>
          )}
          {blobUrl && !error && (
            <iframe
              src={blobUrl}
              title="Resume Viewer"
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ResumeViewerModal;
