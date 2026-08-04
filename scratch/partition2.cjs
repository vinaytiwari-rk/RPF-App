const fs = require('fs');

const code = fs.readFileSync('server.ts', 'utf-8');

const routeGroups = {
    locationRoutes: { prefix: '/api/locations', path: 'src/routes/locationRoutes.ts' },
    womenRoutes: { prefix: '/api/women', path: 'src/routes/womenRoutes.ts' },
    volunteerRoutes: { prefix: ['/api/volunteers', '/api/volunteer_tasks'], path: 'src/routes/volunteerRoutes.ts' },
    certificateRoutes: { prefix: '/api/certificates', path: 'src/routes/certificateRoutes.ts' },
    communityRoutes: { prefix: ['/api/community_posts', '/api/blogs', '/api/social'], path: 'src/routes/communityRoutes.ts' },
    jobRoutes: { prefix: ['/api/jobs', '/api/job_applications'], path: 'src/routes/jobRoutes.ts' },
    donationRoutes: { prefix: '/api/donations', path: 'src/routes/donationRoutes.ts' },
    cmsRoutes: { prefix: ['/api/settings', '/api/cms'], path: 'src/routes/cmsRoutes.ts' },
    campaignRoutes: { prefix: '/api/campaigns', path: 'src/routes/campaignRoutes.ts' },
    submissionRoutes: { prefix: '/api/submissions', path: 'src/routes/submissionRoutes.ts' },
    userRoutes: { prefix: '/api/users', path: 'src/routes/userRoutes.ts' },
    uploadRoutes: { prefix: ['/api/upload', '/api/profile'], path: 'src/routes/uploadRoutes.ts' },
    publicGovRoutes: { prefix: ['/api/gov', '/api/public'], path: 'src/routes/publicGovRoutes.ts' },
    miscRoutes: { prefix: ['/api/search', '/api/stats', '/api/testimonials', '/api/notifications'], path: 'src/routes/miscRoutes.ts' },
    adminHqExtraRoutes: { prefix: '/api/admin/hq', path: 'src/routes/adminHqExtraRoutes.ts' } // to pull out remaining hq routes
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
import multer from 'multer';

const router = express.Router();
`;

for (const [groupName, blocks] of Object.entries(blocksByGroup)) {
    if (blocks.length === 0) continue;
    
    let fileContent = commonImports + '\n';
    
    blocks.sort((a, b) => a.startIdx - b.startIdx);
    
    blocks.forEach(b => {
        let blockCode = b.fullBlock;
        blockCode = blockCode.replace(/app\.(get|post|put|delete|patch)\s*\(/, 'router.$1(');
        fileContent += blockCode + '\n\n';
    });
    
    fileContent += `export default router;\n`;
    fs.writeFileSync(routeGroups[groupName].path, fileContent);
    console.log(`Generated ${routeGroups[groupName].path} with ${blocks.length} routes.`);
}

console.log('Generated server_new.ts');
