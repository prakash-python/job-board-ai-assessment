import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { COMPANY_ENDPOINTS, JOB_ENDPOINTS } from '../constants/apiConstants';
import CompanyCard from '../components/CompanyCard';
import EditCompanyModal from '../components/EditCompanyModal';
import { useAuth } from '../context/AuthContext';
import './Companies.css';

const INDUSTRIES = ["All Industries", "Technology", "Finance", "Healthcare", "Logistics", "Media", "Retail"];


const SALARY_RANGES = [
  { label: "All Salaries", min: 0, max: Infinity },
  { label: "0-5 LPA", min: 0, max: 500000 },
  { label: "5-10 LPA", min: 500000, max: 1000000 },
  { label: "10-20 LPA", min: 1000000, max: 2000000 },
  { label: "20+ LPA", min: 2000000, max: Infinity },
];

const DATE_RANGES = [
  { label: "All Time", days: Infinity },
  { label: "Recently Added (24h)", days: 1 },
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
];

const Companies = () => {
  const { user, isAdmin } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedSalary, setSelectedSalary] = useState(SALARY_RANGES[0]);
  const [selectedDate, setSelectedDate] = useState(DATE_RANGES[0]);
  const [locations, setLocations] = useState(["All Locations"]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get(JOB_ENDPOINTS.LOCATIONS);
        setLocations(["All Locations", ...res.data]);
      } catch (err) {
        console.error("Failed to fetch locations", err);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage
        };
        if (searchTerm) params.search = searchTerm;
        if (selectedIndustry !== 'All Industries') params.industry = selectedIndustry;
        if (selectedLocation !== 'All Locations') params.location = selectedLocation;
        if (selectedDate.days !== Infinity) params.date_added = selectedDate.days;

        const response = await api.get(COMPANY_ENDPOINTS.LIST, { params });
        
        const newCompanies = response.data.results || response.data;
        const count = response.data.count || response.data.length;

        if (currentPage === 1) {
          setCompanies(newCompanies);
        } else {
          setCompanies(prev => [...prev, ...newCompanies]);
        }
        setTotalCount(count);
      } catch (err) {
        setError(err.response?.data?.detail || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [searchTerm, selectedIndustry, selectedLocation, selectedDate, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedIndustry, selectedLocation, selectedSalary, selectedDate]);

  const filteredCompanies = companies;
  const hasMore = totalCount > companies.length;

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedIndustry('All Industries');
    setSelectedLocation('All Locations');
    setSelectedSalary(SALARY_RANGES[0]);
    setSelectedDate(DATE_RANGES[0]);
  };

  // Edit handler
  const handleEditCompany = (company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  // Edit success handler
  const handleEditSuccess = (updatedCompany) => {
    // Update the company in the list
    setCompanies(prev =>
      prev.map(c => c.id === updatedCompany.id ? updatedCompany : c)
    );
  };

  // Delete handler
  const handleDeleteCompany = async (companyId) => {
    setDeleteLoading(true);
    try {
      await api.delete(COMPANY_ENDPOINTS.DETAIL(companyId));
      // Remove company from list
      setCompanies(prev => prev.filter(c => c.id !== companyId));
      // Show success message
      alert('Company deleted successfully');
    } catch (err) {
      alert(`Failed to delete company: ${err.response?.data?.detail || err.message}`);
      console.error('Delete error:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className={`companies-page fade-in-up container ${!user ? 'public-page-padding' : ''}`}>
      <div className="companies-header">
        <h1>Discover Companies</h1>
        <p className="text-secondary">Find your next great workplace from our curated list of top employers.</p>
      </div>

      {/* Filter Bar */}
      <div className="companies-filter-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search companies..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-search-input"
          />
        </div>

        <div className="filter-dropdowns">
          <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="filter-select">
            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>

          <select value={selectedIndustry} onChange={(e) => setSelectedIndustry(e.target.value)} className="filter-select">
            {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
          </select>

          <select value={selectedSalary.label} onChange={(e) => setSelectedSalary(SALARY_RANGES.find(s => s.label === e.target.value))} className="filter-select">
            {SALARY_RANGES.map(sal => <option key={sal.label} value={sal.label}>{sal.label}</option>)}
          </select>

          <select value={selectedDate.label} onChange={(e) => setSelectedDate(DATE_RANGES.find(d => d.label === e.target.value))} className="filter-select">
            {DATE_RANGES.map(date => <option key={date.label} value={date.label}>{date.label}</option>)}
          </select>
        </div>
      </div>

      <div className="companies-results-header">
        <p>Showing {filteredCompanies.length} companies</p>
      </div>

      {/* Grid */}
      {loading && currentPage === 1 ? (
        <div className="companies-grid">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{height: '320px', borderRadius: '16px'}}></div>)}
        </div>
      ) : filteredCompanies.length === 0 && !loading ? (
        <div className="empty-state">
          <span className="empty-icon">🏢</span>
          <h3>No companies found</h3>
          <p>Try adjusting your filters or search term to find what you're looking for.</p>
          <button className="btn btn-primary mt-3" style={{display: 'inline-block', marginTop: '16px'}} onClick={handleClearFilters}>Clear Filters</button>
        </div>
      ) : (
        <>
          <div className="companies-grid">
            {filteredCompanies.map(company => (
              <CompanyCard
                key={company.id}
                company={company}
                onEdit={handleEditCompany}
                onDelete={handleDeleteCompany}
              />
            ))}
          </div>
          
          {hasMore && (
            <div className="load-more-container text-center" style={{marginTop: '40px', display: 'flex', justifyContent: 'center'}}>
              <button 
                className="btn btn-secondary btn-lg" 
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More Companies'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Edit Company Modal */}
      <EditCompanyModal
        company={selectedCompany}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCompany(null);
        }}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default Companies;
