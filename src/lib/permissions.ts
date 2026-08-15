/** Permission helpers. Native permission plugins can be wired behind these functions later. */
export type PermissionName = "camera" | "microphone" | "geolocation" | "notifications";
export type PermissionStatus = "granted" | "denied" | "prompt" | "unsupported" | "unknown";

export async function getPermissionStatus(name: PermissionName): Promise<PermissionStatus> {
  try {
    if (name === "notifications") {
      if (typeof Notification === "undefined") return "unsupported";
      return Notification.permission;
    }
    if (typeof navigator === "undefined" || !navigator.permissions?.query) return "unknown";
    const permissionName = name === "geolocation" ? "geolocation" : name as PermissionName;
    const result = await navigator.permissions.query({ name: permissionName as PermissionName & PermissionName });
    return result.state;
  } catch {
    return "unknown";
  }
}

export async function requestNotificationPermission(): Promise<PermissionStatus> {
  if (typeof Notification === "undefined") return "unsupported";
  try { return await Notification.requestPermission(); } catch { return "unknown"; }
}
