package com.rpfoundation.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.AlertDialog;
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
import android.os.Looper;
import android.os.Message;
import android.view.GestureDetector;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.GeolocationPermissions;
import android.webkit.PermissionRequest;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.SslErrorHandler;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
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
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import java.util.ArrayList;

/**
 * Samahit Views: an immersive, real Android WebView based browser.
 * The primary rule is to keep normal HTTP(S) navigation, redirects, cookies and
 * popup windows inside this activity instead of treating pages as iframes.
 */
public class NativeBrowserActivity extends AppCompatActivity {
    private static final int NAVY = Color.rgb(20, 33, 61);
    private static final int IVORY = Color.rgb(255, 249, 240);
    private static final long AUTO_HIDE_MS = 4000L;
    private static final String DESKTOP_UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

    private FrameLayout root, webContainer;
    private WebView webView;
    private WebView popupWebView;
    private LinearLayout topBar, bottomBar, errorView;
    private ProgressBar progressBar;
    private EditText addressBar;
    private TextView backButton, forwardButton;
    private boolean loading, mainFrameError, desktopMode;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private Runnable hideRunnable;
    private GestureDetector gestureDetector;
    private ValueCallback<Uri[]> fileCallback;
    private PermissionRequest pendingWebPermission;
    private GeolocationPermissions.Callback pendingGeoCallback;
    private String pendingGeoOrigin;

