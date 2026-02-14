import { useState, useEffect } from 'react';
import axios from 'axios';
// import { utilityAPI } from '../services/api';
import './FilterPanel.css';

/**
 * FilterPanel Component
 * 
 * Responsibility:
 * - Provide category filter dropdown
 * - Provide location filter dropdown
 * - Provide date range filters (from/to)
 * - Fetch categories and locations from API
 * - Emit filter changes to parent component
 * - Show active filter count
 * - Allow clearing all filters
 * 
 * Props:
 * - onFilterChange: Callback to emit filter object { category, location, dateFrom, dateTo }
 */
const FilterPanel = ({ onFilterChange }) => {
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    dateFrom: '',
    dateTo: ''
  });

  // Fetch categories and locations on mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      // const [categoriesRes, locationsRes] = await Promise.all([
      //   utilityAPI.getCategories(),
      //   utilityAPI.getLocations()
      // ]);

      const [categoriesRes, locationsRes] = await Promise.all([
        axios.get('https://bellcorp.onrender.com/api/categories'),
        axios.get('https://bellcorp.onrender.com/api/locations')
      ]);

      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data);
      }

      if (locationsRes.data.success) {
        setLocations(locationsRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters = {
      category: '',
      location: '',
      dateFrom: '',
      dateTo: ''
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(val => val !== '').length;

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3 className="filter-title">
          Filters
          {activeFilterCount > 0 && (
            <span className="active-count">({activeFilterCount})</span>
          )}
        </h3>
        {activeFilterCount > 0 && (
          <button className="clear-filters-btn" onClick={handleClearFilters}>
            Clear All
          </button>
        )}
      </div>

      <div className="filter-groups">
        {/* Category Filter */}
        <div className="filter-group">
          <label className="filter-label">Category</label>
          <select
            className="filter-select"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div className="filter-group">
          <label className="filter-label">Location</label>
          <select
            className="filter-select"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          >
            <option value="">All Locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Date From Filter */}
        <div className="filter-group">
          <label className="filter-label">From Date</label>
          <input
            type="date"
            className="filter-input"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          />
        </div>

        {/* Date To Filter */}
        <div className="filter-group">
          <label className="filter-label">To Date</label>
          <input
            type="date"
            className="filter-input"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;