import FeatureCourse from "../components/ForHome/FeatureCourse";
import Hero from "../components/ForHome/Hero";
import StatSection from "../components/ForHome/StatSection";
import ChooseUs from "../components/ForHome/ChooseUs";

const Home = () => {
  const dummyCourses = [
    {
      id: 1,
      title: "React Mastery Bootcamp",
      category: "React",
      description: "Master advanced React, hooks, patterns, and scalability.",
      thumbnail: "https://i.ytimg.com/vi/MHn66JJH5zs/maxresdefault.jpg",
      reviews: [5, 4, 5, 4, 5],
      priceINR: 2999,
      priceUSD: 39.99,
      lecturer: "Arjun Rao",
      created_at: "2025-02-10",
      courseStatus: true,
      topics: [
        {
          title: "Introduction",
          topicStatus: "approved",
          lectures: [
            {
              title: "What is Web Development?",
              videoUrl: { url: "...", filename: "..." },
              status: "approved",
              coveredDuration: 3,
              lectureDuration: 10,
            },
          ],
        },
        {
          title: "JavaScript Basics",
          lectures: [
            {
              title: "Variables",
              coveredDuration: 0,
              lectureDuration: 12,
            },
          ],
        },
      ],
    },
    {
      id: 2,
      title: "Python for Data Science",
      category: "Python",
      description: "Data analysis, ML, and automation with Python.",
      thumbnail: "https://i.ytimg.com/vi/MHn66JJH5zs/maxresdefault.jpg",
      reviews: [5, 5, 4],
      priceINR: 2499,
      priceUSD: 34.99,
      lecturer: "Meera Sharma",
      created_at: "2025-01-15",
      courseStatus: true,
      topics: [
        {
          title: "Introduction",
          topicStatus: "approved",
          lectures: [
            {
              title: "What is Web Development?",
              videoUrl: { url: "...", filename: "..." },
              status: "approved",
              coveredDuration: 3,
              lectureDuration: 10,
            },
          ],
        },
        {
          title: "JavaScript Basics",
          lectures: [
            {
              title: "Variables",
              coveredDuration: 0,
              lectureDuration: 12,
            },
          ],
        },
      ],
    },
    {
      id: 3,
      title: "Java Full Stack Roadmap",
      category: "Java",
      description: "Master Java + Spring Boot + Microservices.",
      thumbnail: "https://i.ytimg.com/vi/MHn66JJH5zs/maxresdefault.jpg",
      reviews: [4, 4, 5],
      priceINR: 3599,
      priceUSD: 44.99,
      lecturer: "Rahul Verma",
      created_at: "2025-01-20",
      courseStatus: true,
      topics: [
        {
          title: "Introduction",
          topicStatus: "approved",
          lectures: [
            {
              title: "What is Web Development?",
              videoUrl: { url: "...", filename: "..." },
              status: "approved",
              coveredDuration: 3,
              lectureDuration: 10,
            },
          ],
        },
        {
          title: "JavaScript Basics",
          lectures: [
            {
              title: "Variables",
              coveredDuration: 0,
              lectureDuration: 12,
            },
          ],
        },
      ],
    },
    {
      id: 3,
      title: "Java Full Stack Roadmap",
      category: "Java",
      description: "Master Java + Spring Boot + Microservices.",
      thumbnail: "https://i.ytimg.com/vi/MHn66JJH5zs/maxresdefault.jpg",
      reviews: [4, 4, 5],
      priceINR: 3599,
      priceUSD: 44.99,
      lecturer: "Rahul Verma",
      created_at: "2025-01-20",
      courseStatus: true,
      topics: [
        {
          title: "Introduction",
          topicStatus: "approved",
          lectures: [
            {
              title: "What is Web Development?",
              videoUrl: { url: "...", filename: "..." },
              status: "approved",
              coveredDuration: 3,
              lectureDuration: 10,
            },
          ],
        },
        {
          title: "JavaScript Basics",
          lectures: [
            {
              title: "Variables",
              coveredDuration: 0,
              lectureDuration: 12,
            },
          ],
        },
      ],
    },
  ];

  const getAverageStars = (reviews) =>
    Math.round(reviews.reduce((a, b) => a + b, 0) / reviews.length);

  return (
    <div className="w-full bg-gradient-to-b from-blue-200 via-blue-100 to-blue-50 px-5 sm:px-10 lg:px-20 py-10 flex flex-col">
      <Hero />

      <StatSection />

      <ChooseUs />

      <FeatureCourse
        dummyCourses={dummyCourses}
        getAverageStars={getAverageStars}
      />
    </div>
  );
};

export default Home;
