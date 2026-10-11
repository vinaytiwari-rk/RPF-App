package com.rpfoundation.app;

import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.OutputStream;

@CapacitorPlugin(name = "NativeDownloads")
public class NativeDownloadsPlugin extends Plugin {
    @PluginMethod
    public void saveToDownloads(PluginCall call) {
        String filename = call.getString("filename");
        String mimeType = call.getString("mimeType", "application/octet-stream");
        String data = call.getString("data");

        if (filename == null || filename.trim().isEmpty() || data == null || data.isEmpty()) {
            call.reject("filename and file data are required");
            return;
        }
        // Prevent path traversal: MediaStore receives only a plain filename.
        filename = filename.replaceAll("[\\\\/:*?\"<>|]", "_").trim();
        if (filename.isEmpty()) filename = "samahit-download";
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            call.reject("Direct Downloads saving requires Android 10 or later on this device");
            return;
        }

        Uri savedUri = null;
        try {
            byte[] bytes = Base64.decode(data, Base64.DEFAULT);
            ContentValues values = new ContentValues();
            values.put(MediaStore.MediaColumns.DISPLAY_NAME, filename);
            values.put(MediaStore.MediaColumns.MIME_TYPE, mimeType);
            values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/SAMAHIT");
            values.put(MediaStore.MediaColumns.IS_PENDING, 1);

            savedUri = getContext().getContentResolver().insert(
                MediaStore.Downloads.EXTERNAL_CONTENT_URI, values
            );
            if (savedUri == null) throw new IllegalStateException("Android could not create the Downloads file");

            try (OutputStream output = getContext().getContentResolver().openOutputStream(savedUri, "w")) {
                if (output == null) throw new IllegalStateException("Could not open the Downloads file");
                output.write(bytes);
                output.flush();
            }

            ContentValues completed = new ContentValues();
            completed.put(MediaStore.MediaColumns.IS_PENDING, 0);
            int finalized = getContext().getContentResolver().update(savedUri, completed, null, null);
            if (finalized != 1) {
                throw new IllegalStateException("Android could not finalize the file in Downloads");
            }

            JSObject result = new JSObject();
            result.put("uri", savedUri.toString());
            result.put("filename", filename);
            call.resolve(result);
        } catch (Exception e) {
            if (savedUri != null) {
                try { getContext().getContentResolver().delete(savedUri, null, null); } catch (Exception ignored) {}
            }
            call.reject("Could not save file to Downloads: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void getAppVersion(PluginCall call) {
        try {
            android.content.pm.PackageInfo pInfo = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
            long versionCode = 0;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                versionCode = pInfo.getLongVersionCode();
            } else {
                versionCode = (long) pInfo.versionCode;
            }
            JSObject ret = new JSObject();
            ret.put("versionCode", versionCode);
            ret.put("versionName", pInfo.versionName != null ? pInfo.versionName : "2.5.0");
            ret.put("packageName", pInfo.packageName);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to retrieve package info: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void installApk(PluginCall call) {
        String base64Data = call.getString("data");
        String filename = call.getString("filename", "rpf-app-update.apk");

        if (base64Data == null || base64Data.trim().isEmpty()) {
            call.reject("base64 apk data is required");
            return;
        }

        try {
            // Write to app's cache directory first so FileProvider can safely grant access to package installer
            java.io.File cacheDir = new java.io.File(getContext().getCacheDir(), "updates");
            if (!cacheDir.exists()) {
                cacheDir.mkdirs();
            }
            java.io.File apkFile = new java.io.File(cacheDir, filename);
            byte[] bytes = Base64.decode(base64Data, Base64.DEFAULT);
            try (java.io.FileOutputStream fos = new java.io.FileOutputStream(apkFile)) {
                fos.write(bytes);
                fos.flush();
            }

            android.content.Context ctx = getContext();
            String authority = ctx.getPackageName() + ".fileprovider";
            Uri contentUri = androidx.core.content.FileProvider.getUriForFile(ctx, authority, apkFile);

            android.content.Intent intent = new android.content.Intent(android.content.Intent.ACTION_VIEW);
            intent.setDataAndType(contentUri, "application/vnd.android.package-archive");
            intent.addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);

            ctx.startActivity(intent);

            JSObject res = new JSObject();
            res.put("success", true);
            res.put("path", apkFile.getAbsolutePath());
            call.resolve(res);
        } catch (Exception e) {
            call.reject("Failed to start package installer: " + e.getMessage(), e);
        }
    }
}

