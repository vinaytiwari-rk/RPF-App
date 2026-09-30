import { Capacitor } from "@capacitor/core";

export const API_BASE_ORIGIN = "https://appapi.therpfoundation.org";

/**
 * Universal media URL resolver that ensures images and media paths
 * are always loaded from the correct absolute server origin across:
 * 1. Web browser (therpfoundation.org, jansevacard.therpfoundation.org, api.therpfoundation.org)
 * 2. Native Android APK (Capacitor localhost WebView)
 * 3. Local Vite dev server
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  // Data URLs or Blob URLs (e.g. instant preview directly from device memory)
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  // Already a complete absolute HTTP/HTTPS URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Relative uploaded file path (/uploads/... or uploads/...)
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("uploads/")) {
    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return `${API_BASE_ORIGIN}${cleanPath}`;
  }

  // Relative asset bundled in the app (/assets/...)
  if (trimmed.startsWith("/assets/") || trimmed.startsWith("assets/")) {
    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return cleanPath;
  }

  // Any other root-relative path
  if (trimmed.startsWith("/")) {
    return `${API_BASE_ORIGIN}${trimmed}`;
  }

  return trimmed;
}

/**
 * Helper to compress an image client-side to a WebP/JPEG data URL
 * as a fail-safe fallback if server upload is ever offline.
 */
export async function fileToDataUrl(file: File, maxDimension = 1400, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(reader.result as string);
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
