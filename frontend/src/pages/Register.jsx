/**
 * Register Page — New customer registration.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import './AuthPages.css';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone_number: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [emailExists, setEmailExists] = useState(false);
  const [phoneExists, setPhoneExists] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [formErrors, setFormErrors] = useState({ name: '', email: '', phone_number: '', password: '', confirmPassword: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    let errors = { ...formErrors };

    if (name === 'name') {
      // Name: no digits or special characters allowed in the input
      if (/[^a-zA-Z\s]/.test(value)) {
        errors.name = 'Name should only contain letters and spaces.';
      } else {
        errors.name = '';
      }
      // Forcefully strip invalid characters so they don't appear in the input field
      newValue = value.replace(/[^a-zA-Z\s]/g, '');
    }

    if (name === 'phone_number') {
      // Phone: strict 10 digits, no text or special chars
      if (/\D/.test(value)) {
        errors.phone_number = 'Phone number can only contain digits.';
      } else if (value.replace(/\D/g, '').length > 0 && value.replace(/\D/g, '').length < 10) {
        errors.phone_number = 'Phone number must be exactly 10 digits.';
      } else {
        errors.phone_number = '';
      }
      
      // Forcefully strip invalid characters
      newValue = value.replace(/\D/g, '');
      if (newValue.length > 10) {
        newValue = newValue.slice(0, 10);
      }
    }

    if (name === 'email') {
      // Email: must contain @
      if (value.length > 0 && !value.includes('@')) {
        errors.email = 'Email must contain the "@" symbol.';
      } else {
        errors.email = '';
      }
    }

    if (name === 'password') {
      if (value.length > 0) {
        if (value.length < 8) {
          errors.password = 'Password must be at least 8 characters.';
        } else if (!/[A-Z]/.test(value)) {
          errors.password = 'Password must contain at least one uppercase letter.';
        } else if (!/\d/.test(value)) {
          errors.password = 'Password must contain at least one digit.';
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          errors.password = 'Password must contain at least one special character.';
        } else {
          errors.password = '';
        }
      } else {
        errors.password = '';
      }
      
      // Also check confirm password if it's already typed
      if (form.confirmPassword && value !== form.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
      } else if (form.confirmPassword) {
        errors.confirmPassword = '';
      }
    }

    if (name === 'confirmPassword') {
      if (value.length > 0 && value !== form.password) {
        errors.confirmPassword = 'Passwords do not match.';
      } else {
        errors.confirmPassword = '';
      }
    }

    setFormErrors(errors);
    setForm({ ...form, [name]: newValue });
  };

  const validateForm = () => {
    // Name validation: No digits or special characters
    if (/[^a-zA-Z\s]/.test(form.name)) {
      setError('Name cannot contain digits or special characters.');
      return false;
    }
    // Phone validation: exactly 10 digits
    if (!/^\d{10}$/.test(form.phone_number)) {
      setError('Phone number must be exactly 10 digits.');
      return false;
    }
    // Email validation: must contain @
    if (!form.email.includes('@')) {
      setError('Invalid email address. Must contain "@".');
      return false;
    }
    // Password match
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    // Password length
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return false;
    }
    if (emailExists || phoneExists || formErrors.name || formErrors.phone_number || formErrors.email || formErrors.password || formErrors.confirmPassword) {
      setError('Please fix the validation errors before submitting.');
      return false;
    }
    return true;
  };

  const handlePreCheck = async () => {
    if (!form.email && !form.phone_number) return;
    try {
      const res = await axiosInstance.post('/accounts/check-exists/', {
        email: form.email,
        phone_number: form.phone_number
      });
      setEmailExists(res.data.email_exists);
      setPhoneExists(res.data.phone_exists);
      
      if (res.data.email_exists) setError('Email is already registered.');
      else if (res.data.phone_exists) setError('Phone number is already registered.');
      else setError(''); // clear error if all good
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // The register function in AuthContext will need to be updated to accept phone_number,
      // but for now we can just call the API directly here or assume it's updated.
      // Wait, let's use the updated API format directly or update AuthContext later.
      // Assuming register takes (name, email, password, phone_number)
      await register(form.name, form.email, form.password, form.phone_number);
      setSuccess('Account created! An email has been sent. Redirecting...');
      setTimeout(() => navigate('/jobs'), 2000);
    } catch (err) {
      const data = err.response?.data;
      if (data?.email) setError(data.email[0]);
      else if (data?.phone_number) setError(data.phone_number[0]);
      else if (data?.password) setError(data.password[0]);
      else setError(data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split-layout fade-in-up">
        <div className="auth-side-banner">
          <img src="/auth_illustration.png" alt="Join us" />
          <div className="banner-overlay">
            <h2>Welcome to our Community</h2>
            <p>Find your next career move with ease.</p>
          </div>
        </div>
        <div className="auth-side-form">
          <div className="auth-card">
            <div className="auth-header">
          <div className="auth-logo">🚀</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle text-secondary">Join Job Board and find your next opportunity</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name" name="name" type="text" className={`form-input ${formErrors.name ? 'input-error' : ''}`}
              placeholder="John Doe" value={form.name} onChange={handleChange} required
            />
            {formErrors.name && <span className="text-danger text-xs">{formErrors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone_number">Phone Number</label>
            <input
              id="phone_number" name="phone_number" type="tel" className={`form-input ${phoneExists || formErrors.phone_number ? 'input-error' : ''}`}
              placeholder="1234567890" value={form.phone_number} onChange={handleChange} onBlur={handlePreCheck} required
            />
            {formErrors.phone_number && <span className="text-danger text-xs">{formErrors.phone_number}</span>}
            {phoneExists && !formErrors.phone_number && <span className="text-danger text-xs">This phone number is already taken.</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email" name="email" type="email" className={`form-input ${emailExists || formErrors.email ? 'input-error' : ''}`}
              placeholder="you@example.com" value={form.email} onChange={handleChange} onBlur={handlePreCheck} required
            />
            {formErrors.email && <span className="text-danger text-xs">{formErrors.email}</span>}
            {emailExists && !formErrors.email && <span className="text-danger text-xs">This email is already taken.</span>}
          </div>

          <div className="form-group password-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="reg-password" name="password" type={showPassword ? "text" : "password"} className={`form-input ${formErrors.password ? 'input-error' : ''}`}
                placeholder="Min. 8 characters, uppercase, digit, special char" value={form.password} onChange={handleChange} required
              />
              <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {formErrors.password && <span className="text-danger text-xs">{formErrors.password}</span>}
          </div>

          <div className="form-group password-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword" name="confirmPassword" type={showConfirm ? "text" : "password"} className={`form-input ${formErrors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Re-enter your password" value={form.confirmPassword} onChange={handleChange} required
              />
              <button type="button" className="eye-btn" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>
            {formErrors.confirmPassword && <span className="text-danger text-xs">{formErrors.confirmPassword}</span>}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full btn-lg" 
            disabled={loading || emailExists || phoneExists || !!formErrors.name || !!formErrors.phone_number || !!formErrors.email || !!formErrors.password || !!formErrors.confirmPassword}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

          <p className="auth-footer text-secondary text-sm text-center">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Register;
