import React, { createContext } from "react";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./AppLayout";
import Home from "./pages/Home";
import ExplorePage from "./pages/ExploreCoursePage/ExplorePage";
import CourseDetails from "./pages/ExploreCoursePage/CourseDetails";
import ProtectedRoute from "./protectedRouting/ProtectedRoute";
import AdminDash from "./pages/Dashboard/AdminDash";
import FacultyDash from "./pages/Dashboard/FacultyDash";
import StudentDash from "./pages/Dashboard/StudentDash";

const user = createContext()

const App = () => {
  try {
    
  } catch (error) {
    
  }
  const routes = createBrowserRouter([
    {
      path: "/",
      element: <AppLayout />,
      children: [
        { path: "/", element: <Home /> },
        { path: "/explore-courses", element: <ExplorePage /> },
        { path: "/course-about", element: <CourseDetails /> },

        {
          path: "/admin",
          element: (
            <ProtectedRoute role="admin">
              <AdminDash />
            </ProtectedRoute>
          ),
        },

        {
          path: "/lecture",
          element: (
            <ProtectedRoute role="lecture">
              <FacultyDash />
            </ProtectedRoute>
          ),
        },

        {
          path: "/student",
          element: (
            <ProtectedRoute role="student">
              <StudentDash />
            </ProtectedRoute>
          ),
        },
      ],
    },
  ]);

  return <RouterProvider router={routes} />;
};

export default App;
