// src/context/UserContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { getUser } from "../utils/auth";

// shape: { user, setUser, loading, error }
const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // full user from /me
  const [loading, setLoading] = useState(true); // while fetching /me
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        // Get stored user data
        const parsed = getUser();
        
        // If no user stored, user is not logged in
        if (!parsed) {
          setUser(null);
          setLoading(false);
          return;
        }

        if (!parsed?.id) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Call /me to get full user details
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/auth/me`,
          { params: { id: parsed.id, role: parsed.role } }
        );

        if (data?.user) {
          setUser(data.user);
        } else {
          // backend returned something unexpected → clear and reset
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("authToken");
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to fetch /me:", err);
        setError("Failed to load user information");
        // probably invalid sessionStorage → remove it
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("authToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const value = { user, setUser, loading, error };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used inside <UserProvider>");
  }
  return ctx;
};
