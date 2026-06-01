import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/NavBar";
import AppRoutes from "./router/Routes";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminPanel from "./pages/AdminPanel";
import Cookies from 'js-cookie';

const isAuthenticated = () => {
  return !!Cookies.get("token");
};

const isAdmin = () => {
  return Cookies.get("role") === "admin";
};

const AppContent = () => {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation(); // ✅ useLocation hook
  

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";
  }, [darkMode]);

  return (
    <>
      {/* Hide Navbar on /admin route */}
      {isAuthenticated() && location.pathname !== '/admin' && <Navbar />}

      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated() ? (
              <Navigate to={isAdmin() ? "/admin/panel" : "/home"} replace />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated() ? (
              <Navigate to={isAdmin() ? "/admin/panel" : "/home"} replace />
            ) : (
              <Signup />
            )
          }
        />
        <Route path="/admin/panel" element={<AdminPanel />} />
        <Route
          path="/*"
          element={
            isAuthenticated() && !isAdmin() ? <AppRoutes /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
