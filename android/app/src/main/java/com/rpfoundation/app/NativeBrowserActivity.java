package com.rpfoundation.app;

import android.annotation.SuppressLint;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.view.GestureDetector;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.Window;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

public class NativeBrowserActivity extends AppCompatActivity {
    private static final int NAVY = Color.rgb(20, 33, 61);
    private static final int IVORY = Color.rgb(255, 249, 240);
    private static final long AUTO_HIDE_MS = 4000L;

    private WebView webView;
    private View customView;
    private WebChromeClient.CustomViewCallback customViewCallback;
    private FrameLayout contentFrame;
    private ProgressBar progressBar;
    private LinearLayout errorView;
    private LinearLayout topBar;
    private LinearLayout bottomBar;
    private EditText addressBar;
    private TextView backButton;
    private TextView forwardButton;
    private boolean mainFrameError = false;
    private boolean pageLoading = false;
    private final Handler handler = new Handler();
    private Runnable hideControlsRunnable;
    private GestureDetector gestureDetector;

    private int dp(int value) { return Math.round(value * getResources().getDisplayMetrics().density); }

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
        showControls();
        webView.loadUrl(target);
        return true;
    }

    private void showLoading() {
        pageLoading = true;
        if (progressBar != null) progressBar.setVisibility(View.VISIBLE);
        showControls();
    }

    private void hideLoading() {
        pageLoading = false;
        if (progressBar != null) progressBar.setVisibility(View.GONE);
        scheduleHideControls();
    }

    private void hideError() { if (errorView != null) errorView.setVisibility(View.GONE); }

    private void showError(String message) {
        pageLoading = false;
        hideLoading();
        if (errorView != null) {
            TextView detail = errorView.findViewWithTag("detail");
            if (detail != null) detail.setText(message);
            errorView.setVisibility(View.VISIBLE);
        }
        showControls();
    }

    private void showControls() {
        if (hideControlsRunnable != null) handler.removeCallbacks(hideControlsRunnable);
        if (topBar != null) {
            topBar.setVisibility(View.VISIBLE);
            topBar.animate().translationY(0).alpha(1f).setDuration(180).start();
        }
        if (bottomBar != null) {
            bottomBar.setVisibility(View.VISIBLE);
            bottomBar.animate().translationY(0).alpha(1f).setDuration(180).start();
        }
    }

    private void hideControls() {
        if (pageLoading || mainFrameError || customView != null) return;
        if (topBar != null) topBar.animate().translationY(-dp(72)).alpha(0f).setDuration(220).withEndAction(() -> topBar.setVisibility(View.INVISIBLE)).start();
        if (bottomBar != null) bottomBar.animate().translationY(dp(72)).alpha(0f).setDuration(220).withEndAction(() -> bottomBar.setVisibility(View.INVISIBLE)).start();
    }

    private void scheduleHideControls() {
        if (hideControlsRunnable != null) handler.removeCallbacks(hideControlsRunnable);
        hideControlsRunnable = this::hideControls;
        handler.postDelayed(hideControlsRunnable, AUTO_HIDE_MS);
    }

    private void updateNavigationState() {
        if (webView == null) return;
        if (backButton != null) { backButton.setEnabled(webView.canGoBack()); backButton.setAlpha(webView.canGoBack() ? 1f : .35f); }
        if (forwardButton != null) { forwardButton.setEnabled(webView.canGoForward()); forwardButton.setAlpha(webView.canGoForward() ? 1f : .35f); }
    }

    private void updateAddress(String value) {
        if (addressBar != null && value != null && !addressBar.hasFocus()) addressBar.setText(value);
        updateNavigationState();
    }

    private void openExternal() {
        String value = webView != null ? webView.getUrl() : null;
        if (!isHttpUrl(value)) return;
        try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(value))); }
        catch (Exception ignored) { Toast.makeText(this, "No compatible browser found", Toast.LENGTH_SHORT).show(); }
    }

    private void shareCurrentPage() {
        String value = webView != null ? webView.getUrl() : null;
        if (!isHttpUrl(value)) return;
        Intent share = new Intent(Intent.ACTION_SEND);
        share.setType("text/plain");
        share.putExtra(Intent.EXTRA_TEXT, value);
        startActivity(Intent.createChooser(share, "Share link"));
    }

    private void copyCurrentUrl() {
        String value = webView != null ? webView.getUrl() : null;
        if (!isHttpUrl(value)) return;
        ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
        clipboard.setPrimaryClip(ClipData.newPlainText("URL", value));
        Toast.makeText(this, "Link copied", Toast.LENGTH_SHORT).show();
    }

    private void showBrowserMenu() {
        final String[] actions = new String[]{"Refresh", "Share", "Copy link", "Open externally", "Find in page", "Settings"};
        new AlertDialog.Builder(this)
            .setItems(actions, (dialog, which) -> {
                if (which == 0 && webView != null) webView.reload();
                else if (which == 1) shareCurrentPage();
                else if (which == 2) copyCurrentUrl();
                else if (which == 3) openExternal();
                else if (which == 4) showFindInPage();
                else if (which == 5) showBrowserSettings();
            }).show();
    }

    private void showFindInPage() {
        EditText input = new EditText(this);
        input.setSingleLine(true);
        input.setHint("Find text");
        new AlertDialog.Builder(this).setTitle("Find in page").setView(input)
            .setPositiveButton("Find", (dialog, which) -> {
                if (webView != null && input.getText() != null) webView.findAllAsync(input.getText().toString());
            }).setNegativeButton("Cancel", null).show();
    }

    private void showBrowserSettings() {
        final String[] options = new String[]{"Toolbar behaviour", "Desktop site", "Clear browsing data"};
        new AlertDialog.Builder(this).setTitle("Samahit Views Settings").setItems(options, (dialog, which) -> {
            if (which == 0) Toast.makeText(this, "Controls auto-hide after a few seconds", Toast.LENGTH_SHORT).show();
            else if (which == 1) Toast.makeText(this, "Desktop-site preference will be applied per website", Toast.LENGTH_SHORT).show();
            else {
                CookieManager.getInstance().removeAllCookies(null);
                CookieManager.getInstance().flush();
                if (webView != null) webView.clearCache(true);
                Toast.makeText(this, "Browsing data cleared", Toast.LENGTH_SHORT).show();
            }
        }).show();
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        Window window = getWindow();
        window.setStatusBarColor(IVORY);
        window.setNavigationBarColor(IVORY);
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
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);

        CookieManager cookies = CookieManager.getInstance();
        cookies.setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) cookies.setAcceptThirdPartyCookies(webView, true);

        webView.setDownloadListener(new DownloadListener() {
            @Override public void onDownloadStart(String downloadUrl, String userAgent, String contentDisposition, String mimetype, long contentLength) {
                try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(downloadUrl))); }
                catch (Exception ignored) { Toast.makeText(NativeBrowserActivity.this, "Download could not be opened", Toast.LENGTH_SHORT).show(); }
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            private boolean handleUrl(String next) {
                if (next == null) return false;
                if (isHttpUrl(next)) return false;
                if (loadInApp(next)) return true;
                try {
                    Intent intent = Intent.parseUri(next, Intent.URI_INTENT_SCHEME);
                    intent.addCategory(Intent.CATEGORY_BROWSABLE);
                    intent.setComponent(null);
                    if (getPackageManager().resolveActivity(intent, 0) != null) { startActivity(intent); return true; }
                } catch (Exception ignored) { }
                try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(next))); } catch (Exception ignored) { }
                return true;
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String next = request != null && request.getUrl() != null ? request.getUrl().toString() : null;
                return handleUrl(next);
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, String next) { return handleUrl(next); }
            @Override public void onPageStarted(WebView view, String next, android.graphics.Bitmap favicon) {
                mainFrameError = false; hideError(); updateAddress(next); showLoading(); super.onPageStarted(view, next, favicon);
            }
            @Override public void onPageFinished(WebView view, String next) {
                updateAddress(next); if (!mainFrameError) hideLoading(); super.onPageFinished(view, next);
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
            @Override public void onProgressChanged(WebView view, int progress) {
                if (progressBar != null) {
                    progressBar.setIndeterminate(false); progressBar.setProgress(progress);
                    progressBar.setVisibility(progress >= 100 ? View.GONE : View.VISIBLE);
                }
            }
            @Override public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
                WebView popup = new WebView(NativeBrowserActivity.this);
                popup.getSettings().setJavaScriptEnabled(true);
                popup.getSettings().setDomStorageEnabled(true);
                popup.setWebViewClient(new WebViewClient() {
                    @Override public boolean shouldOverrideUrlLoading(WebView ignored, WebResourceRequest request) {
                        String next = request != null && request.getUrl() != null ? request.getUrl().toString() : null;
                        loadInApp(next); popup.destroy(); return true;
                    }
                    @Override public boolean shouldOverrideUrlLoading(WebView ignored, String next) { loadInApp(next); popup.destroy(); return true; }
                });
                WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
                transport.setWebView(popup); resultMsg.sendToTarget(); return true;
            }
            @Override public void onShowCustomView(View view, CustomViewCallback callback) {
                if (customView != null) { callback.onCustomViewHidden(); return; }
                customView = view; customViewCallback = callback; webView.setVisibility(View.GONE);
                contentFrame.addView(customView, new FrameLayout.LayoutParams(-1, -1));
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
                getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
            }
            @Override public void onHideCustomView() { hideCustomView(); }
        });

        gestureDetector = new GestureDetector(this, new GestureDetector.SimpleOnGestureListener() {
            @Override public boolean onDoubleTap(MotionEvent e) {
                if (topBar != null && topBar.getVisibility() == View.VISIBLE) hideControls();
                else { showControls(); scheduleHideControls(); }
                return true;
            }
        });
        webView.setOnTouchListener((v, event) -> { gestureDetector.onTouchEvent(event); return false; });

        contentFrame.addView(webView, new FrameLayout.LayoutParams(-1, -1));
        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setMax(100); progressBar.setProgress(0);
        contentFrame.addView(progressBar, new FrameLayout.LayoutParams(-1, dp(3), Gravity.TOP));

        errorView = new LinearLayout(this);
        errorView.setOrientation(LinearLayout.VERTICAL); errorView.setGravity(Gravity.CENTER);
        errorView.setPadding(dp(28), dp(28), dp(28), dp(28)); errorView.setBackgroundColor(IVORY);
        TextView title = new TextView(this);
        title.setText("This page could not be loaded"); title.setTextSize(19); title.setTextColor(NAVY); title.setGravity(Gravity.CENTER);
        errorView.addView(title, new LinearLayout.LayoutParams(-1, -2));
        TextView detail = new TextView(this);
        detail.setTag("detail"); detail.setTextSize(13); detail.setTextColor(Color.rgb(96, 102, 116)); detail.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams detailParams = new LinearLayout.LayoutParams(-1, -2); detailParams.topMargin = dp(12);
        errorView.addView(detail, detailParams);
        TextView retry = new TextView(this);
        retry.setText("Try again"); retry.setTextColor(Color.WHITE); retry.setGravity(Gravity.CENTER); retry.setTextSize(14); retry.setBackgroundColor(NAVY);
        retry.setPadding(dp(22), dp(12), dp(22), dp(12)); retry.setOnClickListener(v -> webView.reload());
        LinearLayout.LayoutParams retryParams = new LinearLayout.LayoutParams(-2, -2); retryParams.topMargin = dp(24); retryParams.gravity = Gravity.CENTER_HORIZONTAL;
        errorView.addView(retry, retryParams); errorView.setVisibility(View.GONE);
        contentFrame.addView(errorView, new FrameLayout.LayoutParams(-1, -1));

        buildBrowserChrome(url);
        setContentView(contentFrame);
        loadInApp(url);
    }

    private TextView textButton(String text) {
        TextView view = new TextView(this);
        view.setText(text); view.setTextColor(NAVY); view.setTextSize(20); view.setGravity(Gravity.CENTER);
        view.setPadding(dp(10), dp(6), dp(10), dp(6));
        return view;
    }

    private void buildBrowserChrome(String initialUrl) {
        topBar = new LinearLayout(this);
        topBar.setOrientation(LinearLayout.HORIZONTAL); topBar.setGravity(Gravity.CENTER_VERTICAL);
        topBar.setPadding(dp(8), dp(10), dp(8), dp(6)); topBar.setBackgroundColor(IVORY);
        TextView close = textButton("‹"); close.setTextSize(32); close.setOnClickListener(v -> finish());
        topBar.addView(close, new LinearLayout.LayoutParams(dp(44), dp(52)));
        addressBar = new EditText(this);
        addressBar.setSingleLine(true); addressBar.setText(initialUrl); addressBar.setTextSize(13); addressBar.setTextColor(NAVY);
        addressBar.setHint("Search or enter address"); addressBar.setPadding(dp(14), 0, dp(14), 0); addressBar.setBackgroundColor(Color.WHITE);
        addressBar.setOnEditorActionListener((v, actionId, event) -> {
            String value = addressBar.getText().toString().trim();
            if (value.length() == 0) return true;
            if (!value.startsWith("http://") && !value.startsWith("https://")) value = "https://www.google.com/search?q=" + Uri.encode(value);
            loadInApp(value); addressBar.clearFocus(); return true;
        });
        topBar.addView(addressBar, new LinearLayout.LayoutParams(0, dp(48), 1f));
        TextView menu = textButton("⋮"); menu.setTextSize(26); menu.setOnClickListener(v -> { showControls(); showBrowserMenu(); });
        topBar.addView(menu, new LinearLayout.LayoutParams(dp(44), dp(52)));
        contentFrame.addView(topBar, new FrameLayout.LayoutParams(-1, -2, Gravity.TOP));

        bottomBar = new LinearLayout(this);
        bottomBar.setOrientation(LinearLayout.HORIZONTAL); bottomBar.setGravity(Gravity.CENTER);
        bottomBar.setPadding(dp(16), dp(8), dp(16), dp(12)); bottomBar.setBackgroundColor(IVORY);
        backButton = textButton("‹"); backButton.setTextSize(34); backButton.setOnClickListener(v -> { if (webView.canGoBack()) webView.goBack(); scheduleHideControls(); });
        bottomBar.addView(backButton, new LinearLayout.LayoutParams(0, dp(48), 1f));
        forwardButton = textButton("›"); forwardButton.setTextSize(34); forwardButton.setOnClickListener(v -> { if (webView.canGoForward()) webView.goForward(); scheduleHideControls(); });
        bottomBar.addView(forwardButton, new LinearLayout.LayoutParams(0, dp(48), 1f));
        TextView refresh = textButton("↻"); refresh.setTextSize(28); refresh.setOnClickListener(v -> { webView.reload(); showControls(); });
        bottomBar.addView(refresh, new LinearLayout.LayoutParams(0, dp(48), 1f));
        TextView external = textButton("↗"); external.setTextSize(24); external.setOnClickListener(v -> openExternal());
        bottomBar.addView(external, new LinearLayout.LayoutParams(0, dp(48), 1f));
        contentFrame.addView(bottomBar, new FrameLayout.LayoutParams(-1, -2, Gravity.BOTTOM));
        updateNavigationState();
    }

    private void hideCustomView() {
        if (customView == null) return;
        contentFrame.removeView(customView); customView = null;
        if (customViewCallback != null) customViewCallback.onCustomViewHidden(); customViewCallback = null;
        webView.setVisibility(View.VISIBLE); setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE); showControls();
    }

    @Override public void onBackPressed() {
        if (customView != null) { hideCustomView(); return; }
        if (webView != null && webView.canGoBack()) { webView.goBack(); scheduleHideControls(); }
        else super.onBackPressed();
    }

    @Override protected void onDestroy() {
        if (hideControlsRunnable != null) handler.removeCallbacks(hideControlsRunnable);
        if (webView != null) { webView.stopLoading(); webView.destroy(); }
        super.onDestroy();
    }
}
