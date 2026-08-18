package com.rpfoundation.app;

import android.annotation.SuppressLint;
import android.content.pm.ActivityInfo;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

import java.util.Locale;

public class NativeBrowserActivity extends AppCompatActivity {
    private WebView webView;
    private Button rotateButton;
    private boolean youtubeLandscape = false;

    private boolean isYoutubeUrl(String url) {
        if (url == null) return false;
        try {
            String host = new java.net.URL(url).getHost().toLowerCase(Locale.ROOT);
            return host.equals("youtube.com") || host.endsWith(".youtube.com") || host.equals("youtu.be") || host.endsWith(".youtu.be");
        } catch (Exception ignored) { return false; }
    }

    private void setYoutubeOrientation(boolean landscape) {
        youtubeLandscape = landscape;
        setRequestedOrientation(landscape
                ? ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
                : ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        if (rotateButton != null) rotateButton.setText(landscape ? "↕" : "↔");
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        Window window = getWindow();
        window.setStatusBarColor(Color.WHITE);
        window.setNavigationBarColor(Color.WHITE);
        int uiFlags = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) uiFlags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        window.getDecorView().setSystemUiVisibility(uiFlags);

        String url = getIntent().getStringExtra("url");
        if (url == null || !(url.startsWith("https://") || url.startsWith("http://"))) { finish(); return; }

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.WHITE);
        root.setFitsSystemWindows(false);
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            v.setPadding(0, insets.getSystemWindowInsetTop(), 0, insets.getSystemWindowInsetBottom());
            return insets;
        });

        LinearLayout top = new LinearLayout(this);
        top.setGravity(Gravity.CENTER_VERTICAL);
        top.setPadding(12, 6, 8, 6);
        top.setMinimumHeight(56);
        TextView heading = new TextView(this);
        heading.setText("RPF Web View");
        heading.setTextSize(18);
        heading.setTextColor(Color.rgb(0, 0, 128));
        heading.setLayoutParams(new LinearLayout.LayoutParams(0, -2, 1));
        Button back = new Button(this); back.setText("‹");
        Button forward = new Button(this); forward.setText("›");
        rotateButton = new Button(this); rotateButton.setText("↔");
        rotateButton.setVisibility(isYoutubeUrl(url) ? View.VISIBLE : View.GONE);
        top.addView(heading); top.addView(back); top.addView(forward); top.addView(rotateButton);
        root.addView(top, new LinearLayout.LayoutParams(-1, -2));

        webView = new WebView(this);
        webView.setBackgroundColor(Color.WHITE);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setUseWideViewPort(true);
        webView.getSettings().setLoadWithOverviewMode(false);
        webView.getSettings().setTextZoom(100);
        webView.getSettings().setBuiltInZoomControls(false);
        webView.getSettings().setDisplayZoomControls(false);
        String ua = webView.getSettings().getUserAgentString();
        if (!ua.toLowerCase(Locale.ROOT).contains("mobile")) webView.getSettings().setUserAgentString(ua + " Mobile");
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, String nextUrl) {
                if (isYoutubeUrl(nextUrl) && !youtubeLandscape) setYoutubeOrientation(true);
                return false;
            }
            @Override public void onPageStarted(WebView view, String nextUrl, android.graphics.Bitmap favicon) {
                super.onPageStarted(view, nextUrl, favicon);
                if (isYoutubeUrl(nextUrl)) {
                    rotateButton.setVisibility(View.VISIBLE);
                    if (!youtubeLandscape) setYoutubeOrientation(true);
                }
            }
        });
        webView.setWebChromeClient(new WebChromeClient());
        root.addView(webView, new LinearLayout.LayoutParams(-1, 0, 1));

        LinearLayout bottom = new LinearLayout(this);
        bottom.setGravity(Gravity.CENTER);
        bottom.setBackgroundColor(Color.WHITE);
        String[] labels = {"Home", "Explore", "Activity", "Impact", "Me"};
        for (String label : labels) {
            Button b = new Button(this);
            b.setText(label);
            b.setTextSize(11);
            b.setMinHeight(56);
            b.setLayoutParams(new LinearLayout.LayoutParams(0, -2, 1));
            b.setOnClickListener(v -> finish());
            bottom.addView(b);
        }
        root.addView(bottom, new LinearLayout.LayoutParams(-1, -2));

        setContentView(root);
        back.setOnClickListener(v -> { if (webView.canGoBack()) webView.goBack(); });
        forward.setOnClickListener(v -> { if (webView.canGoForward()) webView.goForward(); });
        rotateButton.setOnClickListener(v -> setYoutubeOrientation(!youtubeLandscape));
        if (isYoutubeUrl(url)) setYoutubeOrientation(true);
        webView.loadUrl(url);
    }

    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }

    @Override protected void onDestroy() {
        if (webView != null) webView.destroy();
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        super.onDestroy();
    }
}
