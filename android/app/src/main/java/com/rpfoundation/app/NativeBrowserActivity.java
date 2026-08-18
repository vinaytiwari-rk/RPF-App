package com.rpfoundation.app;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Message;
import android.view.View;
import android.view.Window;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;
import androidx.appcompat.app.AppCompatActivity;

public class NativeBrowserActivity extends AppCompatActivity {
    private WebView webView;
    private View customView;
    private WebChromeClient.CustomViewCallback customViewCallback;
    private LinearLayout root;

    private boolean isHttpUrl(String value) {
        return value != null && (value.startsWith("https://") || value.startsWith("http://"));
    }

    private String resolveInAppUrl(String value) {
        if (isHttpUrl(value)) return value;
        if (value == null || !value.startsWith("intent://")) return null;
        try {
            Intent intent = Intent.parseUri(value, Intent.URI_INTENT_SCHEME);
            String fallback = intent.getStringExtra("browser_fallback_url");
            if (isHttpUrl(fallback)) return fallback;
            String data = intent.getDataString();
            if (isHttpUrl(data)) return data;
        } catch (Exception ignored) { }
        return null;
    }

    private boolean loadInApp(String value) {
        String target = resolveInAppUrl(value);
        if (target == null || webView == null) return false;
        webView.loadUrl(target);
        return true;
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        Window window = getWindow();
        window.setStatusBarColor(Color.WHITE);
        window.setNavigationBarColor(Color.WHITE);
        String url = getIntent().getStringExtra("url");
        if (!isHttpUrl(url)) { finish(); return; }

        root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.WHITE);
        webView = new WebView(this);
        webView.setBackgroundColor(Color.WHITE);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setSupportMultipleWindows(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);

        CookieManager cookies = CookieManager.getInstance();
        cookies.setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) cookies.setAcceptThirdPartyCookies(webView, true);

        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String next = request != null && request.getUrl() != null ? request.getUrl().toString() : null;
                return loadInApp(next) || !isHttpUrl(next);
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, String next) {
                return loadInApp(next) || !isHttpUrl(next);
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
                WebView popup = new WebView(NativeBrowserActivity.this);
                popup.getSettings().setJavaScriptEnabled(true);
                popup.getSettings().setDomStorageEnabled(true);
                popup.setWebViewClient(new WebViewClient() {
                    @Override public boolean shouldOverrideUrlLoading(WebView ignored, WebResourceRequest request) {
                        String next = request != null && request.getUrl() != null ? request.getUrl().toString() : null;
                        boolean handled = loadInApp(next) || !isHttpUrl(next);
                        popup.destroy();
                        return handled;
                    }
                    @Override public boolean shouldOverrideUrlLoading(WebView ignored, String next) {
                        boolean handled = loadInApp(next) || !isHttpUrl(next);
                        popup.destroy();
                        return handled;
                    }
                });
                WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
                transport.setWebView(popup);
                resultMsg.sendToTarget();
                return true;
            }

            @Override public void onShowCustomView(View view, CustomViewCallback callback) {
                if (customView != null) { callback.onCustomViewHidden(); return; }
                customView = view;
                customViewCallback = callback;
                webView.setVisibility(View.GONE);
                root.addView(customView, new LinearLayout.LayoutParams(-1, -1));
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
                getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
            }
            @Override public void onHideCustomView() { hideCustomView(); }
        });

        root.addView(webView, new LinearLayout.LayoutParams(-1, 0, 1));
        setContentView(root);
        webView.loadUrl(url);
    }

    private void hideCustomView() {
        if (customView == null) return;
        root.removeView(customView);
        customView = null;
        if (customViewCallback != null) customViewCallback.onCustomViewHidden();
        customViewCallback = null;
        webView.setVisibility(View.VISIBLE);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
    }

    @Override public void onBackPressed() {
        if (customView != null) { hideCustomView(); return; }
        if (webView != null && webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }

    @Override protected void onDestroy() {
        if (webView != null) { webView.stopLoading(); webView.destroy(); }
        super.onDestroy();
    }
}
