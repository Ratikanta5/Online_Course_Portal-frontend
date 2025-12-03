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
        const parsed = getUser()
        if (!parsed) {
          setLoading(false);
          return;
        }

        if (!parsed?.id) {
          setLoading(false);
          return;
        }

        // 🔥 Call /me with id (adjust URL to match your backend)
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/auth/me`,
          { params: { id: parsed.id, role:parsed.role } } // backend: req.query.id
        );

        // Expecting: { user: { id, name, email, role, ... } }
        if (data?.user) {
          setUser(data.user);
        } else {
          // backend returned something unexpected → clear trash
          localStorage.removeItem("user");
        }
      } catch (err) {
        console.error("Failed to fetch /me:", err);
        setError("Failed to load user information");
        // probably invalid localStorage → remove it
        localStorage.removeItem("user");
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
