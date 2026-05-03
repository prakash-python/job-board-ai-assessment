import { useState, useRef, useEffect } from 'react';
import { getLogoUrl, getAvatarColor } from '../utils/formatters';

const CompanySelect = ({ companies = [], value, onChange, onAddNew }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [imageErrors, setImageErrors] = useState({});
  const dropdownRef = useRef(null);

  const safeCompanies = Array.isArray(companies) ? companies : [];
  const selectedCompany = safeCompanies.find(c => c.id === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const renderLogo = (company, size = 'sm') => {
    const hasError = imageErrors[company.id];
    const url = getLogoUrl(company.logo);

    if (url && !hasError) {
      return (
        <img 
          src={url} 
          alt="" 
          className={`select-logo-${size}`} 
          onError={() => handleImageError(company.id)} 
        />
      );
    }

    const initial = company.name?.charAt(0).toUpperCase() || '?';
    const bgColor = getAvatarColor(company.name);

    return (
      <div 
        className={`select-logo-${size} fallback-avatar`} 
        style={{ backgroundColor: bgColor }}
      >
        {initial}
      </div>
    );
  };

  const filteredCompanies = safeCompanies.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="custom-select-wrapper" ref={dropdownRef}>
      <div 
        className={`custom-select-trigger ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedCompany ? (
          <div className="selected-item">
            {renderLogo(selectedCompany)}
            <span>{selectedCompany.name}</span>
          </div>
        ) : (
          <span className="placeholder">Select Company</span>
        )}
        <span className="arrow">▾</span>
      </div>

      {isOpen && (
        <div className="custom-select-dropdown">
          <div className="select-search-box">
            <input
              type="text"
              placeholder="Search company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="select-options-list">
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map(company => (
                <div 
                  key={company.id} 
                  className={`select-option ${value === company.id ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(company.id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  {renderLogo(company)}
                  <span>{company.name}</span>
                </div>
              ))
            ) : (
              <div className="select-no-results">No company found</div>
            )}
            
            <div className="select-divider"></div>
            <div 
              className="select-option add-new-option" 
              onClick={() => {
                onAddNew();
                setIsOpen(false);
              }}
            >
              <span className="plus-icon">+</span>
              <span>Add New Company</span>
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .custom-select-wrapper {
          position: relative;
          width: 100%;
        }
        .custom-select-trigger {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 10px 14px;
          color: #e2e8f0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s;
          min-height: 42px;
        }
        .custom-select-trigger:hover, .custom-select-trigger.active {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.05);
        }
        .selected-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .select-logo-sm {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          object-fit: cover;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }
        .fallback-avatar {
          text-transform: uppercase;
          user-select: none;
        }
        .placeholder {
          color: #475569;
        }
        .custom-select-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
          z-index: 100;
          overflow: hidden;
          animation: slideDown 0.2s ease-out;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .select-search-box {
          padding: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .select-search-box input {
          width: 100%;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 8px 12px;
          color: white;
          font-size: 0.88rem;
          outline: none;
        }
        .select-search-box input:focus {
          border-color: #6366f1;
        }
        .select-options-list {
          max-height: 250px;
          overflow-y: auto;
        }
        .select-option {
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: background 0.15s;
          color: #cbd5e1;
          font-size: 0.9rem;
        }
        .select-option:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }
        .select-option.selected {
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          font-weight: 600;
        }
        .select-no-results {
          padding: 16px;
          text-align: center;
          color: #64748b;
          font-size: 0.88rem;
        }
        .select-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.05);
          margin: 4px 0;
        }
        .add-new-option {
          color: #6366f1;
          font-weight: 600;
        }
        .add-new-option:hover {
          background: rgba(99, 102, 241, 0.1);
        }
        .plus-icon {
          width: 20px;
          height: 20px;
          background: rgba(99, 102, 241, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }
      `}</style>
    </div>
  );
};

export default CompanySelect;
