// src/pages/Dashboard/AdminDash.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ShoppingCart,
  Star,
  BarChart3,
  Menu,
  X,
  LogOut,
  Settings,
  HelpCircle,
  ChevronLeft,
  AlertCircle,
  TrendingUp,
  DollarSign,
  User,
  FileCheck,
  Megaphone,
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { clearAuth, getToken } from '../../utils/auth';
import { getDashboardStats } from '../../utils/adminApi';
import AdminOverview from './AdminComponents/AdminOverview';
import AdminUsers from './AdminComponents/AdminUsers';
import AdminCourses from './AdminComponents/AdminCourses';
import AdminEnrollments from './AdminComponents/AdminEnrollments';
import AdminReviews from './AdminComponents/AdminReviews';
import AdminAnalytics from './AdminComponents/AdminAnalytics';
import AdminContentApproval from './AdminComponents/AdminContentApproval';
import AdminAnnouncements from './AdminComponents/AdminAnnouncements';

const AdminDash = () => {
  const { user, loading: userLoading } = useUser();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // Load dashboard stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsLoading(true);
        const data = await getDashboardStats();
        if (data?.success) {
          setStats(data.stats || data);
        }
      } catch (error) {
        console.warn('Stats loading failed (this is optional):', error.message);
        // Don't show error - stats are optional
        setStatsError(null);
      } finally {
        setStatsLoading(false);
      }
    };

    // Load stats only if admin (don't wait for it, it's optional)
    if (user?.role === 'admin') {
      loadStats();
    }
  }, [user]);

  const handleLogout = () => {
    clearAuth();
    navigate('/');
    window.location.reload();
  };

  // Check if user is admin
  if (!userLoading && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 pt-[90px] flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access the admin panel.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[90px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
            <LayoutDashboard className="w-10 h-10 text-purple-600" />
          </motion.div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'content', label: 'Content Approval', icon: FileCheck },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'enrollments', label: 'Enrollments', icon: ShoppingCart },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const menuBadges = {
    courses: stats?.pendingCourses || 0,
    content: (stats?.pendingTopics || 0) + (stats?.pendingLectures || 0),
    users: stats?.totalUsers || 0,
  };

  const activeLabel = menuItems.find((item) => item.id === activeMenu)?.label || 'Dashboard';

  const renderActiveSection = () => (
    <AnimatePresence mode="wait">
      {activeMenu === 'dashboard' && (
        <AdminOverview key="dashboard" stats={stats} statsLoading={statsLoading} statsError={statsError} />
      )}
      {activeMenu === 'users' && <AdminUsers key="users" />}
      {activeMenu === 'courses' && <AdminCourses key="courses" />}
      {activeMenu === 'content' && <AdminContentApproval key="content" />}
      {activeMenu === 'announcements' && <AdminAnnouncements key="announcements" />}
      {activeMenu === 'enrollments' && <AdminEnrollments key="enrollments" />}
      {activeMenu === 'reviews' && <AdminReviews key="reviews" />}
      {activeMenu === 'analytics' && <AdminAnalytics key="analytics" />}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50/30 pt-24 lg:pt-[90px] pb-16 lg:pb-14 px-4 sm:px-5 lg:px-6 lg:flex lg:items-start lg:gap-6">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-[90px] left-4 z-50 p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
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
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed lg:sticky top-[88px] lg:top-[70px] left-0 h-[calc(100vh-88px)] lg:h-[calc(100vh-70px)] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 shadow-2xl z-40
          transform transition-transform duration-300 ease-in-out flex flex-col rounded-r-2xl lg:rounded-none
          w-[82vw] max-w-[340px] lg:w-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:self-start lg:min-w-[220px] lg:max-w-[280px]`}
      >
        {/* Logo/Brand Section */}
        <div className={`border-b border-white/10 ${sidebarCollapsed ? 'p-3' : 'p-5'}`}>
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <LayoutDashboard size={20} className="text-white" />
            </div>
            {!sidebarCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="font-bold text-white text-lg">DevHub Admin</h2>
                <p className="text-[10px] text-blue-300 -mt-0.5">Control Panel</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Collapse Button - Desktop Only */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white rounded-full items-center justify-center text-slate-900 shadow-lg hover:bg-gray-100 transition z-50 border border-gray-200"
        >
          <ChevronLeft size={14} className={`transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* Profile Section */}
        <div className={`border-b border-white/10 ${sidebarCollapsed ? 'p-3' : 'p-5'}`}>
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden ring-2 ring-white/20 flex-shrink-0">
              {user?.profileImage?.url ? (
                <img src={user.profileImage.url} alt="Admin" className="w-11 h-11 rounded-full object-cover" />
              ) : (
                <span className="text-white font-bold text-base">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
              )}
            </div>
            {!sidebarCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate text-sm">{user?.name || 'Admin'}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 text-[10px] text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                  <span className="text-[10px] text-blue-300">• Admin</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${sidebarCollapsed ? 'p-2' : 'p-4'} space-y-1 overflow-y-auto`}>
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
                className={`w-full flex items-center justify-between ${sidebarCollapsed ? 'px-2' : 'gap-3 px-4'} py-3 rounded-xl text-left transition-all
                  ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-lg font-semibold'
                      : 'text-blue-100 hover:bg-white/10'
                  }`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <div className={`flex items-center ${sidebarCollapsed ? 'justify-center flex-1' : 'gap-3'}`}>
                  <item.icon size={20} className="flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-medium">
                      {item.label}
                    </motion.span>
                  )}
                </div>

                {!sidebarCollapsed && badge !== undefined && badge > 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${isActive ? 'bg-slate-100 text-slate-900' : 'bg-white/10 text-blue-100'}`}>
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
        <div className={`border-t border-blue-700/50 ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-2.5 rounded-xl text-blue-200 hover:bg-white/10 transition-all mb-2`}
            title={sidebarCollapsed ? 'Settings' : ''}
          >
            <Settings size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm">Settings</span>}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-2.5 rounded-xl text-blue-200 hover:bg-white/10 transition-all mb-2`}
            title={sidebarCollapsed ? 'Help' : ''}
          >
            <HelpCircle size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm">Help</span>}
          </motion.button>

          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-2.5 rounded-xl text-red-300 hover:bg-red-500/20 transition-all`}
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
          </motion.button>

          {!sidebarCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 pt-4 border-t border-blue-700/30">
              <p className="text-[10px] text-blue-400 text-center">© 2025 DevHub</p>
              <p className="text-[10px] text-blue-500 text-center mt-1">v1.0.0</p>
            </motion.div>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main className="hidden lg:block flex-1 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-70px)] transition-all pb-12 w-full">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-blue-500 font-semibold">Administration</p>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">{activeLabel}</h1>
              <p className="text-gray-500 mt-2 text-sm">Manage platform content, users, and monitor platform health.</p>
            </div>
          </div>

          {renderActiveSection()}
        </div>
      </motion.main>

      {/* Mobile Main Content */}
      <main className="lg:hidden p-4 sm:p-6 min-h-[calc(100vh-90px)] pb-12">
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-500 font-semibold">Administration</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">{activeLabel}</h1>
          </div>
          {renderActiveSection()}
        </div>
      </main>
    </div>
  );
};

export default AdminDash;