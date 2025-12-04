// src/pages/VerifyEmail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const { token } = useParams(); // Get token from URL
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // "loading", "success", "error"
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Verification token missing.");
        return;
      }

      try {
        // Call backend verify endpoint
        const res = await axios.post(
          `http://localhost:8080/api/auth/verify/${token}`
        );
        setStatus("success");
        setMessage(res.data.message);

        // Redirect to login after 4 seconds
        setTimeout(() => {
          navigate("/explore-courses");
        }, 4000);
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Verification failed. Token may be invalid or expired."
        );
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        {status === "loading" && (
          <p className="text-blue-500 text-lg">Verifying your email...</p>
        )}
        {status === "success" && (
          <p className="text-green-600 text-lg">{message}</p>
        )}
        {status === "error" && (
          <p className="text-red-600 text-lg">{message}</p>
        )}

        {status !== "loading" && (
          <button
            onClick={() => navigate("/explore-courses")}
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
