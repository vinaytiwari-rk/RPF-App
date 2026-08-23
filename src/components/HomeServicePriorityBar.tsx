import { Building2, HeartHandshake, PhoneCall, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomeServicePriorityBar() {
  const navigate = useNavigate();
  const { language } = useAuth();
  const hi = language === "hi";

  const items = [
    { label: hi ? "सरकारी सेवाएं" : "Government Services", icon: Building2, route: "/services" },
    { label: hi ? "जन सेवा कार्ड" : "Jan Seva Card", icon: HeartHandshake, route: "/jan-seva-card" },
    { label: hi ? "खोजें" : "Search", icon: Search, route: "/services" },
  ];

  return (
    <section className="border-b border-[var(--rpf-border)] bg-[var(--rpf-surface)] px-3 py-2.5" aria-label={hi ? "मुख्य सेवाएं" : "Primary services"}>
      <div className="mx-auto flex max-w-3xl items-center gap-2 overflow-x-auto [scrollbar-width:none]">
        {items.map(({ label, icon: Icon, route }) => (
          <button
            key={route + label}
            type="button"
            onClick={() => navigate(route)}
            className="rpf-service-priority shrink-0"
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
        <a className="rpf-service-priority rpf-helpline shrink-0" href="tel:112" aria-label={hi ? "आपातकालीन सहायता 112" : "Emergency helpline 112"}>
          <PhoneCall aria-hidden="true" className="h-4 w-4" />
          <span>{hi ? "आपातकाल 112" : "Emergency 112"}</span>
        </a>
      </div>
    </section>
  );
}
