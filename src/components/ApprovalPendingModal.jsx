// src/components/ApprovalPendingModal.jsx
// Professional, industry-grade approval pending notification modal
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle2, 
  Bell, 
  BookOpen, 
  FileText, 
  Video,
  X,
  Sparkles,
  Shield,
  ArrowRight
} from 'lucide-react';

// Content type configurations
const contentTypes = {
  course: {
    icon: BookOpen,
    title: 'Course Submitted Successfully!',
    subtitle: 'Your course is now under review',
    color: 'from-purple-500 to-indigo-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    message: 'Your course has been submitted and is awaiting admin approval. You will receive a notification once it\'s reviewed.',
    tips: [
      'Courses are typically reviewed within 24-48 hours',
      'You\'ll receive a notification when approved',
      'You can track the status in "My Courses"'
    ]
  },
  topic: {
    icon: FileText,
    title: 'Topic Added Successfully!',
    subtitle: 'Your topic is pending approval',
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    message: 'Your new topic has been added and is awaiting admin approval before it becomes visible to students.',
    tips: [
      'Topics are reviewed along with their lectures',
      'You can continue adding more content',
      'Check "My Courses" for approval status'
    ]
  },
  lecture: {
    icon: Video,
    title: 'Lecture Uploaded Successfully!',
    subtitle: 'Your lecture is pending approval',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    message: 'Your lecture has been uploaded and is awaiting admin review. Once approved, enrolled students will be notified.',
    tips: [
      'Video content is reviewed for quality',
      'Students will be notified of new content',
      'You can add more lectures while waiting'
    ]
  }
};

const ApprovalPendingModal = ({ 
  isOpen, 
  onClose, 
  type = 'course', // 'course', 'topic', 'lecture'
  contentName = '', // Name of the course/topic/lecture
  autoCloseDelay = null // Auto close after X milliseconds (null = manual close only)
}) => {
  const config = contentTypes[type] || contentTypes.course;
  const IconComponent = config.icon;

  // Auto close functionality
  useEffect(() => {
    if (isOpen && autoCloseDelay) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6"
          >
            <div className="w-full max-w-md sm:max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
              {/* Header with gradient */}
              <div className={`bg-gradient-to-r ${config.color} px-6 py-8 sm:px-8 sm:py-10 relative overflow-hidden`}>
                {/* Background decorations */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <X size={20} />
                </button>

                {/* Icon and title */}
                <div className="relative text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                    className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-4"
                  >
                    <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                      {config.title}
                    </h2>
                    <p className="text-white/80 text-sm sm:text-base">
                      {config.subtitle}
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6 sm:px-8 sm:py-8">
                {/* Content name badge */}
                {contentName && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`${config.bgColor} ${config.borderColor} border rounded-xl px-4 py-3 mb-5`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${config.iconBg} p-2 rounded-lg`}>
                        <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                          {type === 'course' ? 'Course Name' : type === 'topic' ? 'Topic Name' : 'Lecture Name'}
                        </p>
                        <p className="text-gray-800 font-semibold truncate">
                          {contentName}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Status indicator */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5"
                >
                  <div className="bg-amber-100 p-2 rounded-full">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-amber-800 font-medium text-sm sm:text-base">
                      Awaiting Admin Approval
                    </p>
                    <p className="text-amber-600 text-xs sm:text-sm">
                      Usually reviewed within 24-48 hours
                    </p>
                  </div>
                </motion.div>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-gray-600 text-sm sm:text-base mb-5 leading-relaxed"
                >
                  {config.message}
                </motion.p>

                {/* Tips */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-gray-50 rounded-xl p-4 mb-6"
                >
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    What happens next?
                  </h4>
                  <ul className="space-y-2">
                    {config.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Notification reminder */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl px-4 py-3 mb-6"
                >
                  <div className="bg-indigo-100 p-2 rounded-full">
                    <Bell className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-indigo-700 text-sm flex-1">
                    You'll receive a notification once your content is reviewed
                  </p>
                </motion.div>

                {/* Action button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  onClick={onClose}
                  className={`w-full py-3.5 sm:py-4 bg-gradient-to-r ${config.color} text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 group`}
                >
                  <span>Got it, thanks!</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                {/* Security badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>All content is reviewed for quality and guidelines</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ApprovalPendingModal;
