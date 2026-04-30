import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import JobCard from '../components/JobCard';
import JobPortal from '../components/JobPortal';
import './LandingPage.css';

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        // Small delay to ensure the component and its children (like JobPortal) have started rendering
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }
  }, [location.hash]);

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const response = await axiosInstance.get('/jobs/');
        // Take first 3 jobs as featured
        setFeaturedJobs(response.data.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch featured jobs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedJobs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Scroll to job portal and trigger search (JobPortal handles its own search now)
    const element = document.getElementById('jobs');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-wrapper">
      {/* Top Bar */}
      <div className="top-bar hide-mobile">
        <div className="container top-bar-inner">
          <div className="top-bar-info">
            <span>📞 Support: +1 (800) JOB-BOARD</span>
            <span>📧 contact@jobboard.ai</span>
          </div>
          <div className="top-bar-social">
            <span>Follow Us: 𝕏 | LinkedIn | FB</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero" style={{ backgroundImage: 'url(/hero_pro_bg.png)' }}>
        <div className="hero-overlay"></div>
        <div className="container hero-content fade-in-up">
          <div className="hero-badge fade-in-up">AI-DRIVEN JOB MATCHING</div>
          <h1 className="hero-title">Predict. Prevent. <br/><span className="text-gradient">Protect Your Career.</span></h1>
          <p className="hero-subtitle">
            Experience the future of hiring with AI-driven job matching and precision placement. 
            Trusted by 5,000+ global organizations for reliable talent acquisition.
          </p>
          <div className="search-container fade-in-up-delay-1">
            <form className="hero-search-form" onSubmit={handleSearch}>
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Enter role, skills or company name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="hero-search-input"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg">Find Jobs</button>
            </form>
          </div>
          <div className="hero-actions fade-in-up-delay-2">
            <a href="#jobs" className="btn btn-warning btn-lg btn-icon">Start Exploring &rarr;</a>
            <a href="#how-it-works" className="btn btn-outline-white btn-lg">How it Works</a>
          </div>
          <div className="scroll-indicator fade-in-up-delay-3">
            <a href="#jobs" className="scroll-arrow">
              <span></span>
              <span></span>
            </a>
          </div>
        </div>
      </section>

      {/* Stats / Why Us Section */}
      <section className="stats-section fade-in-up">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">10k+</span>
              <span className="stat-label">Active Jobs</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">5k+</span>
              <span className="stat-label">Companies</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">20k+</span>
              <span className="stat-label">Success Stories</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">User Satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="how-section fade-in-up">
        <div className="container">
          <div className="section-header text-center">
            <h2>How It Works</h2>
            <p className="text-secondary">Your journey to a new career in three simple steps.</p>
          </div>
          <div className="how-grid">
            <div className="how-item card">
              <div className="how-icon">📝</div>
              <h3>Create Profile</h3>
              <p className="text-secondary">Set up your professional profile and upload your resume to stand out.</p>
            </div>
            <div className="how-item card">
              <div className="how-icon">🔍</div>
              <h3>Search Jobs</h3>
              <p className="text-secondary">Use advanced filters to find the roles that match your skills perfectly.</p>
            </div>
            <div className="how-item card">
              <div className="how-icon">🚀</div>
              <h3>Apply & Succeed</h3>
              <p className="text-secondary">Apply with one click and track your application status in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Full Job Portal Section */}
      <section id="jobs" className="featured-section fade-in-up">
        <div className="container">
          <JobPortal />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section fade-in-up fade-in-up-delay-1">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <h2>About Job Board</h2>
              <p>
                We are a premier platform bridging the gap between exceptional talent and outstanding 
                organizations. Our mission is to make the job search process as seamless, transparent, 
                and efficient as possible.
              </p>
              <p>
                With advanced filters, secure profiles, and real-time application tracking, we empower 
                you to take control of your career journey.
              </p>
            </div>
            <div className="about-image">
              <img src="/platform_preview.png" alt="Platform Preview" className="platform-preview-img" style={{
                width: '100%',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--color-border)'
              }} />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section fade-in-up fade-in-up-delay-2">
        <div className="container">
          <div className="contact-split-grid">
            <div className="contact-image-container hide-mobile">
              <img src="/contact_illustration.png" alt="Get in touch" className="contact-illustration" />
            </div>
            <div className="contact-card card">
              <h2>Get in Touch</h2>
              <p className="text-secondary">Have questions or need support? Reach out to us.</p>
              <form className="contact-form" onSubmit={(e) => { e.preventDefault(); alert("Message sent!"); }}>
                <div className="form-group">
                  <input type="text" className="form-input" placeholder="Your Name" required />
                </div>
                <div className="form-group">
                  <input type="email" className="form-input" placeholder="Your Email" required />
                </div>
                <div className="form-group">
                  <textarea className="form-input" placeholder="Your Message" rows="4" required></textarea>
                </div>
                <button type="submit" className="btn btn-primary btn-full btn-lg">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col-brand">
              <Link to="/" className="footer-logo">
                <span className="logo-icon">💼</span>
                <span className="logo-text">JobBoard</span>
              </Link>
              <p className="footer-tagline">
                The most reliable platform for career growth and exceptional hiring.
              </p>
              <div className="social-links">
                <span>𝕏</span> <span>LinkedIn</span> <span>FB</span>
              </div>
            </div>
            
            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="/#jobs">Browse Jobs</a></li>
                <li><a href="/#about">About Us</a></li>
                <li><a href="/#contact">Contact</a></li>
                <li><Link to="/register">Create Account</Link></li>
              </ul>
            </div>
            
            <div className="footer-col">
              <h4>Resources</h4>
              <ul>
                <li><a href="#">Career Blog</a></li>
                <li><a href="#">Salary Guide</a></li>
                <li><a href="#">Resume Tips</a></li>
                <li><a href="#">Hiring Guide</a></li>
              </ul>
            </div>
            
            <div className="footer-col">
              <h4>Support</h4>
              <ul>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} JobBoard. Built with ❤️ for professionals.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
