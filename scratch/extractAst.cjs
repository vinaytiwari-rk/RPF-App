const { Project, SyntaxKind } = require("ts-morph");
const fs = require("fs");

const project = new Project();
const sourceFile = project.addSourceFileAtPath("server.ts");

function extractFunction(name) {
  const func = sourceFile.getFunction(name);
  if (func) {
    const text = func.getFullText();
    func.remove();
    return text.trim();
  }
  return "";
}

function extractVariable(name) {
  const varDecl = sourceFile.getVariableDeclaration(name);
  if (varDecl) {
    const stmt = varDecl.getVariableStatement();
    const text = stmt.getFullText();
    stmt.remove();
    return text.trim();
  }
  return "";
}

function extractInterface(name) {
  const intf = sourceFile.getInterface(name);
  if (intf) {
    const text = intf.getFullText();
    intf.remove();
    return text.trim();
  }
  return "";
}

// 1. Mailer
const sendEmailText = extractFunction("sendEmail");
fs.writeFileSync("src/lib/mailer.ts", `import axios from 'axios';\n\nexport ${sendEmailText}\n`);

// 2. Constituency
const mockText = extractVariable("MP_CONSTITUENCIES_MOCK");
const loadGeoText = extractFunction("loadACGeoJson");
const resolveText = extractFunction("resolveConstituency");
const findConstituenciesText = extractFunction("findConstituenciesByDistrict"); // This is a helper used by resolveConstituency!
// Need to also extract PINCODE_CONSTITUENCY_MAP if it exists and is used by resolveConstituency!
const pincodeMap = extractVariable("PINCODE_CONSTITUENCY_MAP");

fs.writeFileSync("src/lib/constituency.ts", `import fs from 'fs';\nimport path from 'path';\n\n${mockText ? 'export ' + mockText : ''}\n${pincodeMap ? pincodeMap : ''}\n${findConstituenciesText ? findConstituenciesText : ''}\n\nexport ${loadGeoText}\n\nexport ${resolveText}\n`);

// 3. User Fields
const userFieldsText = extractVariable("USER_PRIVILEGED_FIELDS");
fs.writeFileSync("src/lib/userFields.ts", `export ${userFieldsText}\n`);

// 4. Cache
const apiCacheText = extractVariable("apiCache");
const cacheTtlText = extractVariable("CACHE_TTL");
fs.writeFileSync("src/lib/apiCache.ts", `export ${apiCacheText}\nexport ${cacheTtlText}\n`);

const socialCacheText = extractVariable("socialPreviewsCache");
const socialTtlText = extractVariable("SOCIAL_CACHE_TTL");
const socialInterface = extractInterface("SocialCacheEntry");
fs.writeFileSync("src/lib/socialCache.ts", `${socialInterface ? 'export ' + socialInterface : ''}\nexport ${socialCacheText}\nexport ${socialTtlText}\n`);

// 5. Gemini
const geminiClientText = extractFunction("getGeminiClient");
const offlineText = extractFunction("handleOfflineFallback");
const aiClientText = extractVariable("aiClient");
fs.writeFileSync("src/lib/gemini.ts", `import { GoogleGenAI, Type } from '@google/genai';\n\n${aiClientText}\nexport ${geminiClientText}\n\nexport ${offlineText}\nexport { Type };\n`);

// 6. External Search
const searchText = extractFunction("queryExternalSearch");
let cleanSearchText = searchText;
// Remove orphaned route from search string if it exists inside
const searchRegex = /app\.post\([\'\"]\/api\/scholarships[\'\"],[\s\S]*?\}\);/g;
cleanSearchText = cleanSearchText.replace(searchRegex, "// Cleaned up orphaned /api/scholarships route");
fs.writeFileSync("src/lib/externalSearch.ts", `import axios from 'axios';\n\nexport ${cleanSearchText}\n`);

// 7. Remove orphaned route from server.ts directly if it exists globally
// ts-morph handles removing the AST nodes. We just save the file.
const imports = `
import { sendEmail } from './src/lib/mailer';
import { apiCache, CACHE_TTL } from './src/lib/apiCache';
import { queryExternalSearch } from './src/lib/externalSearch';
import { getGeminiClient, handleOfflineFallback, Type } from './src/lib/gemini';
import { socialPreviewsCache, SOCIAL_CACHE_TTL } from './src/lib/socialCache';
import { resolveConstituency, loadACGeoJson, MP_CONSTITUENCIES_MOCK } from './src/lib/constituency';
import { USER_PRIVILEGED_FIELDS } from './src/lib/userFields';
`;

sourceFile.insertText(0, imports);
sourceFile.saveSync();

console.log("AST Refactoring complete.");