    private final ActivityResultLauncher<Intent> filePicker = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(), this::deliverPickedFiles);

    private final ActivityResultLauncher<String[]> permissionLauncher = registerForActivityResult(
            new ActivityResultContracts.RequestMultiplePermissions(), result -> {
                if (pendingWebPermission != null) {
                    ArrayList<String> grant = new ArrayList<>();
                    for (String resource : pendingWebPermission.getResources()) {
                        if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource) && Boolean.TRUE.equals(result.get(Manifest.permission.CAMERA))) grant.add(resource);
                        if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource) && Boolean.TRUE.equals(result.get(Manifest.permission.RECORD_AUDIO))) grant.add(resource);
                    }
                    if (grant.isEmpty()) pendingWebPermission.deny(); else pendingWebPermission.grant(grant.toArray(new String[0]));
                    pendingWebPermission = null;
                }
                if (pendingGeoCallback != null) {
                    boolean allowed = Boolean.TRUE.equals(result.get(Manifest.permission.ACCESS_FINE_LOCATION)) || Boolean.TRUE.equals(result.get(Manifest.permission.ACCESS_COARSE_LOCATION));
                    pendingGeoCallback.invoke(pendingGeoOrigin, allowed, false);
                    pendingGeoCallback = null;
                    pendingGeoOrigin = null;
                }
            });

    private int dp(int value) { return Math.round(value * getResources().getDisplayMetrics().density); }
    private boolean isHttpUrl(String value) { return value != null && (value.startsWith("https://") || value.startsWith("http://")); }

    private void deliverPickedFiles(ActivityResult result) {
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

    private String normalizeAddress(String value) {
        if (value == null) return null;
        value = value.trim();
        if (value.isEmpty()) return null;
        if (isHttpUrl(value) || value.startsWith("intent://")) return value;
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
        } catch (Exception ignored) { }
        return null;
    }

    private void loadInApp(String value) {
        String target = normalizeAddress(value);
        if (target == null) return;
        if (target.startsWith("intent://")) target = resolveIntentFallback(target);
        if (!isHttpUrl(target)) {
            Toast.makeText(this, "This link does not provide a web page that can be opened in Samahit Views", Toast.LENGTH_SHORT).show();
            return;
        }
        mainFrameError = false;
        hideError();
        showControls();
        activeWebView().loadUrl(target);
    }

    private WebView activeWebView() { return popupWebView != null ? popupWebView : webView; }

    private boolean routeNonHttp(String url) {
        String fallback = resolveIntentFallback(url);
        if (fallback != null) { loadInApp(fallback); return true; }
        if (url != null && (url.startsWith("about:") || url.startsWith("javascript:"))) return false;
        Toast.makeText(this, "This link requires a non-web protocol", Toast.LENGTH_SHORT).show();
        return true;
    }

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

    private void installDownloadListener(WebView target) {
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
                    ((DownloadManager) getSystemService(DOWNLOAD_SERVICE)).enqueue(request);
                    Toast.makeText(NativeBrowserActivity.this, "Download started", Toast.LENGTH_SHORT).show();
                } catch (Exception e) {
                    Toast.makeText(NativeBrowserActivity.this, "Download could not be started", Toast.LENGTH_SHORT).show();
                }
            }
        });
    }

    private WebViewClient createClient(final boolean popup) {
        return new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String next = request != null && request.getUrl() != null ? request.getUrl().toString() : null;
                return next != null && !isHttpUrl(next) && routeNonHttp(next);
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return url != null && !isHttpUrl(url) && routeNonHttp(url);
            }
            @Override public void onPageStarted(WebView view, String url, Bitmap icon) {
                if (!popup) {
                    mainFrameError = false;
                    loading = true;
                    hideError();
                    showControls();
                    updateAddress(url);
                }
            }
            @Override public void onPageFinished(WebView view, String url) {
                if (!popup) {
                    loading = false;
                    updateAddress(url);
                    updateNavigation();
                    if (!mainFrameError) scheduleHide();
                }
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (!popup && request != null && request.isForMainFrame()) {
                    mainFrameError = true;
                    showError(error != null && error.getDescription() != null ? error.getDescription().toString() : "The page could not be loaded.");
                }
            }
            @Override public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse response) {
                if (!popup && request != null && request.isForMainFrame() && response != null && response.getStatusCode() >= 400) {
                    showError("Website returned error " + response.getStatusCode());
                }
            }
            @Override public void onReceivedSslError(WebView view, SslErrorHandler handler, android.net.http.SslError error) {
                // Do not silently bypass invalid TLS certificates.
                handler.cancel();
                if (!popup) showError("Secure connection could not be verified.");
            }
            @Override public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                String url = view.getUrl();
                if (view == popupWebView) closePopup();
                else rebuildMainWebView(url);
                return true;
            }
        };
    }

    private WebChromeClient createChromeClient() {
        return new WebChromeClient() {
            @Override public void onProgressChanged(WebView view, int progress) {
                if (view == activeWebView() && progressBar != null) {
                    progressBar.setProgress(progress);
                    progressBar.setVisibility(progress >= 100 ? View.GONE : View.VISIBLE);
                }
            }
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent intent;
                try { intent = params.createIntent(); }
                catch (Exception e) { intent = new Intent(Intent.ACTION_OPEN_DOCUMENT).setType("*/*"); }
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, params.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE);
                try { filePicker.launch(Intent.createChooser(intent, "Choose file")); }
                catch (Exception e) { callback.onReceiveValue(null); fileCallback = null; }
                return true;
            }
            @Override public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                boolean allowed = ContextCompat.checkSelfPermission(NativeBrowserActivity.this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED || ContextCompat.checkSelfPermission(NativeBrowserActivity.this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
                if (allowed) callback.invoke(origin, true, false);
                else {
                    new AlertDialog.Builder(NativeBrowserActivity.this).setTitle("Location request").setMessage("Allow this website to use your location?").setPositiveButton("Allow", (d,w) -> {
                        pendingGeoCallback = callback;
                        pendingGeoOrigin = origin;
                        permissionLauncher.launch(new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION});
                    }).setNegativeButton("Block", (d,w) -> callback.invoke(origin, false, false)).show();
                }
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
                else {
                    pendingWebPermission = request;
                    ArrayList<String> permissions = new ArrayList<>();
                    if (needCamera) permissions.add(Manifest.permission.CAMERA);
                    if (needAudio) permissions.add(Manifest.permission.RECORD_AUDIO);
                    permissionLauncher.launch(permissions.toArray(new String[0]));
                }
            }
            @Override public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
                openPopup(resultMsg);
                return true;
            }
            @Override public void onCloseWindow(WebView window) { if (window == popupWebView) closePopup(); }
        };
    }

    private void openPopup(Message resultMsg) {
        closePopup();
        popupWebView = new WebView(this);
        configureWebView(popupWebView);
        popupWebView.setWebViewClient(createClient(true));
        popupWebView.setWebChromeClient(createChromeClient());
        installDownloadListener(popupWebView);
        webContainer.addView(popupWebView, new FrameLayout.LayoutParams(-1, -1));
        WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
        transport.setWebView(popupWebView);
        resultMsg.sendToTarget();
        showControls();
    }

    private void closePopup() {
        if (popupWebView != null) {
            webContainer.removeView(popupWebView);
            popupWebView.destroy();
            popupWebView = null;
            updateAddress(webView != null ? webView.getUrl() : null);
            updateNavigation();
        }
    }

    private void rebuildMainWebView(String url) {
        if (webView != null) webContainer.removeView(webView);
        webView = new WebView(this);
        configureWebView(webView);
        webView.setWebViewClient(createClient(false));
        webView.setWebChromeClient(createChromeClient());
        installDownloadListener(webView);
        webContainer.addView(webView, 0, new FrameLayout.LayoutParams(-1, -1));
        if (isHttpUrl(url)) webView.loadUrl(url);
    }

    private void showControls() {
        if (hideRunnable != null) handler.removeCallbacks(hideRunnable);
        if (topBar != null) { topBar.setVisibility(View.VISIBLE); topBar.animate().translationY(0).alpha(1f).setDuration(160).start(); }
        if (bottomBar != null) { bottomBar.setVisibility(View.VISIBLE); bottomBar.animate().translationY(0).alpha(1f).setDuration(160).start(); }
    }
    private void hideControls() {
        if (loading || mainFrameError) return;
        if (topBar != null && topBar.getVisibility() == View.VISIBLE) topBar.animate().translationY(-dp(80)).alpha(0f).setDuration(200).withEndAction(() -> topBar.setVisibility(View.INVISIBLE)).start();
        if (bottomBar != null && bottomBar.getVisibility() == View.VISIBLE) bottomBar.animate().translationY(dp(80)).alpha(0f).setDuration(200).withEndAction(() -> bottomBar.setVisibility(View.INVISIBLE)).start();
    }
    private void scheduleHide() {
        if (hideRunnable != null) handler.removeCallbacks(hideRunnable);
        hideRunnable = this::hideControls;
        handler.postDelayed(hideRunnable, AUTO_HIDE_MS);
    }
    private void updateNavigation() {
        WebView active = activeWebView();
        if (backButton != null) { backButton.setEnabled(active.canGoBack()); backButton.setAlpha(active.canGoBack() ? 1f : .35f); }
        if (forwardButton != null) { forwardButton.setEnabled(active.canGoForward()); forwardButton.setAlpha(active.canGoForward() ? 1f : .35f); }
    }
    private void updateAddress(String url) { if (addressBar != null && url != null && !addressBar.hasFocus()) addressBar.setText(url); updateNavigation(); }
    private void showError(String message) { loading = false; showControls(); if (errorView != null) { TextView detail = errorView.findViewWithTag("detail"); if (detail != null) detail.setText(message); errorView.setVisibility(View.VISIBLE); } }
    private void hideError() { if (errorView != null) errorView.setVisibility(View.GONE); }

    private void toggleDesktopMode() {
        desktopMode = !desktopMode;
        activeWebView().getSettings().setUserAgentString(desktopMode ? DESKTOP_UA : WebSettings.getDefaultUserAgent(this));
        activeWebView().reload();
        Toast.makeText(this, desktopMode ? "Desktop site enabled" : "Mobile site enabled", Toast.LENGTH_SHORT).show();
    }
    private void findInPage() {
        EditText input = new EditText(this); input.setSingleLine(true); input.setHint("Find text");
        new AlertDialog.Builder(this).setTitle("Find in page").setView(input).setPositiveButton("Find", (d,w) -> activeWebView().findAllAsync(input.getText().toString())).setNegativeButton("Cancel", null).show();
    }
    private void copyUrl() { String url = activeWebView().getUrl(); if (url != null) { ((ClipboardManager)getSystemService(Context.CLIPBOARD_SERVICE)).setPrimaryClip(ClipData.newPlainText("URL", url)); Toast.makeText(this, "Link copied", Toast.LENGTH_SHORT).show(); } }
    private void share() { String url = activeWebView().getUrl(); if (url != null) { Intent i = new Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, url); startActivity(Intent.createChooser(i, "Share link")); } }
    private void showMenu() {
        String[] actions = {"Refresh", "Find in page", desktopMode ? "Mobile site" : "Desktop site", "Share", "Copy link", "Close popup", "Settings"};
        new AlertDialog.Builder(this).setItems(actions, (d, which) -> {
            if (which == 0) activeWebView().reload();
            else if (which == 1) findInPage();
            else if (which == 2) toggleDesktopMode();
            else if (which == 3) share();
            else if (which == 4) copyUrl();
            else if (which == 5) closePopup();
            else showSettings();
        }).show();
    }
    private void showSettings() {
        String[] options = {"Auto-hide toolbar", "Clear browsing data"};
        new AlertDialog.Builder(this).setTitle("Samahit Views Settings").setItems(options, (d,w) -> {
            if (w == 0) Toast.makeText(this, "Controls hide after 4 seconds and return on double-tap", Toast.LENGTH_LONG).show();
            else { CookieManager.getInstance().removeAllCookies(null); CookieManager.getInstance().flush(); webView.clearCache(true); webView.clearHistory(); Toast.makeText(this, "Browsing data cleared", Toast.LENGTH_SHORT).show(); }
        }).show();
    }

    private TextView button(String text) { TextView v = new TextView(this); v.setText(text); v.setTextColor(NAVY); v.setTextSize(19); v.setGravity(Gravity.CENTER); v.setPadding(dp(10), dp(8), dp(10), dp(8)); return v; }
    private void buildChrome() {
        topBar = new LinearLayout(this); topBar.setOrientation(LinearLayout.HORIZONTAL); topBar.setGravity(Gravity.CENTER_VERTICAL); topBar.setPadding(dp(6), dp(8), dp(6), dp(6)); topBar.setBackgroundColor(IVORY);
        backButton = button("‹"); backButton.setOnClickListener(v -> { if (activeWebView().canGoBack()) activeWebView().goBack(); }); topBar.addView(backButton, new LinearLayout.LayoutParams(dp(48), -2));
        forwardButton = button("›"); forwardButton.setOnClickListener(v -> { if (activeWebView().canGoForward()) activeWebView().goForward(); }); topBar.addView(forwardButton, new LinearLayout.LayoutParams(dp(48), -2));
        addressBar = new EditText(this); addressBar.setSingleLine(true); addressBar.setTextColor(NAVY); addressBar.setTextSize(14); addressBar.setHint("Search or enter address"); addressBar.setPadding(dp(12), 0, dp(12), 0); addressBar.setBackgroundColor(Color.WHITE); addressBar.setOnEditorActionListener((v,a,e) -> { loadInApp(addressBar.getText().toString()); addressBar.clearFocus(); return true; }); topBar.addView(addressBar, new LinearLayout.LayoutParams(0, dp(46), 1));
        TextView reload = button("↻"); reload.setOnClickListener(v -> activeWebView().reload()); topBar.addView(reload, new LinearLayout.LayoutParams(dp(48), -2)); root.addView(topBar, new FrameLayout.LayoutParams(-1, -2, Gravity.TOP));
        bottomBar = new LinearLayout(this); bottomBar.setGravity(Gravity.CENTER); bottomBar.setPadding(dp(10), dp(6), dp(10), dp(10)); bottomBar.setBackgroundColor(IVORY);
        TextView home = button("⌂"); home.setOnClickListener(v -> loadInApp("https://www.google.com")); bottomBar.addView(home, new LinearLayout.LayoutParams(0, -2, 1));
        TextView find = button("⌕"); find.setOnClickListener(v -> findInPage()); bottomBar.addView(find, new LinearLayout.LayoutParams(0, -2, 1));
        TextView menu = button("⋮"); menu.setOnClickListener(v -> showMenu()); bottomBar.addView(menu, new LinearLayout.LayoutParams(0, -2, 1)); root.addView(bottomBar, new FrameLayout.LayoutParams(-1, -2, Gravity.BOTTOM));
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(IVORY); getWindow().setNavigationBarColor(IVORY);
        root = new FrameLayout(this); root.setBackgroundColor(Color.WHITE);
        webContainer = new FrameLayout(this); root.addView(webContainer, new FrameLayout.LayoutParams(-1, -1));
        rebuildMainWebView(null);
        gestureDetector = new GestureDetector(this, new GestureDetector.SimpleOnGestureListener() { @Override public boolean onDoubleTap(MotionEvent e) { if (topBar.getVisibility() == View.VISIBLE) hideControls(); else { showControls(); scheduleHide(); } return true; } });
        webContainer.setOnTouchListener((v,e) -> { gestureDetector.onTouchEvent(e); return false; });
        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal); progressBar.setMax(100); root.addView(progressBar, new FrameLayout.LayoutParams(-1, dp(3), Gravity.TOP));
        errorView = new LinearLayout(this); errorView.setOrientation(LinearLayout.VERTICAL); errorView.setGravity(Gravity.CENTER); errorView.setPadding(dp(28),dp(28),dp(28),dp(28)); errorView.setBackgroundColor(IVORY);
        TextView title = new TextView(this); title.setText("This page could not be loaded"); title.setTextColor(NAVY); title.setTextSize(19); title.setGravity(Gravity.CENTER); errorView.addView(title);
        TextView detail = new TextView(this); detail.setTag("detail"); detail.setTextColor(Color.DKGRAY); detail.setTextSize(13); detail.setGravity(Gravity.CENTER); LinearLayout.LayoutParams detailParams = new LinearLayout.LayoutParams(-1,-2); detailParams.topMargin=dp(12); errorView.addView(detail,detailParams);
        TextView retry = button("Try again"); retry.setTextColor(Color.WHITE); retry.setBackgroundColor(NAVY); retry.setOnClickListener(v -> activeWebView().reload()); LinearLayout.LayoutParams retryParams = new LinearLayout.LayoutParams(-2,-2); retryParams.topMargin=dp(20); errorView.addView(retry,retryParams); errorView.setVisibility(View.GONE); root.addView(errorView,new FrameLayout.LayoutParams(-1,-1));
        buildChrome(); setContentView(root);
        if (state != null) webView.restoreState(state); else loadInApp(getIntent().getStringExtra("url"));
    }

    @Override public void onBackPressed() {
        if (popupWebView != null) { if (popupWebView.canGoBack()) popupWebView.goBack(); else closePopup(); }
        else if (webView != null && webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }
    @Override protected void onSaveInstanceState(Bundle outState) { if (webView != null) webView.saveState(outState); super.onSaveInstanceState(outState); }
    @Override protected void onPause() { if (webView != null) { webView.onPause(); webView.pauseTimers(); } if (popupWebView != null) popupWebView.onPause(); super.onPause(); }
    @Override protected void onResume() { super.onResume(); if (webView != null) { webView.onResume(); webView.resumeTimers(); } if (popupWebView != null) popupWebView.onResume(); }
    @Override protected void onDestroy() { if (hideRunnable != null) handler.removeCallbacks(hideRunnable); closePopup(); if (webView != null) { webView.stopLoading(); webView.destroy(); } super.onDestroy(); }
}
