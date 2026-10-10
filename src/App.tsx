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
import ProtectedRoute from "./components/ProtectedRoute";
import LoginScreenWrapper from "./components/LoginScreenWrapper";
import Home from "./pages/Home";

axios.defaults.headers.common.Accept = "application/json";
const lazyWithRetry = (factory: () => Promise<any>, key: string) => React.lazy(() => factory().then(module => { sessionStorage.removeItem(`@rpf_chunk_retry_${key}`); return module; }).catch(error => { const storageKey = `@rpf_chunk_retry_${key}`; if (sessionStorage.getItem(storageKey) !== "true") { sessionStorage.setItem(storageKey, "true"); window.location.reload(); } throw error; }));
const JanSevaCard = lazyWithRetry(() => import("./pages/JanSevaCardPage"), "jan-seva-card");
const BloodNetwork = lazyWithRetry(() => import("./pages/BloodNetwork"), "blood-network");
const Grievances = lazyWithRetry(() => import("./pages/Grievances"), "grievances");
const Community = lazyWithRetry(() => import("./pages/Community"), "community");
const DutyTracker = lazyWithRetry(() => import("./pages/VolunteerDutyTracker"), "duty-tracker");
const Services = lazyWithRetry(() => import("./pages/Services"), "services");
const ServiceDetails = lazyWithRetry(() => import("./pages/ServiceDetails"), "service-details");
const EverydayTool = lazyWithRetry(() => import("./pages/utilities/EverydayToolPage"), "everyday-tool");
const UtilityCenter = lazyWithRetry(() => import("./pages/UtilityCenter"), "utility-center");
const OnlineTestCenter = lazyWithRetry(() => import("./pages/OnlineTestCenterPage"), "online-test-center");
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
const SupremeCommandCenter = lazyWithRetry(() => import("./pages/admin/SupremeCommandCenter"), "admin-layout");
const DashboardStudio = lazyWithRetry(() => import("./pages/admin/studios/DashboardStudio"), "admin-dashboard");
const HomeStudio = lazyWithRetry(() => import("./pages/admin/studios/HomeStudio"), "admin-home");
const ActivityStudio = lazyWithRetry(() => import("./pages/admin/studios/ActivityStudio"), "admin-activity");
const ImpactStudio = lazyWithRetry(() => import("./pages/admin/studios/ImpactStudio"), "admin-impact");
const CampaignStudio = lazyWithRetry(() => import("./pages/admin/studios/CampaignStudio"), "admin-campaigns");
const LiveTVStudio = lazyWithRetry(() => import("./pages/admin/studios/LiveTVStudio"), "admin-livetv");
const ExploreStudio = lazyWithRetry(() => import("./pages/admin/studios/ExploreStudio"), "admin-explore");
const ProfileStudio = lazyWithRetry(() => import("./pages/admin/studios/ProfileStudio"), "admin-profile");
const ReelsStudio = lazyWithRetry(() => import("./pages/admin/studios/ReelsStudio"), "admin-reels");
const SecurityStudio = lazyWithRetry(() => import("./pages/admin/studios/SecurityStudio"), "admin-security");
const AdminHub = lazyWithRetry(() => import("./pages/AdminHub"), "admin"); // keeping for backup temporarily
const SupremeAdminControl = lazyWithRetry(() => import("./pages/SupremeAdminControl"), "admin-control");
const CentralContentManager = lazyWithRetry(() => import("./pages/CentralContentManager"), "central-content");
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
const Pomodoro = lazyWithRetry(() => import("./pages/utilities/PomodoroPage"), "pomodoro");
const Breathing = lazyWithRetry(() => import("./pages/utilities/BreathingMeditatorPage"), "breathing");
const Morse = lazyWithRetry(() => import("./pages/utilities/MorseCodePage"), "morse");
const Fasting = lazyWithRetry(() => import("./pages/utilities/FastingTrackerPage"), "fasting");
const Epaper = lazyWithRetry(() => import("./pages/Epaper"), "epaper");
const FactCheck = lazyWithRetry(() => import("./pages/FactCheck"), "fact-check");
const Directory = lazyWithRetry(() => import("./pages/Directory"), "directory");
const ActivityPage = lazyWithRetry(() => import("./pages/ActivityPage"), "activity");
const ImpactPage = lazyWithRetry(() => import("./pages/ImpactPage"), "impact");
const VisionGoalsPage = lazyWithRetry(() => import("./pages/VisionGoalsPage"), "vision-goals");
const SosSystem = lazyWithRetry(() => import("./pages/SosSystem"), "sos");
const PageLoader = () => <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-white"><BrandLoader size="lg" label="Loading" /><p className="mt-4 text-[10.5px] font-extrabold uppercase tracking-[0.22em] text-[#14213D]">RP Foundation Samahit</p></div>;
function NavigationBridge() { const navigate = useNavigate(); useEffect(() => { (window as any).__rpfNavigate = navigate; return () => { if ((window as any).__rpfNavigate === navigate) delete (window as any).__rpfNavigate; }; }, [navigate]); return null; }
function RoutePersistence() { const location = useLocation(); useEffect(() => { sessionStorage.setItem("@rpf_last_route", location.pathname + location.search); }, [location]); return null; }
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  useEffect(() => {
    if (!isAuthenticated) return installExternalLinkInterceptor(() => ((window as any).__rpfNavigate) ?? undefined);
  }, [isAuthenticated]);

  if (isLoading) return <PageLoader />;

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <RoutePersistence />
        <NavigationBridge />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginScreenWrapper />} />
            <Route element={<MainLayout />}>
