import React, { useState } from "react";
import { Images } from "lucide-react";

const TABS = [
  { id: "banners", label: "Banner Carousel" },
  { id: "quick-actions", label: "Quick Actions" },
  { id: "marquees", label: "Live Marquees & News" },
  { id: "thought", label: "Thought of the Day" },
  { id: "identity", label: "Foundation Identity" },
  { id: "splash", label: "Splash Screen" },
];

export default function HomeStudio() {
  const [activeTab, setActiveTab] = useState("quick-actions");

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#E67817]">
            <Images className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Home Screen Control Studio</h2>
            <p className="text-xs font-medium text-slate-500">
              Manage all banners, quick action buttons, live marquees, quote of the day, and splash screen settings.
            </p>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="mt-6 flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-colors ${
                activeTab === tab.id
                  ? "bg-[#0A192F] text-white shadow-md"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm min-h-[400px]">
        {activeTab === "quick-actions" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-black text-slate-900">Quick Action Shortcut Buttons</h3>
                <p className="text-xs text-slate-500 mt-1">The primary action cards on the home page above the news ticker.</p>
              </div>
              <button className="px-4 py-2 bg-[#C2410C] hover:bg-[#9a340a] text-white text-xs font-bold rounded-xl shadow-sm transition">
                + Add Action
              </button>
            </div>
            
            <div className="text-center py-10 text-slate-400 text-xs font-medium">
              Data table mapping will go here...
            </div>
          </div>
        )}
        
        {/* Other tabs placeholders */}
        {activeTab !== "quick-actions" && (
          <div className="text-center py-10 text-slate-400 text-xs font-medium">
            {TABS.find(t => t.id === activeTab)?.label} configuration will be loaded here.
          </div>
        )}
      </div>
    </div>
  );
}
