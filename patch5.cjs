const fs = require('fs');
let code = fs.readFileSync('src/pages/Services.tsx', 'utf8');

// 1. Add state for Gov Data
const stateInjectionPoint = 'const [subWebLoading, setSubWebLoading] = useState(false);';
const govState = `const [subWebLoading, setSubWebLoading] = useState(false);

  /* ── Gov Data State ── */
  const [govData, setGovData] = useState<any[]>([]);
  const [govLoading, setGovLoading] = useState(false);
  const [govStateFilter, setGovStateFilter] = useState("Madhya Pradesh");
`;
code = code.replace(stateInjectionPoint, govState);


// 2. Add useEffect to fetch Gov Data when "farmer" or "health" is selected
const fetchEffectInjectionPoint = `  useEffect(() => {
    setSubSearch("");
    setSubWebResults([]);
    setSubWebLoading(false);
  }, [selected]);`;
  
const fetchEffect = `  useEffect(() => {
    setSubSearch("");
    setSubWebResults([]);
    setSubWebLoading(false);
    setGovData([]);
    
    if (selected?.id === "farmer" || selected?.id === "health") {
      const fetchGovData = async () => {
        setGovLoading(true);
        try {
          const ep = selected.id === "farmer" ? "/api/gov/mandi-prices" : "/api/gov/hospitals";
          const res = await axios.get(ep + "?state=" + encodeURIComponent(govStateFilter));
          setGovData(res.data?.records || []);
        } catch (e) {
          console.error("Failed to fetch gov data", e);
        } finally {
          setGovLoading(false);
        }
      };
      fetchGovData();
    }
  }, [selected, govStateFilter]);`;
code = code.replace(fetchEffectInjectionPoint, fetchEffect);

// 3. Inject Gov UI rendering into ContentFeedTemplate
const uiInjectionPoint = `{localFeatures.map((item, i) => (`
const govUI = `
                  {/* Gov Data Integration Block */}
                  {(selected.id === "farmer" || selected.id === "health") && (
                    <div className="mb-4 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                      <div className="flex items-center justify-between mb-3">
                        <h6 className="text-[10px] font-bold text-indigo-800 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5" />
                          {selected.id === "farmer" ? (isHi ? "लाइव मंडी भाव (Data.gov.in)" : "Live APMC Mandi Rates") : (isHi ? "सरकारी अस्पताल (Data.gov.in)" : "Govt. Hospital Directory")}
                        </h6>
                        <select 
                          className="text-[9px] font-bold p-1 rounded bg-white border border-indigo-200 outline-none text-indigo-700"
                          value={govStateFilter}
                          onChange={(e) => setGovStateFilter(e.target.value)}
                        >
                          <option value="Madhya Pradesh">Madhya Pradesh</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Rajasthan">Rajasthan</option>
                          <option value="Gujarat">Gujarat</option>
                        </select>
                      </div>
                      
                      {govLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                        </div>
                      ) : govData.length > 0 ? (
                        <div className="space-y-2">
                          {govData.map((record: any, idx: number) => (
                            <div key={idx} className="bg-white p-2.5 rounded-lg border border-indigo-100 shadow-sm flex flex-col gap-1">
                              {selected.id === "farmer" ? (
                                <>
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-[10px] text-slate-800">{record.commodity} - {record.market}</span>
                                    <span className="font-extrabold text-[10px] text-green-600">₹{record.modal_price} / Qtl</span>
                                  </div>
                                  <div className="flex justify-between text-[8px] text-slate-500 font-bold">
                                    <span>{record.district}</span>
                                    <span>{record.arrival_date}</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex justify-between items-start">
                                    <span className="font-bold text-[10px] text-slate-800">{record.hospital_name}</span>
                                    <span className="font-bold text-[8px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">{record.type}</span>
                                  </div>
                                  <div className="text-[9px] text-slate-500 leading-tight mt-0.5">{record.address}, {record.district} - {record.pincode}</div>
                                  {record.mobile_number && <div className="text-[8px] font-bold text-slate-600 mt-1 flex items-center gap-1"><Phone className="w-2.5 h-2.5"/> {record.mobile_number}</div>}
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[9px] text-slate-500 text-center py-2">{isHi ? "कोई डेटा नहीं मिला।" : "No data available."}</p>
                      )}
                    </div>
                  )}

                  {/* Standard features */}
                  {localFeatures.map((item, i) => (`
code = code.replace(uiInjectionPoint, govUI);

fs.writeFileSync('src/pages/Services.tsx', code);
console.log("Services.tsx patched with Data.gov.in UI");
