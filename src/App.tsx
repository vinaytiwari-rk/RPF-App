import React, { Suspense, useEffect } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { MediaProvider } from "./context/MediaContext";
import { Toaster } from "react-hot-toast";
import MainLayout from "./layouts/MainLayout";
import { installExternalLinkInterceptor } from "./utils/browser";
import BrandLoader from "./components/BrandLoader";
import LoginScreen from "./components/LoginScreen";
import Home from "./pages/Home";

axios.defaults.headers.common.Accept = "application/json";
const lazyWithRetry = (factory: () => Promise<any>, key: string) => React.lazy(() => {
  const storageKey = `@rpf_chunk_retry_${key}`;
  return factory().then((module) => { sessionStorage.removeItem(storageKey); return module; }).catch((error) => {
    if (sessionStorage.getItem(storageKey) !== "true") { sessionStorage.setItem(storageKey, "true"); window.location.reload(); }
    throw error;
  });
});

const JanSevaCard = lazyWithRetry(() => import("./pages/JanSevaCardPage"), "jan-seva-card");
const BloodNetwork = lazyWithRetry(() => import("./pages/BloodNetwork"), "blood-network");
const Grievances = lazyWithRetry(() => import("./pages/Grievances"), "grievances");
const Community = lazyWithRetry(() => import("./pages/Community"), "community");
const DutyTracker = lazyWithRetry(() => import("./pages/VolunteerDutyTracker"), "duty-tracker");
const Services = lazyWithRetry(() => import("./pages/Services"), "services");
const ServiceDetails = lazyWithRetry(() => import("./pages/ServiceDetails"), "service-details");
const ToolsCenter = lazyWithRetry(() => import("./pages/ToolsCenter"), "tools-center");
const CalculatorCenter = lazyWithRetry(() => import("./pages/utilities/CalculatorCenterPage"), "calculator-center");
const CalculatorTool = lazyWithRetry(() => import("./pages/utilities/CalculatorToolPage"), "calculator-tool");
const DeviceTools = lazyWithRetry(() => import("./pages/DeviceTools"), "device-tools");
const InAppBrowser = lazyWithRetry(() => import("./pages/InAppBrowser"), "in-app-browser");
const NotificationsPage = lazyWithRetry(() => import("./pages/NotificationsPage"), "notifications");
const Profile = lazyWithRetry(() => import("./pages/Profile"), "profile");
const SettingsPage = lazyWithRetry(() => import("./pages/Settings"), "settings");
const FounderMessage = lazyWithRetry(() => import("./pages/FounderMessage"), "founder-message");
const MyCertificates = lazyWithRetry(() => import("./pages/MyCertificates"), "certificates");
const DonationsPage = lazyWithRetry(() => import("./pages/DonationsPage"), "donations");
const HealthCare = lazyWithRetry(() => import("./pages/HealthCare"), "health-care");
const Employment = lazyWithRetry(() => import("./pages/Employment"), "employment");
const AdminHub = lazyWithRetry(() => import("./pages/AdminHub"), "admin");
const AdminCarousel = lazyWithRetry(() => import("./pages/AdminCarousel"), "admin-carousel");
const AdminInstagram = lazyWithRetry(() => import("./pages/AdminInstagram"), "admin-instagram");
const InstagramReelsPage = lazyWithRetry(() => import("./pages/InstagramReelsPage"), "instagram-reels");
const ResumeBuilder = lazyWithRetry(() => import("./pages/ResumeBuilder"), "resume");
const DocScanner = lazyWithRetry(() => import("./pages/DocScanner"), "scanner");
const InternetRadio = lazyWithRetry(() => import("./pages/InternetRadio"), "radio");
const LiveTV = lazyWithRetry(() => import("./pages/LiveTV"), "live-tv");
const NewsFeed = lazyWithRetry(() => import("./pages/NewsFeed"), "news");
const HinduCalendar = lazyWithRetry(() => import("./pages/HinduCalendar"), "calendar");
const Culture = lazyWithRetry(() => import("./pages/Culture"), "culture");
const Bmi = lazyWithRetry(() => import("./pages/utilities/BmiCalculatorPage"), "bmi");
const SplitBill = lazyWithRetry(() => import("./pages/utilities/SplitBillPage"), "split-bill");
const Pomodoro = lazyWithRetry(() => import("./pages/utilities/PomodoroPage"), "pomodoro");
const Breathing = lazyWithRetry(() => import("./pages/utilities/BreathingMeditatorPage"), "breathing");
const Morse = lazyWithRetry(() => import("./pages/utilities/MorseCodePage"), "morse");
const Fasting = lazyWithRetry(() => import("./pages/utilities/FastingTrackerPage"), "fasting");
const FullCalculator = lazyWithRetry(() => import("./pages/utilities/FullCalculatorPage"), "full-calculator");
const GstCalculator = lazyWithRetry(() => import("./pages/utilities/GstCalculatorPage"), "gst-calculator");
const Epaper = lazyWithRetry(() => import("./pages/Epaper"), "epaper");
const FactCheck = lazyWithRetry(() => import("./pages/FactCheck"), "fact-check");
const Directory = lazyWithRetry(() => import("./pages/Directory"), "directory");
const ImpactPage = lazyWithRetry(() => import("./pages/ImpactPage"), "impact");
const VisionGoalsPage = lazyWithRetry(() => import("./pages/VisionGoalsPage"), "vision-goals");
const SosSystem = lazyWithRetry(() => import("./pages/SosSystem"), "sos");

