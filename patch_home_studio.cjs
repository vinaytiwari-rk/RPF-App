const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/studios/HomeStudio.tsx', 'utf8');

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

// Replace founder_image_url input
c = c.replace(
  /<input\s+type="text"\s+placeholder="https:\/\/..."\s+value=\{configs\.founder_image_url \|\| ""\}\s+onChange=\{\(e\) => handleChange\("founder_image_url", e\.target\.value\)\}\s+className="w-full [^"]+"[^\/]*\/>/,
  `<div className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload("founder_image_url", e.target.files?.[0] || null)}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                    />
                  </div>`
);

// Replace foundation_logo input
c = c.replace(
  /<input\s+type="text"\s+placeholder="https:\/\/..."\s+value=\{configs\.foundation_logo \|\| ""\}\s+onChange=\{\(e\) => handleChange\("foundation_logo", e\.target\.value\)\}\s+className="w-full [^"]+"[^\/]*\/>/,
  `<div className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload("foundation_logo", e.target.files?.[0] || null)}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                    />
                  </div>
                  {configs.foundation_logo && (
                    <img src={configs.foundation_logo} alt="Preview" className="mt-2 h-16 object-contain border border-slate-200 rounded-lg p-2" />
                  )}`
);

// Replace splash_logo input
c = c.replace(
  /<input\s+type="text"\s+placeholder="https:\/\/..."\s+value=\{configs\.splash_logo \|\| ""\}\s+onChange=\{\(e\) => handleChange\("splash_logo", e\.target\.value\)\}\s+className="w-full [^"]+"[^\/]*\/>/,
  `<div className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload("splash_logo", e.target.files?.[0] || null)}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                    />
                  </div>
                  {configs.splash_logo && (
                    <img src={configs.splash_logo} alt="Preview" className="mt-2 h-16 object-contain border border-slate-200 rounded-lg p-2" />
                  )}`
);

fs.writeFileSync('src/pages/admin/studios/HomeStudio.tsx', c, 'utf8');
console.log('Patched HomeStudio');
