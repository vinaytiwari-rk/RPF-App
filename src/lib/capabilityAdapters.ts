/**
 * Platform-neutral capability adapter contracts.
 *
 * Feature code depends on these contracts, never on browser/Capacitor APIs.
 * Native adapters can replace the web adapter without changing feature code.
 */
import { getPlatform, type RPFPlatform } from "./platform";
import {
  getDeviceCapabilities,
  getCurrentPosition,
  requestCameraStream,
  shareContent,
  vibrate,
  stopMediaStream,
  type DeviceCapabilities,
} from "./deviceCapabilities";
import { getPermissionStatus, requestNotificationPermission, type PermissionName, type PermissionStatus } from "./permissions";

export type CapabilityAdapter = {
  platform: RPFPlatform;
  detect(): DeviceCapabilities;
  permission(name: PermissionName): Promise<PermissionStatus>;
  requestNotificationPermission(): Promise<PermissionStatus>;
  currentPosition(options?: PositionOptions): Promise<GeolocationPosition>;
  cameraStream(facingMode?: "user" | "environment"): Promise<MediaStream>;
  share(data: ShareData): Promise<boolean>;
  vibrate(pattern?: number | number[]): boolean;
  stopMediaStream(stream?: MediaStream | null): void;
};

/** WebView/browser adapter. Capacitor native adapters can implement the same contract later. */
export const webCapabilityAdapter: CapabilityAdapter = {
  platform: "web",
  detect: getDeviceCapabilities,
  permission: getPermissionStatus,
  requestNotificationPermission,
  currentPosition: getCurrentPosition,
  cameraStream: requestCameraStream,
  share: shareContent,
  vibrate,
  stopMediaStream,
};

/** Central capability entry point used by feature modules. */
export function getCapabilityAdapter(): CapabilityAdapter {
  // Keep platform selection centralized. Native adapters are intentionally injectable
  // rather than imported into pages, preserving the Phase 1 boundary.
  const platform = getPlatform();
  return { ...webCapabilityAdapter, platform };
}
