/** Standard UI states for capability, network and service boundaries. */
export type FeatureState =
  | { kind: "ready" }
  | { kind: "loading"; message?: string }
  | { kind: "offline"; message?: string }
  | { kind: "permission-denied"; capability: string; message?: string }
  | { kind: "unsupported"; capability: string; message?: string }
  | { kind: "error"; message: string };

export const featureStates = {
  ready: (): FeatureState => ({ kind: "ready" }),
  loading: (message?: string): FeatureState => ({ kind: "loading", message }),
  offline: (message?: string): FeatureState => ({ kind: "offline", message }),
  permissionDenied: (capability: string, message?: string): FeatureState => ({ kind: "permission-denied", capability, message }),
  unsupported: (capability: string, message?: string): FeatureState => ({ kind: "unsupported", capability, message }),
  error: (message: string): FeatureState => ({ kind: "error", message }),
};
