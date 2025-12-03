import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User } from "lucide-react";
import SubmitButton from "./SubmitButton";
import InputField from "./InputField";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setUser } from "../../utils/auth";

const Login = ({ isModal, closeLogin }) => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("student");
  const [regBio, setRegBio] = useState("");

  const [error, setError] = useState("");

  // --- LOGIN HANDLER ---
 const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/auth/login`,
      { email: loginEmail, password: loginPassword }
    );

    console.log(data);

    

    const {id, role} = data.user

    // Save to localStorage
    setUser({id,role});

    if (isModal && closeLogin) closeLogin();

    // Navigate by role
    switch (data.user.role) {
      case "admin":
        navigate("/admin");
        break;
      case "lecture":
        navigate("/lecture");
        break;
      case "student":
        navigate("/student");
        break;
      default:
        navigate("/");
    }
  } catch (err) {
    setError(err.response?.data?.message || "Login failed");
  }
};




  // --- REGISTER HANDLER ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("Registration endpoint not implemented yet.");
  };

  return (
    <div
      className={
        isModal
          ? "w-full"
          : "min-h-screen bg-black flex items-center justify-center px-4"
      }
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.28 }}
        className={`w-full rounded-2xl shadow-2xl border border-gray-200 ${
          isModal ? "max-w-sm bg-white p-6" : "max-w-lg bg-white p-8"
        }`}
      >
        {/* TABS */}
        <div className="flex mb-6 rounded-xl bg-gray-100 border border-gray-300 overflow-hidden">
          {["login", "register"].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              whileTap={{ scale: 0.96 }}
              className={`flex-1 py-2.5 font-semibold text-sm transition-all ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab === "login" ? "Login" : "Register"}
            </motion.button>
          ))}
        </div>

        {/* ERROR BOX */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-red-100 text-red-700 text-sm p-3 rounded-lg border border-red-300"
          >
            {error}
          </motion.div>
        )}

        {/* ================= LOGIN FORM ================= */}
        {activeTab === "login" && (
          <motion.form
            onSubmit={handleLogin}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <InputField
              label="Email Address"
              icon={<Mail className="w-5 h-5 text-gray-500" />}
              value={loginEmail}
              onChange={setLoginEmail}
              type="email"
              placeholder="you@example.com"
            />

            <InputField
              label="Password"
              icon={<Lock className="w-5 h-5 text-gray-500" />}
              value={loginPassword}
              onChange={setLoginPassword}
              type="password"
              placeholder="•••••••••"
            />

            <SubmitButton text="Login" />
          </motion.form>
        )}

        {/* ================= REGISTER FORM ================= */}
        {activeTab === "register" && (
          <motion.form
            onSubmit={handleRegister}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <InputField
              label="Full Name"
              icon={<User className="w-5 h-5 text-gray-500" />}
              value={regName}
              onChange={setRegName}
              type="text"
              placeholder="John Doe"
            />

            <InputField
              label="Email"
              icon={<Mail className="w-5 h-5 text-gray-500" />}
              value={regEmail}
              onChange={setRegEmail}
              type="email"
              placeholder="you@example.com"
            />

            <InputField
              label="Password"
              icon={<Lock className="w-5 h-5 text-gray-500" />}
              value={regPassword}
              onChange={setRegPassword}
              type="password"
              placeholder="•••••••••"
            />

            <div>
              <label className="text-sm font-medium text-gray-800">
                Select Role
              </label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
                className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400"
              >
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-800">
                Bio (optional)
              </label>
              <textarea
                value={regBio}
                onChange={(e) => setRegBio(e.target.value)}
                rows={2}
                className="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400"
                placeholder="Tell something about yourself..."
              />
            </div>

            <SubmitButton text="Create Account" />
          </motion.form>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
