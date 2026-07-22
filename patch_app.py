import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace imports
content = content.replace('import JanSevaCard from "./pages/JanSevaCard";', 'const JanSevaCard = React.lazy(() => import("./pages/JanSevaCard"));')
content = content.replace('import Community from "./pages/Community";', 'const Community = React.lazy(() => import("./pages/Community"));')
content = content.replace('import VolunteerDashboard from "./pages/VolunteerDashboard";', 'const VolunteerDashboard = React.lazy(() => import("./pages/VolunteerDashboard"));')
content = content.replace('import AdminDashboard from "./pages/AdminDashboard";', 'const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));')

# Add Suspense and ErrorBoundary imports
content = content.replace('import React, { useState, useEffect } from "react";', 'import React, { useState, useEffect, Suspense } from "react";\nimport ErrorBoundary from "./components/ErrorBoundary";')

# Create Loader
loader_code = """
const PageLoader = () => (
  <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50">
    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Loading Module...</p>
  </div>
);
"""
content = re.sub(
    r'(// Placeholder pages for remaining incomplete routes)',
    loader_code + r'\1',
    content
)

# Wrap Routes
routes_replace = """
    <ErrorBoundary>
      <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
      <Routes>
"""
content = content.replace('    <BrowserRouter>\n      <Routes>', routes_replace.strip())

routes_end_replace = """
      </Routes>
      </Suspense>
    </BrowserRouter>
    </ErrorBoundary>
"""
content = content.replace('      </Routes>\n    </BrowserRouter>', routes_end_replace.strip())

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched App.tsx")
