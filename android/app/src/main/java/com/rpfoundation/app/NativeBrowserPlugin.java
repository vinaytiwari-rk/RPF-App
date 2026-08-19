package com.rpfoundation.app;

import android.content.Intent;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "NativeRPFBrowser")
public class NativeBrowserPlugin extends Plugin {
    public void open(PluginCall call) {
        String url = call.getString("url");
        if (url == null || !(url.startsWith("https://") || url.startsWith("http://"))) { call.reject("Only HTTP(S) URLs are allowed"); return; }
        Intent intent = new Intent(getContext(), NativeBrowserActivity.class);
        intent.putExtra("url", url);
        intent.putExtra("title", call.getString("title", "RPF Web View"));
        getActivity().startActivity(intent);
        call.resolve();
    }
}
