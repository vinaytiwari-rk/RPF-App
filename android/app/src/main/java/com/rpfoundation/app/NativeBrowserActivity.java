package com.rpfoundation.app;

import android.annotation.SuppressLint;
import android.graphics.Color;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class NativeBrowserActivity extends AppCompatActivity {
    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        String url = getIntent().getStringExtra("url");
        String title = getIntent().getStringExtra("title");
        if (url == null || !(url.startsWith("https://") || url.startsWith("http://"))) { finish(); return; }

        LinearLayout root = new LinearLayout(this); root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.WHITE);
        LinearLayout top = new LinearLayout(this); top.setGravity(Gravity.CENTER_VERTICAL); top.setPadding(12,8,12,8);
        TextView heading = new TextView(this); heading.setText(title == null || title.isEmpty() ? "RPF Web View" : "RPF Web View"); heading.setTextSize(18); heading.setLayoutParams(new LinearLayout.LayoutParams(0,-2,1));
        Button back = new Button(this); back.setText("‹"); Button forward = new Button(this); forward.setText("›");
        top.addView(heading); top.addView(back); top.addView(forward); root.addView(top);
        webView = new WebView(this); webView.getSettings().setJavaScriptEnabled(true); webView.getSettings().setDomStorageEnabled(true); webView.getSettings().setLoadWithOverviewMode(true); webView.setWebViewClient(new WebViewClient()); webView.setWebChromeClient(new WebChromeClient()); root.addView(webView, new LinearLayout.LayoutParams(-1,0,1));
        LinearLayout bottom = new LinearLayout(this); bottom.setGravity(Gravity.CENTER); String[] labels = {"Home","Explore","Activity","Impact","Me"};
        for (String label : labels) { Button b = new Button(this); b.setText(label); b.setTextSize(11); b.setLayoutParams(new LinearLayout.LayoutParams(0,-2,1)); b.setOnClickListener(v -> { finish(); }); bottom.addView(b); }
        root.addView(bottom); setContentView(root);
        back.setOnClickListener(v -> { if (webView.canGoBack()) webView.goBack(); });
        forward.setOnClickListener(v -> { if (webView.canGoForward()) webView.goForward(); });
        webView.loadUrl(url);
    }
    @Override public void onBackPressed() { if (webView != null && webView.canGoBack()) webView.goBack(); else super.onBackPressed(); }
}
