const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/studios/ProfileStudio.tsx', 'utf8');

const uploadFunction = `
  const handleImageUpload = async (key: string, file: File | null) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    
    const toastId = toast.loading("Uploading image...");
    try {
      const token = localStorage.getItem("token") || "";
      const res = await axios.post("/api/admin/upload", formData, {
        headers: { 
          Authorization: \`Bearer \${token}\`,
          "Content-Type": "multipart/form-data" 
        }
      });
      if (res.data.success) {
        handleChange(key, res.data.url);
        toast.success("Image uploaded successfully!", { id: toastId });
      } else {
        toast.error(res.data.message || "Upload failed", { id: toastId });
      }
    } catch (e) {
      toast.error("Upload failed", { id: toastId });
    }
  };
`;

// Insert the function before the return statement
c = c.replace(/return \(/, uploadFunction + '\n  return (');

// Replace cert_volunteer_bg
c = c.replace(
  /<input\s+type="text"\s+placeholder="https:\/\/..."\s+value=\{configs\.cert_volunteer_bg \|\| ""\}\s+onChange=\{\(e\) => handleChange\("cert_volunteer_bg", e\.target\.value\)\}\s+className="flex-1 [^"]+"[^\/]*\/>/,
  `<input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload("cert_volunteer_bg", e.target.files?.[0] || null)}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                    />`
);

// Replace cert_donor_bg
c = c.replace(
  /<input\s+type="text"\s+placeholder="https:\/\/..."\s+value=\{configs\.cert_donor_bg \|\| ""\}\s+onChange=\{\(e\) => handleChange\("cert_donor_bg", e\.target\.value\)\}\s+className="flex-1 [^"]+"[^\/]*\/>/,
  `<input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload("cert_donor_bg", e.target.files?.[0] || null)}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                    />`
);


fs.writeFileSync('src/pages/admin/studios/ProfileStudio.tsx', c, 'utf8');
console.log('Patched ProfileStudio');
