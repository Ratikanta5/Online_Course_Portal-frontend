// src/utils/notificationApi.js
// Notification API Service - Industry-grade notification management
import axios from 'axios';
import { getToken } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Create axios instance with auth headers
const notifAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to every request
notifAxios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== NOTIFICATION TYPES ====================
export const NotificationTypes = {
  // Course lifecycle
  COURSE_SUBMITTED: 'course_submitted',
  COURSE_APPROVED: 'course_approved',
  COURSE_REJECTED: 'course_rejected',
  COURSE_UPDATED: 'course_updated',
  
  // Topic lifecycle
  TOPIC_SUBMITTED: 'topic_submitted',
  TOPIC_APPROVED: 'topic_approved',
  TOPIC_REJECTED: 'topic_rejected',
  
  // Lecture lifecycle
  LECTURE_SUBMITTED: 'lecture_submitted',
  LECTURE_APPROVED: 'lecture_approved',
  LECTURE_REJECTED: 'lecture_rejected',
  
  // Enrollment & Payment
  NEW_ENROLLMENT: 'new_enrollment',
  ENROLLMENT_SUCCESS: 'enrollment_success',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_FAILED: 'payment_failed',
  
  // Reviews
  NEW_REVIEW: 'new_review',
  REVIEW_RESPONSE: 'review_response',
  
  // User actions
  NEW_STUDENT: 'new_student',
  PROFILE_UPDATED: 'profile_updated',
  
  // System
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
  MAINTENANCE: 'maintenance',
  WELCOME: 'welcome',
};

// ==================== MESSAGE TEMPLATES ====================
export const NotificationTemplates = {
  // Course notifications
  courseSubmitted: (courseName, lecturerName) => ({
    type: NotificationTypes.COURSE_SUBMITTED,
    title: '📚 New Course Pending Approval',
    message: `${lecturerName} has submitted a new course "${courseName}" for review.`,
    priority: 'high',
  }),
  
  courseApproved: (courseName) => ({
    type: NotificationTypes.COURSE_APPROVED,
    title: '✅ Course Approved!',
    message: `Great news! Your course "${courseName}" has been approved and is now live.`,
    priority: 'high',
  }),
  
  courseRejected: (courseName, reason) => ({
    type: NotificationTypes.COURSE_REJECTED,
    title: '❌ Course Needs Revision',
    message: `Your course "${courseName}" requires changes. Reason: ${reason || 'Please review and resubmit.'}`,
    priority: 'high',
  }),

  // Topic notifications
  topicSubmitted: (topicName, courseName, lecturerName) => ({
    type: NotificationTypes.TOPIC_SUBMITTED,
    title: '📝 New Topic Pending Approval',
    message: `${lecturerName} added a new topic "${topicName}" to "${courseName}".`,
    priority: 'medium',
  }),
  
  topicApproved: (topicName, courseName) => ({
    type: NotificationTypes.TOPIC_APPROVED,
    title: '✅ Topic Approved!',
    message: `Your topic "${topicName}" in "${courseName}" has been approved.`,
    priority: 'medium',
  }),
  
  topicRejected: (topicName, courseName, reason) => ({
    type: NotificationTypes.TOPIC_REJECTED,
    title: '❌ Topic Needs Revision',
    message: `Your topic "${topicName}" in "${courseName}" requires changes. ${reason || ''}`,
    priority: 'medium',
  }),

  // Lecture notifications
  lectureSubmitted: (lectureName, topicName, lecturerName) => ({
    type: NotificationTypes.LECTURE_SUBMITTED,
    title: '🎬 New Lecture Pending Approval',
    message: `${lecturerName} added a new lecture "${lectureName}" to topic "${topicName}".`,
    priority: 'medium',
  }),
  
  lectureApproved: (lectureName, topicName) => ({
    type: NotificationTypes.LECTURE_APPROVED,
    title: '✅ Lecture Approved!',
    message: `Your lecture "${lectureName}" in "${topicName}" is now live.`,
    priority: 'medium',
  }),
  
  lectureRejected: (lectureName, topicName, reason) => ({
    type: NotificationTypes.LECTURE_REJECTED,
    title: '❌ Lecture Needs Revision',
    message: `Your lecture "${lectureName}" in "${topicName}" requires changes. ${reason || ''}`,
    priority: 'medium',
  }),

  // Enrollment notifications
  newEnrollment: (studentName, courseName) => ({
    type: NotificationTypes.NEW_ENROLLMENT,
    title: '🎓 New Student Enrolled!',
    message: `${studentName} has enrolled in your course "${courseName}".`,
    priority: 'medium',
  }),
  
  enrollmentSuccess: (courseName) => ({
    type: NotificationTypes.ENROLLMENT_SUCCESS,
    title: '🎉 Enrollment Successful!',
    message: `You have successfully enrolled in "${courseName}". Start learning now!`,
    priority: 'high',
  }),
  
  paymentReceived: (amount, courseName, studentName) => ({
    type: NotificationTypes.PAYMENT_RECEIVED,
    title: '💰 Payment Received',
    message: `You received ₹${amount} from ${studentName}'s enrollment in "${courseName}".`,
    priority: 'high',
  }),

  // Review notifications
  newReview: (studentName, courseName, rating) => ({
    type: NotificationTypes.NEW_REVIEW,
    title: `⭐ New ${rating}-Star Review`,
    message: `${studentName} left a review on "${courseName}".`,
    priority: 'low',
  }),

  // Course update for students
  newContentAdded: (courseName, contentType) => ({
    type: NotificationTypes.COURSE_UPDATED,
    title: '📢 New Content Available!',
    message: `New ${contentType} has been added to "${courseName}".`,
    priority: 'medium',
  }),

  // Welcome notification
  welcome: (userName, role) => ({
    type: NotificationTypes.WELCOME,
    title: '👋 Welcome to LearnSphere!',
    message: `Hi ${userName}! Welcome aboard as a ${role}. Start your journey now!`,
    priority: 'low',
  }),
};

