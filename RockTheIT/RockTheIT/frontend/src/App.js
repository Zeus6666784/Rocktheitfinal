import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CourseDetail from "./pages/CourseDetail";
import CoursePlayer from "./pages/CoursePlayer";
import Dashboard from "./pages/Dashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import CreateCourse from "./pages/CreateCourse";
import Certificates from "./pages/Certificates";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

const InstructorRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "instructor" && user.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="page-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/course/:slug" element={<CourseDetail />} />
          <Route
            path="/learn/:slug"
            element={
              <PrivateRoute>
                <CoursePlayer />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/certificates"
            element={
              <PrivateRoute>
                <Certificates />
              </PrivateRoute>
            }
          />
          <Route
            path="/instructor"
            element={
              <InstructorRoute>
                <InstructorDashboard />
              </InstructorRoute>
            }
          />
          <Route
            path="/instructor/create"
            element={
              <InstructorRoute>
                <CreateCourse />
              </InstructorRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
