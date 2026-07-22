import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon: Icon, title, message, actionText, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-dashed border-slate-300 rounded-2xl shadow-sm min-h-[250px] animate-fadeIn w-full">
      <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4 shadow-inner">
        <Icon className="w-8 h-8 opacity-70" />
      </div>
      <h3 className="font-display font-black text-lg text-slate-700 mb-1">{title}</h3>
      <p className="text-xs font-bold text-slate-400 max-w-sm mb-5 leading-relaxed">{message}</p>
      
      {actionText && onAction && (
        <button 
          onClick={onAction}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black uppercase tracking-wider text-[10px] px-5 py-2.5 rounded-xl transition active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
