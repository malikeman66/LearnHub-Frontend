```jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentDashboard from "./pages/StudentDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <>
      <Navbar />

      <main>
        <Routes>

          {/* Public Pages */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/courses"
            element={<Courses />}
          />

          <Route
            path="/courses/:id"
            element={<CourseDetail />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* Student Dashboard */}

          <Route
            path="/student"
            element={
              <ProtectedRoute roles={["Student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Instructor Dashboard */}

          <Route
            path="/instructor"
            element={
              <ProtectedRoute roles={["Instructor", "Admin"]}>
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 */}

          <Route
            path="*"
            element={
              <div className="container py-5 text-center">
                <h1>404</h1>
                <p>Page not found.</p>
              </div>
            }
          />

        </Routes>
      </main>

      {/* Footer */}

      <footer className="bg-dark text-white text-center py-4 mt-5">
        <div className="container">
          <p className="mb-1 fw-bold">
            LearnHub LMS
          </p>

          <small>
            MERN Stack Learning Management System
          </small>
        </div>
      </footer>
    </>
  );
}

export default App;
```
