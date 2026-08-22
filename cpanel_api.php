<?php
/**
 * RP Foundation - cPanel Backend API & Cache
 * 
 * Upload this file to your cPanel's public_html folder (e.g. public_html/api.php)
 * This script caches Instagram and Twitter feeds to prevent API limits and speed up your app.
 */

// Allow CORS so the React app can read the data
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// ==========================================
// CONFIGURATION
// ==========================================

// 1. INSTAGRAM SETTINGS (RSS.app)
$rss_app_url = "https://rss.app/feeds/v1.1/laWV6LcTILOTuLNE.json";

// 2. TWITTER SETTINGS (Add your Bearer Token here)
$twitter_bearer_token = "PUT_YOUR_TWITTER_BEARER_TOKEN_HERE"; // <-- Yahan apna Twitter Bearer token dalein
$twitter_username = "PIBFactCheck"; // Kiska data nikalna hai

// CACHE SETTINGS (1 hour = 3600 seconds)
$cache_time = 3600; 
$ig_cache_file = __DIR__ . '/ig_cache.json';
$tw_cache_file = __DIR__ . '/tw_cache.json';

// ==========================================
// ROUTING
// ==========================================
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action === 'instagram') {
    serveInstagramFeed();
} elseif ($action === 'twitter') {
    serveTwitterFeed();
} else {
    echo json_encode(["error" => "Please specify action=instagram or action=twitter"]);
}

// ==========================================
// FUNCTIONS
// ==========================================

function serveInstagramFeed() {
    global $rss_app_url, $ig_cache_file, $cache_time;

    // Check if cache is valid
    if (file_exists($ig_cache_file) && (time() - filemtime($ig_cache_file)) < $cache_time) {
        $data = file_get_contents($ig_cache_file);
        echo $data;
        return;
    }

    // Fetch fresh data
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $rss_app_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpcode == 200 && $response) {
        // Save to cache
        file_put_contents($ig_cache_file, $response);
        echo $response;
    } else {
        // Fallback to old cache if exists
        if (file_exists($ig_cache_file)) {
            echo file_get_contents($ig_cache_file);
        } else {
            echo json_encode(["error" => "Failed to fetch Instagram feed."]);
        }
    }
}

function serveTwitterFeed() {
    global $twitter_bearer_token, $twitter_username, $tw_cache_file, $cache_time;

    if ($twitter_bearer_token === "PUT_YOUR_TWITTER_BEARER_TOKEN_HERE") {
        echo json_encode(["error" => "Twitter Bearer Token is missing in api.php"]);
        return;
    }

    // Check cache
    if (file_exists($tw_cache_file) && (time() - filemtime($tw_cache_file)) < $cache_time) {
        $data = file_get_contents($tw_cache_file);
        echo $data;
        return;
    }

    // Step 1: Get User ID from username
    $ch1 = curl_init();
    curl_setopt($ch1, CURLOPT_URL, "https://api.twitter.com/2/users/by/username/" . $twitter_username);
    curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch1, CURLOPT_HTTPHEADER, array("Authorization: Bearer " . $twitter_bearer_token));
    $user_res = curl_exec($ch1);
    curl_close($ch1);
    
    $user_data = json_decode($user_res, true);
    if (!isset($user_data['data']['id'])) {
        echo json_encode(["error" => "Failed to find Twitter user."]);
        return;
    }
    
    $user_id = $user_data['data']['id'];

    // Step 2: Get Tweets
    $ch2 = curl_init();
    $tweet_url = "https://api.twitter.com/2/users/{$user_id}/tweets?tweet.fields=created_at,text&max_results=10";
    curl_setopt($ch2, CURLOPT_URL, $tweet_url);
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch2, CURLOPT_HTTPHEADER, array("Authorization: Bearer " . $twitter_bearer_token));
    $tweet_res = curl_exec($ch2);
    curl_close($ch2);

    if ($tweet_res) {
        file_put_contents($tw_cache_file, $tweet_res);
        echo $tweet_res;
    } else {
        if (file_exists($tw_cache_file)) {
            echo file_get_contents($tw_cache_file);
        } else {
            echo json_encode(["error" => "Failed to fetch Tweets."]);
        }
    }
}
?>
