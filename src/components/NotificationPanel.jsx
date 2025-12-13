// src/components/NotificationPanel.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  BookOpen,
  FileText,
  Video,
  GraduationCap,
  DollarSign,
  Star,
  AlertCircle,
  Settings,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, formatRelativeTime, getNotificationMeta } from '../context/NotificationContext';

const NotificationPanel = () => {
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, course, enrollment
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get icon based on notification type
  const getIcon = (type) => {
    const iconMap = {
      course_submitted: BookOpen,
      course_approved: BookOpen,
      course_rejected: BookOpen,
      topic_submitted: FileText,
      topic_approved: FileText,
      topic_rejected: FileText,
      lecture_submitted: Video,
      lecture_approved: Video,
      lecture_rejected: Video,
      new_enrollment: GraduationCap,
      enrollment_success: GraduationCap,
      payment_received: DollarSign,
      new_review: Star,
    };
    return iconMap[type] || Bell;
  };

  // Get color classes based on notification type
  const getColorClasses = (type) => {
    const meta = getNotificationMeta(type);
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      red: 'bg-red-100 text-red-600',
      purple: 'bg-purple-100 text-purple-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      gray: 'bg-gray-100 text-gray-600',
    };
    return colorMap[meta.color] || colorMap.gray;
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'course') return notif.type?.includes('course') || notif.type?.includes('topic') || notif.type?.includes('lecture');
    if (filter === 'enrollment') return notif.type?.includes('enrollment') || notif.type?.includes('payment');
    return true;
  });

  // Handle notification click
  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);

    // Navigate based on notification type and data
    const data = notification.data || {};
    
    if (data.courseId) {
      if (notification.type?.includes('approved') || notification.type?.includes('rejected')) {
        // Lecturer viewing their course status
        navigate('/lecturer/dashboard');
      } else if (notification.type === 'enrollment_success') {
        // Student viewing their enrolled course
        navigate('/student');
      }
    }
    
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Icon Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
        
        {/* Unread Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  {/* Filter Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowFilterMenu(!showFilterMenu)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        filter !== 'all' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-500'
                      }`}
                      title="Filter"
                    >
                      <Filter size={16} />
                    </button>

                    {/* Filter Dropdown */}
                    <AnimatePresence>
                      {showFilterMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border py-1 z-20"
                        >
                          {[
                            { id: 'all', label: 'All' },
                            { id: 'unread', label: 'Unread' },
                            { id: 'course', label: 'Courses' },
                            { id: 'enrollment', label: 'Enrollments' },
                          ].map((option) => (
                            <button
                              key={option.id}
                              onClick={() => {
                                setFilter(option.id);
                                setShowFilterMenu(false);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                                filter === option.id ? 'text-blue-600 font-medium' : 'text-gray-700'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Mark All Read Button */}
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                      title="Mark all as read"
                    >
                      <CheckCheck size={16} />
                    </button>
                  )}

                  {/* Clear All Button */}
                  {notifications.length > 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm('Clear all notifications?')) {
                          clearAllNotifications();
                        }
                      }}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                      title="Clear all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  {/* Close Button */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Filter Pills */}
              {filter !== 'all' && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Filtered:</span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full flex items-center gap-1">
                    {filter}
                    <button
                      onClick={() => setFilter('all')}
                      className="hover:text-blue-800"
                    >
                      <X size={12} />
                    </button>
                  </span>
                </div>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-[380px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm text-center">
                    {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
                  </p>
                  <p className="text-gray-400 text-xs mt-1 text-center">
                    We'll notify you when something important happens
                  </p>
                </div>
              ) : (
                <div>
                  {filteredNotifications.map((notification, index) => {
                    const Icon = getIcon(notification.type);
                    const colorClasses = getColorClasses(notification.type);
                    const meta = getNotificationMeta(notification.type);

                    return (
                      <motion.div
                        key={notification._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => handleNotificationClick(notification)}
                        className={`relative flex gap-3 p-4 cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${
                          notification.read 
                            ? 'bg-white hover:bg-gray-50' 
                            : 'bg-blue-50/50 hover:bg-blue-50'
                        }`}
                      >
                        {/* Unread Indicator */}
                        {!notification.read && (
                          <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        )}

                        {/* Icon */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClasses}`}>
                          <Icon size={18} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${notification.read ? 'text-gray-700' : 'text-gray-900 font-medium'} line-clamp-1`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                            </div>

                            {/* Delete Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification._id);
                              }}
                              className="flex-shrink-0 p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${colorClasses}`}>
                              {meta.label}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {formatRelativeTime(notification.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="flex-shrink-0 w-4 h-4 text-gray-300 self-center" />
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="sticky bottom-0 bg-gray-50 border-t p-2">
                <button
                  onClick={() => {
                    navigate('/notifications');
                    setIsOpen(false);
                  }}
                  className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                >
                  View All Notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationPanel;
