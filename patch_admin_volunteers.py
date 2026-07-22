import re

with open('src/pages/AdminDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add allocation state
state_add = """
  const [allocationInputs, setAllocationInputs] = useState<{[key: string]: string}>({});
"""
content = re.sub(
    r'const \[taskTitleEn, setTaskTitleEn\] = useState\(""\);',
    r'const [taskTitleEn, setTaskTitleEn] = useState("");\n' + state_add,
    content
)

# Add handler functions
handlers = """
  const handleApproveVolunteer = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/volunteers/${id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchCampaignsAndVolunteers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAllocateVolunteer = async (id: string) => {
    try {
      const allocation = allocationInputs[id] || "";
      if (!allocation) return;
      const res = await fetch(`/api/volunteers/${id}/allocate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allocation })
      });
      if (res.ok) fetchCampaignsAndVolunteers();
    } catch (err) {
      console.error(err);
    }
  };
"""

content = re.sub(
    r'const handleDeleteVolunteer = async \(id: string\) => \{',
    handlers.strip() + '\n\n  const handleDeleteVolunteer = async (id: string) => {',
    content
)

# Replace the volunteer mapping block
map_replace = """
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-500 block tracking-wider mb-2">Pending Approval ({volunteers.filter(v => v.approval_status === 'pending').length})</span>
                    <div className="space-y-2">
                      {volunteers.filter(v => v.approval_status === 'pending').map((v: any) => (
                        <div key={v.id} className="bg-amber-50/50 border border-amber-200/80 p-3.5 rounded-2xl flex justify-between items-center">
                          <div>
                            <span className="font-extrabold text-slate-800 text-xs block">{v.name || v.full_name}</span>
                            <span className="text-[9px] text-slate-500 font-bold block mt-0.5">Mobile: {v.mobile} | Reg: {v.registration_number}</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleApproveVolunteer(v.id, 'rejected')} className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg text-[9px] uppercase font-black transition">Reject</button>
                            <button onClick={() => handleApproveVolunteer(v.id, 'approved')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-[9px] uppercase font-black transition">Approve</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase text-green-600 block tracking-wider mb-2">Active Field Volunteers ({volunteers.filter(v => v.approval_status === 'approved' || !v.approval_status).length})</span>
                    <div className="space-y-2">
                      {volunteers.filter(v => v.approval_status === 'approved' || !v.approval_status).map((v: any) => (
                        <div key={v.id} className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl space-y-2.5">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-extrabold text-slate-800 text-xs block">{v.name || v.full_name}</span>
                              <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Allocation: {v.constituency_allocation || "Unassigned"}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-amber-600 font-black block text-xs bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">{v.points || 0} pts</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-200/60 pt-2">
                            <input 
                              type="text" 
                              placeholder="Loc/Ward" 
                              value={allocationInputs[v.id] || ""} 
                              onChange={e => setAllocationInputs({...allocationInputs, [v.id]: e.target.value})} 
                              className="border border-slate-200 rounded p-1 text-[9px] w-20"
                            />
                            <button onClick={() => handleAllocateVolunteer(v.id)} className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-2 py-1 rounded text-[9px] uppercase font-black">Set</button>
                            <div className="flex-1"></div>
                            <button onClick={() => assigningTaskFor === v.id ? setAssigningTaskFor(null) : setAssigningTaskFor(v.id)} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-[9px] uppercase font-black transition active:scale-95">Assign Task</button>
                            <button onClick={() => handleUpdatePoints(v.id, v.points || 0, -50)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1 rounded-lg text-[9px] uppercase font-black transition active:scale-95">-50</button>
                            <button onClick={() => handleUpdatePoints(v.id, v.points || 0, 50)} className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-lg text-[9px] uppercase font-black transition active:scale-95">+50</button>
                            <button onClick={() => handleDeleteVolunteer(v.id)} className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 px-2 py-1 rounded-lg transition active:scale-95"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                          
                          {assigningTaskFor === v.id && (
                            <form onSubmit={(e) => handleAssignTask(e, v.id)} className="mt-3 bg-white border border-indigo-100 p-3 rounded-xl space-y-2 animate-fadeIn">
                              <input type="text" placeholder="Task Title (English)" required value={taskTitleEn} onChange={e => setTaskTitleEn(e.target.value)} className="w-full border border-slate-200 bg-slate-50 p-2 rounded-lg text-[10px]" />
                              <input type="text" placeholder="कार्य शीर्षक (Hindi)" value={taskTitleHi} onChange={e => setTaskTitleHi(e.target.value)} className="w-full border border-slate-200 bg-slate-50 p-2 rounded-lg text-[10px]" />
                              <textarea placeholder="Task Description" required value={taskDescEn} onChange={e => setTaskDescEn(e.target.value)} className="w-full border border-slate-200 bg-slate-50 p-2 rounded-lg text-[10px] h-16" />
                              <input type="number" placeholder="Points Reward" required min="10" value={taskPoints} onChange={e => setTaskPoints(Number(e.target.value))} className="w-full border border-slate-200 bg-slate-50 p-2 rounded-lg text-[10px]" />
                              <div className="flex gap-2 justify-end pt-1">
                                <button type="button" onClick={() => setAssigningTaskFor(null)} className="px-3 py-1.5 text-[9px] font-bold text-slate-500 hover:text-slate-700">CANCEL</button>
                                <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-black uppercase">Send Task</button>
                              </div>
                            </form>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
"""

content = re.sub(
    r'<span className="text-\[10px\] font-black uppercase text-slate-400 block tracking-wider">Registered\s+Helpers \(\{volunteers\.length\}\)</span>.*?\{volunteers\.length === 0 \? \(.*?\)\s*:\s*\(\s*volunteers\.map\(\(v: any\) => \(.*?\}\)\)\s*\)\}\s*</div>',
    map_replace.strip() + "\n                </div>",
    content,
    flags=re.DOTALL
)

with open('src/pages/AdminDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched AdminDashboard.tsx for volunteer approval workflow")
