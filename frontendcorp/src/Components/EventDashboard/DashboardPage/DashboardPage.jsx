import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
// import { registrationAPI } from '../services/api';
import './DashboardPage.css';

/**
 * DashboardPage Component
 * 
 * Responsibility:
 * - Display user's registered events
 * - Separate into upcoming and past events
 * - Show event cards with quick actions
 * - Handle cancellation from dashboard
 * - Show empty state if no registrations
 * 
 * State Management:
 * - upcomingEvents: Array of future events
 * - pastEvents: Array of past events
 * - loading: Boolean for loading state
 * - error: String error message
 */
const DashboardPage = () => {
  const navigate = useNavigate();
  
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingEventId, setCancellingEventId] = useState(null);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    setLoading(true);
    setError('');

    try {
      const token = Cookies.get('token');
      const response = await axios.get('https://bellcorp.onrender.com/api/registrations/my-events',{
        headers:{
          Authorization : `Bearer ${token}`
        }
      });
      // const response = await registrationAPI.getMyEvents();

      if (response.data.success) {
        setUpcomingEvents(response.data.data.upcoming);
        setPastEvents(response.data.data.past);
      } else {
        setError('Failed to fetch your events');
      }
    } catch (err) {
      console.error('Error fetching registered events:', err);
      setError('Unable to load your events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (eventId) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) {
      return;
    }

    setCancellingEventId(eventId);

    try {
      const token  = Cookies.get('token')
      const response = await axios.delete(`https://bellcorp.onrender.com/api/registrations/${eventId}`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });
      // const response = await registrationAPI.cancel(eventId);

      if (response.data.success) {
        // Remove event from list
        setUpcomingEvents(prev => prev.filter(event => event.id !== eventId));
        setPastEvents(prev => prev.filter(event => event.id !== eventId));
      }
    } catch (err) {
      console.error('Error cancelling registration:', err);
      alert('Failed to cancel registration. Please try again.');
    } finally {
      setCancellingEventId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Event Card Component
  const EventCard = ({ event, isPast }) => (
    <div className="dashboard-event-card">
      <div className="card-header">
        <h3 className="card-title">{event.name}</h3>
        {isPast && <span className="past-badge">Past Event</span>}
      </div>

      <div className="card-body">
        <div className="card-info">
          <span className="info-icon">📅</span>
          <span className="info-text">{formatDate(event.date)}</span>
        </div>

        <div className="card-info">
          <span className="info-icon">📍</span>
          <span className="info-text">{event.location}</span>
        </div>

        <div className="card-info">
          <span className="info-icon">👤</span>
          <span className="info-text">{event.organizer}</span>
        </div>
      </div>

      <div className="card-actions">
        <button 
          className="card-btn view"
          onClick={() => navigate(`/events/${event.id}`)}
        >
          View Details
        </button>
        
        {!isPast && (
          <button 
            className="card-btn cancel"
            onClick={() => handleCancelRegistration(event.id)}
            disabled={cancellingEventId === event.id}
          >
            {cancellingEventId === event.id ? 'Cancelling...' : 'Cancel'}
          </button>
        )}
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your events...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="error-state">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
            <button className="retry-btn" onClick={fetchMyEvents}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  const hasNoEvents = upcomingEvents.length === 0 && pastEvents.length === 0;

  return (
    <div className="dashboard-page">

      <div className="dashboard-container">
        {/* Page Header */}
        <div className="dashboard-header">
          <h1 className="page-title">My Dashboard</h1>
          <p className="page-subtitle">
            Manage your event registrations
          </p>
        </div>

        {/* Empty State */}
        {hasNoEvents ? (
          <div className="empty-state">
            <span className="empty-icon">📅</span>
            <h2 className="empty-title">No Registered Events</h2>
            <p className="empty-text">
              You haven't registered for any events yet. Explore events and start registering!
            </p>
            <button 
              className="browse-btn"
              onClick={() => navigate('/events')}
            >
              Browse Events
            </button>
          </div>
        ) : (
          <>
            {/* Upcoming Events Section */}
            {upcomingEvents.length > 0 && (
              <section className="events-section">
                <div className="section-header">
                  <h2 className="section-title">
                    Upcoming Events
                    <span className="count-badge">{upcomingEvents.length}</span>
                  </h2>
                </div>

                <div className="events-grid">
                  {upcomingEvents.map((event) => (
                    <EventCard key={event.id} event={event} isPast={false} />
                  ))}
                </div>
              </section>
            )}

            {/* Past Events Section */}
            {pastEvents.length > 0 && (
              <section className="events-section">
                <div className="section-header">
                  <h2 className="section-title">
                    Past Events
                    <span className="count-badge">{pastEvents.length}</span>
                  </h2>
                </div>

                <div className="events-grid">
                  {pastEvents.map((event) => (
                    <EventCard key={event.id} event={event} isPast={true} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;