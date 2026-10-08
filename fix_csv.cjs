const fs = require('fs');

let c = fs.readFileSync('src/pages/admin/studios/DashboardStudio.tsx', 'utf8');

c = c.replace(/const exportCsv = \([\s\S]*?link\.click\(\);\n  \};/, `const exportCsv = (resource: string, filename: string) => {
    const targetData: Row[] = Array.isArray((data as any)[resource]) ? (data as any)[resource] : [];
    if (!targetData.length) return;
    const headers = Object.keys(targetData[0]).join(",");
    const rows = targetData.map((row) =>
      Object.values(row)
        .map((v) => \`"$\{String(v ?? "").replace(/"/g, '""')}"\`)
        .join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", \`$\{filename}_$\{Date.now()}.csv\`);
    document.body.appendChild(link);
    link.click();
  };`);

fs.writeFileSync('src/pages/admin/studios/DashboardStudio.tsx', c, 'utf8');
console.log('Fixed exportCsv');
