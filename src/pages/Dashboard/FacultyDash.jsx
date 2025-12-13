import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  PlusCircle,
  GraduationCap,
  Menu,
  X,
  Upload,
  Trash2,
  Plus,
  Video,
  FileText,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  ChevronDown,
  ChevronUp,
  Save,
  Image,
  AlertCircle,
  LogOut,
  Settings,
  HelpCircle,
  ChevronLeft,
  RefreshCw,
  CheckCircle2,
  Clock,
  Loader2,
  Bell,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import { useCourses } from "../../context/CourseContext";
import { useNotifications } from "../../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken, clearAuth } from "../../utils/auth";
import { NotificationTemplates, sendNotificationToRole } from "../../utils/notificationApi";
import ApprovalPendingModal from "../../components/ApprovalPendingModal";

const FacultyDash = () => {
  const { user, loading: userLoading } = useUser();
  const { courses, loading: coursesLoading, error: coursesError, refetchCourses } = useCourses();
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [lecturerCourses, setLecturerCourses] = useState([]);
  const [lecturerCoursesLoading, setLecturerCoursesLoading] = useState(false);
  const [lecturerCoursesError, setLecturerCoursesError] = useState(null);
  
  // Approval pending modal state
  const [approvalModal, setApprovalModal] = useState({
    isOpen: false,
    type: 'course',
    contentName: ''
  });
  
  // Earnings state
  const [earnings, setEarnings] = useState({
    totalEarning: 0,
    totalEnrollments: 0,
    breakdown: []
  });
  const [earningsLoading, setEarningsLoading] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate("/");
    window.location.reload();
  };

  // Fetch lecturer's earnings
  const fetchLecturerEarnings = async () => {
    try {
      setEarningsLoading(true);
      const token = sessionStorage.getItem("authToken");
      
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/payment/lecturer-earnings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setEarnings(res.data.revenue || {
          totalEarning: 0,
          totalEnrollments: 0,
          breakdown: []
        });
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
    } finally {
      setEarningsLoading(false);
    }
  };

  // Fetch lecturer's own courses (with all statuses: pending, approved, rejected)
  const fetchLecturerCourses = async () => {
    try {
      setLecturerCoursesLoading(true);
      setLecturerCoursesError(null);
      const token = sessionStorage.getItem("authToken");
      
      console.log("Fetching from:", `${import.meta.env.VITE_API_URL}/api/lecturer/courses`);
      console.log("Token:", token);
      console.log("User role:", user?.role);
      console.log("Full user object:", user);
      
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/lecturer/courses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Lecturer courses fetched:", res.data);
      
      if (res.data.success) {
        setLecturerCourses(res.data.courses || []);
      }
    } catch (error) {
      console.error("Error fetching lecturer courses:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      setLecturerCoursesError(error.response?.data?.message || "Failed to load courses");
    } finally {
      setLecturerCoursesLoading(false);
    }
  };

  // Fetch lecturer courses on mount
  useEffect(() => {
    if (user?._id) {
      fetchLecturerCourses();
      fetchLecturerEarnings();
    }
  }, [user?._id]);

  // Use lecturer courses instead of filtered courses
  const myCourses = lecturerCourses;

  // Calculate stats - use real earnings from API
  const totalEnrollments = earnings.totalEnrollments || myCourses.reduce(
    (acc, c) => acc + (c.enrolledStudents?.length || 0),
    0
  );
  const totalEarnings = earnings.totalEarning || 0;

  // Get all enrolled students across all courses
  const allEnrolledStudents = myCourses.flatMap((course) =>
    (course.enrolledStudents || []).map((student) => ({
      ...student,
      courseName: course.title,
      courseId: course._id,
    }))
  );

  const menuItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "add-course", label: "Add Course", icon: PlusCircle },
    { id: "my-courses", label: "My Courses", icon: BookOpen },
    { id: "students", label: "Students Enrolled", icon: GraduationCap },
  ];

  const menuBadges = {
    "my-courses": myCourses.length,
    students: allEnrolledStudents.length,
  };

  const activeLabel =
    menuItems.find((item) => item.id === activeMenu)?.label || "Dashboard";

  const renderActiveSection = () => (
    <AnimatePresence mode="wait">
      {activeMenu === "dashboard" && (
        <DashboardSection
          key="dashboard"
          myCourses={myCourses}
          totalEnrollments={totalEnrollments}
          totalEarnings={totalEarnings}
          earningsBreakdown={earnings.breakdown}
          earningsLoading={earningsLoading}
          user={user}
          coursesError={coursesError}
        />
      )}
      {activeMenu === "add-course" && (
        <AddCourseSection 
          key="add-course" 
          user={user} 
          refetchCourses={() => {
            refetchCourses();
            fetchLecturerCourses();
          }}
          setApprovalModal={setApprovalModal}
        />
      )}
      {activeMenu === "my-courses" && (
        <MyCoursesSection key="my-courses" myCourses={myCourses} />
      )}
      {activeMenu === "students" && (
        <StudentsSection
          key="students"
          enrolledStudents={allEnrolledStudents}
        />
      )}
    </AnimatePresence>
  );

  // Loading state
  if (userLoading || lecturerCoursesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[70px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
            <BookOpen className="w-10 h-10 text-purple-600" />
          </motion.div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (lecturerCoursesError) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[70px] flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{lecturerCoursesError}</p>
          <p className="text-sm text-gray-500 mb-6">
            Make sure you logged in as a lecturer with the correct role.
          </p>
          <button
            onClick={() => {
              clearAuth();
              navigate("/");
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-purple-50/30 pt-24 lg:pt-[90px] pb-16 lg:pb-14 px-4 sm:px-5 lg:px-6 lg:flex lg:items-start lg:gap-6">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-[90px] left-4 z-50 p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed lg:sticky top-[88px] lg:top-[70px] left-0 h-[calc(100vh-88px)] lg:h-[calc(100vh-70px)] bg-gradient-to-b from-slate-900 via-purple-900 to-indigo-950 shadow-2xl z-40
          transform transition-transform duration-300 ease-in-out flex flex-col rounded-r-2xl lg:rounded-none
          w-[82vw] max-w-[340px] lg:w-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:self-start lg:min-w-[220px] lg:max-w-[280px]`}
      >
        {/* Logo/Brand Section */}
        <div className={`border-b border-white/10 ${sidebarCollapsed ? "p-3" : "p-5"}`}>
          <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <BookOpen size={20} className="text-white" />
            </div>
            {!sidebarCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="font-bold text-white text-lg">DevHub</h2>
                <p className="text-[10px] text-purple-300 -mt-0.5">Learning Platform</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Collapse Button - Desktop Only */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white rounded-full items-center justify-center text-purple-600 shadow-lg hover:bg-purple-50 transition z-50 border border-gray-200"
        >
          <ChevronLeft size={14} className={`transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`} />
        </button>

        {/* Profile Section */}
        <div className={`border-b border-white/10 ${sidebarCollapsed ? "p-3" : "p-5"}`}>
          <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"}`}>
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center overflow-hidden ring-2 ring-white/20 flex-shrink-0">
              {user?.profileImage?.url ? (
                <img
                  src={user.profileImage.url}
                  alt="Profile"
                  className="w-11 h-11 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-base">
                  {user?.name?.charAt(0)?.toUpperCase() || "L"}
                </span>
              )}
            </div>
            {!sidebarCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 min-w-0"
              >
                <h3 className="font-semibold text-white truncate text-sm">
                  {user?.name || "Lecturer"}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 text-[10px] text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                  <span className="text-[10px] text-purple-300">• Faculty</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${sidebarCollapsed ? "p-2" : "p-4"} space-y-1 overflow-y-auto`}>
          {menuItems.map((item) => {
            const badge = menuBadges[item.id];
            const isActive = activeMenu === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  setSidebarOpen(false);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center justify-between ${sidebarCollapsed ? "px-2" : "gap-3 px-4"} py-3 rounded-xl text-left transition-all
                  ${
                    isActive
                      ? "bg-white text-purple-900 shadow-lg font-semibold"
                      : "text-purple-100 hover:bg-white/10"
                  }`}
                title={sidebarCollapsed ? item.label : ""}
              >
                <div className={`flex items-center ${sidebarCollapsed ? "justify-center flex-1" : "gap-3"}`}>
                  <item.icon size={20} className="flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </div>

                {!sidebarCollapsed && badge !== undefined && (
                  <span className={`text-xs px-2 py-1 rounded-full ${isActive ? "bg-purple-100 text-purple-800" : "bg-white/10 text-purple-100"}`}>
                    {badge}
                  </span>
                )}

                {sidebarCollapsed && badge ? (
                  <span className="ml-2 h-2 w-2 rounded-full bg-amber-300" />
                ) : null}
              </motion.button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className={`border-t border-purple-700/50 ${sidebarCollapsed ? "p-2" : "p-4"}`}>
          {/* Help Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2" : "gap-3 px-4"} py-2.5 rounded-xl text-purple-200 hover:bg-white/10 transition-all mb-2`}
            title={sidebarCollapsed ? "Help & Support" : ""}
          >
            <HelpCircle size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm">Help & Support</span>}
          </motion.button>

          {/* Settings Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2" : "gap-3 px-4"} py-2.5 rounded-xl text-purple-200 hover:bg-white/10 transition-all mb-2`}
            title={sidebarCollapsed ? "Settings" : ""}
          >
            <Settings size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm">Settings</span>}
          </motion.button>

          {/* Logout Button */}
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2" : "gap-3 px-4"} py-2.5 rounded-xl text-red-300 hover:bg-red-500/20 transition-all`}
            title={sidebarCollapsed ? "Logout" : ""}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
          </motion.button>

          {/* Copyright - Only when expanded */}
          {!sidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 pt-4 border-t border-purple-700/30"
            >
              <p className="text-[10px] text-purple-400 text-center">
                © 2025 DevHub Learning
              </p>
              <p className="text-[10px] text-purple-500 text-center mt-1">
                v1.0.0
              </p>
            </motion.div>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        className="hidden lg:block flex-1 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-70px)] transition-all pb-12 w-full"
      >
        <div className="w-full max-w-6xl xl:max-w-7xl mx-auto space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-purple-500 font-semibold">Faculty workspace</p>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">{activeLabel}</h1>
              <p className="text-gray-500 mt-2 text-sm">
                Stay on top of courses, content, and student engagement in one streamlined view.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveMenu("add-course")}
                className="hidden lg:inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg shadow-sm hover:bg-purple-700 transition"
              >
                <PlusCircle size={18} />
                New Course
              </button>
              <button
                onClick={() => {
                  refetchCourses();
                  fetchLecturerCourses();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:border-purple-200 hover:text-purple-700 transition"
              >
                  <RefreshCw size={18} />
                Refresh
              </button>
            </div>
          </div>

          {renderActiveSection()}
        </div>
      </motion.main>

      {/* Mobile Main Content */}
      <main className="lg:hidden p-4 sm:p-6 min-h-[calc(100vh-90px)] pb-12">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-purple-500 font-semibold">Faculty</p>
              <h1 className="text-2xl font-bold text-gray-900">{activeLabel}</h1>
            </div>
            <button
              onClick={() => setActiveMenu("add-course")}
              className="inline-flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm shadow-sm"
            >
              <PlusCircle size={16} />
              Add
            </button>
          </div>
          {renderActiveSection()}
        </div>
      </main>

      {/* Approval Pending Modal */}
      <ApprovalPendingModal
        isOpen={approvalModal.isOpen}
        onClose={() => setApprovalModal({ ...approvalModal, isOpen: false })}
        type={approvalModal.type}
        contentName={approvalModal.contentName}
      />
    </div>
  );
};

// ==================== DASHBOARD SECTION ====================
const DashboardSection = ({ myCourses, totalEnrollments, totalEarnings, earningsBreakdown, earningsLoading, user, coursesError }) => {
  // Calculate verification status counts
  const approvedCount = myCourses.filter(c => c.courseStatus === "approved").length;
  const pendingCount = myCourses.filter(c => c.courseStatus === "pending" || !c.courseStatus).length;
  const rejectedCount = myCourses.filter(c => c.courseStatus === "rejected").length;

  const stats = [
    {
      label: "Total Courses",
      value: myCourses.length,
      icon: BookOpen,
      color: "bg-blue-500",
    },
    {
      label: "Total Enrollments",
      value: totalEnrollments,
      icon: Users,
      color: "bg-green-500",
    },
    {
      label: "Total Earnings (80%)",
      value: earningsLoading ? "Loading..." : `₹${totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-purple-500",
      subtitle: "Your share from enrollments"
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
        Welcome back, {user?.name || "Lecturer"}! 👋
      </h1>
      <p className="text-gray-600 mb-8">
        Here's an overview of your teaching performance
      </p>

      {/* Error Alert */}
      {coursesError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700 text-sm">{coursesError}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                {stat.subtitle && <p className="text-xs text-gray-400">{stat.subtitle}</p>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Earnings Breakdown by Course */}
      {earningsBreakdown && earningsBreakdown.length > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm border border-green-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-green-600" />
            Earnings Breakdown (80% Revenue Share)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-green-200">
                  <th className="pb-3 font-medium">Course</th>
                  <th className="pb-3 font-medium text-center">Enrollments</th>
                  <th className="pb-3 font-medium text-right">Your Earnings</th>
                </tr>
              </thead>
              <tbody>
                {earningsBreakdown.map((item, idx) => (
                  <tr key={idx} className="border-b border-green-100 last:border-0">
                    <td className="py-3 text-sm font-medium text-gray-800">{item.course}</td>
                    <td className="py-3 text-sm text-center text-gray-600">{item.enrollments || 1}</td>
                    <td className="py-3 text-sm text-right font-semibold text-green-600">
                      ₹{(item.amount || item.lecturerEarning || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-green-100 rounded-lg">
                  <td className="py-3 px-2 text-sm font-bold text-gray-800 rounded-l-lg">Total</td>
                  <td className="py-3 text-sm text-center font-bold text-gray-800">{totalEnrollments}</td>
                  <td className="py-3 px-2 text-sm text-right font-bold text-green-700 rounded-r-lg">
                    ₹{totalEarnings.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-4 bg-white p-2 rounded">
            💡 <strong>Note:</strong> You receive 80% of each course enrollment. The remaining 20% goes to the platform as commission.
          </p>
        </div>
      )}

      {/* Verification Status Summary */}
      {myCourses.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-purple-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-purple-600" />
            Verification Status
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-full mb-2">
                <CheckCircle2 size={20} className="text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{approvedCount}</p>
              <p className="text-xs text-gray-500 mt-1">Approved</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-amber-100 rounded-full mb-2">
                <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Clock size={20} className="text-amber-600" />
                </motion.div>
              </div>
              <p className="text-2xl font-bold text-gray-800">{pendingCount}</p>
              <p className="text-xs text-gray-500 mt-1">Pending Review</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-red-100 rounded-full mb-2">
                <X size={20} className="text-red-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{rejectedCount}</p>
              <p className="text-xs text-gray-500 mt-1">Rejected</p>
            </div>
          </div>
          {pendingCount > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> {pendingCount} course{pendingCount > 1 ? 's are' : ' is'} awaiting admin verification. You'll be notified once reviewed.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recent Courses */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-purple-600" />
          Recent Courses
        </h2>
        {myCourses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No courses yet. Start by adding your first course!
          </p>
        ) : (
          <div className="space-y-3">
            {myCourses.slice(0, 5).map((course) => (
              <div
                key={course._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    {course.courseImage?.url ? (
                      <img
                        src={course.courseImage.url}
                        alt={course.title}
                        className="w-12 h-12 object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center">
                        <Image size={20} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-800 line-clamp-1">
                        {course.title}
                      </h4>
                      {course.courseStatus === "approved" ? (
                        <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-medium rounded-full">
                          <CheckCircle2 size={10} />
                          Approved
                        </span>
                      ) : course.courseStatus === "rejected" ? (
                        <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-medium rounded-full">
                          <X size={10} />
                          Rejected
                        </span>
                      ) : (
                        <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded-full">
                          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                            <Clock size={10} />
                          </motion.div>
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {course.enrolledStudents?.length || 0} students
                    </p>
                  </div>
                </div>
                <span className="text-purple-600 font-semibold">
                  ₹{course.price || 0}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ==================== ADD COURSE SECTION ====================
const AddCourseSection = ({ refetchCourses, user, setApprovalModal }) => {
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [topics, setTopics] = useState([]);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(null);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newLecture, setNewLecture] = useState({ title: "", video: null });
  const [submitting, setSubmitting] = useState(false);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [formStatus, setFormStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const addTopic = () => {
    if (!newTopicTitle.trim()) return;
    setTopics([...topics, { title: newTopicTitle, lectures: [] }]);
    setNewTopicTitle("");
    setShowTopicModal(false);
  };

  const removeTopic = (index) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const addLecture = () => {
    if (!newLecture.title.trim() || currentTopicIndex === null) return;
    const updated = [...topics];
    updated[currentTopicIndex].lectures.push({
      title: newLecture.title,
      video: newLecture.video,
      videoName: newLecture.video?.name || "",
    });
    setTopics(updated);
    setNewLecture({ title: "", video: null });
    setShowLectureModal(false);
  };

  const removeLecture = (topicIndex, lectureIndex) => {
    const updated = [...topics];
    updated[topicIndex].lectures = updated[topicIndex].lectures.filter(
      (_, i) => i !== lectureIndex
    );
    setTopics(updated);
  };

  const resetForm = () => {
    setCourseData({ title: "", description: "", price: "", category: "" });
    setThumbnail(null);
    setThumbnailPreview(null);
    setTopics([]);
  };

  const handleSubmit = async () => {
    if (!courseData.title || !courseData.description || !courseData.price || !courseData.category) {
      setFormStatus({
        type: "error",
        message: "Please fill all required fields (title, description, price, category).",
      });
      return;
    }

    if (!thumbnail) {
      setFormStatus({
        type: "error",
        message: "Please upload a course thumbnail image.",
      });
      return;
    }

    setSubmitting(true);
    setFormStatus(null);

    try {
      const token = getToken();
      
      // Step 1: Create the course
      const courseFormData = new FormData();
      courseFormData.append("title", courseData.title);
      courseFormData.append("description", courseData.description);
      courseFormData.append("price", courseData.price);
      courseFormData.append("category", courseData.category);
      courseFormData.append("courseImage", thumbnail);

      const courseResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/lecturer/courses/add-course`,
        courseFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const createdCourse = courseResponse.data.course;
      const courseId = createdCourse._id;

      // Step 2: Add topics and lectures
      for (let topicIdx = 0; topicIdx < topics.length; topicIdx++) {
        const topic = topics[topicIdx];
        
        // Create topic
        const topicResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/lecturer/courses/${courseId}/add-topic`,
          { title: topic.title },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const createdTopic = topicResponse.data.topic;
        const topicId = createdTopic._id;

        // Add lectures to this topic
        for (let lectureIdx = 0; lectureIdx < topic.lectures.length; lectureIdx++) {
          const lecture = topic.lectures[lectureIdx];
          
          if (lecture.video) {
            const lectureFormData = new FormData();
            lectureFormData.append("title", lecture.title);
            lectureFormData.append("video", lecture.video);
            lectureFormData.append("lectureDuration", "0"); // Default values
            lectureFormData.append("coveredDuration", "0");

            await axios.post(
              `${import.meta.env.VITE_API_URL}/api/lecturer/courses/${courseId}/topic/${topicId}/add-lecture`,
              lectureFormData,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "multipart/form-data",
                },
              }
            );
          }
        }
      }

      // Save course name before reset
      const createdCourseName = courseData.title;
      const topicsCount = topics.length;
      
      resetForm();
      refetchCourses();
      
      // Send notification to admin about new course submission
      try {
        const notification = NotificationTemplates.courseSubmitted(createdCourseName, user?.name || 'Lecturer');
        await sendNotificationToRole('admin', {
          ...notification,
          data: { courseId: courseId, lecturerId: user?._id },
        });
      } catch (notifErr) {
        console.warn('Failed to send notification:', notifErr);
        // Don't fail the course creation if notification fails
      }

      // Show approval pending modal
      setApprovalModal({
        isOpen: true,
        type: 'course',
        contentName: createdCourseName
      });

      setFormStatus({ 
        type: "success", 
        message: `Course "${createdCourseName}" created successfully with ${topicsCount} topic(s)! Awaiting admin approval.` 
      });
    } catch (err) {
      console.error("Failed to create course:", err);
      setFormStatus({
        type: "error",
        message: err.response?.data?.message || "Failed to create course. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
        Add New Course
      </h1>

      {formStatus && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 flex items-start gap-3 text-sm ${
            formStatus.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {formStatus.type === "success" ? (
            <CheckCircle2 size={18} className="mt-[2px]" />
          ) : (
            <AlertCircle size={18} className="mt-[2px]" />
          )}
          <span>{formStatus.message}</span>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        {/* Course Basic Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={courseData.title}
              onChange={handleInputChange}
              placeholder="Enter course title"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="category"
              value={courseData.category}
              onChange={handleInputChange}
              placeholder="e.g., Web Development, Python"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={courseData.description}
            onChange={handleInputChange}
            rows={5}
            placeholder="Write a detailed description of your course..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={courseData.price}
              onChange={handleInputChange}
              placeholder="Enter price in INR"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Thumbnail <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-purple-500 transition h-[120px] flex items-center justify-center"
            >
              {thumbnailPreview ? (
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail"
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <Image size={32} />
                  <span className="text-sm">Click to upload thumbnail</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Topics Section */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Course Topics
            </h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTopicModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Plus size={18} />
              Add Topic
            </motion.button>
          </div>

          {topics.length === 0 ? (
            <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
              No topics added yet. Click "Add Topic" to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {topics.map((topic, topicIdx) => (
                <div
                  key={topicIdx}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div
                    onClick={() =>
                      setExpandedTopic(expandedTopic === topicIdx ? null : topicIdx)
                    }
                    className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-purple-600" />
                      <span className="font-medium text-gray-800">
                        {topic.title}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({topic.lectures.length} lectures)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentTopicIndex(topicIdx);
                          setShowLectureModal(true);
                        }}
                        className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition"
                        title="Add Lecture"
                      >
                        <Plus size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTopic(topicIdx);
                        }}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition"
                        title="Remove Topic"
                      >
                        <Trash2 size={18} />
                      </button>
                      {expandedTopic === topicIdx ? (
                        <ChevronUp size={20} className="text-gray-500" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-500" />
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedTopic === topicIdx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-2 bg-white">
                          {topic.lectures.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">
                              No lectures yet. Click + to add a lecture.
                            </p>
                          ) : (
                            topic.lectures.map((lecture, lectureIdx) => (
                              <div
                                key={lectureIdx}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <Video size={18} className="text-gray-500" />
                                  <span className="text-gray-700">
                                    {lecture.title}
                                  </span>
                                  {lecture.videoName && (
                                    <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded">
                                      {lecture.videoName}
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() => removeLecture(topicIdx, lectureIdx)}
                                  className="p-1 text-red-500 hover:bg-red-100 rounded transition"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex gap-4 justify-end">
          <button
            onClick={resetForm}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Reset
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Save size={20} />
            )}
            {submitting ? "Creating..." : "Create Course"}
          </motion.button>
        </div>
      </div>

      {/* Add Topic Modal */}
      <AnimatePresence>
        {showTopicModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTopicModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Add New Topic
              </h3>
              <input
                type="text"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                placeholder="Enter topic title"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && addTopic()}
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowTopicModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={addTopic}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Add Topic
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Lecture Modal */}
      <AnimatePresence>
        {showLectureModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowLectureModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Add New Lecture
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lecture Title
                  </label>
                  <input
                    type="text"
                    value={newLecture.title}
                    onChange={(e) =>
                      setNewLecture({ ...newLecture, title: e.target.value })
                    }
                    placeholder="Enter lecture title"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Video (Optional)
                  </label>
                  <div
                    onClick={() => document.getElementById("lectureVideoInput")?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-purple-500 transition"
                  >
                    {newLecture.video ? (
                      <div className="flex items-center justify-center gap-2 text-purple-600">
                        <Video size={20} />
                        <span className="text-sm truncate max-w-[200px]">{newLecture.video.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Upload size={24} />
                        <span className="text-sm">Click to upload video</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    id="lectureVideoInput"
                    accept="video/*"
                    onChange={(e) =>
                      setNewLecture({
                        ...newLecture,
                        video: e.target.files?.[0] || null,
                      })
                    }
                    className="hidden"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowLectureModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={addLecture}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Add Lecture
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==================== MY COURSES SECTION ====================
const MyCoursesSection = ({ myCourses }) => {
  const [expandedCourse, setExpandedCourse] = useState(null);

  const getStatusBadge = (status) => {
    if (status === "approved") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
          <CheckCircle2 size={10} />
          Approved
        </span>
      );
    } else if (status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
          <X size={10} />
          Rejected
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <Clock size={10} />
          </motion.div>
          Pending
        </span>
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
        My Courses
      </h1>

      {myCourses.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-2">You haven't created any courses yet.</p>
          <p className="text-gray-400 text-sm">Click "Add Course" to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myCourses.map((course, i) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
            >
              {/* Course Header */}
              <div
                onClick={() => setExpandedCourse(expandedCourse === course._id ? null : course._id)}
                className="p-4 cursor-pointer hover:bg-gray-50 transition flex items-center gap-4"
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  {course.courseImage?.url ? (
                    <img
                      src={course.courseImage.url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image size={32} className="text-gray-300" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-800 line-clamp-1">
                      {course.title}
                    </h3>
                    {getStatusBadge(course.courseStatus)}
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-1 mb-2">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-purple-600 font-semibold">
                      ₹{course.price || 0}
                    </span>
                    <span className="text-gray-500 flex items-center gap-1">
                      <Users size={14} />
                      {course.enrolledStudents?.length || 0} students
                    </span>
                    <span className="text-gray-500 flex items-center gap-1">
                      <FileText size={14} />
                      {course.Topics?.length || 0} topics
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition text-sm">
                    <Eye size={16} />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition text-sm">
                    <Edit size={16} />
                  </button>
                  {expandedCourse === course._id ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Topics and Lectures */}
              <AnimatePresence>
                {expandedCourse === course._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-gray-200"
                  >
                    <div className="p-4 bg-gray-50 space-y-3">
                      <h4 className="font-semibold text-gray-800 text-sm">Topics & Lectures</h4>
                      
                      {course.Topics && course.Topics.length > 0 ? (
                        course.Topics.map((topic, topicIdx) => (
                          <div key={topicIdx} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            {/* Topic Header */}
                            <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText size={16} className="text-purple-600" />
                                  <span className="font-medium text-gray-800 text-sm">
                                    {topic.title}
                                  </span>
                                </div>
                                {getStatusBadge(topic.topicStatus || "pending")}
                              </div>
                            </div>

                            {/* Lectures in Topic */}
                            <div className="p-3 space-y-2">
                              {topic.lectures && topic.lectures.length > 0 ? (
                                topic.lectures.map((lecture, lectureIdx) => (
                                  <div key={lectureIdx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-sm">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <Video size={14} className="text-gray-500 flex-shrink-0" />
                                      <span className="text-gray-700 line-clamp-1">
                                        {lecture.title}
                                      </span>
                                    </div>
                                    {getStatusBadge(lecture.status || "pending")}
                                  </div>
                                ))
                              ) : (
                                <p className="text-gray-500 text-xs text-center py-2">
                                  No lectures added yet
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm text-center py-4">
                          No topics added yet
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ==================== STUDENTS SECTION ====================
const StudentsSection = ({ enrolledStudents }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
        Enrolled Students
      </h1>

      {enrolledStudents.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <GraduationCap size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-2">No students enrolled yet.</p>
          <p className="text-gray-400 text-sm">Students will appear here once they enroll in your courses.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Student
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Course
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Enrolled Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {enrolledStudents.map((student, i) => (
                  <motion.tr
                    key={`${student._id}-${student.courseId}-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                          {student.profileImage?.url ? (
                            <img
                              src={student.profileImage.url}
                              alt={student.name}
                              className="w-10 h-10 object-cover"
                            />
                          ) : (
                            <span className="text-purple-600 font-medium">
                              {student.name?.charAt(0) || "S"}
                            </span>
                          )}
                        </div>
                        <span className="font-medium text-gray-800">
                          {student.name || "Student"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {student.email || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {student.courseName}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {student.enrolledAt
                        ? new Date(student.enrolledAt).toLocaleDateString()
                        : "-"}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};



export default FacultyDash;
