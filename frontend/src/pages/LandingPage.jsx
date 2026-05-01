import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import JobCard from '../components/JobCard';
import './LandingPage.css';

const LandingPage = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const response = await axiosInstance.get('/jobs/');
        setFeaturedJobs(response.data.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch featured jobs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedJobs();
  }, []);

  const categories = [
    { name: 'Technology', count: '12,480 jobs', icon: '💻' },
    { name: 'Marketing', count: '3,210 jobs', icon: '📈' },
    { name: 'Design', count: '1,920 jobs', icon: '🎨' },
    { name: 'Finance', count: '2,845 jobs', icon: '💰' },
    { name: 'Healthcare', count: '4,500 jobs', icon: '🩺' },
    { name: 'Engineering', count: '3,800 jobs', icon: '⚙️' },
  ];

  return (
    <div className="landing-container fade-in">
      {/* Hero Section */}
      <section className="hero-premium">
        <div className="container hero-inner">
          <div className="hero-pill">
            🚀 Powered by Advanced AI Matching
          </div>
          <h1 className="hero-title">
            Find Your <span className="text-gradient">Dream Job</span> Faster with AI
          </h1>
          <p className="hero-subtitle">
            The modern platform for the next generation of talent. Get matched with high-growth companies in seconds using our proprietary matching algorithm.
          </p>
          <div className="hero-cta">
            <Link to="/jobs" className="btn btn-primary">Explore Jobs</Link>
            <Link to="/post-job" className="btn btn-ghost">Post a Job</Link>
          </div>
        </div>
      </section>

      {/* Featured Roles */}
      <section id="jobs" className="featured-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Hand-picked</span>
            <h2 className="section-title">Featured Opportunities</h2>
            <p className="section-subtitle">The most exciting roles from top-tier tech companies.</p>
          </div>
          
          <div className="featured-grid">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="skeleton" style={{height: '300px', borderRadius: '20px'}}></div>)
            ) : (
              featuredJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="category-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Discover</span>
            <h2 className="section-title">Browse by Industry</h2>
          </div>
          <div className="category-grid">
            {categories.map((cat, i) => (
              <div key={i} className="category-card">
                <span className="category-icon">{cat.icon}</span>
                <h3 className="category-name">{cat.name}</h3>
                <p className="category-count">{cat.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Success Stories</span>
            <h2 className="section-title">Trusted by Professionals</h2>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p className="testimonial-text">"Hireloop completely changed how I look for work. The AI suggestions were spot on and I landed my current role at Stripe within 2 weeks."</p>
              <div className="testimonial-author">
                <div className="author-avatar"></div>
                <div>
                  <h4 className="author-name">Alex Rivera</h4>
                  <p className="author-role">Senior Frontend Engineer</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">"The best job board experience I've had in years. Sleek, fast, and high-quality listings. Highly recommended for any tech professional."</p>
              <div className="testimonial-author">
                <div className="author-avatar" style={{background: 'var(--color-cyan)'}}></div>
                <div>
                  <h4 className="author-name">Sarah Jenkins</h4>
                  <p className="author-role">Product Designer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
