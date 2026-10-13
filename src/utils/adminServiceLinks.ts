export type ResolvedAdminServiceLink = {
  title: string;
  url: string;
  description: string;
  isExternal: boolean;
};

export type ResolvedAdminServiceLinks = {
  configured: boolean;
  links: ResolvedAdminServiceLink[];
};

/**
 * Resolve the administrator-published child links for a service.
 * An explicitly published empty list is authoritative; legacy/default links
 * are only used when the service has never published a child-link configuration.
 */
export function resolveAdminServiceLinks(
  cmsConfig: any,
  ids: string[],
  routes: string[] = []
): ResolvedAdminServiceLinks {
  const allServices = Array.isArray(cmsConfig?.allServices) ? cmsConfig.allServices : [];
  const featuredServices = Array.isArray(cmsConfig?.featuredServices) ? cmsConfig.featuredServices : [];
  const matched = [...allServices, ...featuredServices].find((service: any) =>
    service && (ids.includes(String(service.id || "")) || routes.includes(String(service.route || "")))
  );

  if (matched && (
    matched.subLinksConfigured === true ||
    (Array.isArray(matched.subLinks) && matched.subLinks.length > 0)
  )) {
    const source = Array.isArray(matched.subLinks) ? matched.subLinks : [];
    return {
      configured: true,
      links: source
        .filter((link: any) => link && link.active !== false && typeof link.url === "string" && link.url.trim())
        .map((link: any) => ({
          title: String(link.title || link.titleHi || "Service link"),
          url: String(link.url).trim(),
          description: String(link.desc || link.description || link.url).trim(),
          isExternal: link.isExternal !== false,
        })),
    };
  }

  const legacy = cmsConfig?.serviceWebsiteLinks;
  for (const id of ids) {
    if (legacy && Object.prototype.hasOwnProperty.call(legacy, id) && Array.isArray(legacy[id])) {
      return {
        configured: true,
        links: legacy[id]
          .filter((link: any) => link && link.active !== false && typeof link.url === "string" && link.url.trim())
          .map((link: any) => ({
            title: String(link.title || link.titleHi || "Service link"),
            url: String(link.url).trim(),
            description: String(link.desc || link.description || link.url).trim(),
            isExternal: link.isGov !== false,
          })),
      };
    }
  }

  return { configured: false, links: [] };
}
