const fs = require('fs');
let code = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');

if (!code.includes("import { useNavigate }")) {
  code = "import { useNavigate } from 'react-router-dom';\n" + code;
}

fs.writeFileSync('src/components/LoginScreen.tsx', code, 'utf8');
console.log('Fixed imports');
