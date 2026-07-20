const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

// For /api/ai/categorize
serverCode = serverCode.replace(
  /const apiKey = process\.env\.GEMINI_API_KEY;\s*if \(\!apiKey\) \{\s*\/\/ Fallback Mock categorization[\s\S]*?\}\s*try \{/,
  `const apiKey = process.env.GEMINI_API_KEY;
  const safeCatDefault = {
    category: "Uncategorized",
    urgency: "Pending Review",
    summary: title ? title.substring(0, 50) + "..." : "Complaint under review"
  };

  if (!apiKey) {
    console.warn("AI Categorization skipped: No GEMINI_API_KEY provided.");
    return res.json(safeCatDefault);
  }

  try {`
);

serverCode = serverCode.replace(
  /\} catch \(error: any\) \{\s*console\.error\("AI Categorization Error:", error\);\s*res\.status\(500\)\.json\(\{ error: error\.message \|\| "Failed to categorize grievance" \}\);\s*\}\s*\n\s*\}\);/,
  `} catch (error: any) {
    console.error("AI Categorization Error:", error);
    res.json(safeCatDefault);
  }
});`
);

// For /api/ai/scheme-match
serverCode = serverCode.replace(
  /const apiKey = process\.env\.GEMINI_API_KEY;\s*if \(\!apiKey\) \{\s*\/\/ offline graceful fallback[\s\S]*?\}\s*try \{/,
  `const apiKey = process.env.GEMINI_API_KEY;
  const safeSchemeDefault = { schemes: [] };

  if (!apiKey) {
    console.warn("AI Scheme Match skipped: No GEMINI_API_KEY provided.");
    return res.json(safeSchemeDefault);
  }

  try {`
);

serverCode = serverCode.replace(
  /\} catch \(error: any\) \{\s*console\.error\("AI Scheme Match Error:", error\);\s*res\.status\(500\)\.json\(\{ error: error\.message \|\| "Failed to match schemes" \}\);\s*\}\s*\n\s*\}\);/,
  `} catch (error: any) {
    console.error("AI Scheme Match Error:", error);
    res.json(safeSchemeDefault);
  }
});`
);

fs.writeFileSync('server.ts', serverCode);
console.log("Successfully patched server.ts safely");
