const fs = require('fs');

const code = fs.readFileSync('server.ts', 'utf-8');

const routeGroups = {
    authRoutes: { prefix: '/api/auth', path: 'src/routes/authRoutes.ts' },
    healthRoutes: { prefix: ['/api/health-vitals', '/api/medications', '/api/pediatric', '/api/health_camps', '/api/blood_donors', '/api/blood-banks', '/api/blood-requests', '/api/appointments'], path: 'src/routes/healthRoutes.ts' },
    grievanceRoutes: { prefix: ['/api/grievances', '/api/support_requests', '/api/sos_alerts'], path: 'src/routes/grievanceRoutes.ts' },
    aiRoutes: { prefix: '/api/ai', path: 'src/routes/aiRoutes.ts' },
    cultureRoutes: { prefix: ['/api/culture', '/api/success-stories', '/api/social-previews'], path: 'src/routes/cultureRoutes.ts' },
    janSevaRoutes: { prefix: '/api/cards', path: 'src/routes/janSevaRoutes.ts' }
};

let remainingCode = code;
const methodRegex = /app\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/g;
const blocksByGroup = {};
Object.keys(routeGroups).forEach(k => blocksByGroup[k] = []);

let match;
const allBlocks = [];

while ((match = methodRegex.exec(remainingCode)) !== null) {
    const startIdx = match.index;
    let braceCount = 0;
    let foundFirstBrace = false;
    let endIdx = -1;
    
    for (let i = startIdx; i < remainingCode.length; i++) {
        if (remainingCode[i] === '{') {
            braceCount++;
            foundFirstBrace = true;
        } else if (remainingCode[i] === '}') {
            braceCount--;
        }
        
        if (foundFirstBrace && braceCount === 0) {
            let endOfStatement = i + 1;
            while (endOfStatement < remainingCode.length && 
                   (remainingCode[endOfStatement] === ')' || 
                    remainingCode[endOfStatement] === ';' || 
                    remainingCode[endOfStatement] === ' ' || 
                    remainingCode[endOfStatement] === '\n' || 
                    remainingCode[endOfStatement] === '\r')) {
                endOfStatement++;
                if (remainingCode[endOfStatement - 1] === ';') break;
            }
            
            endIdx = endOfStatement;
            break;
        }
    }
    
    if (endIdx !== -1) {
        const block = remainingCode.substring(startIdx, endIdx);
        allBlocks.push({
            startIdx,
            endIdx,
            path: match[2],
            method: match[1],
            fullBlock: block
        });
    }
}

// Sort blocks in reverse order of startIdx so we can replace them in remainingCode safely
allBlocks.sort((a, b) => b.startIdx - a.startIdx);

allBlocks.forEach(b => {
    let matchedGroup = null;
    let longestPrefix = "";
    
    for (const [groupName, config] of Object.entries(routeGroups)) {
        const prefixes = Array.isArray(config.prefix) ? config.prefix : [config.prefix];
        for (const pref of prefixes) {
            if (b.path.startsWith(pref) && pref.length > longestPrefix.length) {
                matchedGroup = groupName;
                longestPrefix = pref;
            }
        }
    }
    
    if (matchedGroup) {
        b.longestPrefix = longestPrefix;
        blocksByGroup[matchedGroup].push(b);
        // Replace in server.ts
        remainingCode = remainingCode.substring(0, b.startIdx) + remainingCode.substring(b.endIdx);
    }
});

fs.writeFileSync('server_new.ts', remainingCode);

const commonImports = `import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();
`;

for (const [groupName, blocks] of Object.entries(blocksByGroup)) {
    if (blocks.length === 0) continue;
    
    let fileContent = commonImports + '\n';
    
    // Sort blocks ascending by startIdx for readability
    blocks.sort((a, b) => a.startIdx - b.startIdx);
    
    blocks.forEach(b => {
        let blockCode = b.fullBlock;
        // replace app.method with router.method
        blockCode = blockCode.replace(/app\.(get|post|put|delete|patch)\s*\(/, 'router.$1(');
        fileContent += blockCode + '\n\n';
    });
    
    fileContent += `export default router;\n`;
    fs.writeFileSync(routeGroups[groupName].path, fileContent);
    console.log(`Generated ${routeGroups[groupName].path} with ${blocks.length} routes.`);
}

console.log('Generated server_new.ts');
