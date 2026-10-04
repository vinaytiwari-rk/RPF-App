package com.rpfoundation.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
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
import android.app.PictureInPictureParams;
import android.util.Rational;
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
import org.json.JSONArray;

/** Samahit Views: compatibility-first native Android browser. */
public class NativeBrowserActivity extends AppCompatActivity {
    private static final int NAVY = Color.rgb(20,33,61);
    private static final int IVORY = Color.rgb(255,249,240);
    private static final long AUTO_HIDE_MS = 3500L;
    private static final String PREFS = "samahit_views";
    private static final String PERMISSION_PREFIX = "permission_";
    private String mobileUserAgent;
    private String desktopUserAgent;

    private FrameLayout root, webContainer;
    private WebView webView, popupWebView;
    private final ArrayList<WebView> tabViews = new ArrayList<>();
    private View customFullscreenView;
    private WebChromeClient.CustomViewCallback customFullscreenCallback;
    private LinearLayout topBar, bottomBar, errorView;
    private ProgressBar progressBar;
    private EditText addressBar;
    private TextView backButton, forwardButton;
    private boolean loading, mainFrameError, desktopMode, autoHide, dataSaver, restoreTabs, mediaAutoplay;
    private String lastStableUrl;
    private String failedUrl;
    private final ArrayList<String> tabs = new ArrayList<>();
    private final ArrayList<Integer> tabScrollY = new ArrayList<>();
    private int currentTab = 0;
    private static final String BOOKMARKS = "bookmarks";
    private static final String HISTORY = "history";
    private SharedPreferences prefs;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private Runnable hideRunnable;
    private GestureDetector gestureDetector;
    private ValueCallback<Uri[]> fileCallback;
    private PermissionRequest pendingWebPermission;
    private GeolocationPermissions.Callback pendingGeoCallback;
    private String pendingGeoOrigin;

