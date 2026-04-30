/**
 * JobPortal Component — Displays the full job listing with search and filters.
 * Designed to be used within the LandingPage or as a standalone section.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { JOB_ENDPOINTS } from '../constants/apiConstants';
import JobCard from './JobCard';
import '../pages/JobList.css'; // Reusing styles

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'remote', 'internship'];

const JobPortal = () => {
  const [jobs, setJobs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        let url = JOB_ENDPOINTS.LIST;
        const params = new URLSearchParams();
        if (locationFilter) params.append('location', locationFilter);
        if (typeFilter) params.append('job_type', typeFilter);
        
        const res = await axiosInstance.get(`${url}?${params.toString()}`);
        setJobs(res.data);
        setFiltered(res.data);
      } catch {
        setError('Failed to load jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [locationFilter, typeFilter]);

  useEffect(() => {
    let result = jobs;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q)
      );
    }
    
    if (dateFilter) {
      const today = new Date();
      result = result.filter(j => {
        const jobDate = new Date(j.created_at);
        const diffTime = today - jobDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        if (dateFilter === '1') return diffDays <= 1;
        if (dateFilter === '7') return diffDays <= 7;
        if (dateFilter === '30') return diffDays <= 30;
        return true;
      });
    }
    
    setFiltered(result);
  }, [search, jobs, dateFilter]);

  if (loading) {
    return (
      <div id="jobs" className="job-portal-section">
        <div className="section-header text-center">
          <h2 className="jobs-hero-title">Latest <span className="text-gradient">Opportunities</span></h2>
        </div>
        <div className="featured-grid">
          {[1, 2, 3, 4].map(i => <div key={i} className="job-skeleton card" />)}
        </div>
      </div>
    );
  }

  return (
    <div id="jobs" className="job-portal-section">
      <div className="section-header portal-header">
        <div className="header-text">
          <h2 className="jobs-hero-title">
            Latest <span className="text-gradient">Opportunities</span>
          </h2>
          <p className="jobs-hero-sub text-secondary">
            {jobs.length} opportunities waiting for you
          </p>
        </div>
        <Link to="/jobs" className="btn btn-ghost">View All Jobs &rarr;</Link>
      </div>

      <div className="jobs-toolbar card fade-in-up">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, company, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
        <div className="type-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select 
            className="form-input" 
            style={{ width: 'auto' }} 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            {JOB_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select 
            className="form-input" 
            style={{ width: 'auto' }} 
            value={locationFilter} 
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="">All Locations</option>
            <option value="Remote">Remote</option>
            <option value="New York">New York</option>
            <option value="San Francisco">San Francisco</option>
            <option value="London">London</option>
          </select>

          <select 
            className="form-input" 
            style={{ width: 'auto' }} 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="">Any Time</option>
            <option value="1">Last 24 Hours</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        </div>
      </div>

      <div className="results-info fade-in-up">
        <span className="text-muted text-sm">
          Showing <strong>{filtered.length}</strong> of <strong>{jobs.length}</strong> jobs
        </span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No jobs found</h3>
          <p>Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="featured-grid">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

export default JobPortal;
