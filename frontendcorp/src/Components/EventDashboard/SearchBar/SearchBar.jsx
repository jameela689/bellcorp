import { useState, useEffect } from 'react';
import './SearchBar.css';

/**
 * SearchBar Component
 * 
 * Responsibility:
 * - Accept text input for searching events
 * - Debounce search to avoid excessive API calls
 * - Emit search query to parent component
 * - Show clear button when text exists
 * 
 * Props:
 * - onSearch: Callback function to handle search (receives query string)
 * - placeholder: Input placeholder text
 */
const SearchBar = ({ onSearch, placeholder = 'Search events...' }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Debounce search - wait 500ms after user stops typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(searchQuery);
    }, 500);

    // Cleanup: cancel previous timeout on new keystroke
    return () => clearTimeout(timeoutId);
  }, [searchQuery, onSearch]);

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            className="clear-button" 
            onClick={handleClear}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;