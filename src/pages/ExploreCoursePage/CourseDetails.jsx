import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  User,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Clock,
  Layers,
  CheckCircle,
  Star,
} from "lucide-react";

const CourseDetails = () => {
  const { state: course } = useLocation();
  const [openTopic, setOpenTopic] = useState(null);

  if (!course) {
    return (
      <div className="pt-[90px] text-center text-red-600 font-semibold">
        Invalid Course Data
      </div>
    );
  }

  const avgRating = Math.round(
    course.reviews.reduce((a, b) => a + b, 0) / course.reviews.length
  );

  return (
    <div className="pt-[90px] px-6 lg:px-20 pb-20 max-w-7xl mx-auto">
      {/* ======================= GRID LAYOUT ======================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* ======================= LEFT MAIN CONTENT ======================= */}
        <div className="lg:col-span-2">
          {/* TITLE */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl lg:text-4xl font-extrabold text-slate-900"
          >
            {course.title}
          </motion.h1>

          {/* SUB HEADING */}
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  className={i < avgRating ? "" : "text-gray-300"}
                  fill={i < avgRating ? "gold" : "none"}
                />
              ))}
            </div>

            <span className="text-sm text-gray-600">
              {course.reviews.length} reviews
            </span>
          </div>

          {/* ======================= DESCRIPTION ======================= */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white p-6 rounded-xl shadow border border-gray-200"
          >
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-slate-900">
              <BookOpen className="w-6 h-6 text-blue-600" />
              Description
            </h2>

            <p className="text-slate-700 leading-relaxed text-[15.5px]">
              {course.description}
            </p>
          </motion.div>

          {/* ======================= TOPICS SECTION ======================= */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-5">
              Course Content
            </h2>

            {course.topics?.map((topic, idx) => {
              const isOpen = openTopic === idx;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-xl mb-4 shadow-sm"
                >
                  {/* TOPIC HEADER */}
                  <button
                    onClick={() => setOpenTopic(isOpen ? null : idx)}
                    className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 transition select-none"
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-slate-900">
                        {topic.title}
                      </span>
                    </div>

                    {isOpen ? (
                      <ChevronUp className="text-slate-600" />
                    ) : (
                      <ChevronDown className="text-slate-600" />
                    )}
                  </button>

                  {/* LECTURES */}
                  {isOpen && (
                    <div className="px-4 pb-4 space-y-3">
                      {topic.lectures?.map((lec, j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <p className="font-medium text-slate-900 flex items-center gap-2">
                            <PlayCircle className="w-4 h-4 text-blue-600" />
                            {lec.title}
                          </p>

                          <p className="text-xs text-gray-600 mt-1 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {lec.coveredDuration}/{lec.lectureDuration} mins
                          </p>

                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            {lec.status === "approved" ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-gray-500" />
                            )}
                            Status: {lec.status}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* ======================= RIGHT SIDEBAR ======================= */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:sticky lg:top-[110px] h-fit bg-white rounded-xl shadow-xl border border-gray-200 p-5"
        >
          {/* Thumbnail */}
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-[220px] object-cover rounded-lg mb-4"
          />

          {/* Price */}
          <p className="text-3xl font-extrabold text-slate-900 mb-4">
            ₹{course.priceINR}{" "}
            <span className="text-gray-400 text-xl">/ ${course.priceUSD}</span>
          </p>

          {/* Enroll */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition mb-6"
          >
            Enroll Now
          </motion.button>

          {/* Meta Info */}
          <div className="space-y-3 text-slate-700">
            <p className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">{course.category}</span>
            </p>

            <p className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">{course.lecturer}</span>
            </p>

            <p className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>{course.created_at}</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseDetails;
