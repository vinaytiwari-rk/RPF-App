/** Controlled boundary for public/external web services. */
const DEFAULT_ALLOWED = [
  "api.open-meteo.com",
  "api.frankfurter.app",
  "news.google.com",
  "jobicy.com",
  "overpass-api.de",
  "www.gdacs.org",
];

export function isAllowedExternalUrl(value: string, allowedHosts: string[] = DEFAULT_ALLOWED): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    return allowedHosts.some(host => url.hostname === host || url.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

export async function fetchExternalJson<T>(url: string, init?: RequestInit, allowedHosts = DEFAULT_ALLOWED): Promise<T> {
  if (!isAllowedExternalUrl(url, allowedHosts)) throw new Error("External service is not allowlisted");
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`External service returned ${response.status}`);
  return response.json() as Promise<T>;
}

export { DEFAULT_ALLOWED as ALLOWED_EXTERNAL_HOSTS };
