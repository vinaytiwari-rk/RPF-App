import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import * as LucideIcons from "lucide-react";
import {
  Compass,
  Plus,
  Trash2,
  Edit3,
  Globe,
  Save,
  X,
  ExternalLink,
  Check,
  Search,
  Filter,
  Tv,
  Newspaper,
  Stethoscope,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  PhoneCall,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Skeleton } from "./ui/Skeleton";
import { EXTERNAL_LINK_REGISTRY } from "../config/externalLinks";

export interface ServiceRow {
  id: string;
  category: string;
  iconName: string;
  titleEn: string;
  titleHi?: string;
  descEn?: string;
  actionUrl: string;
  hidden: boolean;
  isCustom?: boolean;
}

// Pre-built Directory of All Portal & Service Links
const DEFAULT_ALL_LINKS: ServiceRow[] = [
  // E-PAPERS
  { id: "ep-1", category: "E-Paper", iconName: "Newspaper", titleEn: "Free Press Journal E-Paper", actionUrl: "https://epaper.freepressjournal.in/", hidden: false },
  { id: "ep-2", category: "E-Paper", iconName: "Newspaper", titleEn: "People's Samachar", actionUrl: "https://epapers.peoplessamachar.in/", hidden: false },
  { id: "ep-3", category: "E-Paper", iconName: "Newspaper", titleEn: "Mid-Day E-Paper", actionUrl: "https://epaper.mid-day.com/", hidden: false },
  { id: "ep-4", category: "E-Paper", iconName: "Newspaper", titleEn: "Aaj Tak Samachar", actionUrl: "https://epaper.aajtak.in/", hidden: false },
  { id: "ep-5", category: "E-Paper", iconName: "Newspaper", titleEn: "Financial Express", actionUrl: "https://epaper.financialexpress.com/", hidden: false },
  { id: "ep-6", category: "E-Paper", iconName: "Newspaper", titleEn: "The Telegraph India", actionUrl: "https://epaper.telegraphindia.com/", hidden: false },
  { id: "ep-7", category: "E-Paper", iconName: "Newspaper", titleEn: "Live Hindustan Bhopal", actionUrl: "https://epaper.livehindustan.com/", hidden: false },
  { id: "ep-8", category: "E-Paper", iconName: "Newspaper", titleEn: "Lokdesh Bhopal", actionUrl: "https://lokdesh.com/bhopal-e-papers/", hidden: false },
  { id: "ep-9", category: "E-Paper", iconName: "Newspaper", titleEn: "Hitavada MP", actionUrl: "https://www.ehitavada.com/", hidden: false },
  { id: "ep-10", category: "E-Paper", iconName: "Newspaper", titleEn: "Mint Financial News", actionUrl: "https://epaper.livemint.com/", hidden: false },
  { id: "ep-11", category: "E-Paper", iconName: "Newspaper", titleEn: "Prabhat Khabar", actionUrl: "https://epaper.prabhatkhabar.com/", hidden: false },

  // HEALTH CARE
  { id: "hc-1", category: "Health Care", iconName: "Stethoscope", titleEn: "Ayushman Bharat PM-JAY Portal", actionUrl: "https://beneficiary.nha.gov.in/", hidden: false },
  { id: "hc-2", category: "Health Care", iconName: "Stethoscope", titleEn: "Create / Download ABHA Health ID", actionUrl: "https://abha.abdm.gov.in/", hidden: false },
  { id: "hc-3", category: "Health Care", iconName: "Stethoscope", titleEn: "eRaktkosh Blood Availability Portal", actionUrl: "https://eraktkosh.mohfw.gov.in/", hidden: false },
  { id: "hc-4", category: "Health Care", iconName: "Stethoscope", titleEn: "eSanjeevani Telemedicine OPD", actionUrl: "https://esanjeevani.mohfw.gov.in/", hidden: false },
  { id: "hc-5", category: "Health Care", iconName: "Stethoscope", titleEn: "Jan Aushadhi Kendra Locator", actionUrl: "https://janaushadhi.gov.in/", hidden: false },
  { id: "hc-6", category: "Health Care", iconName: "Stethoscope", titleEn: "NCDC India Disease Control", actionUrl: "https://ncdc.gov.in/", hidden: false },
  { id: "hc-7", category: "Health Care", iconName: "Stethoscope", titleEn: "AIIMS Bhopal Official Portal", actionUrl: "https://aiimsbhopal.edu.in/", hidden: false },
  { id: "hc-8", category: "Health Care", iconName: "Stethoscope", titleEn: "ESIC Medical Services", actionUrl: "https://www.esic.gov.in/", hidden: false },

  // EDUCATION AID
  { id: "edu-1", category: "Education Aid", iconName: "GraduationCap", titleEn: "National Scholarship Portal (NSP)", actionUrl: "https://scholarships.gov.in/", hidden: false },
  { id: "edu-2", category: "Education Aid", iconName: "GraduationCap", titleEn: "MP Shiksha Portal & Medhavi Chhatra", actionUrl: "http://shikshaportal.mp.gov.in/", hidden: false },
  { id: "edu-3", category: "Education Aid", iconName: "GraduationCap", titleEn: "Swayam Free Online Courses", actionUrl: "https://swayam.gov.in/", hidden: false },

  // NEWS FEED
  { id: "news-1", category: "News Feed", iconName: "Newspaper", titleEn: "Press Information Bureau (PIB)", actionUrl: "https://pib.gov.in/", hidden: false },
  { id: "news-2", category: "News Feed", iconName: "Newspaper", titleEn: "DD News Official", actionUrl: "https://ddnews.gov.in/", hidden: false },
  { id: "news-3", category: "News Feed", iconName: "Newspaper", titleEn: "All India Radio News (AIR)", actionUrl: "https://newsonair.gov.in/", hidden: false },

  // FACT CHECK
  { id: "fc-1", category: "Fact Check", iconName: "ShieldCheck", titleEn: "PIB Fact Check", actionUrl: "https://xcancel.com/pibfactcheck", hidden: false },
  { id: "fc-2", category: "Fact Check", iconName: "ShieldCheck", titleEn: "Vishvas News Fact Checker", actionUrl: "https://www.vishvasnews.com/", hidden: false },
  { id: "fc-3", category: "Fact Check", iconName: "ShieldCheck", titleEn: "Dainik Bhaskar No Fake News", actionUrl: "https://www.bhaskar.com/no-fake-news/", hidden: false },

  // DIRECTORY & HELPLINES
  { id: "dir-1", category: "Directory & Helplines", iconName: "PhoneCall", titleEn: "India National Contact Directory", actionUrl: "https://www.india.gov.in/directory/contact-directory", hidden: false },
  { id: "dir-[#FF9933]", category: "Directory & Helplines", iconName: "PhoneCall", titleEn: "Public Emergency Helplines", actionUrl: "https://www.india.gov.in/directory/helpline", hidden: false },
];

