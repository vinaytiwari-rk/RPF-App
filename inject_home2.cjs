const fs = require('fs');
let c = fs.readFileSync('src/pages/Home.tsx', 'utf8');

c = c.replace(
  'const [slide, setSlide] = useState(0);',
  'const [slide, setSlide] = useState(0);\n  const [supremeConfig, setSupremeConfig] = useState<Record<string, string>>({});\n\n  useEffect(() => {\n    fetch("/api/supreme/configs").then(r => r.json()).then(d => { if(d.success) setSupremeConfig(d.configs); }).catch(() => {});\n  }, []);'
);

fs.writeFileSync('src/pages/Home.tsx', c, 'utf8');
