import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Activity,
  ClipboardList,
  Users,
  Droplet,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Edit3,
  Plus,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Heart,
  Sparkles,
  X,
  Check,
  Send,
  MessageSquare
} from "lucide-react";

interface GrievanceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: string;
  status: "Pending" | "In Progress" | "Resolved";
  citizenName: string;
  createdAt: string;
  citizenPhone?: string;
  adminNote?: string;
}

interface VolunteerItem {
  id: string;
  full_name?: string;
  username?: string;
  registration_number?: string;
  mobile?: string;
  email?: string;
  skills?: string | string[];
  approval_status?: "approved" | "pending" | "rejected";
  created_at?: string;
  assignedDuty?: string;
}

interface BloodRequestItem {
  id: string;
  patientName: string;
  bloodGroup: string;
  hospital: string;
  city: string;
  contactNumber: string;
  unitsNeeded: number;
  status: "Urgent" | "In Progress" | "Fulfilled";
  createdAt: string;
}

interface CommunityDriveItem {
  id: string;
  titleEn: string;
  titleHi: string;
  location: string;
  date: string;
  targetBeneficiaries: number;
  category: "health_camp" | "ration" | "plantation" | "education" | "relief";
  status: "Upcoming" | "Active" | "Completed";
  leadVolunteer?: string;
}

interface AdminActivityStudioProps {
  cmsConfig: any;
  onSaveCms: (cms: any) => Promise<void>;
}