// ==================== API FUNCTIONS ====================

// Get all notifications for current user
export const getNotifications = async (params = {}) => {
  try {
    const response = await notifAxios.get('/api/notifications', { params });
    return {
      success: true,
      notifications: response.data?.notifications || [],
      total: response.data?.total || 0,
      unreadCount: response.data?.unreadCount || 0,
    };
  } catch (error) {
    console.warn('Error fetching notifications:', error.message);
    return { success: false, notifications: [], total: 0, unreadCount: 0 };
  }
};

// Create a notification (admin or system use)
export const createNotification = async (notificationData) => {
  try {
    const response = await notifAxios.post('/api/notifications', notificationData);
    return { success: true, notification: response.data?.notification };
  } catch (error) {
    console.warn('Error creating notification:', error.message);
    return { success: false, error: error.message };
  }
};

// Send notification to a specific user
export const sendNotificationToUser = async (userId, notification) => {
  try {
    const response = await notifAxios.post('/api/notifications/send', {
      recipientId: userId,
      ...notification,
    });
    return { success: true, notification: response.data?.notification };
  } catch (error) {
    console.warn('Error sending notification:', error.message);
    return { success: false, error: error.message };
  }
};

// Send notification to all users with specific role
export const sendNotificationToRole = async (role, notification) => {
  try {
    const response = await notifAxios.post('/api/notifications/send-to-role', {
      role,
      ...notification,
    });
    return { success: true, count: response.data?.count || 0 };
  } catch (error) {
    console.warn('Error sending notification to role:', error.message);
    return { success: false, error: error.message };
  }
};

// Send notification to all students enrolled in a course
export const sendNotificationToCourseStudents = async (courseId, notification) => {
  try {
    const response = await notifAxios.post(`/api/notifications/send-to-course/${courseId}`, notification);
    return { success: true, count: response.data?.count || 0 };
  } catch (error) {
    console.warn('Error sending notification to course students:', error.message);
    return { success: false, error: error.message };
  }
};

// Mark notification as read
export const markNotificationRead = async (notificationId) => {
  try {
    await notifAxios.put(`/api/notifications/${notificationId}/read`);
    return { success: true };
  } catch (error) {
    console.warn('Error marking notification as read:', error.message);
    return { success: false };
  }
};

// Mark all notifications as read
export const markAllNotificationsRead = async () => {
  try {
    await notifAxios.put('/api/notifications/read-all');
    return { success: true };
  } catch (error) {
    console.warn('Error marking all notifications as read:', error.message);
    return { success: false };
  }
};

// Delete a notification
export const deleteNotification = async (notificationId) => {
  try {
    await notifAxios.delete(`/api/notifications/${notificationId}`);
    return { success: true };
  } catch (error) {
    console.warn('Error deleting notification:', error.message);
    return { success: false };
  }
};

// Clear all notifications
export const clearAllNotifications = async () => {
  try {
    await notifAxios.delete('/api/notifications/clear-all');
    return { success: true };
  } catch (error) {
    console.warn('Error clearing notifications:', error.message);
    return { success: false };
  }
};

// ==================== NOTIFICATION TRIGGERS ====================
// These functions trigger notifications for specific events

