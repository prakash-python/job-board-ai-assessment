import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/api';
import { JOB_ENDPOINTS, COMPANY_ENDPOINTS } from '../constants/apiConstants';
import JobCard from '../components/JobCard';
import './JobList.css';

const JOB_TYPES = ["All Types", "Full Time", "Part Time", "Contract", "Remote", "Internship"];

const SALARY_RANGES = [
  { label: "All Salaries", min: "", max: "" },
  { label: "0-5 LPA", min: "0", max: "500000" },
  { label: "5-10 LPA", min: "500000", max: "1000000" },
  { label: "10-20 LPA", min: "1000000", max: "2000000" },
  { label: "20+ LPA", min: "2000000", max: "" },
];
const DATE_RANGES = [
  { label: "All Time", value: "" },
  { label: "Last 24 Hours", value: "24h" },
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
];

const JobList = () => {
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get('company_id');

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedSalary, setSelectedSalary] = useState(SALARY_RANGES[0]);
  const [selectedDate, setSelectedDate] = useState(DATE_RANGES[0]);

  const [locations, setLocations] = useState(["All Locations"]);

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

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
      };
      if (searchTerm) params.search = searchTerm;
      if (selectedType !== 'All Types') {
         const typeMap = {
           "Full Time": "full-time",
           "Part Time": "part-time",
           "Contract": "contract",
           "Remote": "remote",
           "Internship": "internship"
         };
         params.job_type = typeMap[selectedType];
      }
      if (selectedLocation !== 'All Locations') params.location = selectedLocation;
      if (selectedSalary.min) params.min_salary = selectedSalary.min;
      if (selectedSalary.max) params.max_salary = selectedSalary.max;
      if (selectedDate.value) params.date_posted = selectedDate.value;

      const endpoint = companyId ? COMPANY_ENDPOINTS.JOBS(companyId) : JOB_ENDPOINTS.LIST;
      const res = await api.get(endpoint, { params });
      
      const newJobs = res.data.results || res.data;
      const count = res.data.count || res.data.length;

      if (currentPage === 1) {
        setJobs(newJobs);
      } else {
        setJobs(prev => [...prev, ...newJobs]);
      }
      
      setTotalCount(count);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [companyId, searchTerm, selectedType, selectedLocation, selectedSalary, selectedDate, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedLocation, selectedSalary, selectedDate]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedType('All Types');
    setSelectedLocation('All Locations');
    setSelectedSalary(SALARY_RANGES[0]);
    setSelectedDate(DATE_RANGES[0]);
  };

  return (
    <div className="jobs-listing-page fade-in-up">
      <div className="jobs-header">
        <h1>{companyId ? 'Company Jobs' : 'Explore Jobs'}</h1>
        <p className="text-secondary">Find your next role at top companies worldwide.</p>
      </div>

      <div className="jobs-filter-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search job title, keywords..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-search-input"
          />
        </div>

        <div className="filter-dropdowns">
          <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="filter-select">
            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>

          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="filter-select">
            {JOB_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>

          <select value={selectedSalary.label} onChange={(e) => setSelectedSalary(SALARY_RANGES.find(s => s.label === e.target.value))} className="filter-select">
            {SALARY_RANGES.map(sal => <option key={sal.label} value={sal.label}>{sal.label}</option>)}
          </select>

          <select value={selectedDate.label} onChange={(e) => setSelectedDate(DATE_RANGES.find(d => d.label === e.target.value))} className="filter-select">
            {DATE_RANGES.map(date => <option key={date.label} value={date.label}>{date.label}</option>)}
          </select>
        </div>
      </div>

      <div className="jobs-results-header">
        <p>Showing {jobs.length} of {totalCount} jobs</p>
      </div>

      {loading && currentPage === 1 ? (
        <div className="jobs-grid">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{height: '320px', borderRadius: '16px'}}></div>)}
        </div>
      ) : jobs.length === 0 && !loading ? (
        <div className="empty-state">
          <span className="empty-icon">🔎</span>
          <h3>No jobs found</h3>
          <p>Try adjusting your filters or search term to find what you're looking for.</p>
          <button className="btn btn-primary mt-3" style={{display: 'inline-block', marginTop: '16px'}} onClick={handleClearFilters}>Clear Filters</button>
        </div>
      ) : (
        <>
          <div className="jobs-grid">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {totalCount > jobs.length && (
            <div className="load-more-container">
              <button 
                className="btn btn-primary" 
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More Jobs'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JobList;
