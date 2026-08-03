import React, { useState, useEffect, Suspense } from "react";
import axios from 'axios';
import ErrorBoundary from "./components/ErrorBoundary";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";

// Configure Axios Defaults
axios.defaults.headers.common['Accept'] = 'application/json';
// Force API calls to use https if we are not on localhost, to avoid mixed-content and 415 errors
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  if (axios.defaults.baseURL && axios.defaults.baseURL.startsWith('http://')) {
    axios.defaults.baseURL = axios.defaults.baseURL.replace('http://', 'https://');
  }
}

import Home from "./pages/Home";
const JanSevaCard = React.lazy(() => import("./pages/JanSevaCard"));
import BloodNetwork from "./pages/BloodNetwork";
import Grievances from "./pages/Grievances";
import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";
const Community = React.lazy(() => import("./pages/Community"));
import Profile from "./pages/Profile";

// Wired Workflows
import VolunteersPage from "./pages/VolunteersPage";
const VolunteerDashboard = React.lazy(() => import("./pages/VolunteerDashboard"));
import DonationsPage from "./pages/DonationsPage";
import HealthPage from "./pages/HealthPage";
import HealthCare from "./pages/HealthCare";
import SchemesPage from "./pages/SchemesPage";
import WomenSafety from "./pages/WomenSafety";
import SeniorsPage from "./pages/SeniorsPage";
import AnimalsPage from "./pages/AnimalsPage";
import EnvironmentPage from "./pages/EnvironmentPage";
import CrowdfundingPage from "./pages/CrowdfundingPage";
import NotificationsPage from "./pages/NotificationsPage";
import ReligiousCulture from "./pages/ReligiousCulture";

// Dedicated Pages for Overhauled Service Hub
import JobsPage from "./pages/JobsPage";
import ScholarshipsPage from "./pages/ScholarshipsPage";
import FoodSupport from "./pages/FoodSupport";
import MedicineSupport from "./pages/MedicineSupport";
import EducationSupport from "./pages/EducationSupport";
import CountriesPage from "./pages/CountriesPage";
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
import { AppProvider } from "./context/AppContext";

import SplashScreen from "./components/SplashScreen";
import LoginScreen from "./components/LoginScreen";
import OnboardingModal from "./components/OnboardingModal";

import { Settings } from "lucide-react";


const PageLoader = () => (
  <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50">
    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Loading Module...</p>
  </div>
);
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
  <ErrorBoundary>
      <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
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
          <Route path="/health-care" element={<HealthCare />} />
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
          <Route path="/religious-culture" element={<ReligiousCulture />} />
          <Route path="/countries" element={<CountriesPage />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
</Routes>
      </Suspense>
    </BrowserRouter>
    </ErrorBoundary>
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
