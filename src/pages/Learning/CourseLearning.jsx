// src/pages/Learning/CourseLearning.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Play,
  Clock,
  CheckCircle2,
  Menu,
  X,
  Settings,
  BookOpen,
  FileText,
  Award,
  Volume2,
  Pause,
  SkipBack,
  SkipForward,
  Maximize,
  Minimize,
  AlertCircle,
  Star,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import { useCourses } from "../../context/CourseContext";
import axios from "axios";
import { getToken } from "../../utils/auth";
import CourseReview from "../../components/CourseReview";

// Helper function to normalize course data - handle both Topics and topics field names
const normalizeCourseData = (course) => {
  if (!course) return null;
  
  // Backend returns 'topics' (lowercase) but schema defines 'Topics' (uppercase)
  // Ensure we have the 'Topics' field populated
  if (!course.Topics && course.topics) {
    return { ...course, Topics: course.topics };
  }
  return course;
};

const CourseLearning = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useUser();
  const { courses } = useCourses();

  // Get course from location state first, then from context
  const courseFromState = location.state?.course;
  const courseFromContext = courses?.find((c) => c._id === params.courseId);
  
  // ==================== ALL STATE DECLARATIONS FIRST ====================
  const [fullCourse, setFullCourse] = useState(courseFromState || courseFromContext);
  const [courseLoading, setCourseLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState(new Set([0]));
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showRateMenu, setShowRateMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedLectures, setCompletedLectures] = useState(new Set());
  const [videoProgress, setVideoProgress] = useState({});
  const [showDescription, setShowDescription] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "description" | "reviews"
  const [showControls, setShowControls] = useState(true);
  const [savedProgress, setSavedProgress] = useState(null);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  
  // ==================== ALL REF DECLARATIONS ====================
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const saveProgressTimeoutRef = useRef(null);
  
  // Refs to always have current values for the save interval
  const completedLecturesRef = useRef(completedLectures);
  const videoProgressRef = useRef(videoProgress);
  const currentTopicIndexRef = useRef(currentTopicIndex);
  const currentVideoIndexRef = useRef(currentVideoIndex);
  
  // Keep refs in sync with state
  useEffect(() => {
    completedLecturesRef.current = completedLectures;
  }, [completedLectures]);
  
  useEffect(() => {
    videoProgressRef.current = videoProgress;
  }, [videoProgress]);
  
  useEffect(() => {
    currentTopicIndexRef.current = currentTopicIndex;
  }, [currentTopicIndex]);
  
  useEffect(() => {
    currentVideoIndexRef.current = currentVideoIndex;
  }, [currentVideoIndex]);

  // ==================== ALL EFFECTS ====================
  
  // Fetch full course data if needed
  useEffect(() => {
    const fetchFullCourse = async () => {
      const initialCourse = courseFromState || courseFromContext;
      
      // Check if Topics are populated (should be objects with lectures, not just IDs)
      const hasPopulatedTopics = initialCourse?.Topics && 
        initialCourse.Topics.length > 0 && 
        typeof initialCourse.Topics[0] === 'object' &&
        initialCourse.Topics[0]?.lectures;
      
      if (hasPopulatedTopics) {
        setFullCourse(normalizeCourseData(initialCourse));
        console.log("Using course with populated Topics");
        return;
      }

      // If no courseId, can't fetch
      if (!params.courseId) {
        setFullCourse(normalizeCourseData(initialCourse));
        console.log("No courseId to fetch full course");
        return;
      }

      try {
        setCourseLoading(true);
        const token = getToken();
        const apiUrl = import.meta.env.VITE_API_URL;
        
        console.log("Fetching full course from API for ID:", params.courseId);
        
        // Try direct course endpoint with populate parameter
        try {
          const directResponse = await axios.get(
            `${apiUrl}/api/courses/${params.courseId}?populate=Topics`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          
          if (directResponse.data?.course || directResponse.data?._id) {
            const course = directResponse.data.course || directResponse.data;
            const normalizedCourse = normalizeCourseData(course);
            console.log("Fetched course from direct endpoint:", normalizedCourse);
            
            // Check if Topics are now populated
            if (normalizedCourse.Topics && typeof normalizedCourse.Topics[0] === 'object' && normalizedCourse.Topics[0]?.lectures) {
              setFullCourse(normalizedCourse);
              console.log("Topics successfully populated with lectures");
              return;
            }
          }
        } catch (err) {
          console.log("Direct endpoint not available, trying courses list...", err.message);
        }

        // Fallback: fetch all courses and find the matching one
        const response = await axios.get(
          `${apiUrl}/api/courses`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data?.courses || response.data?.data) {
          const allCourses = response.data.courses || response.data.data;
          const foundCourse = allCourses.find(c => c._id === params.courseId);
          
          if (foundCourse) {
            const normalizedCourse = normalizeCourseData(foundCourse);
            setFullCourse(normalizedCourse);
            console.log("Found course from courses list:", normalizedCourse);
          } else {
            setFullCourse(normalizeCourseData(initialCourse));
            console.log("Course not found in list, using initial course");
          }
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        // Fall back to initial course if API fails
        setFullCourse(normalizeCourseData(initialCourse));
      } finally {
        setCourseLoading(false);
      }
    };

    fetchFullCourse();
  }, [params.courseId, courseFromState, courseFromContext]);

  // Load progress from backend on mount
  useEffect(() => {
    const loadProgressFromBackend = async () => {
      try {
        const token = getToken();
        if (!token || !params.courseId) {
          console.log("Cannot load progress: token or courseId missing");
          return;
        }

        const apiUrl = import.meta.env.VITE_API_URL;
        console.log("Loading progress from:", `${apiUrl}/api/progress/${params.courseId}`);
        
        const response = await axios.get(
          `${apiUrl}/api/progress/${params.courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Full API response:", response.data);

        // Backend returns data wrapped in 'progress' object
        const progress = response.data?.progress;
        if (!progress) {
          console.log("No progress data in response. Response structure:", response.data);
          return;
        }

        console.log("Loaded progress from backend:", progress);

        if (progress?.completedLectures && Array.isArray(progress.completedLectures)) {
          // Convert completed lectures array to Set
          const completedSet = new Set(progress.completedLectures);
          console.log("Setting completed lectures from backend:", Array.from(completedSet));
          setCompletedLectures(completedSet);
        } else {
          console.log("No completedLectures found or not an array:", progress?.completedLectures);
        }

        if (progress?.videoProgress && typeof progress.videoProgress === 'object') {
          console.log("Setting video progress:", Object.keys(progress.videoProgress));
          setVideoProgress(progress.videoProgress);
        } else {
          console.log("No videoProgress found:", progress?.videoProgress);
        }

        if (progress?.currentTopic !== undefined) {
          console.log("Setting current topic to:", progress.currentTopic);
          setCurrentTopicIndex(progress.currentTopic);
        }

        if (progress?.currentLecture !== undefined) {
          console.log("Setting current lecture to:", progress.currentLecture);
          setCurrentVideoIndex(progress.currentLecture);
        }

        console.log("Progress restoration complete. Progress %:", progress?.progressPercentage);
      } catch (err) {
        console.log("Error loading progress:", err.response?.status, err.response?.data || err.message);
        if (err.response?.status === 404) {
          console.log("No progress found for this course (first time visiting)");
        }
      }
    };

    if (fullCourse && params.courseId) {
      console.log("Progress load effect triggered for course:", params.courseId);
      loadProgressFromBackend();
    }
  }, [params.courseId, fullCourse]);

  // ==================== FUNCTION DEFINITIONS (BEFORE EFFECTS THAT USE THEM) ====================

  // Save progress to backend - uses refs to always get latest values
  const saveProgressToBackend = useCallback(async () => {
    // Make sure we have a course with an ID
    if (!fullCourse?._id) {
      console.log("Cannot save progress: course not loaded yet");
      return;
    }

    // Get current values from refs
    const currentCompletedLectures = completedLecturesRef.current;
    const currentVideoProgress = videoProgressRef.current;
    const currentTopic = currentTopicIndexRef.current;
    const currentLecture = currentVideoIndexRef.current;

    try {
      setIsSavingProgress(true);
      const token = getToken();
      const apiUrl = import.meta.env.VITE_API_URL;
      
      const progressData = {
        courseId: fullCourse._id,
        completedLectures: Array.from(currentCompletedLectures),
        videoProgress: currentVideoProgress,
        currentTopic: currentTopic,
        currentLecture: currentLecture,
        lastAccessedAt: new Date().toISOString(),
      };
      
      console.log("Saving progress to backend:", progressData);
      
      const response = await axios.post(
        `${apiUrl}/api/progress/save`,
        progressData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Progress save response:", response.data);
    } catch (error) {
      console.error("Error saving progress:", error.response?.data || error.message);
    } finally {
      setIsSavingProgress(false);
    }
  }, [fullCourse?._id]);

  // Debug: Log course data structure
  useEffect(() => {
    console.log("Course data:", fullCourse);
    console.log("Topics (capital):", fullCourse?.Topics);
    console.log("topics (lowercase):", fullCourse?.topics);
  }, [fullCourse, currentTopicIndex, currentVideoIndex]);

  // Redirect if no course data
  useEffect(() => {
    if (!fullCourse) {
      navigate("/explore-courses");
    }
  }, [fullCourse, navigate]);

  // Auto-hide controls in fullscreen
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isFullscreen && !videoRef.current?.paused) {
          setShowControls(false);
        }
      }, 3000);
    };

    if (isFullscreen) {
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [isFullscreen]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (!fullCourse?._id) return;
    
    const saveInterval = setInterval(() => {
      saveProgressToBackend();
    }, 30000); // 30 seconds

    // Also save when component unmounts
    return () => {
      clearInterval(saveInterval);
      saveProgressToBackend(); // Final save on unmount
    };
  }, [fullCourse?._id, saveProgressToBackend]);

  // Restore video playback position when lecture changes (only once per lecture)
  useEffect(() => {
    if (videoRef.current) {
      const lectureId = `${currentTopicIndex}-${currentVideoIndex}`;
      const savedProgress = videoProgress[lectureId];

      // Only restore if we have saved progress and it's meaningful
      if (savedProgress && savedProgress.current > 0) {
        // Use a setTimeout to ensure video is loaded first
        const timeoutId = setTimeout(() => {
          if (videoRef.current && videoRef.current.duration > 0) {
            videoRef.current.currentTime = Math.min(savedProgress.current, videoRef.current.duration);
            console.log(`Restored video position to ${savedProgress.current}s for lecture ${lectureId}`);
          }
        }, 500);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [currentVideoIndex, currentTopicIndex]); // Only depend on lecture indices, NOT videoProgress

  // ==================== EARLY RETURNS (AFTER ALL HOOKS) ====================
  
  const course = fullCourse;
  
  if (!course || courseLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Loading course...</p>
          <p className="text-gray-400 text-sm">Course ID: {params.courseId}</p>
        </div>
      </div>
    );
  }

  // Check if Topics exist (handle both Topics and topics field names)
  const topics = course?.Topics || course?.topics;
  if (!topics || topics.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-white text-lg mb-2">No Content Available</p>
          <p className="text-gray-400 text-sm mb-6">This course has no topics or lectures yet.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check if Topics are populated with lectures (not just IDs)
  const firstTopic = topics[0];
  const isTopicPopulated = typeof firstTopic === 'object' && firstTopic?.lectures;
  
  if (!isTopicPopulated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <p className="text-white text-lg mb-2">Course Data Loading</p>
          <p className="text-gray-400 text-sm mb-4">Topics and lectures data is being loaded...</p>
          <p className="text-gray-500 text-xs">This may take a moment if it's the first time accessing this course.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Get current lecture
  const currentTopic = topics?.[currentTopicIndex];
  const currentLecture = currentTopic?.lectures?.[currentVideoIndex];

  // Get video URL - videoUrl is always an object {url, filename} from backend
  const getVideoUrl = () => {
    const url = currentLecture?.videoUrl?.url;
    if (url && typeof url === "string" && url.trim()) {
      return url;
    }
    return "/placeholder-video.mp4"; // Fallback if no valid URL
  };

  // Toggle topic expansion
  const toggleTopic = (index) => {
    const newSet = new Set(expandedTopics);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setExpandedTopics(newSet);
  };

  // Navigate to lecture
  const goToLecture = (topicIdx, lectureIdx) => {
    setCurrentTopicIndex(topicIdx);
    setCurrentVideoIndex(lectureIdx);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Go to next lecture
  const goToNextLecture = () => {
    const currentTopic = topics[currentTopicIndex];
    if (currentVideoIndex < (currentTopic?.lectures?.length || 0) - 1) {
      goToLecture(currentTopicIndex, currentVideoIndex + 1);
    } else if (currentTopicIndex < (topics?.length || 0) - 1) {
      goToLecture(currentTopicIndex + 1, 0);
    }
  };

  // Go to previous lecture
  const goToPreviousLecture = () => {
    if (currentVideoIndex > 0) {
      goToLecture(currentTopicIndex, currentVideoIndex - 1);
    } else if (currentTopicIndex > 0) {
      const prevTopic = topics[currentTopicIndex - 1];
      goToLecture(
        currentTopicIndex - 1,
        (prevTopic?.lectures?.length || 1) - 1
      );
    }
  };

  // Mark lecture as completed
  const markAsComplete = () => {
    const lectureId = `${currentTopicIndex}-${currentVideoIndex}`;
    const newCompleted = new Set(completedLectures);
    newCompleted.add(lectureId);
    setCompletedLectures(newCompleted);
    
    // Update ref immediately so save gets latest value
    completedLecturesRef.current = newCompleted;
    
    // Save immediately when marking as complete
    saveProgressToBackend();
  };
  
  // Calculate progress
  const totalLectures = topics?.reduce(
    (sum, topic) => sum + (topic.lectures?.length || 0),
    0
  ) || 0;
  const progressPercentage =
    totalLectures > 0 ? Math.round((completedLectures.size / totalLectures) * 100) : 0;

  // Handle video time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration || (currentLecture?.lectureDuration || 0);
      const lectureId = `${currentTopicIndex}-${currentVideoIndex}`;
      setVideoProgress((prev) => ({
        ...prev,
        [lectureId]: { current, duration },
      }));

      // Auto-mark as complete when 90% watched
      if (
        duration > 0 &&
        current / duration > 0.9 &&
        !completedLectures.has(lectureId)
      ) {
        markAsComplete();
      }
    }
  };

  // Handle play/pause
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Handle speed change
  const handleSpeedChange = (newRate) => {
    setPlaybackRate(newRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = newRate;
    }
    setShowRateMenu(false);
  };

  // Toggle fullscreen
  const handleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        if (videoContainerRef.current?.requestFullscreen) {
          await videoContainerRef.current.requestFullscreen();
        } else if (videoContainerRef.current?.webkitRequestFullscreen) {
          await videoContainerRef.current.webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white pt-[70px]">
      {/* ======================= SIDEBAR ======================= */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            transition={{ duration: 0.3 }}
            className="fixed lg:relative w-full lg:w-96 h-[calc(100vh-70px)] bg-gray-800 border-r border-gray-700 overflow-y-auto z-40 lg:z-0"
          >
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute top-4 right-4 p-2 hover:bg-gray-700 rounded-lg z-50"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-700 mt-8 lg:mt-0">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                Course Content
              </h2>
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Progress</span>
                  <span className="text-sm font-semibold text-blue-400">
                    {progressPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Topics List */}
            <div className="divide-y divide-gray-700">
              {topics?.map((topic, topicIdx) => {
                const isExpanded = expandedTopics.has(topicIdx);
                const topicLectures = topic.lectures || [];

                return (
                  <div key={topicIdx} className="border-b border-gray-700">
                    {/* Topic Header */}
                    <button
                      onClick={() => toggleTopic(topicIdx)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700 transition"
                    >
                      <div className="flex items-center gap-3 flex-1 text-left">
                        <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-white">{topic.title}</p>
                          <p className="text-xs text-gray-400">
                            {topicLectures.length} lecture{topicLectures.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {/* Lectures */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-gray-750"
                        >
                          {topicLectures.map((lecture, lectureIdx) => {
                            const lectureId = `${topicIdx}-${lectureIdx}`;
                            const isActive =
                              currentTopicIndex === topicIdx &&
                              currentVideoIndex === lectureIdx;
                            const isCompleted = completedLectures.has(lectureId);
                            const progress = videoProgress[lectureId];

                            return (
                              <button
                                key={lectureIdx}
                                onClick={() => goToLecture(topicIdx, lectureIdx)}
                                className={`w-full px-6 py-3 flex items-start gap-3 hover:bg-gray-700 transition ${
                                  isActive ? "bg-blue-600 hover:bg-blue-700" : ""
                                }`}
                              >
                                {/* Thumbnail or Icon */}
                                <div className="flex-shrink-0 mt-1">
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <Play className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>

                                {/* Lecture Info */}
                                <div className="flex-1 text-left">
                                  <p
                                    className={`text-sm font-medium ${
                                      isActive ? "text-white" : "text-gray-300"
                                    }`}
                                  >
                                    {lecture.title}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {lecture.lectureDuration || "N/A"} mins
                                  </p>
                                  {progress && progress.duration > 0 && (
                                    <div className="mt-2 bg-gray-600 h-1 rounded-full overflow-hidden">
                                      <div
                                        className="bg-blue-500 h-full"
                                        style={{
                                          width: `${(progress.current / progress.duration) * 100}%`,
                                        }}
                                      ></div>
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ======================= MAIN CONTENT ======================= */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-gray-700 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 ml-4 lg:ml-0">
            <h1 className="text-lg font-bold text-white line-clamp-1">
              {currentLecture?.title || "Loading..."}
            </h1>
            <p className="text-sm text-gray-400">
              {currentTopic?.title || "Course"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Playback Speed Menu */}
            <div className="relative">
              <button
                onClick={() => setShowRateMenu(!showRateMenu)}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition flex items-center gap-1"
              >
                {playbackRate.toFixed(2)}x
                <ChevronDown className="w-4 h-4" />
              </button>
              {showRateMenu && (
                <div className="absolute right-0 mt-2 bg-gray-700 rounded-lg shadow-lg overflow-hidden z-50 min-w-max">
                  {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleSpeedChange(rate)}
                      className={`block w-full px-4 py-2 text-left hover:bg-gray-600 transition ${
                        playbackRate === rate
                          ? "bg-blue-600 text-white"
                          : "text-gray-300"
                      }`}
                    >
                      {rate === 1 ? "Normal" : `${rate.toFixed(2)}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="p-2 hover:bg-gray-700 rounded-lg transition">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Container */}
        <div
          ref={videoContainerRef}
          className={`flex-1 bg-black flex items-center justify-center overflow-hidden relative group ${
            isFullscreen ? "fixed inset-0 z-50" : ""
          }`}
          onMouseMove={() => setShowControls(true)}
        >
          {currentLecture ? (
            <div className="w-full h-full relative flex items-center justify-center">
              {/* Video Element */}
              <video
                ref={videoRef}
                src={getVideoUrl()}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full h-full max-h-full"
                style={{ backgroundColor: "#000" }}
              >
                Your browser does not support the video tag.
              </video>

              {/* YouTube-style Custom Controls Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent transition-opacity duration-300 ${
                  showControls || !isPlaying ? "opacity-100" : "opacity-0"
                }`}
                style={{ pointerEvents: showControls ? "auto" : "none" }}
              >
                {/* Progress Bar */}
                <div className="absolute bottom-16 left-0 right-0 px-4 group/progress">
                  <div
                    className="bg-gray-600 h-1 rounded-full cursor-pointer hover:h-2 transition-all group-hover/progress:bg-red-500"
                    onClick={(e) => {
                      if (videoRef.current) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percent =
                          (e.clientX - rect.left) / rect.width;
                        videoRef.current.currentTime =
                          percent * videoRef.current.duration;
                      }
                    }}
                  >
                    <div
                      className="bg-red-500 h-full rounded-full transition-all"
                      style={{
                        width: videoRef.current
                          ? `${
                              (videoRef.current.currentTime /
                                videoRef.current.duration) *
                              100
                            }%`
                          : "0%",
                      }}
                    ></div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                  {/* Left Controls */}
                  <div className="flex items-center gap-3">
                    {/* Play/Pause */}
                    <button
                      onClick={handlePlayPause}
                      className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition flex items-center justify-center"
                      title="Play/Pause"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                      )}
                    </button>

                    {/* Skip Previous */}
                    <button
                      onClick={goToPreviousLecture}
                      className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition"
                      title="Previous lecture"
                    >
                      <SkipBack className="w-5 h-5" />
                    </button>

                    {/* Skip Next */}
                    <button
                      onClick={goToNextLecture}
                      className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition"
                      title="Next lecture"
                    >
                      <SkipForward className="w-5 h-5" />
                    </button>

                    {/* Volume */}
                    <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition">
                      <Volume2 className="w-5 h-5" />
                    </button>

                    {/* Time Display */}
                    <div className="text-sm text-white ml-2 min-w-fit">
                      {formatTime(videoRef.current?.currentTime)} /{" "}
                      {formatTime(videoRef.current?.duration)}
                    </div>
                  </div>

                  {/* Right Controls */}
                  <div className="flex items-center gap-2">
                    {/* Playback Speed Mini */}
                    <div className="relative">
                      <button className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition">
                        {playbackRate.toFixed(2)}x
                      </button>
                    </div>

                    {/* Fullscreen */}
                    <button
                      onClick={handleFullscreen}
                      className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition"
                      title="Fullscreen"
                    >
                      {isFullscreen ? (
                        <Minimize className="w-5 h-5" />
                      ) : (
                        <Maximize className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-gray-400">Loading video...</p>
            </div>
          )}
        </div>

        {/* Lecture Info & Description */}
        <div className="bg-gray-800 border-t border-gray-700 max-h-[400px] overflow-y-auto">
          {/* Tabs */}
          <div className="flex border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === "overview"
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("description")}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === "description"
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex-1 px-6 py-4 font-semibold transition flex items-center justify-center gap-2 ${
                activeTab === "reviews"
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Star className="w-4 h-4" />
              Reviews
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === "overview" && (
              // Overview Tab
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {currentLecture?.title}
                  </h3>
                  <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {currentLecture?.lectureDuration || "N/A"} minutes
                    </span>
                    {completedLectures.has(
                      `${currentTopicIndex}-${currentVideoIndex}`
                    ) && (
                      <span className="flex items-center gap-2 text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        Completed
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={markAsComplete}
                    disabled={completedLectures.has(
                      `${currentTopicIndex}-${currentVideoIndex}`
                    )}
                    className={`px-6 py-2 rounded-lg font-semibold transition ${
                      completedLectures.has(
                        `${currentTopicIndex}-${currentVideoIndex}`
                      )
                        ? "bg-green-600 text-white cursor-default"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {completedLectures.has(
                      `${currentTopicIndex}-${currentVideoIndex}`
                    )
                      ? "✓ Completed"
                      : "Mark as Complete"}
                  </button>
                  <button className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Certificate
                  </button>
                </div>
              </div>
            )}

            {activeTab === "description" && (
              // Description Tab
              <div>
                <h3 className="text-lg font-bold text-white mb-4">
                  Course Description
                </h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {course?.description ||
                    "No description available for this course."}
                </p>
                {course?.creator?.bio && (
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <h4 className="text-base font-semibold text-white mb-3">
                      About Instructor
                    </h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {course.creator.bio}
                    </p>
                  </div>
                )}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h4 className="text-base font-semibold text-white mb-3">
                    Course Details
                  </h4>
                  <div className="space-y-3 text-sm text-gray-400">
                    <div className="flex justify-between">
                      <span className="text-gray-300 font-semibold">Instructor:</span>
                      <span>{course?.creator?.name || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 font-semibold">Category:</span>
                      <span>{course?.category || "General"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 font-semibold">Price:</span>
                      <span>₹{course?.price ? (course.price / 100).toFixed(2) : "0.00"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 font-semibold">Total Lectures:</span>
                      <span>{totalLectures}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 font-semibold">Progress:</span>
                      <span>{progressPercentage}% Complete</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              // Reviews Tab
              <CourseReview
                courseId={course?._id}
                courseName={course?.title}
                isEnrolled={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearning;