// src/context/CourseContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { getUser, getToken } from "../utils/auth";

const CourseContext = createContext();

// Custom hook
export const useCourses = () => useContext(CourseContext);

export default function CourseProvider({ children }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get token from localStorage (stored after login)
      const token = getToken();
      console.log("CourseContext - Retrieved token:", token);

      const config = {};
      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`,
        };
        console.log("CourseContext - Sending Authorization header:", config.headers);
      } else {
        console.warn("CourseContext - No token found, request will be unauthorized");
      }

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/courses`,
        config
      );

      console.log("CourseContext - Fetched courses response:", res.data.courses);

      if (res.data.success) {
        setCourses(res.data.courses || []);
      } else {
        setError(res.data.message || "Failed to fetch courses");
      }
    } catch (err) {
      console.error("Error fetching courses:", {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url,
      });

      setError(
        err.response?.data?.message ||
          `Could not fetch courses (${err.response?.status || err.message})`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <CourseContext.Provider
      value={{
        courses,
        loading,
        error,
        refetchCourses: fetchCourses,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}


