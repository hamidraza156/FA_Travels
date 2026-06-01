import React from "react";
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Destinations from '../pages/Destinations';
import Suggestions from '../pages/Suggestions';
import AdminPanel from '../pages/AdminPanel';
import Bookings from "../pages/Bookings";
const AppRoutes = () => (
  <Routes>
    <Route path="/home" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/destinations" element={<Destinations />} />
    <Route path="/suggestions" element={<Suggestions />} />
    <Route path="/admin/panel" element={<AdminPanel />} />
    <Route path="/bookings" element={<Bookings />}/>
    
  </Routes>
);

export default AppRoutes;
