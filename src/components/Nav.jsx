import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  User,
  LogOut,
  BookOpen,
  LayoutDashboard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ⬅️ USE YOUR GLOBAL USER CONTEXT
import { useUser } from "../context/UserContext";
import { clearAuth } from "../utils/auth";
import NotificationPanel from "./NotificationPanel";

const Nav = ({ openLogin }) => {
  const { user, loading, setUser } = useUser();   // ← here
  const navigate = useNavigate();
  const [openProfile, setOpenProfile] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdowns if clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpenProfile(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/60 border-b border-white/30 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 md:px-10 lg:px-16">

        {/* Logo */}
        <div
          className="flex items-center gap-2 group cursor-pointer"
          onClick={() => navigate("/")}
        >
          <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
            <GraduationCap className="w-7 h-7 text-indigo-600 group-hover:text-sky-500 transition-colors" />
          </motion.div>
          <span className="font-semibold text-lg text-gray-800 group-hover:text-sky-500 transition-colors">
            LearnSphere
          </span>
        </div>

        {/* Right Side */}
        {loading ? (
          <div className="w-28 h-10 bg-gray-200 rounded-lg animate-pulse" />
        ) : !user ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openLogin}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Get Started
          </motion.button>
        ) : (
          <div className="flex items-center gap-4">

            {/* 🔔 Notification Bell - Industry Grade Component */}
            <NotificationPanel />

            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <motion.img
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                src={user.profileImage?.url || "/default-profile.png"}
                onClick={() => setOpenProfile(!openProfile)}
                className="w-10 h-10 rounded-full border cursor-pointer object-cover"
              />

              {openProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-3 w-52 bg-white shadow-lg rounded-xl border p-2"
                >
                  {/* User Info */}
                  <div className="px-4 py-2 border-b">
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>

                  {/* My Profile */}
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <User size={16} /> My Profile
                  </button>

                  {/* Role-based options */}
                  {user.role === "student" && (
                    <button
                      onClick={() => navigate(`/${user.role}`)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      <BookOpen size={16} /> My Enrollments
                    </button>
                  )}

                  {user.role === "lecture" && (
                    <button
                      onClick={() => navigate("/lecturer/dashboard")}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      <LayoutDashboard size={16} /> Dashboard
                    </button>
                  )}

                  {/* Logout */}
                  <button
                    onClick={() => {
                      clearAuth();
                      if (setUser) setUser(null);
                      setOpenProfile(false);
                      navigate("/");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-100 rounded-lg"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Nav;
