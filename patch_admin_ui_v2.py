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
chart_data_snippet = """                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
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
                </div>"""

# Replace exactly the block of the bars map
old_bar_code = """                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-black uppercase text-slate-800">Operational Summary</span>
                  <button onClick={exportToCSV} className="bg-indigo-600 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                    <Download className="w-3 h-3" /> Export CSV
                  </button>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Pending", count: pendingGrievances, color: "bg-amber-500", rawColor: "text-amber-600" },
                    { label: "In Progress", count: progressGrievances, color: "bg-blue-500", rawColor: "text-blue-600" },
                    { label: "Resolved / Closed", count: resolvedGrievances, color: "bg-green-500", rawColor: "text-green-600" }
                  ].map(bar => {
                    const percentage = totalGrievances > 0 ? (bar.count / totalGrievances) * 100 : 0;
                    return (
                      <div key={bar.label} className="space-y-0.5">
                        <div className="flex justify-between text-[9px] uppercase font-black">
                          <span className="text-slate-500">{bar.label}</span>
                          <span className={bar.rawColor}>{bar.count}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${bar.color} transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>"""

content = content.replace(old_bar_code, chart_data_snippet)


# 4. Empty States Replacement
content = content.replace(
    '<p className="text-slate-400 text-[10.5px] text-center font-bold py-2">No custom schemes appended yet.</p>',
    '<EmptyState icon={Inbox} title="No Services" message="No custom schemes appended yet." />'
)
content = content.replace(
    '<p className="text-xs font-bold">No pending card registrations found.</p>',
    '<EmptyState icon={CreditCard} title="All Caught Up" message="No pending card registrations found." />'
)
content = content.replace(
    '<div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs font-bold">No grievances logged.</div>',
    '<EmptyState icon={ShieldAlert} title="Inbox Empty" message="No grievances logged." />'
)
content = content.replace(
    '<div className="text-center py-6 text-slate-400 border border-slate-100 rounded-2xl bg-slate-50/50">No active campaigns.</div>',
    '<EmptyState icon={Award} title="No Campaigns" message="No active campaigns." />'
)
content = content.replace(
    '<div className="text-center py-6 text-slate-400 border border-slate-100 rounded-2xl bg-slate-50/50">No registered volunteers found.</div>',
    '<EmptyState icon={Users} title="No Volunteers" message="No registered volunteers found." />'
)

with open('src/pages/AdminDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched AdminDashboard.tsx accurately")
