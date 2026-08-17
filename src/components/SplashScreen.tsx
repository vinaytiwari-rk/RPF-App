import React from "react";
import { useApp } from "../context/AppContext";

export default function SplashScreen() {
  const { globalSettings } = useApp();
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-white">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-5 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white p-2 shadow-lg">
          <img
            src={globalSettings?.logo_image || "/assets/logo.png"}
            alt="RP Foundation"
            className="h-full w-full object-contain"
          />
        </div>
        <h1 className="text-xl font-black tracking-widest text-[#1C2D42]">RP FOUNDATION</h1>
        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#FF9933]">RPF Jan Seva App</p>
      </div>
    </div>
  );
}
