<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('Access-Control-Allow-Origin: *');

function fetchRawUrl($url) {
    $userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    
    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 5,
            CURLOPT_CONNECTTIMEOUT => 8,
            CURLOPT_TIMEOUT => 12,
            CURLOPT_USERAGENT => $userAgent,
            CURLOPT_HTTPHEADER => ['Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_ENCODING => ''
        ]);
        $data = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($data !== false && $code >= 200 && $code < 300 && strlen($data) > 50) {
            return $data;
        }
    }
    
    $opts = [
        'http' => [
            'method' => 'GET',
            'timeout' => 12,
            'header' => "User-Agent: {$userAgent}\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\n"
        ],
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false
        ]
    ];
    $context = stream_context_create($opts);
    $data = @file_get_contents($url, false, $context);
    if ($data !== false && strlen($data) > 50) {
        return $data;
    }
    
    return null;
}

function parseXmlTitles($xmlString) {
    if (!$xmlString) return [];
    libxml_use_internal_errors(true);
    $titles = [];
    
    preg_match_all('/<(?:item|entry)\b[\s\S]*?<\/(?:item|entry)>/i', $xmlString, $itemBlocks);
    if (!empty($itemBlocks[0])) {
        foreach ($itemBlocks[0] as $block) {
            if (preg_match('/<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/i', $block, $match)) {
                $clean = preg_replace('/<!\[CDATA\[([\s\S]*?)\]\]>/i', '$1', $match[1]);
                $clean = html_entity_decode(strip_tags($clean), ENT_QUOTES | ENT_XML1, 'UTF-8');
                $clean = preg_replace('/\s+/', ' ', trim($clean));
                if ($clean !== '' && !preg_match('/^(ani news|press information bureau|sachet|ndma|rss feed|disaster alerts|public alerts|all india: cap)$/i', $clean)) {
                    $titles[] = $clean;
                    if (count($titles) >= 20) break;
                }
            }
        }
    }
    
    return $titles;
}

function fetchAniDefaultNewsFeed() {
    $aniUrls = [
        'https://aninews.in/rss/feed/category/national.xml',
        'https://aninews.in/rss/feed/category/national/politics.xml',
        'https://aninews.in/rss/feed/category/business.xml',
        'https://aninews.in/rss/feed/category/health.xml',
        'https://aninews.in/rss/feed/category/world.xml',
        'https://aninews.in/rss/feed/category/sports/others.xml',
        'https://aninews.in/rss/feed/category/national/features.xml'
    ];

    $allTitles = [];
    foreach ($aniUrls as $url) {
        $data = fetchRawUrl($url);
        $titles = parseXmlTitles($data);
        if (!empty($titles)) {
            foreach ($titles as $t) {
                if (!in_array($t, $allTitles, true)) {
                    $allTitles[] = $t;
                    if (count($allTitles) >= 20) break 2;
                }
            }
        }
    }

    if (!empty($allTitles)) return $allTitles;

    // Fallback 1: PIB Official RSS
    $pibUrls = [
        'https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=2&Regid=3&reg=48',
        'https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3&reg=48'
    ];
    foreach ($pibUrls as $url) {
        $data = fetchRawUrl($url);
        $titles = parseXmlTitles($data);
        if (!empty($titles)) return $titles;
    }

    // Fallback 2: Google News India
    $gnewsUrls = [
        'https://news.google.com/rss?hl=hi&gl=IN&ceid=IN:hi',
        'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en'
    ];
    foreach ($gnewsUrls as $url) {
        $data = fetchRawUrl($url);
        $titles = parseXmlTitles($data);
        if (!empty($titles)) return $titles;
    }

    return ['ANI समाचार नेटवर्क सेवा सक्रिय है।'];
}

function fetchSachetFeed() {
    $data = fetchRawUrl('https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml');
    $titles = parseXmlTitles($data);
    if (!empty($titles)) return $titles;

    $jsonRaw = fetchRawUrl('https://sachet.ndma.gov.in/cap_public_website/FetchAllAlertDetails');
    if ($jsonRaw) {
        $json = json_decode($jsonRaw, true);
        if (is_array($json)) {
            $titles = [];
            foreach ($json as $alert) {
                if (!is_array($alert)) continue;
                $parts = array_filter([
                    trim((string)($alert['disaster_type'] ?? $alert['event'] ?? '')),
                    trim((string)($alert['area_description'] ?? $alert['areaDesc'] ?? '')),
                    trim((string)($alert['severity'] ?? $alert['severity_level'] ?? ''))
                ]);
                $t = implode(' — ', $parts);
                if ($t !== '') $titles[] = $t;
                if (count($titles) >= 20) break;
            }
            if (!empty($titles)) return $titles;
        }
    }

    $gdacsData = fetchRawUrl('https://www.gdacs.org/xml/rss.xml');
    $gdacsTitles = parseXmlTitles($gdacsData);
    if (!empty($gdacsTitles)) return $gdacsTitles;

    return ['राष्ट्रीय आपदा प्रबंधन प्राधिकरण (NDMA SACHET): वर्तमान में आपदा पूर्व चेतावनी प्रणाली सक्रिय है।'];
}

$news = fetchAniDefaultNewsFeed();
$sachet = fetchSachetFeed();

echo json_encode([
    'success' => true,
    'data' => [
        'pib' => $news,
        'news' => $news,
        'sachet' => $sachet
    ],
    'updatedAt' => gmdate('c')
], JSON_UNESCAPED_UNICODE);
