export interface SocialCacheEntry {
  data: any;
  timestamp: number;
}

export const socialPreviewsCache: { [url: string]: SocialCacheEntry } = {};
export const SOCIAL_CACHE_TTL = 60 * 60 * 1000; // 1 hour in ms
