import React, { useMemo, useState } from "react";
import {
  Building2,
  HeartPulse,
  BriefcaseBusiness,
  Landmark,
  Search,
  Users,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type Lang = "en" | "hi";

type ServiceItem = {
  id: string;
  labelEn: string;
  labelHi: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
};

const SERVICES: ServiceItem[] = [
  { id: "gov", labelEn: "Government Services", labelHi: "सरकारी सेवाएं", route: "/services", icon: Landmark },
  { id: "health", labelEn: "Health Support", labelHi: "स्वास्थ्य सहायता", route: "/health-care", icon: HeartPulse },
  { id: "employment", labelEn: "Employment", labelHi: "रोजगार", route: "/employment", icon: BriefcaseBusiness },
  { id: "volunteer", labelEn: "Volunteer", labelHi: "वॉलंटियर", route: "/volunteer", icon: Users },
  { id: "jan-seva", labelEn: "Jan Seva Card", labelHi: "जन सेवा कार्ड", route: "/jan-seva-card", icon: Building2 },
];

export default function ServiceDiscoveryRail({ lang }: { lang: Lang }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const hi = lang === "hi";

  const visibleServices = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return SERVICES;
    return SERVICES.filter((service) =>
      `${service.labelEn} ${service.labelHi}`.toLowerCase().includes(needle)
    );
  }, [query]);

  return (
    <section className="mt-5 space-y-3" aria-label={hi ? "सेवा खोज" : "Service discovery"}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-wide text-slate-900 uppercase">
            {hi ? "सेवाएं खोजें" : "Find a Service"}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {hi ? "सरकारी सेवाएं पहले, फिर आरपीएफ सहायता" : "Government services first, then RPF support"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/services")}
          className="min-h-11 inline-flex items-center gap-1 rounded-xl px-3 text-xs font-bold text-[#D97706] hover:bg-orange-50"
        >
          {hi ? "सभी" : "All"} <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <label className="flex min-h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 shadow-sm focus-within:border-[#FF9933] focus-within:ring-2 focus-within:ring-orange-100">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={hi ? "सेवा खोजें" : "Search services"}
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />
      </label>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {visibleServices.map((service) => {
          const Icon = service.icon;
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => navigate(service.route)}
              className="min-h-20 min-w-28 shrink-0 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
              <Icon className="h-5 w-5 text-[#D97706]" />
              <span className="mt-2 block text-[11px] font-bold leading-snug text-slate-800">
                {hi ? service.labelHi : service.labelEn}
              </span>
            </button>
          );
        })}
        {visibleServices.length === 0 && (
          <p className="px-3 py-4 text-sm text-slate-500">
            {hi ? "कोई सेवा नहीं मिली" : "No service found"}
          </p>
        )}
      </div>
    </section>
  );
}
