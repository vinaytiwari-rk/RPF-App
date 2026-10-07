const fs = require('fs');

let l = fs.readFileSync('src/pages/LiveTV.tsx', 'utf8');
if (!l.match(/import \{.*RadioReceiver.*\} from "lucide-react"/)) {
    l = l.replace(/import \{([^}]+)\} from "lucide-react"/, 'import { RadioReceiver, $1 } from "lucide-react"');
}
fs.writeFileSync('src/pages/LiveTV.tsx', l, 'utf8');

let r = fs.readFileSync('src/pages/InternetRadio.tsx', 'utf8');
if (!r.match(/import \{.*Tv.*\} from "lucide-react"/)) {
    r = r.replace(/import \{([^}]+)\} from "lucide-react"/, 'import { Tv, $1 } from "lucide-react"');
}
fs.writeFileSync('src/pages/InternetRadio.tsx', r, 'utf8');
console.log('Imports fixed.');
