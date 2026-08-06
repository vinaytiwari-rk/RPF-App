const fs = require('fs');

let content = fs.readFileSync('D:/rp-foundation/src/pages/CountriesPage.tsx', 'utf8');

// Inject forex fetching
if (!content.includes('const [forexRates, setForexRates] = useState<any>(null);')) {
  content = content.replace(
    'const [activeCalc, setActiveCalc] = useState<string | null>(null);',
    'const [activeCalc, setActiveCalc] = useState<string | null>(null);\n  const [forexRates, setForexRates] = useState<any>(null);'
  );

  const fetchEffect = 
  useEffect(() => {
    if (subPage === "tools") {
      fetch("/api/public/forex")
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data && data.data.rates) {
            setForexRates(data.data.rates);
          }
        })
        .catch(err => console.error("Forex fetch error:", err));
    }
  }, [subPage]);
;
  content = content.replace('useEffect(() => {', fetchEffect + '\n  useEffect(() => {');
  
  // Replace the mock currency converter logic
  const mockCurrencyLogic = const converted = selectedCountry ? Math.round(inrAmount * 0.012) : 0; // Mock conversion;
  const realCurrencyLogic = let converted = 0;
                    if (selectedCountry && forexRates) {
                      const currencyCode = selectedCountry.currencies[0]?.code;
                      const rate = forexRates[currencyCode];
                      if (rate) {
                        converted = (inrAmount * rate).toFixed(2) as any;
                      }
                    };
  content = content.replace(mockCurrencyLogic, realCurrencyLogic);

  fs.writeFileSync('D:/rp-foundation/src/pages/CountriesPage.tsx', content);
}
