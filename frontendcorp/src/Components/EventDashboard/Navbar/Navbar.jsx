import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import './Navbar.css';

/**
 * Navbar Component
 * 
 * Responsibility:
 * - Display app logo/title
 * - Navigation links (Events, Dashboard)
 * - User authentication status
 * - Logout functionality
 * - Active route highlighting
 * - Mobile responsive menu
 * 
 * Props: None (standalone component)
 */
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(Cookies.get('user'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Get user from localStorage
    const userData = Cookies.get('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }else{
      setUser(null);
    }
  }, [location.pathname]);



  const handleLogout = async () => {
    try {
      // 1. Grab the token BEFORE deleting it
      const token = Cookies.get('token');

      // 2. Make the API call to clear the session in the SQLite database
      // Notice we pass an empty object {} as the body data, followed by the headers config
      if (token) {
        await axios.post(
          'https://bellcorp.onrender.com/api/auth/logout',
          {}, 
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }
    } catch (error) {
      console.error("Logout API failed, but we will still clear local data:", error);
    } finally {
      // 3. Clear auth data locally AFTER the API call finishes (or fails)
      Cookies.remove('token');
      Cookies.remove('user');
      setUser(null); // Make sure to clear the React state too!
      
      // 4. Redirect to login
      navigate('/login');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => handleNavigation('/events')}>
          <span className="logo-icon"></span>
          <span className="logo-text">&#128578;EventHub</span>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Navigation Links */}
        <div className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="navbar-links">
            <button
              className={`nav-link ${isActive('/events') ? 'active' : ''}`}
              onClick={() => handleNavigation('/events')}
            >
              Browse Events
            </button>

            {user && (
              <button
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={() => handleNavigation('/dashboard')}
              >
                My Dashboard
              </button>
            )}
          </div>

          {/* User Section */}
          <div className="navbar-user">
            {user ? (
              <>
                <span className="user-name">Hi, {user.name}!</span>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  className="auth-btn login"
                  onClick={() => handleNavigation('/login')}
                >
                  Login
                </button>
                <button 
                  className="auth-btn signup"
                  onClick={() => handleNavigation('/signup')}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;