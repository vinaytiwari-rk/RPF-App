<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');

function fetchFeed($key, $url) {
    $cacheFile = sys_get_temp_dir() . '/samahit_' . $key . '_feed.json';
    $etagFile = sys_get_temp_dir() . '/samahit_' . $key . '_etag.txt';
    $cached = is_file($cacheFile) ? json_decode(@file_get_contents($cacheFile), true) : [];
    $etag = is_file($etagFile) ? trim(@file_get_contents($etagFile)) : '';

    $ch = curl_init($url);
    $headers = ['Accept: application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8'];
    if ($etag !== '') $headers[] = 'If-None-Match: ' . $etag;
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_USERAGENT => 'Samahit-RPFoundation/1.0 RSS Consumer'
    ]);
    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $newEtag = curl_getinfo($ch, CURLINFO_HEADER_OUT);
    $responseHeaders = curl_getinfo($ch);
    $etagValue = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
    curl_close($ch);

    if ($status === 304 && !empty($cached['items'])) return $cached['items'];
    if ($status >= 200 && $status < 300 && is_string($body) && $body !== '') {
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
            } elseif (isset($xml->entry)) {
                foreach ($xml->entry as $item) {
                    $title = trim((string)$item->title);
                    if ($title !== '') $items[] = $title;
                    if (count($items) >= 12) break;
                }
            }
        }
        if ($items) {
            @file_put_contents($cacheFile, json_encode(['items' => $items, 'updatedAt' => gmdate('c')]));
            return $items;
        }
    }
    return !empty($cached['items']) ? $cached['items'] : [];
}

$pib = fetchFeed('pib', 'https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1&reg=1');
$sachet = fetchFeed('sachet', 'https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml');

echo json_encode([
    'success' => true,
    'data' => [
        'pib' => $pib,
        'sachet' => $sachet
    ],
    'updatedAt' => gmdate('c')
], JSON_UNESCAPED_UNICODE);
