// src/pages/Notifications/NotificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  RefreshCw,
  BookOpen,
  FileText,
  Video,
  GraduationCap,
  DollarSign,
  Star,
  ChevronRight,
  X,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, formatRelativeTime, getNotificationMeta } from '../../context/NotificationContext';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

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
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      green: 'bg-green-100 text-green-600 border-green-200',
      red: 'bg-red-100 text-red-600 border-red-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200',
      yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200',
      gray: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return colorMap[meta.color] || colorMap.gray;
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'course') return notif.type?.includes('course') || notif.type?.includes('topic') || notif.type?.includes('lecture');
    if (filter === 'enrollment') return notif.type?.includes('enrollment') || notif.type?.includes('payment');
    if (filter === 'review') return notif.type?.includes('review');
    return true;
  });

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (isSelectMode) {
      toggleSelection(notification._id);
      return;
    }

    markAsRead(notification._id);

    // Navigate based on notification type and data
    const data = notification.data || {};
    
    if (data.courseId) {
      if (notification.type?.includes('approved') || notification.type?.includes('rejected')) {
        navigate('/lecturer/dashboard');
      } else if (notification.type === 'enrollment_success') {
        navigate('/student');
      }
    }
  };

  // Toggle selection
  const toggleSelection = (id) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Select all visible
  const selectAll = () => {
    const allIds = filteredNotifications.map((n) => n._id);
    setSelectedNotifications(allIds);
  };

  // Delete selected
  const deleteSelected = () => {
    if (!window.confirm(`Delete ${selectedNotifications.length} notifications?`)) return;
    selectedNotifications.forEach((id) => deleteNotification(id));
    setSelectedNotifications([]);
    setIsSelectMode(false);
  };

  // Mark selected as read
  const markSelectedAsRead = () => {
    selectedNotifications.forEach((id) => markAsRead(id));
    setSelectedNotifications([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-[90px] px-4 sm:px-6 lg:px-16 pb-16">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchNotifications()}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            {notifications.length > 0 && (
              <>
                <button
                  onClick={() => setIsSelectMode(!isSelectMode)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isSelectMode ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'
                  }`}
                >
                  {isSelectMode ? 'Cancel' : 'Select'}
                </button>

                {unreadCount > 0 && !isSelectMode && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Mark all read
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All', count: notifications.length },
            { id: 'unread', label: 'Unread', count: unreadCount },
            { id: 'course', label: 'Courses' },
            { id: 'enrollment', label: 'Enrollments' },
            { id: 'review', label: 'Reviews' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  filter === tab.id ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Selection Actions Bar */}
        <AnimatePresence>
          {isSelectMode && selectedNotifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="sticky top-[90px] z-20 bg-blue-600 text-white rounded-lg p-3 mb-4 flex items-center justify-between gap-4"
            >
              <span className="text-sm font-medium">
                {selectedNotifications.length} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAll}
                  className="px-3 py-1.5 text-sm hover:bg-blue-500 rounded transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={markSelectedAsRead}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm hover:bg-blue-500 rounded transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Mark Read
                </button>
                <button
                  onClick={deleteSelected}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification List */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">
                {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
              </h3>
              <p className="text-gray-500 text-sm mt-2 text-center max-w-sm">
                When you receive notifications about your courses, enrollments, or reviews, they'll appear here.
              </p>
            </div>
          ) : (
            <div>
              {filteredNotifications.map((notification, index) => {
                const Icon = getIcon(notification.type);
                const colorClasses = getColorClasses(notification.type);
                const meta = getNotificationMeta(notification.type);
                const isSelected = selectedNotifications.includes(notification._id);

                return (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`relative flex gap-4 p-4 cursor-pointer transition-all border-b last:border-0 ${
                      notification.read
                        ? 'bg-white hover:bg-gray-50'
                        : 'bg-blue-50/50 hover:bg-blue-50'
                    } ${isSelected ? 'bg-blue-100' : ''}`}
                  >
                    {/* Selection Checkbox */}
                    {isSelectMode && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelection(notification._id)}
                          className="w-5 h-5 text-blue-600 rounded border-gray-300"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}

                    {/* Unread Indicator */}
                    {!notification.read && !isSelectMode && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                    )}

                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${colorClasses}`}>
                      <Icon size={20} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${notification.read ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>

                        {/* Delete Button */}
                        {!isSelectMode && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification._id);
                            }}
                            className="flex-shrink-0 p-1.5 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${colorClasses}`}>
                          {meta.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    {!isSelectMode && (
                      <ChevronRight className="flex-shrink-0 w-5 h-5 text-gray-300 self-center" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Clear All Button */}
        {notifications.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                if (window.confirm('Clear all notifications? This cannot be undone.')) {
                  clearAllNotifications();
                }
              }}
              className="text-red-600 hover:text-red-700 text-sm font-medium hover:underline"
            >
              Clear All Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
