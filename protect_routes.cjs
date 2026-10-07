const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

const protectRoutes = [
  '/jan-seva-card',
  '/community',
  '/volunteers',
  '/duty-tracker',
  '/my-certificates',
  '/blood-network',
  '/grievance',
  '/donations',
  '/health-care',
  '/employment',
  '/resume-builder',
  '/doc-scanner'
];

protectRoutes.forEach(route => {
  const routeRegex = new RegExp(`<Route path="${route}" element={<([^>]+) />} />`, 'g');
  app = app.replace(routeRegex, `<Route path="${route}" element={<ProtectedRoute><$1 /></ProtectedRoute>} />`);
});

// Protect Admin routes
const adminRoutes = [
  '/admin',
  '/admin/control',
  '/admin/content',
  '/admin/carousel',
  '/admin/instagram'
];

adminRoutes.forEach(route => {
  const routeRegex = new RegExp(`<Route path="${route}" element={<([^>]+) />} />`, 'g');
  app = app.replace(routeRegex, `<Route path="${route}" element={<ProtectedRoute adminOnly><$1 /></ProtectedRoute>} />`);
});

fs.writeFileSync('src/App.tsx', app, 'utf8');
console.log('Routes protected in App.tsx');
