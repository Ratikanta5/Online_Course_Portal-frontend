import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  User,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Clock,
  Layers,
  CheckCircle,
  Star,
} from "lucide-react";
import { getExchangeRate } from "../../utils/exchangeRate";
import EnrollmentPayment from "../../components/EnrollmentPayment";
import CourseReview from "../../components/CourseReview";
import { useUser } from "../../context/UserContext";
import { getToken } from "../../utils/auth";

// Format date and time professionally
const formatDateTime = (dateString) => {
  if (!dateString) return "Date Not Available";
  try {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }) +
      " at " +
      date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    );
  } catch {
    return "Date Not Available";
  }
};

const CourseDetails = () => {
  const location = useLocation();
  const rawState = location?.state;
  const { user } = useUser();

  // Normalize course input (some routes pass an array, some a single object)
  const resolveCourse = (input) => {
    if (!input) return null;
    if (Array.isArray(input)) {
      return input.find((it) => it && (it._id || it.title)) || input[0] || null;
    }
    return input;
  };

  const course = resolveCourse(rawState);
  const [openTopics, setOpenTopics] = useState(new Set());
  const [exchangeRate, setExchangeRate] = useState(83);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);

  // Fetch real-time exchange rate on component mount
  useEffect(() => {
    const fetchRate = async () => {
      const rate = await getExchangeRate();
      setExchangeRate(rate);
    };
    fetchRate();
  }, []);

  // Check enrollment status
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!user || !course?._id) {
        setCheckingEnrollment(false);
        return;
      }

      try {
        const token = getToken();
        if (!token) {
          setCheckingEnrollment(false);
          return;
        }
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/payment/enrollment-status/${course._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (data.success && data.enrolled) {
          setEnrolled(true);
        }
      } catch (error) {
        console.error("Error checking enrollment:", error);
      } finally {
        setCheckingEnrollment(false);
      }
    };

    checkEnrollment();
  }, [user, course?._id]);

  if (!course) {
    return (
      <div className="pt-[90px] text-center text-red-600 font-semibold">
        Invalid Course Data
      </div>
    );
  }

  // Use averageRating from API if available
  const avgRating = course?.averageRating || 0;
  const totalReviews = course?.totalReviews || 0;

  // Resolve image URL from several possible shapes
  const imageUrl =
    (course?.courseImage && (course.courseImage.url || course.courseImage.secure_url || (Array.isArray(course.courseImage) && course.courseImage[0]?.url))) ||
    course?.thumbnail ||
    course?.image ||
    "/placeholder-course.png";

  // Debug if image missing
  useEffect(() => {
    if (course && (!imageUrl || imageUrl === "/placeholder-course.png")) {
      console.debug("CourseDetails: missing image, course:", course);
    }
  }, [course, imageUrl]);

  return (
    <div className="pt-[90px] px-6 lg:px-20 pb-20 max-w-7xl mx-auto">
      {/* ======================= GRID LAYOUT ======================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* ======================= LEFT MAIN CONTENT ======================= */}
        <div className="lg:col-span-2">
          {/* TITLE */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl lg:text-4xl font-extrabold text-slate-900"
          >
            {course.title}
          </motion.h1>

          {/* SUB HEADING */}
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  className={i < Math.round(avgRating) ? "" : "text-gray-300"}
                  fill={i < Math.round(avgRating) ? "gold" : "none"}
                />
              ))}
            </div>

            <span className="text-sm text-gray-600">
              {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </span>
          </div>

          {/* ======================= DESCRIPTION ======================= */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white p-6 rounded-xl shadow border border-gray-200"
          >
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-slate-900">
              <BookOpen className="w-6 h-6 text-blue-600" />
              Description
            </h2>

            <p className="text-slate-700 leading-relaxed text-[15.5px]">
              {course.description}
            </p>
          </motion.div>

          {/* ======================= TOPICS SECTION ======================= */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-5">
              Course Content
            </h2>

            {course.topics?.map((topic, idx) => {
              const isOpen = openTopics.has(idx);
              const toggleTopic = () => {
                const newSet = new Set(openTopics);
                if (newSet.has(idx)) {
                  newSet.delete(idx);
                } else {
                  newSet.add(idx);
                }
                setOpenTopics(newSet);
              };

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-xl mb-4 shadow-sm"
                >
                  {/* TOPIC HEADER */}
                  <button
                    onClick={() => toggleTopic()}
                    className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 transition select-none"
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-slate-900">
                        {topic.title}
                      </span>
                    </div>

                    {isOpen ? (
                      <ChevronUp className="text-slate-600" />
                    ) : (
                      <ChevronDown className="text-slate-600" />
                    )}
                  </button>

                  {/* LECTURES */}
                  {isOpen && (
                    <div className="px-4 pb-4 space-y-3">
                      {topic.lectures?.map((lec, j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <p className="font-medium text-slate-900 flex items-center gap-2">
                            <PlayCircle className="w-4 h-4 text-blue-600" />
                            {lec.title}
                          </p>

                          <p className="text-xs text-gray-600 mt-1 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {lec.coveredDuration}/{lec.lectureDuration} mins
                          </p>

                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            {lec.status === "approved" ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-gray-500" />
                            )}
                            Status: {lec.status}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* ======================= RIGHT SIDEBAR ======================= */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:sticky lg:top-[110px] h-fit bg-white rounded-xl shadow-xl border border-gray-200 p-5"
        >
          {/* Thumbnail */}
          <img
            src={imageUrl}
            alt={course?.title}
            className="w-full h-[220px] object-cover rounded-lg mb-4"
          />

          {/* Price */}
          <p className="text-3xl font-extrabold text-slate-900 mb-4">
            ₹{course.price || 0}{" "}
            <span className="text-gray-400 text-xl">/ ${Math.round((course.price / exchangeRate) * 100) / 100}</span>
          </p>

          {/* Enroll */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              if (user) {
                setPaymentOpen(true);
              } else {
                alert("Please login to enroll");
              }
            }}
            disabled={enrolled}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enrolled ? "Enrolled ✓" : "Enroll Now"}
          </motion.button>

          {/* Meta Info */}
          <div className="space-y-3 text-slate-700">
            <p className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">{course.category || "Not Specified"}</span>
            </p>

            <p className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">{course.creator.name || "Instructor Information Unavailable"}</span>
            </p>

            <p className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-slate-600">{formatDateTime(course.createdAt)}</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* ======================= INSTRUCTOR SECTION ======================= */}
<motion.div
  initial={{ opacity: 0, y: 15 }}
  animate={{ opacity: 1, y: 0 }}
  className="mt-14 bg-white p-6 rounded-2xl shadow border border-gray-200"
>
  <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
    <User className="w-6 h-6 text-blue-600" />
    Instructor
  </h2>

  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
    {/* Instructor Image */}
    <img
      src={
        course?.creator?.profileImage?.url ||
        "/placeholder-user.png"
      }
      alt={course.creator.name}
      className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-full shadow-md border border-gray-200"
    />

    {/* Instructor Details */}
    <div className="flex-1">
      <h3 className="text-xl font-semibold text-slate-900">
        {course.creator.name}
      </h3>

      <p className="text-sm text-gray-500 mt-1">
        {course.creator.email}
      </p>

      {/* Bio Placeholder */}
      <p className="text-slate-700 leading-relaxed mt-4 text-[15px]">
        {course.creator.bio
          ? course.creator.bio
          : "This instructor is experienced in creating high-quality educational content. More instructor details will be added soon."}
      </p>
    </div>
  </div>
</motion.div>

      {/* ======================= REVIEWS SECTION ======================= */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-14"
      >
        <CourseReview
          courseId={course?._id}
          courseName={course?.title}
          isEnrolled={enrolled}
          lecturerId={course?.creator?._id || course?.creator || course?.createdBy?._id || course?.createdBy}
        />
      </motion.div>

      {/* Payment Modal */}
      <EnrollmentPayment
        isOpen={paymentOpen}
        courseId={course?._id}
        courseName={course?.title}
        coursePrice={course?.price}
        courseImage={imageUrl}
        lecturerId={course?.creator?._id || course?.creator || course?.createdBy?._id || course?.createdBy}
        onClose={() => setPaymentOpen(false)}
        onSuccess={(enrollment) => {
          setEnrolled(true);
          setPaymentOpen(false);
          // Refresh enrollment status if needed
        }}
      />
    </div>
  );
};

export default CourseDetails;
