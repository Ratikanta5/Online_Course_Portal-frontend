import React from "react";
import { motion } from "framer-motion";
import { Video, Timer, Award, UserCheck } from "lucide-react";

const ChooseUs = () => {
  return (
    <section className="mt-10 mb-14">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900"
        >
          Why Choose <span className="text-blue-600">EduPortal?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-slate-600 mt-3 text-base sm:text-lg"
        >
          We provide everything you need to succeed in your learning journey.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {[
          {
            icon: Video,
            title: "HD Video Quality",
            desc: "Crystal clear video lectures with HD streaming.",
          },
          {
            icon: Timer,
            title: "Learn at Your Pace",
            desc: "Study anytime with lifetime access.",
          },
          {
            icon: Award,
            title: "Earn Certificates",
            desc: "Get recognized for your achievements.",
          },
          {
            icon: UserCheck,
            title: "Expert Instructors",
            desc: "Learn from real industry professionals.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-md border border-blue-100 hover:shadow-xl transition group"
          >
            <item.icon className="w-10 h-10 text-blue-600 mb-4 group-hover:scale-110 transition" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {item.title}
            </h3>
            <p className="text-slate-600 text-sm">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ChooseUs;
