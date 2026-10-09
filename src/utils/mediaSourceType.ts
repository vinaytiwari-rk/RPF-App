/**
 * Determine a media MIME type from a direct stream URL when its extension is known.
 * Extensionless streams often expose their true media type via HTTP headers; do not
 * force them to HLS because that breaks valid MP3/AAC/MP4 endpoints with query URLs.
 */
export function getMediaSourceType(rawUrl: string): string | undefined {
  try {
    const path = new URL(rawUrl).pathname.toLowerCase();
    if (path.endsWith(".m3u8") || path.endsWith(".m3u")) return "application/x-mpegURL";
    if (path.endsWith(".mp4") || path.endsWith(".m4v")) return "video/mp4";
    if (path.endsWith(".webm")) return "video/webm";
    if (path.endsWith(".ogv")) return "video/ogg";
    if (path.endsWith(".ogg")) return "audio/ogg";
    if (path.endsWith(".mp3")) return "audio/mpeg";
    if (path.endsWith(".aac")) return "audio/aac";
    if (path.endsWith(".m4a")) return "audio/mp4";
    return undefined;
  } catch {
    return undefined;
  }
}
