import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Auto-dismiss error after 10 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      window.location.href = '/dashboard';
    } catch (err) {
      console.error("Login error:", err.response?.data);
      const errorData = err.response?.data;
      if (typeof errorData === 'string') {
        setError(errorData);
      } else if (errorData?.detail) {
        setError(errorData.detail);
      } else if (errorData?.non_field_errors) {
        setError(errorData.non_field_errors[0]);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper fade-in">
      {/* Left side Form */}
      <div className="auth-form-side">
        <div className="auth-card-premium">
          <div className="auth-header">
            <h1 className="auth-title">Sign In</h1>
            <p className="auth-subtitle">Enter your credentials to access your account</p>
          </div>

          {error && <div className="alert alert-error mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address <span style={{color: '#ef4444'}}>*</span></label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input 
                  type="email" 
                  className="input-field"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <div className="auth-options">
                <label>Password <span style={{color: '#ef4444'}}>*</span></label>
                <Link to="/forgot-password" title="Coming soon!" className="forgot-password">Forgot Password?</Link>
              </div>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="social-auth">
            <div className="divider">
              <span>OR CONTINUE WITH</span>
            </div>
            <div className="social-btns-row">
              <button className="social-btn-premium">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                </svg>
                Google
              </button>
              <button className="social-btn-premium">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
                GitHub
              </button>
            </div>
          </div>

          <p className="auth-footer">
            Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link>
          </p>
        </div>
      </div>

      {/* Right side Image */}
      <div className="auth-image-side" style={{backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.3), rgba(15, 23, 42, 0.6)), url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2070')"}}>
        <div className="auth-image-content">
          <h2>Welcome back to the future of work.</h2>
          <p>Join thousands of professionals landing their dream roles at top-tier tech companies using AI-driven matching.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
