import FeatureCourse from "../components/ForHome/FeatureCourse";
import Hero from "../components/ForHome/Hero";
import StatSection from "../components/ForHome/StatSection";
import ChooseUs from "../components/ForHome/ChooseUs";
import { useCourses } from "../context/CourseContext";

const Home = () => {
  // Get courses from CourseContext
  const { courses, loading: coursesLoading, error, refetchCourses } = useCourses();

  const getAverageStars = (reviews) => {
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return 0;
    }
    return Math.round(reviews.reduce((a, b) => a + b, 0) / reviews.length);
  };

  // Filter only active courses
  const availableCourses = (courses || []).filter(
    (c) => c.courseStatus !== false
  );

  return (
    <div className="w-full bg-gradient-to-b from-blue-200 via-blue-100 to-blue-50 px-5 sm:px-10 lg:px-20 py-10 flex flex-col">
      <Hero />

      <StatSection />

      <ChooseUs />

      <FeatureCourse
        dummyCourses={availableCourses}
        getAverageStars={getAverageStars}
        loading={coursesLoading}
        error={error}
        onRetry={refetchCourses}
      />
    </div>
  );
};

export default Home;
