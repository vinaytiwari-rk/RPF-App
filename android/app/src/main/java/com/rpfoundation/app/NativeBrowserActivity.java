package com.rpfoundation.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.DownloadManager;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Message;
import android.provider.Settings;
import android.view.GestureDetector;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.GeolocationPermissions;
import android.webkit.PermissionRequest;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

public class NativeBrowserActivity extends AppCompatActivity {
    private static final int NAVY = Color.rgb(20, 33, 61);
    private static final int IVORY = Color.rgb(255, 249, 240);
    private static final long AUTO_HIDE_MS = 4000L;
    private static final String DESKTOP_UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

    private WebView webView;
    private FrameLayout root;
    private LinearLayout topBar;
    private LinearLayout bottomBar;
    private LinearLayout errorView;
    private ProgressBar progressBar;
    private EditText addressBar;
    private TextView backButton;
    private TextView forwardButton;
    private boolean loading;
    private boolean mainFrameError;
    private boolean desktopMode;
    private final Handler handler = new Handler();
    private Runnable hideRunnable;
    private GestureDetector gestureDetector;
    private ValueCallback<Uri[]> fileCallback;
    private PermissionRequest pendingWebPermission;

    private final ActivityResultLauncher<Intent> filePicker = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(), new ActivityResultCallback<ActivityResult>() {
        @Override public void onActivityResult(ActivityResult result) {
            if (fileCallback == null) return;
            Uri[] values = null;
            if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                Intent data = result.getData();
                if (data.getClipData() != null) {
                    int count = data.getClipData().getItemCount();
                    values = new Uri[count];
                    for (int i = 0; i < count; i++) values[i] = data.getClipData().getItemAt(i).getUri();
                } else if (data.getData() != null) values = new Uri[]{data.getData()};
            }
            fileCallback.onReceiveValue(values);
            fileCallback = null;
        }
    });

    private final ActivityResultLauncher<String[]> permissionLauncher = registerForActivityResult(
            new ActivityResultContracts.RequestMultiplePermissions(), result -> {
        if (pendingWebPermission == null) return;
        boolean camera = Boolean.TRUE.equals(result.get(Manifest.permission.CAMERA));
        boolean audio = Boolean.TRUE.equals(result.get(Manifest.permission.RECORD_AUDIO));
        java.util.ArrayList<String> grant = new java.util.ArrayList<>();
        for (String resource : pendingWebPermission.getResources()) {
            if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource) && camera) grant.add(resource);
            if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource) && audio) grant.add(resource);
        }
        if (!grant.isEmpty()) pendingWebPermission.grant(grant.toArray(new String[0])); else pendingWebPermission.deny();
        pendingWebPermission = null;
    });

    private int dp(int value) { return Math.round(value * getResources().getDisplayMetrics().density); }
    private boolean isHttpUrl(String value) { return value != null && (value.startsWith("https://") || value.startsWith("http://")); }

    private String normalizeAddress(String value) {
        if (value == null) return null;
        value = value.trim();
        if (value.isEmpty()) return null;
        if (isHttpUrl(value)) return value;
        if (value.contains("://")) return value;
        if (value.contains(" ") || !value.contains(".")) return "https://www.google.com/search?q=" + Uri.encode(value);
        return "https://" + value;
    }

    private String resolveIntentFallback(String value) {
        if (value == null || !value.startsWith("intent://")) return null;
        try {
            Intent intent = Intent.parseUri(value, Intent.URI_INTENT_SCHEME);
            String fallback = intent.getStringExtra("browser_fallback_url");
            if (isHttpUrl(fallback)) return fallback;
            Uri data = intent.getData();
            if (data != null && isHttpUrl(data.toString())) return data.toString();
        } catch (Exception ignored) { }
        return null;
    }

    private void loadInApp(String value) {
        String target = normalizeAddress(value);
        if (target == null || webView == null) return;
        if (target.startsWith("intent://")) {
            String fallback = resolveIntentFallback(target);
            if (fallback != null) target = fallback;
        }
        if (!isHttpUrl(target)) { handleSpecialScheme(target); return; }
        mainFrameError = false;
        hideError();
        showControls();
        webView.loadUrl(target);
    }

    private boolean handleSpecialScheme(String url) {
        if (url == null) return true;
        if (url.startsWith("intent://")) {
            String fallback = resolveIntentFallback(url);
            if (fallback != null) { loadInApp(fallback); return true; }
        }
        try {
            Intent intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
            intent.addCategory(Intent.CATEGORY_BROWSABLE);
            intent.setComponent(null);
            startActivity(intent);
        } catch (Exception e) {
            Toast.makeText(this, "This link requires another installed app", Toast.LENGTH_SHORT).show();
        }
        return true;
    }

    private void showControls() {
        if (hideRunnable != null) handler.removeCallbacks(hideRunnable);
        if (topBar != null) { topBar.setVisibility(View.VISIBLE); topBar.animate().translationY(0).alpha(1f).setDuration(160).start(); }
        if (bottomBar != null) { bottomBar.setVisibility(View.VISIBLE); bottomBar.animate().translationY(0).alpha(1f).setDuration(160).start(); }
    }

    private void hideControls() {
        if (loading || mainFrameError) return;
        if (topBar != null && topBar.getVisibility() == View.VISIBLE)
            topBar.animate().translationY(-dp(80)).alpha(0f).setDuration(200).withEndAction(() -> topBar.setVisibility(View.INVISIBLE)).start();
        if (bottomBar != null && bottomBar.getVisibility() == View.VISIBLE)
            bottomBar.animate().translationY(dp(80)).alpha(0f).setDuration(200).withEndAction(() -> bottomBar.setVisibility(View.INVISIBLE)).start();
    }

    private void scheduleHide() {
        if (hideRunnable != null) handler.removeCallbacks(hideRunnable);
        hideRunnable = this::hideControls;
        handler.postDelayed(hideRunnable, AUTO_HIDE_MS);
    }

    private void updateNavigation() {
        if (webView == null) return;
        if (backButton != null) { backButton.setEnabled(webView.canGoBack()); backButton.setAlpha(webView.canGoBack() ? 1f : .35f); }
        if (forwardButton != null) { forwardButton.setEnabled(webView.canGoForward()); forwardButton.setAlpha(webView.canGoForward() ? 1f : .35f); }
    }

    private void updateAddress(String url) {
        if (addressBar != null && url != null && !addressBar.hasFocus()) addressBar.setText(url);
        updateNavigation();
    }

    private void showError(String message) {
        loading = false;
        showControls();
        if (errorView != null) {
            TextView detail = errorView.findViewWithTag("detail");
            if (detail != null) detail.setText(message);
            errorView.setVisibility(View.VISIBLE);
        }
    }
    private void hideError() { if (errorView != null) errorView.setVisibility(View.GONE); }

    private void configureWebView(WebView target) {
        WebSettings s = target.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        s.setSupportMultipleWindows(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setGeolocationEnabled(true);
        s.setUserAgentString(desktopMode ? DESKTOP_UA : WebSettings.getDefaultUserAgent(this));
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
            CookieManager.getInstance().setAcceptThirdPartyCookies(target, true);
        }
        CookieManager.getInstance().setAcceptCookie(true);
    }

    private void configureDownload(WebView target) {
        target.setDownloadListener(new DownloadListener() {
            @Override public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimetype, long contentLength) {
                try {
                    DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                    String cookies = CookieManager.getInstance().getCookie(url);
                    if (cookies != null) request.addRequestHeader("Cookie", cookies);
                    if (userAgent != null) request.addRequestHeader("User-Agent", userAgent);
                    request.setMimeType(mimetype);
                    String name = URLUtil.guessFileName(url, contentDisposition, mimetype);
                    request.setTitle(name);
                    request.setDescription("Downloading with Samahit Views");
                    request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                    request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, name);
                    DownloadManager manager = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                    manager.enqueue(request);
                    Toast.makeText(NativeBrowserActivity.this, "Download started", Toast.LENGTH_SHORT).show();
                } catch (Exception e) { Toast.makeText(NativeBrowserActivity.this, "Download could not be started", Toast.LENGTH_SHORT).show(); }
            }
        });
    }

    private WebViewClient createClient() {
        return new WebViewClient() {
            private boolean route(String next) {
                if (next == null) return false;
                if (isHttpUrl(next)) return false;
                if (next.startsWith("intent://")) {
                    String fallback = resolveIntentFallback(next);
                    if (fallback != null) { loadInApp(fallback); return true; }
                }
                return handleSpecialScheme(next);
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return route(request != null && request.getUrl() != null ? request.getUrl().toString() : null);
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, String url) { return route(url); }
            @Override public void onPageStarted(WebView view, String url, Bitmap favicon) {
                mainFrameError = false; loading = true; hideError(); showControls(); updateAddress(url); super.onPageStarted(view, url, favicon);
            }
            @Override public void onPageFinished(WebView view, String url) {
                loading = false; updateAddress(url); updateNavigation(); if (!mainFrameError) scheduleHide(); super.onPageFinished(view, url);
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request != null && request.isForMainFrame()) {
                    mainFrameError = true;
                    String detail = error != null && error.getDescription() != null ? error.getDescription().toString() : "The page could not be loaded.";
                    showError(detail);
                }
                super.onReceivedError(view, request, error);
            }
        };
    }

    private WebChromeClient createChromeClient() {
        return new WebChromeClient() {
            @Override public void onProgressChanged(WebView view, int progress) {
                if (progressBar != null) { progressBar.setProgress(progress); progressBar.setVisibility(progress >= 100 ? View.GONE : View.VISIBLE); }
            }
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent intent;
                try { intent = params.createIntent(); }
                catch (Exception e) { intent = new Intent(Intent.ACTION_OPEN_DOCUMENT); intent.setType("*/*"); intent.addCategory(Intent.CATEGORY_OPENABLE); }
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, params.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE);
                try { filePicker.launch(Intent.createChooser(intent, "Choose file")); }
                catch (Exception e) { fileCallback.onReceiveValue(null); fileCallback = null; }
                return true;
            }
            @Override public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                boolean allowed = ContextCompat.checkSelfPermission(NativeBrowserActivity.this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED || ContextCompat.checkSelfPermission(NativeBrowserActivity.this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
                if (allowed) callback.invoke(origin, true, false);
                else new AlertDialog.Builder(NativeBrowserActivity.this).setTitle("Location request").setMessage("Allow this website to use your location?").setPositiveButton("Allow", (d,w) -> { requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}, 700); callback.invoke(origin, true, false); }).setNegativeButton("Block", (d,w) -> callback.invoke(origin, false, false)).show();
            }
            @Override public void onPermissionRequest(PermissionRequest request) {
                boolean needCamera = false, needAudio = false;
                for (String resource : request.getResources()) {
                    if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)) needCamera = true;
                    if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)) needAudio = true;
                }
                boolean cameraOk = !needCamera || ContextCompat.checkSelfPermission(NativeBrowserActivity.this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
                boolean audioOk = !needAudio || ContextCompat.checkSelfPermission(NativeBrowserActivity.this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
                if (cameraOk && audioOk) request.grant(request.getResources());
                else { pendingWebPermission = request; java.util.ArrayList<String> permissions = new java.util.ArrayList<>(); if (needCamera) permissions.add(Manifest.permission.CAMERA); if (needAudio) permissions.add(Manifest.permission.RECORD_AUDIO); permissionLauncher.launch(permissions.toArray(new String[0])); }
            }
            @Override public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
                WebView popup = new WebView(NativeBrowserActivity.this);
                configureWebView(popup);
                popup.setWebViewClient(new WebViewClient() {
                    @Override public void onPageStarted(WebView v, String url, Bitmap icon) { if (isHttpUrl(url)) { loadInApp(url); v.stopLoading(); v.destroy(); } }
                    @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest request) { if (request != null && request.getUrl() != null) loadInApp(request.getUrl().toString()); v.destroy(); return true; }
                    @Override public boolean shouldOverrideUrlLoading(WebView v, String url) { loadInApp(url); v.destroy(); return true; }
                });
                WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
                transport.setWebView(popup); resultMsg.sendToTarget(); return true;
            }
        };
    }

    private void toggleDesktopMode() {
        desktopMode = !desktopMode;
        webView.getSettings().setUserAgentString(desktopMode ? DESKTOP_UA : WebSettings.getDefaultUserAgent(this));
        Toast.makeText(this, desktopMode ? "Desktop site enabled" : "Mobile site enabled", Toast.LENGTH_SHORT).show();
        webView.reload();
    }

    private void showMenu() {
        String[] actions = {"Refresh", "Find in page", desktopMode ? "Mobile site" : "Desktop site", "Share", "Copy link", "Open externally", "Settings"};
        new AlertDialog.Builder(this).setItems(actions, (d, which) -> {
            if (which == 0) webView.reload();
            else if (which == 1) findInPage();
            else if (which == 2) toggleDesktopMode();
            else if (which == 3) share();
            else if (which == 4) copyUrl();
            else if (which == 5) openExternal();
            else showSettings();
        }).show();
    }

    private void findInPage() {
        EditText input = new EditText(this); input.setSingleLine(true); input.setHint("Find text");
        new AlertDialog.Builder(this).setTitle("Find in page").setView(input).setPositiveButton("Find", (d,w) -> webView.findAllAsync(input.getText().toString())).setNegativeButton("Cancel", null).show();
    }
    private void share() { String url = webView.getUrl(); if (url == null) return; Intent i = new Intent(Intent.ACTION_SEND); i.setType("text/plain"); i.putExtra(Intent.EXTRA_TEXT, url); startActivity(Intent.createChooser(i, "Share link")); }
    private void copyUrl() { String url = webView.getUrl(); if (url == null) return; ((ClipboardManager)getSystemService(Context.CLIPBOARD_SERVICE)).setPrimaryClip(ClipData.newPlainText("URL", url)); Toast.makeText(this, "Link copied", Toast.LENGTH_SHORT).show(); }
    private void openExternal() { String url = webView.getUrl(); if (isHttpUrl(url)) { try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); } catch (Exception ignored) {} } }

    private void showSettings() {
        String[] options = {"Auto-hide toolbar", "Clear browsing data", "App settings"};
        new AlertDialog.Builder(this).setTitle("Samahit Views Settings").setItems(options, (d,w) -> {
            if (w == 0) Toast.makeText(this, "Controls hide after 4 seconds and return on double-tap", Toast.LENGTH_LONG).show();
            else if (w == 1) { CookieManager.getInstance().removeAllCookies(null); CookieManager.getInstance().flush(); webView.clearCache(true); webView.clearHistory(); Toast.makeText(this, "Browsing data cleared", Toast.LENGTH_SHORT).show(); }
            else startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getPackageName())));
        }).show();
    }

    private TextView button(String text) { TextView v = new TextView(this); v.setText(text); v.setTextColor(NAVY); v.setTextSize(19); v.setGravity(Gravity.CENTER); v.setPadding(dp(10), dp(8), dp(10), dp(8)); return v; }

    private void buildChrome() {
        topBar = new LinearLayout(this); topBar.setOrientation(LinearLayout.HORIZONTAL); topBar.setGravity(Gravity.CENTER_VERTICAL); topBar.setPadding(dp(6), dp(8), dp(6), dp(6)); topBar.setBackgroundColor(IVORY);
        backButton = button("‹"); backButton.setOnClickListener(v -> { if (webView.canGoBack()) webView.goBack(); }); topBar.addView(backButton, new LinearLayout.LayoutParams(dp(48), -2));
        forwardButton = button("›"); forwardButton.setOnClickListener(v -> { if (webView.canGoForward()) webView.goForward(); }); topBar.addView(forwardButton, new LinearLayout.LayoutParams(dp(48), -2));
        addressBar = new EditText(this); addressBar.setSingleLine(true); addressBar.setTextColor(NAVY); addressBar.setTextSize(14); addressBar.setHint("Search or enter address"); addressBar.setPadding(dp(12), 0, dp(12), 0); addressBar.setBackgroundColor(Color.WHITE); addressBar.setOnEditorActionListener((v,a,e) -> { loadInApp(addressBar.getText().toString()); addressBar.clearFocus(); return true; }); topBar.addView(addressBar, new LinearLayout.LayoutParams(0, dp(46), 1));
        TextView reload = button("↻"); reload.setOnClickListener(v -> webView.reload()); topBar.addView(reload, new LinearLayout.LayoutParams(dp(48), -2));
        root.addView(topBar, new FrameLayout.LayoutParams(-1, -2, Gravity.TOP));

        bottomBar = new LinearLayout(this); bottomBar.setGravity(Gravity.CENTER); bottomBar.setPadding(dp(10), dp(6), dp(10), dp(10)); bottomBar.setBackgroundColor(IVORY);
        TextView home = button("⌂"); home.setOnClickListener(v -> loadInApp("https://www.google.com")); bottomBar.addView(home, new LinearLayout.LayoutParams(0, -2, 1));
        TextView find = button("⌕"); find.setOnClickListener(v -> findInPage()); bottomBar.addView(find, new LinearLayout.LayoutParams(0, -2, 1));
        TextView menu = button("⋮"); menu.setOnClickListener(v -> showMenu()); bottomBar.addView(menu, new LinearLayout.LayoutParams(0, -2, 1));
        root.addView(bottomBar, new FrameLayout.LayoutParams(-1, -2, Gravity.BOTTOM));
        updateNavigation();
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(IVORY); getWindow().setNavigationBarColor(IVORY);
        root = new FrameLayout(this); root.setBackgroundColor(Color.WHITE);
        webView = new WebView(this); configureWebView(webView); webView.setWebViewClient(createClient()); webView.setWebChromeClient(createChromeClient()); configureDownload(webView);
        gestureDetector = new GestureDetector(this, new GestureDetector.SimpleOnGestureListener() { @Override public boolean onDoubleTap(MotionEvent e) { if (topBar != null && topBar.getVisibility() == View.VISIBLE) hideControls(); else { showControls(); scheduleHide(); } return true; } });
        webView.setOnTouchListener((v,e) -> { gestureDetector.onTouchEvent(e); return false; });
        root.addView(webView, new FrameLayout.LayoutParams(-1, -1));
        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal); progressBar.setMax(100); root.addView(progressBar, new FrameLayout.LayoutParams(-1, dp(3), Gravity.TOP));
        errorView = new LinearLayout(this); errorView.setOrientation(LinearLayout.VERTICAL); errorView.setGravity(Gravity.CENTER); errorView.setPadding(dp(28),dp(28),dp(28),dp(28)); errorView.setBackgroundColor(IVORY);
        TextView title = new TextView(this); title.setText("This page could not be loaded"); title.setTextColor(NAVY); title.setTextSize(19); title.setGravity(Gravity.CENTER); errorView.addView(title);
        TextView detail = new TextView(this); detail.setTag("detail"); detail.setTextColor(Color.DKGRAY); detail.setTextSize(13); detail.setGravity(Gravity.CENTER); LinearLayout.LayoutParams dpms = new LinearLayout.LayoutParams(-1,-2); dpms.topMargin=dp(12); errorView.addView(detail,dpms);
        TextView retry = button("Try again"); retry.setTextColor(Color.WHITE); retry.setBackgroundColor(NAVY); retry.setOnClickListener(v -> webView.reload()); LinearLayout.LayoutParams rp = new LinearLayout.LayoutParams(-2,-2); rp.topMargin=dp(20); errorView.addView(retry,rp); errorView.setVisibility(View.GONE); root.addView(errorView,new FrameLayout.LayoutParams(-1,-1));
        buildChrome(); setContentView(root);
        String url = getIntent().getStringExtra("url"); if (state != null) webView.restoreState(state); else loadInApp(url);
    }

    @Override public void onBackPressed() { if (webView != null && webView.canGoBack()) webView.goBack(); else super.onBackPressed(); }
    @Override protected void onSaveInstanceState(Bundle outState) { webView.saveState(outState); super.onSaveInstanceState(outState); }
    @Override protected void onPause() { if (webView != null) { webView.onPause(); webView.pauseTimers(); } super.onPause(); }
    @Override protected void onResume() { super.onResume(); if (webView != null) { webView.onResume(); webView.resumeTimers(); } }
    @Override protected void onDestroy() { if (hideRunnable != null) handler.removeCallbacks(hideRunnable); if (webView != null) { webView.stopLoading(); webView.destroy(); } super.onDestroy(); }
}
