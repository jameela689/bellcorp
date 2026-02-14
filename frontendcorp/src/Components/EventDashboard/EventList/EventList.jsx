
import EventCard from '../EventCard/EventCard';
import './EventList.css';

/**
 * EventList Component
 * 
 * Responsibility:
 * - Display grid of EventCard components
 * - Handle loading state
 * - Handle empty state (no events found)
 * - Handle error state
 * - Responsive grid layout
 * 
 * Props:
 * - events: Array of event objects
 * - loading: Boolean for loading state
 * - error: String error message (optional)
 */
const EventList = ({ events, loading, error }) => {
  // Loading state
  if (loading) {
    return (
      <div className="event-list-state">
        <div className="loading-spinner"></div>
        <p className="state-message">Loading events...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="event-list-state error">
        <span className="state-icon">⚠️</span>
        <p className="state-message">{error}</p>
      </div>
    );
  }

  // Empty state
  if (!events || events.length === 0) {
    return (
      <div className="event-list-state">
        <span className="state-icon">📅</span>
        <p className="state-message">No events found</p>
        <p className="state-submessage">Try adjusting your search or filters</p>
      </div>
    );
  }

  // Event list
  return (
    <div className="event-list">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

export default EventList;