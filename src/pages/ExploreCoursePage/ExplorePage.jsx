import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, RefreshCw, AlertCircle, WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCourses } from "../../context/CourseContext";

/* -----------------------------------------------------
   SKELETON LOADING COMPONENT
------------------------------------------------------ */
const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden animate-pulse">
      <div className="w-full h-40 bg-gray-300"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-300 rounded"></div>
        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
        <div className="flex gap-2 mt-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-300 rounded"></div>
          ))}
        </div>
        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
      </div>
    </div>
  );
};

/* -----------------------------------------------------
   ERROR STATE COMPONENT
------------------------------------------------------ */
const ErrorState = ({ error, onRetry, isRetrying }) => {
  const isOffline = !navigator.onLine;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="bg-red-50 rounded-full p-4 mb-4">
        {isOffline ? (
          <WifiOff className="w-12 h-12 text-red-500" />
        ) : (
          <AlertCircle className="w-12 h-12 text-red-500" />
        )}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        {isOffline ? "You're Offline" : "Unable to Load Courses"}
      </h3>
      <p className="text-gray-600 text-center max-w-md mb-6">
        {error || "Something went wrong while fetching courses. Please try again."}
      </p>
      <motion.button
        onClick={onRetry}
        disabled={isRetrying}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold
          ${isRetrying 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
          } text-white transition-colors
        `}
      >
        <RefreshCw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
        {isRetrying ? 'Retrying...' : 'Try Again'}
      </motion.button>
    </motion.div>
  );
};

/* -----------------------------------------------------
   EMPTY STATE COMPONENT
------------------------------------------------------ */
const EmptyState = ({ hasFilters, onClearFilters }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-4"
  >
    <div className="bg-blue-50 rounded-full p-4 mb-4">
      <Search className="w-12 h-12 text-blue-500" />
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">
      {hasFilters ? "No Matching Courses" : "No Courses Available"}
    </h3>
    <p className="text-gray-600 text-center max-w-md mb-6">
      {hasFilters 
        ? "Try adjusting your filters or search terms to find what you're looking for."
        : "Check back soon! New courses are being added regularly."
      }
    </p>
    {hasFilters && (
      <motion.button
        onClick={onClearFilters}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Clear All Filters
      </motion.button>
    )}
  </motion.div>
);

const ExplorePage = () => {
  const navigate = useNavigate();
  const { courses, loading, error, isRetrying, refetchCourses } = useCourses();

  const description = async (course) => {
    navigate("/course-about", { state: course });
  };

  /* -----------------------------------------------------
     STATE MANAGEMENT
  ------------------------------------------------------ */
  const [searchQuery, setSearchQuery] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLecturer, setSelectedLecturer] = useState("All");
  const [sortType, setSortType] = useState("latest");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() !== "" || 
    selectedCategory !== "All" || 
    selectedLecturer !== "All";

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedLecturer("All");
    setSortType("latest");
    setCurrentPage(1);
  };

  // Filter only active courses
  const activeCourses = (courses || []).filter((c) => c.courseStatus !== false);

  // Helper to get lecturer name
  const getLecturerName = (course) =>
    course?.creator?.name || course?.lecturer?.name || course?.lecturer || "Unknown";

  // Helper to get image URL
  const getImageUrl = (course) =>
    course?.courseImage?.url ||
    course?.courseImage?.secure_url ||
    (Array.isArray(course?.courseImage) && course.courseImage[0]?.url) ||
    course?.thumbnail ||
    "/placeholder-course.png";

  // Helper to get created date
  const getCreatedDate = (course) => {
    const date = course?.createdAt || course?.created_at;
    return date ? new Date(date).toLocaleDateString() : "";
  };

  // unique dropdown lists
  const categories = ["All", ...new Set(activeCourses.map((c) => c.category).filter(Boolean))];
  const lecturers = ["All", ...new Set(activeCourses.map((c) => getLecturerName(c)))];

  // Get average rating - use API value or fallback
  const getAverageRating = (course) => {
    return course?.averageRating || 0;
  };

  // Get total reviews count
  const getTotalReviews = (course) => {
    return course?.totalReviews || 0;
  };

  /* -----------------------------------------------------
     FILTER + SORT LOGIC
  ------------------------------------------------------ */
  const filteredCourses = useMemo(() => {
    let list = [...activeCourses];

    if (selectedCategory !== "All")
      list = list.filter((c) => c.category === selectedCategory);

    if (selectedLecturer !== "All")
      list = list.filter((c) => getLecturerName(c) === selectedLecturer);

    if (searchQuery.trim())
      list = list.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

    switch (sortType) {
      case "price-low":
        list.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;

      case "price-high":
        list.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;

      case "reviews":
        list.sort(
          (a, b) => getAverageRating(b) - getAverageRating(a)
        );
        break;

      case "latest":
      default:
        list.sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0));
        break;
    }

    return list;
  }, [activeCourses, searchQuery, selectedCategory, selectedLecturer, sortType]);

  /* Pagination Slice */
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedData = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* -----------------------------------------------------
     UI
  ------------------------------------------------------ */
  return (
    <div className="w-full pt-[90px] px-6 lg:px-20 pb-20">
      {/* Title */}
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Explore Courses
      </h1>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-10">
        {/* Search */}
        <div className="w-full lg:w-1/3 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full pl-12 pr-4 py-2 border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category */}
        <select
          className="px-4 py-2 border rounded-lg"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
        >
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        {/* Lecturer Filter */}
        <select
          className="px-4 py-2 border rounded-lg"
          value={selectedLecturer}
          onChange={(e) => {
            setSelectedLecturer(e.target.value);
            setCurrentPage(1);
          }}
        >
          {lecturers.map((lec) => (
            <option key={lec}>{lec}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          className="px-4 py-2 border rounded-lg"
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
        >
          <option value="latest">Latest</option>
          <option value="price-low">Price: Low → High</option>
          <option value="price-high">Price: High → Low</option>
          <option value="reviews">Top Rated</option>
        </select>

        {/* Currency */}
        <button
          onClick={() => setCurrency(currency === "INR" ? "USD" : "INR")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {currency === "INR" ? "Show USD" : "Show INR"}
        </button>

        {/* Clear Filters Button - only show when filters are active */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Error State */}
      {error && !loading && (
        <ErrorState 
          error={error} 
          onRetry={refetchCourses} 
          isRetrying={isRetrying} 
        />
      )}

      {/* Empty State - when no courses and no error */}
      {!loading && !error && filteredCourses.length === 0 && (
        <EmptyState 
          hasFilters={hasActiveFilters} 
          onClearFilters={clearFilters} 
        />
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Course Grid - only show when we have courses */}
      {!loading && !error && filteredCourses.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {paginatedData.map((course, index) => (
              <motion.div
                key={course._id || course.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-md border overflow-hidden"
              >
                <img
                  src={getImageUrl(course)}
                  className="w-full h-40 object-cover"
                  alt={course.title}
                />

                <div className="p-4 flex flex-col justify-between h-[210px]">
                  <div>
                    <h3 className="font-bold text-sm line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {course.description}
                    </p>

                    {/* reviews */}
                    <div className="flex items-center mt-2">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${
                            i < Math.round(getAverageRating(course))
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-xs text-gray-600 ml-2">
                        ({getTotalReviews(course)})
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex justify-between mt-2 text-sm">
                    <p className="font-semibold">
                      {currency === "INR"
                        ? `₹${course.price || 0}`
                        : `$${Math.round((course.price || 0) / 83)}`}
                    </p>
                    <p className="text-xs text-gray-500">{getCreatedDate(course)}</p>
                  </div>

                  <p className="text-xs text-gray-500 mt-1 truncate">
                    By {getLecturerName(course)}
                  </p>

                  <motion.button
                    onClick={() => description(course)}
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    className="
        inline-flex items-center justify-center
        px-3 py-1.5
        rounded-lg
        text-xs sm:text-sm
        font-semibold
        bg-blue-600 text-white
        shadow-sm
        hover:bg-blue-700
        hover:shadow-md
        transition-colors
      "
                  >
                    Details
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-10 gap-3 flex-wrap">
            <button
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>

            {[...Array(totalPages || 1)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-2 rounded-lg border transition-colors ${
                  currentPage === i + 1 
                    ? "bg-blue-600 text-white" 
                    : "hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              disabled={currentPage === totalPages || totalPages <= 1}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>

          {/* Results count */}
          <p className="text-center text-gray-500 text-sm mt-4">
            Showing {paginatedData.length} of {filteredCourses.length} courses
          </p>
        </>
      )}
    </div>
  );
};

export default ExplorePage;