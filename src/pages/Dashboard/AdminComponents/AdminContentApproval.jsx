// src/pages/Dashboard/AdminComponents/AdminContentApproval.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Loader,
  AlertCircle,
  FileText,
  Video,
  BookOpen,
  User,
  Play,
} from 'lucide-react';
import { getPendingTopics, getPendingLectures, approveTopic, rejectTopic, approveLecture, rejectLecture } from '../../../utils/adminApi';
import { 
  NotificationTemplates, 
  sendNotificationToUser, 
  sendNotificationToCourseStudents 
} from '../../../utils/notificationApi';

const AdminContentApproval = () => {
  const [activeTab, setActiveTab] = useState('topics');
  const [topics, setTopics] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Fetch pending content
  useEffect(() => {
    const fetchPendingContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const [topicsRes, lecturesRes] = await Promise.all([
          getPendingTopics(),
          getPendingLectures()
        ]);

        if (topicsRes.success) {
          setTopics(topicsRes.topics || []);
        }
        if (lecturesRes.success) {
          setLectures(lecturesRes.lectures || []);
        }
      } catch (err) {
        console.error('Error fetching pending content:', err);
        setError('Failed to load pending content');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingContent();
  }, []);

  // Handle topic approval
  const handleApproveTopic = async (topicId) => {
    const topic = topics.find(t => t._id === topicId);
    try {
      setActionLoading(topicId);
      const result = await approveTopic(topicId);
      if (result.success) {
        setTopics(topics.filter(t => t._id !== topicId));
        
        // Send notification to lecturer
        const lecturerId = topic?.courseId?.createdBy?._id || topic?.courseId?.createdBy;
        if (lecturerId) {
          try {
            const notification = NotificationTemplates.topicApproved(
              topic.title, 
              topic.courseId?.title || 'your course'
            );
            await sendNotificationToUser(lecturerId, {
              ...notification,
              data: { topicId: topic._id, courseId: topic.courseId?._id }
            });
            
            // Notify enrolled students about new content
            if (topic.courseId?._id) {
              await sendNotificationToCourseStudents(topic.courseId._id, {
                ...NotificationTemplates.newContentAdded(topic.courseId.title, 'topic'),
                data: { topicId: topic._id, courseId: topic.courseId._id }
              });
            }
          } catch (notifErr) {
            console.warn('Failed to send notification:', notifErr);
          }
        }
      }
    } catch (err) {
      alert('Error approving topic: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle topic rejection
  const handleRejectTopic = async (topicId) => {
    const topic = topics.find(t => t._id === topicId);
    if (!window.confirm('Are you sure you want to reject this topic?')) return;
    try {
      setActionLoading(topicId);
      const result = await rejectTopic(topicId);
      if (result.success) {
        setTopics(topics.filter(t => t._id !== topicId));
        
        // Send notification to lecturer
        const lecturerId = topic?.courseId?.createdBy?._id || topic?.courseId?.createdBy;
        if (lecturerId) {
          try {
            const notification = NotificationTemplates.topicRejected(
              topic.title, 
              topic.courseId?.title || 'your course',
              'Please review and resubmit'
            );
            await sendNotificationToUser(lecturerId, {
              ...notification,
              data: { topicId: topic._id, courseId: topic.courseId?._id }
            });
          } catch (notifErr) {
            console.warn('Failed to send notification:', notifErr);
          }
        }
      }
    } catch (err) {
      alert('Error rejecting topic: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle lecture approval
  const handleApproveLecture = async (topicId, lectureId) => {
    const lecture = lectures.find(l => l._id === lectureId);
    try {
      setActionLoading(lectureId);
      const result = await approveLecture(topicId, lectureId);
      if (result.success) {
        setLectures(lectures.filter(l => l._id !== lectureId));
        
        // Send notification to lecturer
        const lecturerId = lecture?.lecturerId || lecture?.courseId?.createdBy;
        if (lecturerId) {
          try {
            const notification = NotificationTemplates.lectureApproved(
              lecture.title, 
              lecture.topicTitle || 'topic'
            );
            await sendNotificationToUser(lecturerId, {
              ...notification,
              data: { lectureId: lecture._id, topicId: topicId }
            });
            
            // Notify enrolled students about new lecture
            if (lecture.courseId) {
              const courseId = typeof lecture.courseId === 'object' ? lecture.courseId._id : lecture.courseId;
              await sendNotificationToCourseStudents(courseId, {
                ...NotificationTemplates.newContentAdded(lecture.courseTitle || 'course', 'lecture'),
                data: { lectureId: lecture._id, topicId: topicId, courseId: courseId }
              });
            }
          } catch (notifErr) {
            console.warn('Failed to send notification:', notifErr);
          }
        }
      }
    } catch (err) {
      alert('Error approving lecture: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle lecture rejection
  const handleRejectLecture = async (topicId, lectureId) => {
    const lecture = lectures.find(l => l._id === lectureId);
    if (!window.confirm('Are you sure you want to reject this lecture?')) return;
    try {
      setActionLoading(lectureId);
      const result = await rejectLecture(topicId, lectureId);
      if (result.success) {
        setLectures(lectures.filter(l => l._id !== lectureId));
        
        // Send notification to lecturer
        const lecturerId = lecture?.lecturerId || lecture?.courseId?.createdBy;
        if (lecturerId) {
          try {
            const notification = NotificationTemplates.lectureRejected(
              lecture.title, 
              lecture.topicTitle || 'topic',
              'Please review and resubmit'
            );
            await sendNotificationToUser(lecturerId, {
              ...notification,
              data: { lectureId: lecture._id, topicId: topicId }
            });
          } catch (notifErr) {
            console.warn('Failed to send notification:', notifErr);
          }
        }
      }
    } catch (err) {
      alert('Error rejecting lecture: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Approval</h2>
          <p className="text-gray-500 text-sm mt-1">Review and approve pending topics & lectures</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('topics')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
            activeTab === 'topics'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText size={18} />
          Pending Topics
          {topics.length > 0 && (
            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
              {topics.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('lectures')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
            activeTab === 'lectures'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Video size={18} />
          Pending Lectures
          {lectures.length > 0 && (
            <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs font-bold">
              {lectures.length}
            </span>
          )}
        </button>
      </div>

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

      {/* Topics Tab */}
      {!loading && activeTab === 'topics' && (
        <div className="space-y-4">
          {topics.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-gray-700">No Pending Topics</h3>
              <p className="text-gray-500 text-sm mt-2">All topics have been reviewed</p>
            </div>
          ) : (
            topics.map((topic, idx) => (
              <motion.div
                key={topic._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all p-4"
              >
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FileText className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{topic.title}</h3>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 text-xs font-medium">
                          <Clock size={12} />
                          Pending
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                      <div className="flex items-center gap-1">
                        <BookOpen size={14} />
                        Course: <span className="font-medium">{topic.courseId?.title || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        By: <span className="font-medium">{topic.courseId?.createdBy?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Video size={14} />
                        Lectures: <span className="font-medium">{topic.lectures?.length || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveTopic(topic._id)}
                      disabled={actionLoading === topic._id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                    >
                      {actionLoading === topic._id ? (
                        <Loader className="animate-spin" size={18} />
                      ) : (
                        <>
                          <Check size={18} />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleRejectTopic(topic._id)}
                      disabled={actionLoading === topic._id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                    >
                      <X size={18} />
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Lectures Tab */}
      {!loading && activeTab === 'lectures' && (
        <div className="space-y-4">
          {lectures.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-gray-700">No Pending Lectures</h3>
              <p className="text-gray-500 text-sm mt-2">All lectures have been reviewed</p>
            </div>
          ) : (
            lectures.map((lecture, idx) => (
              <motion.div
                key={lecture._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all p-4"
              >
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Video className="text-purple-600" size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{lecture.title}</h3>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 text-xs font-medium">
                          <Clock size={12} />
                          Pending
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                      <div className="flex items-center gap-1">
                        <BookOpen size={14} />
                        Course: <span className="font-medium">{lecture.courseTitle || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText size={14} />
                        Topic: <span className="font-medium">{lecture.topicTitle || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        By: <span className="font-medium">{lecture.lecturerName || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        Duration: <span className="font-medium">{lecture.lectureDuration || 0} min</span>
                      </div>
                    </div>
                    {lecture.videoUrl?.url && (
                      <div className="mt-3">
                        <a
                          href={lecture.videoUrl.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          <Play size={16} />
                          Preview Video
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveLecture(lecture.topicId, lecture._id)}
                      disabled={actionLoading === lecture._id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                    >
                      {actionLoading === lecture._id ? (
                        <Loader className="animate-spin" size={18} />
                      ) : (
                        <>
                          <Check size={18} />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleRejectLecture(lecture.topicId, lecture._id)}
                      disabled={actionLoading === lecture._id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                    >
                      <X size={18} />
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminContentApproval;
