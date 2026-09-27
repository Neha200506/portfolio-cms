import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Skills from "./pages/Skills";
import Projects from "./pages/Projects";
import Blogs from "./pages/Blogs";
import Experience from "./pages/Experience";
import Messages from "./pages/Messages";
import Media from "./pages/Media";
import ProtectedRoute from "./components/ProtectedRoute";
import CMSLayout from "./layouts/CMSLayout";

function RootRedirect() {
  const token = localStorage.getItem("adminToken");
  return <Navigate to={token ? "/dashboard" : "/login"} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected CMS pages using common CMSLayout */}
        <Route
          element={
            <ProtectedRoute>
              <CMSLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/media" element={<Media />} />
        </Route>

        <Route path="/" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;