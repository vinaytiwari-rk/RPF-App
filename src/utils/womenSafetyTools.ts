// src/utils/womenSafetyTools.ts

// Web Audio API Synthesizers
let audioCtx: AudioContext | null = null;
let sirenOsc: OscillatorNode | null = null;
let sirenGain: GainNode | null = null;
let sirenInterval: any = null;

let ringtoneOsc1: OscillatorNode | null = null;
let ringtoneOsc2: OscillatorNode | null = null;
let ringtoneGain: GainNode | null = null;
let ringtoneInterval: any = null;

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
};

export const playSiren = () => {
  initAudio();
  if (!audioCtx) return;
  stopSiren();

  sirenOsc = audioCtx.createOscillator();
  sirenGain = audioCtx.createGain();

  sirenOsc.type = "square";
  sirenOsc.frequency.setValueAtTime(750, audioCtx.currentTime);
  sirenGain.gain.setValueAtTime(0.8, audioCtx.currentTime);

  sirenOsc.connect(sirenGain);
  sirenGain.connect(audioCtx.destination);
  sirenOsc.start();

  const sweep = () => {
    if (!audioCtx || !sirenOsc) return;
    const t = audioCtx.currentTime;
    sirenOsc.frequency.cancelScheduledValues(t);
    sirenOsc.frequency.setValueAtTime(750, t);
    sirenOsc.frequency.linearRampToValueAtTime(1450, t + 0.2);
    sirenOsc.frequency.linearRampToValueAtTime(750, t + 0.4);
  };

  sweep();
  sirenInterval = setInterval(sweep, 400);
};

export const stopSiren = () => {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  if (sirenOsc) {
    try { sirenOsc.stop(); sirenOsc.disconnect(); } catch(e){}
    sirenOsc = null;
  }
  if (sirenGain) {
    try { sirenGain.disconnect(); } catch(e){}
    sirenGain = null;
  }
};

export const playRingtone = () => {
  initAudio();
  if (!audioCtx) return;
  stopRingtone();

  const ring = () => {
    if (!audioCtx) return;
    ringtoneOsc1 = audioCtx.createOscillator();
    ringtoneOsc2 = audioCtx.createOscillator();
    ringtoneGain = audioCtx.createGain();

    ringtoneOsc1.frequency.setValueAtTime(440, audioCtx.currentTime);
    ringtoneOsc2.frequency.setValueAtTime(480, audioCtx.currentTime);
    ringtoneGain.gain.setValueAtTime(0.4, audioCtx.currentTime);

    ringtoneOsc1.connect(ringtoneGain);
    ringtoneOsc2.connect(ringtoneGain);
    ringtoneGain.connect(audioCtx.destination);

    ringtoneOsc1.start();
    ringtoneOsc2.start();

    setTimeout(() => {
      try {
        ringtoneOsc1?.stop();
        ringtoneOsc2?.stop();
      } catch(e){}
    }, 2000);
  };

  ring();
  ringtoneInterval = setInterval(ring, 5000);
};

export const stopRingtone = () => {
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
  try {
    ringtoneOsc1?.stop();
    ringtoneOsc2?.stop();
  } catch(e){}
  ringtoneOsc1 = null;
  ringtoneOsc2 = null;
};

export const getRouteSafetyIndex = (routeLight: number, routeCrowd: number, isHi: boolean) => {
  const score = routeLight + routeCrowd;
  if (score >= 5) {
    return {
      safetyClass: isHi ? "✅ सुरक्षित मार्ग" : "✅ Safe Route",
      advice: isHi ? "सलाह: आगे बढ़ें, मार्ग सुरक्षित है।" : "Advice: Proceed, route has active eyes/lights.",
      color: "bg-green-950/30 text-green-400 border-green-900/50"
    };
  } else if (score >= 3) {
    return {
      safetyClass: isHi ? "⚠️ सामान्य सतर्कता आवश्यक" : "⚠️ Caution Advised",
      advice: isHi ? "सलाह: सतर्क रहें और फोन चालू रखें।" : "Advice: Keep calls active and stay alert.",
      color: "bg-amber-950/30 text-amber-400 border-amber-900/50"
    };
  } else {
    return {
      safetyClass: isHi ? "🚨 उच्च जोखिम मार्ग" : "🚨 High Risk Route",
      advice: isHi ? "सलाह: यदि संभव हो तो दूसरा मार्ग चुनें या साथी के साथ जाएं।" : "Advice: Avoid if possible or travel accompanied.",
      color: "bg-red-950/30 text-red-400 border-red-900/50"
    };
  }
};
