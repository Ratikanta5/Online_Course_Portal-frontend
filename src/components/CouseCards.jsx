import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getExchangeRate } from "../utils/exchangeRate";

const CourseCard = ({ course, avgStars, index }) => {
  const [exchangeRate, setExchangeRate] = useState(83);
  const navigate = useNavigate();

  // Resolve image URL (courseImage may be object or array)
  const imageUrl =
    (course?.courseImage && (course.courseImage.url || course.courseImage.secure_url || (Array.isArray(course.courseImage) && course.courseImage[0]?.url))) ||
    course?.thumbnail ||
    course?.image ||
    "/placeholder-course.png";

  // Created date fallback
  const createdAt = course?.createdAt || course?.created_at || null;
  const createdDate = createdAt ? new Date(createdAt).toLocaleDateString() : "";

  // Lecturer fallback
  const lecturerName = course?.creator?.name || course?.lecturer?.name || course?.lecturer || "Instructor Unavailable";

  // Fetch real-time exchange rate on component mount
  useEffect(() => {
    const fetchRate = async () => {
      const rate = await getExchangeRate();
      setExchangeRate(rate);
    };
    fetchRate();
  }, []);

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
        src={imageUrl}
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
              ({course.reviews?.length || 0})
            </span>
          </div>
        </div>

        {/* Price + Toggle + Meta */}
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <p className="text-slate-900 font-semibold text-sm">
              ₹{course.price || 0} / ${Math.round((course.price / exchangeRate) * 100) / 100}
            </p>
          </div>

          <p className="text-slate-500 text-[11px] truncate mt-2">
            {lecturerName}
          </p>
          <p className="text-gray-400 text-[10px]">{createdDate}</p>

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
