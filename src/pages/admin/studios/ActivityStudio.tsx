import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Activity,
  ClipboardList,
  Users,
  CreditCard,
  Droplet,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Trash2,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  FileText,
  UserCheck,
  Shield,
  Eye,
  Check,
  X,
  ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";

type ApprovalCategory = "all" | "grievances" | "volunteers" | "cards" | "blood";

interface GrievanceItem {
  id: string | number;
  name?: string;
  citizenName?: string;
  phone?: string;
  category?: string;
  description?: string;
  status: string;
  created_at?: string;
  createdAt?: string;
}

interface VolunteerItem {
  id: string | number;
  name?: string;
  full_name?: string;
  mobile?: string;
  email?: string;
  status: string;
  registration_number?: string;
  createdAt?: string;
}

interface CardApplicationItem {
  id: string;
  userId?: string;
  name?: string;
  status: string;
  cardNo?: string;
  idType?: string;
  idNumber?: string;
  gender?: string;
  address?: string;
  submittedAt?: string;
  created_at?: string;
}

interface BloodDonorItem {
  id: string | number;
  name?: string;
  blood_group?: string;
  mobile?: string;
  city?: string;
  created_at?: string;
}

export default function ActivityStudio() {
  const [activeCategory, setActiveCategory] = useState<ApprovalCategory>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "resolved" | "approved" | "rejected">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);

  // Entities
  const [grievances, setGrievances] = useState<GrievanceItem[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerItem[]>([]);
  const [cards, setCards] = useState<CardApplicationItem[]>([]);
  const [bloodDonors, setBloodDonors] = useState<BloodDonorItem[]>([]);

  // Selected item for split-pane review
  const [selectedItem, setSelectedItem] = useState<{
    type: "grievance" | "volunteer" | "card" | "blood";
    data: any;
  } | null>(null);

  const token = localStorage.getItem("token") || "";

  const fetchData = useCallback(async () => {
    setLoading(true);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const [grievanceRes, volRes, cardsRes, bloodRes] = await Promise.allSettled([
        axios.get("/api/admin/grievances", { headers, timeout: 8000 }),
        axios.get("/api/admin/volunteers", { headers, timeout: 8000 }),
        axios.get("/api/admin/jan-seva-cards", { headers, timeout: 8000 }),
        axios.get("/api/admin/blood_donors", { headers, timeout: 8000 }),
      ]);

      if (grievanceRes.status === "fulfilled" && grievanceRes.value.data?.data) {
        setGrievances(grievanceRes.value.data.data);
      }
      if (volRes.status === "fulfilled" && volRes.value.data?.data) {
        setVolunteers(volRes.value.data.data);
      }
      if (cardsRes.status === "fulfilled" && cardsRes.value.data?.data) {
        setCards(cardsRes.value.data.data);
      }
      if (bloodRes.status === "fulfilled" && bloodRes.value.data?.data) {
        setBloodDonors(bloodRes.value.data.data);
      }
    } catch {
      toast.error("Failed to load activity queue");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Action handlers
  const handleUpdateGrievance = async (id: string | number, status: string) => {
    setActionBusy(true);
    const toastId = toast.loading(`Updating grievance to ${status}...`);
    try {
      await axios.put(
        `/api/admin/grievances/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Grievance marked as ${status}`, { id: toastId });
      setGrievances(prev => prev.map(g => (g.id === id ? { ...g, status } : g)));
      if (selectedItem?.data?.id === id) {
        setSelectedItem(prev => prev ? { ...prev, data: { ...prev.data, status } } : null);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Update failed", { id: toastId });
    } finally {
      setActionBusy(false);
    }
  };

  const handleUpdateVolunteer = async (id: string | number, status: string) => {
    setActionBusy(true);
    const toastId = toast.loading(`Updating volunteer to ${status}...`);
    try {
      await axios.put(
        `/api/admin/volunteers/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Volunteer status: ${status}`, { id: toastId });
      setVolunteers(prev => prev.map(v => (v.id === id ? { ...v, status } : v)));
      if (selectedItem?.data?.id === id) {
        setSelectedItem(prev => prev ? { ...prev, data: { ...prev.data, status } } : null);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Update failed", { id: toastId });
    } finally {
      setActionBusy(false);
    }
  };

  const handleApproveCard = async (userId: string, cardNo?: string) => {
    setActionBusy(true);
    const generatedNo = cardNo || `RPF-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const toastId = toast.loading("Approving Jan Seva Card...");
    try {
      await axios.post(
        "/api/cards/approve",
        { userId, cardNo: generatedNo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Card ${generatedNo} Approved & Issued!`, { id: toastId });
      setCards(prev => prev.map(c => ((c.userId === userId || c.id === userId) ? { ...c, status: "approved", cardNo: generatedNo } : c)));
      if (selectedItem?.data?.userId === userId || selectedItem?.data?.id === userId) {
        setSelectedItem(prev => prev ? { ...prev, data: { ...prev.data, status: "approved", cardNo: generatedNo } } : null);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Card approval failed", { id: toastId });
    } finally {
      setActionBusy(false);
    }
  };

  const handleRejectCard = async (userId: string) => {
    setActionBusy(true);
    const toastId = toast.loading("Rejecting Card Application...");
    try {
      await axios.post(
        "/api/cards/reject",
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Card Application Rejected", { id: toastId });
      setCards(prev => prev.map(c => ((c.userId === userId || c.id === userId) ? { ...c, status: "rejected" } : c)));
      if (selectedItem?.data?.userId === userId || selectedItem?.data?.id === userId) {
        setSelectedItem(prev => prev ? { ...prev, data: { ...prev.data, status: "rejected" } } : null);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Rejection failed", { id: toastId });
    } finally {
      setActionBusy(false);
    }
  };

  // Build unified item list
  const unifiedItems = [
    ...grievances.map(g => ({
      type: "grievance" as const,
      id: `grievance-${g.id}`,
      originalId: g.id,
      title: g.category || "Citizen Grievance",
      subtitle: g.name || g.citizenName || "Anonymous Citizen",
      status: (g.status || "Pending").toLowerCase(),
      date: g.created_at || g.createdAt || "",
      data: g,
    })),
    ...volunteers.map(v => ({
      type: "volunteer" as const,
      id: `vol-${v.id}`,
      originalId: v.id,
      title: v.full_name || v.name || "Volunteer Application",
      subtitle: v.mobile || v.email || "No contact",
      status: (v.status || "Pending").toLowerCase(),
      date: v.createdAt || "",
      data: v,
    })),
    ...cards.map(c => ({
      type: "card" as const,
      id: `card-${c.id}`,
      originalId: c.id,
      title: `Jan Seva Card: ${c.name || "Applicant"}`,
      subtitle: c.cardNo ? `Issued: ${c.cardNo}` : (c.idType ? `${c.idType.toUpperCase()}: ${c.idNumber}` : "Pending Issue"),
      status: (c.status || "Pending").toLowerCase(),
      date: c.submittedAt || c.created_at || "",
      data: c,
    })),
    ...bloodDonors.map(b => ({
      type: "blood" as const,
      id: `blood-${b.id}`,
      originalId: b.id,
      title: `Donor: ${b.name || "Blood Donor"}`,
      subtitle: `Group ${b.blood_group || "Unknown"} ? ${b.city || "Location N/A"}`,
      status: "active",
      date: b.created_at || "",
      data: b,
    })),
  ];

  // Filtering
  const filteredItems = unifiedItems.filter(item => {
    if (activeCategory === "grievances" && item.type !== "grievance") return false;
    if (activeCategory === "volunteers" && item.type !== "volunteer") return false;
    if (activeCategory === "cards" && item.type !== "card") return false;
    if (activeCategory === "blood" && item.type !== "blood") return false;

    if (statusFilter !== "all") {
      if (statusFilter === "pending" && !item.status.includes("pending")) return false;
      if (statusFilter === "resolved" && !item.status.includes("resolved")) return false;
      if (statusFilter === "approved" && !item.status.includes("approved")) return false;
      if (statusFilter === "rejected" && !item.status.includes("rejected")) return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("approved") || s.includes("resolved") || s.includes("active")) {
      return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200"><CheckCircle2 className="h-3 w-3" /> {status}</span>;
    }
    if (s.includes("rejected")) {
      return <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200"><XCircle className="h-3 w-3" /> {status}</span>;
    }
    return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200"><Clock className="h-3 w-3" /> {status}</span>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "grievance": return <ClipboardList className="h-5 w-5 text-rose-500" />;
      case "volunteer": return <Users className="h-5 w-5 text-indigo-500" />;
      case "card": return <CreditCard className="h-5 w-5 text-emerald-500" />;
      case "blood": return <Droplet className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 space-y-6">
      {/* HEADER MATCHING LEGACY CMS DESIGN */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-indigo-600">Field Operations & Approvals</p>
            <h1 className="text-xl md:text-2xl font-black text-slate-800">Activity & Verification Command</h1>
            <p className="text-xs text-slate-500 mt-1">
              Review citizen grievances, onboard volunteers, issue Jan Seva Cards and triage emergency requests.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => void fetchData()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh Queue
          </button>
        </div>
      </div>

      {/* METRIC COUNTERS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600"><ClipboardList className="h-5 w-5" /></div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Grievances</p>
            <p className="text-lg font-black text-slate-800">{grievances.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600"><Users className="h-5 w-5" /></div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Volunteers</p>
            <p className="text-lg font-black text-slate-800">{volunteers.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600"><CreditCard className="h-5 w-5" /></div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Card Requests</p>
            <p className="text-lg font-black text-slate-800">{cards.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-red-50 text-red-600"><Droplet className="h-5 w-5" /></div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Blood Network</p>
            <p className="text-lg font-black text-slate-800">{bloodDonors.length}</p>
          </div>
        </div>
      </div>

      {/* SPLIT PANE MAIN CONTAINER */}
      <div className="flex flex-col lg:flex-row gap-6 h-[72vh]">
        {/* LEFT COLUMN: FILTERABLE QUEUE LIST */}
        <div className="w-full lg:w-5/12 xl:w-5/12 flex flex-col space-y-3">
          {/* CATEGORY SELECTOR TABS */}
          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl">
            {(["all", "grievances", "volunteers", "cards", "blood"] as ApprovalCategory[]).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-1 min-w-[60px] text-[11px] font-bold py-1.5 rounded-lg transition capitalize ${
                  activeCategory === cat ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* SEARCH & STATUS BAR */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search triage items..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* SCROLLABLE QUEUE */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-400 text-xs font-semibold">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Loading triage queue...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">No pending items found matching filter.</div>
            ) : (
              filteredItems.map(item => {
                const isSelected = selectedItem?.data?.id === item.originalId && selectedItem?.type === item.type;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem({ type: item.type, data: item.data })}
                    className={`bg-white p-3 rounded-xl border transition-all cursor-pointer hover:border-slate-300 hover:shadow-xs ${
                      isSelected ? "border-indigo-500 ring-1 ring-indigo-500 shadow-xs" : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0">
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {item.type}
                          </span>
                          {getStatusBadge(item.status)}
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 truncate">{item.title}</h4>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                        {item.date && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1.5">
                            <Clock className="h-3 w-3" /> {new Date(item.date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION & DETAIL INSPECTOR */}
        <div className="hidden lg:flex flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-col">
          {selectedItem ? (
            <div className="p-6 h-full flex flex-col justify-between overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                {/* Header for Selected Record */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                      {getTypeIcon(selectedItem.type)}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                        {selectedItem.type} Details
                      </span>
                      <h2 className="text-lg font-black text-slate-800">
                        {selectedItem.data.name || selectedItem.data.citizenName || selectedItem.data.full_name || "Record Detail"}
                      </h2>
                    </div>
                  </div>
                  <div>{getStatusBadge(selectedItem.data.status || "active")}</div>
                </div>

                {/* Detail View Based on Category */}
                {selectedItem.type === "grievance" && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Category</p>
                        <p className="text-xs font-bold text-slate-800">{selectedItem.data.category || "General"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Description</p>
                        <p className="text-xs text-slate-700 leading-relaxed mt-1">
                          {selectedItem.data.description || "No detailed description provided."}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Citizen Phone</p>
                          <p className="text-xs font-semibold text-slate-800">{selectedItem.data.phone || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Logged On</p>
                          <p className="text-xs font-semibold text-slate-800">
                            {new Date(selectedItem.data.created_at || Date.now()).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedItem.type === "volunteer" && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Full Name</p>
                          <p className="text-xs font-bold text-slate-800">{selectedItem.data.full_name || selectedItem.data.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Reg. No</p>
                          <p className="text-xs font-mono font-bold text-indigo-600">{selectedItem.data.registration_number || "Pending"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Mobile Phone</p>
                          <p className="text-xs font-semibold text-slate-800">{selectedItem.data.mobile || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Email Address</p>
                          <p className="text-xs font-semibold text-slate-800">{selectedItem.data.email || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedItem.type === "card" && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Applicant Name</p>
                          <p className="text-xs font-bold text-slate-800">{selectedItem.data.name || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Issued Card Number</p>
                          <p className="text-xs font-mono font-bold text-emerald-600">
                            {selectedItem.data.cardNo || "Not Issued Yet"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">ID Document</p>
                          <p className="text-xs font-semibold text-slate-800">
                            {selectedItem.data.idType?.toUpperCase()}: {selectedItem.data.idNumber || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Gender / DOB</p>
                          <p className="text-xs font-semibold text-slate-800">
                            {selectedItem.data.gender || "N/A"} / {selectedItem.data.dob || "N/A"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold uppercase text-slate-400">Address</p>
                          <p className="text-xs font-semibold text-slate-800">{selectedItem.data.address || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedItem.type === "blood" && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Donor Name</p>
                          <p className="text-xs font-bold text-slate-800">{selectedItem.data.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Blood Group</p>
                          <p className="text-xs font-black text-rose-600">{selectedItem.data.blood_group}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Contact Number</p>
                          <p className="text-xs font-semibold text-slate-800">{selectedItem.data.mobile}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">City / District</p>
                          <p className="text-xs font-semibold text-slate-800">{selectedItem.data.city}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION FOOTER */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
                {selectedItem.type === "grievance" && (
                  <>
                    <button
                      onClick={() => handleUpdateGrievance(selectedItem.data.id, "Pending")}
                      disabled={actionBusy}
                      className="px-4 py-2 rounded-lg text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      Mark Pending
                    </button>
                    <button
                      onClick={() => handleUpdateGrievance(selectedItem.data.id, "In Progress")}
                      disabled={actionBusy}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 shadow-xs"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleUpdateGrievance(selectedItem.data.id, "Resolved")}
                      disabled={actionBusy}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                    >
                      <Check className="h-3.5 w-3.5 inline mr-1" /> Mark Resolved
                    </button>
                  </>
                )}

                {selectedItem.type === "volunteer" && (
                  <>
                    <button
                      onClick={() => handleUpdateVolunteer(selectedItem.data.id, "rejected")}
                      disabled={actionBusy}
                      className="px-4 py-2 rounded-lg text-xs font-bold border border-rose-200 text-rose-600 hover:bg-rose-50"
                    >
                      <X className="h-3.5 w-3.5 inline mr-1" /> Reject Volunteer
                    </button>
                    <button
                      onClick={() => handleUpdateVolunteer(selectedItem.data.id, "approved")}
                      disabled={actionBusy}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                    >
                      <Check className="h-3.5 w-3.5 inline mr-1" /> Approve Volunteer
                    </button>
                  </>
                )}

                {selectedItem.type === "card" && (
                  <>
                    <button
                      onClick={() => handleRejectCard(selectedItem.data.userId || selectedItem.data.id)}
                      disabled={actionBusy}
                      className="px-4 py-2 rounded-lg text-xs font-bold border border-rose-200 text-rose-600 hover:bg-rose-50"
                    >
                      <X className="h-3.5 w-3.5 inline mr-1" /> Reject Application
                    </button>
                    <button
                      onClick={() => handleApproveCard(selectedItem.data.userId || selectedItem.data.id, selectedItem.data.cardNo)}
                      disabled={actionBusy}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                    >
                      <Check className="h-3.5 w-3.5 inline mr-1" /> Issue & Approve Card
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50">
              <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400 mb-4 shadow-xs border border-indigo-100">
                <Activity className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-black text-slate-800">Select an item from the triage queue</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                View submitted proof, citizen statements, and take instant official action across Foundation activities.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
