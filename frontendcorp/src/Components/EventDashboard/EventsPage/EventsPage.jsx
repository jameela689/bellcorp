import { useState, useEffect,useCallback } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import FilterPanel from '../FilterPanel/FilterPanel';
import EventList from '../EventList/EventList';
import Cookies from 'js-cookie';
import './EventsPage.css';
import axios from 'axios';

/**
 * EventsPage Component
 * 
 * Responsibility:
 * - Main page for browsing all events
 * - Coordinate search, filter, and event list
 * - Fetch events from API with query parameters
 * - Handle pagination (optional)
 * - Maintain filter state across navigation
 * 
 * State Management:
 * - events: Array of event objects
 * - loading: Boolean for loading state
 * - error: String error message
 * - searchQuery: Text search string
 * - filters: Object with category, location, dateFrom, dateTo
 */
const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    dateFrom: '',
    dateTo: ''
  });

  // Use useCallback to memoize fetchEvents and prevent infinite loops
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Build query parameters
      const params = {
        search: searchQuery,
        category: filters.category,
        location: filters.location,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        page: 1,
        limit: 50
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      console.log('Fetching events with params:', params); // Debug log

      // const response = await eventAPI.getAll(params);
      const token = Cookies.get('token')
      const response = await axios.get('https://bellcorp.onrender.com/api/events',{ params },{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });

      if (response.data.success) {
        setEvents(response.data.data.events);
        console.log('Events fetched:', response.data.data.events.length); // Debug log
      } else {
        setError('Failed to fetch events');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Unable to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters.category, filters.location, filters.dateFrom, filters.dateTo]);

  // Fetch events whenever search or filters change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Use useCallback to prevent SearchBar from re-rendering unnecessarily
  const handleSearch = useCallback((query) => {
    console.log('Search query changed:', query); // Debug log
    setSearchQuery(query);
  }, []);

  // Use useCallback to prevent FilterPanel from re-rendering unnecessarily
  const handleFilterChange = useCallback((newFilters) => {
    console.log('Filters changed:', newFilters); // Debug log
    setFilters(newFilters);
  }, []);

  return (
    <div className="events-page">
      <div className="events-container">
        {/* Page Header */}
        <div className="events-header">
          <h1 className="page-title">Discover Events</h1>
          <p className="page-subtitle">
            Find and register for exciting events near you
          </p>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search events by name or description..."
          />
        </div>

        {/* Main Content */}
        <div className="events-content">
          {/* Sidebar - Filters */}
          <aside className="events-sidebar">
            <FilterPanel onFilterChange={handleFilterChange} />
          </aside>

          {/* Main Area - Event List */}
          <main className="events-main">
            <div className="results-header">
              <h2 className="results-count">
                {!loading && !error && (
                  <>
                    {events.length} {events.length === 1 ? 'Event' : 'Events'} Found
                  </>
                )}
              </h2>
            </div>

            <EventList 
              events={events}
              loading={loading}
              error={error}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;