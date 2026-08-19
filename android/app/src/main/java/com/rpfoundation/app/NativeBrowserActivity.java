package com.rpfoundation.app;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Message;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class NativeBrowserActivity extends AppCompatActivity {
    private WebView webView;
    private View customView;
    private WebChromeClient.CustomViewCallback customViewCallback;
    private FrameLayout contentFrame;
    private ProgressBar progressBar;
    private LinearLayout errorView;
    private boolean mainFrameError = false;

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
        mainFrameError = false;
        hideError();
        showLoading();
        webView.loadUrl(target);
        return true;
    }

    private void showLoading() {
        if (progressBar != null) progressBar.setVisibility(View.VISIBLE);
    }

    private void hideLoading() {
        if (progressBar != null) progressBar.setVisibility(View.GONE);
    }

    private void hideError() {
        if (errorView != null) errorView.setVisibility(View.GONE);
    }

    private void showError(String message) {
        hideLoading();
        if (errorView != null) {
            TextView detail = errorView.findViewWithTag("detail");
            if (detail != null) detail.setText(message);
            errorView.setVisibility(View.VISIBLE);
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        Window window = getWindow();
        window.setStatusBarColor(Color.WHITE);
        window.setNavigationBarColor(Color.WHITE);
        String url = getIntent().getStringExtra("url");
        if (!isHttpUrl(url)) { finish(); return; }

        contentFrame = new FrameLayout(this);
        contentFrame.setBackgroundColor(Color.WHITE);
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
            private boolean handleUrl(String next) {
                if (next == null) return false;
                if (isHttpUrl(next)) return false;
                if (loadInApp(next)) return true;
                try {
                    Intent intent = Intent.parseUri(next, Intent.URI_INTENT_SCHEME);
                    intent.addCategory(Intent.CATEGORY_BROWSABLE);
                    intent.setComponent(null);
                    if (getPackageManager().resolveActivity(intent, 0) != null) {
                        startActivity(intent);
                        return true;
                    }
                } catch (Exception ignored) { }
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(next));
                    startActivity(intent);
                    return true;
                } catch (Exception ignored) { }
                return true;
            }

            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String next = request != null && request.getUrl() != null ? request.getUrl().toString() : null;
                return handleUrl(next);
            }

            @Override public boolean shouldOverrideUrlLoading(WebView view, String next) {
                return handleUrl(next);
            }

            @Override public void onPageStarted(WebView view, String next, android.graphics.Bitmap favicon) {
                mainFrameError = false;
                hideError();
                showLoading();
                super.onPageStarted(view, next, favicon);
            }

            @Override public void onPageFinished(WebView view, String next) {
                if (!mainFrameError) hideLoading();
                super.onPageFinished(view, next);
            }

            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request != null && request.isForMainFrame()) {
                    mainFrameError = true;
                    String detail = error != null && error.getDescription() != null ? error.getDescription().toString() : "The page could not be loaded.";
                    showError(detail);
                }
                super.onReceivedError(view, request, error);
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
                contentFrame.addView(customView, new FrameLayout.LayoutParams(-1, -1));
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
                getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
            }
            @Override public void onHideCustomView() { hideCustomView(); }
        });

        contentFrame.addView(webView, new FrameLayout.LayoutParams(-1, -1));
        progressBar = new ProgressBar(this);
        FrameLayout.LayoutParams progressParams = new FrameLayout.LayoutParams(-2, -2, Gravity.CENTER);
        contentFrame.addView(progressBar, progressParams);

        errorView = new LinearLayout(this);
        errorView.setOrientation(LinearLayout.VERTICAL);
        errorView.setGravity(Gravity.CENTER);
        errorView.setPadding(48, 48, 48, 48);
        errorView.setBackgroundColor(Color.WHITE);
        TextView title = new TextView(this);
        title.setText("Page could not be loaded");
        title.setTextSize(18);
        title.setTextColor(Color.rgb(20, 30, 50));
        title.setGravity(Gravity.CENTER);
        errorView.addView(title, new LinearLayout.LayoutParams(-1, -2));
        TextView detail = new TextView(this);
        detail.setTag("detail");
        detail.setTextSize(13);
        detail.setTextColor(Color.rgb(100, 110, 125));
        detail.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams detailParams = new LinearLayout.LayoutParams(-1, -2);
        detailParams.topMargin = 16;
        errorView.addView(detail, detailParams);
        Button retry = new Button(this);
        retry.setText("Retry");
        retry.setOnClickListener(v -> webView.reload());
        LinearLayout.LayoutParams retryParams = new LinearLayout.LayoutParams(-2, -2);
        retryParams.topMargin = 24;
        retryParams.gravity = Gravity.CENTER_HORIZONTAL;
        errorView.addView(retry, retryParams);
        errorView.setVisibility(View.GONE);
        contentFrame.addView(errorView, new FrameLayout.LayoutParams(-1, -1));

        setContentView(contentFrame);
        loadInApp(url);
    }

    private void hideCustomView() {
        if (customView == null) return;
        contentFrame.removeView(customView);
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
