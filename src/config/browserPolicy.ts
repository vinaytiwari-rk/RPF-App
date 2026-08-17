export const ALLOWED_WEB_PROTOCOLS = new Set(['http:', 'https:']);

/** Hosts that are explicitly part of RPF's own web surface. */
export const FIRST_PARTY_HOSTS = new Set([
  'therpfoundation.org',
  'www.therpfoundation.org',
  'appapi.therpfoundation.org',
]);

export function parseWebUrl(rawUrl: string): URL | null {
  try {
    const value = String(rawUrl || '').trim();
    if (!value) return null;
    const url = new URL(value);
    return ALLOWED_WEB_PROTOCOLS.has(url.protocol) ? url : null;
  } catch {
    return null;
  }
}

export function isSafeWebUrl(rawUrl: string): boolean {
  const url = parseWebUrl(rawUrl);
  if (!url) return false;
  if (url.username || url.password) return false;
  return true;
}

/**
 * A redirect is acceptable when it remains HTTP(S). We intentionally do not
 * maintain a hardcoded third-party allowlist: authentication providers and
 * legitimate websites can use changing CDN/SSO hosts.
 */
export function isAllowedRedirect(rawUrl: string): boolean {
  return isSafeWebUrl(rawUrl);
}

export function classifyContentType(contentType = ''): 'html' | 'pdf' | 'image' | 'audio' | 'video' | 'document' | 'unknown' {
  const type = contentType.toLowerCase().split(';', 1)[0].trim();
  if (type === 'text/html' || type === 'application/xhtml+xml') return 'html';
  if (type === 'application/pdf') return 'pdf';
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('audio/')) return 'audio';
  if (type.startsWith('video/')) return 'video';
  if (type.includes('document') || type.includes('word') || type.includes('excel') || type.includes('spreadsheet') || type.includes('presentation')) return 'document';
  return 'unknown';
}
