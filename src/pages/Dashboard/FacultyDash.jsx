import React from "react";
import { motion } from "framer-motion";
import {
  UserCircle,
  BookOpen,
  Users,
  FilePlus,
  Settings,
  BarChart,
  Edit,
  Eye,
  Clock,
} from "lucide-react";
import { getUser } from "../../utils/auth";

const FacultyDash = () => {
  const user = getUser();

  // Dummy Courses Created by Lecturer
  const courses = [
    {
      id: 1,
      title: "React Mastery Bootcamp",
      created: "2025-01-12",
      students: 120,
      status: "Published",
    },
    {
      id: 2,
      title: "Advanced Java Programming",
      created: "2025-02-02",
      students: 85,
      status: "Draft",
    },
    {
      id: 3,
      title: "Python for Machine Learning",
      created: "2025-02-15",
      students: 150,
      status: "Published",
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
          <UserCircle className="w-16 h-16 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome, {user?.name || "Lecturer"} 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your courses and track your teaching performance.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ======================= STATS ======================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          {
            icon: <BookOpen className="w-6 h-6 text-purple-600" />,
            label: "Courses Created",
            value: courses.length,
          },
          {
            icon: <Users className="w-6 h-6 text-purple-600" />,
            label: "Total Students",
            value: courses.reduce((a, b) => a + b.students, 0),
          },
          {
            icon: <Clock className="w-6 h-6 text-purple-600" />,
            label: "Pending Drafts",
            value: courses.filter((c) => c.status === "Draft").length,
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

      {/* ======================= ACTION BUTTON ======================= */}
      <div className="flex justify-end mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-5 py-3 bg-purple-600 text-white rounded-lg shadow-md 
                     flex items-center gap-2 hover:bg-purple-700 transition"
        >
          <FilePlus className="w-5 h-5" />
          Create New Course
        </motion.button>
      </div>

      {/* ======================= COURSES TABLE ======================= */}
      <div className="bg-white p-6 rounded-xl border shadow-sm overflow-x-auto">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Your Courses</h2>

        <table className="w-full text-left min-w-[700px]">
          <thead>
            <tr className="text-sm text-gray-600 border-b">
              <th className="py-2">Course Title</th>
              <th className="py-2">Students</th>
              <th className="py-2">Created</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {courses.map((course, i) => (
              <motion.tr
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="py-3 font-medium text-slate-800">
                  {course.title}
                </td>
                <td className="py-3 text-gray-700">{course.students}</td>
                <td className="py-3 text-gray-700">{course.created}</td>
                <td
                  className={`py-3 font-semibold ${
                    course.status === "Published"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {course.status}
                </td>
                <td className="py-3 flex gap-3">
                  <button className="text-blue-600 hover:text-blue-800">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="text-purple-600 hover:text-purple-800">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button className="text-gray-600 hover:text-gray-900">
                    <Settings className="w-5 h-5" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ======================= RECENT ACTIVITY ======================= */}
      <h2 className="text-xl font-bold text-slate-900 mt-14 mb-4">
        Recent Actions
      </h2>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <p className="text-gray-600 text-sm flex items-center gap-2">
          <BarChart className="w-4 h-4 text-purple-600" />
          Updated course: "React Mastery Bootcamp"
        </p>

        <p className="text-gray-600 text-sm flex items-center gap-2 mt-2">
          <BarChart className="w-4 h-4 text-purple-600" />
          Added new lecture to "Python ML Course"
        </p>
      </div>
    </div>
  );
};

export default FacultyDash;
