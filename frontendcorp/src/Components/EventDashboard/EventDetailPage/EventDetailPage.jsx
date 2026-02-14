import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
// import { eventAPI, registrationAPI } from '../services/api';
import './EventDetailPage.css';
import axios from 'axios';

/**
 * EventDetailPage Component
 * 
 * Responsibility:
 * - Display full event details
 * - Handle event registration (with loading state)
 * - Handle registration cancellation
 * - Prevent duplicate registration
 * - Show success/error messages
 * - Check authentication before registration
 * 
 * State Flow:
 * 1. Fetch event details on mount
 * 2. User clicks "Register"
 * 3. Set registering = true (disable button)
 * 4. Call API
 * 5. On success: Update isRegistered, show success message
 * 6. On error: Show error message
 * 7. Finally: Set registering = false
 */
const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Check if user is authenticated
  const isAuthenticated = !!Cookies.get('token');

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const token = Cookies.get('token');
      // const response = await eventAPI.getById(id);
      const response = await axios.get(`https://bellcorp.onrender.com/api/events/${id}`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });

      if (response.data.success) {
        setEvent(response.data.data.event);
        setIsRegistered(response.data.data.isRegistered);
      } else {
        setError('Event not found');
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('Unable to load event details');
    } finally {
      setLoading(false);
    }
  };

  // IMPORTANT: Registration flow as per requirements
  const handleRegister = async () => {
    // Check authentication
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Clear previous messages
    setSuccessMessage('');
    setErrorMessage('');

    // Set registering state (disable button, show loading)
    setRegistering(true);

    try {
      // Call API
      const eventId = event.id;
      const token = Cookies.get('token');
      const response = await axios.post('https://bellcorp.onrender.com/api/registrations',{eventId},{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });
      // const response = await registrationAPI.register(event.id);

      // On success
      if (response.data.success) {
        // Update local state
        setIsRegistered(true);
        
        // Update available seats (optimistic update)
        setEvent(prev => ({
          ...prev,
          available_seats: prev.available_seats - 1
        }));

        // Show success message
        setSuccessMessage('Successfully registered for this event!');

        // Optionally refetch event to ensure data consistency
        // await fetchEventDetails();
      }
    } catch (err) {
      // On error - show error message
      console.error('Registration error:', err);
      
      if (err.response?.data?.error) {
        setErrorMessage(err.response.data.error);
      } else {
        setErrorMessage('Registration failed. Please try again.');
      }
    } finally {
      // Finally - reset registering state
      setRegistering(false);
    }
  };

  // Handle registration cancellation
  const handleCancelRegistration = async () => {
    // Clear previous messages
    setSuccessMessage('');
    setErrorMessage('');

    // Set registering state
    setRegistering(true);

    try {
      // const response = await registrationAPI.cancel(event.id);
      const token = Cookies.get('token')
      const response = await axios.delete(`https://bellcorp.onrender.com/api/registrations/${event.id}`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Update local state
        setIsRegistered(false);
        
        // Update available seats
        setEvent(prev => ({
          ...prev,
          available_seats: prev.available_seats + 1
        }));

        // Show success message
        setSuccessMessage('Registration cancelled successfully');
      }
    } catch (err) {
      console.error('Cancellation error:', err);
      setErrorMessage('Failed to cancel registration. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="event-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="event-detail-page">
        <div className="error-container">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button className="back-btn" onClick={() => navigate('/events')}>
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  // Event not found
  if (!event) {
    return null;
  }

  return (
    <div className="event-detail-page">
      <div className="event-detail-container">
        {/* Back Button */}
        <button className="back-link" onClick={() => navigate('/events')}>
          ← Back to Events
        </button>

        {/* Event Detail Card */}
        <div className="event-detail-card">
          {/* Header */}
          <div className="event-detail-header">
            <div>
              <h1 className="event-title">{event.name}</h1>
              <p className="event-organizer">Organized by {event.organizer}</p>
            </div>
            {event.category && (
              <span className="event-category-badge">{event.category}</span>
            )}
          </div>

          {/* Messages */}
          {successMessage && (
            <div className="message success">
              ✓ {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="message error">
              ⚠ {errorMessage}
            </div>
          )}

          {/* Event Info Grid */}
          <div className="event-info-grid">
            <div className="info-item">
              <span className="info-label">📅 Date & Time</span>
              <span className="info-value">{formatDate(event.date)}</span>
            </div>

            <div className="info-item">
              <span className="info-label">📍 Location</span>
              <span className="info-value">{event.location}</span>
            </div>

            <div className="info-item">
              <span className="info-label">👥 Capacity</span>
              <span className="info-value">
                {event.capacity - event.available_seats} / {event.capacity} registered
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">🎟️ Available Seats</span>
              <span className={`info-value ${event.available_seats === 0 ? 'full' : ''}`}>
                {event.available_seats === 0 ? 'Event Full' : `${event.available_seats} seats left`}
              </span>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="event-description">
              <h2 className="section-title">About This Event</h2>
              <p className="description-text">{event.description}</p>
            </div>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="event-tags">
              <h3 className="section-title">Tags</h3>
              <div className="tags-list">
                {event.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="event-actions">
            {!isAuthenticated ? (
              <button 
                className="action-btn primary"
                onClick={() => navigate('/login')}
              >
                Login to Register
              </button>
            ) : isRegistered ? (
              <button 
                className="action-btn danger"
                onClick={handleCancelRegistration}
                disabled={registering}
              >
                {registering ? 'Cancelling...' : 'Cancel Registration'}
              </button>
            ) : (
              <button 
                className="action-btn primary"
                onClick={handleRegister}
                disabled={registering || event.available_seats === 0}
              >
                {registering ? 'Registering...' : 'Register for Event'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;