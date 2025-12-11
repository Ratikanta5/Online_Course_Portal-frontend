// src/pages/Dashboard/StudentDash.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserCircle,
  BookOpen,
  Clock,
  Award,
  ArrowRight,
  PlayCircle,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import axios from "axios";
import { getToken } from "../../utils/auth";

const StudentDash = () => {
  const { user } = useUser();
  const navigate = useNavigate();
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

  const canAccessCourse = (enrollment) => {
    return enrollment.paymentStatus === "success";
  };

  return (
    <div className="pt-[90px] px-4 sm:px-6 lg:px-16 pb-16 min-h-screen bg-gray-50">
      {/* ======================= HEADER ======================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-200"
      >
        <div className="flex items-center gap-5">
          <UserCircle className="w-16 h-16 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome, {user?.name || "Student"} 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Continue your learning journey.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ======================= STATS ======================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          {
            icon: <BookOpen className="w-6 h-6 text-blue-600" />,
            label: "Enrolled Courses",
            value: enrollments.filter(e => e.paymentStatus === "success").length,
          },
          {
            icon: <Clock className="w-6 h-6 text-blue-600" />,
            label: "Pending Payments",
            value: enrollments.filter(e => e.paymentStatus === "pending").length,
          },
          {
            icon: <Award className="w-6 h-6 text-blue-600" />,
            label: "Certificates Earned",
            value: 2,
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              {stat.icon}
              <div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <h3 className="text-xl font-bold text-slate-900">
                  {stat.value}
                </h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ======================= ENROLLED COURSES ======================= */}
      <h2 className="text-xl font-bold text-slate-900 mb-4">
        Your Courses
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 text-blue-600 animate-spin" />
          <p className="ml-2 text-gray-600">Loading your enrollments...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      ) : enrollments.length === 0 ? (
        <p className="text-gray-600">You have not enrolled in any courses yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment, index) => (
            <motion.div
              key={enrollment._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-lg transition"
            >
              <img
                src={
                  typeof enrollment.courseId?.courseImage === 'string'
                    ? enrollment.courseId.courseImage
                    : enrollment.courseId?.courseImage?.url || "https://via.placeholder.com/300x150"
                }
                alt={enrollment.courseId?.title || "Course"}
                className="w-full h-36 object-cover"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300x150";
                }}
              />

              <div className="p-4">
                <h3 className="font-bold text-slate-900 text-sm">{enrollment.courseId?.title || "Unknown Course"}</h3>

                {/* Payment Status Badge */}
                <div className="mt-3">
                  {getPaymentStatusBadge(enrollment.paymentStatus)}
                </div>

                {/* Show enrollment date */}
                <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-4 h-4" /> 
                  Enrolled: {new Date(enrollment.createdAt).toLocaleDateString()}
                </p>

                {/* Continue button - only if payment successful */}
                {canAccessCourse(enrollment) ? (
                  <motion.button
                    onClick={() => {
                      navigate(`/learn/${enrollment.courseId._id}`, {
                        state: { course: enrollment.courseId },
                      });
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                  >
                    <PlayCircle className="w-5 h-5" /> Start Learning
                  </motion.button>
                ) : (
                  <motion.button
                    disabled
                    className="w-full mt-4 py-2 bg-gray-300 text-gray-600 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <AlertCircle className="w-5 h-5" /> Awaiting Payment
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ======================= RECENT ACTIVITY ======================= */}
      <h2 className="text-xl font-bold text-slate-900 mt-14 mb-4">
        Recent Activity
      </h2>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <p className="text-gray-600 text-sm flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-blue-600" />
          Completed "React Intro" Lecture
        </p>

        <p className="text-gray-600 text-sm flex items-center gap-2 mt-2">
          <ArrowRight className="w-4 h-4 text-blue-600" />
          Viewed "Python Numpy Basics"
        </p>
      </div>
    </div>
  );
};

export default StudentDash;
