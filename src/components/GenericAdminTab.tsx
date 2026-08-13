import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Plus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Skeleton } from "./ui/Skeleton";
import { useAuth } from "../context/AuthContext";
import FileUpload from "./FileUpload";

interface GenericAdminTabProps {
  endpoint: string;
  title: string;
  columns?: string[];
}

/**
 * Generic CRUD tab.
 *
 * Important data-model rule:
 * A logical field is sent once. We do not manufacture fieldEn/fieldHi,
 * contentEn/contentHi or other language-specific duplicate properties.
 * Multilingual presentation is handled by the application's localization
 * layer, while the record keeps one canonical value for each logical field.
 */
export default function GenericAdminTab({
  endpoint,
  title,
  columns = ["title", "description"],
}: GenericAdminTabProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const { token } = useAuth();

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [imageUrl, setImageUrl] = useState("");

  const authConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${endpoint}?page=${page}&limit=50`, authConfig);
      setData(Array.isArray(res.data?.data) ? res.data.data : []);
      if (res.data?.totalPages) setTotalPages(res.data.totalPages);
    } catch (err: any) {
      console.error(`Error fetching ${title}:`, err);
      toast.error(err.response?.data?.error || `Unable to load ${title}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token, endpoint, page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Administrator session expired. Please log in again.");
      return;
    }

    // Do not silently submit blank values. Backend validation remains the
    // final authority, but the admin UI should fail early and clearly.
    const missing = columns.find((column) => {
      const value = formData[column];
      return value === undefined || value === null || String(value).trim() === "";
    });
    if (missing) {
      toast.error(`${missing} is required.`);
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        ...formData,
      };

      // Image is one canonical field. Only include it when an image was
      // actually selected; never create legacy duplicate image fields.
      if (imageUrl) payload.imageUrl = imageUrl;

      const res = await axios.post(endpoint, payload, authConfig);
      if (!res.data?.success) {
        throw new Error(res.data?.error || `Failed to add ${title}.`);
      }

      const created = res.data?.data;
      setFormData({});
      setImageUrl("");

      // Prefer the server-returned persisted record so the UI reflects the
      // database value, not a locally reconstructed object. If the API does
      // not return a row, re-read the endpoint.
      if (created) {
        setData((current) => [created, ...current]);
      } else {
        await fetchData();
      }

      toast.success(`${title} saved successfully.`);
    } catch (error: any) {
      console.error(`Error creating ${title}:`, error);
      toast.error(error.response?.data?.error || error.message || `Failed to save ${title}.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: any) => {
    if (!token || !id) return;
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      const res = await axios.delete(`${endpoint}/${id}`, authConfig);
      if (!res.data?.success) {
        throw new Error(res.data?.error || "Delete failed.");
      }
      setData((current) => current.filter((item) => item.id !== id));
      toast.success(`${title} deleted.`);
    } catch (error: any) {
      console.error(`Error deleting ${title}:`, error);
      toast.error(error.response?.data?.error || error.message || `Unable to delete ${title}.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Add New {title}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {columns.map((col) => (
              <div key={col} className={col === "description" ? "md:col-span-2" : ""}>
                <label className="text-xs font-bold text-slate-700 block mb-1 capitalize">
                  {col}
                </label>
                {col === "description" ? (
                  <textarea
                    value={formData[col] || ""}
                    onChange={(e) =>
                      setFormData((current) => ({ ...current, [col]: e.target.value }))
                    }
                    required
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#FF9933] outline-none"
                  />
                ) : (
                  <input
                    type={col.toLowerCase().includes("amount") ? "number" : "text"}
                    value={formData[col] || ""}
                    onChange={(e) =>
                      setFormData((current) => ({ ...current, [col]: e.target.value }))
                    }
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#FF9933] outline-none"
                  />
                )}
              </div>
            ))}
          </div>

          <FileUpload label="Image Upload" onUploadSuccess={setImageUrl} />

          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-[#FF9933] hover:bg-[#e68a2e] text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {submitting ? "Saving…" : `Add ${title}`}
          </button>
        </form>
      </div>

      <div className="glass-card overflow-hidden">
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
                    <tr key={item.id ?? i} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="p-4">
                        {item.imageUrl && (
                          <img src={item.imageUrl} className="w-12 h-12 rounded object-cover" />
                        )}
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-800">
                        {item.title || item.name || "—"}
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                          aria-label={`Delete ${title}`}
                        >
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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-xs">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="px-3 py-2 border rounded-lg disabled:opacity-40"
          >
            Previous
          </button>
          <span className="font-semibold text-slate-600">Page {page} of {totalPages}</span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            className="px-3 py-2 border rounded-lg disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
