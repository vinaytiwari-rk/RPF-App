import { Capacitor, registerPlugin } from "@capacitor/core";

export interface UpdateManifest {
  versionCode: number;
  versionName: string;
  sha256: string;
  size: number;
  downloadUrl: string;
  minSupportedVersionCode?: number;
  releaseNotes?: string;
  publishedAt?: string;
}

export interface AppVersionInfo {
  versionCode: number;
  versionName: string;
  packageName: string;
  isNativeAndroid: boolean;
}

export interface UpdateCheckResult {
  updateAvailable: boolean;
  currentVersion: AppVersionInfo;
  latestManifest: UpdateManifest | null;
  message?: string;
}

interface NativeDownloadsPlugin {
  saveToDownloads(options: {
    filename: string;
    mimeType: string;
    data: string;
  }): Promise<{ uri: string; filename: string }>;
  getAppVersion?(): Promise<{
    versionCode: number;
    versionName: string;
    packageName: string;
  }>;
  installApk?(options: {
    data: string;
    filename?: string;
  }): Promise<{ success: boolean; path: string }>;
}

const NativeDownloads = registerPlugin<NativeDownloadsPlugin>("NativeDownloads");

const MANIFEST_URLS = [
  "https://appapi.therpfoundation.org/api/public/app-update",
  "https://appapi.therpfoundation.org/updates/manifest.json",
  "/api/public/app-update",
  "/updates/manifest.json"
];

/**
 * Validates that a string is a clean semantic version (e.g. "2.5.18")
 * and prevents raw ISO timestamps from masquerading as version numbers.
 */
export function isValidSemver(v: any): boolean {
  if (typeof v !== "string") return false;
  const clean = v.trim().replace(/^v/, '');
  return /^\d+\.\d+(\.\d+)?(-[a-zA-Z0-9.]+)?$/.test(clean) && !clean.includes("T") && !clean.includes("Z");
}

/**
 * Fallback static web/app version code and name
 */
export const DEFAULT_VERSION_INFO: AppVersionInfo = {
  versionCode: 21609,
  versionName: "2.5.18",
  packageName: "com.rpfoundation.app",
  isNativeAndroid: Capacitor.getPlatform() === "android",
};

let cachedWebVersionInfo: AppVersionInfo | null = null;

/**
 * Retrieves the currently running app version details.
 * Queries native Android PackageInfo if running inside the native APK container.
 * On web, queries /version.json dynamically to reflect live production releases.
 */
export async function getCurrentAppVersion(): Promise<AppVersionInfo> {
  const isAndroid = Capacitor.getPlatform() === "android";
  if (isAndroid && typeof NativeDownloads.getAppVersion === "function") {
    try {
      const nativeInfo = await NativeDownloads.getAppVersion();
      if (nativeInfo && typeof nativeInfo.versionCode === "number") {
        const nativeName = nativeInfo.versionName && isValidSemver(nativeInfo.versionName)
          ? nativeInfo.versionName
          : "2.5.18";
        return {
          versionCode: nativeInfo.versionCode,
          versionName: nativeName,
          packageName: nativeInfo.packageName || "com.rpfoundation.app",
          isNativeAndroid: true,
        };
      }
    } catch (err) {
      console.warn("NativeDownloads.getAppVersion failed, falling back to defaults:", err);
    }
  }

  if (cachedWebVersionInfo) {
    return cachedWebVersionInfo;
  }

  try {
    const res = await fetch(`/version.json?_t=${Date.now()}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data?.version && isValidSemver(data.version)) {
        cachedWebVersionInfo = {
          versionCode: 21609,
          versionName: String(data.version).trim().replace(/^v/, ''),
          packageName: "com.rpfoundation.app",
          isNativeAndroid: isAndroid,
        };
        return cachedWebVersionInfo;
      }
    }
  } catch {
    // Network or offline fallback
  }

  return { ...DEFAULT_VERSION_INFO, isNativeAndroid: isAndroid };
}

/**
 * Checks the production server for an updated APK manifest.
 */
export async function checkForAppUpdates(): Promise<UpdateCheckResult> {
  const current = await getCurrentAppVersion();
  let lastErrorMsg = "";

  for (const url of MANIFEST_URLS) {
    try {
      const res = await fetch(`${url}?_t=${Date.now()}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        lastErrorMsg = `HTTP ${res.status}: ${url}`;
        continue;
      }

      const rawJson = await res.json();
      const manifest: UpdateManifest = rawJson?.data || rawJson;
      if (!manifest || typeof manifest.versionCode !== "number" || !manifest.downloadUrl) {
        lastErrorMsg = "Invalid update manifest format";
        continue;
      }

      const updateAvailable = manifest.versionCode > current.versionCode;
      return {
        updateAvailable,
        currentVersion: current,
        latestManifest: manifest,
      };
    } catch (e: any) {
      lastErrorMsg = e?.message || "Connection failed";
    }
  }

  return {
    updateAvailable: false,
    currentVersion: current,
    latestManifest: null,
    message: lastErrorMsg ? `Unable to reach update server (${lastErrorMsg})` : "Failed to check for updates",
  };
}

