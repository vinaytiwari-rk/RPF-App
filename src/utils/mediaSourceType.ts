/**
 * Determine the HTML media MIME type from a direct stream URL.
 * URL.pathname deliberately excludes query-string auth tokens and cache parameters.
 * Unknown extensionless sources retain the legacy HLS default for compatibility.
 */
export function getMediaSourceType(rawUrl: string): string {
  try {
    const path = new URL(rawUrl).pathname.toLowerCase();
    if (path.endsWith(".m3u8") || path.endsWith(".m3u")) return "application/x-mpegURL";
    if (path.endsWith(".mp4") || path.endsWith(".m4v")) return "video/mp4";
    if (path.endsWith(".webm")) return "video/webm";
    if (path.endsWith(".ogv") || path.endsWith(".ogg")) return path.endsWith(".ogv") ? "video/ogg" : "audio/ogg";
    if (path.endsWith(".mp3")) return "audio/mpeg";
    if (path.endsWith(".aac")) return "audio/aac";
    if (path.endsWith(".m4a")) return "audio/mp4";
    return "application/x-mpegURL";
  } catch {
    return "application/x-mpegURL";
  }
}
