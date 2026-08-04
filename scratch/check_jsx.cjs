const fs = require('fs');
const content = fs.readFileSync('src/components/VolunteerRegistrationWizard.tsx', 'utf8');

// Find all opening and closing tags in JSX
let tags = [];
let re = /<\/?([a-zA-Z0-9]+)(>|\s+[^>]*>)/g;
let match;
while ((match = re.exec(content)) !== null) {
  // Ignore self-closing tags
  if (match[2] && match[2].endsWith('/>')) continue;
  
  if (match[0].startsWith('</')) {
    tags.push({ type: 'close', name: match[1], line: content.substring(0, match.index).split('\n').length });
  } else {
    tags.push({ type: 'open', name: match[1], line: content.substring(0, match.index).split('\n').length });
  }
}

let stack = [];
for (let tag of tags) {
  if (tag.type === 'open') {
    stack.push(tag);
  } else {
    let top = stack.pop();
    if (!top || top.name !== tag.name) {
      console.log('Mismatch at line', tag.line, ': expected', top ? top.name : 'none', 'but got', tag.name);
    }
  }
}

if (stack.length > 0) {
  console.log('Unclosed tags:', stack.map(t => t.name + ' at line ' + t.line).join(', '));
} else {
  console.log('All tags matched.');
}

