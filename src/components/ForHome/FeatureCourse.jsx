import { motion } from "framer-motion";
import React from "react";
import CourseCard from "../CouseCards";

const FeatureCourse = ({ dummyCourses, getAverageStars }) => {

  // 🔥 Random shuffle each render
  const shuffledCourses = React.useMemo(() => {
    const arr = [...dummyCourses];
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
          Login to unlock access to all our premium courses
        </motion.p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 place-items-center">
        {shuffledCourses.map((course, index) => (
          <CourseCard
            key={index}
            course={course}
            avgStars={getAverageStars(course.reviews)}
            index={index}
          />
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center mt-10 text-slate-600 text-sm sm:text-base"
      >
        Sign up now to unlock all courses and start your learning journey.
      </motion.p>
    </section>
  );
};

export default FeatureCourse;
