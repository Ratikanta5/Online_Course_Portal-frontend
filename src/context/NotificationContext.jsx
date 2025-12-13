// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { getToken, getUser } from '../utils/auth';

const NotificationContext = createContext(null);

// Notification types for industry-grade categorization
export const NOTIFICATION_TYPES = {
  // Course-related
  COURSE_SUBMITTED: 'course_submitted',
  COURSE_APPROVED: 'course_approved',
  COURSE_REJECTED: 'course_rejected',
  
  // Topic-related
  TOPIC_SUBMITTED: 'topic_submitted',
  TOPIC_APPROVED: 'topic_approved',
  TOPIC_REJECTED: 'topic_rejected',
  
  // Lecture-related
  LECTURE_SUBMITTED: 'lecture_submitted',
  LECTURE_APPROVED: 'lecture_approved',
  LECTURE_REJECTED: 'lecture_rejected',
  
  // Enrollment-related
  NEW_ENROLLMENT: 'new_enrollment',
  ENROLLMENT_SUCCESS: 'enrollment_success',
  PAYMENT_RECEIVED: 'payment_received',
  
  // Review-related
  NEW_REVIEW: 'new_review',
  
  // System notifications
  SYSTEM: 'system',
  WELCOME: 'welcome',
};

// Priority levels
export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

// Get icon and color based on notification type
export const getNotificationMeta = (type) => {
  const meta = {
    // Course
    course_submitted: { icon: '📚', color: 'blue', label: 'Course Submitted' },
    course_approved: { icon: '✅', color: 'green', label: 'Course Approved' },
    course_rejected: { icon: '❌', color: 'red', label: 'Course Rejected' },
    
    // Topic
    topic_submitted: { icon: '📝', color: 'blue', label: 'Topic Submitted' },
    topic_approved: { icon: '✅', color: 'green', label: 'Topic Approved' },
    topic_rejected: { icon: '❌', color: 'red', label: 'Topic Rejected' },
    
    // Lecture
    lecture_submitted: { icon: '🎬', color: 'blue', label: 'Lecture Submitted' },
    lecture_approved: { icon: '✅', color: 'green', label: 'Lecture Approved' },
    lecture_rejected: { icon: '❌', color: 'red', label: 'Lecture Rejected' },
    
    // Enrollment
    new_enrollment: { icon: '🎓', color: 'purple', label: 'New Enrollment' },
    enrollment_success: { icon: '🎉', color: 'green', label: 'Enrollment Success' },
    payment_received: { icon: '💰', color: 'green', label: 'Payment Received' },
    
    // Review
    new_review: { icon: '⭐', color: 'yellow', label: 'New Review' },
    
    // System
    system: { icon: '🔔', color: 'gray', label: 'System' },
    welcome: { icon: '👋', color: 'blue', label: 'Welcome' },
  };
  
  return meta[type] || { icon: '🔔', color: 'gray', label: 'Notification' };
};

// Format relative time
export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollingRef = useRef(null);
  const lastFetchRef = useRef(null);

  // Calculate unread count
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (showLoading = true) => {
    const token = getToken();
    const user = getUser();
    
    if (!token || !user?.id) {
      setNotifications([]);
      return;
    }

    try {
      if (showLoading) setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.success) {
        const fetchedNotifications = response.data.notifications || [];
        setNotifications(fetchedNotifications);
        lastFetchRef.current = new Date();
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err.message);
      // Don't show error for 404 - means notifications endpoint doesn't exist yet
      if (err.response?.status !== 404) {
        setError('Failed to load notifications');
      }
      // Use local notifications as fallback
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new notification locally (for real-time updates)
  const addNotification = useCallback((notification) => {
    const newNotification = {
      _id: notification._id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: notification.type || NOTIFICATION_TYPES.SYSTEM,
      title: notification.title,
      message: notification.message,
      data: notification.data || {},
      read: false,
      createdAt: notification.createdAt || new Date().toISOString(),
      priority: notification.priority || PRIORITY.MEDIUM,
    };

    setNotifications(prev => [newNotification, ...prev]);
    return newNotification;
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    const token = getToken();
    
    // Update locally first for instant feedback
    setNotifications(prev =>
      prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
    );

    // Sync with server
    if (token) {
      try {
        await axios.put(
          `${API_URL}/api/notifications/${notificationId}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.warn('Failed to mark notification as read:', err.message);
      }
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    const token = getToken();
    
    // Update locally first
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    // Sync with server
    if (token) {
      try {
        await axios.put(
          `${API_URL}/api/notifications/read-all`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.warn('Failed to mark all notifications as read:', err.message);
      }
    }
  }, []);

  // Delete a notification
  const deleteNotification = useCallback(async (notificationId) => {
    const token = getToken();
    
    // Update locally first
    setNotifications(prev => prev.filter(n => n._id !== notificationId));

    // Sync with server
    if (token) {
      try {
        await axios.delete(`${API_URL}/api/notifications/${notificationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.warn('Failed to delete notification:', err.message);
      }
    }
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    const token = getToken();
    
    setNotifications([]);

    if (token) {
      try {
        await axios.delete(`${API_URL}/api/notifications/clear-all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.warn('Failed to clear notifications:', err.message);
      }
    }
  }, []);

  // Create notification (for sending to backend)
  const createNotification = useCallback(async (notificationData) => {
    const token = getToken();
    if (!token) return null;

    try {
      const response = await axios.post(
        `${API_URL}/api/notifications`,
        notificationData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        // If it's for current user, add locally
        const user = getUser();
        if (notificationData.recipientId === user?.id) {
          addNotification(response.data.notification);
        }
        return response.data.notification;
      }
    } catch (err) {
      console.warn('Failed to create notification:', err.message);
    }
    return null;
  }, [addNotification]);

  // Send notification to specific role (admin, lecturer, student)
  const sendToRole = useCallback(async (role, notification) => {
    const token = getToken();
    if (!token) return;

    try {
      await axios.post(
        `${API_URL}/api/notifications/send-to-role`,
        { role, ...notification },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.warn('Failed to send notification to role:', err.message);
    }
  }, []);

  // Send notification to course enrolled students
  const sendToCourseStudents = useCallback(async (courseId, notification) => {
    const token = getToken();
    if (!token) return;

    try {
      await axios.post(
        `${API_URL}/api/notifications/send-to-course/${courseId}`,
        notification,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.warn('Failed to send notification to course students:', err.message);
    }
  }, []);

  // Start polling for new notifications
  const startPolling = useCallback((intervalMs = 30000) => {
    if (pollingRef.current) return;
    
    pollingRef.current = setInterval(() => {
      fetchNotifications(false);
    }, intervalMs);
  }, [fetchNotifications]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Initial fetch and polling setup
  useEffect(() => {
    const user = getUser();
    if (user?.id) {
      fetchNotifications();
      startPolling(30000); // Poll every 30 seconds
    }

    return () => stopPolling();
  }, [fetchNotifications, startPolling, stopPolling]);

  // Filter notifications by type
  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.read);
  }, [notifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    createNotification,
    sendToRole,
    sendToCourseStudents,
    getNotificationsByType,
    getUnreadNotifications,
    startPolling,
    stopPolling,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used inside <NotificationProvider>');
  }
  return ctx;
};

export default NotificationContext;
