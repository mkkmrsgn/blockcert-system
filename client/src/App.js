import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeDashboard from "./pages/HomeDashboard";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import UserDashboard from "./pages/UserDashboard";
import IssuerDashboard from "./pages/IssuerDashboard";
import VerifyPage from "./pages/VerifyPage";
import CertificateViewerPage from "./pages/CertificateViewerPage";
import DrivingSchoolsPage from "./pages/DrivingSchoolsPage";
import "./App.css";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeDashboard />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/issuer" element={<IssuerDashboard />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/verify/:certificateNumber" element={<VerifyPage />} />
        <Route path="/certificate-view/:certificateNumber" element={<CertificateViewerPage />} />
        <Route path="/schools" element={<DrivingSchoolsPage />} />
      </Routes>
    </Router>
  );
}