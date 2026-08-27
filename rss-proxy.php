<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');

function cachePath($key, $suffix) {
    return sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'samahit_' . $key . '_' . $suffix;
}

function readJson($file, $fallback = []) {
    if (!is_file($file)) return $fallback;
    $value = json_decode(@file_get_contents($file), true);
    return is_array($value) ? $value : $fallback;
}

function extractHeaderValue($headers, $name) {
    foreach (preg_split('/\r?\n/', (string)$headers) as $line) {
        if (stripos($line, $name . ':') === 0) return trim(substr($line, strlen($name) + 1));
    }
    return '';
}

function fetchFeed($key, $url) {
    $cacheFile = cachePath($key, 'feed.json');
    $etagFile = cachePath($key, 'etag.txt');
    $cached = readJson($cacheFile, []);
    $etag = is_file($etagFile) ? trim((string)@file_get_contents($etagFile)) : '';

    $ch = curl_init($url);
    $headers = [
        'Accept: application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
        'User-Agent: Samahit-RPFoundation/1.0 RSS Consumer'
    ];
    if ($etag !== '') $headers[] = 'If-None-Match: ' . $etag;

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 5,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_ENCODING => ''
    ]);

    $raw = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = (int)curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($raw === false) {
        return ['items' => $cached['items'] ?? [], 'source' => 'cache', 'error' => $error ?: 'request_failed'];
    }

    $headerText = substr($raw, 0, $headerSize);
    $body = substr($raw, $headerSize);

    if ($status === 304) {
        return ['items' => $cached['items'] ?? [], 'source' => 'not_modified'];
    }

    if ($status >= 200 && $status < 300 && trim($body) !== '') {
        libxml_use_internal_errors(true);
        $xml = @simplexml_load_string($body, 'SimpleXMLElement', LIBXML_NOCDATA);
        $items = [];
        if ($xml) {
            if (isset($xml->channel->item)) {
                foreach ($xml->channel->item as $item) {
                    $title = trim((string)$item->title);
                    if ($title !== '') $items[] = $title;
                    if (count($items) >= 12) break;
                }
            }
            if (!$items && isset($xml->entry)) {
                foreach ($xml->entry as $item) {
                    $title = trim((string)$item->title);
                    if ($title !== '') $items[] = $title;
                    if (count($items) >= 12) break;
                }
            }
        }
        if ($items) {
            $newEtag = extractHeaderValue($headerText, 'ETag');
            @file_put_contents($cacheFile, json_encode(['items' => $items, 'updatedAt' => gmdate('c')], JSON_UNESCAPED_UNICODE));
            if ($newEtag !== '') @file_put_contents($etagFile, $newEtag);
            return ['items' => $items, 'source' => 'live'];
        }
    }

    return ['items' => $cached['items'] ?? [], 'source' => 'cache', 'error' => 'http_' . $status];
}

$pibResult = fetchFeed('pib', 'https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1&reg=1');
$sachetResult = fetchFeed('sachet', 'https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml');

http_response_code(200);
echo json_encode([
    'success' => true,
    'data' => [
        'pib' => $pibResult['items'],
        'sachet' => $sachetResult['items']
    ],
    'sources' => [
        'pib' => $pibResult['source'],
        'sachet' => $sachetResult['source']
    ],
    'updatedAt' => gmdate('c')
], JSON_UNESCAPED_UNICODE);