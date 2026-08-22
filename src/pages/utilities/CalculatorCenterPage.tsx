import React, { useMemo, useState } from "react";
import { Calculator, ChevronRight, HeartPulse, Wallet, Brain, Clock3, House, Ruler, Wifi, CloudSun, Car, Smile, Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Shell from "./UtilityPageShell";
import { openExternalLink } from "../../utils/browser";

type Item = { id: string; title: string; desc: string };
type Group = { id: string; title: string; icon: React.ElementType; items: Item[] };

const ALL_CATEGORY = "all";

const toItems = (titles: string[], desc: string): Item[] =>
  titles.map((title) => ({
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    title,
    desc,
  }));

const groups: Group[] = [
  { id: "health", title: "Health & Fitness", icon: HeartPulse, items: toItems(["BMI Calculator", "Calorie Calculator", "Body Fat Calculator", "BMR Calculator", "Ideal Weight Calculator", "Pace Calculator", "Lean Body Mass Calculator", "Healthy Weight Calculator", "Calories Burned Calculator", "One Rep Max Calculator", "Target Heart Rate Calculator", "Macro Calculator", "Protein Calculator", "TDEE Calculator", "Body Surface Area Calculator", "GFR / eGFR Calculator", "Pregnancy Calculator", "Due Date Calculator", "Ovulation Calculator", "Period Calculator", "Sleep Health Calculator", "Blood Pressure Analyzer", "Heart Risk Calculator", "Diabetes Risk Score", "HbA1c Converter", "Body Age Calculator", "IT Employee Health Risk"], "Health awareness and estimation tool") },
  { id: "finance", title: "Financial Calculators", icon: Wallet, items: toItems(["Mortgage Calculator", "Loan Calculator", "Auto Loan Calculator", "Interest Calculator", "Investment Calculator", "Compound Interest Calculator", "Savings Calculator", "Retirement Calculator", "Pension Calculator", "Annuity Calculator", "Income Tax Calculator", "Salary Calculator", "Take-Home Pay Calculator", "Currency Calculator", "Inflation Calculator", "Credit Card Calculator", "Debt Payoff Calculator", "Student Loan Calculator", "VAT Calculator", "Depreciation Calculator", "Margin Calculator", "Discount Calculator", "Business Loan Calculator", "Personal Loan Calculator", "Budget Calculator", "Commission Calculator", "ROI Calculator", "IRR Calculator", "Future Value Calculator", "Present Value Calculator"], "Financial planning calculator") },
  { id: "math", title: "Math & Science", icon: Brain, items: toItems(["Scientific Calculator", "Fraction Calculator", "Percentage Calculator", "Random Number Generator", "Percent Error Calculator", "Exponent Calculator", "Binary Calculator", "Hex Calculator", "Half-Life Calculator", "Quadratic Formula Calculator", "Log Calculator", "Ratio Calculator", "Root Calculator", "LCM Calculator", "GCF Calculator", "Factor Calculator", "Rounding Calculator", "Matrix Calculator", "Scientific Notation Calculator", "Big Number Calculator", "Standard Deviation Calculator", "Probability Calculator", "Statistics Calculator", "Mean Median Mode Range", "Permutation & Combination", "Z-Score Calculator", "Confidence Interval Calculator", "Triangle Calculator", "Volume Calculator", "Slope Calculator", "Area Calculator", "Distance Calculator", "Circle Calculator", "Surface Area Calculator", "Pythagorean Theorem", "Right Triangle Calculator"], "Math and science utility") },
  { id: "date", title: "Date & Time", icon: Clock3, items: toItems(["Age Calculator", "Date Calculator", "Time Calculator", "Hours Calculator", "Time Card Calculator", "Time Zone Calculator", "Time Duration Calculator", "Day Counter", "Day of the Week Calculator"], "Date and time calculation") },
  { id: "home", title: "Home & Building", icon: House, items: toItems(["Concrete Calculator", "BTU Calculator", "Square Footage Calculator", "Stair Calculator", "Roofing Calculator", "Tile Calculator", "Mulch Calculator", "Gravel Calculator"], "Home and construction estimate") },
  { id: "measure", title: "Measurements & Units", icon: Ruler, items: toItems(["Height Calculator", "Conversion Calculator", "GDP Calculator", "Density Calculator", "Mass Calculator", "Weight Calculator", "Speed Calculator", "Molarity Calculator", "Molecular Weight Calculator", "Roman Numeral Converter"], "Measurement and conversion tool") },
  { id: "internet", title: "Internet Tools", icon: Wifi, items: toItems(["IP Subnet Calculator", "Password Generator", "Bandwidth Calculator", "Base64 Encode / Decode", "URL Encode / Decode"], "Internet utility") },
  { id: "weather", title: "Weather", icon: CloudSun, items: toItems(["Wind Chill Calculator", "Heat Index Calculator", "Dew Point Calculator"], "Weather calculation") },
  { id: "transport", title: "Transportation", icon: Car, items: toItems(["Fuel Cost Calculator", "Gas Mileage Calculator", "Horsepower Calculator", "Engine Horsepower Calculator", "Mileage Calculator", "Tire Size Calculator"], "Vehicle and travel calculation") },
  { id: "everyday", title: "Everyday Utility", icon: Smile, items: toItems(["GPA Calculator", "Grade Calculator", "Shoe Size Conversion", "Tip Calculator", "Golf Handicap Calculator", "Sleep Calculator", "GST Calculator", "Split Bill"], "Everyday quick calculation") },
];

const special: Record<string, string> = {
  "gfr-e-gfr-calculator": "gfr-calculator",
  "sleep-health-calculator": "sleep-calculator",
  "hba1c-converter": "hba1c-converter",
};

const calculatorUrl = (id: string) =>
  `https://www.calculator.net/${special[id] || id}.html`;

export default function CalculatorCenterPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORY);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return groups
      .filter((group) => category === ALL_CATEGORY || group.id === category)
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          needle.length === 0 || item.title.toLowerCase().includes(needle),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [category, query]);

  const total = filtered.reduce(
    (sum, group) => sum + group.items.length,
    0,
  );

  const openCalculator = (id: string) => {
    if (id === "bmi-calculator") {
      navigate("/utilities/bmi-calculator");
      return;
    }
    if (id === "gst-calculator") {
      navigate("/utilities/gst-calculator");
      return;
    }
    if (id === "split-bill") {
      navigate("/utilities/split-bill");
      return;
    }
    void openExternalLink(calculatorUrl(id), navigate, "Calculator");
  };

  const resetFilters = () => {
    setQuery("");
    setCategory(ALL_CATEGORY);
  };

  return (
    <Shell
      title="Calculator Center"
      icon={<Calculator className="h-4 w-4" />}
      onBack={() => navigate("/tools")}
    >
      <div className="space-y-5">
        <section className="rounded-3xl bg-[#07133d] p-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#FF9933]">
                Smart utilities
              </p>
              <h2 className="mt-2 text-xl font-black">Find the right calculator</h2>
              <p className="mt-1 text-xs leading-5 text-white/65">
                Search by task or browse a category. External calculators open inside Samahit.
              </p>
            </div>
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10">
              <Sparkles className="h-5 w-5 text-[#FF9933]" />
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-white/55">
            <span className="h-2 w-2 rounded-full bg-[#FF9933]" />
            {total} available in this view
          </div>
        </section>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search any calculator..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pl-11 text-sm font-medium outline-none transition focus:border-[#07133d] focus:bg-white"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCategory(ALL_CATEGORY)}
            className={`whitespace-nowrap rounded-full px-4 py-2.5 text-[11px] font-black ${category === ALL_CATEGORY ? "bg-[#07133d] text-white" : "border border-slate-200 bg-white text-slate-500"}`}
          >
            All
          </button>
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => setCategory(group.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2.5 text-[11px] font-black ${category === group.id ? "bg-[#07133d] text-white" : "border border-slate-200 bg-white text-slate-500"}`}
            >
              {group.title}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
            <Search className="mx-auto h-7 w-7 text-slate-300" />
            <p className="mt-3 text-sm font-black text-slate-600">No calculator found</p>
            <button onClick={resetFilters} className="mt-3 text-xs font-black text-[#07133d]">
              Clear filters
            </button>
          </div>
        ) : (
          filtered.map((group) => {
            const Icon = group.icon;

            return (
              <section key={group.id} className="space-y-2.5">
                <div className="flex items-center gap-2 px-1">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-[#07133d]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h2 className="font-black text-[#07133d]">{group.title}</h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-400">
                    {group.items.length}
                  </span>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => openCalculator(item.id)}
                      className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition active:scale-[.99]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-black text-[#07133d]">
                          {item.title}
                        </div>
                        <div className="mt-1 text-[11px] leading-4 text-slate-500">
                          {item.desc}
                        </div>
                      </div>
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-50 text-slate-300">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            );
          })
        )}

        <p className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
          Health calculators are for awareness and estimation only. They do not diagnose disease or replace a qualified healthcare professional.
        </p>
      </div>
    </Shell>
  );
}
