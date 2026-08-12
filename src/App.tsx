import React, { useState, useEffect, Suspense } from "react";
import axios from 'axios';
import ErrorBoundary from "./components/ErrorBoundary";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
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
const BloodNetwork = React.lazy(() => import('./pages/BloodNetwork'));
const Grievances = React.lazy(() => import('./pages/Grievances'));
const Community = React.lazy(() => import('./pages/Community'));
const Services = React.lazy(() => import('./pages/Services'));
const ServiceDetails = React.lazy(() => import('./pages/ServiceDetails'));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'));
const Profile = React.lazy(() => import('./pages/Profile'));
const DonationsPage = React.lazy(() => import('./pages/DonationsPage'));
const HealthCare = React.lazy(() => import('./pages/HealthCare'));
const GodAdminPanel = React.lazy(() => import("./pages/GodAdminPanel"));
const ResumeBuilder = React.lazy(() => import('./pages/ResumeBuilder'));
const DocScanner = React.lazy(() => import("./pages/DocScanner"));
const InternetRadio = React.lazy(() => import("./pages/InternetRadio"));
const NewsFeed = React.lazy(() => import("./pages/NewsFeed"));
const HinduCalendar = React.lazy(() => import("./pages/HinduCalendar"));

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

function AppContent() {
  const { isAuthenticated, isLoading, login, loginAsGuest, language, user } = useAuth();
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
              role: (details?.role || (role === "volunteer" ? "volunteer" : "citizen")) as any, 
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
          
          {/* Core Features */}
          <Route path="/jan-seva-card" element={<JanSevaCard />} />
          <Route path="/blood-network" element={<BloodNetwork />} />
          <Route path="/grievance" element={<Grievances />} />
          <Route path="/donations" element={<DonationsPage />} />
          <Route path="/health-care" element={<HealthCare />} />
          <Route path="/resume-builder" element={<ResumeBuilder />} />
          <Route path="/doc-scanner" element={<DocScanner />} />
          <Route path="/internet-radio" element={<InternetRadio />} />
          <Route path="/news" element={<NewsFeed />} />
          <Route path="/hindu-calendar" element={<HinduCalendar />} />
          <Route path="/admin" element={<GodAdminPanel />} />
          
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
      <Toaster position="top-right" />
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
