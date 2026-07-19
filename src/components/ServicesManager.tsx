// src/components/ServicesManager.tsx
// ─── Kept for backward compatibility. The full admin UI now lives in AdminDashboard.tsx ───
import React, { useEffect, useState } from "react";
// Replaced Firebase with backend API proxy calls

interface ServiceConfig {
  name: string;
  enabled: boolean;
}

export default function ServicesManager() {
  const [services, setServices] = useState<ServiceConfig[]>([]);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        const status = data.settings?.servicesStatus || {};
        const configs: ServiceConfig[] = Object.keys(status).map((k) => ({
          name: k,
          enabled: !!status[k],
        }));
        setServices(configs);
      });
  }, []);

  const toggleService = async (name: string, enabled: boolean) => {
    try {
      const res = await fetch("/api/settings");
      const current = await res.json();
      const currentStatus = current.settings?.servicesStatus || {};
      const newStatus = { ...currentStatus, [name]: enabled };
      
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servicesStatus: newStatus }),
      });
      
      setServices(prev => prev.map(s => s.name === name ? { ...s, enabled } : s));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Services Manager</h2>
      <ul className="space-y-2">
        {services.map((svc) => (
          <li key={svc.name} className="flex items-center justify-between">
            <span>{svc.name}</span>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-indigo-600"
                checked={svc.enabled}
                onChange={(e) => toggleService(svc.name, e.target.checked)}
              />
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
