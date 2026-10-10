package com.rpfoundation.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeBrowserPlugin.class);
        registerPlugin(NativePermissionsPlugin.class);
        registerPlugin(NativeDownloadsPlugin.class);
        super.onCreate(savedInstanceState);
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
                try {
                    android.app.DownloadManager.Request request = new android.app.DownloadManager.Request(android.net.Uri.parse(url));
                    request.setMimeType(mimetype);
                    request.allowScanningByMediaScanner();
                    request.setNotificationVisibility(android.app.DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                    String fileName = android.webkit.URLUtil.guessFileName(url, contentDisposition, mimetype);
                    request.setDestinationInExternalPublicDir(android.os.Environment.DIRECTORY_DOWNLOADS, "SAMAHIT/" + fileName);
                    android.app.DownloadManager dm = (android.app.DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                    if (dm != null) dm.enqueue(request);
                } catch (Exception ignored) {}
            });
        }
    }

    @Override protected void onNewIntent(android.content.Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        if (intent != null && intent.getBooleanExtra("samahit_open_home", false) && getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().evaluateJavascript("window.dispatchEvent(new Event(\"samahit-open-home\"));", null);
            intent.removeExtra("samahit_open_home");
        }
    }

    /** Hardware/system back should navigate the app's WebView history instead of finishing the activity. */
    @Override public void onBackPressed() {
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().evaluateJavascript("window.history.back();", null);
            return;
        }
        moveTaskToBack(true);
    }
}
