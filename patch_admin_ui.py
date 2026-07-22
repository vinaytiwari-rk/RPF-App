import re

with open('src/pages/AdminDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
imports = """
import jsPDF from "jspdf";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import EmptyState from "../components/EmptyState";
import { 
  ArrowLeft, Settings, Users, AlertTriangle, MessageSquare, 
  Check, X, Save, CheckCircle, Plus, Trash2, Image, 
  Download, BarChart2, ShieldAlert, Megaphone, Grid, Heart,
  Award, Bell, Inbox, CreditCard, Menu, FileText
} from "lucide-react";
"""
content = re.sub(
    r'import \{[\s\S]*?\} from "lucide-react";',
    imports.strip(),
    content
)

# 2. PDF Export Function
export_pdf_func = """
    const exportToPDF = () => {
      if (!grievances || grievances.length === 0) return;
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("RP Foundation - Grievance Report", 14, 20);
      
      doc.setFontSize(10);
      let y = 30;
      grievances.forEach((g, i) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(`${i + 1}. [${g.status.toUpperCase()}] ${g.title} (${g.category}) - by ${g.citizenName}`, 14, y);
        y += 7;
      });
      doc.save(`RP_Grievances_${new Date().toISOString().slice(0, 10)}.pdf`);
    };
"""
content = content.replace(
    'const exportToCSV = () => {',
    export_pdf_func.strip() + '\n\n    const exportToCSV = () => {'
)

# 3. Analytics Charts
chart_data_snippet = """
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-black uppercase text-slate-800">Operational Summary</span>
                  <div className="flex gap-2">
                    <button onClick={exportToCSV} className="bg-indigo-600 hover:bg-indigo-700 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1 transition">
                      <Download className="w-3 h-3" /> CSV
                    </button>
                    <button onClick={exportToPDF} className="bg-red-500 hover:bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1 transition">
                      <FileText className="w-3 h-3" /> PDF
                    </button>
                  </div>
                </div>
                <div className="pt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Pending', count: pendingGrievances, fill: '#f59e0b' },
                      { name: 'In Progress', count: progressGrievances, fill: '#3b82f6' },
                      { name: 'Resolved', count: resolvedGrievances, fill: '#22c55e' }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
"""

# Replace the analytics render block
content = re.sub(
    r'<div className="flex justify-between items-center border-b border-slate-100 pb-2">[\s\S]*?(?=<div className="bg-white p-5 border border-slate-200 rounded-3xl shadow-sm space-y-4">)',
    chart_data_snippet.strip() + '\n              </div>\n\n              <div className="bg-white p-5 border border-slate-200 rounded-3xl shadow-sm space-y-4">\n',
    content
)

# 4. Empty States Replacement
content = re.sub(
    r'<p className="text-slate-400 text-\[10\.5px\] text-center font-bold py-2">No custom schemes appended yet\.</p>',
    r'<EmptyState icon={Inbox} title="No Services" message="No custom schemes appended yet." />',
    content
)
content = re.sub(
    r'<p className="text-xs font-bold">No pending card registrations found\.</p>',
    r'<EmptyState icon={CreditCard} title="All Caught Up" message="No pending card registrations found." />',
    content
)
content = re.sub(
    r'<div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs font-bold">No grievances logged\.</div>',
    r'<EmptyState icon={ShieldAlert} title="Inbox Empty" message="No grievances logged." />',
    content
)
content = re.sub(
    r'<div className="text-center py-6 text-slate-400 border border-slate-100 rounded-2xl bg-slate-50/50">No active campaigns\.</div>',
    r'<EmptyState icon={Award} title="No Campaigns" message="No active campaigns." />',
    content
)
content = re.sub(
    r'<div className="text-center py-6 text-slate-400 border border-slate-100 rounded-2xl bg-slate-50/50">No registered volunteers found\.</div>',
    r'<EmptyState icon={Users} title="No Volunteers" message="No registered volunteers found." />',
    content
)

with open('src/pages/AdminDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched AdminDashboard.tsx")
