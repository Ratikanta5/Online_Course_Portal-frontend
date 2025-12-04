// // src/context/CourseContext.jsx
// import { createContext, useContext, useEffect, useState } from "react";
// import axios from "axios";

// const CourseContext = createContext();

// export const useCourses = () => useContext(CourseContext);

// export default function CourseProvider({ children }) {
//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   /**
//    * Fetch all courses from backend
//    * Backend will handle database logic internally:
//    * -> MongoDB
//    * -> SQL
//    * -> Prisma
//    * Whatever you use later.
//    */
//   const fetchCourses = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const res = await axios.get(
//         `${import.meta.env.VITE_API_URL}/api/courses`
//       );

//       /**
//        * Expected backend response:
//        * {
//        *    success: true,
//        *    courses: [
//        *      { _id, title, price, thumbnail, category, instructorId }
//        *    ]
//        * }
//        */
//       setCourses(res.data?.courses || []);
//     } catch (err) {
//       console.error("Error fetching courses:", err);
//       setError("Could not fetch courses");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch courses once on mount
//   useEffect(() => {
//     fetchCourses();
//   }, []);

//   return (
//     <CourseContext.Provider
//       value={{
//         courses,
//         loading,
//         error,
//         refetchCourses: fetchCourses, // manual refetch support
//       }}
//     >
//       {children}
//     </CourseContext.Provider>
//   );
// }
