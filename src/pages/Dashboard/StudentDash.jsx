import React from "react";
import { motion } from "framer-motion";
import {
  UserCircle,
  BookOpen,
  Clock,
  Award,
  ArrowRight,
  PlayCircle,
} from "lucide-react";
import { getUser } from "../../utils/auth";

const StudentDash = () => {
  const user = getUser();

  // Dummy enrolled courses
  const enrolledCourses = [
    {
      id: 1,
      title: "React Mastery Bootcamp",
      progress: 65,
      thumbnail:
        "https://i.ytimg.com/vi/MHn66JJH5zs/maxresdefault.jpg",
      lastAccessed: "2 days ago",
    },
    {
      id: 2,
      title: "Python for Data Science",
      progress: 40,
      thumbnail:
        "https://i.ytimg.com/vi/MHn66JJH5zs/maxresdefault.jpg",
      lastAccessed: "5 days ago",
    },
  ];

  return (
    <div className="pt-[90px] px-6 lg:px-16 pb-16 min-h-screen bg-gray-50">
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
            value: enrolledCourses.length,
          },
          {
            icon: <Clock className="w-6 h-6 text-blue-600" />,
            label: "Hours Studied",
            value: 32,
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

      {enrolledCourses.length === 0 ? (
        <p className="text-gray-600">You have not enrolled in any courses yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((c, index) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-lg transition"
            >
              <img
                src={c.thumbnail}
                alt={c.title}
                className="w-full h-36 object-cover"
              />

              <div className="p-4">
                <h3 className="font-bold text-slate-900 text-sm">
                  {c.title}
                </h3>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${c.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {c.progress}% completed
                  </p>
                </div>

                <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-4 h-4" /> Last accessed:{" "}
                  {c.lastAccessed}
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                >
                  <PlayCircle className="w-5 h-5" />
                  Continue
                </motion.button>
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