<Route path="/" element={<Home />} /><Route path="/impact" element={<ImpactPage />} /><Route path="/activity" element={<ActivityPage />} /><Route path="/community-care-active" element={<ImpactPage />} /><Route path="/vision-goals" element={<VisionGoalsPage />} /><Route path="/about" element={<VisionGoalsPage />} /><Route path="/sos" element={<SosSystem />} /><Route path="/services" element={<Services />} /><Route path="/services/:id" element={<ServiceDetails />} /><Route path="/epaper" element={<Epaper />} /><Route path="/fact-check" element={<FactCheck />} /><Route path="/directory" element={<Directory />} /><Route path="/tools" element={<Navigate to="/utilities" replace />} /><Route path="/online-test" element={<OnlineTestCenter />} /><Route path="/test-portal" element={<Navigate to="/online-test" replace />} /><Route path="/utilities" element={<UtilityCenter />} /><Route path="/utilities/everyday/:tool" element={<EverydayTool />} /><Route path="/utilities/calculators" element={<CalculatorCenter />} /><Route path="/utilities/calculator-tool/:id" element={<CalculatorTool />} /><Route path="/utilities/bmi-calculator" element={<Navigate to="/utilities/calculator-tool/bmi-calculator" replace />} /><Route path="/utilities/split-bill" element={<Navigate to="/utilities/calculator-tool/split-bill" replace />} /><Route path="/utilities/pomodoro" element={<Pomodoro />} /><Route path="/utilities/breathing-meditator" element={<Breathing />} /><Route path="/utilities/morse-code" element={<Morse />} /><Route path="/utilities/fasting-tracker" element={<Fasting />} /><Route path="/utilities/calculator" element={<Navigate to="/utilities/calculator-tool/scientific-calculator" replace />} /><Route path="/utilities/gst-calculator" element={<Navigate to="/utilities/calculator-tool/gst-calculator" replace />} /><Route path="/device-tools" element={<DeviceTools />} /><Route path="/browser" element={<InAppBrowser />} /><Route path="/services/in-app-browser" element={<InAppBrowser />} /><Route path="/services/device-tools" element={<DeviceTools />} /><Route path="/volunteers" element={<ProtectedRoute><Community /></ProtectedRoute>} /><Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} /><Route path="/duty-tracker" element={<ProtectedRoute><DutyTracker /></ProtectedRoute>} /><Route path="/founder-message" element={<FounderMessage />} /><Route path="/founder-speech" element={<FounderMessage />} /><Route path="/notifications" element={<NotificationsPage />} /><Route path="/profile" element={<Profile />} /><Route path="/settings" element={<SettingsPage />} /><Route path="/my-certificates" element={<ProtectedRoute><MyCertificates /></ProtectedRoute>} /><Route path="/jan-seva-card" element={<ProtectedRoute><JanSevaCard /></ProtectedRoute>} /><Route path="/blood-network" element={<ProtectedRoute><BloodNetwork /></ProtectedRoute>} /><Route path="/grievance" element={<ProtectedRoute><Grievances /></ProtectedRoute>} /><Route path="/donations" element={<ProtectedRoute><DonationsPage /></ProtectedRoute>} /><Route path="/health-care" element={<ProtectedRoute><HealthCare /></ProtectedRoute>} /><Route path="/employment" element={<ProtectedRoute><Employment /></ProtectedRoute>} /><Route path="/medicine" element={<Navigate to="/health-care?tab=clinical" replace />} /><Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} /><Route path="/doc-scanner" element={<ProtectedRoute><DocScanner /></ProtectedRoute>} /><Route path="/internet-radio" element={<InternetRadio />} /><Route path="/live-tv" element={<LiveTV />} /><Route path="/news" element={<NewsFeed />} /><Route path="/hindu-calendar" element={<HinduCalendar />} /><Route path="/culture" element={<Culture />} /><Route path="/instagram" element={<InstagramReelsPage />} /><Route path="/reels" element={<InstagramReelsPage />} /><Route path="/admin/control" element={<Navigate to="/admin" replace />} /><Route path="/admin/content" element={<Navigate to="/admin/home" replace />} /><Route path="/admin/carousel" element={<Navigate to="/admin/home" replace />} /><Route path="/admin/instagram" element={<Navigate to="/admin/reels" replace />} /><Route path="*" element={<Navigate to="/" replace />} />

              <Route path="/admin" element={<ProtectedRoute adminOnly><SupremeCommandCenter /></ProtectedRoute>}>
                <Route index element={<DashboardStudio />} />
                <Route path="home" element={<HomeStudio />} />
                <Route path="activity" element={<ActivityStudio />} />
                <Route path="impact" element={<ImpactStudio />} />
                <Route path="campaigns" element={<CampaignStudio />} />
                <Route path="live-tv" element={<LiveTVStudio />} />
                <Route path="explore" element={<ExploreStudio />} />
                <Route path="profile" element={<ProfileStudio />} />
                <Route path="reels" element={<ReelsStudio />} />
                <Route path="social" element={<Navigate to="/admin/reels" replace />} />
                <Route path="security" element={<SecurityStudio />} />
              </Route>
</Route></Routes></Suspense></BrowserRouter></ErrorBoundary>
  );
}
export default function App() { return <AuthProvider><AppProvider><MediaProvider><Toaster position="top-center" /><AppContent /></MediaProvider></AppProvider></AuthProvider>; }
