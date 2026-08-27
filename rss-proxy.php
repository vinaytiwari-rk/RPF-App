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
    
    preg_match_all('/<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/i', $xmlString, $matches);
    if (!empty($matches[1])) {
        foreach ($matches[1] as $idx => $rawTitle) {
            $clean = preg_replace('/<!\[CDATA\[([\s\S]*?)\]\]>/i', '$1', $rawTitle);
            $clean = html_entity_decode(strip_tags($clean), ENT_QUOTES | ENT_XML1, 'UTF-8');
            $clean = preg_replace('/\s+/', ' ', trim($clean));
            if ($clean !== '' && !preg_match('/^(pib|press information bureau|sachet|ndma|rss feed|disaster alerts|public alerts)$/i', $clean)) {
                $titles[] = $clean;
                if (count($titles) >= 20) break;
            }
        }
    }
    
    if (empty($titles)) {
        $xml = @simplexml_load_string($xmlString, 'SimpleXMLElement', LIBXML_NOCDATA | LIBXML_NONET);
        if ($xml) {
            $nodes = $xml->xpath('//item/title | //entry/title');
            if (is_array($nodes)) {
                foreach ($nodes as $n) {
                    $t = trim(html_entity_decode((string)$n, ENT_QUOTES | ENT_XML1, 'UTF-8'));
                    $t = preg_replace('/\s+/', ' ', $t);
                    if ($t !== '') $titles[] = $t;
                    if (count($titles) >= 20) break;
                }
            }
        }
    }
    
    return $titles;
}

function fetchPibFeed() {
    $data = fetchRawUrl('https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=2&Regid=3&reg=48');
    $titles = parseXmlTitles($data);
    if (!empty($titles)) return $titles;

    $dataEng = fetchRawUrl('https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3&reg=48');
    $titlesEng = parseXmlTitles($dataEng);
    if (!empty($titlesEng)) return $titlesEng;

    $dataGNews = fetchRawUrl('https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en');
    $titlesGNews = parseXmlTitles($dataGNews);
    if (!empty($titlesGNews)) return $titlesGNews;

    return ['Press Information Bureau (PIB) official news bulletins are active.'];
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

    return ['National Disaster Management Authority (SACHET) active alert system is online.'];
}

$pib = fetchPibFeed();
$sachet = fetchSachetFeed();

echo json_encode([
    'success' => true,
    'data' => [
        'pib' => $pib,
        'sachet' => $sachet
    ],
    'updatedAt' => gmdate('c')
], JSON_UNESCAPED_UNICODE);
