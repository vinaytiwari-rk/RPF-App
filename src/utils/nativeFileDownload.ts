import { Capacitor, registerPlugin } from "@capacitor/core";

interface NativeDownloadsPlugin {
  saveToDownloads(options: {
    filename: string;
    mimeType: string;
    data: string;
  }): Promise<{ uri: string; filename: string }>;
}

const NativeDownloads = registerPlugin<NativeDownloadsPlugin>("NativeDownloads");

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

/**
 * Saves a generated/downloaded file to Android's public Downloads/SAMAHIT folder.
 * In a regular browser, falls back to the standard browser download flow.
 * Resolves on Android only after the native plugin confirms the file was written.
 */
export async function saveBlobToDownloads(
  blob: Blob,
  filename: string,
  mimeType = blob.type || "application/octet-stream",
): Promise<void> {
  if (!blob.size) throw new Error("The generated file is empty.");

  if (Capacitor.getPlatform() === "android") {
    const data = arrayBufferToBase64(await blob.arrayBuffer());
    await NativeDownloads.saveToDownloads({ filename, mimeType, data });
    return;
  }

  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}
