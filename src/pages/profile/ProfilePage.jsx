// src/pages/Profile/ProfilePage.jsx
import React from "react";
import { motion } from "framer-motion";
import { useUser } from "../../context/UserContext";
import { Mail, BadgeCheck, Calendar, Shield } from "lucide-react";

const ProfilePage = () => {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        <p>No user data found.</p>
      </div>
    );
  }

  const loginDate = new Date(user.createdAt).toLocaleDateString();
  const loginTime = new Date(user.createdAt).toLocaleTimeString();

  return (
    <div className="pt-24 pb-10 px-4 sm:px-6 lg:px-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-6 sm:p-10 border"
      >
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Profile Image */}
          <motion.img
            src={user.profileImage?.url || "/default-profile.png"}
            className="w-32 h-32 rounded-full border object-cover shadow-md"
            loading="lazy"
            style={{ imageRendering: "auto" }}
            whileHover={{ scale: 1.05 }}
          />

          {/* User Basic Info */}
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
            <p className="text-gray-500 capitalize text-sm">{user.role}</p>

            {/* Edit Button */}
            <button className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow">
              Edit Profile
            </button>
          </div>
        </div>

        {/* ---- Styled BIO BOX ---- */}
        <div className="mt-8 bg-gray-50 border rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Bio</h2>
          <p className="text-gray-700 leading-relaxed text-sm">
            {user.bio ||
              "No bio added yet. Click the Edit Profile button to update your personal details."}
          </p>
        </div>

        {/* Divider */}
        <div className="my-8 border-t"></div>

        {/* User Details */}
        <div className="space-y-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Account Information
          </h2>

          {/* Email */}
          <div className="flex items-center gap-3 text-gray-700">
            <Mail size={20} className="text-indigo-600" />
            <span className="text-sm break-all">{user.email}</span>
          </div>

          {/* Role */}
          <div className="flex items-center gap-3 text-gray-700">
            <Shield size={20} className="text-indigo-600" />
            <span className="capitalize text-sm">{user.role}</span>
          </div>

          {/* Verified */}
          {user.isVerified && (
            <div className="flex items-center gap-3 text-green-600">
              <BadgeCheck size={20} />
              <span className="text-sm">Email Verified</span>
            </div>
          )}

          {/* Login date */}
          <div className="flex items-center gap-3 text-gray-700">
            <Calendar size={20} className="text-indigo-600" />
            <span className="text-sm">
              Joined on {loginDate} at {loginTime}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
