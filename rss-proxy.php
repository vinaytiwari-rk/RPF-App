<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');
header('Access-Control-Allow-Origin: *');

$cacheFile = __DIR__ . '/rss_cache.json';
$cacheTtl = 300;

function fetchMultiUrls(array $urls): array {
    $mh = curl_multi_init();
    $handles = [];
    $results = [];
    $userAgent = 'Samahit/1.0 (+https://rpfoundation.org)';

    foreach ($urls as $key => $url) {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_USERAGENT => $userAgent,
            CURLOPT_HTTPHEADER => ['Accept: application/rss+xml, application/xml, text/xml, text/html;q=0.8, */*;q=0.5'],
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_ENCODING => ''
        ]);
        curl_multi_add_handle($mh, $ch);
        $handles[$key] = $ch;
    }

    $running = null;
    do {
        $status = curl_multi_exec($mh, $running);
        if ($running) curl_multi_select($mh, 0.25);
    } while ($running && $status === CURLM_OK);

    foreach ($handles as $key => $ch) {
        $body = curl_multi_getcontent($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $results[$key] = ($body !== false && $code >= 200 && $code < 300 && strlen($body) > 50) ? $body : null;
        curl_multi_remove_handle($mh, $ch);
        curl_close($ch);
    }
    curl_multi_close($mh);
    return $results;
}

function cleanText(string $text): string {
    $text = preg_replace('/<!\[CDATA\[([\s\S]*?)\]\]>/u', '$1', $text);
    $text = html_entity_decode(strip_tags($text), ENT_QUOTES | ENT_HTML5 | ENT_XML1, 'UTF-8');
    return preg_replace('/\s+/u', ' ', trim($text));
}

function parseXmlItems(?string $xmlString, string $source = '', int $limit = 20): array {
    if (!$xmlString) return [];
    libxml_use_internal_errors(true);
    $items = [];
    if (!preg_match_all('/<(?:item|entry)\b[\s\S]*?<\/(?:item|entry)>/iu', $xmlString, $blocks)) return [];

    foreach ($blocks[0] as $block) {
        if (!preg_match('/<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/iu', $block, $titleMatch)) continue;
        $title = cleanText($titleMatch[1]);
        if (mb_strlen($title) < 8) continue;
        $link = '';
        if (preg_match('/<link>([\s\S]*?)<\/link>/iu', $block, $linkMatch)) $link = cleanText($linkMatch[1]);
        elseif (preg_match('/<link[^>]+href=["\']([^"\']+)["\']/iu', $block, $linkMatch)) $link = trim($linkMatch[1]);
        $published = '';
        if (preg_match('/<(?:pubDate|published|updated)>([\s\S]*?)<\/(?:pubDate|published|updated)>/iu', $block, $dateMatch)) $published = cleanText($dateMatch[1]);

        $key = mb_strtolower($source . '|' . $title, 'UTF-8');
        if (isset($items[$key])) continue;
        $items[$key] = ['title' => $title, 'source' => $source, 'url' => $link, 'publishedAt' => $published];
        if (count($items) >= $limit) break;
    }
    return array_values($items);
}

function parseAniHtml(?string $htmlString, int $limit = 20): array {
    if (!$htmlString) return [];
    $items = [];
    if (preg_match_all('/<a\b[^>]*href=["\']([^"\']*\/news\/[^"\']*)["\'][^>]*>([\s\S]*?)<\/a>/iu', $htmlString, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $match) {
            $title = cleanText($match[2]);
            if (mb_strlen($title) < 20 || stripos($title, 'latest news') !== false || stripos($title, 'copyright') !== false) continue;
            $url = html_entity_decode($match[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');
            if (strpos($url, 'http') !== 0) $url = 'https://www.aninews.in' . (str_starts_with($url, '/') ? '' : '/') . $url;
            $key = mb_strtolower($title, 'UTF-8');
            if (isset($items[$key])) continue;
            $items[$key] = ['title' => $title, 'source' => 'ANI', 'url' => $url, 'publishedAt' => ''];
            if (count($items) >= $limit) break;
        }
    }
    return array_values($items);
}

$raw = fetchMultiUrls([
    'pib_hi' => 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=2&Regid=3',
    'pib_en' => 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1',
    'ani_rss' => 'https://www.aninews.in/rss/feed/',
    'ani_html' => 'https://www.aninews.in/latest-news/',
    'sachet' => 'https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml'
]);

$pib = array_merge(
    parseXmlItems($raw['pib_hi'] ?? null, 'PIB', 12),
    parseXmlItems($raw['pib_en'] ?? null, 'PIB', 12)
);
$ani = parseXmlItems($raw['ani_rss'] ?? null, 'ANI', 20);
if (!$ani) $ani = parseAniHtml($raw['ani_html'] ?? null, 20);

$news = [];
$seen = [];
$max = max(count($pib), count($ani));
for ($i = 0; $i < $max && count($news) < 24; $i++) {
    foreach ([$pib[$i] ?? null, $ani[$i] ?? null] as $item) {
        if (!$item) continue;
        $key = mb_strtolower($item['source'] . '|' . $item['title'], 'UTF-8');
        if (isset($seen[$key])) continue;
        $seen[$key] = true;
        $news[] = $item;
    }
}

$sachet = parseXmlItems($raw['sachet'] ?? null, '', 30);
if (!$sachet && file_exists($cacheFile)) {
    $old = json_decode((string) @file_get_contents($cacheFile), true);
    if (is_array($old)) {
        $news = $news ?: ($old['data']['news'] ?? $old['data']['pib'] ?? []);
        $sachet = $old['data']['sachet'] ?? [];
    }
}

$success = !empty($news) || !empty($sachet);
$response = [
    'success' => $success,
    'data' => ['pib' => $news, 'news' => $news, 'sachet' => $sachet],
    'updatedAt' => gmdate('c'),
    'stale' => false
];

@file_put_contents($cacheFile, json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
