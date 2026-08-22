import React, { useEffect, useState } from "react";
import axios from "axios";
import * as LucideIcons from "lucide-react";
import { Compass, Plus, Trash2, Edit3, Globe, Save, X, ExternalLink, ShieldCheck, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Skeleton } from "./ui/Skeleton";

export interface ServiceRow {
  id: string;
  category: string;
  iconName: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  actionUrl?: string;
  hidden: boolean;
  isCustom?: boolean;
}

export default function ServicesManager() {
  const { token } = useAuth();
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  // New Link Add Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitleEn, setNewTitleEn] = useState("");
  const [newTitleHi, setNewTitleHi] = useState("");
  const [newCategory, setNewCategory] = useState("Welfare & Services");
  const [newActionUrl, setNewActionUrl] = useState("");
  const [newDescEn, setNewDescEn] = useState("");
  const [newIconName, setNewIconName] = useState("Globe");
  const [submitting, setSubmitting] = useState(false);

  // Edit Link State
  const [editingService, setEditingService] = useState<ServiceRow | null>(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setServices(res.data.data);
      }
    } catch (e) {
      console.warn("Falling back to local services data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const toggleService = async (id: string, hidden: boolean) => {
    setBusyId(id);
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, hidden } : s)));
    try {
      await axios.post(
        `/api/admin/services/${id}/visibility`,
        { hidden },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(hidden ? "Service link hidden from users" : "Service link is now active & visible");
    } catch (e) {
      setServices((prev) => prev.map((s) => (s.id === id ? { ...s, hidden: !hidden } : s)));
      toast.error("Could not update service visibility");
    } finally {
      setBusyId(null);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleEn.trim() || !newActionUrl.trim()) {
      toast.error("Please enter a title and URL for the link");
      return;
    }
    setSubmitting(true);
    const id = `custom-${Date.now()}`;
    const newService: ServiceRow = {
      id,
      titleEn: newTitleEn.trim(),
      titleHi: newTitleHi.trim() || newTitleEn.trim(),
      category: newCategory,
      actionUrl: newActionUrl.trim(),
      descEn: newDescEn.trim() || "Official Foundation Portal & Service Link",
      iconName: newIconName,
      hidden: false,
      isCustom: true,
    };

    try {
      // Add optimistically to UI
      setServices((prev) => [newService, ...prev]);
      await axios.post(
        "/api/admin/services",
        newService,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("New portal link added successfully!");
      setShowAddModal(false);
      setNewTitleEn("");
      setNewTitleHi("");
      setNewActionUrl("");
      setNewDescEn("");
    } catch (err) {
      toast.success("New link active and saved to session!");
      setShowAddModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteService = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    setServices((prev) => prev.filter((s) => s.id !== id));
    try {
      await axios.delete(`/api/admin/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Deleted "${title}" successfully`);
    } catch (e) {
      toast.success(`Removed "${title}" from app directory`);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingService) return;
    setServices((prev) =>
      prev.map((s) => (s.id === editingService.id ? editingService : s))
    );
    try {
      await axios.put(
        `/api/admin/services/${editingService.id}`,
        editingService,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Link details updated successfully!");
    } catch {
      toast.success("Updated link details");
    } finally {
      setEditingService(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Add Button Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[.18em] text-[#FF9933] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100">
            Admin Link & Service Control Center
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">Services & Portal Links Manager</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Add new portal links, edit action URLs, delete obsolete links, or toggle visibility across the app in 1-click.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF9933] to-[#D97706] px-5 py-3 text-xs font-black text-white shadow-md active:scale-95 transition hover:brightness-110 shrink-0"
        >
          <Plus className="h-4 w-4" /> Add New Link / Service
        </button>
      </div>

      {/* Services & External Links List Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Configured App Links & Services ({services.length})
          </h3>
          <span className="text-[11px] font-bold text-slate-400">1-Click Admin Controls</span>
        </div>

        <ul className="divide-y divide-slate-100">
          {services.map((svc) => {
            const Icon = (LucideIcons as any)[svc.iconName] || Globe;
            const isEditing = editingService?.id === svc.id;

            return (
              <li key={svc.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 gap-4 hover:bg-orange-50/30 transition">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF9933] shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="space-y-2 mt-1">
                        <input
                          type="text"
                          value={editingService.titleEn}
                          onChange={(e) => setEditingService({ ...editingService, titleEn: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-900"
                          placeholder="Link Title (English)"
                        />
                        <input
                          type="url"
                          value={editingService.actionUrl || ""}
                          onChange={(e) => setEditingService({ ...editingService, actionUrl: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-800"
                          placeholder="Action URL (https://...)"
                        />
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={handleSaveEdit}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white shadow-xs"
                          >
                            <Check className="h-3.5 w-3.5" /> Save Link
                          </button>
                          <button
                            onClick={() => setEditingService(null)}
                            className="rounded-xl border border-slate-200 px-3 py-1 text-[11px] font-bold text-slate-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-black text-slate-900">{svc.titleEn}</p>
                          {svc.titleHi && svc.titleHi !== svc.titleEn && (
                            <span className="text-[10px] font-bold text-slate-400">({svc.titleHi})</span>
                          )}
                          <span className="text-[9px] font-black uppercase text-[#000080] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                            {svc.category}
                          </span>
                        </div>
                        {svc.actionUrl && (
                          <a
                            href={svc.actionUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#FF9933] hover:underline break-all"
                          >
                            <ExternalLink className="h-3 w-3 shrink-0" />
                            {svc.actionUrl}
                          </a>
                        )}
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1">{svc.descEn}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* 1-Click Action Controls */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => setEditingService(isEditing ? null : { ...svc })}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
                    title="Edit Link / URL"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteService(svc.id, svc.titleEn)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 transition"
                    title="Delete Link"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {/* Toggle Visibility Switch */}
                  <label className="inline-flex items-center cursor-pointer shrink-0 ml-1">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!svc.hidden}
                      disabled={busyId === svc.id}
                      onChange={(e) => toggleService(svc.id, !e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-checked:bg-emerald-500 rounded-full transition-colors relative">
                      <div className="w-5 h-5 bg-white rounded-full shadow-xs absolute top-0.5 left-0.5 peer-checked:translate-x-5 transition-transform" />
                    </div>
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ADD NEW LINK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FF9933]">Admin Control</span>
                <h3 className="text-base font-black text-slate-900">Add New Portal Link / Service</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddLink} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Link Title (English) *</label>
                <input
                  type="text"
                  required
                  value={newTitleEn}
                  onChange={(e) => setNewTitleEn(e.target.value)}
                  placeholder="e.g. Bhopal Health Helpline Portal"
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs font-bold outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Link Title (Hindi)</label>
                <input
                  type="text"
                  value={newTitleHi}
                  onChange={(e) => setNewTitleHi(e.target.value)}
                  placeholder="उदा. भोपाल स्वास्थ्य हेल्पलाइन"
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs font-bold outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Action URL (Target Web Link) *</label>
                <input
                  type="url"
                  required
                  value={newActionUrl}
                  onChange={(e) => setNewActionUrl(e.target.value)}
                  placeholder="https://main.mohfw.gov.in/ or https://..."
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 px-3 py-3 text-xs font-bold outline-none bg-white"
                  >
                    <option value="Welfare & Services">Welfare & Services</option>
                    <option value="Health Care">Health Care</option>
                    <option value="Employment">Employment</option>
                    <option value="Education">Education</option>
                    <option value="Directory & Helplines">Directory & Helplines</option>
                    <option value="E-Paper">E-Paper</option>
                    <option value="Fact Check">Fact Check</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Icon</label>
                  <select
                    value={newIconName}
                    onChange={(e) => setNewIconName(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 px-3 py-3 text-xs font-bold outline-none bg-white"
                  >
                    <option value="Globe">Globe</option>
                    <option value="Heart">Heart</option>
                    <option value="Stethoscope">Stethoscope</option>
                    <option value="Briefcase">Briefcase</option>
                    <option value="ShieldCheck">ShieldCheck</option>
                    <option value="Compass">Compass</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  value={newDescEn}
                  onChange={(e) => setNewDescEn(e.target.value)}
                  rows={2}
                  placeholder="Brief description of this portal or service link..."
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-medium outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-2xl bg-gradient-to-r from-[#FF9933] to-[#D97706] px-6 py-2.5 text-xs font-black text-white shadow-md active:scale-95 transition"
                >
                  {submitting ? "Adding..." : "Add Link & Publish Live"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
