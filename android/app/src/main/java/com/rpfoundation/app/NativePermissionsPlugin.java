package com.rpfoundation.app;

import android.Manifest;
import android.content.Context;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Looper;
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
    @PluginMethod public void request(PluginCall call) {
        String name = call.getString("permission");
        if (name == null || name.trim().isEmpty()) { call.reject("permission is required"); return; }
        if ((name.equals("notifications") || name.equals("images") || name.equals("audio")) && Build.VERSION.SDK_INT < 33) { JSObject r = new JSObject(); r.put("status", "granted"); call.resolve(r); return; }
        requestPermissionForAlias(name, call, "permissionCallback");
    }
    @PluginMethod public void check(PluginCall call) {
        String name = call.getString("permission"); JSObject r = new JSObject();
        if (name == null || name.trim().isEmpty()) { r.put("status", "unknown"); call.resolve(r); return; }
        PermissionState s = getPermissionState(name); r.put("status", s == PermissionState.GRANTED ? "granted" : (s == PermissionState.DENIED ? "denied" : "prompt")); call.resolve(r);
    }
    @PluginMethod public void currentLocation(PluginCall call) {
        if (getPermissionState("location") != PermissionState.GRANTED) { call.reject("Location permission not granted"); return; }
        LocationManager lm = (LocationManager) getContext().getSystemService(Context.LOCATION_SERVICE);
        if (lm == null) { call.reject("Location service unavailable"); return; }
        try {
            String provider = lm.isProviderEnabled(LocationManager.GPS_PROVIDER) ? LocationManager.GPS_PROVIDER : LocationManager.NETWORK_PROVIDER;
            Location last = lm.getLastKnownLocation(provider);
            if (last != null) { resolveLocation(call, last); return; }
            LocationListener listener = new LocationListener() {
                @Override public void onLocationChanged(Location location) { try { lm.removeUpdates(this); } catch (Exception ignored) {} resolveLocation(call, location); }
                @Override public void onProviderDisabled(String p) {}
                @Override public void onProviderEnabled(String p) {}
                @Override public void onStatusChanged(String p, int s, Bundle e) {}
            };
            lm.requestSingleUpdate(provider, listener, Looper.getMainLooper());
        } catch (Exception e) { call.reject("Unable to obtain location", e); }
    }
    private void resolveLocation(PluginCall call, Location l) { JSObject r = new JSObject(); r.put("latitude", l.getLatitude()); r.put("longitude", l.getLongitude()); r.put("accuracy", l.getAccuracy()); r.put("timestamp", l.getTime()); call.resolve(r); }
    private void permissionCallback(PluginCall call) { String name = call.getString("permission", ""); PermissionState s = getPermissionState(name); JSObject r = new JSObject(); r.put("status", s == PermissionState.GRANTED ? "granted" : "denied"); call.resolve(r); }
}
