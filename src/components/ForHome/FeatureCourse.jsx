import { motion } from "framer-motion";
import React from "react";
import { RefreshCw, AlertCircle, BookOpen } from "lucide-react";
import CourseCard from "../CouseCards";


  //  SKELETON CARD COMPONENT

const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden animate-pulse w-full max-w-[300px]">
    <div className="w-full h-40 bg-gray-300"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-300 rounded"></div>
      <div className="h-3 bg-gray-300 rounded w-2/3"></div>
      <div className="flex gap-2 mt-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-4 h-4 bg-gray-300 rounded"></div>
        ))}
      </div>
      <div className="h-4 bg-gray-300 rounded w-1/3"></div>
    </div>
  </div>
);


  //  ERROR STATE COMPONENT
const ErrorState = ({ onRetry }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-12 px-4"
  >
    <div className="bg-red-50 rounded-full p-3 mb-3">
      <AlertCircle className="w-8 h-8 text-red-500" />
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">
      Unable to Load Courses
    </h3>
    <p className="text-gray-600 text-center text-sm max-w-md mb-4">
      We couldn't fetch the featured courses. Please try again.
    </p>
    {onRetry && (
      <motion.button
        onClick={onRetry}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </motion.button>
    )}
  </motion.div>
);

/* -----------------------------------------------------
   EMPTY STATE COMPONENT
------------------------------------------------------ */
const EmptyState = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-12 px-4"
  >
    <div className="bg-blue-50 rounded-full p-3 mb-3">
      <BookOpen className="w-8 h-8 text-blue-500" />
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">
      No Courses Available Yet
    </h3>
    <p className="text-gray-600 text-center text-sm max-w-md">
      New courses are being added regularly. Check back soon!
    </p>
  </motion.div>
);

const FeatureCourse = ({ dummyCourses = [], getAverageStars, loading = false, error = null, onRetry }) => {

  // Select random 4 courses (or less if fewer exist) and shuffle each render
  const shuffledCourses = React.useMemo(() => {
    if (!dummyCourses || dummyCourses.length === 0) return [];
    
    const maxDisplay = 4;
    
    // If we have fewer courses than maxDisplay, use all
    // Otherwise, randomly select maxDisplay courses
    let selectedCourses = dummyCourses;
    if (dummyCourses.length > maxDisplay) {
      selectedCourses = [];
      const indices = new Set();
      while (indices.size < maxDisplay) {
        indices.add(Math.floor(Math.random() * dummyCourses.length));
      }
      selectedCourses = Array.from(indices).map(i => dummyCourses[i]);
    }
    
    // Fisher-Yates shuffle
    const arr = [...selectedCourses];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [dummyCourses]);

  return (
    <section className="mt-8 mb-10">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900"
        >
          Featured Courses
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-slate-600 mt-3 text-sm sm:text-base"
        >
          Explore our top-rated courses and start learning today
        </motion.p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 place-items-center">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <ErrorState onRetry={onRetry} />
      )}

      {/* Empty State */}
      {!loading && !error && shuffledCourses.length === 0 && (
        <EmptyState />
      )}

      {/* Course Cards */}
      {!loading && !error && shuffledCourses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 place-items-center">
          {shuffledCourses.map((course, index) => (
            <CourseCard
              key={course._id || course.id || index}
              course={course}
              avgStars={getAverageStars(course.reviews)}
              index={index}
            />
          ))}
        </div>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center mt-10 text-slate-600 text-sm sm:text-base"
      >
        {shuffledCourses.length > 0 
          ? "Sign up now to unlock all courses and start your learning journey."
          : ""
        }
      </motion.p>
    </section>
  );
};

export default FeatureCourse;
