const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// Replace imports
app = app.replace(
  'const AdminHub = lazyWithRetry(() => import("./pages/AdminHub"), "admin");',
  `const SupremeCommandCenter = lazyWithRetry(() => import("./pages/admin/SupremeCommandCenter"), "admin-layout");
const DashboardStudio = lazyWithRetry(() => import("./pages/admin/studios/DashboardStudio"), "admin-dashboard");
const HomeStudio = lazyWithRetry(() => import("./pages/admin/studios/HomeStudio"), "admin-home");
const ImpactStudio = lazyWithRetry(() => import("./pages/admin/studios/ImpactStudio"), "admin-impact");
const LiveTVStudio = lazyWithRetry(() => import("./pages/admin/studios/LiveTVStudio"), "admin-livetv");
const ExploreStudio = lazyWithRetry(() => import("./pages/admin/studios/ExploreStudio"), "admin-explore");
const ProfileStudio = lazyWithRetry(() => import("./pages/admin/studios/ProfileStudio"), "admin-profile");
const AdminHub = lazyWithRetry(() => import("./pages/AdminHub"), "admin"); // keeping for backup temporarily`
);

// We need to inject the new routes right before `</Route></Routes>`
const newRoutes = `
              <Route path="/admin" element={<ProtectedRoute adminOnly><SupremeCommandCenter /></ProtectedRoute>}>
                <Route index element={<DashboardStudio />} />
                <Route path="home" element={<HomeStudio />} />
                <Route path="impact" element={<ImpactStudio />} />
                <Route path="live-tv" element={<LiveTVStudio />} />
                <Route path="explore" element={<ExploreStudio />} />
                <Route path="profile" element={<ProfileStudio />} />
              </Route>
`;

// Replace the old admin routes
app = app.replace('<Route path="/admin" element={<ProtectedRoute adminOnly><AdminHub /></ProtectedRoute>} />', '');

// Inject the new routes
app = app.replace('</Route></Routes>', newRoutes + '</Route></Routes>');

fs.writeFileSync('src/App.tsx', app, 'utf8');
console.log('App.tsx updated');
