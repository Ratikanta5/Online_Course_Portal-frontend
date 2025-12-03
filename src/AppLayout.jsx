import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Nav from "./components/Nav";
import Login from "./pages/AuthPage/Login";
import { motion } from "framer-motion";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { getUser } from "./utils/auth";

const AppLayout = () => {
  const user = getUser()
  const [showLogin, setShowLogin] = useState(false);

  // Lock body scroll when modal opens
  useEffect(() => {
    document.body.style.overflow = showLogin ? "hidden" : "auto";
  }, [showLogin]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowLogin(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      <ScrollToTop />
      <Nav openLogin={() => setShowLogin(true)} />
      <Outlet />

      {showLogin && (
        <div
          className="
          fixed inset-0 
          bg-black/60 
          backdrop-blur-[2px]
          flex items-center justify-center 
          z-[9999] 
          px-4 sm:px-6
        "
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.25 }}
            className="
              relative 
              w-full max-w-sm sm:max-w-md 
              bg-white 
              p-5 sm:p-6
              rounded-2xl 
              shadow-2xl 
              border border-gray-200
            "
          >
            {/* Close Button */}
            <button
              onClick={() => setShowLogin(false)}
              className="
                absolute top-3 right-3 
                text-gray-500 hover:text-black 
                text-xl font-bold 
                w-8 h-8 
                flex items-center justify-center 
                rounded-full 
                hover:bg-gray-100
                transition
              "
            >
              ✕
            </button>

            <Login isModal closeLogin={() => setShowLogin(false)} />
          </motion.div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default AppLayout;
