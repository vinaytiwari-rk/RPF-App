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
}
