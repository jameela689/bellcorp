import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './Login.css';


const Login = () => {
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
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

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // ============================================
      // YOUR API CALL WILL GO HERE
      // ============================================
      const response = await axios.post('https://bellcorp.onrender.com/api/auth/login', {
        email: formData.email,
        password: formData.password
      });

      // Handle success response
      if (response.data.success) {
        // Store token in cookie (expires in 7 days)
        Cookies.set('token', response.data.token, { expires: 7 });
        Cookies.set('user', JSON.stringify(response.data.user));
        
        // Store user data in localStorage
        // localStorage.setItem('user', JSON.stringify(response.data.user));

        // Redirect to events page
        navigate("/dashboard");
      }

    } catch (error) {
      // Handle errors
      if (error.response && error.response.data) {
        // Backend error
        setErrors({
          submit: error.response.data.error || 'Login failed. Please try again.'
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
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Login to continue to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Error Message */}
          {errors.submit && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}

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
              autoComplete="email"
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
              placeholder="Enter your password"
              disabled={loading}
              autoComplete="current-password"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* Forgot Password Link */}
          {/* <div className="forgot-password">
            <a href="/forgot-password">Forgot password?</a>
          </div> */}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {/* Signup Link */}
          <div className="form-footer">
            <p>
              Don't have an account? {' '}
              <a href="/signup">Sign up here</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;