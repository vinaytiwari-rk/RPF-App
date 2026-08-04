const fs = require('fs');
const content = fs.readFileSync('src/components/VolunteerRegistrationWizard.tsx', 'utf8');

// A very naive count of opening and closing div tags
const openDivs = (content.match(/<div/g) || []).length;
const closeDivs = (content.match(/<\/div>/g) || []).length;
console.log('Open divs:', openDivs);
console.log('Close divs:', closeDivs);

const openSections = (content.match(/<section/g) || []).length;
const closeSections = (content.match(/<\/section>/g) || []).length;
console.log('Open sections:', openSections);
console.log('Close sections:', closeSections);

