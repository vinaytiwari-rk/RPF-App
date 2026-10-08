import React, { useState, useEffect } from "react";
import axios from "axios";
import { Save, CheckCircle, Compass, ShieldCheck, Heart, Users, Landmark, AlertCircle, Edit, ExternalLink, Globe } from "lucide-react";
import toast from "react-hot-toast";

type ServiceItem = {
  id: string;
  category: string;
  iconName: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  hidden: boolean;
};

export default function ExploreStudio() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "welfare" | "urgent" | "involved" | "civic">("all");
  const [selectedItem, setSelectedItem] = useState<ServiceItem | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/services");
      if (res.data?.data) {
        setServices(res.data.data);
      }
    } catch (e) {
      toast.error("Failed to load CMS data");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (service: ServiceItem) => {
    const nextHidden = !service.hidden;
    const toastId = toast.loading(nextHidden ? "Hiding service..." : "Publishing service...");
    try {
      const token = localStorage.getItem("token") || "";
      const res = await axios.post(
        `/api/admin/services/${service.id}/visibility`,
        { hidden: nextHidden },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setServices(services.map(s => s.id === service.id ? { ...s, hidden: nextHidden } : s));
        if (selectedItem?.id === service.id) setSelectedItem({ ...selectedItem, hidden: nextHidden });
        toast.success(nextHidden ? "Service Hidden" : "Service Active", { id: toastId });
      } else {
        toast.error("Failed to update visibility", { id: toastId });
      }
    } catch (e) {
      toast.error("Error saving changes", { id: toastId });
    }
  };

  const filteredServices = services.filter((s) => {
    if (activeTab === "all") return true;
    return s.category === activeTab;
  });

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 space-y-6">
      
      {/* Header matching the screenshot design */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-50 text-indigo-500">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-indigo-500">Services & Integrations CMS</p>
            <h1 className="text-xl md:text-2xl font-black text-slate-800">Explore & Services Management</h1>
            <p className="text-xs text-slate-500 mt-1">
              Toggle all public services, welfare schemes, and emergency tools from here.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[75vh]">
        {/* Left List */}
        <div className="w-full lg:w-5/12 xl:w-1/3 flex flex-col space-y-4">
          <div className="flex flex-wrap gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <button 
              onClick={() => setActiveTab("all")}
              className={`flex-1 min-w-[70px] text-xs font-bold py-2 rounded-lg transition-colors ${activeTab === "all" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveTab("welfare")}
              className={`flex-1 min-w-[70px] text-xs font-bold py-2 rounded-lg transition-colors ${activeTab === "welfare" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
            >
              Welfare
            </button>
            <button 
              onClick={() => setActiveTab("urgent")}
              className={`flex-1 min-w-[70px] text-xs font-bold py-2 rounded-lg transition-colors ${activeTab === "urgent" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
            >
              Urgent
            </button>
            <button 
              onClick={() => setActiveTab("involved")}
              className={`flex-1 min-w-[70px] text-xs font-bold py-2 rounded-lg transition-colors ${activeTab === "involved" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
            >
              Involved
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {loading ? (
              <p className="text-center text-sm text-slate-400 py-10">Loading services...</p>
            ) : (
              filteredServices.map((service) => (
                <div 
                  key={service.id} 
                  onClick={() => setSelectedItem(service)}
                  className={`bg-white p-3 rounded-xl border transition-all cursor-pointer hover:border-slate-300 hover:shadow-md ${selectedItem?.id === service.id ? "border-indigo-500 shadow-sm ring-1 ring-indigo-500" : "border-slate-200 shadow-sm"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center text-indigo-600 bg-indigo-50 border border-indigo-100">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded text-white bg-indigo-500">
                          {service.category}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                          ID: {service.id}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-800 truncate mb-1">{service.titleEn}</h3>
                      <p className="text-[10px] text-slate-500 truncate mb-2">{service.descEn}</p>
                      
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                        <button className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800">
                          <Edit className="h-3 w-3" /> View Details
                        </button>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${!service.hidden ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-50 text-slate-500 border border-slate-200"}`}>
                          <CheckCircle className="h-3 w-3" /> {!service.hidden ? "Active" : "Hidden"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="hidden lg:flex flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-col">
          {selectedItem ? (
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-black text-slate-800">{selectedItem.titleEn}</h2>
                  <p className="text-sm font-semibold text-slate-500">{selectedItem.titleHi}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100">
                  <Globe className="h-6 w-6" />
                </div>
              </div>
              
              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Service Identity (Hardcoded in Core)</h4>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">English Desc</p>
                      <p className="text-xs font-semibold text-slate-700">{selectedItem.descEn}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Hindi Desc</p>
                      <p className="text-xs font-semibold text-slate-700">{selectedItem.descHi}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Category</p>
                      <p className="text-xs font-semibold text-slate-700">{selectedItem.category}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Public Visibility</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Show this service in the public 'Explore' page.</p>
                  </div>
                  <button 
                    onClick={() => handleToggleVisibility(selectedItem)}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg transition-all shadow-sm ${!selectedItem.hidden ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}
                  >
                    {!selectedItem.hidden ? <><CheckCircle className="h-4 w-4" /> Service is Live</> : <><AlertCircle className="h-4 w-4" /> Service Hidden</>}
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <div className="text-xs">
                      <strong className="block mb-1">Notice regarding internal content</strong>
                      To update internal rich text or external links for this specific module, navigate to the service page inside the public app as an administrator and click the "Edit Content" floating button.
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50">
              <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400 mb-4 shadow-sm border border-indigo-100">
                <Compass className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-black text-slate-800">Select a Service from the left list</h2>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                Manage public visibility and category mapping for services.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