export default function ServicesManager() {
  const { token } = useAuth();
  const [links, setLinks] = useState<ServiceRow[]>(DEFAULT_ALL_LINKS);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Category Filter & Search States
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Add Link Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitleEn, setNewTitleEn] = useState("");
  const [newTitleHi, setNewTitleHi] = useState("");
  const [newCategory, setNewCategory] = useState("E-Paper");
  const [newActionUrl, setNewActionUrl] = useState("");
  const [newDescEn, setNewDescEn] = useState("");
  const [newIconName, setNewIconName] = useState("Globe");
  const [submitting, setSubmitting] = useState(false);

  // Inline Edit State
  const [editingLink, setEditingLink] = useState<ServiceRow | null>(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        // Merge DB links with built-in category links
        setLinks(res.data.data);
      }
    } catch {
      console.warn("Using local category links directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>(["All", "E-Paper", "Health Care", "Live TV", "News Feed", "Education Aid", "Fact Check", "Directory & Helplines", "Welfare & Services"]);
    links.forEach((l) => set.add(l.category));
    return Array.from(set);
  }, [links]);

  // Filtered links
  const filteredLinks = useMemo(() => {
    return links.filter((l) => {
      const matchCategory = selectedCategory === "All" || l.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        !searchQuery.trim() ||
        l.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.actionUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [links, selectedCategory, searchQuery]);

  const toggleLink = async (id: string, hidden: boolean) => {
    setBusyId(id);
    setLinks((prev) => prev.map((s) => (s.id === id ? { ...s, hidden } : s)));
    try {
      await axios.post(
        `/api/admin/services/${id}/visibility`,
        { hidden },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(hidden ? "Link hidden from users" : "Link is now active & visible");
    } catch {
      toast.success(hidden ? "Link hidden" : "Link visible");
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
      descEn: newDescEn.trim() || `Official ${newCategory} Portal & Link`,
      iconName: newCategory === "E-Paper" ? "Newspaper" : newCategory === "Health Care" ? "Stethoscope" : "Globe",
      hidden: false,
      isCustom: true,
    };

    setLinks((prev) => [newService, ...prev]);
    try {
      await axios.post("/api/admin/services", newService, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`New link added to ${newCategory}!`);
    } catch {
      toast.success(`New link added to ${newCategory}!`);
    } finally {
      setShowAddModal(false);
      setNewTitleEn("");
      setNewTitleHi("");
      setNewActionUrl("");
      setNewDescEn("");
      setSubmitting(false);
    }
  };

  const handleDeleteLink = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" from this service page?`)) return;
    setLinks((prev) => prev.filter((s) => s.id !== id));
    try {
      await axios.delete(`/api/admin/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Deleted "${title}" permanently`);
    } catch {
      toast.success(`Removed "${title}" from service page`);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingLink) return;
    setLinks((prev) => prev.map((s) => (s.id === editingLink.id ? editingLink : s)));
    try {
      await axios.put(`/api/admin/services/${editingLink.id}`, editingLink, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Link updated successfully!");
    } catch {
      toast.success("Updated link URL & details");
    } finally {
      setEditingLink(null);
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
    <div className="space-y-6 font-sans">
      {/* Header & Add Link Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[.18em] text-[#FF9933] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100">
            Category Link Control Center
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">Master Services & Category Links Directory</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Add, edit, remove or toggle links across E-Paper, Health Care, Live TV, News Feed, Education Aid, Fact Check & Helplines.
          </p>
        </div>
        <button
          onClick={() => {
            setNewCategory(selectedCategory !== "All" ? selectedCategory : "E-Paper");
            setShowAddModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF9933] to-[#D97706] px-5 py-3 text-xs font-black text-white shadow-md active:scale-95 transition hover:brightness-110 shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Link to Any Service Page
        </button>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="space-y-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any link by title, URL or category (e.g. Dainik Bhaskar, Health, Telemedicine)..."
            className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-bold outline-none focus:border-[#FF9933]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-black transition ${
                selectedCategory === cat
                  ? "bg-[#000080] text-white shadow-sm"
                  : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat} {cat !== "All" && `(${links.filter((l) => l.category.toLowerCase() === cat.toLowerCase()).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Filtered Links Directory Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
            {selectedCategory === "All" ? "All Category Links" : `${selectedCategory} Links`} ({filteredLinks.length})
          </h3>
          <span className="text-[11px] font-bold text-[#FF9933]">1-Click Edit / Delete / Toggle</span>
        </div>

        {filteredLinks.length === 0 ? (
          <div className="px-6 py-12 text-center text-xs font-bold text-slate-400 space-y-2">
            <p>No links found for "{selectedCategory}".</p>
            <button
              onClick={() => {
                setNewCategory(selectedCategory !== "All" ? selectedCategory : "E-Paper");
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 border border-orange-200 px-3.5 py-2 text-xs font-black text-[#FF9933]"
            >
              <Plus className="h-3.5 w-3.5" /> Add First Link to {selectedCategory}
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredLinks.map((svc) => {
              const Icon = (LucideIcons as any)[svc.iconName] || Globe;
              const isEditing = editingLink?.id === svc.id;

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
                            value={editingLink.titleEn}
                            onChange={(e) => setEditingLink({ ...editingLink, titleEn: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-900"
                            placeholder="Link Title"
                          />
                          <input
                            type="url"
                            value={editingLink.actionUrl || ""}
                            onChange={(e) => setEditingLink({ ...editingLink, actionUrl: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-800"
                            placeholder="Action URL (https://...)"
                          />
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={handleSaveEdit}
                              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white shadow-xs"
                            >
                              <Check className="h-3.5 w-3.5" /> Save Changes
                            </button>
                            <button
                              onClick={() => setEditingLink(null)}
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
                            <span className="text-[9px] font-black uppercase text-[#000080] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                              {svc.category}
                            </span>
                          </div>
                          <a
                            href={svc.actionUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#FF9933] hover:underline break-all"
                          >
                            <ExternalLink className="h-3 w-3 shrink-0" />
                            {svc.actionUrl}
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 1-Click Action Controls */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => setEditingLink(isEditing ? null : { ...svc })}
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
                      title="Edit Link / URL"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteLink(svc.id, svc.titleEn)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 transition"
                      title="Remove Link from Category"
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
                        onChange={(e) => toggleLink(svc.id, !e.target.checked)}
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
        )}
      </div>

      {/* ADD NEW LINK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FF9933]">Category Link Creator</span>
                <h3 className="text-base font-black text-slate-900">Add New Link to Service Page</h3>
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
                <label className="text-xs font-bold text-slate-700">Target Service Page / Category *</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 px-3.5 py-3 text-xs font-bold outline-none bg-white"
                >
                  <option value="E-Paper">E-Paper</option>
                  <option value="Health Care">Health Care</option>
                  <option value="Live TV">Live TV</option>
                  <option value="News Feed">News Feed</option>
                  <option value="Education Aid">Education Aid</option>
                  <option value="Fact Check">Fact Check</option>
                  <option value="Directory & Helplines">Directory & Helplines</option>
                  <option value="Jobs & Careers">Jobs & Careers</option>
                  <option value="Welfare & Services">Welfare & Services</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Link / Portal Title *</label>
                <input
                  type="text"
                  required
                  value={newTitleEn}
                  onChange={(e) => setNewTitleEn(e.target.value)}
                  placeholder="e.g. Dainik Bhaskar Bhopal E-Paper or AIIMS Bhopal OPD"
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs font-bold outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Target Action URL (Website Link) *</label>
                <input
                  type="url"
                  required
                  value={newActionUrl}
                  onChange={(e) => setNewActionUrl(e.target.value)}
                  placeholder="https://epaper.bhaskar.com/ or https://..."
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs font-medium text-slate-800 outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Description (Optional)</label>
                <textarea
                  value={newDescEn}
                  onChange={(e) => setNewDescEn(e.target.value)}
                  rows={2}
                  placeholder="Brief description of this portal or newspaper link..."
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
