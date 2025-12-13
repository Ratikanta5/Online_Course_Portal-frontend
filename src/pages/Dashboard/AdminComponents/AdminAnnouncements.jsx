// src/pages/Dashboard/AdminComponents/AdminAnnouncements.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  Send,
  Users,
  GraduationCap,
  UserCog,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
  Bell,
  MessageSquare,
  Info,
  AlertTriangle,
  Star,
  RefreshCw,
  ChevronDown,
  X,
  Eye,
} from 'lucide-react';
import { getToken } from '../../../utils/auth';

const API_URL = import.meta.env.VITE_API_URL;

const AdminAnnouncements = () => {
  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState('all'); // 'all', 'students', 'lecturers'
  const [priority, setPriority] = useState('medium');
  const [notificationType, setNotificationType] = useState('system_announcement');
  
  // UI state
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  
  // History state
  const [sentAnnouncements, setSentAnnouncements] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Templates for quick announcements
  const templates = [
    {
      id: 'maintenance',
      name: 'Scheduled Maintenance',
      title: 'Scheduled Platform Maintenance',
      message: 'We will be performing scheduled maintenance on [DATE] from [TIME] to [TIME]. During this period, the platform may be temporarily unavailable. We apologize for any inconvenience.',
      type: 'system_announcement',
      priority: 'high',
    },
    {
      id: 'new_feature',
      name: 'New Feature',
      title: 'Exciting New Feature Available!',
      message: 'We are thrilled to announce a new feature: [FEATURE_NAME]. This will help you [BENEFIT]. Check it out now!',
      type: 'system_announcement',
      priority: 'medium',
    },
    {
      id: 'reminder',
      name: 'General Reminder',
      title: 'Important Reminder',
      message: 'This is a friendly reminder about [TOPIC]. Please ensure you [ACTION] by [DATE].',
      type: 'system_announcement',
      priority: 'medium',
    },
    {
      id: 'welcome',
      name: 'Welcome Message',
      title: 'Welcome to DevHub!',
      message: 'Welcome to our learning platform! We are excited to have you here. Explore our courses and start your learning journey today.',
      type: 'system_announcement',
      priority: 'low',
    },
    {
      id: 'course_update',
      name: 'Course Updates',
      title: 'New Course Content Available',
      message: 'We have added new content to several courses. Check out the latest lectures and topics to continue your learning!',
      type: 'course_updated',
      priority: 'medium',
    },
  ];

  const recipientOptions = [
    { value: 'all', label: 'All Users', icon: Users, description: 'Send to all students and lecturers' },
    { value: 'students', label: 'Students Only', icon: GraduationCap, description: 'Send only to students' },
    { value: 'lecturers', label: 'Lecturers Only', icon: UserCog, description: 'Send only to lecturers' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700 border-red-300' },
  ];

  const typeOptions = [
    { value: 'system_announcement', label: 'System Announcement', icon: Megaphone },
    { value: 'course_updated', label: 'Course Update', icon: Bell },
    { value: 'new_content', label: 'New Content', icon: Star },
  ];

  // Apply template
  const applyTemplate = (template) => {
    setTitle(template.title);
    setMessage(template.message);
    setNotificationType(template.type);
    setPriority(template.priority);
  };

  // Send announcement
  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      setError('Please fill in both title and message');
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getToken();
      const rolesToSend = recipients === 'all' 
        ? ['student', 'lecture'] 
        : recipients === 'students' 
          ? ['student'] 
          : ['lecture'];

      let totalSent = 0;

      // Send to each role
      for (const role of rolesToSend) {
        const response = await fetch(`${API_URL}/api/notifications/send-to-role`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role,
            type: notificationType,
            title: title.trim(),
            message: message.trim(),
            priority,
            data: {
              isAnnouncement: true,
              sentAt: new Date().toISOString(),
            },
          }),
        });

        const data = await response.json();
        if (data.success) {
          totalSent += data.count || 0;
        }
      }

      setSuccess(`Announcement sent successfully to ${totalSent} user(s)!`);
      
      // Clear form after success
      setTitle('');
      setMessage('');
      setPriority('medium');
      setNotificationType('system_announcement');

      // Add to local history
      setSentAnnouncements(prev => [{
        id: Date.now(),
        title: title.trim(),
        message: message.trim(),
        recipients: recipientOptions.find(r => r.value === recipients)?.label,
        priority,
        type: notificationType,
        sentAt: new Date().toISOString(),
        count: totalSent,
      }, ...prev].slice(0, 10));

    } catch (err) {
      console.error('Send announcement error:', err);
      setError(err.message || 'Failed to send announcement');
    } finally {
      setSending(false);
    }
  };

  // Character count
  const maxTitleLength = 100;
  const maxMessageLength = 500;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white">
              <Megaphone size={24} />
            </div>
            Announcements
          </h2>
          <p className="text-gray-500 mt-1">Send announcements to lecturers, students, or everyone</p>
        </div>
        
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-700"
        >
          <Clock size={18} />
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3"
          >
            <CheckCircle size={20} />
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="ml-auto hover:text-green-900">
              <X size={18} />
            </button>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3"
          >
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto hover:text-red-900">
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Compose Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare size={20} className="text-purple-600" />
              Compose Announcement
            </h3>

            {/* Recipients Selection */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send To
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recipientOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setRecipients(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        recipients === option.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          recipients === option.value ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, maxTitleLength))}
                placeholder="Enter announcement title..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
              <div className="text-xs text-gray-400 mt-1 text-right">
                {title.length}/{maxTitleLength}
              </div>
            </div>

            {/* Message Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, maxMessageLength))}
                placeholder="Write your announcement message..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
              />
              <div className="text-xs text-gray-400 mt-1 text-right">
                {message.length}/{maxMessageLength}
              </div>
            </div>

            {/* Priority & Type Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <div className="flex flex-wrap gap-2">
                  {priorityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPriority(option.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                        priority === option.value
                          ? option.color + ' ring-2 ring-offset-1 ring-current'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={notificationType}
                  onChange={(e) => setNotificationType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white"
                >
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={sending || !title.trim() || !message.trim()}
              className={`w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition ${
                sending || !title.trim() || !message.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {sending ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send Announcement
                </>
              )}
            </button>
          </div>

          {/* History Section */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-purple-600" />
                  Recent Announcements
                </h3>

                {sentAnnouncements.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Megaphone size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No announcements sent yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sentAnnouncements.map((announcement) => (
                      <div
                        key={announcement.id}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{announcement.message}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Users size={12} />
                                {announcement.recipients}
                              </span>
                              <span>•</span>
                              <span>{announcement.count} recipients</span>
                              <span>•</span>
                              <span>{new Date(announcement.sentAt).toLocaleString()}</span>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                            priorityOptions.find(p => p.value === announcement.priority)?.color || 'bg-gray-100'
                          }`}>
                            {announcement.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Templates Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star size={20} className="text-yellow-500" />
              Quick Templates
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Click to use a template as a starting point
            </p>

            <div className="space-y-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  className="w-full p-3 text-left bg-gray-50 hover:bg-purple-50 rounded-xl border border-gray-100 hover:border-purple-200 transition group"
                >
                  <div className="font-medium text-gray-900 group-hover:text-purple-700">
                    {template.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {template.title}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <Info size={20} />
              Tips
            </h3>
            <ul className="space-y-2 text-sm text-purple-800">
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                Keep announcements clear and concise
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                Use high priority only for urgent matters
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                Target the right audience to avoid spam
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                Include actionable information when possible
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminAnnouncements;
