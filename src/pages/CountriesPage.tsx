import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { 
  Globe, Compass, Search, DollarSign, Clock, Plane, 
  MapPin, ShieldAlert, Award, FileText, ArrowLeft, Loader2 
} from "lucide-react";

interface Country {
  name: string;
  officialName: string;
  cca2: string;
  flag: string;
  capital: string;
  population: number;
  region: string;
  subregion: string;
  languages: string[];
  currencies: Array<{ code: string; name: string; symbol: string }>;
  googleMaps: string;
  timezone: string;
}

export default function CountriesPage() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const navigate = useNavigate();
  const isHi = lang === "hi";

  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [subPage, setSubPage] = useState<"portal" | "tools">("portal");
  const [activeCalc, setActiveCalc] = useState<string | null>(null);

  // --- SMART CALCULATORS STATE ---
  const [inrAmount, setInrAmount] = useState(10000);
  const [travelDays, setTravelDays] = useState(7);
  const [dailyBudget, setDailyBudget] = useState(5000); // INR
  const [passportScore, setPassportScore] = useState(80); // India passport rank index

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all");
        if (res.ok) {
          const data = await res.json();
          const mapped: Country[] = data.map((c: any) => {
            const languages = c.languages ? Object.values(c.languages) as string[] : [];
            const currencies = c.currencies 
              ? Object.entries(c.currencies).map(([code, cur]: [string, any]) => ({
                  code,
                  name: cur.name || "",
                  symbol: cur.symbol || ""
                }))
              : [];
            return {
              name: c.name.common || "",
              officialName: c.name.official || "",
              cca2: c.cca2 || "",
              flag: c.flags.svg || c.flags.png || "",
              capital: c.capital ? c.capital[0] : "N/A",
              population: c.population || 0,
              region: c.region || "",
              subregion: c.subregion || "",
              languages,
              currencies,
              googleMaps: c.maps.googleMaps || "",
              timezone: c.timezones ? c.timezones[0] : "UTC+00:00"
            };
          });
          // Sort alphabetically
          mapped.sort((a, b) => a.name.localeCompare(b.name));
          setCountries(mapped);
          
          // Select India by default if found
          const india = mapped.find(c => c.name.toLowerCase() === "india");
          if (india) setSelectedCountry(india);
          else if (mapped.length > 0) setSelectedCountry(mapped[0]);
        }
      } catch (err) {
        console.error("REST Countries API error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, []);

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.capital.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-5 space-y-5 animate-fadeIn pb-24 max-w-md mx-auto relative min-h-screen bg-slate-50">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-2.5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-slate-100 transition text-[#000080]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h3 className="font-display font-extrabold text-base text-slate-900">
            {isHi ? "वैश्विक देश मार्गदर्शिका" : "Global Travel & Nation Guide"}
          </h3>
          <p className="text-xs text-slate-500">
            {isHi ? "विदेशी मुद्राओं, भाषाओं और यात्रा आवश्यकताओं की जाँच करें" : "Inspect currencies, languages, and travel planners"}
          </p>
        </div>
      </div>

      {/* Top Switcher Tab Bar */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl shadow-inner border border-slate-200 shrink-0">
        <button 
          onClick={() => setSubPage("portal")}
          className={`flex-1 py-2 text-center rounded-lg text-xs font-black transition cursor-pointer ${
            subPage === "portal" ? "bg-[#000080] text-white shadow" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {isHi ? "राष्ट्र निर्देशिका" : "Nation Directory"}
        </button>
        <button 
          onClick={() => {
            setSubPage("tools");
            if (!activeCalc) setActiveCalc("currency");
          }}
          className={`flex-1 text-center py-2 rounded-lg text-xs font-black transition cursor-pointer ${
            subPage === "tools" ? "bg-[#000080] text-white shadow" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {isHi ? "यात्रा कैलकुलेटर" : "Travel Planners"}
        </button>
      </div>

      {/* 1. NATION DIRECTORY TAB */}
      {subPage === "portal" && (
        <>
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#000080]" />
              <span className="text-xs font-bold">{isHi ? "देशों का विवरण लोड हो रहा है..." : "Loading country database..."}</span>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Search & Select dropdown */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    {isHi ? "देश खोजें या चुनें" : "Search or Select Country"}
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder={isHi ? "उदा. Canada, Japan..." : "Search e.g. Canada, Japan..."}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold outline-none focus:border-[#000080] text-slate-800"
                    />
                  </div>
                </div>

                {searchQuery.trim() !== "" && (
                  <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100 text-xs">
                    {filteredCountries.slice(0, 10).map(c => (
                      <button 
                        key={c.cca2}
                        onClick={() => {
                          setSelectedCountry(c);
                          setSearchQuery("");
                        }}
                        className="w-full text-left p-2.5 hover:bg-slate-50 font-bold text-slate-700 flex items-center gap-2"
                      >
                        <img src={c.flag} alt="" className="w-5 h-3.5 object-cover rounded-sm border border-slate-200" />
                        <span>{c.name}</span>
                      </button>
                    ))}
                    {filteredCountries.length === 0 && (
                      <div className="p-3 text-slate-400 text-center font-bold">{isHi ? "कोई परिणाम नहीं" : "No results found"}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Country Details Card */}
              {selectedCountry && (
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-3">
                    <img 
                      src={selectedCountry.flag} 
                      alt={`${selectedCountry.name} flag`} 
                      className="w-20 h-14 object-cover rounded-xl border border-slate-200 shadow-xs shrink-0" 
                    />
                    <div>
                      <h4 className="font-display font-extrabold text-slate-800 text-base leading-tight">
                        {selectedCountry.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 line-clamp-1">{selectedCountry.officialName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                    <div className="space-y-1">
                      <span className="text-[9.5px] text-slate-400 block uppercase tracking-wider">{isHi ? "राजधानी" : "Capital"}</span>
                      <span className="text-slate-850">{selectedCountry.capital}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9.5px] text-slate-400 block uppercase tracking-wider">{isHi ? "जनसंख्या" : "Population"}</span>
                      <span className="text-slate-850">{selectedCountry.population.toLocaleString()}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9.5px] text-slate-400 block uppercase tracking-wider">{isHi ? "क्षेत्र (क्षेत्रीय)" : "Region"}</span>
                      <span className="text-slate-850">{selectedCountry.region} ({selectedCountry.subregion || "N/A"})</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9.5px] text-slate-400 block uppercase tracking-wider">{isHi ? "मुद्रा" : "Currency"}</span>
                      <span className="text-slate-850">
                        {selectedCountry.currencies.map(cur => `${cur.name} (${cur.symbol || cur.code})`).join(", ") || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs font-bold border-t border-slate-100 pt-3">
                    <span className="text-[9.5px] text-slate-400 block uppercase tracking-wider">{isHi ? "बोली जाने वाली भाषाएं" : "Languages Spoken"}</span>
                    <span className="text-slate-805">
                      {selectedCountry.languages.join(", ") || "N/A"}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs font-bold">
                    <span className="text-[9.5px] text-slate-400 block uppercase tracking-wider">{isHi ? "समय क्षेत्र (Timezone)" : "Timezone"}</span>
                    <span className="text-slate-805 font-mono">
                      {selectedCountry.timezone}
                    </span>
                  </div>

                  {selectedCountry.googleMaps && (
                    <a 
                      href={selectedCountry.googleMaps} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-full bg-[#000080] hover:bg-[#000066] text-white py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>{isHi ? "गूगल मैप पर देखें" : "View on Google Maps"}</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* 2. TRAVEL PLANNERS TAB */}
      {subPage === "tools" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 animate-fadeIn">
          <h4 className="font-display font-black text-xs text-[#000080] uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>{isHi ? "वैश्विक यात्रा और मुद्रा टूल्स" : "Global Planners & Travel Tools"}</span>
            <Globe className="w-4.5 h-4.5 text-blue-600" />
          </h4>

          {/* Tools Grid */}
          <div className="grid grid-cols-2 gap-2 text-center text-slate-750">
            {[
              { key: "currency", title: isHi ? "मुद्रा परिवर्तक" : "Currency Converter" },
              { key: "timezone", title: isHi ? "समय क्षेत्र कैलकुलेटर" : "Timezone Offset" },
              { key: "budget", title: isHi ? "यात्रा बजट योजनाकार" : "Travel Estimator" },
              { key: "visa", title: isHi ? "पासपोर्ट वीजा रैंक" : "Visa Compatibility" }
            ].map(tool => (
              <button
                key={tool.key}
                onClick={() => setActiveCalc(tool.key)}
                className={`p-2.5 rounded-xl text-[10.5px] font-bold border transition ${
                  activeCalc === tool.key ? "bg-[#000080] text-white border-[#000080]" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {tool.title}
              </button>
            ))}
          </div>

          {/* Content Container */}
          {activeCalc && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-2 space-y-4 animate-fadeIn text-xs text-slate-700">
              
              {/* 1. Currency Converter */}
              {activeCalc === "currency" && (
                <div className="space-y-3">
                  <h5 className="font-extrabold text-[#000080]">{isHi ? "INR से विदेशी मुद्रा परिवर्तक" : "INR to Foreign Currency Converter"}</h5>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">
                      {isHi ? `भारतीय रुपया (INR): ₹${inrAmount.toLocaleString()}` : `Amount in INR: ₹${inrAmount.toLocaleString()}`}
                    </label>
                    <input 
                      type="range" 
                      min="1000" 
                      max="100000" 
                      step="1000" 
                      value={inrAmount} 
                      onChange={e => setInrAmount(Number(e.target.value))} 
                      className="w-full accent-[#000080]" 
                    />
                  </div>

                  {(() => {
                    // Simulate exchange rates based on country properties
                    const targetCur = selectedCountry?.currencies[0];
                    const rateMap: Record<string, number> = {
                      USD: 0.012,
                      EUR: 0.011,
                      GBP: 0.0095,
                      JPY: 1.85,
                      CAD: 0.016,
                      AUD: 0.018,
                      INR: 1.0,
                    };
                    const code = targetCur?.code || "USD";
                    const rate = rateMap[code] || 0.05 + (code.charCodeAt(0) % 10) / 100;
                    const converted = (inrAmount * rate).toFixed(2);
                    return (
                      <div className="bg-indigo-50 border border-indigo-150 p-3 rounded-lg text-slate-800 font-bold text-center">
                        <p className="text-[10px] text-slate-450 font-bold uppercase">{isHi ? "अनुमानित परिवर्तित राशि" : "Converted Amount"}</p>
                        <p className="text-lg text-[#000080] font-black mt-1">
                          {targetCur?.symbol || ""} {converted} {code}
                        </p>
                        <p className="text-[8px] text-slate-400 mt-1">Exchange Rate: 1 INR ≈ {rate} {code}</p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 2. Timezone Offset */}
              {activeCalc === "timezone" && (
                <div className="space-y-3">
                  <h5 className="font-extrabold text-[#000080]">{isHi ? "स्थानीय समय क्षेत्र अंतर" : "Timezone Offset Calculator"}</h5>
                  <div className="bg-slate-900 text-white rounded-xl p-3.5 space-y-2 text-center font-mono">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">India Standard Time (IST)</span>
                    <span className="text-sm font-black text-[#FF9933]">UTC+05:30</span>
                  </div>

                  {(() => {
                    const countryOffsetStr = selectedCountry?.timezone || "UTC+00:00";
                    // Parse offsets
                    const parseOffset = (str: string) => {
                      const match = str.match(/UTC([+-])(\d+):(\d+)/);
                      if (!match) return 0;
                      const sign = match[1] === "+" ? 1 : -1;
                      const hours = parseInt(match[2]);
                      const mins = parseInt(match[3]);
                      return sign * (hours + mins / 60);
                    };

                    const istOffset = 5.5;
                    const targetOffset = parseOffset(countryOffsetStr);
                    const difference = targetOffset - istOffset;
                    const diffStr = difference >= 0 
                      ? `+${difference.toFixed(1)} ${isHi ? "घंटे आगे" : "hours ahead"}`
                      : `${difference.toFixed(1)} ${isHi ? "घंटे पीछे" : "hours behind"}`;
                    
                    return (
                      <div className="bg-indigo-50 border border-indigo-150 p-3 rounded-lg text-slate-800 font-bold text-center space-y-1.5">
                        <p className="flex justify-between"><span>{selectedCountry?.name} Timezone:</span><span className="text-[#000080]">{countryOffsetStr}</span></p>
                        <p className="flex justify-between border-t border-indigo-200/50 pt-1.5 font-black">
                          <span>{isHi ? "समय अंतराल:" : "Time Difference:"}</span>
                          <span className={difference >= 0 ? "text-green-700" : "text-amber-700"}>{diffStr}</span>
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 3. Travel Estimator */}
              {activeCalc === "budget" && (
                <div className="space-y-3">
                  <h5 className="font-extrabold text-[#000080]">{isHi ? "अन्तर्राष्ट्रीय यात्रा बजट योजना" : "International Travel Cost Estimator"}</h5>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">{isHi ? `यात्रा की अवधि: ${travelDays} दिन` : `Trip Duration: ${travelDays} Days`}</label>
                      <input type="range" min="3" max="30" value={travelDays} onChange={e => setTravelDays(Number(e.target.value))} className="w-full accent-[#000080]" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">{isHi ? `दैनिक खर्च: ₹${dailyBudget.toLocaleString()}` : `Daily Budget: ₹${dailyBudget.toLocaleString()}`}</label>
                      <input type="range" min="1000" max="20000" step="500" value={dailyBudget} onChange={e => setDailyBudget(Number(e.target.value))} className="w-full accent-[#000080]" />
                    </div>
                  </div>

                  {(() => {
                    const totalCost = travelDays * dailyBudget;
                    const flightCost = selectedCountry?.region === "Asia" ? 15000 : 45000;
                    return (
                      <div className="bg-indigo-50 border border-indigo-150 p-3 rounded-lg text-slate-800 font-bold space-y-1.5">
                        <p className="flex justify-between"><span>{isHi ? "भोजन व आवास खर्च:" : "Stay & Food Cost:"}</span><span className="text-[#000080]">₹{totalCost.toLocaleString()}</span></p>
                        <p className="flex justify-between"><span>{isHi ? "अनुमानित उड़ान किराया:" : "Estimated Flight Fare:"}</span><span className="text-[#000080]">₹{flightCost.toLocaleString()}</span></p>
                        <p className="flex justify-between border-t border-indigo-200/50 pt-1.5 font-black">
                          <span>{isHi ? "कुल बजट (अनुमानित):" : "Total Estimated Budget:"}</span>
                          <span className="text-green-700">₹{(totalCost + flightCost).toLocaleString()}</span>
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 4. Visa Compatibility */}
              {activeCalc === "visa" && (
                <div className="space-y-3">
                  <h5 className="font-extrabold text-[#000080]">{isHi ? "भारतीय पासपोर्ट वीज़ा योग्यता सूचकांक" : "India Passport Visa Index"}</h5>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">
                      {isHi ? `पासपोर्ट वैश्विक रैंक: ${passportScore}` : `Passport Strength Index: ${passportScore}`}
                    </label>
                    <input type="range" min="50" max="120" value={passportScore} onChange={e => setPassportScore(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>

                  {(() => {
                    // Decide visa requirements based on rank and selected country
                    const region = selectedCountry?.region || "Asia";
                    let visaType = "Visa Required";
                    let colorClass = "bg-red-50 text-red-700 border-red-150";

                    if (region === "Asia" && passportScore >= 75) {
                      visaType = "Visa On Arrival / Visa Free";
                      colorClass = "bg-green-50 text-green-700 border-green-150";
                    } else if (passportScore >= 95) {
                      visaType = "eVisa Eligible";
                      colorClass = "bg-indigo-50 text-indigo-700 border-indigo-150";
                    }

                    return (
                      <div className={`p-3 rounded-lg border font-bold text-center ${colorClass}`}>
                        <p className="text-xs font-black uppercase tracking-wider">{visaType}</p>
                        <p className="text-[9px] text-slate-500 mt-1 font-semibold">
                          {isHi ? "भारत के नागरिकों के लिए वीज़ा आवश्यकताएं" : "Visa requirements for Indian Passport Holders"}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}

            </div>
          )}
        </div>
      )}

    </div>
  );
}
