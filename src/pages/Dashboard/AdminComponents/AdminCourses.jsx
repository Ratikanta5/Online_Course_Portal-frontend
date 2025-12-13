// src/pages/Dashboard/AdminComponents/AdminCourses.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Check,
  X,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Loader,
  AlertCircle,
  Star,
  BookOpen,
} from 'lucide-react';
import { getAllCoursesAdmin, approveCourse, rejectCourse, deleteCourse } from '../../../utils/adminApi';
import { 
  NotificationTemplates, 
  sendNotificationToUser, 
  sendNotificationToCourseStudents 
} from '../../../utils/notificationApi';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending'); // Default to pending
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllCoursesAdmin({
          search,
          status: statusFilter || 'all',
        });
        
        if (response.success) {
          setCourses(response.courses || []);
        } else {
          // Show helpful message if access denied
          if (response.error === 'Access denied') {
            setError('Backend authentication required. Please ensure you have proper permissions.');
          } else {
            setError('Failed to fetch courses');
          }
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchCourses();
    }, 500);

    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleApproveCourse = async () => {
    if (!selectedCourse) return;
    
    try {
      setActionLoading(true);
      const result = await approveCourse(selectedCourse._id, feedback);
      
      if (result.success) {
        setCourses(courses.filter(c => c._id !== selectedCourse._id));
        
        // Send notification to lecturer about approval
        const lecturerId = selectedCourse.creator?._id || selectedCourse.createdBy?._id || selectedCourse.createdBy;
        if (lecturerId) {
          try {
            const notification = NotificationTemplates.courseApproved(selectedCourse.title);
            await sendNotificationToUser(lecturerId, {
              ...notification,
              data: { courseId: selectedCourse._id }
            });
            
            // Notify enrolled students (if any) about the course going live
            if (selectedCourse.enrolledStudents?.length > 0) {
              await sendNotificationToCourseStudents(selectedCourse._id, {
                type: 'course_approved',
                title: '🎉 Course is Now Live!',
                message: `The course "${selectedCourse.title}" you enrolled in is now officially live!`,
                data: { courseId: selectedCourse._id }
              });
            }
          } catch (notifErr) {
            console.warn('Failed to send notification:', notifErr);
          }
        }
        
        setShowApprovalModal(false);
        setFeedback('');
        setSelectedCourse(null);
      }
    } catch (err) {
      alert('Error approving course: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCourse = async () => {
    if (!selectedCourse) return;
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    
    try {
      setActionLoading(true);
      const result = await rejectCourse(selectedCourse._id, rejectReason);
      
      if (result.success) {
        setCourses(courses.filter(c => c._id !== selectedCourse._id));
        
        // Send notification to lecturer about rejection
        const lecturerId = selectedCourse.creator?._id || selectedCourse.createdBy?._id || selectedCourse.createdBy;
        if (lecturerId) {
          try {
            const notification = NotificationTemplates.courseRejected(selectedCourse.title, rejectReason);
            await sendNotificationToUser(lecturerId, {
              ...notification,
              data: { courseId: selectedCourse._id }
            });
          } catch (notifErr) {
            console.warn('Failed to send notification:', notifErr);
          }
        }
        
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedCourse(null);
      }
    } catch (err) {
      alert('Error rejecting course: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Permanently delete this course?')) return;
    
    try {
      await deleteCourse(courseId);
      setCourses(courses.filter(c => c._id !== courseId));
    } catch (err) {
      alert('Error deleting course: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
      pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
      rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
    };
    
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`flex items-center gap-1 px-3 py-1 rounded-full ${badge.bg} ${badge.color} text-sm font-medium`}>
        <Icon size={16} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
          <p className="text-gray-500 text-sm mt-1">Review and approve pending courses</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by course title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Pending Count */}
      {statusFilter === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-amber-600" size={20} />
          <div>
            <p className="font-semibold text-amber-900">{courses.length} pending courses</p>
            <p className="text-sm text-amber-700">Waiting for your approval</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin text-blue-500" size={32} />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && courses.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-gray-700">
            {statusFilter === 'pending' ? 'No Pending Courses' : 'No Courses Found'}
          </h3>
          <p className="text-gray-500 text-sm mt-2">
            {statusFilter === 'pending'
              ? 'All courses are either approved or rejected'
              : 'Try adjusting your filters'}
          </p>
        </div>
      )}

      {/* Courses List */}
      <div className="space-y-4">
        {courses.map((course, idx) => (
          <motion.div
            key={course._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all p-4"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Course Image */}
              {course.courseImage?.url ? (
                <img
                  src={course.courseImage.url}
                  alt={course.title}
                  className="w-full lg:w-32 h-32 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-full lg:w-32 h-32 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="text-white opacity-50" size={32} />
                </div>
              )}

              {/* Course Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-gray-500">
                      By <span className="font-medium">{course.createdBy?.name || 'Unknown'}</span>
                    </p>
                  </div>
                  {getStatusBadge(course.courseStatus)}
                </div>

                <p className="text-gray-600 text-sm line-clamp-2 mb-3">{course.description}</p>

                {/* Course Stats */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                  <div>
                    <span className="font-semibold">${course.price}</span>
                  </div>
                  {course.averageRating && (
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      <span>{course.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                  <div>
                    Category: <span className="font-semibold">{course.category || 'General'}</span>
                  </div>
                </div>

                {/* Topics Count */}
                {course.topics && (
                  <p className="text-sm text-gray-500 mb-3">
                    {course.topics.length} topics • {course.totalReviews || 0} reviews
                  </p>
                )}
              </div>

              {/* Actions */}
              {course.courseStatus === 'pending' && (
                <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:justify-center">
                  <button
                    onClick={() => {
                      setSelectedCourse(course);
                      setShowApprovalModal(true);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <Check size={18} />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCourse(course);
                      setShowRejectModal(true);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <X size={18} />
                    <span>Reject</span>
                  </button>
                </div>
              )}

              {course.courseStatus !== 'pending' && (
                <div className="flex sm:flex-row lg:flex-col gap-2 justify-end lg:justify-center">
                  <button
                    onClick={() => handleDeleteCourse(course._id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    <Trash2 size={18} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">Approve Course?</h3>
            <p className="text-gray-600 mb-4">{selectedCourse.title}</p>

            <textarea
              placeholder="Optional approval feedback for the instructor..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
              rows="3"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setFeedback('');
                  setSelectedCourse(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveCourse}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {actionLoading ? (
                  <Loader className="animate-spin" size={18} />
                ) : (
                  <>
                    <Check size={18} />
                    Approve
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reject Course?</h3>
            <p className="text-gray-600 mb-4">{selectedCourse.title}</p>

            <textarea
              placeholder="Please provide a detailed rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              rows="3"
              required
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedCourse(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectCourse}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {actionLoading ? (
                  <Loader className="animate-spin" size={18} />
                ) : (
                  <>
                    <X size={18} />
                    Reject
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
