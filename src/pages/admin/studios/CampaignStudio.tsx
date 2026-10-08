import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  HeartHandshake,
  DollarSign,
  Layers,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  FolderPlus,
  CreditCard,
  User,
  Calendar,
  Eye,
  EyeOff,
  TrendingUp,
  Download
} from "lucide-react";
import toast from "react-hot-toast";

type SubSection = "campaigns" | "donations" | "directory";

interface CampaignItem {
  id: string | number;
  titleEn?: string;
  titleHi?: string;
  title?: string;
  description?: string;
  goalAmount?: number;
  raisedAmount?: number;
  created_at?: string;
}

interface DonationRecord {
  id: string | number;
  donor_name?: string;
  amount?: number;
  payment_method?: string;
  campaign_id?: string | number;
  status?: string;
  created_at?: string;
}

interface DirectoryEntry {
  id: string | number;
  name: string;
  category: string;
  contact?: string;
  status: string;
  created_at?: string;
}

export default function CampaignStudio() {
  const [activeTab, setActiveTab] = useState<SubSection>("campaigns");
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [search, setSearch] = useState("");

  // Data Collections
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [directory, setDirectory] = useState<DirectoryEntry[]>([]);

  // Selected item for right inspector
  const [selectedItem, setSelectedItem] = useState<{
    type: SubSection;
    data: any;
  } | null>(null);

  const token = localStorage.getItem("token") || "";
  const authHeader = useCallback(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = authHeader();
      const [campRes, donRes, dirRes] = await Promise.allSettled([
        axios.get("/api/admin/campaigns", { headers, timeout: 8000 }),
        axios.get("/api/admin/donations", { headers, timeout: 8000 }),
        axios.get("/api/admin/directory", { headers, timeout: 8000 }),
      ]);

      if (campRes.status === "fulfilled" && campRes.value.data?.data) {
        setCampaigns(campRes.value.data.data);
      }
      if (donRes.status === "fulfilled" && donRes.value.data?.data) {
        setDonations(donRes.value.data.data);
      }
      if (dirRes.status === "fulfilled" && dirRes.value.data?.data) {
        setDirectory(dirRes.value.data.data);
      }
    } catch {
      toast.error("Failed to load campaign records");
    } finally {
      setLoading(false);
    }
  }, [token, authHeader]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Create Campaign
  const handleCreateCampaign = async () => {
    const title = window.prompt("Enter new Campaign Title:");
    if (!title || !title.trim()) return;
    const goalStr = window.prompt("Enter Target Goal Amount (INR):", "50000");
    const goalAmount = parseInt(goalStr || "50000", 10) || 50000;

    setActionBusy(true);
    const toastId = toast.loading("Launching new foundation campaign...");
    try {
      const res = await axios.post(
        "/api/admin/campaigns",
        { title: title.trim(), description: "Community welfare initiative", goalAmount, raisedAmount: 0 },
        { headers: authHeader() }
      );
      if (res.data?.success) {
        toast.success("Campaign created successfully!", { id: toastId });
        await fetchData();
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to create campaign", { id: toastId });
    } finally {
      setActionBusy(false);
    }
  };

  // Delete Campaign
  const handleDeleteCampaign = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    setActionBusy(true);
    const toastId = toast.loading("Deleting campaign...");
    try {
      await axios.delete(`/api/admin/campaigns/${id}`, { headers: authHeader() });
      toast.success("Campaign deleted", { id: toastId });
      setCampaigns(prev => prev.filter(c => c.id !== id));
      if (selectedItem?.data?.id === id) setSelectedItem(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Delete failed", { id: toastId });
    } finally {
      setActionBusy(false);
    }
  };

  // Create Directory Entry
  const handleCreateDirectoryEntry = async () => {
    const name = window.prompt("Enter Organization / Service Name:");
    if (!name || !name.trim()) return;
    const category = window.prompt("Enter Category (e.g. Healthcare, Education, Emergency, NGO):", "Emergency");
    const contact = window.prompt("Enter Helpline Contact / Phone:", "112");

    setActionBusy(true);
    const toastId = toast.loading("Adding directory helpline...");
    try {
      const res = await axios.post(
        "/api/admin/directory",
        { name: name.trim(), category: category?.trim() || "General", contact: contact?.trim() || "", status: "active" },
        { headers: authHeader() }
      );
      if (res.data?.success) {
        toast.success("Directory entry added!", { id: toastId });
        await fetchData();
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to add entry", { id: toastId });
    } finally {
      setActionBusy(false);
    }
  };

  // Delete Directory Entry
  const handleDeleteDirectoryEntry = async (id: string | number) => {
    if (!window.confirm("Delete this directory contact?")) return;
    setActionBusy(true);
    const toastId = toast.loading("Removing directory entry...");
    try {
      await axios.delete(`/api/admin/directory/${id}`, { headers: authHeader() });
      toast.success("Entry removed", { id: toastId });
      setDirectory(prev => prev.filter(d => d.id !== id));
      if (selectedItem?.data?.id === id) setSelectedItem(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Delete failed", { id: toastId });
    } finally {
      setActionBusy(false);
    }
  };

  // Export Donations CSV
  const exportDonationsCsv = () => {
    if (!donations.length) return toast("No donations available to export.");
    const headers = ["ID", "Donor Name", "Amount", "Method", "Campaign ID", "Status", "Date"].join(",");
    const rows = donations.map(d =>
      [
        d.id,
        `"${(d.donor_name || "Anonymous").replace(/"/g, '""')}"`,
        d.amount || 0,
        `"${(d.payment_method || "Online").replace(/"/g, '""')}"`,
        d.campaign_id || "",
        d.status || "Completed",
        `"${d.created_at || ""}"`
      ].join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `rpf_donations_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Donations exported as CSV!");
  };

  // Filter current tab items
  const filteredCampaigns = campaigns.filter(c =>
    (c.title || c.titleEn || c.titleHi || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredDonations = donations.filter(d =>
    (d.donor_name || "").toLowerCase().includes(search.toLowerCase()) ||
    String(d.amount || "").includes(search)
  );

  const filteredDirectory = directory.filter(dir =>
    dir.name.toLowerCase().includes(search.toLowerCase()) ||
    dir.category.toLowerCase().includes(search.toLowerCase()) ||
    (dir.contact || "").includes(search)
  );

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 space-y-6">
      {/* HEADER MATCHING CMS DESIGN */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-700">
                Phase 6 Studio
              </span>
              <span className="text-xs text-slate-400">Crowdfunding, Philanthropy & Community Network</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 mt-1">Campaigns, Donations & Directory</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Launch fund drives, monitor real-time contributions, and manage community helpline contacts.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === "campaigns" && (
            <button
              onClick={handleCreateCampaign}
              disabled={actionBusy}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition shadow-xs"
            >
              <Plus className="h-4 w-4" /> Launch Campaign
            </button>
          )}
          {activeTab === "donations" && (
            <button
              onClick={exportDonationsCsv}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
            >
              <Download className="h-4 w-4" /> Export Ledger CSV
            </button>
          )}
          {activeTab === "directory" && (
            <button
              onClick={handleCreateDirectoryEntry}
              disabled={actionBusy}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition shadow-xs"
            >
              <Plus className="h-4 w-4" /> Add Directory Entry
            </button>
          )}
          <button
            onClick={() => void fetchData()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* THREE STUDIO TABS */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => { setActiveTab("campaigns"); setSelectedItem(null); }}
          className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2 ${
            activeTab === "campaigns" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <TrendingUp className="h-4 w-4" /> Welfare Campaigns ({campaigns.length})
        </button>
        <button
          onClick={() => { setActiveTab("donations"); setSelectedItem(null); }}
          className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2 ${
            activeTab === "donations" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <DollarSign className="h-4 w-4" /> Donation Records ({donations.length})
        </button>
        <button
          onClick={() => { setActiveTab("directory"); setSelectedItem(null); }}
          className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2 ${
            activeTab === "directory" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layers className="h-4 w-4" /> Civil & NGO Directory ({directory.length})
        </button>
      </div>

      {/* SPLIT PANE MAIN CONTAINER */}
      <div className="flex flex-col lg:flex-row gap-6 h-[72vh]">
        {/* LEFT COLUMN: LIST */}
        <div className="w-full lg:w-5/12 xl:w-5/12 flex flex-col space-y-3">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-400 text-xs">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Loading records...
              </div>
            ) : (
              <>
                {activeTab === "campaigns" && (
                  filteredCampaigns.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-10">No campaigns found.</p>
                  ) : (
                    filteredCampaigns.map(c => {
                      const isSelected = selectedItem?.data?.id === c.id;
                      const title = c.title || c.titleEn || c.titleHi || "Untitled Campaign";
                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedItem({ type: "campaigns", data: c })}
                          className={`bg-white p-3.5 rounded-xl border transition cursor-pointer hover:border-slate-300 ${
                            isSelected ? "border-emerald-500 ring-1 ring-emerald-500 shadow-xs" : "border-slate-200"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-xs font-bold text-slate-800 truncate">{title}</h4>
                            <span className="text-[10px] font-black font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              Goal: ?{Number(c.goalAmount || 0).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{c.description || "Active initiative"}</p>
                        </div>
                      );
                    })
                  )
                )}

                {activeTab === "donations" && (
                  filteredDonations.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-10">No donations recorded yet.</p>
                  ) : (
                    filteredDonations.map(d => {
                      const isSelected = selectedItem?.data?.id === d.id;
                      return (
                        <div
                          key={d.id}
                          onClick={() => setSelectedItem({ type: "donations", data: d })}
                          className={`bg-white p-3.5 rounded-xl border transition cursor-pointer hover:border-slate-300 ${
                            isSelected ? "border-emerald-500 ring-1 ring-emerald-500 shadow-xs" : "border-slate-200"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-xs font-bold text-slate-800 truncate">{d.donor_name || "Anonymous Donor"}</h4>
                            <span className="text-xs font-black font-mono text-emerald-600">
                              +?{Number(d.amount || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>{d.payment_method || "Online"}</span>
                            <span>{d.created_at ? new Date(d.created_at).toLocaleDateString() : ""}</span>
                          </div>
                        </div>
                      );
                    })
                  )
                )}

                {activeTab === "directory" && (
                  filteredDirectory.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-10">No directory contacts found.</p>
                  ) : (
                    filteredDirectory.map(dir => {
                      const isSelected = selectedItem?.data?.id === dir.id;
                      return (
                        <div
                          key={dir.id}
                          onClick={() => setSelectedItem({ type: "directory", data: dir })}
                          className={`bg-white p-3.5 rounded-xl border transition cursor-pointer hover:border-slate-300 ${
                            isSelected ? "border-emerald-500 ring-1 ring-emerald-500 shadow-xs" : "border-slate-200"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-xs font-bold text-slate-800 truncate">{dir.name}</h4>
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {dir.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono">{dir.contact || "No phone listed"}</p>
                        </div>
                      );
                    })
                  )
                )}
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: INSPECTOR */}
        <div className="hidden lg:flex flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-col">
          {selectedItem ? (
            <div className="p-6 h-full flex flex-col justify-between overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                      {selectedItem.type === "campaigns" && <TrendingUp className="h-6 w-6" />}
                      {selectedItem.type === "donations" && <DollarSign className="h-6 w-6" />}
                      {selectedItem.type === "directory" && <Layers className="h-6 w-6" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                        {selectedItem.type} Record
                      </span>
                      <h2 className="text-lg font-black text-slate-800">
                        {selectedItem.data.title || selectedItem.data.titleEn || selectedItem.data.donor_name || selectedItem.data.name}
                      </h2>
                    </div>
                  </div>
                  {selectedItem.type === "campaigns" && (
                    <button
                      onClick={() => handleDeleteCampaign(selectedItem.data.id)}
                      disabled={actionBusy}
                      className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                      title="Delete Campaign"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  {selectedItem.type === "directory" && (
                    <button
                      onClick={() => handleDeleteDirectoryEntry(selectedItem.data.id)}
                      disabled={actionBusy}
                      className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                      title="Delete Contact"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Campaign Detail */}
                {selectedItem.type === "campaigns" && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Target Goal</p>
                        <p className="text-base font-black text-slate-800 font-mono">
                          ?{Number(selectedItem.data.goalAmount || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Description</p>
                        <p className="text-xs text-slate-700 leading-relaxed mt-1">
                          {selectedItem.data.description || "Public charity campaign."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Donation Detail */}
                {selectedItem.type === "donations" && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Amount Received</p>
                        <p className="text-lg font-black text-emerald-600 font-mono">
                          ?{Number(selectedItem.data.amount || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Transaction Status</p>
                        <p className="text-xs font-bold text-slate-800">
                          {selectedItem.data.status || "Completed"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Payment Gateway</p>
                        <p className="text-xs font-semibold text-slate-800">
                          {selectedItem.data.payment_method || "UPI / Razorpay"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Received Timestamp</p>
                        <p className="text-xs font-semibold text-slate-800">
                          {selectedItem.data.created_at ? new Date(selectedItem.data.created_at).toLocaleString() : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Directory Detail */}
                {selectedItem.type === "directory" && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Helpline Category</p>
                        <p className="text-xs font-bold text-slate-800">{selectedItem.data.category}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Direct Contact Phone</p>
                        <p className="text-sm font-black font-mono text-indigo-600">{selectedItem.data.contact || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-4 text-xs text-slate-400">
                All crowdfunding and directory changes are published live to public donation pages.
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50">
              <div className="h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 shadow-xs border border-emerald-100">
                <HeartHandshake className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-black text-slate-800">Select an item to view details</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Review verified public campaigns, financial transactions, and civic directory contacts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
