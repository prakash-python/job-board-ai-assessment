import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-premium">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <div className="footer-logo">
              <div className="brand-logo-container">💼</div>
              <span className="brand-text">Hireloop</span>
            </div>
            <p>The modern job board built for ambitious people and the teams that hire them.</p>
            <div className="social-links">
              <span className="social-icon">𝕏</span>
              <span className="social-icon">LinkedIn</span>
              <span className="social-icon">GitHub</span>
            </div>
          </div>
          <div className="footer-links-col">
            <h4>Product</h4>
            <ul>
              <li><Link to="/jobs">Find Jobs</Link></li>
              <li><Link to="/companies">Companies</Link></li>
              <li><Link to="/categories">Categories</Link></li>
              <li><Link to="/salary">Salary Guide</Link></li>
            </ul>
          </div>
          <div className="footer-links-col">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/press">Press</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className="footer-links-col">
            <h4>Resources</h4>
            <ul>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Hireloop, Inc. All rights reserved.</p>
          <p>Made with care for job seekers and recruiters.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
