// Generator for Current Affairs (80 MCQs)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function hash(str) {
  return crypto.createHash('sha256').update(str.trim().toLowerCase()).digest('hex').slice(0, 16);
}

const dir = path.join(__dirname, '..', 'src', 'data', 'quiz', 'questions');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

console.log('Generating questions into', dir);
