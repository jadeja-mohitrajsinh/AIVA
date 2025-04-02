import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const STORAGE_KEY = 'aiva_last_position';

export const useLastPosition = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector(state => state.auth);

  // Save current position
  useEffect(() => {
    if (isAuthenticated && location.pathname !== '/log-in') {
      const position = {
        pathname: location.pathname,
        search: location.search,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    }
  }, [location.pathname, location.search, isAuthenticated]);

  // Restore position
  useEffect(() => {
    if (isAuthenticated && (location.pathname === '/' || location.pathname === '/dashboard')) {
      try {
        const savedPosition = localStorage.getItem(STORAGE_KEY);
        if (savedPosition) {
          const { pathname, search, timestamp } = JSON.parse(savedPosition);
          
          // Check if saved position is not too old (24 hours)
          const isValid = (Date.now() - timestamp) < 24 * 60 * 60 * 1000;
          
          if (isValid && pathname && pathname !== '/') {
            navigate(pathname + (search || ''), { replace: true });
          }
        }
      } catch (error) {

        //console.error('Error restoring last position:', error);

        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [isAuthenticated, location.pathname, navigate]);
}; 