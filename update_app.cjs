const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// Replace imports
app = app.replace(
  'import LoginScreen from "./components/LoginScreen";',
  'import ProtectedRoute from "./components/ProtectedRoute";\nimport LoginScreenWrapper from "./components/LoginScreenWrapper";'
);

// Replace AppContent
const regex = /function AppContent\(\)[\s\S]*?<Routes>\s*<Route element=\{<MainLayout \/>\}>/;
const replacement = `function AppContent() {
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
            <Route element={<MainLayout />}>`;

app = app.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', app, 'utf8');
console.log('App.tsx updated successfully');
