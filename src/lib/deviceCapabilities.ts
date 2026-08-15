/**
 * RPF Device Capability Layer
 *
 * Centralizes feature detection so UI/features do not assume that a phone has
 * a camera, sensors, notifications, files, geolocation, or native bridges.
 * Native Capacitor adapters can be added behind these same functions later.
 */
export type DeviceCapabilities = {
  camera: boolean;
  microphone: boolean;
  geolocation: boolean;
  notifications: boolean;
  files: boolean;
  share: boolean;
  vibration: boolean;
  mediaDevices: boolean;
  deviceMotion: boolean;
  deviceOrientation: boolean;
  clipboard: boolean;
  online: boolean;
};

export function getDeviceCapabilities(): DeviceCapabilities {
  const w = typeof window !== "undefined" ? window : undefined;
  const n = typeof navigator !== "undefined" ? navigator : undefined;
  return {
    camera: !!n?.mediaDevices?.getUserMedia,
    microphone: !!n?.mediaDevices?.getUserMedia,
    geolocation: !!n?.geolocation,
    notifications: typeof Notification !== "undefined",
    files: typeof File !== "undefined" && typeof FileReader !== "undefined",
    share: !!n && typeof (n as Navigator & { share?: unknown }).share === "function",
    vibration: !!n && typeof n.vibrate === "function",
    mediaDevices: !!n?.mediaDevices,
    deviceMotion: typeof w !== "undefined" && "DeviceMotionEvent" in w,
    deviceOrientation: typeof w !== "undefined" && "DeviceOrientationEvent" in w,
    clipboard: !!n?.clipboard,
    online: n?.onLine ?? true,
  };
}

export async function shareContent(data: ShareData): Promise<boolean> {
  const share = typeof navigator !== "undefined" ? (navigator as Navigator & { share?: (data: ShareData) => Promise<void> }).share : undefined;
  if (!share) return false;
  try { await share(data); return true; } catch { return false; }
}

export function vibrate(pattern: number | number[] = 20): boolean {
  try { return typeof navigator !== "undefined" && !!navigator.vibrate?.(pattern); } catch { return false; }
}

export async function getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
  if (!navigator.geolocation) throw new Error("Location is not available on this device");
  return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, options));
}

export async function requestCameraStream(facingMode: "user" | "environment" = "environment"): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera is not available on this device");
  return navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false });
}

export function stopMediaStream(stream?: MediaStream | null): void {
  stream?.getTracks().forEach(track => track.stop());
}
