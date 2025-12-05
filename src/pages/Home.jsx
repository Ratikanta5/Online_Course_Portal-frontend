import FeatureCourse from "../components/ForHome/FeatureCourse";
import Hero from "../components/ForHome/Hero";
import StatSection from "../components/ForHome/StatSection";
import ChooseUs from "../components/ForHome/ChooseUs";
import { useCourses } from "../context/CourseContext";

const Home = () => {
  // We'll get real courses from CourseContext; keep a small fallback just in case
  const { courses, loading: coursesLoading } = useCourses();

  const dummyCourses = [];

  const getAverageStars = (reviews) => {
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return 0;
    }
    return Math.round(reviews.reduce((a, b) => a + b, 0) / reviews.length);
  };

  // use courses from context; filter only active courses
  const availableCourses = (coursesLoading ? [] : courses || []).filter(
    (c) => c.courseStatus !== false
  );

  return (
    <div className="w-full bg-gradient-to-b from-blue-200 via-blue-100 to-blue-50 px-5 sm:px-10 lg:px-20 py-10 flex flex-col">
      <Hero />

      <StatSection />

      <ChooseUs />

      <FeatureCourse
        dummyCourses={availableCourses.length ? availableCourses : dummyCourses}
        getAverageStars={getAverageStars}
      />
    </div>
  );
};

export default Home;
