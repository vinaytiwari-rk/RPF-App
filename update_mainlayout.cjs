const fs = require('fs');

let main = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

// Remove guest blocking logic
main = main.replace(
  /const nav = \(p: string\) => \{[\s\S]*?navigate\(p\);\n  \};/,
  `const nav = (p: string) => {
    navigate(p);
  };`
);

// Remove the guest modal completely
main = main.replace(
  /\{guest && \([\s\S]*?<\/div>\n      \)\}/,
  ''
);

// Remove the guest state
main = main.replace(
  /const \[guest, setGuest\] = useState\(false\);/,
  ''
);

fs.writeFileSync('src/layouts/MainLayout.tsx', main, 'utf8');
console.log('MainLayout updated');
