const fs = require('fs');
let code = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');

// Ensure useNavigate is imported from react-router-dom
if (!code.includes('useNavigate')) {
  code = code.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport { useNavigate } from 'react-router-dom';");
}

if (!code.includes('const navigate = useNavigate();')) {
  code = code.replace("const [mode, setMode]", "const navigate = useNavigate();\n  const [mode, setMode]");
}

// Add the Go Back button below Register as Volunteer
const goBackBtn = `              <button
                onClick={() => {
                  navigate(-1);
                  // fallback if there's no history
                  setTimeout(() => navigate('/'), 100);
                }}
                className="w-full py-3.5 rounded-xl border border-transparent text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 text-xs font-black uppercase flex items-center justify-center gap-2 transition-colors mt-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back / Cancel
              </button>`;

code = code.replace(/Register as Volunteer\n\s+<\/button>/, `Register as Volunteer\n              </button>\n${goBackBtn}`);

fs.writeFileSync('src/components/LoginScreen.tsx', code, 'utf8');
console.log('LoginScreen updated');
