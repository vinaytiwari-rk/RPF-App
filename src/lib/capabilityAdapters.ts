/** Platform-neutral capability adapters. */
import { getPlatform, type RPFPlatform } from "./platform";
import { getDeviceCapabilities, getCurrentPosition, requestCameraStream, shareContent, vibrate, stopMediaStream, type DeviceCapabilities } from "./deviceCapabilities";
import { getNativeCurrentLocation, getPermissionStatus, requestNotificationPermission, type PermissionName, type PermissionStatus } from "./permissions";

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

async function currentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
  const native = await getNativeCurrentLocation();
  if (native) {
    const coords: GeolocationCoordinates = {
      latitude: native.latitude, longitude: native.longitude, accuracy: native.accuracy,
      altitude: null, altitudeAccuracy: null, heading: null, speed: null,
      toJSON: () => ({ latitude: native.latitude, longitude: native.longitude, accuracy: native.accuracy, altitude: null, altitudeAccuracy: null, heading: null, speed: null })
    };
    return { coords, timestamp: native.timestamp, toJSON: () => ({ coords: coords.toJSON(), timestamp: native.timestamp }) } as GeolocationPosition;
  }
  return getCurrentPosition(options);
}

export const webCapabilityAdapter: CapabilityAdapter = {
  platform: "web",
  detect: getDeviceCapabilities,
  permission: getPermissionStatus,
  requestNotificationPermission,
  currentPosition,
  cameraStream: requestCameraStream,
  share: shareContent,
  vibrate,
  stopMediaStream,
};

export function getCapabilityAdapter(): CapabilityAdapter {
  return { ...webCapabilityAdapter, platform: getPlatform() };
}
