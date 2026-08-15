import type { CapabilityAdapter } from "./capabilityAdapters";
import type { PermissionName } from "./permissions";

/** Capability checks used by features before invoking device APIs. */
export function requireCapability(
  capabilities: CapabilityAdapter,
  capability: keyof ReturnType<CapabilityAdapter["detect"]>
): void {
  if (!capabilities.detect()[capability]) {
    throw new Error(`${String(capability)} is not available on this device`);
  }
}

export async function requirePermission(
  capabilities: CapabilityAdapter,
  permission: PermissionName
): Promise<void> {
  const status = await capabilities.permission(permission);
  if (status === "denied") throw new Error(`${permission} permission was denied`);
  if (status === "unsupported") throw new Error(`${permission} permission is not supported on this device`);
}
