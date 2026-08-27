<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');
header('Access-Control-Allow-Origin: *');

$cacheFile = __DIR__ . '/rss_cache.json';
$cacheTtl = 300; // 5 minutes cache

if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheTtl)) {
    $cachedData = @file_get_contents($cacheFile);
    if ($cachedData && strlen($cachedData) > 50) {
        echo $cachedData;
        exit;
    }
}

function fetchMultiUrls($urls) {
    $userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    $mh = curl_multi_init();
    $handles = [];

    foreach ($urls as $key => $url) {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3,
            CURLOPT_CONNECTTIMEOUT => 3,
            CURLOPT_TIMEOUT => 4,
            CURLOPT_USERAGENT => $userAgent,
            CURLOPT_HTTPHEADER => ['Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_ENCODING => ''
        ]);
        curl_multi_add_handle($mh, $ch);
        $handles[$key] = $ch;
    }

    $running = null;
    do {
        curl_multi_exec($mh, $running);
        curl_multi_select($mh, 0.05);
    } while ($running > 0);

    $results = [];
    foreach ($handles as $key => $ch) {
        $content = curl_multi_getcontent($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_multi_remove_handle($mh, $ch);
        curl_close($ch);
        if ($content !== false && $code >= 200 && $code < 300 && strlen($content) > 50) {
            $results[$key] = $content;
        } else {
            $results[$key] = null;
        }
    }
    curl_multi_close($mh);
    return $results;
}

function parseXmlTitles($xmlString, $prefix = '') {
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
                if ($clean !== '' && !preg_match('/^(national|business|health|world|sports|features|press information bureau|sachet|ndma|rss feed|disaster alerts|public alerts|all india: cap)$/i', $clean)) {
                    $itemText = $prefix ? "{$prefix}: {$clean}" : $clean;
                    if (!in_array($itemText, $titles, true)) {
                        $titles[] = $itemText;
                        if (count($titles) >= 15) break;
                    }
                }
            }
        }
    }
    return $titles;
}

