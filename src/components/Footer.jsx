import { GraduationCap } from "lucide-react";
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-200 py-12 px-5 sm:px-10 lg:px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* EduPortal Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">EduPortal</h2>
          </div>

          <p className="text-gray-400">
            Empowering learners worldwide with quality online education.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-1">
            <li>
              <a href="/" className="hover:text-blue-500 transition">
                Home
              </a>
            </li>
            <li>
              <a href="/login" className="hover:text-blue-500 transition">
                Login
              </a>
            </li>
            <li>
              <a href="/courses" className="hover:text-blue-500 transition">
                Courses
              </a>
            </li>
            <li>
              <a href="/about" className="hover:text-blue-500 transition">
                About Us
              </a>
            </li>
            <li>
              <a href="/resources" className="hover:text-blue-500 transition">
                Resources
              </a>
            </li>
            <li>
              <a href="/help" className="hover:text-blue-500 transition">
                Help Center
              </a>
            </li>
            <li>
              <a href="/terms" className="hover:text-blue-500 transition">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="/privacy" className="hover:text-blue-500 transition">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-blue-500 transition">
                Contact Us
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-3">Contact</h3>

          <p className="text-gray-400">learnsphere.page@gmail.com</p>
          <p className="text-gray-400">+91 95565 63490</p>
          <p className="text-gray-400">Bhubaneswar, Odisha, India, 752054</p>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-10 border-t border-gray-700 pt-5 text-center text-gray-500 text-sm">
        © 2025 EduPortal. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
