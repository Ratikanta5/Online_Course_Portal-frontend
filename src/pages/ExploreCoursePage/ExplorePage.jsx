import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
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

const ExplorePage = () => {
  const navigate = useNavigate();
  const { courses, loading, error } = useCourses();

  console.log("ExplorePage - courses:", courses, "loading:", loading, "error:", error);

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

  const averagereviews = (arr) => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return 0;
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
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
          (a, b) => averagereviews(b.reviews || []) - averagereviews(a.reviews || [])
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
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          {currency === "INR" ? "Show USD" : "Show INR"}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {loading
          ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
          : paginatedData.map((course, index) => (
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
                            i < averagereviews(course.reviews || [])
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-xs text-gray-600 ml-2">
                        ({course.reviews?.length || 0})
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
      <div className="flex justify-center mt-10 gap-3">
        <button
          className="px-4 py-2 border rounded-lg"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-2 rounded-lg border ${
              currentPage === i + 1 ? "bg-blue-600 text-white" : ""
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          className="px-4 py-2 border rounded-lg"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ExplorePage;
