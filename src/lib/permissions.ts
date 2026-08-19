import { Capacitor, registerPlugin } from "@capacitor/core";

export type PermissionName = "camera" | "microphone" | "geolocation" | "notifications" | "contacts" | "nearbyDevices" | "images" | "audio";
export type PermissionStatus = "granted" | "denied" | "prompt" | "unsupported" | "unknown";
export type NativeLocation = { latitude: number; longitude: number; accuracy: number; timestamp: number };
type NativePermissionPlugin = { request(options: { permission: string }): Promise<{ status: PermissionStatus }>; check(options: { permission: string }): Promise<{ status: PermissionStatus }>; currentLocation(): Promise<NativeLocation>; };
const NativePermissions = registerPlugin<NativePermissionPlugin>("NativePermissions");
const nativeName: Record<PermissionName, string> = { geolocation: "location", camera: "camera", microphone: "microphone", notifications: "notifications", contacts: "contacts", nearbyDevices: "nearbyDevices", images: "images", audio: "audio" };
function normalizeNotificationPermission(value: NotificationPermission): PermissionStatus { return value === "granted" ? "granted" : value === "denied" ? "denied" : "prompt"; }

export async function getPermissionStatus(name: PermissionName): Promise<PermissionStatus> { try { if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android") return (await NativePermissions.check({ permission: nativeName[name] })).status; if (name === "notifications") return typeof Notification === "undefined" ? "unsupported" : normalizeNotificationPermission(Notification.permission); if (typeof navigator === "undefined" || !navigator.permissions?.query) return "unknown"; return (await navigator.permissions.query({ name: name as PermissionName } as PermissionDescriptor)).state as PermissionStatus; } catch { return "unknown"; } }

/** Opens the real Android system permission dialog on native Android. */
export async function requestPermission(name: PermissionName): Promise<PermissionStatus> { try { if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android") return (await NativePermissions.request({ permission: nativeName[name] })).status; if (name === "notifications") return typeof Notification === "undefined" ? "unsupported" : normalizeNotificationPermission(await Notification.requestPermission()); if (name === "geolocation") { if (!navigator.geolocation) return "unsupported"; return await new Promise(resolve => navigator.geolocation.getCurrentPosition(() => resolve("granted"), () => resolve("denied"), { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 })); } if ((name === "camera" || name === "microphone") && navigator.mediaDevices?.getUserMedia) { const stream = await navigator.mediaDevices.getUserMedia(name === "camera" ? { video: true } : { audio: true }); stream.getTracks().forEach(t => t.stop()); return "granted"; } return "unsupported"; } catch { return "denied"; } }

export async function getNativeCurrentLocation(): Promise<NativeLocation | null> { try { if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android") return await NativePermissions.currentLocation(); return null; } catch { return null; } }
export async function requestNotificationPermission(): Promise<PermissionStatus> { return requestPermission("notifications"); }
