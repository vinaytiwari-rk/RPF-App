import React from "react";

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-white">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-5 flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl bg-transparent p-1 shadow-lg">
          <img
            src="/assets/rpf-samahit-icon.png"
            alt="RPF समाहित"
            className="h-full w-full object-contain"
          />
        </div>
        <h1 className="text-2xl font-black tracking-wide text-[#1C2D42]">RPF समाहित</h1>
        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#138808]">एक साथ, एक समाज, एक परिवार</p>
      </div>
    </div>
  );
}
