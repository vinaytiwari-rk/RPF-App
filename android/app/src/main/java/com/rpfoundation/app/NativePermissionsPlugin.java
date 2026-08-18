package com.rpfoundation.app;

import android.Manifest;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PluginMethod;

@CapacitorPlugin(name = "NativePermissions", permissions = {
    @Permission(alias = "location", strings = { Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION }),
    @Permission(alias = "camera", strings = { Manifest.permission.CAMERA }),
    @Permission(alias = "microphone", strings = { Manifest.permission.RECORD_AUDIO }),
    @Permission(alias = "contacts", strings = { Manifest.permission.READ_CONTACTS }),
    @Permission(alias = "nearbyDevices", strings = { Manifest.permission.BLUETOOTH_SCAN, Manifest.permission.BLUETOOTH_CONNECT }),
    @Permission(alias = "images", strings = { Manifest.permission.READ_MEDIA_IMAGES }),
    @Permission(alias = "audio", strings = { Manifest.permission.READ_MEDIA_AUDIO }),
    @Permission(alias = "notifications", strings = { Manifest.permission.POST_NOTIFICATIONS })
})
public class NativePermissionsPlugin extends Plugin {
    @PluginMethod
    public void request(PluginCall call) {
        String name = call.getString("permission");
        if (name == null || name.trim().isEmpty()) { call.reject("permission is required"); return; }
        if ((name.equals("notifications") || name.equals("images") || name.equals("audio")) && Build.VERSION.SDK_INT < 33) {
            JSObject ret = new JSObject(); ret.put("status", "granted"); call.resolve(ret); return;
        }
        requestPermissionForAlias(name, call, "permissionCallback");
    }

    @PluginMethod
    public void check(PluginCall call) {
        String name = call.getString("permission");
        JSObject ret = new JSObject();
        if (name == null || name.trim().isEmpty()) { ret.put("status", "unknown"); call.resolve(ret); return; }
        PermissionState state = getPermissionState(name);
        ret.put("status", state == PermissionState.GRANTED ? "granted" : (state == PermissionState.DENIED ? "denied" : "prompt"));
        call.resolve(ret);
    }

    private void permissionCallback(PluginCall call) {
        String name = call.getString("permission", "");
        PermissionState state = getPermissionState(name);
        JSObject ret = new JSObject();
        ret.put("status", state == PermissionState.GRANTED ? "granted" : "denied");
        call.resolve(ret);
    }
}
