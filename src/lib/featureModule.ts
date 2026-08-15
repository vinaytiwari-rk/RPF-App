import type { CapabilityAdapter } from "./capabilityAdapters";
import type { FeatureState } from "./featureState";

/** Shared boundary for every utility/feature module. */
export type FeatureModuleContext = {
  capabilities: CapabilityAdapter;
  setState: (state: FeatureState) => void;
};

export type FeatureModule<T = unknown> = {
  id: string;
  create: (context: FeatureModuleContext) => T;
};

/** Execute an async feature operation with consistent loading/error states. */
export async function runFeatureOperation<T>(
  setState: (state: FeatureState) => void,
  operation: () => Promise<T>,
  errorMessage = "Something went wrong. Please try again."
): Promise<T | undefined> {
  setState({ kind: "loading" });
  try {
    const result = await operation();
    setState({ kind: "ready" });
    return result;
  } catch (error) {
    setState({ kind: "error", message: error instanceof Error ? error.message : errorMessage });
    return undefined;
  }
}
