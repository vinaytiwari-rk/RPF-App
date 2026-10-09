package com.rpfoundation.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeBrowserPlugin.class);
        registerPlugin(NativePermissionsPlugin.class);
        registerPlugin(NativeDownloadsPlugin.class);
        super.onCreate(savedInstanceState);
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
