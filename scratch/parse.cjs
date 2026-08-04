const parser = require('@babel/parser');
const fs = require('fs');
const content = fs.readFileSync('src/components/VolunteerRegistrationWizard.tsx', 'utf8');
try {
  parser.parse(content, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  console.log('Parsed successfully!');
} catch (e) {
  console.log('Error parsing:', e.message);
  console.log('At line:', e.loc.line, 'column:', e.loc.column);
}

