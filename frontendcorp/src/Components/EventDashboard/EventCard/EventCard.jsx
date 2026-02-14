import { useNavigate } from 'react-router-dom';
import './EventCard.css';

/**
 * EventCard Component
 * 
 * Responsibility:
 * - Display event summary in card format
 * - Show key event details (name, date, location, capacity)
 * - Navigate to event detail page on click
 * - Visual indicator for full events
 * 
 * Props:
 * - event: Event object with all details
 */
const EventCard = ({ event }) => {
  const navigate = useNavigate();

  // Format date for display
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

  // Calculate seat availability percentage
  const availabilityPercentage = (event.available_seats / event.capacity) * 100;

  // Determine availability status
  const getAvailabilityStatus = () => {
    if (event.available_seats === 0) return 'full';
    if (availabilityPercentage < 20) return 'limited';
    return 'available';
  };

  const handleCardClick = () => {
    navigate(`/events/${event.id}`);
  };

  return (
    <div className="event-card" onClick={handleCardClick}>
      {/* Event Header */}
      <div className="event-card-header">
        <h3 className="event-card-title">{event.name}</h3>
        <span className={`availability-badge ${getAvailabilityStatus()}`}>
          {event.available_seats === 0 ? 'Full' : `${event.available_seats} seats left`}
        </span>
      </div>

      {/* Event Details */}
      <div className="event-card-body">
        <div className="event-info">
          <span className="info-icon">📅</span>
          <span className="info-text">{formatDate(event.date)}</span>
        </div>

        <div className="event-info">
          <span className="info-icon">📍</span>
          <span className="info-text">{event.location}</span>
        </div>

        <div className="event-info">
          <span className="info-icon">👤</span>
          <span className="info-text">{event.organizer}</span>
        </div>

        {event.category && (
          <div className="event-category">
            <span className="category-badge">{event.category}</span>
          </div>
        )}
      </div>

      {/* Event Footer */}
      <div className="event-card-footer">
        <div className="capacity-info">
          <div className="capacity-bar">
            <div 
              className="capacity-fill" 
              style={{ width: `${100 - availabilityPercentage}%` }}
            ></div>
          </div>
          <span className="capacity-text">
            {event.capacity - event.available_seats}/{event.capacity} registered
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;