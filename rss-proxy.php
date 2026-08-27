<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');

function cachePath($key, $suffix) { return sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'samahit_' . $key . '_' . $suffix; }
function readJson($file, $fallback = []) { $v = is_file($file) ? json_decode(@file_get_contents($file), true) : null; return is_array($v) ? $v : $fallback; }
function headerValue($headers, $name) { foreach (preg_split('/\r?\n/', (string)$headers) as $line) if (stripos($line, $name . ':') === 0) return trim(substr($line, strlen($name) + 1)); return ''; }
function cachedItems($key) { $c = readJson(cachePath($key, 'feed.json'), []); return is_array($c['items'] ?? null) ? $c['items'] : []; }
function saveItems($key, $items) { $items = array_values(array_filter(array_map('trim', $items))); if ($items) @file_put_contents(cachePath($key, 'feed.json'), json_encode(['items'=>$items,'updatedAt'=>gmdate('c')], JSON_UNESCAPED_UNICODE)); return $items; }
function requestUrl($key, $url) {
  $etagFile = cachePath($key, 'etag.txt'); $etag = is_file($etagFile) ? trim((string)@file_get_contents($etagFile)) : '';
  $headers = ['Accept: application/rss+xml, application/xml, text/xml, application/json;q=0.9, */*;q=0.8','User-Agent: Samahit-RPFoundation/1.0']; if ($etag !== '') $headers[] = 'If-None-Match: '.$etag;
  $ch = curl_init($url); curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_HEADER=>true,CURLOPT_FOLLOWLOCATION=>true,CURLOPT_MAXREDIRS=>5,CURLOPT_CONNECTTIMEOUT=>5,CURLOPT_TIMEOUT=>10,CURLOPT_HTTPHEADER=>$headers,CURLOPT_ENCODING=>'']);
  $raw=curl_exec($ch); $status=(int)curl_getinfo($ch,CURLINFO_HTTP_CODE); $hs=(int)curl_getinfo($ch,CURLINFO_HEADER_SIZE); $error=curl_error($ch); curl_close($ch);
  if ($raw===false) return ['status'=>0,'body'=>'','headers'=>'','error'=>$error]; $h=substr($raw,0,$hs); $b=substr($raw,$hs); $new=headerValue($h,'ETag'); if($new!=='') @file_put_contents($etagFile,$new); return ['status'=>$status,'body'=>$b,'headers'=>$h,'error'=>''];
}
function parseXmlTitles($text) { libxml_use_internal_errors(true); $xml=@simplexml_load_string($text,'SimpleXMLElement',LIBXML_NOCDATA|LIBXML_NONET); if(!$xml)return[]; $out=[]; $nodes=$xml->xpath('//item/title | //entry/title'); if(is_array($nodes))foreach($nodes as $n){$t=trim(html_entity_decode((string)$n,ENT_QUOTES|ENT_XML1,'UTF-8'));if($t!=='')$out[]=$t;if(count($out)>=12)break;} return $out; }
function fetchPib() { $r=requestUrl('pib','https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1'); if($r['status']===304)return['items'=>cachedItems('pib'),'source'=>'not_modified']; if($r['status']>=200&&$r['status']<300){$i=saveItems('pib',parseXmlTitles($r['body']));if($i)return['items'=>$i,'source'=>'live'];} return['items'=>cachedItems('pib'),'source'=>'cache']; }
function fetchSachet() {
  $r=requestUrl('sachet','https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml'); if($r['status']===304)return['items'=>cachedItems('sachet'),'source'=>'not_modified']; if($r['status']>=200&&$r['status']<300){$i=saveItems('sachet',parseXmlTitles($r['body']));if($i)return['items'=>$i,'source'=>'rss'];}
  $a=requestUrl('sachet_active','https://sachet.ndma.gov.in/cap_public_website/FetchAllAlertDetails'); if($a['status']>=200&&$a['status']<300){$payload=json_decode($a['body'],true);$items=[];if(is_array($payload))foreach($payload as $alert){if(!is_array($alert))continue;$parts=array_filter([trim((string)($alert['disaster_type']??$alert['event']??'')),trim((string)($alert['area_description']??$alert['areaDesc']??'')),trim((string)($alert['severity']??$alert['severity_level']??''))]);$t=implode(' — ',$parts);if($t!=='')$items[]=$t;if(count($items)>=12)break;}$items=saveItems('sachet',$items);if($items)return['items'=>$items,'source'=>'active_alerts'];}
  return['items'=>cachedItems('sachet'),'source'=>'cache'];
}
$pib=fetchPib(); $sachet=fetchSachet(); echo json_encode(['success'=>true,'data'=>['pib'=>$pib['items'],'sachet'=>$sachet['items']],'sources'=>['pib'=>$pib['source'],'sachet'=>$sachet['source']],'updatedAt'=>gmdate('c')],JSON_UNESCAPED_UNICODE);
