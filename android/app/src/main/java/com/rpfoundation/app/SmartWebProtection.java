package com.rpfoundation.app;

import android.net.Uri;
import android.webkit.WebResourceResponse;
import java.io.ByteArrayInputStream;
import java.util.Locale;

/** Conservative ad and tracker filtering for the native WebView. */
public final class SmartWebProtection {
    private SmartWebProtection() {}

    public static boolean isEssentialHost(String host) {
        if (host == null || host.isEmpty()) return false;
        String h = host.toLowerCase(Locale.ROOT);
        return h.endsWith(".gov.in") || h.equals("gov.in")
                || h.endsWith(".nic.in") || h.equals("nic.in")
                || h.endsWith(".ac.in") || h.equals("ac.in")
                || h.endsWith(".edu.in") || h.equals("edu.in");
    }

    public static String hostOf(String url) {
        try {
            String host = Uri.parse(url).getHost();
            return host == null ? "" : host.toLowerCase(Locale.ROOT);
        } catch (Exception ignored) { return ""; }
    }

    public static boolean shouldBlock(String mainHost, String resourceUrl, boolean isMainFrame) {
        if (isMainFrame || isEssentialHost(mainHost) || resourceUrl == null) return false;
        String u = resourceUrl.toLowerCase(Locale.ROOT);
        String[] hosts = {"doubleclick.net","googlesyndication.com","googleadservices.com","adservice.google.com","adnxs.com","adsrvr.org","criteo.com","taboola.com","outbrain.com","mgid.com","revcontent.com","smartadserver.com","openx.net","rubiconproject.com","pubmatic.com","advertising.com","casalemedia.com","moatads.com","scorecardresearch.com"};
        for (String host : hosts) {
            if (u.contains("://" + host + "/") || u.contains("://www." + host + "/") || u.contains("." + host + "/")) return true;
        }
        return false;
    }

    public static WebResourceResponse emptyResponse() {
        return new WebResourceResponse("text/plain", "UTF-8", new ByteArrayInputStream(new byte[0]));
    }
}
