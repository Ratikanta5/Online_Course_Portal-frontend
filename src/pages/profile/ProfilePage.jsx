// src/pages/Profile/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "../../context/UserContext";
import { Mail, BadgeCheck, Calendar, Shield, BookOpen, CheckCircle, AlertCircle, Loader } from "lucide-react";
import axios from "axios";
import { getToken } from "../../utils/auth";

const ProfilePage = () => {
  const { user } = useUser();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/payment/my-enrollments`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          setEnrollments(response.data.enrollments || []);
        }
      } catch (err) {
        console.error("Error fetching enrollments:", err);
        setError("Failed to load enrollments");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEnrollments();
    }
  }, [user]);

  const getPaymentStatusBadge = (paymentStatus) => {
    switch (paymentStatus) {
      case "success":
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            <CheckCircle className="w-4 h-4" />
            Payment Success
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
            <AlertCircle className="w-4 h-4" />
            Payment Pending
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
            <AlertCircle className="w-4 h-4" />
            Payment Failed
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
            Unknown
          </span>
        );
    }
  };

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

      {/* ======================= ENROLLMENTS SECTION ======================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-3xl mx-auto mt-8 bg-white shadow-xl rounded-2xl p-6 sm:p-10 border"
      >
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-800">My Enrollments</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 text-indigo-600 animate-spin" />
            <p className="ml-2 text-gray-600">Loading your enrollments...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : enrollments.length === 0 ? (
          <p className="text-gray-600 text-center py-8">You have not enrolled in any courses yet.</p>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <motion.div
                key={enrollment._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 flex-1">
                  <img
                    src={
                      typeof enrollment.courseId?.courseImage === 'string'
                        ? enrollment.courseId.courseImage
                        : enrollment.courseId?.courseImage?.url || "https://via.placeholder.com/80"
                    }
                    alt={enrollment.courseId?.title || "Course"}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/80";
                    }}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{enrollment.courseId?.title || "Unknown Course"}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Enrolled: {new Date(enrollment.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      By: {enrollment.courseId?.creator?.name || "Unknown"}
                    </p>
                  </div>
                </div>
                {getPaymentStatusBadge(enrollment.paymentStatus)}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProfilePage;
