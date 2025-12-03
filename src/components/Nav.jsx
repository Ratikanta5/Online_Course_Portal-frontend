import React, { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../utils/auth";

const Nav = ({ openLogin }) => {
  const user = getUser();
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/60 border-b border-white/30 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 md:px-10 lg:px-16">
        {/* Logo + text */}
        <div
          className="flex items-center gap-2 group cursor-pointer"
          onClick={() => navigate("/")}
        >
          <motion.div
            whileHover={{ rotate: 360 }}
            whileTap={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600 group-hover:text-sky-500 transition-colors" />
          </motion.div>

          <span className="font-semibold text-base sm:text-lg text-gray-800 group-hover:text-sky-500 transition-colors">
            LearnSphere
          </span>
        </div>

        {/* CTA Button */}

        {user ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openLogin}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 text-white 
                     rounded-lg font-medium text-sm sm:text-base
                     hover:bg-indigo-700 transition"
          >
            Profile
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openLogin}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 text-white 
                     rounded-lg font-medium text-sm sm:text-base
                     hover:bg-indigo-700 transition"
          >
            Get Started
          </motion.button>
        )}
      </div>
    </nav>
  );
};

export default Nav;