export default function AdminActivityStudio({ cmsConfig, onSaveCms }: AdminActivityStudioProps) {
  const [subTab, setSubTab] = useState<"grievances" | "volunteers" | "blood" | "drives">("grievances");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Grievances State
  const [grievances, setGrievances] = useState<GrievanceItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // 2. Volunteers State
  const [volunteers, setVolunteers] = useState<VolunteerItem[]>([]);
  const [volFilter, setVolFilter] = useState<string>("all");

  // 3. Blood Requests State
  const [bloodRequests, setBloodRequests] = useState<BloodRequestItem[]>(() => {
    return Array.isArray(cmsConfig?.bloodRequests) ? cmsConfig.bloodRequests : [];
  });
  const [bloodGroupFilter, setBloodGroupFilter] = useState("all");

  // 4. Community Drives State
  const [drives, setDrives] = useState<CommunityDriveItem[]>(() => {
    return Array.isArray(cmsConfig?.communityDrives) ? cmsConfig.communityDrives : [];
  });

  // Modal State for Adding Community Drive
  const [driveModal, setDriveModal] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    data: Partial<CommunityDriveItem>;
  }>({
    isOpen: false,
    mode: "add",
    data: {}
  });

  // Modal State for Adding/Editing Blood Request
  const [bloodModal, setBloodModal] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    data: Partial<BloodRequestItem>;
  }>({
    isOpen: false,
    mode: "add",
    data: {}
  });

  // Sync with cmsConfig changes
  useEffect(() => {
    if (Array.isArray(cmsConfig?.bloodRequests)) {
      setBloodRequests(cmsConfig.bloodRequests);
    }
    if (Array.isArray(cmsConfig?.communityDrives)) {
      setDrives(cmsConfig.communityDrives);
    }
  }, [cmsConfig]);

  // Fetch Grievances and Volunteers on mount
  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("@rpf_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // 1. Fetch Grievances
      try {
        const res = await axios.get("/api/grievances", { headers });
        if (res.data?.grievances && Array.isArray(res.data.grievances)) {
          setGrievances(res.data.grievances);
        }
      } catch (err) {
        console.warn("Grievances fetch note:", err);
      }

      // 2. Fetch Volunteers
      try {
        const res = await axios.get("/api/admin/users", { headers });
        if (res.data?.users && Array.isArray(res.data.users)) {
          const vols = res.data.users
            .filter((u: any) => u.isVolunteer || u.role === "volunteer")
            .map((u: any) => ({
              id: u.id,
              full_name: u.name,
              username: u.username,
              mobile: u.phone,
              email: u.email,
              skills: u.skills || "Social Service, Relief Work",
              approval_status: u.approval_status || "approved",
              created_at: u.created_at
            }));
          setVolunteers(vols);
        }
      } catch (err) {
        console.warn("Volunteers fetch note:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // Update Grievance Status
  const handleUpdateGrievanceStatus = async (id: string, newStatus: GrievanceItem["status"]) => {
    try {
      const token = localStorage.getItem("@rpf_token");
      await axios.post(
        "/api/grievances/status",
        { id, status: newStatus },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setGrievances((prev) =>
        prev.map((g) => (g.id === id ? { ...g, status: newStatus } : g))
      );
      toast.success(`Grievance marked as ${newStatus}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update grievance status");
    }
  };

  // Delete Grievance
  const handleDeleteGrievance = async (id: string) => {
    if (confirm("Are you sure you want to delete this grievance?")) {
      setGrievances((prev) => prev.filter((g) => g.id !== id));
      toast.success("Grievance deleted");
    }
  };

  // Toggle Volunteer Approval
  const handleToggleVolunteerApproval = async (id: string, current: string) => {
    const nextStatus = current === "approved" ? "rejected" : "approved";
    setVolunteers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, approval_status: nextStatus as any } : v))
    );
    toast.success(`Volunteer status updated to ${nextStatus}`);
  };

  // Update Blood Request Status
  const handleUpdateBloodStatus = async (id: string, status: BloodRequestItem["status"]) => {
    const updated = bloodRequests.map((b) => (b.id === id ? { ...b, status } : b));
    setBloodRequests(updated);
    await onSaveCms({ ...cmsConfig, bloodRequests: updated });
    toast.success(`Blood request marked as ${status}`);
  };

  // Save Blood Request Modal
  const handleSaveBloodModal = async () => {
    if (!bloodModal.data.patientName?.trim() || !bloodModal.data.bloodGroup || !bloodModal.data.contactNumber?.trim()) {
      toast.error("Patient name, blood group, and contact number are required");
      return;
    }
    let nextList = [...bloodRequests];
    if (bloodModal.mode === "add") {
      const newReq: BloodRequestItem = {
        id: `br-${Date.now()}`,
        patientName: bloodModal.data.patientName.trim(),
        bloodGroup: bloodModal.data.bloodGroup || "O+",
        hospital: bloodModal.data.hospital?.trim() || "Local Hospital",
        city: bloodModal.data.city?.trim() || "City Center",
        contactNumber: bloodModal.data.contactNumber.trim(),
        unitsNeeded: Number(bloodModal.data.unitsNeeded) || 1,
        status: (bloodModal.data.status as any) || "Urgent",
        createdAt: new Date().toISOString()
      };
      nextList.unshift(newReq);
    } else {
      nextList = nextList.map((b) =>
        b.id === bloodModal.data.id ? ({ ...b, ...bloodModal.data } as BloodRequestItem) : b
      );
    }
    setBloodRequests(nextList);
    await onSaveCms({ ...cmsConfig, bloodRequests: nextList });
    toast.success(bloodModal.mode === "add" ? "Emergency request broadcasted" : "Blood request updated");
    setBloodModal({ isOpen: false, mode: "add", data: {} });
  };

  // Delete Blood Request
  const handleDeleteBloodRequest = async (id: string) => {
    if (confirm("Are you sure you want to remove this blood request?")) {
      const nextList = bloodRequests.filter((b) => b.id !== id);
      setBloodRequests(nextList);
      await onSaveCms({ ...cmsConfig, bloodRequests: nextList });
      toast.success("Blood request removed");
    }
  };

  // Save Community Drives
  const handleSaveDriveModal = async () => {
    const title = driveModal.data.titleEn?.trim() || driveModal.data.titleHi?.trim();
    if (!title || !driveModal.data.location?.trim()) {
      toast.error("Drive Title and Location are required");
      return;
    }
    const cleanId = driveModal.data.id || `drive-${Date.now()}`;
    const newDrive: CommunityDriveItem = {
      id: cleanId,
      titleEn: title,
      titleHi: title,
      location: driveModal.data.location.trim(),
      date: driveModal.data.date || new Date().toISOString().split("T")[0],
      targetBeneficiaries: Number(driveModal.data.targetBeneficiaries) || 100,
      category: driveModal.data.category || "health_camp",
      status: driveModal.data.status || "Upcoming",
      leadVolunteer: driveModal.data.leadVolunteer?.trim() || "RP Force Coordinator"
    };

    let nextList: CommunityDriveItem[];
    if (driveModal.mode === "add") {
      nextList = [...drives, newDrive];
    } else {
      nextList = drives.map((d) => (d.id === cleanId ? newDrive : d));
    }

    setDrives(nextList);
    await onSaveCms({ ...cmsConfig, communityDrives: nextList });
    toast.success(driveModal.mode === "add" ? "Campaign scheduled" : "Campaign updated");
    setDriveModal({ isOpen: false, mode: "add", data: {} });
  };

  const handleDeleteDrive = async (id: string) => {
    if (confirm("Are you sure you want to delete this community drive?")) {
      const nextList = drives.filter((d) => d.id !== id);
      setDrives(nextList);
      await onSaveCms({ ...cmsConfig, communityDrives: nextList });
      toast.success("Community drive removed");
    }
  };

  // Filtered views
  const filteredGrievances = useMemo(() => {
    return grievances.filter((g) => {
      const matchesStatus = statusFilter === "all" || g.status.toLowerCase() === statusFilter.toLowerCase();
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.citizenName.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [grievances, statusFilter, search]);

  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((v) => {
      const matchesStatus = volFilter === "all" || v.approval_status === volFilter;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (v.full_name || "").toLowerCase().includes(q) ||
        (v.mobile || "").includes(q) ||
        (v.email || "").toLowerCase().includes(q) ||
        (String(v.skills) || "").toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [volunteers, volFilter, search]);

  const filteredBlood = useMemo(() => {
    return bloodRequests.filter((b) => {
      const matchesBg = bloodGroupFilter === "all" || b.bloodGroup === bloodGroupFilter;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.patientName.toLowerCase().includes(q) ||
        b.hospital.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q);
      return matchesBg && matchesSearch;
    });
  }, [bloodRequests, bloodGroupFilter, search]);

  const filteredDrives = useMemo(() => {
    return drives.filter((d) => {
      const q = search.toLowerCase().trim();
      return (
        !q ||
        d.titleEn.toLowerCase().includes(q) ||
        d.titleHi.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q)
      );
    });
  }, [drives, search]);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-50 border border-orange-200 text-[#C2410C]">
              <Activity className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-[#0A192F]">Activity Studio</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-green-100 text-[#166534] border border-green-200">
              Operations Center
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Citizen Grievance Redressal, Volunteer Duty Tracker, Emergency Blood Network, and Community Drives.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => void loadData()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Operations</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => {
            setSubTab("grievances");
            setSearch("");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === "grievances"
              ? "bg-[#0A192F] text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <ClipboardList className="w-4 h-4 text-orange-400" />
          <span>Grievances ({grievances.length})</span>
        </button>

        <button
          onClick={() => {
            setSubTab("volunteers");
            setSearch("");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === "volunteers"
              ? "bg-[#0A192F] text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Users className="w-4 h-4 text-green-400" />
          <span>Volunteer Force ({volunteers.length})</span>
        </button>

        <button
          onClick={() => {
            setSubTab("blood");
            setSearch("");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === "blood"
              ? "bg-[#0A192F] text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Droplet className="w-4 h-4 text-red-500" />
          <span>Blood & SOS ({bloodRequests.length})</span>
        </button>

        <button
          onClick={() => {
            setSubTab("drives");
            setSearch("");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === "drives"
              ? "bg-[#0A192F] text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-500" />
          <span>Community Drives ({drives.length})</span>
        </button>
      </div>

      {/* Control Bar: Search & Sub-filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 w-full sm:w-80 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${subTab}...`}
            className="w-full text-xs bg-transparent border-none outline-none text-[#0A192F] placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {subTab === "grievances" && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#0A192F] font-medium outline-none"
            >
              <option value="all">All Grievances</option>
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          )}

          {subTab === "volunteers" && (
            <select
              value={volFilter}
              onChange={(e) => setVolFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#0A192F] font-medium outline-none"
            >
              <option value="all">All Volunteers</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending Verification</option>
              <option value="rejected">Rejected</option>
            </select>
          )}

          {subTab === "blood" && (
            <select
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#0A192F] font-medium outline-none"
            >
              <option value="all">All Blood Groups</option>
              <option value="O+">O Positive (O+)</option>
              <option value="O-">O Negative (O-)</option>
              <option value="A+">A Positive (A+)</option>
              <option value="A-">A Negative (A-)</option>
              <option value="B+">B Positive (B+)</option>
              <option value="B-">B Negative (B-)</option>
              <option value="AB+">AB Positive (AB+)</option>
              <option value="AB-">AB Negative (AB-)</option>
            </select>
          )}

          {subTab === "drives" && (
            <button
              onClick={() =>
                setDriveModal({
                  isOpen: true,
                  mode: "add",
                  data: {
                    category: "health_camp",
                    status: "Upcoming",
                    targetBeneficiaries: 200,
                    date: new Date().toISOString().split("T")[0]
                  }
                })
              }
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#166534] hover:bg-green-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Drive</span>
            </button>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. CITIZEN GRIEVANCES TAB                                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {subTab === "grievances" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredGrievances.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No grievances found matching the selected filter.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredGrievances.map((g) => (
                <div key={g.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#0A192F]">{g.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#1E3A8A] border border-blue-200">
                        {g.category || "General"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          g.urgency?.toLowerCase() === "critical"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : g.urgency?.toLowerCase() === "urgent"
                            ? "bg-amber-50 text-[#C2410C] border border-amber-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {g.urgency || "Normal"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">{g.description}</p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span>
                        Citizen: <strong>{g.citizenName || "Anonymous"}</strong>
                      </span>
                      <span>
                        Date: {g.createdAt ? new Date(g.createdAt).toLocaleDateString() : "Recent"}
                      </span>
                      {g.citizenPhone && (
                        <a
                          href={`tel:${g.citizenPhone}`}
                          className="flex items-center gap-1 text-green-700 hover:underline font-mono"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{g.citizenPhone}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <select
                      value={g.status}
                      onChange={(e) =>
                        handleUpdateGrievanceStatus(g.id, e.target.value as GrievanceItem["status"])
                      }
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer ${
                        g.status === "Resolved"
                          ? "bg-green-50 text-[#166534] border-green-200"
                          : g.status === "In Progress"
                          ? "bg-amber-50 text-[#C2410C] border-amber-200"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>

                    <button
                      onClick={() => handleDeleteGrievance(g.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. VOLUNTEER DUTY TRACKER TAB                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      {subTab === "volunteers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVolunteers.length === 0 ? (
            <div className="col-span-full p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
              No registered volunteers found.
            </div>
          ) : (
            filteredVolunteers.map((vol) => (
              <div key={vol.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 border border-green-200 text-[#166534] font-bold flex items-center justify-center text-sm">
                      {(vol.full_name || vol.username || "V")[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0A192F]">
                        {vol.full_name || vol.username || "Volunteer"}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-500">
                        {vol.registration_number || `VOL-${vol.id.slice(0, 6)}`}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      vol.approval_status === "approved"
                        ? "bg-green-50 text-[#166534] border-green-200"
                        : "bg-amber-50 text-[#C2410C] border-amber-200"
                    }`}
                  >
                    {vol.approval_status || "Pending"}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  {vol.mobile && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`tel:${vol.mobile}`} className="hover:underline font-mono">
                        {vol.mobile}
                      </a>
                    </div>
                  )}
                  {vol.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{vol.email}</span>
                    </div>
                  )}
                  <div className="text-[11px] text-slate-500 pt-1">
                    Skills: {Array.isArray(vol.skills) ? vol.skills.join(", ") : vol.skills || "Relief, Outreach"}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleVolunteerApproval(vol.id, vol.approval_status || "approved")}
                    className="text-xs font-bold text-[#166534] hover:underline"
                  >
                    {vol.approval_status === "approved" ? "Suspend Volunteer" : "Approve Volunteer"}
                  </button>

                  {vol.mobile && (
                    <a
                      href={`https://wa.me/91${vol.mobile.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-green-50 text-[#166534] text-[11px] font-bold border border-green-200 hover:bg-green-100 flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. EMERGENCY BLOOD & SOS TAB                                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {subTab === "blood" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Active Emergency Requests ({filteredBlood.length})
            </span>
            <button
              onClick={() =>
                setBloodModal({
                  isOpen: true,
                  mode: "add",
                  data: { bloodGroup: "O+", unitsNeeded: 1, status: "Urgent" }
                })
              }
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#C2410C] text-white hover:bg-[#9a3412] inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Broadcast Blood Request</span>
            </button>
          </div>

          {filteredBlood.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                <Droplet className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">No Active Blood Requests</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                There are currently no emergency blood requests recorded. Click the button below to broadcast a donor appeal.
              </p>
              <button
                onClick={() =>
                  setBloodModal({
                    isOpen: true,
                    mode: "add",
                    data: { bloodGroup: "O+", unitsNeeded: 1, status: "Urgent" }
                  })
                }
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#C2410C] text-white hover:bg-[#9a3412] inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Broadcast Blood Request</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {filteredBlood.map((b) => (
                  <div key={b.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex flex-col items-center justify-center font-bold shrink-0">
                        <Droplet className="w-4 h-4 fill-red-600" />
                        <span className="text-[11px]">{b.bloodGroup}</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#0A192F]">{b.patientName}</h4>
                        <p className="text-xs text-slate-500">
                          {b.hospital}, {b.city} ({b.unitsNeeded} Units Required)
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <a
                            href={`tel:${b.contactNumber}`}
                            className="text-xs font-mono text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{b.contactNumber}</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <select
                        value={b.status}
                        onChange={(e) =>
                          handleUpdateBloodStatus(b.id, e.target.value as BloodRequestItem["status"])
                        }
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none ${
                          b.status === "Fulfilled"
                            ? "bg-green-50 text-[#166534] border-green-200"
                            : b.status === "In Progress"
                            ? "bg-amber-50 text-[#C2410C] border-amber-200"
                            : "bg-red-50 text-red-600 border-red-200"
                        }`}
                      >
                        <option value="Urgent">Urgent Needed</option>
                        <option value="In Progress">Donor Dispatched</option>
                        <option value="Fulfilled">Donation Fulfilled</option>
                      </select>

                      <button
                        onClick={() => setBloodModal({ isOpen: true, mode: "edit", data: b })}
                        className="p-2 rounded-xl text-slate-500 hover:text-[#0A192F] hover:bg-slate-100"
                        title="Edit Request"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteBloodRequest(b.id)}
                        className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Delete Request"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. COMMUNITY DRIVES & CAMPAIGNS TAB                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      {subTab === "drives" && (
        <div>
          {filteredDrives.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-green-50 text-[#166534] flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">No Community Drives Scheduled</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Organize health camps, ration distribution, tree plantation, or relief missions for community empowerment.
              </p>
              <button
                onClick={() =>
                  setDriveModal({
                    isOpen: true,
                    mode: "add",
                    data: { targetBeneficiaries: 100, status: "Upcoming", category: "health_camp" }
                  })
                }
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#166534] text-white hover:bg-green-800 inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Campaign</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDrives.map((d) => (
                <div key={d.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#0A192F]">{d.titleEn || d.titleHi}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        d.status === "Active"
                          ? "bg-green-50 text-[#166534] border-green-200"
                          : d.status === "Completed"
                          ? "bg-slate-100 text-slate-600 border-slate-200"
                          : "bg-amber-50 text-[#C2410C] border-amber-200"
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      <span>{d.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span>Date: {d.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Users className="w-3.5 h-3.5 text-green-600" />
                      <span>Target: {d.targetBeneficiaries} Beneficiaries</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Lead: {d.leadVolunteer || "RP Force"}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setDriveModal({ isOpen: true, mode: "edit", data: d })}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#0A192F] hover:bg-slate-100"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDrive(d.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: BROADCAST / EDIT EMERGENCY BLOOD REQUEST                */}
      {/* ───────────────────────────────────────────────────────────── */}
      {bloodModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#0A192F]">
                {bloodModal.mode === "add" ? "Broadcast Emergency Blood Request" : "Edit Blood Request"}
              </h3>
              <button
                onClick={() => setBloodModal({ isOpen: false, mode: "add", data: {} })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Patient Name</label>
                <input
                  type="text"
                  value={bloodModal.data.patientName || ""}
                  onChange={(e) =>
                    setBloodModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, patientName: e.target.value }
                    }))
                  }
                  placeholder="Patient or recipient name..."
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Blood Group</label>
                  <select
                    value={bloodModal.data.bloodGroup || "O+"}
                    onChange={(e) =>
                      setBloodModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, bloodGroup: e.target.value }
                      }))
                    }
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Units Needed</label>
                  <input
                    type="number"
                    min="1"
                    value={bloodModal.data.unitsNeeded || 1}
                    onChange={(e) =>
                      setBloodModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, unitsNeeded: Number(e.target.value) }
                      }))
                    }
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Hospital / Ward</label>
                  <input
                    type="text"
                    value={bloodModal.data.hospital || ""}
                    onChange={(e) =>
                      setBloodModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, hospital: e.target.value }
                      }))
                    }
                    placeholder="e.g. AIIMS Bhopal"
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">City</label>
                  <input
                    type="text"
                    value={bloodModal.data.city || ""}
                    onChange={(e) =>
                      setBloodModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, city: e.target.value }
                      }))
                    }
                    placeholder="e.g. Bhopal"
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Contact Number</label>
                  <input
                    type="tel"
                    value={bloodModal.data.contactNumber || ""}
                    onChange={(e) =>
                      setBloodModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, contactNumber: e.target.value }
                      }))
                    }
                    placeholder="Phone number..."
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Urgency Status</label>
                  <select
                    value={bloodModal.data.status || "Urgent"}
                    onChange={(e) =>
                      setBloodModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, status: e.target.value as any }
                      }))
                    }
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Urgent">Urgent Needed</option>
                    <option value="In Progress">Donor Dispatched</option>
                    <option value="Fulfilled">Donation Fulfilled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setBloodModal({ isOpen: false, mode: "add", data: {} })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBloodModal}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#C2410C] text-white hover:bg-[#9a3412] shadow"
              >
                {bloodModal.mode === "add" ? "Broadcast Request" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: SCHEDULE / EDIT COMMUNITY DRIVE                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {driveModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#0A192F]">
                {driveModal.mode === "add" ? "Schedule Community Campaign" : "Edit Campaign"}
              </h3>
              <button
                onClick={() => setDriveModal({ isOpen: false, mode: "add", data: {} })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Campaign Title</label>
                <input
                  type="text"
                  value={driveModal.data.titleEn || driveModal.data.titleHi || ""}
                  onChange={(e) =>
                    setDriveModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, titleEn: e.target.value, titleHi: e.target.value }
                    }))
                  }
                  placeholder="e.g. Free Eye Checkup Camp"
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Location / Village</label>
                  <input
                    type="text"
                    value={driveModal.data.location || ""}
                    onChange={(e) =>
                      setDriveModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, location: e.target.value }
                      }))
                    }
                    placeholder="Community Center, Bhopal"
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Date</label>
                  <input
                    type="date"
                    value={driveModal.data.date || ""}
                    onChange={(e) =>
                      setDriveModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, date: e.target.value }
                      }))
                    }
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Target Beneficiaries</label>
                  <input
                    type="number"
                    value={driveModal.data.targetBeneficiaries || 200}
                    onChange={(e) =>
                      setDriveModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, targetBeneficiaries: Number(e.target.value) }
                      }))
                    }
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Status</label>
                  <select
                    value={driveModal.data.status || "Upcoming"}
                    onChange={(e) =>
                      setDriveModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, status: e.target.value as any }
                      }))
                    }
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Active">Active Today</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Lead Volunteer / Doctor</label>
                <input
                  type="text"
                  value={driveModal.data.leadVolunteer || ""}
                  onChange={(e) =>
                    setDriveModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, leadVolunteer: e.target.value }
                    }))
                  }
                  placeholder="Volunteer coordinator name..."
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setDriveModal({ isOpen: false, mode: "add", data: {} })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDriveModal}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#166534] text-white hover:bg-green-800 shadow"
              >
                {driveModal.mode === "add" ? "Schedule Campaign" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
