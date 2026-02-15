import { useState, useEffect, useCallback } from 'react';
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
 * - Handle pagination (✨ NEW)
 * - Maintain filter state across navigation
 * 
 * State Management:
 * - events: Array of event objects
 * - loading: Boolean for loading state
 * - error: String error message
 * - searchQuery: Text search string
 * - filters: Object with category, location, dateFrom, dateTo
 * - currentPage: Current page number (✨ NEW)
 * - pagination: Pagination metadata from backend (✨ NEW)
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

  // ✨ NEW: Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalEvents: 0,
    limit: 10
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
        page: currentPage,  // ✨ CHANGED: Use dynamic page
        limit: 10           // ✨ CHANGED: Match backend default
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      console.log('Fetching events with params:', params);

      const token = Cookies.get('token');
      const response = await axios.get('https://bellcorp.onrender.com/api/events', { params }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setEvents(response.data.data.events);
        setPagination(response.data.data.pagination); // ✨ NEW: Store pagination metadata
        console.log('Events fetched:', response.data.data.events.length);
        console.log('Pagination:', response.data.data.pagination); // ✨ NEW: Debug log
      } else {
        setError('Failed to fetch events');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Unable to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters.category, filters.location, filters.dateFrom, filters.dateTo, currentPage]); // ✨ CHANGED: Added currentPage

  // Fetch events whenever search or filters change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ✨ CHANGED: Renamed and added page reset
  const handleSearchWithReset = useCallback((query) => {
    console.log('Search query changed:', query);
    setSearchQuery(query);
    setCurrentPage(1); // ✨ NEW: Reset to page 1 on search
  }, []);

  // ✨ CHANGED: Added page reset on filter change
  const handleFilterChange = useCallback((newFilters) => {
    console.log('Filters changed:', newFilters);
    setFilters(newFilters);
    setCurrentPage(1); // ✨ NEW: Reset to page 1 on filter change
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
            onSearch={handleSearchWithReset}  
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
                    {pagination.totalEvents} {pagination.totalEvents === 1 ? 'Event' : 'Events'} Found
                    {/* ✨ CHANGED: Show total from pagination metadata */}
                  </>
                )}
              </h2>
            </div>

            <EventList 
              events={events}
              loading={loading}
              error={error}
            />

            {/* ✨ NEW: Pagination Controls */}
            {!loading && !error && pagination.totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                
                <span className="pagination-info">
                  Page {currentPage} of {pagination.totalPages}
                  <span className="total-events">
                    ({pagination.totalEvents} total)
                  </span>
                </span>
                
                <button 
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;