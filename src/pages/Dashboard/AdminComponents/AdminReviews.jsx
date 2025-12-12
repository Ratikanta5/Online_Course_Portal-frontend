// src/pages/Dashboard/AdminComponents/AdminReviews.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Trash2,
  AlertCircle,
  Loader,
  Filter,
  Star,
  Flag,
} from 'lucide-react';
import { getAllReviewsAdmin, deleteReviewAdmin } from '../../../utils/adminApi';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [minRatingFilter, setMinRatingFilter] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await getAllReviewsAdmin({
          page,
          limit: 10,
          minRating: minRatingFilter,
        });
        setReviews(response.data || response.reviews || []);
        setTotalPages(response.totalPages || 1);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchReviews();
    }, 500);

    return () => clearTimeout(timer);
  }, [minRatingFilter, page]);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Permanently delete this review?')) return;
    try {
      await deleteReviewAdmin(reviewId);
      setReviews(reviews.filter((r) => r._id !== reviewId));
    } catch (err) {
      alert('Error deleting review');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Filter size={20} /> Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
            <select
              value={minRatingFilter}
              onChange={(e) => {
                setMinRatingFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Ratings</option>
              <option value="1">1 Star and above</option>
              <option value="2">2 Stars and above</option>
              <option value="3">3 Stars and above</option>
              <option value="4">4 Stars and above</option>
              <option value="5">5 Stars only</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setMinRatingFilter('');
                setPage(1);
              }}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin text-blue-600" />
            <p className="ml-2 text-gray-600">Loading reviews...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">{error}</div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No reviews found</p>
          </div>
        ) : (
          reviews.map((review, index) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* User and Rating */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{review.user?.name}</p>
                        <p className="text-xs text-gray-600">{review.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="font-bold text-gray-900 ml-2">{review.rating}.0</span>
                    </div>
                  </div>

                  {/* Course */}
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Course:</span> {review.course?.title}
                  </p>

                  {/* Review Comment */}
                  {review.comment && (
                    <p className="text-gray-700 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">{review.comment}</p>
                  )}

                  {/* Review Date */}
                  <p className="text-xs text-gray-500">
                    Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-amber-50 rounded-lg text-amber-600 transition-colors" title="Report">
                    <Flag size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default AdminReviews;