// When lecturer submits a new course
export const notifyCourseSubmitted = async (course, lecturer) => {
  const template = NotificationTemplates.courseSubmitted(course.title, lecturer.name);
  return await sendNotificationToRole('admin', {
    ...template,
    data: { courseId: course._id, lecturerId: lecturer._id },
  });
};

// When admin approves a course
export const notifyCourseApproved = async (course, lecturerId) => {
  const template = NotificationTemplates.courseApproved(course.title);
  
  // Notify lecturer
  await sendNotificationToUser(lecturerId, {
    ...template,
    data: { courseId: course._id },
  });

  // Notify enrolled students (if any)
  if (course.enrolledStudents?.length > 0) {
    await sendNotificationToCourseStudents(course._id, {
      ...NotificationTemplates.newContentAdded(course.title, 'updates'),
      data: { courseId: course._id },
    });
  }
};

// When admin rejects a course
export const notifyCourseRejected = async (course, lecturerId, reason) => {
  const template = NotificationTemplates.courseRejected(course.title, reason);
  return await sendNotificationToUser(lecturerId, {
    ...template,
    data: { courseId: course._id },
  });
};

// When lecturer adds a topic
export const notifyTopicSubmitted = async (topic, course, lecturer) => {
  const template = NotificationTemplates.topicSubmitted(topic.title, course.title, lecturer.name);
  return await sendNotificationToRole('admin', {
    ...template,
    data: { topicId: topic._id, courseId: course._id },
  });
};

// When admin approves a topic
export const notifyTopicApproved = async (topic, course, lecturerId) => {
  const template = NotificationTemplates.topicApproved(topic.title, course.title);
  
  // Notify lecturer
  await sendNotificationToUser(lecturerId, {
    ...template,
    data: { topicId: topic._id, courseId: course._id },
  });

  // Notify enrolled students
  await sendNotificationToCourseStudents(course._id, {
    ...NotificationTemplates.newContentAdded(course.title, 'topic'),
    data: { topicId: topic._id, courseId: course._id },
  });
};

// When lecturer adds a lecture
export const notifyLectureSubmitted = async (lecture, topic, lecturer) => {
  const template = NotificationTemplates.lectureSubmitted(lecture.title, topic.title, lecturer.name);
  return await sendNotificationToRole('admin', {
    ...template,
    data: { lectureId: lecture._id, topicId: topic._id },
  });
};

// When admin approves a lecture
export const notifyLectureApproved = async (lecture, topic, course, lecturerId) => {
  const template = NotificationTemplates.lectureApproved(lecture.title, topic.title);
  
  // Notify lecturer
  await sendNotificationToUser(lecturerId, {
    ...template,
    data: { lectureId: lecture._id, topicId: topic._id },
  });

  // Notify enrolled students
  await sendNotificationToCourseStudents(course._id, {
    ...NotificationTemplates.newContentAdded(course.title, 'lecture'),
    data: { lectureId: lecture._id, topicId: topic._id, courseId: course._id },
  });
};

// When student enrolls in a course
export const notifyNewEnrollment = async (student, course, amount) => {
  // Notify lecturer
  await sendNotificationToUser(course.creator?._id || course.creator, {
    ...NotificationTemplates.newEnrollment(student.name, course.title),
    data: { studentId: student._id, courseId: course._id },
  });

  // Notify lecturer about payment
  const lecturerShare = Math.round(amount * 0.8);
  await sendNotificationToUser(course.creator?._id || course.creator, {
    ...NotificationTemplates.paymentReceived(lecturerShare, course.title, student.name),
    data: { studentId: student._id, courseId: course._id, amount: lecturerShare },
  });

  // Notify student about successful enrollment
  await sendNotificationToUser(student._id, {
    ...NotificationTemplates.enrollmentSuccess(course.title),
    data: { courseId: course._id },
  });
};

// When student leaves a review
export const notifyNewReview = async (student, course, rating) => {
  const template = NotificationTemplates.newReview(student.name, course.title, rating);
  return await sendNotificationToUser(course.creator?._id || course.creator, {
    ...template,
    data: { studentId: student._id, courseId: course._id, rating },
  });
};

export default {
  getNotifications,
  createNotification,
  sendNotificationToUser,
  sendNotificationToRole,
  sendNotificationToCourseStudents,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  // Triggers
  notifyCourseSubmitted,
  notifyCourseApproved,
  notifyCourseRejected,
  notifyTopicSubmitted,
  notifyTopicApproved,
  notifyLectureSubmitted,
  notifyLectureApproved,
  notifyNewEnrollment,
  notifyNewReview,
  // Templates
  NotificationTemplates,
  NotificationTypes,
};
