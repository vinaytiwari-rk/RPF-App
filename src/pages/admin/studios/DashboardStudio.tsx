import React from "react";

export default function DashboardStudio() {
  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm min-h-[500px]">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900">Dashboard Studio</h2>
          <p className="text-xs font-medium text-slate-500">Live metrics and overview of the RPF App ecosystem.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Placeholder cards for later */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Users</p>
          <p className="text-2xl font-black text-slate-800 mt-1">...</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Volunteers</p>
          <p className="text-2xl font-black text-slate-800 mt-1">...</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pending Cards</p>
          <p className="text-2xl font-black text-slate-800 mt-1">...</p>
        </div>
      </div>
    </div>
  );
}
