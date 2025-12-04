import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  User,
  LogOut,
  BookOpen,
  Bell,
  LayoutDashboard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ⬅️ USE YOUR GLOBAL USER CONTEXT
import { useUser } from "../context/UserContext";

const Nav = ({ openLogin }) => {
  const { user, loading } = useUser();   // ← here
  const navigate = useNavigate();
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const [notifications, setNotifications] = useState([
    // Example Notifications
    { message: "New React course added!", time: "2 min ago", role: "user" },
    { message: "Admin approved your course!", time: "10 min ago", role: "lecturer" },
  ]);

  // Close dropdowns if clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        notifRef.current &&
        !notifRef.current.contains(e.target)
      ) {
        setOpenProfile(false);
        setOpenNotif(false);
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
        {!user ? (
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

            {/* 🔔 Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setOpenNotif(!openNotif)}
                className="relative p-2 hover:bg-gray-200 rounded-full transition"
              >
                <Bell size={22} />

                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </button>

              {openNotif && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-3 w-72 max-h-96 overflow-y-auto bg-white 
                  shadow-lg rounded-xl border p-3 z-50"
                >
                  <p className="font-semibold mb-2">Notifications</p>

                  {notifications.length === 0 && (
                    <p className="text-sm text-gray-500">No notifications</p>
                  )}

                  {notifications.map((n, i) => (
                    <div
                      key={i}
                      className="p-2 mb-2 bg-gray-50 hover:bg-gray-100 rounded-lg border"
                    >
                      <p className="text-sm text-gray-800">{n.message}</p>
                      <p className="text-xs text-gray-400">{n.time}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

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
                      onClick={() => navigate("/my-enrollments")}
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
                      navigate("/");
                      window.location.reload();
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