const PageLoader = () => (
  <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-white">
    <BrandLoader size="lg" label="Loading" />
    <p className="mt-4 text-[10.5px] font-extrabold uppercase tracking-[0.22em] text-[#14213D]">
      RP Foundation Samahit
    </p>
  </div>
);

function NavigationBridge() { const navigate = useNavigate(); useEffect(() => { (window as any).__rpfNavigate = navigate; return () => { if ((window as any).__rpfNavigate === navigate) delete (window as any).__rpfNavigate; }; }, [navigate]); return null; }
function RoutePersistence() { const location = useLocation(); useEffect(() => { sessionStorage.setItem("@rpf_last_route", location.pathname + location.search); }, [location]); return null; }

function AppContent() {
  const { isAuthenticated, isLoading, login, loginAsGuest, language } = useAuth();
  useEffect(() => { if (!isAuthenticated) return installExternalLinkInterceptor(() => ((window as any).__rpfNavigate) ?? undefined); }, [isAuthenticated]);
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <LoginScreen lang={language} onLoginSuccess={async (role, details) => { if (role === "guest") await loginAsGuest(); else await login({ id: details?.id, role: (details?.role || (role === "admin" ? "admin" : (role === "volunteer" ? "volunteer" : "citizen"))) as any, name: details?.name ?? "User", phone: details?.phone, isVolunteer: details?.role === "volunteer" || role === "volunteer", isDonor: details?.role === "volunteer" || role === "volunteer", janSevaCardStatus: "none" }, details?.token, details?.remember !== false); }} />;
  return <ErrorBoundary><BrowserRouter><RoutePersistence /><NavigationBridge /><Suspense fallback={<PageLoader />}><Routes><Route element={<MainLayout />}>
    <Route path="/" element={<Home />} /><Route path="/impact" element={<ImpactPage />} /><Route path="/community-care-active" element={<ImpactPage />} /><Route path="/vision-goals" element={<VisionGoalsPage />} /><Route path="/about" element={<VisionGoalsPage />} /><Route path="/sos" element={<SosSystem />} />
    <Route path="/services" element={<Services />} /><Route path="/services/:id" element={<ServiceDetails />} /><Route path="/epaper" element={<Epaper />} /><Route path="/fact-check" element={<FactCheck />} /><Route path="/directory" element={<Directory />} />
    <Route path="/tools" element={<ToolsCenter />} /><Route path="/utilities" element={<Navigate to="/tools" replace />} /><Route path="/utilities/calculators" element={<CalculatorCenter />} /><Route path="/utilities/calculator-tool/:id" element={<CalculatorTool />} />
    <Route path="/utilities/bmi-calculator" element={<Bmi />} /><Route path="/utilities/split-bill" element={<SplitBill />} /><Route path="/utilities/pomodoro" element={<Pomodoro />} /><Route path="/utilities/breathing-meditator" element={<Breathing />} /><Route path="/utilities/morse-code" element={<Morse />} /><Route path="/utilities/fasting-tracker" element={<Fasting />} /><Route path="/utilities/calculator" element={<FullCalculator />} /><Route path="/utilities/gst-calculator" element={<GstCalculator />} />
    <Route path="/device-tools" element={<DeviceTools />} /><Route path="/browser" element={<InAppBrowser />} /><Route path="/services/in-app-browser" element={<InAppBrowser />} /><Route path="/services/device-tools" element={<DeviceTools />} />
    <Route path="/volunteers" element={<Community />} /><Route path="/community" element={<Community />} /><Route path="/duty-tracker" element={<DutyTracker />} /><Route path="/founder-message" element={<FounderMessage />} /><Route path="/founder-speech" element={<FounderMessage />} />
    <Route path="/notifications" element={<NotificationsPage />} /><Route path="/profile" element={<Profile />} /><Route path="/settings" element={<SettingsPage />} /><Route path="/my-certificates" element={<MyCertificates />} /><Route path="/jan-seva-card" element={<JanSevaCard />} /><Route path="/blood-network" element={<BloodNetwork />} /><Route path="/grievance" element={<Grievances />} /><Route path="/donations" element={<DonationsPage />} /><Route path="/health-care" element={<HealthCare />} /><Route path="/employment" element={<Employment />} /><Route path="/medicine" element={<Navigate to="/health-care?tab=clinical" replace />} />
    <Route path="/resume-builder" element={<ResumeBuilder />} /><Route path="/doc-scanner" element={<DocScanner />} /><Route path="/internet-radio" element={<InternetRadio />} /><Route path="/live-tv" element={<LiveTV />} /><Route path="/news" element={<NewsFeed />} /><Route path="/hindu-calendar" element={<HinduCalendar />} /><Route path="/culture" element={<Culture />} /><Route path="/instagram" element={<InstagramReelsPage />} /><Route path="/reels" element={<InstagramReelsPage />} />
    <Route path="/admin" element={<AdminHub />} /><Route path="/admin/carousel" element={<AdminCarousel />} /><Route path="/admin/instagram" element={<AdminInstagram />} /><Route path="*" element={<Navigate to="/" replace />} />
  </Route></Routes></Suspense></BrowserRouter></ErrorBoundary>;
}

export default function App() { return <AuthProvider><AppProvider><MediaProvider><Toaster position="top-center" /><AppContent /></MediaProvider></AppProvider></AuthProvider>; }
