// src/pages/Dashboard/AdminComponents/AdminAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Users,
  BookOpen,
  DollarSign,
} from 'lucide-react';
import { getRevenueAnalytics, getUserGrowthAnalytics } from '../../../utils/adminApi';

const AdminAnalytics = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [userGrowthData, setUserGrowthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30days');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [revenue, userGrowth] = await Promise.all([
          getRevenueAnalytics(period),
          getUserGrowthAnalytics(period),
        ]);
        setRevenueData(revenue);
        setUserGrowthData(userGrowth);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      {/* Period Selector */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Calendar size={20} /> Analytics Period
        </h3>
        <div className="flex gap-2">
          {['7days', '30days', '90days', '1year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p === '7days' ? '7 Days' : p === '30days' ? '30 Days' : p === '90days' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <DollarSign size={20} /> Revenue Analytics
          </h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-lg transition-colors">
            <Download size={16} /> Export
          </button>
        </div>

        {loading ? (
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">Loading chart...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Simple Bar Chart Representation */}
            <div className="space-y-2">
              {[
                { label: 'Week 1', value: 45000, max: 50000 },
                { label: 'Week 2', value: 52000, max: 50000 },
                { label: 'Week 3', value: 38000, max: 50000 },
                { label: 'Week 4', value: 61000, max: 70000 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <span className="text-sm font-bold text-blue-600">₹{item.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.value / item.max) * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200 mt-6">
              {[
                { label: 'Total Revenue', value: '₹1,96,000' },
                { label: 'Avg Daily', value: '₹7,000' },
                { label: 'Transactions', value: '450' },
                { label: 'Growth', value: '+15.3%' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200"
                >
                  <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* User Growth Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Users size={20} /> User Growth
        </h3>

        {loading ? (
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">Loading chart...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Simple Line Chart Representation */}
            <div className="space-y-3">
              {[
                { label: 'Students', value: 1250, icon: Users, color: 'from-green-400 to-green-600' },
                { label: 'Lecturers', value: 85, icon: BookOpen, color: 'from-blue-400 to-blue-600' },
                { label: 'Admins', value: 5, icon: BarChart3, color: 'from-purple-400 to-purple-600' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white`}>
                    <item.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{item.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Growth</p>
                    <p className="text-lg font-bold text-green-600">+{Math.floor(Math.random() * 30)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Top Performing Courses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp size={20} /> Top Performing Courses
        </h3>

        <div className="space-y-3">
          {[
            { title: 'React Mastery', students: 450, revenue: '₹45,000' },
            { title: 'Python for Beginners', students: 380, revenue: '₹38,000' },
            { title: 'Web Design Fundamentals', students: 320, revenue: '₹32,000' },
            { title: 'Advanced JavaScript', students: 290, revenue: '₹29,000' },
            { title: 'Data Science 101', students: 250, revenue: '₹25,000' },
          ].map((course, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div>
                <p className="font-semibold text-gray-900">{course.title}</p>
                <p className="text-sm text-gray-600">{course.students} students enrolled</p>
              </div>
              <p className="font-bold text-green-600">{course.revenue}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Platform Health Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          { label: 'Avg Course Rating', value: '4.6/5', trend: '+0.2' },
          { label: 'Course Completion Rate', value: '78%', trend: '+5%' },
          { label: 'Student Satisfaction', value: '92%', trend: '+3%' },
          { label: 'Platform Uptime', value: '99.9%', trend: '=0%' },
        ].map((metric, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
          >
            <p className="text-sm text-gray-600 mb-2">{metric.label}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</p>
            <p className={`text-sm font-semibold ${metric.trend.startsWith('+') ? 'text-green-600' : 'text-gray-600'}`}>
              {metric.trend}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default AdminAnalytics;
