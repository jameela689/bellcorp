import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setSuccessMessage('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Call signup API
      const response = await axios.post('https://bellcorp.onrender.com/api/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      // Success
      if (response.data.success) {
        setSuccessMessage('Account created successfully! Redirecting...');
        
        // Store token (optional - if you want auto-login)
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });

        // Redirect after 2 seconds (you can change this to navigate to another page)
        setTimeout(() => {
          // window.location.href = '/events'; // Uncomment when you have events page
          navigate("/login");
          console.log('Redirect to events page');
          
        }, 2000);
      }

    } catch (error) {
      // Handle errors
      if (error.response && error.response.data) {
        // Backend error
        setErrors({
          submit: error.response.data.error || 'Signup failed. Please try again.'
        });
      } else if (error.request) {
        // Network error
        setErrors({
          submit: 'Cannot connect to server. Please check your connection.'
        });
      } else {
        // Other errors
        setErrors({
          submit: 'An unexpected error occurred. Please try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1>Create Account</h1>
          <p>Join us to explore amazing events</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {/* Success Message */}
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          {/* Submit Error Message */}
          {errors.submit && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}

          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="Enter your full name"
              disabled={loading}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
              disabled={loading}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Create a password (min 6 characters)"
              disabled={loading}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="Re-enter your password"
              disabled={loading}
            />
            {errors.confirmPassword && (
              <span className="field-error">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          {/* Login Link */}
          <div className="form-footer">
            <p>
              Already have an account? {' '}
              <a href="/login">Log in here</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;