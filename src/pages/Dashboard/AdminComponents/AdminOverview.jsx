// src/pages/Dashboard/AdminComponents/AdminOverview.jsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  ShoppingCart,
  Star,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader,
  FileText,
  Video,
  Wallet,
  PiggyBank,
} from 'lucide-react';

const AdminOverview = ({ stats, statsLoading, statsError }) => {
  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Courses',
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Total Enrollments',
      value: stats?.totalEnrollments || 0,
      icon: ShoppingCart,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Total Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  // Revenue breakdown cards
  const revenueCards = [
    {
      label: 'Admin Commission (20%)',
      value: `₹${(stats?.adminCommissionTotal || 0).toLocaleString()}`,
      icon: Wallet,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      label: 'Lecturer Earnings (80%)',
      value: `₹${(stats?.lecturerEarningsTotal || 0).toLocaleString()}`,
      icon: PiggyBank,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      label: 'Successful Enrollments',
      value: stats?.successfulEnrollments || 0,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Pending Enrollments',
      value: stats?.pendingEnrollments || 0,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const quickStats = [
    {
      label: 'Pending Courses',
      value: stats?.pendingCourses || 0,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      label: 'Pending Topics',
      value: stats?.pendingTopics || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Pending Lectures',
      value: stats?.pendingLectures || 0,
      icon: Video,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Approved Courses',
      value: stats?.approvedCourses || 0,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  const userStats = [
    {
      label: 'Total Lecturers',
      value: stats?.totalLecturers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Total Admins',
      value: stats?.totalAdmins || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Rejected Courses',
      value: stats?.rejectedCourses || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  if (statsError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4"
      >
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">Error Loading Dashboard</h3>
          <p className="text-red-700 text-sm mt-1">{statsError}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.bgColor} rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow group`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
            <h3 className="text-3xl font-bold text-gray-900">{statsLoading ? <Loader className="w-6 h-6 animate-spin" /> : stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Revenue Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-emerald-50 to-indigo-50 rounded-2xl border border-gray-200 p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-emerald-600" />
          Revenue Distribution (20% Admin / 80% Lecturer)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {revenueCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index + 4) * 0.1 }}
              className={`${stat.bgColor} rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center gap-3">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <div>
                  <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">{statsLoading ? '...' : stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Pending Approvals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-amber-50 rounded-2xl border border-amber-200 p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-amber-600" />
          Pending Approvals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index + 4) * 0.1 }}
              className={`${stat.bgColor} rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center gap-3">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                <div>
                  <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900">{statsLoading ? '...' : stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {userStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index + 8) * 0.1 }}
            className={`${stat.bgColor} rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center gap-3">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
              <div>
                <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900">{statsLoading ? '...' : stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Server Status */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">System Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-sm font-medium text-gray-700">API Server</span>
                <span className="flex items-center gap-2 text-green-700 text-sm font-semibold">
                  <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" /> Online
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-sm font-medium text-gray-700">Database</span>
                <span className="flex items-center gap-2 text-green-700 text-sm font-semibold">
                  <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" /> Connected
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-sm font-medium text-gray-700">Storage</span>
                <span className="flex items-center gap-2 text-green-700 text-sm font-semibold">
                  <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" /> Available
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 text-blue-700 font-medium text-sm transition-colors">
                Send Platform Announcement
              </button>
              <button className="w-full p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 text-purple-700 font-medium text-sm transition-colors">
                Generate Revenue Report
              </button>
              <button className="w-full p-3 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 text-amber-700 font-medium text-sm transition-colors">
                Review Pending Approvals
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { action: 'New course submitted by John Doe', time: '2 hours ago', icon: BookOpen, color: 'text-blue-600' },
            { action: 'User Maria Silva enrolled in Python Basics', time: '4 hours ago', icon: Users, color: 'text-green-600' },
            { action: 'Course "Web Development" approved', time: '6 hours ago', icon: CheckCircle2, color: 'text-emerald-600' },
            { action: 'Payment received for 5 enrollments', time: '1 day ago', icon: DollarSign, color: 'text-amber-600' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ${activity.color}`}>
                <activity.icon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminOverview;
