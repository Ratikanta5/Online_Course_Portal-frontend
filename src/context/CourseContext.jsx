// src/context/CourseContext.jsx
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";

const CourseContext = createContext();

// Custom hook
export const useCourses = () => useContext(CourseContext);

// Constants for retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second base delay
const REQUEST_TIMEOUT = 10000; // 10 seconds

export default function CourseProvider({ children }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef(null);

  // Helper function to delay execution (for retry logic)
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Fetch courses - PUBLIC endpoint (no auth required for viewing)
  const fetchCourses = useCallback(async (isRetry = false) => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      if (!isRetry) {
        setLoading(true);
        setError(null);
        setRetryCount(0);
      }

      // Build config - courses listing should be PUBLIC
      // Only add auth header if token exists (for potential user-specific data like enrollment status)
      const config = {
        signal: abortControllerRef.current.signal,
        timeout: REQUEST_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      // Optionally include auth token if available (for personalized data)
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const apiUrl = import.meta.env.VITE_API_URL || '';
      
      // Try primary endpoint first
      let res;
      try {
        res = await axios.get(`${apiUrl}/api/courses`, config);
      } catch (primaryErr) {
        // If primary fails due to auth, try public endpoint
        if (primaryErr.response?.status === 401 || primaryErr.response?.status === 403) {
          console.log("CourseContext - Auth required, trying public endpoint");
          // Remove auth header for public request
          delete config.headers.Authorization;
          res = await axios.get(`${apiUrl}/api/courses/public`, config);
        } else {
          throw primaryErr;
        }
      }

      // Handle various response formats
      const responseData = res.data;
      
      if (responseData.success !== false) {
        // Extract courses from various possible response structures
        const coursesData = 
          responseData.courses || 
          responseData.data?.courses || 
          responseData.data || 
          (Array.isArray(responseData) ? responseData : []);
        
        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setError(null);
        setRetryCount(0);
      } else {
        throw new Error(responseData.message || "Failed to fetch courses");
      }
    } catch (err) {
      // Don't handle aborted requests as errors
      if (axios.isCancel(err) || err.name === 'AbortError') {
        return;
      }

      console.error("CourseContext - Error fetching courses:", {
        message: err.message,
        status: err.response?.status,
        url: err.config?.url,
      });

      // Implement retry logic with exponential backoff
      const currentRetry = retryCount + 1;
      if (currentRetry <= MAX_RETRIES && !err.response?.status?.toString().startsWith('4')) {
        // Only retry for network errors or 5xx server errors, not 4xx client errors
        setRetryCount(currentRetry);
        const retryDelay = RETRY_DELAY * Math.pow(2, currentRetry - 1);
        console.log(`CourseContext - Retrying in ${retryDelay}ms (attempt ${currentRetry}/${MAX_RETRIES})`);
        await delay(retryDelay);
        return fetchCourses(true);
      }

      // Set user-friendly error message
      let errorMessage = "Unable to load courses. Please try again later.";
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Even without auth, courses should still be viewable
        // This means the backend needs to support public course listing
        errorMessage = "Course catalog is currently unavailable.";
      } else if (err.response?.status >= 500) {
        errorMessage = "Server is temporarily unavailable. Please try again later.";
      } else if (!navigator.onLine) {
        errorMessage = "You appear to be offline. Please check your internet connection.";
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        errorMessage = "Request timed out. Please try again.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  // Initial fetch on mount
  useEffect(() => {
    fetchCourses();

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Refetch when user comes back online
  useEffect(() => {
    const handleOnline = () => {
      if (error && courses.length === 0) {
        fetchCourses();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [error, courses.length, fetchCourses]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = {
    courses,
    loading,
    error,
    retryCount,
    isRetrying: retryCount > 0 && loading,
    refetchCourses: () => fetchCourses(false),
  };

  return (
    <CourseContext.Provider value={contextValue}>
      {children}
    </CourseContext.Provider>
  );
}