    private final ActivityResultLauncher<Intent> filePicker = registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), this::deliverPickedFiles);
    private final ActivityResultLauncher<String[]> permissionLauncher = registerForActivityResult(new ActivityResultContracts.RequestMultiplePermissions(), result -> {
        if (pendingWebPermission != null) {
            ArrayList<String> grant = new ArrayList<>();
            for (String r : pendingWebPermission.getResources()) {
                if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(r) && Boolean.TRUE.equals(result.get(Manifest.permission.CAMERA))) grant.add(r);
                if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(r) && Boolean.TRUE.equals(result.get(Manifest.permission.RECORD_AUDIO))) grant.add(r);
            }
            if (grant.isEmpty()) pendingWebPermission.deny(); else pendingWebPermission.grant(grant.toArray(new String[0]));
            pendingWebPermission = null;
        }
        if (pendingGeoCallback != null) {
            boolean ok = Boolean.TRUE.equals(result.get(Manifest.permission.ACCESS_FINE_LOCATION)) || Boolean.TRUE.equals(result.get(Manifest.permission.ACCESS_COARSE_LOCATION));
            pendingGeoCallback.invoke(pendingGeoOrigin, ok, false);
            pendingGeoCallback = null; pendingGeoOrigin = null;
        }
    });

    private void initializeUserAgents(){
        mobileUserAgent=WebSettings.getDefaultUserAgent(this);
        desktopUserAgent=mobileUserAgent.replaceAll("\\(Linux; Android[^)]*\\)","(X11; Linux x86_64)")
          .replace(" Mobile Safari/"," Safari/");
    }
    private int dp(int v){ return Math.round(v * getResources().getDisplayMetrics().density); }
    private boolean isHttpUrl(String s){ return s != null && (s.startsWith("https://") || s.startsWith("http://")); }
    private WebView activeWebView(){ return popupWebView != null ? popupWebView : webView; }

    private String normalizeAddress(String value){
        if(value == null) return null;
        value = value.trim();
        if(value.isEmpty()) return null;
        if(isHttpUrl(value) || value.startsWith("intent://")) return value;
        if(value.contains("://")) return value;
        if(value.contains(" ") || !value.contains(".")) return "https://www.google.com/search?q=" + Uri.encode(value);
        return "https://" + value;
    }

    private String resolveIntentFallback(String value){
        if(value == null || !value.startsWith("intent://")) return null;
        try {
            Intent intent = Intent.parseUri(value, Intent.URI_INTENT_SCHEME);
            String fallback = intent.getStringExtra("browser_fallback_url");
            if(isHttpUrl(fallback)) return fallback;
            Uri data = intent.getData();
            if(data != null && isHttpUrl(data.toString())) return data.toString();
        } catch(Exception ignored){}
        return null;
    }

    private boolean routeNonHttp(String url){
        if(url == null) return false;
        String fallback = resolveIntentFallback(url);
        if(fallback != null){ loadInApp(fallback); return true; }
        if(url.startsWith("about:") || url.startsWith("javascript:") || url.startsWith("blob:") || url.startsWith("data:")) return false;
        try {
            Intent intent = url.startsWith("intent://")
              ? Intent.parseUri(url, Intent.URI_INTENT_SCHEME)
              : new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
            return true;
        } catch (Exception ignored) {}
        Toast.makeText(this,"This link requires a non-web app or has no web fallback",Toast.LENGTH_SHORT).show();
        return true;
    }

    private void openCompatibilityBrowser(String value){
        if(!isHttpUrl(value)) return;
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(value));
            intent.addCategory(Intent.CATEGORY_BROWSABLE);
            startActivity(intent);
        } catch(Exception ignored) {}
    }

    private void loadInApp(String value){
        String target = normalizeAddress(value);
        if(target == null) return;
        if(target.startsWith("intent://")) target = resolveIntentFallback(target);
        if(!isHttpUrl(target)){ Toast.makeText(this,"No compatible web page is available for this link",Toast.LENGTH_SHORT).show(); return; }
        mainFrameError = false; failedUrl=null; hideError(); showControls(); activeWebView().loadUrl(target);
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void configureWebView(WebView target){
        WebSettings s = target.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setSaveFormData(true);
        s.setDefaultTextEncodingName("UTF-8");
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) s.setOffscreenPreRaster(true);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        s.setSupportMultipleWindows(true);
        s.setSupportZoom(true);
        s.setMediaPlaybackRequiresUserGesture(!mediaAutoplay);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);
        s.setTextZoom(100);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setGeolocationEnabled(true);
        s.setLoadsImagesAutomatically(!dataSaver);
        s.setBlockNetworkImage(dataSaver);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        if(desktopMode) s.setUserAgentString(desktopUserAgent);
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP){
            s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
            CookieManager.getInstance().setAcceptThirdPartyCookies(target,true);
        }
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.O){
            s.setSafeBrowsingEnabled(true);
            target.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT,false);
        }
        target.setLayerType(View.LAYER_TYPE_HARDWARE,null);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().flush();
    }

    private void rememberTabs(){
        if(!restoreTabs) return;
        try{
            JSONArray urls=new JSONArray(tabs);
            JSONArray scroll=new JSONArray();
            for(int i=0;i<tabs.size();i++) scroll.put(i<tabScrollY.size()?tabScrollY.get(i):0);
            prefs.edit().putString("openTabs",urls.toString()).putString("tabScrollY",scroll.toString()).putInt("currentTab",currentTab).apply();
        }catch(Exception ignored){}
    }
    private void restoreSavedTabs(){
        tabs.clear(); tabScrollY.clear();
        if(!restoreTabs) return;
        try{
            JSONArray a=new JSONArray(prefs.getString("openTabs","[]"));
            JSONArray scroll=new JSONArray(prefs.getString("tabScrollY","[]"));
            for(int i=0;i<a.length() && i<12;i++){String u=a.optString(i,"");if(isHttpUrl(u)){tabs.add(u);tabScrollY.add(scroll.optInt(i,0));}}
            if(tabs.isEmpty()){
                currentTab=0;
                return;
            }
            currentTab=Math.max(0,Math.min(prefs.getInt("currentTab",0),tabs.size()-1));
        }catch(Exception ignored){
            tabs.clear();
            currentTab=0;
        }
    }

    private void restoreTabWebViews(){
        if(tabs.isEmpty()) return;
        if(tabViews.isEmpty() && webView != null){
            tabViews.add(webView);
            webView.setVisibility(currentTab==0 ? View.VISIBLE : View.GONE);
            if(isHttpUrl(tabs.get(0)) && !tabs.get(0).equals(webView.getUrl())) webView.loadUrl(tabs.get(0));
            if(currentTab==0 && tabScrollY.size()>0) webView.postDelayed(()->webView.scrollTo(0,tabScrollY.get(0)),350);
        }
        if(tabViews.size()>=tabs.size()){
            if(currentTab>=0 && currentTab<tabViews.size()){webView=tabViews.get(currentTab);webView.setVisibility(View.VISIBLE);}
            return;
        }
        for(int i=tabViews.size();i<tabs.size();i++){
            String url=tabs.get(i);
            WebView w=createTabWebView(null);
            tabViews.add(w);
            webContainer.addView(w,new FrameLayout.LayoutParams(-1,-1));
            w.setVisibility(i==currentTab?View.VISIBLE:View.GONE);
            if(isHttpUrl(url)) w.loadUrl(url);
            if(i<tabScrollY.size()){ final int restoreIndex=i; w.postDelayed(()->w.scrollTo(0,tabScrollY.get(restoreIndex)),500); }
        }
        if(currentTab>=0 && currentTab<tabViews.size()){
            webView=tabViews.get(currentTab);
            webView.setVisibility(View.VISIBLE);
        }
    }
    private String permissionKey(String origin,String resource){
        try{Uri u=Uri.parse(origin);return PERMISSION_PREFIX+u.getScheme()+"://"+u.getAuthority()+":"+resource;}catch(Exception e){return PERMISSION_PREFIX+origin+":"+resource;}
    }
    private int sitePermission(String origin,String resource){ return prefs.getInt(permissionKey(origin,resource),0); }
    private void setSitePermission(String origin,String resource,int value){ prefs.edit().putInt(permissionKey(origin,resource),value).apply(); }

    private boolean androidPermissionGranted(String resource){
        if(PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource))
            return ContextCompat.checkSelfPermission(this,Manifest.permission.CAMERA)==PackageManager.PERMISSION_GRANTED;
        if(PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource))
            return ContextCompat.checkSelfPermission(this,Manifest.permission.RECORD_AUDIO)==PackageManager.PERMISSION_GRANTED;
        return false;
    }

    private boolean locationPermissionGranted(){
        return ContextCompat.checkSelfPermission(this,Manifest.permission.ACCESS_FINE_LOCATION)==PackageManager.PERMISSION_GRANTED
            || ContextCompat.checkSelfPermission(this,Manifest.permission.ACCESS_COARSE_LOCATION)==PackageManager.PERMISSION_GRANTED;
    }

    private void clearSitePermissions(){
        java.util.Map<String,?> all=prefs.getAll();
        SharedPreferences.Editor editor=prefs.edit();
        for(String key:all.keySet()) if(key.startsWith(PERMISSION_PREFIX)) editor.remove(key);
        editor.apply();
    }
    private void showDownloads(){
        try{
            DownloadManager dm=(DownloadManager)getSystemService(DOWNLOAD_SERVICE);
            android.app.DownloadManager.Query q=new android.app.DownloadManager.Query();
            android.database.Cursor cur=dm.query(q); ArrayList<String> rows=new ArrayList<>(); ArrayList<Long> ids=new ArrayList<>(); ArrayList<Integer> states=new ArrayList<>(); ArrayList<String> localUris=new ArrayList<>();
            if(cur!=null){int idCol=cur.getColumnIndex(DownloadManager.COLUMN_ID),title=cur.getColumnIndex(DownloadManager.COLUMN_TITLE),status=cur.getColumnIndex(DownloadManager.COLUMN_STATUS),local=cur.getColumnIndex(DownloadManager.COLUMN_LOCAL_URI),reason=cur.getColumnIndex(DownloadManager.COLUMN_REASON);while(cur.moveToNext()){
                long id=idCol>=0?cur.getLong(idCol):0L; String t=title>=0?cur.getString(title):"Download"; int s=status>=0?cur.getInt(status):0; String u=local>=0?cur.getString(local):"";
                String st=s==DownloadManager.STATUS_SUCCESSFUL?"Completed":s==DownloadManager.STATUS_FAILED?"Failed":s==DownloadManager.STATUS_PAUSED?"Paused":"In progress";
                if(s==DownloadManager.STATUS_FAILED && reason>=0){int rr=cur.getInt(reason); if(rr!=0) st += " (code "+rr+")";}
                ids.add(id); states.add(s); localUris.add(u); rows.add(t+"\n"+st);}cur.close();}
            if(rows.isEmpty()){Toast.makeText(this,"No downloads yet",Toast.LENGTH_SHORT).show();return;}
            new AlertDialog.Builder(this).setTitle("Downloads").setItems(rows.toArray(new String[0]),(d,which)->{
                long id=ids.get(which); int state=states.get(which); String local=localUris.get(which);
                if(state==DownloadManager.STATUS_SUCCESSFUL && local!=null && !local.isEmpty()){
                    try{Uri file=Uri.parse(local); Intent view=new Intent(Intent.ACTION_VIEW); view.setDataAndType(file,getContentResolver().getType(file)); view.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION); startActivity(view);}catch(Exception e){Toast.makeText(this,"No app can open this file",Toast.LENGTH_SHORT).show();}
                }else if(state==DownloadManager.STATUS_RUNNING || state==DownloadManager.STATUS_PENDING || state==DownloadManager.STATUS_PAUSED){
                    new AlertDialog.Builder(this).setMessage("Cancel this download?").setPositiveButton("Cancel",(a,b)->{dm.remove(id);showDownloads();}).setNegativeButton("Keep",null).show();
                }else Toast.makeText(this,"Download failed. Start it again from the website.",Toast.LENGTH_SHORT).show();
            }).setNegativeButton("Close",null).show();
        }catch(Exception e){Toast.makeText(this,"Download manager unavailable",Toast.LENGTH_SHORT).show();}
    }

    private void installDownloadListener(WebView target){
        target.setDownloadListener(new DownloadListener(){
            @Override public void onDownloadStart(String url,String ua,String disposition,String mime,long length){
                if(!isHttpUrl(url)){ Toast.makeText(NativeBrowserActivity.this,"Unsupported download link",Toast.LENGTH_SHORT).show(); return; }
                try{
                    DownloadManager.Request r = new DownloadManager.Request(Uri.parse(url));
                    String cookies = CookieManager.getInstance().getCookie(url);
                    if(cookies != null) r.addRequestHeader("Cookie",cookies);
                    r.setAllowedOverMetered(true);
                    r.setAllowedOverRoaming(false);
                    if(ua != null) r.addRequestHeader("User-Agent",ua);
                    r.setMimeType(mime);
                    String name = URLUtil.guessFileName(url,disposition,mime);
                    r.setTitle(name); r.setDescription("Downloading with Samahit Views");
                    r.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                    r.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS,name);
                    ((DownloadManager)getSystemService(DOWNLOAD_SERVICE)).enqueue(r);
                    Toast.makeText(NativeBrowserActivity.this,"Download started",Toast.LENGTH_SHORT).show();
                }catch(Exception e){ Toast.makeText(NativeBrowserActivity.this,"Download could not be started",Toast.LENGTH_SHORT).show(); }
            }
        });
    }

    private WebViewClient createClient(final boolean popup){
        return new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){
                String next = request != null && request.getUrl()!=null ? request.getUrl().toString() : null;
                return next != null && !isHttpUrl(next) && routeNonHttp(next);
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view,String url){ return url != null && !isHttpUrl(url) && routeNonHttp(url); }
            @Override public void onPageStarted(WebView view,String url,Bitmap icon){
                if(!popup){ mainFrameError=false; loading=true; hideError(); showControls(); updateAddress(url); }
            }
            @Override public void onPageFinished(WebView view,String url){
                if(!popup){ loading=false; if(isHttpUrl(url)){ lastStableUrl=url; if(currentTab<tabs.size())tabs.set(currentTab,url); remember(HISTORY,url); rememberTabs(); } updateAddress(url); updateNavigation(); if(!mainFrameError) scheduleHide(); }
            }
            @Override public void onReceivedError(WebView view,WebResourceRequest request,WebResourceError error){
                if(!popup && request != null && request.isForMainFrame()){
                    mainFrameError=true;failedUrl=request.getUrl()!=null?request.getUrl().toString():view.getUrl();
                    String description=error != null && error.getDescription()!=null ? error.getDescription().toString() : "The page could not be loaded.";
                    if(error!=null && error.getErrorCode()==WebViewClient.ERROR_HOST_LOOKUP)description="Website address could not be found (DNS). Check the URL and internet connection. If other sites open, this domain may be unavailable.\n\n"+description;
                    showError(description);
                    // Keep failures inside Samahit Views. External browser is user-invoked only.
                }
            }
            @Override public void onReceivedHttpError(WebView view,WebResourceRequest request,android.webkit.WebResourceResponse response){if(!popup&&request!=null&&request.isForMainFrame()&&response!=null&&response.getStatusCode()>=400){mainFrameError=true;failedUrl=request.getUrl()!=null?request.getUrl().toString():view.getUrl();String reason=response.getReasonPhrase()!=null?response.getReasonPhrase():"HTTP error";showError("Website returned HTTP "+response.getStatusCode()+" ("+reason+"). The server may be unavailable or blocking this request.");}}
            @Override public void onReceivedSslError(WebView view,SslErrorHandler handler,android.net.http.SslError error){
                handler.cancel(); if(!popup){failedUrl=error!=null?error.getUrl():view.getUrl();showError("Secure connection could not be verified.");}
            }
            @Override public boolean onRenderProcessGone(WebView view,RenderProcessGoneDetail detail){
                String url=view.getUrl(); if(view==popupWebView) closePopup(); else { int idx=tabViews.indexOf(view); String restore=isHttpUrl(url)?url:lastStableUrl; if(idx>=0){webContainer.removeView(view);view.destroy();WebView replacement=createTabWebView(restore);tabViews.set(idx,replacement);webView=replacement;webContainer.addView(replacement,0,new FrameLayout.LayoutParams(-1,-1));} else rebuildMainWebView(restore); } return true;
            }
        };
    }

    private WebChromeClient createChromeClient(){
        return new WebChromeClient(){
            @Override public void onProgressChanged(WebView view,int progress){ if(view==activeWebView() && progressBar!=null){ progressBar.setProgress(progress); progressBar.setVisibility(progress>=100?View.GONE:View.VISIBLE); } }
            @Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> callback,FileChooserParams params){
                if(fileCallback!=null) fileCallback.onReceiveValue(null); fileCallback=callback;
                Intent i; try{i=params.createIntent();}catch(Exception e){i=new Intent(Intent.ACTION_OPEN_DOCUMENT).setType("*/*");}
                i.addCategory(Intent.CATEGORY_OPENABLE); i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE,params.getMode()==FileChooserParams.MODE_OPEN_MULTIPLE);
                try{filePicker.launch(Intent.createChooser(i,"Choose file"));}catch(Exception e){callback.onReceiveValue(null);fileCallback=null;} return true;
            }
            @Override public void onGeolocationPermissionsShowPrompt(String origin,GeolocationPermissions.Callback callback){
                if(origin==null||!origin.startsWith("https://")){callback.invoke(origin,false,false);return;}
                int decision=sitePermission(origin,"location");
                if(decision==2){callback.invoke(origin,false,false);return;}
                if(decision==1 && locationPermissionGranted()){callback.invoke(origin,true,false);return;}
                if(decision==1 && !locationPermissionGranted()) setSitePermission(origin,"location",0);
                new AlertDialog.Builder(NativeBrowserActivity.this).setTitle("Location permission")
                  .setMessage("Allow "+origin+" to access your location?")
                  .setPositiveButton("Always allow",(d,w)->{ setSitePermission(origin,"location",1); requestLocation(callback,origin); })
                  .setNeutralButton("Allow once",(d,w)->requestLocation(callback,origin))
                  .setNegativeButton("Block",(d,w)->{setSitePermission(origin,"location",2);callback.invoke(origin,false,false);})
                  .setOnCancelListener(d->callback.invoke(origin,false,false)).show();
            }
            private void requestLocation(GeolocationPermissions.Callback callback,String origin){
                      
                      boolean granted=ContextCompat.checkSelfPermission(NativeBrowserActivity.this,Manifest.permission.ACCESS_FINE_LOCATION)==PackageManager.PERMISSION_GRANTED
                        || ContextCompat.checkSelfPermission(NativeBrowserActivity.this,Manifest.permission.ACCESS_COARSE_LOCATION)==PackageManager.PERMISSION_GRANTED;
                      if(granted)callback.invoke(origin,true,false);
                      else{pendingGeoCallback=callback;pendingGeoOrigin=origin;permissionLauncher.launch(new String[]{Manifest.permission.ACCESS_FINE_LOCATION,Manifest.permission.ACCESS_COARSE_LOCATION});}
            }
            @Override public void onPermissionRequest(PermissionRequest request){
                if(request.getOrigin()==null||!"https".equalsIgnoreCase(request.getOrigin().getScheme())){request.deny();return;}
                boolean cam=false,mic=false;
                for(String resource:request.getResources()){
                    if(PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource))cam=true;
                    else if(PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource))mic=true;
                    else{request.deny();return;}
                }
                final boolean needsCam=cam,needsMic=mic;
                String origin=request.getOrigin().toString();
                int camDecision=needsCam?sitePermission(origin,"camera"):1, micDecision=needsMic?sitePermission(origin,"microphone"):1;
                if((needsCam&&camDecision==2)||(needsMic&&micDecision==2)){request.deny();return;}
                if((!needsCam||camDecision==1)&&(!needsMic||micDecision==1)
                        && (!needsCam || androidPermissionGranted(PermissionRequest.RESOURCE_VIDEO_CAPTURE))
                        && (!needsMic || androidPermissionGranted(PermissionRequest.RESOURCE_AUDIO_CAPTURE))){request.grant(request.getResources());return;}
                if(needsCam && camDecision==1 && !androidPermissionGranted(PermissionRequest.RESOURCE_VIDEO_CAPTURE)) camDecision=0;
                if(needsMic && micDecision==1 && !androidPermissionGranted(PermissionRequest.RESOURCE_AUDIO_CAPTURE)) micDecision=0;
                new AlertDialog.Builder(NativeBrowserActivity.this).setTitle("Website permission")
                  .setMessage("Allow "+request.getOrigin().getHost()+" to use "+(cam&&mic?"camera and microphone":cam?"camera":"microphone")+"?")
                  .setPositiveButton("Always allow",(d,w)->{ if(needsCam)setSitePermission(origin,"camera",1); if(needsMic)setSitePermission(origin,"microphone",1); grantWebPermission(request,needsCam,needsMic); })
                  .setNeutralButton("Allow once",(d,w)->grantWebPermission(request,needsCam,needsMic))
                  .setNegativeButton("Block",(d,w)->{if(needsCam)setSitePermission(origin,"camera",2);if(needsMic)setSitePermission(origin,"microphone",2);request.deny();})
                  .setOnCancelListener(d->request.deny()).show();
            }
            private void grantWebPermission(PermissionRequest request,boolean needsCam,boolean needsMic){
                      boolean camOk=!needsCam||ContextCompat.checkSelfPermission(NativeBrowserActivity.this,Manifest.permission.CAMERA)==PackageManager.PERMISSION_GRANTED;
                      boolean micOk=!needsMic||ContextCompat.checkSelfPermission(NativeBrowserActivity.this,Manifest.permission.RECORD_AUDIO)==PackageManager.PERMISSION_GRANTED;
                      if(camOk&&micOk)request.grant(request.getResources());
                      else{
                          pendingWebPermission=request;ArrayList<String> p=new ArrayList<>();
                          if(needsCam&&!camOk)p.add(Manifest.permission.CAMERA);
                          if(needsMic&&!micOk)p.add(Manifest.permission.RECORD_AUDIO);
                          permissionLauncher.launch(p.toArray(new String[0]));
                      }
            }
            @Override public boolean onCreateWindow(WebView view,boolean dialog,boolean userGesture,Message resultMsg){openPopup(resultMsg);return true;}
            @Override public void onCloseWindow(WebView window){if(window==popupWebView)closePopup();}
            @Override public void onShowCustomView(View view,CustomViewCallback callback){enterFullscreen(view,callback);}
            @Override public void onHideCustomView(){exitFullscreen();}
        };
    }

    private void enterFullscreen(View view, WebChromeClient.CustomViewCallback callback){
        if(view==null){ if(callback!=null) callback.onCustomViewHidden(); return; }
        if(customFullscreenView!=null){ if(callback!=null) callback.onCustomViewHidden(); return; }
        customFullscreenView=view;
        customFullscreenCallback=callback;
        if(topBar!=null) topBar.setVisibility(View.GONE);
        if(bottomBar!=null) bottomBar.setVisibility(View.GONE);
        if(progressBar!=null) progressBar.setVisibility(View.GONE);
        if(errorView!=null) errorView.setVisibility(View.GONE);
        try{
            getWindow().setFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN,android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);
            root.addView(view,new FrameLayout.LayoutParams(-1,-1,Gravity.CENTER));
        }catch(Exception e){
            customFullscreenView=null;
            customFullscreenCallback=null;
            if(callback!=null) callback.onCustomViewHidden();
        }
    }

    private void exitFullscreen(){
        if(customFullscreenView==null){
            try{ getWindow().clearFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN); }catch(Exception ignored){}
            return;
        }
        View view=customFullscreenView;
        WebChromeClient.CustomViewCallback callback=customFullscreenCallback;
        customFullscreenView=null;
        customFullscreenCallback=null;
        try{ root.removeView(view); }catch(Exception ignored){}
        try{ getWindow().clearFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN); }catch(Exception ignored){}
        if(topBar!=null) topBar.setVisibility(View.VISIBLE);
        if(bottomBar!=null) bottomBar.setVisibility(View.VISIBLE);
        if(progressBar!=null && loading) progressBar.setVisibility(View.VISIBLE);
        if(callback!=null){ try{ callback.onCustomViewHidden(); }catch(Exception ignored){} }
        updateAddress(activeWebView()!=null?activeWebView().getUrl():null);
        updateNavigation();
    }

    private void deliverPickedFiles(ActivityResult result){
        if(fileCallback==null)return; Uri[] values=null;
        if(result.getResultCode()==RESULT_OK && result.getData()!=null){Intent d=result.getData();if(d.getClipData()!=null){int n=d.getClipData().getItemCount();values=new Uri[n];for(int i=0;i<n;i++)values[i]=d.getClipData().getItemAt(i).getUri();}else if(d.getData()!=null)values=new Uri[]{d.getData()};}
        fileCallback.onReceiveValue(values);fileCallback=null;
    }

    private WebView createTabWebView(String url){
        WebView w=new WebView(this); configureWebView(w); w.setWebViewClient(createClient(false)); w.setWebChromeClient(createChromeClient()); installDownloadListener(w);
        if(isHttpUrl(url)) w.loadUrl(url); return w;
    }
    private void rebuildMainWebView(String url){
        if(webView!=null){webView.stopLoading();webContainer.removeView(webView);}
        webView=createTabWebView(url); webContainer.addView(webView,0,new FrameLayout.LayoutParams(-1,-1));
    }
    private void openPopup(Message msg){closePopup();popupWebView=new WebView(this);configureWebView(popupWebView);popupWebView.setWebViewClient(createClient(true));popupWebView.setWebChromeClient(createChromeClient());installDownloadListener(popupWebView);webContainer.addView(popupWebView,new FrameLayout.LayoutParams(-1,-1));WebView.WebViewTransport t=(WebView.WebViewTransport)msg.obj;t.setWebView(popupWebView);msg.sendToTarget();showControls();}
    private void closePopup(){if(popupWebView!=null){webContainer.removeView(popupWebView);popupWebView.stopLoading();popupWebView.destroy();popupWebView=null;updateAddress(webView!=null?webView.getUrl():null);updateNavigation();}}

    private void showControls(){if(hideRunnable!=null)handler.removeCallbacks(hideRunnable);if(topBar!=null){topBar.setVisibility(View.VISIBLE);topBar.animate().translationY(0).alpha(1f).setDuration(140).start();}if(bottomBar!=null){bottomBar.setVisibility(View.VISIBLE);bottomBar.animate().translationY(0).alpha(1f).setDuration(140).start();}}
    private void hideControls(){if(loading||mainFrameError||!autoHide)return;if(topBar!=null&&topBar.getVisibility()==View.VISIBLE)topBar.animate().translationY(-dp(80)).alpha(0f).setDuration(180).withEndAction(()->topBar.setVisibility(View.INVISIBLE)).start();if(bottomBar!=null&&bottomBar.getVisibility()==View.VISIBLE)bottomBar.animate().translationY(dp(80)).alpha(0f).setDuration(180).withEndAction(()->bottomBar.setVisibility(View.INVISIBLE)).start();}
    private void scheduleHide(){if(!autoHide)return;if(hideRunnable!=null)handler.removeCallbacks(hideRunnable);hideRunnable=this::hideControls;handler.postDelayed(hideRunnable,AUTO_HIDE_MS);}
    private void updateNavigation(){WebView w=activeWebView();if(backButton!=null){backButton.setEnabled(w.canGoBack());backButton.setAlpha(w.canGoBack()?1f:.35f);}if(forwardButton!=null){forwardButton.setEnabled(w.canGoForward());forwardButton.setAlpha(w.canGoForward()?1f:.35f);}}
    private void updateAddress(String url){if(addressBar!=null&&url!=null&&!addressBar.hasFocus())addressBar.setText(url);updateNavigation();}
    private void showError(String msg){loading=false;showControls();if(errorView!=null){TextView d=errorView.findViewWithTag("detail");if(d!=null)d.setText(msg);errorView.setVisibility(View.VISIBLE);}}
    private void hideError(){if(errorView!=null)errorView.setVisibility(View.GONE);}

    private void toggleDesktopMode(){desktopMode=!desktopMode;prefs.edit().putBoolean("desktop",desktopMode).apply();activeWebView().getSettings().setUserAgentString(desktopMode?desktopUserAgent:null);activeWebView().reload();}
    private void toggleDataSaver(){dataSaver=!dataSaver;prefs.edit().putBoolean("dataSaver",dataSaver).apply();activeWebView().getSettings().setLoadsImagesAutomatically(!dataSaver);activeWebView().getSettings().setBlockNetworkImage(dataSaver);activeWebView().reload();}
    private void zoomIn(){WebView w=activeWebView();if(w.canZoomIn())w.zoomIn();}
    private void zoomOut(){WebView w=activeWebView();if(w.canZoomOut())w.zoomOut();}
    private void resetZoom(){ WebView w=activeWebView(); try{ float scale=w.getScale(); if(scale>1.01f){ for(int i=0;i<8&&w.getScale()>1.01f;i++)w.zoomOut(); } else if(scale<0.99f){ for(int i=0;i<8&&w.getScale()<0.99f;i++)w.zoomIn(); } }catch(Exception ignored){} }
    private void findInPage(){EditText e=new EditText(this);e.setSingleLine(true);e.setHint("Find text");new AlertDialog.Builder(this).setTitle("Find in page").setView(e).setPositiveButton("Find",(d,w)->activeWebView().findAllAsync(e.getText().toString())).setNegativeButton("Cancel",null).show();}
    private void copyUrl(){String u=activeWebView().getUrl();if(u!=null){((ClipboardManager)getSystemService(Context.CLIPBOARD_SERVICE)).setPrimaryClip(ClipData.newPlainText("URL",u));Toast.makeText(this,"Link copied",Toast.LENGTH_SHORT).show();}}
    private void openInExternalBrowser(){
        String u=failedUrl!=null?failedUrl:activeWebView().getUrl();if(!isHttpUrl(u))u=lastStableUrl;
        if(!isHttpUrl(u)){Toast.makeText(this,"No website to open",Toast.LENGTH_SHORT).show();return;}
        try{startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse(u)).addCategory(Intent.CATEGORY_BROWSABLE));}
        catch(Exception e){Toast.makeText(this,"No external browser available",Toast.LENGTH_SHORT).show();}
    }
    private void share(){String u=activeWebView().getUrl();if(u!=null)startActivity(Intent.createChooser(new Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT,u),"Share link"));}
    private void clearData(){CookieManager.getInstance().removeAllCookies(null);CookieManager.getInstance().flush();android.webkit.WebStorage.getInstance().deleteAllData();for(WebView w:tabViews){w.clearCache(true);w.clearHistory();w.clearFormData();}if(popupWebView!=null){popupWebView.clearCache(true);popupWebView.clearHistory();popupWebView.clearFormData();}clearSitePermissions();Toast.makeText(this,"Browsing data cleared",Toast.LENGTH_SHORT).show();}
    private ArrayList<String> saved(String key){
        ArrayList<String> list=new ArrayList<>();
        try{JSONArray a=new JSONArray(prefs.getString(key,"[]"));for(int i=0;i<a.length();i++)list.add(a.getString(i));}catch(Exception ignored){}
        return list;
    }
    private void remember(String key,String url){
        if(!isHttpUrl(url))return;
        ArrayList<String> list=saved(key);list.remove(url);list.add(0,url);
        while(list.size()>(HISTORY.equals(key)?200:100))list.remove(list.size()-1);
        prefs.edit().putString(key,new JSONArray(list).toString()).apply();
    }
    private void showSaved(String key){
        ArrayList<String> list=saved(key);
        if(list.isEmpty()){Toast.makeText(this,"Nothing saved yet",Toast.LENGTH_SHORT).show();return;}
        new AlertDialog.Builder(this).setTitle(BOOKMARKS.equals(key)?"Bookmarks":"History")
          .setItems(list.toArray(new String[0]),(d,which)->loadInApp(list.get(which)))
          .setNeutralButton("Clear all",(d,w)->new AlertDialog.Builder(this).setMessage("Delete saved "+key+"?")
             .setPositiveButton("Delete",(a,b)->prefs.edit().remove(key).apply()).setNegativeButton("Cancel",null).show())
          .setNegativeButton("Close",null).show();
    }
    private void newTab(String url){
        if(tabs.size()>=12){Toast.makeText(this,"Maximum 12 tabs",Toast.LENGTH_SHORT).show();return;}
        if(currentTab<tabs.size()&&webView!=null&&webView.getUrl()!=null)tabs.set(currentTab,webView.getUrl());
        String target=isHttpUrl(url)?url:"https://www.google.com"; tabs.add(target); tabScrollY.add(0); currentTab=tabs.size()-1; rememberTabs();
        WebView w=createTabWebView(target); tabViews.add(w);
        if(webView!=null)webView.setVisibility(View.GONE); webView=w; webView.setVisibility(View.VISIBLE); webContainer.addView(webView,0,new FrameLayout.LayoutParams(-1,-1)); updateTabLabel();
    }
    private void switchTab(int index){
        if(index<0||index>=tabs.size()||index>=tabViews.size())return;
        if(webView!=null&&webView.getUrl()!=null){
            tabs.set(currentTab,webView.getUrl());
            while(tabScrollY.size()<tabs.size()) tabScrollY.add(0);
            tabScrollY.set(currentTab,webView.getScrollY());
        }
        if(webView!=null)webView.setVisibility(View.GONE); currentTab=index; rememberTabs(); webView=tabViews.get(index); webView.setVisibility(View.VISIBLE); updateAddress(webView.getUrl()); updateNavigation(); updateTabLabel();
    }
    private void showTabs(){
        ArrayList<String> options=new ArrayList<>(tabs);
        options.add("+ New tab");options.add("Close current tab");
        new AlertDialog.Builder(this).setTitle("Tabs ("+tabs.size()+")")
          .setItems(options.toArray(new String[0]),(d,index)->{
             if(index==tabs.size())newTab("https://www.google.com");
             else if(index==tabs.size()+1){
                 if(tabs.size()==1){tabs.set(0,"https://www.google.com");switchTab(0);}
                 else{ if(currentTab<tabViews.size()){WebView old=tabViews.remove(currentTab);webContainer.removeView(old);old.destroy();} tabs.remove(currentTab); if(currentTab<tabScrollY.size()) tabScrollY.remove(currentTab); currentTab=Math.min(currentTab,tabs.size()-1);rememberTabs();switchTab(currentTab);updateTabLabel();}
             }else switchTab(index);
          }).show();
    }
    private TextView tabsButton;
    private void updateTabLabel(){if(tabsButton!=null)tabsButton.setText("▣ "+tabs.size());}
    private void showBrowserSettings(){
        String[] items={
            "Site mode: "+(desktopMode?"Desktop":"Mobile"),
            "Data Saver: "+(dataSaver?"On":"Off"),
            "Auto-hide browser controls: "+(autoHide?"On":"Off"),
            "Restore open tabs on startup: "+(restoreTabs?"On":"Off"),
            "Media autoplay: "+(mediaAutoplay?"On":"Off"),
            "Picture-in-Picture for fullscreen video",
            "Reset site permissions",
            "Clear browsing data",
            "Downloads",
            "Bookmarks",
            "History"
        };
        new AlertDialog.Builder(this).setTitle("Browser Settings")
          .setItems(items,(d,w)->{
            if(w==0) toggleDesktopMode();
            else if(w==1) toggleDataSaver();
            else if(w==2){autoHide=!autoHide;prefs.edit().putBoolean("autoHide",autoHide).apply();if(autoHide)scheduleHide();else if(hideRunnable!=null)handler.removeCallbacks(hideRunnable);showControls();}
            else if(w==3){restoreTabs=!restoreTabs;prefs.edit().putBoolean("restoreTabs",restoreTabs).apply();if(!restoreTabs){prefs.edit().remove("openTabs").remove("tabScrollY").remove("currentTab").apply();Toast.makeText(this,"Open tabs will not be restored on next startup",Toast.LENGTH_SHORT).show();}else Toast.makeText(this,"Open tabs will be restored on startup",Toast.LENGTH_SHORT).show();}
            else if(w==4){mediaAutoplay=!mediaAutoplay;prefs.edit().putBoolean("mediaAutoplay",mediaAutoplay).apply();for(WebView wv:tabViews)wv.getSettings().setMediaPlaybackRequiresUserGesture(!mediaAutoplay);Toast.makeText(this,mediaAutoplay?"Media autoplay enabled":"Media autoplay requires tap",Toast.LENGTH_SHORT).show();}
            else if(w==5){if(Build.VERSION.SDK_INT>=Build.VERSION_CODES.O) enterPictureInPictureMode(new PictureInPictureParams.Builder().setAspectRatio(new Rational(16,9)).build()); else Toast.makeText(this,"Picture-in-Picture requires Android 8 or newer",Toast.LENGTH_SHORT).show();}
            else if(w==6){clearSitePermissions();Toast.makeText(this,"Site permissions reset",Toast.LENGTH_SHORT).show();}
            else if(w==7) new AlertDialog.Builder(this).setMessage("Clear cookies, cache, WebStorage, form data and site permissions?").setPositiveButton("Clear",(a,b)->clearData()).setNegativeButton("Cancel",null).show();
            else if(w==8) showDownloads();
            else if(w==9) showSaved(BOOKMARKS);
            else if(w==10) showSaved(HISTORY);
          }).setNegativeButton("Close",null).show();
    }

    private void showMenu(){
        String[] a={"Refresh","Zoom in","Zoom out","Reset zoom","Find in page",desktopMode?"Mobile site":"Desktop site",dataSaver?"Disable Data Saver":"Enable Data Saver","Share","Copy link","Close popup","Open in another browser","Add bookmark","Bookmarks","History","Downloads","New tab","Tabs","Picture-in-Picture","Settings"};
        new AlertDialog.Builder(this).setItems(a,(d,w)->{
            if(w==0)activeWebView().reload();
            else if(w==1)zoomIn();
            else if(w==2)zoomOut();
            else if(w==3)resetZoom();
            else if(w==4)findInPage();
            else if(w==5)toggleDesktopMode();
            else if(w==6)toggleDataSaver();
            else if(w==7)share();
            else if(w==8)copyUrl();
            else if(w==9)closePopup();
            else if(w==10)openInExternalBrowser();
            else if(w==11){String u=activeWebView().getUrl();if(isHttpUrl(u)){remember(BOOKMARKS,u);Toast.makeText(this,"Bookmarked",Toast.LENGTH_SHORT).show();}}
            else if(w==12)showSaved(BOOKMARKS);
            else if(w==13)showSaved(HISTORY);
            else if(w==14)showDownloads();
            else if(w==15)newTab("https://www.google.com");
            else if(w==16)showTabs();
            else if(w==17){if(Build.VERSION.SDK_INT>=Build.VERSION_CODES.O) enterPictureInPictureMode(new PictureInPictureParams.Builder().setAspectRatio(new Rational(16,9)).build());else Toast.makeText(this,"Picture-in-Picture requires Android 8 or newer",Toast.LENGTH_SHORT).show();}
            else showBrowserSettings();
        }).show();
    }

    private TextView button(String text){TextView v=new TextView(this);v.setText(text);v.setTextColor(NAVY);v.setTextSize(19);v.setGravity(Gravity.CENTER);v.setPadding(dp(10),dp(8),dp(10),dp(8));return v;}
    private void buildChrome(){
        topBar=new LinearLayout(this);topBar.setOrientation(LinearLayout.HORIZONTAL);topBar.setGravity(Gravity.CENTER_VERTICAL);topBar.setPadding(dp(6),dp(8),dp(6),dp(6));topBar.setBackgroundColor(IVORY);
        backButton=button("‹");backButton.setOnClickListener(v->{if(activeWebView().canGoBack())activeWebView().goBack();});topBar.addView(backButton,new LinearLayout.LayoutParams(dp(48),-2));
        forwardButton=button("›");forwardButton.setOnClickListener(v->{if(activeWebView().canGoForward())activeWebView().goForward();});topBar.addView(forwardButton,new LinearLayout.LayoutParams(dp(48),-2));
        addressBar=new EditText(this);addressBar.setSingleLine(true);addressBar.setTextColor(NAVY);addressBar.setTextSize(14);addressBar.setHint("Search or enter address");addressBar.setPadding(dp(12),0,dp(12),0);addressBar.setBackgroundColor(Color.WHITE);addressBar.setOnEditorActionListener((v,a,e)->{loadInApp(addressBar.getText().toString());addressBar.clearFocus();return true;});topBar.addView(addressBar,new LinearLayout.LayoutParams(0,dp(46),1));
        TextView reload=button("↻");reload.setOnClickListener(v->activeWebView().reload());topBar.addView(reload,new LinearLayout.LayoutParams(dp(48),-2));root.addView(topBar,new FrameLayout.LayoutParams(-1,-2,Gravity.TOP));
        bottomBar=new LinearLayout(this);bottomBar.setGravity(Gravity.CENTER);bottomBar.setPadding(dp(10),dp(6),dp(10),dp(10));bottomBar.setBackgroundColor(IVORY);
        TextView home=button("⌂");home.setOnClickListener(v->{Intent appHome=new Intent(this,MainActivity.class);appHome.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP|Intent.FLAG_ACTIVITY_SINGLE_TOP);appHome.putExtra("samahit_open_home",true);startActivity(appHome);finish();});bottomBar.addView(home,new LinearLayout.LayoutParams(0,-2,1));
        TextView find=button("⌕");find.setOnClickListener(v->findInPage());bottomBar.addView(find,new LinearLayout.LayoutParams(0,-2,1));
        tabsButton=button("▣ 1");tabsButton.setOnClickListener(v->showTabs());bottomBar.addView(tabsButton,new LinearLayout.LayoutParams(0,-2,1));
        TextView menu=button("⋮");menu.setOnClickListener(v->showMenu());bottomBar.addView(menu,new LinearLayout.LayoutParams(0,-2,1));root.addView(bottomBar,new FrameLayout.LayoutParams(-1,-2,Gravity.BOTTOM));
    }

    @Override public void onCreate(Bundle state){
        super.onCreate(state);prefs=getSharedPreferences(PREFS,MODE_PRIVATE);desktopMode=prefs.getBoolean("desktop",false);autoHide=prefs.getBoolean("autoHide",true);dataSaver=prefs.getBoolean("dataSaver",false);restoreTabs=prefs.getBoolean("restoreTabs",true);mediaAutoplay=prefs.getBoolean("mediaAutoplay",true);initializeUserAgents();
        getWindow().setStatusBarColor(IVORY);getWindow().setNavigationBarColor(IVORY);root=new FrameLayout(this);root.setBackgroundColor(Color.WHITE);webContainer=new FrameLayout(this);root.addView(webContainer,new FrameLayout.LayoutParams(-1,-1));rebuildMainWebView(null);
        gestureDetector=new GestureDetector(this,new GestureDetector.SimpleOnGestureListener(){@Override public boolean onDoubleTap(MotionEvent e){if(topBar.getVisibility()==View.VISIBLE)hideControls();else{showControls();scheduleHide();}return false;}});webContainer.setOnTouchListener((v,e)->{gestureDetector.onTouchEvent(e);return false;});
        progressBar=new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);progressBar.setMax(100);root.addView(progressBar,new FrameLayout.LayoutParams(-1,dp(3),Gravity.TOP));
        errorView=new LinearLayout(this);errorView.setOrientation(LinearLayout.VERTICAL);errorView.setGravity(Gravity.CENTER);errorView.setPadding(dp(28),dp(28),dp(28),dp(28));errorView.setBackgroundColor(IVORY);TextView title=new TextView(this);title.setText("This page could not be loaded");title.setTextColor(NAVY);title.setTextSize(19);title.setGravity(Gravity.CENTER);errorView.addView(title);TextView detail=new TextView(this);detail.setTag("detail");detail.setTextColor(Color.DKGRAY);detail.setTextSize(13);detail.setGravity(Gravity.CENTER);LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2);p.topMargin=dp(12);errorView.addView(detail,p);TextView retry=button("Try again");retry.setTextColor(Color.WHITE);retry.setBackgroundColor(NAVY);retry.setOnClickListener(v->activeWebView().reload());LinearLayout.LayoutParams rp=new LinearLayout.LayoutParams(-2,-2);rp.topMargin=dp(20);errorView.addView(retry,rp);
        TextView external=button("Open in another browser (optional)");external.setOnClickListener(v->openInExternalBrowser());LinearLayout.LayoutParams ep=new LinearLayout.LayoutParams(-2,-2);ep.topMargin=dp(12);errorView.addView(external,ep);errorView.setVisibility(View.GONE);root.addView(errorView,new FrameLayout.LayoutParams(-1,-1));
        buildChrome();
        boolean settingsOnly=getIntent().getBooleanExtra("settingsOnly",false);
        root.setOnApplyWindowInsetsListener((view,insets)->{int bottom=insets.getSystemWindowInsetBottom();root.setPadding(0,0,0,bottom);return insets;});
        setContentView(root);String first=getIntent().getStringExtra("url");
        if(settingsOnly){ setContentView(root); handler.post(this::showBrowserSettings); return; }
        if(state==null) restoreSavedTabs();
        String initial=isHttpUrl(first)?first:(tabs.isEmpty()?"https://www.google.com":tabs.get(currentTab));
        if(tabs.isEmpty()) tabs.add(initial);
        if(state!=null) webView.restoreState(state); else loadInApp(initial);
        restoreTabWebViews();
        rememberTabs();
    }
    @Override public void onBackPressed(){if(customFullscreenView!=null){exitFullscreen();return;}if(popupWebView!=null){if(popupWebView.canGoBack())popupWebView.goBack();else closePopup();}else if(webView!=null&&webView.canGoBack())webView.goBack();else super.onBackPressed();}
    @Override protected void onSaveInstanceState(Bundle out){if(webView!=null)webView.saveState(out);rememberTabs();
        if(webView!=null) out.putString("activeUrl",webView.getUrl());
        super.onSaveInstanceState(out);}
    @Override protected void onPause(){if(webView!=null){webView.onPause();webView.pauseTimers();}if(popupWebView!=null)popupWebView.onPause();super.onPause();}
    @Override public void onUserLeaveHint(){
        super.onUserLeaveHint();
        if(Build.VERSION.SDK_INT>=Build.VERSION_CODES.O && customFullscreenView!=null && !isInPictureInPictureMode()){
            try{enterPictureInPictureMode(new PictureInPictureParams.Builder().setAspectRatio(new Rational(16,9)).build());}catch(Exception ignored){}
        }
    }
    @Override public void onPictureInPictureModeChanged(boolean isInPictureInPictureMode){
        super.onPictureInPictureModeChanged(isInPictureInPictureMode);
        if(isInPictureInPictureMode) showControls();
    }
    @Override protected void onResume(){super.onResume();if(webView!=null){webView.onResume();webView.resumeTimers();}if(popupWebView!=null)popupWebView.onResume();}
    @Override protected void onDestroy(){if(hideRunnable!=null)handler.removeCallbacks(hideRunnable);exitFullscreen();closePopup();for(WebView w:tabViews){try{w.stopLoading();w.destroy();}catch(Exception ignored){}}tabViews.clear();webView=null;super.onDestroy();}
}
