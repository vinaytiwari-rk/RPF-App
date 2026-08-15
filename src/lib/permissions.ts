/**
 * Cross-platform permission helpers.
 *
 * The web Permission API uses `prompt`, while the Notifications API uses
 * `default`. RPF normalizes both into the same application-level contract.
 * Native Capacitor permission adapters can replace these internals later.
 */
export type PermissionName = "camera" | "microphone" | "geolocation" | "notifications";
export type PermissionStatus = "granted" | "denied" | "prompt" | "unsupported" | "unknown";

function normalizeNotificationPermission(value: NotificationPermission): PermissionStatus {
  if (value === "granted") return "granted";
  if (value === "denied") return "denied";
  return "prompt"; // NotificationPermission "default" maps to app-level "prompt".
}

export async function getPermissionStatus(name: PermissionName): Promise<PermissionStatus> {
  try {
    if (name === "notifications") {
      if (typeof Notification === "undefined") return "unsupported";
      return normalizeNotificationPermission(Notification.permission);
    }

    if (typeof navigator === "undefined" || !navigator.permissions?.query) return "unknown";

    const result = await navigator.permissions.query({
      name: name as PermissionName,
    } as PermissionDescriptor);

    return result.state;
  } catch {
    return "unknown";
  }
}

export async function requestNotificationPermission(): Promise<PermissionStatus> {
  if (typeof Notification === "undefined") return "unsupported";
  try {
    return normalizeNotificationPermission(await Notification.requestPermission());
  } catch {
    return "unknown";
  }
}
