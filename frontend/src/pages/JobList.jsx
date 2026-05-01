import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { JOB_ENDPOINTS } from '../constants/apiConstants';
import JobCard from '../components/JobCard';
import './JobList.css';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const WORKPLACE_TYPES = ['Remote', 'Hybrid', 'Onsite'];
const EXPERIENCE_LEVELS = ['Entry', 'Mid', 'Senior', 'Lead'];
const SALARY_RANGES = [
  { label: 'Any', value: 0 },
  { label: '$50k+', value: 50000 },
  { label: '$100k+', value: 100000 },
  { label: '$150k+', value: 150000 },
];

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter States
  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedWorkplace, setSelectedWorkplace] = useState([]);
  const [selectedSalary, setSelectedSalary] = useState(0);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axiosInstance.get(JOB_ENDPOINTS.LIST);
        setJobs(res.data);
        setFiltered(res.data);
      } catch {
        setError('Failed to load jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    let result = jobs;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(j => 
        j.title.toLowerCase().includes(q) || 
        j.company.toLowerCase().includes(q)
      );
    }
    if (selectedTypes.length > 0) {
      result = result.filter(j => selectedTypes.includes(j.job_type_display || j.job_type));
    }
    if (selectedSalary > 0) {
      result = result.filter(j => {
        const matches = j.salary_range?.match(/(\d+)/g);
        if (matches) {
          const maxSalary = Math.max(...matches.map(m => parseInt(m) * 1000));
          return maxSalary >= selectedSalary;
        }
        return true;
      });
    }
    setFiltered(result);
  }, [search, selectedTypes, selectedSalary, jobs]);

  const toggleFilter = (setFn, list, item) => {
    if (list.includes(item)) {
      setFn(list.filter(i => i !== item));
    } else {
      setFn([...list, item]);
    }
  };

  return (
    <div className="jobs-page-container fade-in">
      <div className="container">
        <div className="jobs-page-header">
          <h1 className="page-title">Browse Jobs</h1>
          <p className="results-count">{filtered.length} positions available</p>
        </div>

        <div className="jobs-layout">
          {/* Sidebar Filters */}
          <aside className="jobs-sidebar">
            <div className="filter-section">
              <h3>Search</h3>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Title, keyword..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-section">
              <h3>Job Type</h3>
              <div className="checkbox-group">
                {JOB_TYPES.map(type => (
                  <label key={type} className="checkbox-item">
                    <input 
                      type="checkbox" 
                      checked={selectedTypes.includes(type)}
                      onChange={() => toggleFilter(setSelectedTypes, selectedTypes, type)}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h3>Salary Range</h3>
              <div className="salary-pills">
                {SALARY_RANGES.map(range => (
                  <button 
                    key={range.label}
                    className={`salary-pill ${selectedSalary === range.value ? 'active' : ''}`}
                    onClick={() => setSelectedSalary(range.value)}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="jobs-main">
            {loading ? (
              <div className="jobs-grid">
                {[1, 2, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{height: '320px', borderRadius: '20px'}}></div>)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-results">
                <span className="empty-icon">🔎</span>
                <h3>No jobs found matching your criteria</h3>
                <p>Try clearing your filters or searching for something else.</p>
              </div>
            ) : (
              <div className="jobs-grid">
                {filtered.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default JobList;
