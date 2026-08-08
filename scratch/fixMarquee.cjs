const fs = require('fs');
let content = fs.readFileSync('D:/rp-foundation/src/index.css', 'utf8');

content = content.replace(
  /@keyframes marquee {\s*0% { transform: translateX\(100%\); }\s*100% { transform: translateX\(-100%\); }\s*}/,
  \@keyframes marquee {
    0% { transform: translateX(100vw); }
    100% { transform: translateX(-100vw); }
  }\
);

fs.writeFileSync('D:/rp-foundation/src/index.css', content);
console.log('Fixed marquee animation in index.css');
