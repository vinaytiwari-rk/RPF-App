/** Runtime platform detection. Feature code must depend on this abstraction, not user-agent strings. */
export type RPFPlatform = "android" | "ios" | "web" | "unknown";

export function getPlatform(): RPFPlatform {
  if (typeof window === "undefined" || typeof navigator === "undefined") return "unknown";
  const w = window as Window & { Capacitor?: { getPlatform?: () => string } };
  const native = w.Capacitor?.getPlatform?.();
  if (native === "android" || native === "ios") return native;

  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return "android";
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  return "web";
}

export const isNativePlatform = (): boolean => {
  const platform = getPlatform();
  return platform === "android" || platform === "ios";
};
