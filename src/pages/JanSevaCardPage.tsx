import { useState } from "react";
import { Download, Image as ImageIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import JanSevaCard from "./JanSevaCard";

export default function JanSevaCardPage() {
  const { user } = useAuth(); const [loading,setLoading]=useState(false);
  const downloadJpeg=async()=>{setLoading(true);try{const el=document.getElementById("jan-seva-card-front");if(!el)throw new Error("Card not ready");const html2canvas=(await import("html2canvas")).default;const canvas=await html2canvas(el,{scale:3,useCORS:true,allowTaint:true,backgroundColor:"#fff",logging:false});const a=document.createElement("a");a.href=canvas.toDataURL("image/jpeg",.95);a.download=`JanSevaCard_${(user?.name||"User").replace(/\s+/g,"_")}.jpg`;a.click();}catch(e){console.error("JPEG generation failed",e);alert("Card image could not be generated. Please try again.")}finally{setLoading(false)}};
  return <div className="relative"><JanSevaCard/><button onClick={downloadJpeg} disabled={loading} className="fixed bottom-20 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-[#E11D48] px-4 py-3 text-[10px] font-black text-white shadow-xl disabled:opacity-60"><ImageIcon className="h-4 w-4"/>{loading?"...":"Download JPEG"}<Download className="h-3.5 w-3.5"/></button></div>;
}
