import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const CourseCard = ({ course, avgStars, index }) => {
  const [currency, setCurrency] = useState("INR");

  const navigate = useNavigate();

  const description = async (course) => {
    navigate("/course-about", { state: course });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.03 }}
      className="bg-white rounded-xl shadow-lg border border-blue-100
             w-[260px] sm:w-[300px] h-[390px] flex flex-col overflow-hidden"
    >
      {/* THUMBNAIL */}
      <motion.img
        src={course.thumbnail}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
        className="w-full h-[160px] object-cover"
        alt={course.title}
      />

      {/* CONTENT */}
      <div className="p-4 flex flex-col justify-between flex-1">
        {/* Title + Desc + Rating */}
        <div>
          <h3 className="text-base font-bold text-slate-900 truncate">
            {course.title}
          </h3>

          <p className="text-slate-600 text-xs mt-1 line-clamp-2">
            {course.description}
          </p>

          {/* RATING */}
          <div className="flex items-center mt-2">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-sm ${
                  i < avgStars ? "text-yellow-500" : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
            <span className="text-slate-500 text-xs ml-2">
              ({course.reviews.length})
            </span>
          </div>
        </div>

        {/* Price + Toggle + Meta */}
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <p className="text-slate-900 font-semibold text-sm">
              {currency === "INR"
                ? `₹${course.priceINR}`
                : `$${course.priceUSD}`}
            </p>

            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => setCurrency(currency === "INR" ? "USD" : "INR")}
              className="px-2 py-1 text-[10px] bg-blue-100 text-blue-600 
                     rounded-md hover:bg-blue-200 transition"
            >
              {currency === "INR" ? "USD" : "INR"}
            </motion.button>
          </div>

          <p className="text-slate-500 text-[11px] truncate mt-2">
            {course.lecturer}
          </p>
          <p className="text-gray-400 text-[10px]">{course.created_at}</p>

          {/* DETAILS BUTTON — FIXED POSITION + UI UPGRADE */}
          <motion.button
            onClick={() => description(course)}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.96 }}
            className="
          mt-3
          w-full
          py-2
          rounded-lg
          text-xs sm:text-sm
          font-semibold
          bg-blue-600 text-white
          shadow-sm
          hover:bg-blue-700
          hover:shadow-md
          transition
        "
          >
            Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