/**
 * Computes SHA-256 hex string from an ArrayBuffer using Web Crypto API.
 */
export async function computeSha256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Converts ArrayBuffer to Base64 in chunks to prevent call-stack overflows.
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

/**
 * Downloads the APK with progress reporting, verifies SHA-256 checksum,
 * and launches the Android Package Installer via NativeDownloadsPlugin.
 */
export async function downloadAndInstallUpdate(
  manifest: UpdateManifest,
  onProgress?: (percent: number, loadedBytes: number, totalBytes: number) => void
): Promise<{ success: boolean; message?: string }> {
  const isAndroid = Capacitor.getPlatform() === "android";

  // For web users, simply open the download URL in browser
  if (!isAndroid) {
    window.open(manifest.downloadUrl, "_blank");
    return { success: true, message: "Opened download link in browser." };
  }

  // Fetch APK with streaming progress
  const response = await fetch(manifest.downloadUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to download APK: HTTP ${response.status}`);
  }

  const contentLength = Number(response.headers.get("Content-Length")) || manifest.size || 0;
  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error("Unable to initialize response stream reader");
  }

  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      receivedBytes += value.length;
      if (onProgress) {
        const percent = contentLength > 0 ? Math.min(99, Math.round((receivedBytes / contentLength) * 100)) : 0;
        onProgress(percent, receivedBytes, contentLength);
      }
    }
  }

  // Concatenate all chunks into a single ArrayBuffer
  const allBytes = new Uint8Array(receivedBytes);
  let position = 0;
  for (const chunk of chunks) {
    allBytes.set(chunk, position);
    position += chunk.length;
  }

  // Verify SHA-256 Checksum if present in manifest
  if (manifest.sha256 && manifest.sha256.trim().length > 0) {
    const computedHash = await computeSha256(allBytes.buffer);
    if (computedHash.toLowerCase() !== manifest.sha256.toLowerCase().trim()) {
      throw new Error(
        `Integrity check failed! Expected SHA-256: ${manifest.sha256}, but received: ${computedHash}. Download aborted for security.`
      );
    }
  }

  // Convert to Base64 and trigger native installer
  const base64Data = bufferToBase64(allBytes.buffer);
  const filename = `RPF-Samahit-${manifest.versionName || "update"}.apk`;

  if (typeof NativeDownloads.installApk === "function") {
    const result = await NativeDownloads.installApk({
      data: base64Data,
      filename,
    });
    return { success: result.success };
  }

  // Fallback if plugin method isn't wired: save to downloads
  await NativeDownloads.saveToDownloads({
    filename,
    mimeType: "application/vnd.android.package-archive",
    data: base64Data,
  });

  return {
    success: true,
    message: "Downloaded to Downloads/SAMAHIT. Tap notification or open Downloads to install.",
  };
}
