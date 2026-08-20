import { EXTERNAL_LINK_REGISTRY } from './externalLinks';

/**
 * Runtime CMS overrides for registered external links.
 * Code defaults remain as a safe fallback when CMS is unavailable.
 */
const registry = EXTERNAL_LINK_REGISTRY as Record<string, { id: string; label: string; url: string; category: string }>;
let loaded = false;

function applyOverrides(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return;
  for (const [id, override] of Object.entries(value as Record<string, unknown>)) {
    const current = registry[id];
    if (!current || !override || typeof override !== 'object' || Array.isArray(override)) continue;
    const next = override as Record<string, unknown>;
    const url = typeof next.url === 'string' ? next.url.trim() : '';
    if (!url || !/^https?:\/\//i.test(url)) continue;
    registry[id] = {
      ...current,
      url,
      label: typeof next.label === 'string' && next.label.trim() ? next.label.trim() : current.label,
    };
  }
}

export async function refreshDynamicExternalLinks() {
  try {
    const response = await fetch('/api/cms');
    if (!response.ok) return;
    const data = await response.json();
    applyOverrides(data?.cms?.externalLinks);
  } catch {
    // Keep bundled defaults as a safe offline fallback.
  } finally {
    loaded = true;
  }
}

export function areDynamicExternalLinksLoaded() { return loaded; }

// Start hydration immediately so normal click handlers continue to stay synchronous.
void refreshDynamicExternalLinks();
