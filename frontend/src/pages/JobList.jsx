/**
 * JobList Page — Browse all active job postings.
 */

import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { JOB_ENDPOINTS } from '../constants/apiConstants';
import JobCard from '../components/JobCard';
import './JobList.css';

const JOB_TYPES = ['All', 'full-time', 'part-time', 'contract', 'remote', 'internship'];

const JobList = () => {
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
        // Note: Date filter isn't directly supported by backend yet, so we filter it in frontend below.
        
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

  // Filter jobs whenever search or date changes
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
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Hero Section */}
        <div className="jobs-hero fade-in-up">
          <h1 className="jobs-hero-title">
            Find Your <span className="text-gradient">Dream Job</span>
          </h1>
          <p className="jobs-hero-sub text-secondary">
            {jobs.length} opportunities waiting for you
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="jobs-toolbar card fade-in-up fade-in-up-delay-1">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              id="job-search"
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
              {JOB_TYPES.filter(t => t !== 'All').map((type) => (
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
              {/* Add more locations dynamically if needed */}
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

        {/* Results count */}
        <div className="results-info fade-in-up fade-in-up-delay-2">
          <span className="text-muted text-sm">
            Showing <strong>{filtered.length}</strong> of <strong>{jobs.length}</strong> jobs
          </span>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Job Grid */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔎</div>
            <h3>No jobs found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid-2">
            {filtered.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobList;
