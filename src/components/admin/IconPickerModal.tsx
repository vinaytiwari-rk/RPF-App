import React, { useState } from "react";
import {
  Search,
  X,
  BadgePlus,
  HeartPulse,
  Briefcase,
  ClipboardList,
  Heart,
  Users,
  TreePine,
  Landmark,
  AlertCircle,
  Sprout,
  FileText,
  GraduationCap,
  AlertTriangle,
  HandCoins,
  ShieldAlert,
  Calendar,
  Newspaper,
  Radio,
  Bus,
  Sparkles,
  Flag,
  Wrench,
  Calculator,
  Clock,
  Wind,
  Tv,
  ShieldCheck,
  BookOpen,
  Droplets,
  Trash2,
  Stethoscope,
  Activity,
  Award,
  TrendingUp,
  Settings,
  HelpCircle,
  Info,
  Phone,
  Mail,
  Lock,
  User,
  Compass,
  Zap,
  Globe,
  Flame,
  CheckCircle2,
  Sliders,
  DollarSign,
  Coffee,
  Smile,
  Check
} from "lucide-react";

export const AVAILABLE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  BadgePlus,
  HeartPulse,
  Briefcase,
  ClipboardList,
  Heart,
  Users,
  TreePine,
  Landmark,
  AlertCircle,
  Sprout,
  FileText,
  GraduationCap,
  AlertTriangle,
  HandCoins,
  ShieldAlert,
  Calendar,
  Newspaper,
  Radio,
  Bus,
  Sparkles,
  Flag,
  Wrench,
  Calculator,
  Clock,
  Wind,
  Tv,
  ShieldCheck,
  BookOpen,
  Droplets,
  Trash2,
  Stethoscope,
  Activity,
  Award,
  TrendingUp,
  Settings,
  HelpCircle,
  Info,
  Phone,
  Mail,
  Lock,
  User,
  Compass,
  Zap,
  Globe,
  Flame,
  CheckCircle2,
  Sliders,
  DollarSign,
  Coffee,
  Smile,
  BriefcaseBusiness: Briefcase,
  UsersRound: Users,
  CalendarDays: Calendar
};

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIcon: string;
  onSelectIcon: (iconName: string) => void;
  title?: string;
}

export default function IconPickerModal({
  isOpen,
  onClose,
  selectedIcon,
  onSelectIcon,
  title = "Select an Icon (आइकन चुनें)"
}: IconPickerModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const iconKeys = Object.keys(AVAILABLE_ICONS);
  const filteredKeys = iconKeys.filter((key) =>
    key.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{title}</h3>
              <p className="text-[11px] text-slate-500">
                Click any icon below to select it directly (कोई कोडिंग नहीं)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search icon name (e.g. Heart, Health, Users, Award)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              autoFocus
            />
          </div>
        </div>

        {/* Icons Grid */}
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 grid grid-cols-4 sm:grid-cols-6 gap-2.5">
          {filteredKeys.map((iconName) => {
            const IconComp = AVAILABLE_ICONS[iconName];
            const isSelected = selectedIcon === iconName;
            return (
              <button
                key={iconName}
                onClick={() => {
                  onSelectIcon(iconName);
                  onClose();
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center group ${
                  isSelected
                    ? "bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 text-amber-700"
                    : "border-slate-200 hover:border-amber-300 hover:bg-slate-50 text-slate-700"
                }`}
                title={iconName}
              >
                <div className="relative">
                  <IconComp className="w-6 h-6 mb-1 text-slate-700 group-hover:text-amber-600 transition" />
                  {isSelected && (
                    <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[8px]">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <span className="text-[9.5px] font-medium truncate w-full group-hover:font-semibold">
                  {iconName}
                </span>
              </button>
            );
          })}
          {filteredKeys.length === 0 && (
            <div className="col-span-full py-8 text-center text-xs text-slate-400">
              No matching icons found. Try searching with another term.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            Selected: <strong className="text-slate-800">{selectedIcon || "None"}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
