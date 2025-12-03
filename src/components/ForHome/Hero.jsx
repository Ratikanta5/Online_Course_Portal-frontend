import { motion } from "framer-motion";
import React from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../utils/auth";

const Hero = () => {
  const navigate = useNavigate()
  const user = getUser()
  return (
    <section className="flex flex-col items-center justify-center text-center w-full min-h-[60vh]">
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900"
      >
        Learn Without <span className="text-blue-600">Limits</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mt-5 text-slate-700 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto"
      >
        Access world-class courses from expert instructors. Build your skills,
        advance your career, and achieve your learning goals.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-8 flex flex-col sm:flex-row justify-center gap-5"
      >
        <button
          onClick={() => navigate("/explore-courses")}
          className="px-8 py-3 bg-white border border-blue-300 text-blue-600 rounded-xl 
                       font-semibold text-base shadow-md hover:bg-blue-50 hover:shadow-xl transition"
        >
          Explore Courses
        </button>

        {
          user &&
          <button
          onClick={() => navigate(`/${user.role}`)}
          className="px-8 py-3 bg-white border border-blue-300 text-blue-600 rounded-xl 
                       font-semibold text-base shadow-md hover:bg-blue-50 hover:shadow-xl transition"
        >
          My Enrollments
        </button>
        }
      </motion.div>
    </section>
  );
};

export default Hero;
