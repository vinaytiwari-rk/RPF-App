const fs = require('fs');

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');
  // First, find document.getElementById(otp-${index + 1}) and replace with document.getElementById(\`otp-\${index + 1}\`)
  content = content.replace(/document\.getElementById\([^)]+\)/g, 'document.getElementById(`otp-${index + 1}`)');
  
  // Fix the backticks in template literals that were messed up
  content = content.replace(/style=\{\{ width: \${.*?\}%\}\} \}/g, 'style={{ width: `${(step / 5) * 100}%` }}');
  content = content.replace(/className=\{(.*?)\}/g, (match, p1) => {
    if (p1.includes('education.includes(eq)') || p1.includes('skills.includes(sk)') || p1.includes('authMethod ===')) {
       // if it lacks backticks, wrap the contents in backticks if it has a conditional
       if (!p1.startsWith('`')) {
         return `className={\`${p1}\`}`;
       }
    }
    return match;
  });

  fs.writeFileSync(file, content);
}

try {
  fix('src/components/LoginScreen.tsx');
  fix('src/components/VolunteerRegistrationWizard.tsx');
  
  // Just rewrite them with raw strings in node to be 100% safe
  let ls = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');
  ls = ls.replace(/document\.getElementById\(`otp-\$\{index \+ 1\}`\)/g, "document.getElementById(`otp-${index + 1}`)");
  ls = ls.replace(/className=\{\`(.*?)\`\}/g, "className={`$1`}");
  fs.writeFileSync('src/components/LoginScreen.tsx', ls);
  
} catch (e) {
  console.log(e);
}
