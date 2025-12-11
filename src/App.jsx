import React, { createContext } from "react";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./AppLayout";
import Home from "./pages/Home";
import ExplorePage from "./pages/ExploreCoursePage/ExplorePage";
import CourseDetails from "./pages/ExploreCoursePage/CourseDetails";
import CourseLearning from "./pages/Learning/CourseLearning";
import ProtectedRoute from "./protectedRouting/ProtectedRoute";
import AdminDash from "./pages/Dashboard/AdminDash";
import FacultyDash from "./pages/Dashboard/FacultyDash";
import StudentDash from "./pages/Dashboard/StudentDash";
import VerifyEmail from "./pages/VerifyEmail/VerifyEmail";
import Login from "./pages/AuthPage/Login";
import { UserProvider } from "./context/UserContext";
import ProfilePage from "./pages/profile/ProfilePage";
import CourseProvider from "./context/CourseContext";


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
        {path: "/my-enrollements",element:<StudentDash/>},
        { path: "/explore-courses", element: <ExplorePage /> },
        { path: "/course-about", element: <CourseDetails /> },
        { path: "/learn/:courseId", element: <CourseLearning /> },
        { path: "/verify/:token", element: <VerifyEmail/> },
        { path: "/profile", element: <ProfilePage /> },
        {path:"/lecturer/dashboard",element:<FacultyDash/>},

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

  return(
  <UserProvider>
      <CourseProvider>
        <RouterProvider router={routes} />
      </CourseProvider>
    </UserProvider>
  );
};

export default App;


//ratikanta mohanty