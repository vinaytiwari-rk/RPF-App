const fs = require('fs');

// 1. Fix LiveTV.tsx
let tv = fs.readFileSync('src/pages/LiveTV.tsx', 'utf8');
tv = tv.replace(/import \{ RadioReceiver,\s*/, 'import { ');
if (!tv.includes('RadioReceiver')) {
    tv = tv.replace('import { Tv,', 'import { Tv, RadioReceiver,');
}
fs.writeFileSync('src/pages/LiveTV.tsx', tv, 'utf8');

// 2. Fix InternetRadio.tsx
let radio = fs.readFileSync('src/pages/InternetRadio.tsx', 'utf8');
if (!radio.includes('import { Tv, Play, Pause,')) {
    radio = radio.replace('import { Signal,', 'import { Tv, Signal,');
}
fs.writeFileSync('src/pages/InternetRadio.tsx', radio, 'utf8');

// 3. Fix Profile.tsx
let profile = fs.readFileSync('src/pages/Profile.tsx', 'utf8');
profile = profile.replace('browserSettings }) =>', 'browserSettings?: boolean }) =>');
fs.writeFileSync('src/pages/Profile.tsx', profile, 'utf8');

console.log('Fixed lint issues');