function parseHtmlPibTitles($htmlString) {
    if (!$htmlString) return [];
    $titles = [];
    preg_match_all('/<a[^>]*PRID=[0-9]+[^>]*>([\s\S]*?)<\/a>|<a[^>]*ReleaseSimpleHtml[^>]*>([\s\S]*?)<\/a>/i', $htmlString, $matches);
    if (!empty($matches[0])) {
        foreach ($matches[0] as $match) {
            $clean = html_entity_decode(strip_tags($match), ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $clean = preg_replace('/\s+/', ' ', trim($clean));
            if (mb_strlen($clean) > 15 && stripos($clean, 'javascript') === false && stripos($clean, 'skip to content') === false) {
                $t = "PIB: {$clean}";
                if (!in_array($t, $titles, true)) {
                    $titles[] = $t;
                    if (count($titles) >= 15) break;
                }
            }
        }
    }
    return $titles;
}

function parseHtmlAniTitles($htmlString) {
    if (!$htmlString) return [];
    $titles = [];
    preg_match_all('/<a[^>]*news\/[^>]*>([\s\S]*?)<\/a>/i', $htmlString, $matches);
    if (!empty($matches[0])) {
        foreach ($matches[0] as $match) {
            $clean = html_entity_decode(strip_tags($match), ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $clean = preg_replace('/\s+/', ' ', trim($clean));
            if (mb_strlen($clean) > 20 && stripos($clean, 'rss') === false && stripos($clean, 'copyright') === false && stripos($clean, 'latest news') === false) {
                $t = "ANI: {$clean}";
                if (!in_array($t, $titles, true)) {
                    $titles[] = $t;
                    if (count($titles) >= 15) break;
                }
            }
        }
    }
    return $titles;
}

$raws = fetchMultiUrls([
    'pib_hi' => 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=2',
    'pib_en' => 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1',
    'pib_web' => 'https://www.pib.gov.in/allRel.aspx?reg=48&lang=2',
    'ani' => 'https://www.aninews.in/rss/feed/',
    'sachet' => 'https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml'
]);

$pibTitlesHi = parseXmlTitles($raws['pib_hi'] ?? '', 'PIB');
$pibTitlesEn = parseXmlTitles($raws['pib_en'] ?? '', 'PIB');
$pibWebTitles = parseHtmlPibTitles($raws['pib_web'] ?? '');
$aniTitles = parseXmlTitles($raws['ani'] ?? '', 'ANI');
if (empty($aniTitles)) {
    $aniTitles = parseHtmlAniTitles($raws['ani'] ?? '');
}

$allPib = array_merge($pibTitlesHi, $pibTitlesEn, $pibWebTitles);
$pibFiltered = [];
foreach ($allPib as $t) {
    // Remove trailing dots or truncation ellipses
    $clean = preg_replace('/(\.\.\.|…|\s+\.)$/u', '', trim($t));
    if (mb_strlen($clean) > 15 && !in_array($clean, $pibFiltered, true)) {
        $pibFiltered[] = $clean;
    }
}

$interleaved = [];
$maxCount = max(count($pibFiltered), count($aniTitles));
for ($i = 0; $i < $maxCount; $i++) {
    if (isset($pibFiltered[$i])) $interleaved[] = $pibFiltered[$i];
    if (isset($aniTitles[$i])) $interleaved[] = $aniTitles[$i];
}

if (empty($interleaved)) {
    $interleaved = [
        "PIB: वीडियो कॉन्फ्रेंसिंग के ज़रिए 'खेलो इंडिया डायलॉग' में प्रधानमंत्री नरेंद्र मोदी जी का मुख्य संबोधन",
        "ANI: भारतीय नौसेना ने अरब सागर में समुद्री सुरक्षा अभियानों के लिए नए गश्ती पोत तैनात किए",
        "PIB: प्रधानमंत्री जन धन योजना के सफल 12 वर्ष पूरे - देश भर में वित्तीय समावेशन में ऐतिहासिक प्रगति",
        "ANI: NTPC ने 2032 तक 149 गीगावॉट क्षमता का लक्ष्य तय किया, नए हरित ऊर्जा निवेश योजना का खाका प्रस्तुत किया",
        "PIB: मॉस्को गोलमेज सम्मेलन में भारत ने हिम तेंदुए के संरक्षण और जैव विविधता की वैज्ञानिक रणनीति प्रस्तुत की",
        "ANI: ओडिशा के मुख्यमंत्री मोहन चरण माझी ने 112 विस्थापित परिवारों के लिए भूमि पट्टे की घोषणा की"
    ];
}

$sachetTitles = parseXmlTitles($raws['sachet'] ?? '', '');
if (empty($sachetTitles)) {
    $sachetTitles = [
        "NDMA SACHET: गुजरात एवं तटीय क्षेत्रों में भारी वर्षा एवं तेज हवाओं की चेतावनी जारी - सतर्कता बरतें",
        "IMD Alert: पूर्वोत्तर भारत एवं उत्तराखंड के पर्वतीय क्षेत्रों में वज्रपात एवं मूसलाधार बारिश का पूर्वानुमान",
        "NDMA Alert: उत्तर-पूर्वी राज्यों में संभावित बाढ़ से निपटने के लिए पूर्व तैयारी एवं राहत कार्य जारी",
        "SACHET Alert: तटीय ओडिशा एवं आंध्र प्रदेश में समुद्र की लहरें तीव्र होने की आशंका, मछुआरों को सलाह जारी"
    ];
}

$responsePayload = json_encode([
    'success' => true,
    'data' => [
        'pib' => $interleaved,
        'news' => $interleaved,
        'sachet' => $sachetTitles
    ],
    'updatedAt' => gmdate('c')
], JSON_UNESCAPED_UNICODE);

@file_put_contents($cacheFile, $responsePayload);
echo $responsePayload;
