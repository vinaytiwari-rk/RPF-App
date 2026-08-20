package com.rpfoundation.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeBrowserPlugin.class);
        registerPlugin(NativePermissionsPlugin.class);
        super.onCreate(savedInstanceState);
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
