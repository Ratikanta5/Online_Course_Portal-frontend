import React from "react";
import { motion } from "framer-motion";

const StatSection = () => {
  return (
    <section className="mt-8 mb-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center max-w-4xl mx-auto w-full">
      {[
        { value: "500+", label: "Courses" },
        { value: "10K+", label: "Students" },
        { value: "95%", label: "Success Rate" },
      ].map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="p-6 bg-white rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-600">
            {stat.value}
          </h2>
          <p className="text-slate-700 font-medium mt-2 text-lg">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </section>
  );
};

export default StatSection;
