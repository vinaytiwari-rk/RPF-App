import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Skeleton } from "./ui/Skeleton";
import { useAuth } from "../context/AuthContext";
import FileUpload from "./FileUpload";

interface GenericAdminTabProps {
  endpoint: string;
  title: string;
  columns?: string[];
}

export default function GenericAdminTab({ endpoint, title, columns = ["title", "description"] }: GenericAdminTabProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const { token } = useAuth();

  const [formData, setFormData] = useState<any>({});
  const [imageUrl, setImageUrl] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${endpoint}?page=${page}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data.data || []);
        if (res.data.totalPages) setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(`Error fetching ${title}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token, endpoint, page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Automatically duplicate fields for legacy bilingual support
      const payload: any = { imageUrl, coverImgUrl: imageUrl };
      Object.keys(formData).forEach(key => {
        payload[key] = formData[key];
        payload[`${key}En`] = formData[key];
        payload[`${key}Hi`] = formData[key];
        // Special case for content
        if (key === 'description') {
           payload['content'] = formData[key];
           payload['contentEn'] = formData[key];
           payload['contentHi'] = formData[key];
        }
      });

      await axios.post(
        endpoint,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormData({});
      setImageUrl("");
      toast.success(`${title} added successfully!`);
      fetchData();
    } catch (error) {
      console.error(`Error creating ${title}:`, error);
      toast.error("Failed to add record.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Are you sure?")) return;
    try {
      await axios.delete(`${endpoint}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error(`Error deleting ${title}:`, error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Add New {title}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {columns.map(col => (
              <div key={col} className={col === "description" ? "md:col-span-2" : ""}>
                <label className="text-xs font-bold text-slate-700 block mb-1 capitalize">{col}</label>
                {col === "description" ? (
                  <textarea
                    value={formData[col] || ""}
                    onChange={(e) => setFormData({ ...formData, [col]: e.target.value })}
                    required
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#FF9933] outline-none"
                  />
                ) : (
                  <input
                    type={col.includes('Amount') ? "number" : "text"}
                    value={formData[col] || ""}
                    onChange={(e) => setFormData({ ...formData, [col]: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#FF9933] outline-none"
                  />
                )}
              </div>
            ))}
          </div>

          <FileUpload label="Image Upload" onUploadSuccess={(url) => setImageUrl(url)} />

          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-[#FF9933] hover:bg-[#e68a2e] text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? <Skeleton className="w-4 h-4 rounded-full" /> : <Plus className="w-4 h-4" />}
            Add {title}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">Manage {title}</h2>
        </div>
        <div className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">No records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="p-4 text-xs font-bold text-slate-500">Image</th>
                    <th className="p-4 text-xs font-bold text-slate-500">Title</th>
                    <th className="p-4 text-xs font-bold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item: any, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="p-4">
                        {(item.imageUrl || item.coverImgUrl) && <img src={item.imageUrl || item.coverImgUrl} className="w-12 h-12 rounded object-cover" />}
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-800">{item.title || item.titleEn}</td>
                      <td className="p-4">
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

