const fs = require('fs');

let file = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');

// Remove handleGoogleAppleLogin function
const googleFuncStart = file.indexOf('const handleGoogleAppleLogin = async () => {');
if (googleFuncStart !== -1) {
  const googleFuncEndStr = '}, 1500);\n  };';
  const googleFuncEnd = file.indexOf(googleFuncEndStr, googleFuncStart);
  if (googleFuncEnd !== -1) {
    file = file.substring(0, googleFuncStart) + file.substring(googleFuncEnd + googleFuncEndStr.length);
  }
}

// Remove Login Buttons Stack (Google / Apple)
const buttonsStart = file.indexOf('{/* Login Buttons Stack */}');
if (buttonsStart !== -1) {
  const buttonsEndStr = '<!-- End Apple Sign In -->'; // Not there, let's find the closing div of space-y-2.5
  const divStart = file.indexOf('<div className="space-y-2.5">', buttonsStart);
  if (divStart !== -1) {
    // We'll just replace the whole buttons section using regex
    file = file.replace(/\{\/\* Login Buttons Stack \*\/\}[\s\S]*?(?=\{\/\* Footer \*\/\}|<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>)/, '');
  }
}

// Ensure the divider is also removed
file = file.replace(/\{\/\* Divider \*\/\}[\s\S]*?(?=\{\/\* Login Buttons Stack \*\/\}|$)/, '');

fs.writeFileSync('src/components/LoginScreen.tsx', file);
