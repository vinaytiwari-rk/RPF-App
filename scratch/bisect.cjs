const fs = require('fs');
const { execSync } = require('child_process');

let content = fs.readFileSync('src/components/VolunteerRegistrationWizard.tsx', 'utf8');

// We will just run tsc on the file, it will tell us the error
// But wait, the error is at 440:3, ')' expected.
// Let's just print the exact lines around 440
const lines = content.split('\n');
for (let i = 430; i < lines.length; i++) {
  console.log((i+1) + ': ' + lines[i]);
}

