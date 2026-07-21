import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import JanSevaCard from "./pages/JanSevaCard";
import BloodNetwork from "./pages/BloodNetwork";
import Grievances from "./pages/Grievances";
import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";
import Community from "./pages/Community";
import Profile from "./pages/Profile";

// Wired Workflows
import VolunteersPage from "./pages/VolunteersPage";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import DonationsPage from "./pages/DonationsPage";
import HealthPage from "./pages/HealthPage";
import HealthCamps from "./pages/HealthCamps";
import SchemesPage from "./pages/SchemesPage";
import WomenSafety from "./pages/WomenSafety";
import SeniorsPage from "./pages/SeniorsPage";
import AnimalsPage from "./pages/AnimalsPage";
import EnvironmentPage from "./pages/EnvironmentPage";
import CrowdfundingPage from "./pages/CrowdfundingPage";
import NotificationsPage from "./pages/NotificationsPage";

// Dedicated Pages for Overhauled Service Hub
import JobsPage from "./pages/JobsPage";
import ScholarshipsPage from "./pages/ScholarshipsPage";
import FoodSupport from "./pages/FoodSupport";
import MedicineSupport from "./pages/MedicineSupport";
import EducationSupport from "./pages/EducationSupport";
import AdminDashboard from "./pages/AdminDashboard";
import { AppProvider } from "./context/AppContext";

import SplashScreen from "./components/SplashScreen";
import LoginScreen from "./components/LoginScreen";
import OnboardingModal from "./components/OnboardingModal";

import { Settings } from "lucide-react";

// Placeholder pages for remaining incomplete routes
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 min-h-full pb-24">
    <div className="w-16 h-16 bg-[#000080]/10 rounded-full flex items-center justify-center mb-4">
      <Settings className="w-8 h-8 text-[#000080] opacity-50" />
    </div>
    <h2 className="font-display font-bold text-xl text-[#000080] mb-2">{title}</h2>
    <p className="text-xs text-slate-500">This module is being ported from the Seva-Hub workflow.</p>
  </div>
);

function AppContent() {
  const { isAuthenticated, isLoading, login, loginAsGuest, language } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(
    () => localStorage.getItem("onboarding_completed") === "true"
  );

  useEffect(() => {
    // Show splash for 2.5 seconds to feel like a native app load
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || showSplash) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    return (
      <LoginScreen 
        lang={language} 
        onLoginSuccess={async (role, details) => {
          if (role === "guest") {
            await loginAsGuest();
          } else {
            await login({ 
              id: details?.id,
              role: details?.role || (role === "volunteer" ? "volunteer" : "citizen"), 
              name: details?.name ?? "Citizen", 
              phone: details?.phone,
              isVolunteer: role === "volunteer",
              isDonor: role === "volunteer",
              janSevaCardStatus: "none"
            });
          }
        }} 
      />
    );
  }

  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetails />} />
          <Route path="/community" element={<Community />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Service Workflows */}
          <Route path="/jan-seva-card" element={<JanSevaCard />} />
          <Route path="/blood-network" element={<BloodNetwork />} />
          <Route path="/grievance" element={<Grievances />} />
          <Route path="/donations" element={<DonationsPage />} />
          <Route path="/volunteers" element={<VolunteersPage />} />
          <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
          <Route path="/health" element={<HealthPage />} />
          <Route path="/health-camps" element={<HealthCamps />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/scholarships" element={<ScholarshipsPage />} />
          <Route path="/food" element={<FoodSupport />} />
          <Route path="/medicine" element={<MedicineSupport />} />
          <Route path="/education" element={<EducationSupport />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/women" element={<WomenSafety />} />
          <Route path="/seniors" element={<SeniorsPage />} />
          <Route path="/animals" element={<AnimalsPage />} />
          <Route path="/environment" element={<EnvironmentPage />} />
          <Route path="/crowdfunding" element={<CrowdfundingPage />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
    {!onboardingCompleted && (
      <OnboardingModal onComplete={() => setOnboardingCompleted(true)} />
    )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
