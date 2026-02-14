import {Link} from 'react-router-dom'
import './NotFound.css'
export const NotFound = () => (
    <div className="not-found">
      <h1>404</h1>
      <p>Page not found</p>
      <Link to="/events">Go to Events</Link>
    </div>
  );