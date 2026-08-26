<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');

$feeds = [
  'pib' => 'https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1&reg=1',
  'sachet' => 'https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml'
];

function loadFeed($url) {
  $context = stream_context_create(['http' => ['timeout' => 12, 'header' => "User-Agent: RP-Foundation-App/1.0\r\nAccept: application/rss+xml, application/xml, text/xml, */*\r\n"]]);
  $xml = @file_get_contents($url, false, $context);
  if ($xml === false) return [];
  preg_match_all('/<(?:item|entry)\b[\s\S]*?<\/(?:item|entry)>/i', $xml, $items);
  $titles = [];
  foreach (array_slice($items[0], 0, 12) as $item) {
    if (preg_match('/<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/i', $item, $match)) {
      $title = html_entity_decode(strip_tags(preg_replace('/<!\[CDATA\[([\s\S]*?)\]\]>/i', '$1', $match[1])), ENT_QUOTES | ENT_XML1, 'UTF-8');
      $title = preg_replace('/\s+/', ' ', trim($title));
      if ($title !== '') $titles[] = $title;
    }
  }
  return $titles;
}

$result = ['success' => true, 'data' => ['pib' => loadFeed($feeds['pib']), 'sachet' => loadFeed($feeds['sachet'])], 'updatedAt' => gmdate('c')];
echo json_encode($result, JSON_UNESCAPED_UNICODE);
