import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User } from "lucide-react";
import SubmitButton from "./SubmitButton";
import InputField from "./InputField";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setUser as persistUser, setToken } from "../../utils/auth";
import { useUser } from "../../context/UserContext";

const Login = ({ isModal, closeLogin }) => {
  const navigate = useNavigate();
  const { setUser: setCtxUser } = useUser();

  const [activeTab, setActiveTab] = useState("login");

  // LOGIN STATES
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // REGISTER STATES
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("student");
  const [regBio, setRegBio] = useState("");

  const [regImage, setRegImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [error, setError] = useState("");

  // ------------------- LOGIN HANDLER -------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { email: loginEmail, password: loginPassword }
      );

      const { id, role } = data.user;
      const { token } = data;
      console.log("Login response token:", token);
      // persist token & minimal user info
      setToken(token);
      console.log("Token stored in localStorage:", localStorage.getItem("authToken"));
      persistUser({ id, role });

      // fetch full user profile (/me) so we have image/bio/createdAt
      try {
        const { data: meData } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/auth/me`,
          { params: { id, role } }
        );

        if (meData?.user && setCtxUser) {
          setCtxUser(meData.user);
        } else if (setCtxUser) {
          setCtxUser(data.user);
        }
      } catch (meErr) {
        console.error("Failed to fetch /me after login:", meErr);
        if (setCtxUser) setCtxUser(data.user);
      }

      if (isModal && closeLogin) closeLogin();

      switch (role) {
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
      console.error("Login error:", err);
      const msg = err.response?.data?.message || err.message || "Login failed";
      setError(msg);
    }
  };

  // ------------------- REGISTER HANDLER -------------------
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!regName || !regEmail || !regPassword) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", regName);
      formData.append("email", regEmail);
      formData.append("password", regPassword);
      formData.append("role", regRole);
      formData.append("bio", regBio);

      if (regImage) {
        formData.append("profileImage", regImage);
      }

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setActiveTab("login");
      setError("Registration successful! Please check your email.");

      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setRegBio("");
      setRegRole("student");
      setRegImage(null);
      setPreviewImage(null);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div
      className={
        isModal
          ? "w-full max-h-screen overflow-y-auto"
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

            {/* ================= IMAGE UPLOAD UI ================= */}
            <div>
              <label className="text-sm font-medium text-gray-800">
                Profile Picture
              </label>

              <motion.div
                whileHover={{ scale: 1.01 }}
                className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                onClick={() => document.getElementById("uploadPic").click()}
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    className="w-24 h-24 object-cover rounded-full shadow-md"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                      <User className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Click to upload profile image
                    </p>
                  </div>
                )}
              </motion.div>

              <input
                type="file"
                id="uploadPic"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setRegImage(file);
                    setPreviewImage(URL.createObjectURL(file));
                  }
                }}
              />
            </div>

            {/* ROLE */}
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

            {/* BIO */}
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
