import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { AUTH_ENDPOINTS } from '../constants/apiConstants';
import './AuthPages.css';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    role: 'customer'
  });
  
  const [formErrors, setFormErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [userExistsError, setUserExistsError] = useState('');
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

  const debounceTimer = useRef(null);

  const validateFullName = (name) => {
    if (!name) return "Full Name is required";
    if (!/^[a-zA-Z\s]+$/.test(name)) return "Name should contain only letters";
    return "";
  };

  const validateEmail = (email) => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address";
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone) return "Phone number is required";
    if (!/^\d{10}$/.test(phone)) return "Enter a valid 10-digit phone number";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
    if (!regex.test(password)) return "Password must be 8+ characters, include uppercase, number, and special character";
    return "";
  };

  const validateConfirmPassword = (confirm, password) => {
    if (!confirm) return "Confirm Password is required";
    if (confirm !== password) return "Passwords do not match";
    return "";
  };

  const validateField = (name, value, currentData) => {
    switch (name) {
      case 'fullName': return validateFullName(value);
      case 'email': return validateEmail(value);
      case 'phone': return validatePhone(value);
      case 'password': 
        if (currentData.confirm_password) {
          setFormErrors(prev => ({ 
            ...prev, 
            confirm_password: validateConfirmPassword(currentData.confirm_password, value) 
          }));
        }
        return validatePassword(value);
      case 'confirm_password': return validateConfirmPassword(value, currentData.password);
      default: return "";
    }
  };

  const checkUserExists = async (email, phone) => {
    if (!email || !phone) return;
    if (validateEmail(email) || validatePhone(phone)) return;
    
    setIsCheckingUser(true);
    try {
      const res = await api.post(AUTH_ENDPOINTS.CHECK_EXISTS || '/accounts/check-exists/', { email, phone_number: phone });
      if (res.data?.email_exists || res.data?.phone_exists) {
        setUserExistsError("Account with this email or phone already exists.");
      } else {
        setUserExistsError('');
      }
    } catch (err) {
      setUserExistsError('');
    } finally {
      setIsCheckingUser(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'fullName') {
      // Restrict input to letters and spaces only
      newValue = value.replace(/[^a-zA-Z\s]/g, '');
    } else if (name === 'phone') {
      // Restrict input to digits only, max 10 characters
      newValue = value.replace(/\D/g, '').slice(0, 10);
    }
    
    setFormData(prev => {
      const newData = { ...prev, [name]: newValue };
      const errorMsg = validateField(name, newValue, newData);
      setFormErrors(errors => ({ ...errors, [name]: errorMsg }));
      
      // Clear global user exists error when user modifies email or phone
      if (name === 'email' || name === 'phone') {
        setUserExistsError('');
      }
      
      return newData;
    });
  };

  useEffect(() => {
    if (formData.email && formData.phone) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      
      debounceTimer.current = setTimeout(() => {
        checkUserExists(formData.email, formData.phone);
      }, 800);
    }
    
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [formData.email, formData.phone]);

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const errorMsg = validateField(name, value, formData);
    setFormErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const isFormValid = () => {
    const errors = {
      fullName: validateFullName(formData.fullName),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
      password: validatePassword(formData.password),
      confirm_password: validateConfirmPassword(formData.confirm_password, formData.password)
    };
    
    setFormErrors(errors);
    return Object.values(errors).every(err => err === '') && !userExistsError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) return;
    if (isCheckingUser) return;
    
    setError('');
    setIsLoading(true);
    try {
      await api.post(AUTH_ENDPOINTS.REGISTER, {
        email: formData.email,
        name: formData.fullName,
        phone_number: formData.phone,
        password: formData.password,
        role: formData.role
      });
      navigate('/signin');
    } catch (err) {
      const errorData = err.response?.data;
      if (typeof errorData === 'object' && !Array.isArray(errorData)) {
        // Map backend field errors to formErrors
        const newErrors = { ...formErrors };
        let generalError = '';

        Object.keys(errorData).forEach(field => {
          const msg = Array.isArray(errorData[field]) ? errorData[field][0] : errorData[field];
          if (field === 'email') newErrors.email = msg;
          else if (field === 'phone_number') newErrors.phone = msg;
          else if (field === 'name') newErrors.fullName = msg;
          else if (field === 'password') newErrors.password = msg;
          else generalError = msg;
        });

        setFormErrors(newErrors);
        if (generalError) setError(generalError);
      } else {
        setError(errorData?.detail || errorData || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper fade-in">
      <div className="auth-image-side" style={{backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.8)), url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2070')"}}>
        <div className="auth-image-content">
          <h2>Start your journey with Hireloop.</h2>
          <p>Create an account and get instant access to premium job listings, AI career advice, and simplified application tracking.</p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card-premium">
          <div className="auth-header">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join the next generation of top-tier talent</p>
          </div>

          {error && <div className="alert alert-error mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Full Name <span style={{color: '#ef4444'}}>*</span></label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input 
                  type="text" 
                  name="fullName"
                  className={`input-field ${formErrors.fullName ? 'is-invalid' : ''}`}
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required 
                />
              </div>
              {formErrors.fullName && <div className="input-error-msg">{formErrors.fullName}</div>}
            </div>

            <div className="form-group">
              <label>Email Address <span style={{color: '#ef4444'}}>*</span></label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input 
                  type="email" 
                  name="email"
                  className={`input-field ${formErrors.email || userExistsError ? 'is-invalid' : ''}`}
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required 
                />
              </div>
              {formErrors.email && <div className="input-error-msg">{formErrors.email}</div>}
            </div>

            <div className="form-group">
              <label>Phone Number <span style={{color: '#ef4444'}}>*</span></label>
              <div className="input-wrapper">
                <span className="input-icon">📞</span>
                <input 
                  type="tel" 
                  name="phone"
                  className={`input-field ${formErrors.phone || userExistsError ? 'is-invalid' : ''}`}
                  placeholder="1234567890"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required 
                />
              </div>
              {formErrors.phone && <div className="input-error-msg">{formErrors.phone}</div>}
            </div>

            {userExistsError && <div className="input-error-msg" style={{marginTop: '-10px', marginBottom: '5px'}}>{userExistsError}</div>}

            <div className="form-group">
              <label>Password <span style={{color: '#ef4444'}}>*</span></label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  className={`input-field ${formErrors.password ? 'is-invalid' : ''}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
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
              {formErrors.password && <div className="input-error-msg">{formErrors.password}</div>}
            </div>

            <div className="form-group">
              <label>Confirm Password <span style={{color: '#ef4444'}}>*</span></label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="confirm_password"
                  className={`input-field ${formErrors.confirm_password ? 'is-invalid' : ''}`}
                  placeholder="••••••••"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required 
                />
              </div>
              {formErrors.confirm_password && <div className="input-error-msg">{formErrors.confirm_password}</div>}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isLoading || isCheckingUser || userExistsError !== '' || Object.values(formErrors).some(err => err !== '')}
            >
              {isLoading ? (
                <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                  <span className="spinner" style={{width: '16px', height: '16px', borderWidth: '2px'}}></span> 
                  Creating Account...
                </span>
              ) : isCheckingUser ? (
                'Checking details...'
              ) : (
                'Sign Up'
              )}
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
            Already have an account? <Link to="/signin" className="auth-link">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
