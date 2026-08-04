const fs = require('fs');

const code = fs.readFileSync('server.ts', 'utf-8');

function extractBlocks(prefix) {
    const blocks = [];
    let remainingCode = code;
    
    // Simple regex to find app.get, app.post, app.put, app.delete matching prefix
    const methodRegex = new RegExp(`app\\.(get|post|put|delete|patch)\\(\\s*['"](${prefix}[^'"]*)['"]`, 'g');
    
    let match;
    while ((match = methodRegex.exec(remainingCode)) !== null) {
        const startIdx = match.index;
        // find opening brace for the callback
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
                // Find the closing parenthesis and semicolon
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
            blocks.push({
                path: match[2],
                method: match[1],
                block: block,
                startIdx,
                endIdx
            });
            // We don't remove immediately from remainingCode because it messes up indices of regex
        }
    }
    
    return blocks;
}

const authBlocks = extractBlocks('/api/auth');
console.log(`Found ${authBlocks.length} auth blocks.`);
authBlocks.forEach(b => console.log(b.method, b.path));

fs.writeFileSync('auth_blocks.json', JSON.stringify(authBlocks, null, 2));
