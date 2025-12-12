// src/components/CourseReview.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, X, User, ThumbsUp, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { getToken } from "../utils/auth";

// Star Rating Input Component
const StarRating = ({ rating, setRating, disabled = false, size = "lg" }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const starSize = size === "lg" ? "w-8 h-8" : size === "md" ? "w-6 h-6" : "w-4 h-4";
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setRating(star)}
          onMouseEnter={() => !disabled && setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className={`transition-transform ${disabled ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <Star
            className={`${starSize} transition-colors ${
              star <= (hoverRating || rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

// Single Review Card
const ReviewCard = ({ review, currentUserId, onHelpful }) => {
  const [isHelpful, setIsHelpful] = useState(false);
  
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-750 rounded-lg p-4 border border-gray-600"
    >
      <div className="flex items-start gap-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          {review.user?.profileImage?.url ? (
            <img
              src={review.user.profileImage.url}
              alt={review.user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Review Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-white">
                {review.user?.name || "Anonymous"}
                {review.user?._id === currentUserId && (
                  <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                    You
                  </span>
                )}
              </h4>
              <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
            </div>
            <StarRating rating={review.rating} setRating={() => {}} disabled size="sm" />
          </div>

          {/* Review Text */}
          {review.comment && (
            <p className="mt-2 text-gray-300 text-sm leading-relaxed">
              {review.comment}
            </p>
          )}

          {/* Helpful Button */}
          <div className="mt-3 flex items-center gap-4">
            <button
              onClick={() => {
                setIsHelpful(!isHelpful);
                onHelpful && onHelpful(review._id);
              }}
              className={`flex items-center gap-1 text-xs transition ${
                isHelpful ? "text-blue-400" : "text-gray-400 hover:text-gray-300"
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              Helpful {review.helpfulCount > 0 && `(${review.helpfulCount})`}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Course Review Component
const CourseReview = ({ courseId, courseName, isEnrolled = false }) => {
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  // Fetch reviews on mount
  useEffect(() => {
    fetchReviews();
  }, [courseId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getToken();
      const apiUrl = import.meta.env.VITE_API_URL;
      
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      const response = await axios.get(
        `${apiUrl}/api/reviews/course/${courseId}`,
        config
      );

      if (response.data.success) {
        const reviewsData = response.data.reviews || [];
        setReviews(reviewsData);
        
        // Check if current user has already reviewed
        if (response.data.userReview) {
          setUserReview(response.data.userReview);
          setRating(response.data.userReview.rating);
          setComment(response.data.userReview.comment || "");
        }

        // Calculate stats
        calculateStats(reviewsData);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      // Don't show error for 404 (no reviews yet)
      if (err.response?.status !== 404) {
        setError("Unable to load reviews");
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsData) => {
    if (!reviewsData || reviewsData.length === 0) {
      setStats({
        averageRating: 0,
        totalReviews: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      });
      return;
    }

    const total = reviewsData.length;
    const sum = reviewsData.reduce((acc, r) => acc + (r.rating || 0), 0);
    const avg = sum / total;

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsData.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating]++;
      }
    });

    setStats({
      averageRating: Math.round(avg * 10) / 10,
      totalReviews: total,
      distribution,
    });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const token = getToken();
      if (!token) {
        setError("Please login to submit a review");
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL;
      const endpoint = isEditing 
        ? `${apiUrl}/api/reviews/${userReview._id}`
        : `${apiUrl}/api/reviews`;
      
      const method = isEditing ? "put" : "post";
      
      const response = await axios[method](
        endpoint,
        {
          courseId,
          rating,
          comment: comment.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSuccess(isEditing ? "Review updated successfully!" : "Review submitted successfully!");
        setUserReview(response.data.review);
        setShowReviewForm(false);
        setIsEditing(false);
        
        // Refresh reviews
        fetchReviews();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;

    try {
      setSubmitting(true);
      const token = getToken();
      const apiUrl = import.meta.env.VITE_API_URL;

      await axios.delete(
        `${apiUrl}/api/reviews/${userReview._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUserReview(null);
      setRating(0);
      setComment("");
      setSuccess("Review deleted successfully!");
      fetchReviews();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to delete review");
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = () => {
    setRating(userReview.rating);
    setComment(userReview.comment || "");
    setIsEditing(true);
    setShowReviewForm(true);
  };

  // Rating Distribution Bar
  const RatingBar = ({ stars, count, total }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="w-3 text-gray-400">{stars}</span>
        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
        <div className="flex-1 h-2 bg-gray-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="w-8 text-right text-gray-400">{count}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-400" />
        Course Reviews
      </h3>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-green-600/20 border border-green-500 rounded-lg flex items-center gap-2 text-green-400"
          >
            <CheckCircle className="w-5 h-5" />
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-red-600/20 border border-red-500 rounded-lg flex items-center gap-2 text-red-400"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Average Rating */}
        <div className="text-center p-4 bg-gray-750 rounded-lg border border-gray-600">
          <div className="text-5xl font-bold text-white mb-2">
            {stats.averageRating || "—"}
          </div>
          <StarRating rating={Math.round(stats.averageRating)} setRating={() => {}} disabled size="md" />
          <p className="text-gray-400 text-sm mt-2">
            {stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2 p-4 bg-gray-750 rounded-lg border border-gray-600">
          {[5, 4, 3, 2, 1].map((stars) => (
            <RatingBar
              key={stars}
              stars={stars}
              count={stats.distribution[stars]}
              total={stats.totalReviews}
            />
          ))}
        </div>
      </div>

      {/* Write Review Section */}
      {isEnrolled && (
        <div className="mb-6">
          {!showReviewForm && !userReview && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowReviewForm(true)}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <Star className="w-5 h-5" />
              Write a Review
            </motion.button>
          )}

          {/* User's Existing Review */}
          {userReview && !showReviewForm && (
            <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-blue-400">Your Review</h4>
                <div className="flex gap-2">
                  <button
                    onClick={startEditing}
                    className="text-sm text-blue-400 hover:text-blue-300 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteReview}
                    disabled={submitting}
                    className="text-sm text-red-400 hover:text-red-300 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <StarRating rating={userReview.rating} setRating={() => {}} disabled size="md" />
              {userReview.comment && (
                <p className="mt-2 text-gray-300 text-sm">{userReview.comment}</p>
              )}
            </div>
          )}

          {/* Review Form */}
          <AnimatePresence>
            {showReviewForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmitReview}
                className="bg-gray-750 rounded-lg p-4 border border-gray-600"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-white">
                    {isEditing ? "Edit Your Review" : "Write Your Review"}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(false);
                      setIsEditing(false);
                      if (!userReview) {
                        setRating(0);
                        setComment("");
                      }
                    }}
                    className="text-gray-400 hover:text-white transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Star Rating Input */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">
                    Your Rating <span className="text-red-400">*</span>
                  </label>
                  <StarRating rating={rating} setRating={setRating} />
                  {rating > 0 && (
                    <p className="text-sm text-gray-400 mt-1">
                      {rating === 1 && "Poor"}
                      {rating === 2 && "Fair"}
                      {rating === 3 && "Good"}
                      {rating === 4 && "Very Good"}
                      {rating === 5 && "Excellent"}
                    </p>
                  )}
                </div>

                {/* Comment Input */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">
                    Your Review (Optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this course..."
                    rows={4}
                    maxLength={1000}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {comment.length}/1000
                  </p>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={submitting || rating === 0}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isEditing ? "Updating..." : "Submitting..."}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {isEditing ? "Update Review" : "Submit Review"}
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Not Enrolled Message */}
      {!isEnrolled && (
        <div className="mb-6 p-4 bg-gray-750 rounded-lg border border-gray-600 text-center">
          <p className="text-gray-400">
            Enroll in this course to leave a review
          </p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-300">
          All Reviews ({reviews.length})
        </h4>
        
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                currentUserId={userReview?.user?._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseReview;
