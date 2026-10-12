export type LiveTvChannel = {
  id: string;
  name: string;
  url: string;
  videoId?: string;
  category: string;
  logo?: string;
  enabled?: boolean;
  order?: number;
};

export const normalizeTvChannelName = (name: string) => name.trim().toLowerCase();

export const mergeTvCatalogue = (configured: unknown): LiveTvChannel[] => {
  const map = new Map<string, LiveTvChannel>();
  LIVE_TV_DEFAULTS.forEach((ch, idx) => {
    const key = normalizeTvChannelName(ch.name);
    map.set(key, { ...ch, order: idx });
  });

  if (Array.isArray(configured)) {
    configured.forEach((item: any, idx) => {
      if (!item || typeof item.name !== 'string' || !item.name.trim() || !item.url) return;
      const key = normalizeTvChannelName(item.name);
      if (map.has(key)) {
        const existing = map.get(key)!;
        map.set(key, {
          ...existing,
          ...item,
          url: (existing.url && (!item.url || item.url.includes('example'))) ? existing.url : item.url,
          enabled: item.enabled !== false,
        });
      } else {
        map.set(key, {
          ...item,
          order: LIVE_TV_DEFAULTS.length + idx,
          enabled: item.enabled !== false,
        });
      }
    });
  }

  return [...map.values()].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

export const LIVE_TV_DEFAULTS: LiveTvChannel[] = [
  {
    "id": "gov-dd-news",
    "name": "DD News HD",
    "url": "https://www.youtube.com/live/qD6GkaU2lD0",
    "videoId": "qD6GkaU2lD0",
    "category": "News",
    "logo": "https://i.ytimg.com/vi/qD6GkaU2lD0/hqdefault.jpg",
    "enabled": true,
    "order": 0
  },
  {
    "id": "gov-dd-india",
    "name": "DD India HD",
    "url": "https://www.youtube.com/live/9X37FfIrKio",
    "videoId": "9X37FfIrKio",
    "category": "News",
    "logo": "https://i.ytimg.com/vi/9X37FfIrKio/hqdefault.jpg",
    "enabled": true,
    "order": 1
  },
  {
    "id": "gov-sansad-1",
    "name": "Sansad TV 1",
    "url": "https://www.youtube.com/live/JO7CTaWAmGk",
    "videoId": "JO7CTaWAmGk",
    "category": "Legislative",
    "logo": "https://i.ytimg.com/vi/JO7CTaWAmGk/hqdefault.jpg",
    "enabled": true,
    "order": 2
  },
  {
    "id": "gov-sansad-2",
    "name": "Sansad TV 2",
    "url": "https://www.youtube.com/live/py0W3aPWNXY",
    "videoId": "py0W3aPWNXY",
    "category": "Legislative",
    "logo": "https://i.ytimg.com/vi/py0W3aPWNXY/hqdefault.jpg",
    "enabled": true,
    "order": 3
  },
  {
    "id": "gov-dd-kisan",
    "name": "DD Kisan",
    "url": "https://www.youtube.com/live/izXvukZFBtg",
    "videoId": "izXvukZFBtg",
    "category": "News",
    "logo": "https://i.ytimg.com/vi/izXvukZFBtg/hqdefault.jpg",
    "enabled": true,
    "order": 4
  },
  {
    "id": "gov-swayam-1",
    "name": "Swayam Prabha: CH-1 Sanskar (Humanities)",
    "url": "https://www.youtube.com/live/J77z6Gc9X9c",
    "videoId": "J77z6Gc9X9c",
    "category": "Education",
    "logo": "https://www.swayamprabha.gov.in/assets/images/logo.png",
    "enabled": true,
    "order": 5
  },
  {
    "id": "gov-swayam-2",
    "name": "Swayam Prabha: CH-2 Sanvahak (Social Sci)",
    "url": "https://www.youtube.com/live/YI7CMkNDimY",
    "videoId": "YI7CMkNDimY",
    "category": "Education",
    "logo": "https://www.swayamprabha.gov.in/assets/images/logo.png",
    "enabled": true,
    "order": 6
  },
  {
    "id": "gov-swayam-3",
    "name": "Swayam Prabha: CH-3 Kautilya (Commerce)",
    "url": "https://www.youtube.com/live/nMDtN1mSNZs",
    "videoId": "nMDtN1mSNZs",
    "category": "Education",
    "logo": "https://www.swayamprabha.gov.in/assets/images/logo.png",
    "enabled": true,
    "order": 7
  },
  {
    "id": "gov-swayam-4",
    "name": "Swayam Prabha: CH-4 Aryabhatt (Maths)",
    "url": "https://www.youtube.com/live/FlWOhwRkZHw",
    "videoId": "FlWOhwRkZHw",
    "category": "Education",
    "logo": "https://www.swayamprabha.gov.in/assets/images/logo.png",
    "enabled": true,
    "order": 8
  },
  {
    "id": "gov-swayam-5",
    "name": "Swayam Prabha: CH-5 Spandan (Science)",
    "url": "https://www.youtube.com/live/JPlbtkNdh5s",
    "videoId": "JPlbtkNdh5s",
    "category": "Education",
    "logo": "https://www.swayamprabha.gov.in/assets/images/logo.png",
    "enabled": true,
    "order": 9
  },
  {
    "id": "gov-swayam-6",
    "name": "Swayam Prabha: CH-7 Vyas",
    "url": "https://www.youtube.com/live/R2fdpixKA9Q",
    "videoId": "R2fdpixKA9Q",
    "category": "Education",
    "logo": "https://www.swayamprabha.gov.in/assets/images/logo.png",
    "enabled": true,
    "order": 10
  },
  {
    "id": "gov-swayam-7",
    "name": "Swayam Prabha: CH-8 Aatmagyan",
    "url": "https://www.youtube.com/live/k1HJ5vtdI4Q",
    "videoId": "k1HJ5vtdI4Q",
    "category": "Education",
    "logo": "https://www.swayamprabha.gov.in/assets/images/logo.png",
    "enabled": true,
    "order": 11
  },
  {
    "id": "gov-swayam-8",
    "name": "Swayam Prabha: CH-9 AICTE",
    "url": "https://www.youtube.com/live/rYtFG0edlhk",
    "videoId": "rYtFG0edlhk",
    "category": "Education",
    "logo": "https://www.swayamprabha.gov.in/assets/images/logo.png",
    "enabled": true,
    "order": 12
  },
  {
    "id": "gov-swayam-9",
    "name": "Swayam Prabha: CH-10 IGNOU",
    "url": "https://www.youtube.com/live/Xq-rdCDGY_U",
    "videoId": "Xq-rdCDGY_U",
    "category": "Education",
    "logo": "https://www.swayamprabha.gov.in/assets/images/logo.png",
    "enabled": true,
    "order": 13
  },
  {
    "id": "in-4sidestv-in-sd",
    "name": "4 SiDES TV (1080p)",
    "url": "https://stream.ottlive.co.in/4sidestv/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/4sites.png",
    "enabled": true,
    "order": 14
  },
  {
    "id": "in-4tvnews-in-sd",
    "name": "4TV News (576p)",
    "url": "https://cdn.pishow.tv/ott/live/1007/master.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/4_TV.png",
    "enabled": true,
    "order": 15
  },
  {
    "id": "in-6tvtelugu-in-sd",
    "name": "6 TV Telugu (576p)",
    "url": "https://yuppparoriglin.akamaized.net/181224/smil:6tv.smil/playlist.m3u8?hdnts=st=1735898689~exp=1835898688~acl=*~hmac=f5fe24724fe05481e3841f9eb5ab8efdee0a3dd83645ae9dcf45703f525bab7b",
    "category": "News",
    "logo": "https://i.imgur.com/l3EcRnZ.png",
    "enabled": true,
    "order": 16
  },
  {
    "id": "in-7smusic-in-sd",
    "name": "7S Music (576p)",
    "url": "https://cdn.pishow.tv/ott/live/1257/master.m3u8",
    "category": "Music",
    "logo": "https://i.imgur.com/zDiIhdN.png",
    "enabled": true,
    "order": 17
  },
  {
    "id": "in-9plusnews-in-sd",
    "name": "9 Plus News (1080p)",
    "url": "https://stream.ottlive.co.in/9plusnews/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/9plusnews.png",
    "enabled": true,
    "order": 18
  },
  {
    "id": "in-9xjalwa-in-sd",
    "name": "9X Jalwa (1080p)",
    "url": "https://wiselp.wiseplayout.com/9X_Jalwa/master.m3u8",
    "category": "Music",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_9X_JALWA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 19
  },
  {
    "id": "in-9xjhakaas-in-sd",
    "name": "9X Jhakaas (1080p)",
    "url": "https://amg01281-9xmediapvtltd-9xjhakaas-samsungin-ci2cs.amagi.tv/playlist/amg01281-9xmediapvtltd-9xjhakaas-samsungin/playlist.m3u8",
    "category": "Music",
    "logo": "https://dtil.tmsimg.com/assets/s90012_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 20
  },
  {
    "id": "in-9xtashan-in-sd",
    "name": "9X Tashan (1080p)",
    "url": "https://amg01281-9xmediapvtltd-9xtashan-samsungin-xz1sd.amagi.tv/playlist/amg01281-9xmediapvtltd-9xtashan-samsungin/playlist.m3u8",
    "category": "Music",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_9X_TASHAN/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 21
  },
  {
    "id": "in-10tv-in-sd",
    "name": "10 TV (720p)",
    "url": "https://mumbai-edge.smartplaytv.in/10TV/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_10TV/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 22
  },
  {
    "id": "in-22scopenews-in-sd",
    "name": "22Scope News (1080p)",
    "url": "https://thelegitpro.in/HDlive/22scope/index.fmp4.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/22Scope_News.png",
    "enabled": true,
    "order": 23
  },
  {
    "id": "in-24news-in-sd",
    "name": "24 News (576p)",
    "url": "https://mumt07.tangotv.in/zHjX9OFlTWENTYFOURNEWS/index.m3u8",
    "category": "News",
    "logo": "https://sund-images.sunnxt.com/202222/300x300_24News_202222_d63feca0-79ae-47ea-b75a-66c17d456f4c.png",
    "enabled": true,
    "order": 24
  },
  {
    "id": "in-99tv-in-sd",
    "name": "99TV (720p)",
    "url": "https://cdn.pishow.tv/ott/live/1211/master.m3u8",
    "category": "News",
    "logo": "https://i.imgur.com/dZA4gel.png",
    "enabled": true,
    "order": 25
  },
  {
    "id": "in-aadinathtv-in-sd",
    "name": "Aadinath TV (576p)",
    "url": "https://mumt01.tangotv.in/O5aw8Zn3AADINATHTV/index.m3u8",
    "category": "Religious",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_AADINATH_TV/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 26
  },
  {
    "id": "in-aajkikhabar-in-sd",
    "name": "Aaj Ki Khabar (1080p)",
    "url": "https://stream.ottlive.co.in/aajkikhabar/index.m3u8",
    "category": "News",
    "logo": "https://m.media-amazon.com/images/I/71q8sOMPwHL.png",
    "enabled": true,
    "order": 27
  },
  {
    "id": "in-aajtak-in-hd",
    "name": "Aaj Tak HD (1080p)",
    "url": "https://feeds.intoday.in/aajtak/api/aajtakhd/master.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_AAJ_TAK/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 28
  },
  {
    "id": "in-aakaashaath-in-sd",
    "name": "Aakaash Aath (576p)",
    "url": "http://tvsen5.aynascope.net/Wm9Lv2RjZGT6/index.m3u8",
    "category": "Entertainment",
    "logo": "https://dtil.tmsimg.com/assets/s142510_ld_h15_ab.png?lock=720x540",
    "enabled": true,
    "order": 29
  },
  {
    "id": "in-aamarbangla-in-sd",
    "name": "Aamar Bangla (720p)",
    "url": "https://app.ncare.live/c3VydmVyX8RpbEU9Mi8xNy8yMDE0GIDU6RgzQ6NTAgdEoaeFzbF92YWxIZTO0U0ezN1IzMyfvcGVMZEJCTEFWeVN3PTOmdFsaWRtaW51aiPhnPTI/amarbanglatv.stream/playlist.m3u8",
    "category": "Entertainment",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Amaar_Bangla.png",
    "enabled": true,
    "order": 30
  },
  {
    "id": "in-aaryaatv-in-sd",
    "name": "Aaryaa TV (1080p)",
    "url": "https://stream.ottlive.co.in/aryatvtamil/index.m3u8",
    "category": "Music",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/aryatvtamil.png",
    "enabled": true,
    "order": 31
  },
  {
    "id": "in-aaseervathamtv-in-sd",
    "name": "Aaseervatham TV (576p)",
    "url": "https://mumt04.tangotv.in/m18aqlK4AASEERVATHAMTV/index.m3u8",
    "category": "Religious",
    "logo": "https://i.imgur.com/GlfrYs7.png",
    "enabled": true,
    "order": 32
  },
  {
    "id": "in-aastha-in-hd",
    "name": "Aastha HD (720p)",
    "url": "https://aasthaott.akamaized.net/110923/smil:aasthatv.smil/index.m3u8",
    "category": "Religious",
    "logo": "https://i.imgur.com/IqgrV92.png",
    "enabled": true,
    "order": 33
  },
  {
    "id": "in-aasthagujarati-in-sd",
    "name": "Aastha Gujarati (576p)",
    "url": "https://mumt04.tangotv.in/m18aqlK4AASTHAGUJARATI/index.m3u8",
    "category": "Religious",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Aastha_Tamil.png",
    "enabled": true,
    "order": 34
  },
  {
    "id": "in-aasthakannada-in-sd",
    "name": "Aastha Kannada (480p)",
    "url": "https://aasthaott.akamaized.net/110923/smil:aasthakannada.smil/playlist.m3u8",
    "category": "Religious",
    "logo": "https://dtil.tmsimg.com/assets/s158134_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 35
  },
  {
    "id": "in-aasthaprime1-in-sd",
    "name": "Aastha Prime 1 (720p)",
    "url": "https://aasthaott.akamaized.net/110923/smil:aasthaprime1.smil/master.m3u8",
    "category": "Religious",
    "logo": "https://i.imgur.com/LyWSMJS.png",
    "enabled": true,
    "order": 36
  },
  {
    "id": "in-aasthatamil-in-sd",
    "name": "Aastha Tamil (480p)",
    "url": "https://aasthaott.akamaized.net/110923/smil:aasthatamil.smil/playlist.m3u8",
    "category": "Religious",
    "logo": "https://i.imgur.com/YQK9ewf.png",
    "enabled": true,
    "order": 37
  },
  {
    "id": "in-aasthatelugu-in-sd",
    "name": "Aastha Telugu (576p)",
    "url": "https://mumbai-edge.smartplaytv.in/AasthaTelugu/index.m3u8",
    "category": "Religious",
    "logo": "https://dtil.tmsimg.com/assets/s158136_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 38
  },
  {
    "id": "in-abnandhrajyoti-in-sd",
    "name": "ABN Andhra Jyoti (720p)",
    "url": "https://mumbai-edge.smartplaytv.in/ABNAJ/index.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s142517_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 39
  },
  {
    "id": "in-abntvindia-us-sd",
    "name": "ABN TV India (540p)",
    "url": "https://mediaserver.abnvideos.com/streams/abntvindia.m3u8",
    "category": "Religious",
    "logo": "https://i.imgur.com/VcZn60X.png",
    "enabled": true,
    "order": 40
  },
  {
    "id": "in-abpananda-in-sd",
    "name": "ABP Ananda (1080p)",
    "url": "https://d2l4ar6y3mrs4k.cloudfront.net/live-streaming/ananda-livetv/master.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s142518_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 41
  },
  {
    "id": "in-abpasmita-in-sd",
    "name": "ABP Asmita (1080p)",
    "url": "https://d2l4ar6y3mrs4k.cloudfront.net/live-streaming/asmita-livetv/master.m3u8",
    "category": "News",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/ABP_Asmita_logo.svg/500px-ABP_Asmita_logo.svg.png",
    "enabled": true,
    "order": 42
  },
  {
    "id": "in-abpganga-in-sd",
    "name": "ABP Ganga (1080p)",
    "url": "https://d2l4ar6y3mrs4k.cloudfront.net/live-streaming/ganga-livetv/master.m3u8",
    "category": "News",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/ABP_Ganga.svg/500px-ABP_Ganga.svg.png",
    "enabled": true,
    "order": 43
  },
  {
    "id": "in-abpmajha-in-sd",
    "name": "ABP Majha (576p)",
    "url": "https://mumbai-edge.smartplaytv.in/ABPMajha/index.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s142521_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 44
  },
  {
    "id": "in-abpnews-in-sd",
    "name": "ABP News (1080p)",
    "url": "https://d1rc86nwwc9fag.cloudfront.net/vglive-sk-472500/abpnews/master.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s158138_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 45
  },
  {
    "id": "in-adhyatmtv-in-sd",
    "name": "Adhyatm TV (720p)",
    "url": "https://mumbai-edge.smartplaytv.in/AdhyatmTV/index.m3u8",
    "category": "Religious",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Adhyatam_TV.png",
    "enabled": true,
    "order": 46
  },
  {
    "id": "in-akdcalcuttanews-in-sd",
    "name": "AKD Calcutta News (1080p)",
    "url": "https://live.legitpro.co.in/cnnnews/index.m3u8",
    "category": "News",
    "logo": "https://ltsk-cdn.s3.eu-west-1.amazonaws.com/jumpstart/Temp_Live/cdn/HLS/Channel/transparentImages/Calcutta%20News.png",
    "enabled": true,
    "order": 47
  },
  {
    "id": "in-akhonkolkata-in-sd",
    "name": "Akhon Kolkata (478p)",
    "url": "https://server.playontv.in/ekhonkolkata/ekhonkolkata/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/ekhonkolkata.png",
    "enabled": true,
    "order": 48
  },
  {
    "id": "in-alankartv-in-sd",
    "name": "Alankar TV (720p)",
    "url": "https://livetv.tarangplus.in/alankar-origin/live/playlist.m3u8",
    "category": "Movies",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_ALANKAR/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 49
  },
  {
    "id": "in-amritatv-in-sd",
    "name": "Amrita TV (720p)",
    "url": "https://ddash74r36xqp.cloudfront.net/master.m3u8",
    "category": "Entertainment",
    "logo": "https://i.imgur.com/WdSjlPl.png",
    "enabled": true,
    "order": 50
  },
  {
    "id": "in-anandtv-in-sd",
    "name": "Anand TV (India) (1080p)",
    "url": "https://live.legitpro.co.in/anandtv/index.m3u8",
    "category": "Religious",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Anand_TV.png",
    "enabled": true,
    "order": 51
  },
  {
    "id": "in-anandwaritv-in-sd",
    "name": "Anand Wari TV (576p)",
    "url": "https://mumt03.tangotv.in/Dsly5z3HANANDWARITV/index.m3u8",
    "category": "Religious",
    "logo": "https://papaji.freetvindia.com/media/channels/anandvari.png",
    "enabled": true,
    "order": 52
  },
  {
    "id": "in-anandabarta-in-sd",
    "name": "Ananda Barta (720p)",
    "url": "https://account19.livebox.co.in/Anandabarta2hls/live.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Anand_Barta.png",
    "enabled": true,
    "order": 53
  },
  {
    "id": "in-anbnews-in-sd",
    "name": "ANB News (720p)",
    "url": "https://server.livelegitpro.in:9899/anbnews/anbnews/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_ANB_NEWS/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 54
  },
  {
    "id": "in-andyharyana-in-sd",
    "name": "Andy Haryana (576p)",
    "url": "https://mumt03.tangotv.in/Dsly5z3HANDYHARYANA/index.m3u8",
    "category": "General",
    "logo": "https://i.imgur.com/rmCBD3e.png",
    "enabled": true,
    "order": 55
  },
  {
    "id": "in-angeltv-in-india",
    "name": "Angel TV (720p)",
    "url": "https://janya-digimix.akamaized.net/vglive-sk-394914/india/ngrp:angelindia_all/playlist.m3u8",
    "category": "Religious",
    "logo": "https://i.imgur.com/qKLEGU7.png",
    "enabled": true,
    "order": 56
  },
  {
    "id": "in-animaxasia-sg-india",
    "name": "Animax Asia India (1080p) [Geo-blocked]",
    "url": "https://amg02159-kcglobal-amg02159c1-samsung-in-521.playouts.now.amagi.tv/playlist/amg02159-kcglobal-animax-samsungin/playlist.m3u8",
    "category": "Kids",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Animax.png",
    "enabled": true,
    "order": 57
  },
  {
    "id": "in-anjantv-in-sd",
    "name": "Anjan TV (720p)",
    "url": "https://anjan.vstream.online/anjanorg/ngrp:anjan_hdall/playlist.m3u8",
    "category": "Entertainment",
    "logo": "https://i.imgur.com/sh0yFSf.png",
    "enabled": true,
    "order": 58
  },
  {
    "id": "in-apn-in-sd",
    "name": "APN (576p)",
    "url": "https://mumt01.tangotv.in/O5aw8Zn3APN/index.m3u8",
    "category": "News",
    "logo": "https://ltsk-cdn.s3.eu-west-1.amazonaws.com/jumpstart/Temp_Live/cdn/HLS/Channel/transparentImages/APN.png",
    "enabled": true,
    "order": 59
  },
  {
    "id": "in-apnapunjabtv-ca-sd",
    "name": "Apna Punjab TV (720p)",
    "url": "https://plus.gigabitcdn.net/live-stream/apna-punjab-H3sE/playlist.m3u8",
    "category": "Entertainment",
    "logo": "https://i.imgur.com/IM4D8Wz.png",
    "enabled": true,
    "order": 60
  },
  {
    "id": "in-argusnews-in-sd",
    "name": "Argus News (576p)",
    "url": "https://mumt05.tangotv.in/87NeALx2ARGUSNEWS/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_ARGUS/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 61
  },
  {
    "id": "in-arputharyesutv-in-sd",
    "name": "Arputhar Yesu TV (576p)",
    "url": "https://account33.livebox.co.in/jesushelpshls/live.m3u8",
    "category": "Religious",
    "logo": "https://arputharyesutv.net/wp-content/uploads/2022/07/AR-LOGO-PNG.png",
    "enabled": true,
    "order": 62
  },
  {
    "id": "in-asiannews-in-sd",
    "name": "Asian News (1080p)",
    "url": "https://stream.ottlive.co.in/asiannews/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Asian_News.png",
    "enabled": true,
    "order": 63
  },
  {
    "id": "in-asianet-in-hd",
    "name": "Asianet HD (1080p)",
    "url": "https://da86m1sqpm3o0.cloudfront.net/28072023/smil:starasianet.smil/chunklist_b1928000.m3u8",
    "category": "Entertainment",
    "logo": "https://i.imgur.com/Wv7MOzg.png",
    "enabled": true,
    "order": 64
  },
  {
    "id": "in-asianetnews-in-sd",
    "name": "Asianet News (1080p)",
    "url": "https://amg13737-amg13737c1-amgplt0016.playout.now3.amagi.tv/playlist/amg13737-amg13737c1-amgplt0016/playlist.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_ASIANET_NEWS/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 65
  },
  {
    "id": "in-asianetsuvarnanews-in-sd",
    "name": "Asianet Suvarna News (1080p) [Not 24/7]",
    "url": "https://asianetnews.vgcdn.net/vglive-sk-335835/playlist.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s142682_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 66
  },
  {
    "id": "in-asomlive24-in-sd",
    "name": "Asom Live 24 (576p)",
    "url": "https://mumt06.tangotv.in/qYyB8fXVASHOMLIVE/index.m3u8",
    "category": "News",
    "logo": "https://papaji.freetvindia.com/media/channels/asom_live_24x7.png",
    "enabled": true,
    "order": 67
  },
  {
    "id": "in-assamtalks-in-sd",
    "name": "Assam Talks (576p)",
    "url": "http://tvsen7.aynascope.net/AssamTalks/index.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s142683_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 68
  },
  {
    "id": "in-awaazindiatv-in-sd",
    "name": "Awaaz India TV (720p) [Not 24/7]",
    "url": "https://awaazindia.livebox.co.in/AwaazIndaTVhls/Live.m3u8",
    "category": "News",
    "logo": "https://i.imgur.com/eKQs51V.png",
    "enabled": true,
    "order": 69
  },
  {
    "id": "in-awakeningtv-in-sd",
    "name": "Awakening TV (576p)",
    "url": "https://mumt03.tangotv.in/Dsly5z3HAWAKENINGTV/index.m3u8",
    "category": "Religious",
    "logo": "https://i.imgur.com/p26iWOi.png",
    "enabled": true,
    "order": 70
  },
  {
    "id": "in-ayushtv-in-sd",
    "name": "Ayush TV (576p)",
    "url": "http://d1msejlow1t3l4.cloudfront.net/fta/ayushtv/playlist.m3u8",
    "category": "General",
    "logo": "https://dtil.tmsimg.com/assets/s142692_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 71
  },
  {
    "id": "in-b4ubhojpuri-in-sd",
    "name": "B4U Bhojpuri (1080p)",
    "url": "https://cdnb4u.wiseplayout.com/B4U_Bhojpuri/master.m3u8",
    "category": "Movies",
    "logo": "https://i.imgur.com/NwOQUDp.png",
    "enabled": true,
    "order": 72
  },
  {
    "id": "in-b4ukadak-in-sd",
    "name": "B4U Kadak (576p)",
    "url": "https://streams.tangotv.in/B4UKADAK/ORIGIN/index.m3u8",
    "category": "Movies",
    "logo": "https://dtil.tmsimg.com/assets/s142695_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 73
  },
  {
    "id": "in-b4umovies-in-india",
    "name": "B4U Movies (576p)",
    "url": "https://streams.tangotv.in/B4UMOVIES/ORIGIN/index.m3u8",
    "category": "Movies",
    "logo": "https://i.imgur.com/M9kMFJl.png",
    "enabled": true,
    "order": 74
  },
  {
    "id": "in-b4umusic-in-india",
    "name": "B4U Music (1080p)",
    "url": "https://amg01408-amg01408c5-amgplt0747.playout.now3.amagi.tv/b4um001/playlist.m3u8",
    "category": "Music",
    "logo": "https://dtil.tmsimg.com/assets/s158141_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 75
  },
  {
    "id": "in-balleballe-in-sd",
    "name": "Balle Balle (576p)",
    "url": "https://streams.tangotv.in/BALLEBALLE/ORIGIN/index.m3u8",
    "category": "Music",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Balle_Balle_TV.png",
    "enabled": true,
    "order": 76
  },
  {
    "id": "in-balleballe-in-hd",
    "name": "Balle Balle HD (720p)",
    "url": "https://mcncdndigital.com/balleballetv/index.m3u8",
    "category": "Music",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Balle_Balle_TV.png",
    "enabled": true,
    "order": 77
  },
  {
    "id": "in-bansalnews-in-sd",
    "name": "Bansal News (720p)",
    "url": "https://8yzmq2gbdvax-hls-live.wmncdn.net/bansalnewstv1/live1.stream/playlist.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_BANSAL_NEWS/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 78
  },
  {
    "id": "in-bflixmovies-in-sd",
    "name": "Bflix Movies (576p)",
    "url": "http://103.151.60.162:2122/play/a01e/index.m3u8?hls",
    "category": "Movies",
    "logo": "https://i.imgur.com/5CtiQ45.png",
    "enabled": true,
    "order": 79
  },
  {
    "id": "in-bhagyamtv-in-sd",
    "name": "Bhagyam TV (1080p)",
    "url": "https://ott.bhagyam.net/hls/bhagyamweb/index-1409148900-now.m3u8",
    "category": "Religious",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/aanadhamtvtamil.png",
    "enabled": true,
    "order": 80
  },
  {
    "id": "in-bhakthitv-in-sd",
    "name": "Bhakthi TV (720p)",
    "url": "https://cdn.pishow.tv/ott/live/397/master.m3u8",
    "category": "Religious",
    "logo": "https://upload.wikimedia.org/wikipedia/en/6/61/Bhakthi_TV_logo.jpg",
    "enabled": true,
    "order": 81
  },
  {
    "id": "in-bhaktisagar-in-sd",
    "name": "Bhakti Sagar (576p)",
    "url": "https://mumt05.tangotv.in/87NeALx2BHAKTISAGAR/index.m3u8",
    "category": "Religious",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Bhaktisagar.png",
    "enabled": true,
    "order": 82
  },
  {
    "id": "in-bharat24-in-sd",
    "name": "Bharat24 (720p)",
    "url": "https://cdn.ottlive.co.in/bharat24/index.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s142710_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 83
  },
  {
    "id": "in-bharatexpress-in-sd",
    "name": "Bharat Express (576p)",
    "url": "https://mumt07.tangotv.in/zHjX9OFlBHARATEXPRESS/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_BHARAT_EXPRESS/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 84
  },
  {
    "id": "in-bharatsamachar-in-sd",
    "name": "Bharat Samachar (576p)",
    "url": "https://mumt03.tangotv.in/Dsly5z3HBHARATSAMACHAR/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_BHARAT_SAMACHAR/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 85
  },
  {
    "id": "in-bharatupdate-in-sd",
    "name": "Bharat Update (576p)",
    "url": "https://cdn.pishow.tv/ott/live/339/master.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Bharat_Update.png",
    "enabled": true,
    "order": 86
  },
  {
    "id": "in-bhojpuricinema-in-sd",
    "name": "Bhojpuri Cinema (720p)",
    "url": "https://live-bhojpuri.akamaized.net/liveabr/playlist.m3u8",
    "category": "Movies",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_BHOJPURI_CINEMA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 87
  },
  {
    "id": "in-bigtv24x7-in-sd",
    "name": "Big TV 24x7 (1080p)",
    "url": "https://stream.ottlive.co.in/bigtvmalayalam/index.m3u8",
    "category": "News",
    "logo": "https://i.postimg.cc/rpHrRxR5/big_tv_malayalam.png",
    "enabled": true,
    "order": 88
  },
  {
    "id": "in-bigtv-in-sd",
    "name": "BIG TV (720p)",
    "url": "https://cdn.pishow.tv/ott/live/1059/master.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Big_TV.png",
    "enabled": true,
    "order": 89
  },
  {
    "id": "in-bollygold-in-hd",
    "name": "Bollygold (1080p)",
    "url": "https://jmp2.uk/stvp-IN4000600Q",
    "category": "Movies",
    "logo": "https://tvpnlogopus.samsungcloud.tv/platform/image/sourcelogo/vc/00/02/34/IN4000600Q_20260805T003941SQUARE.png",
    "enabled": true,
    "order": 90
  },
  {
    "id": "in-booglebollywood-in-sd",
    "name": "Boogle Bollywood (720p)",
    "url": "https://yuppnimrestreammum.akamaized.net/181224/smil:bogglebollywood.smil/playlist.m3u8?hdnts=st=1735898689~exp=1835898688~acl=*~hmac=f5fe24724fe05481e3841f9eb5ab8efdee0a3dd83645ae9dcf45703f525bab7b",
    "category": "Music",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Boogle_Bollywood.png",
    "enabled": true,
    "order": 91
  },
  {
    "id": "in-bttv-in-sd",
    "name": "BT TV (720p)",
    "url": "https://feeds.intoday.in/bttv/itgd.m3u8",
    "category": "News",
    "logo": "https://akm-img-a-in.tosshub.com/businesstoday/resource/img/best-bank-new.png",
    "enabled": true,
    "order": 92
  },
  {
    "id": "in-bvg-in-sd",
    "name": "BVG (576p)",
    "url": "https://mumt05.tangotv.in/87NeALx2BVG/index.m3u8",
    "category": "Education",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/BVG.png",
    "enabled": true,
    "order": 93
  },
  {
    "id": "in-calvarytv-in-sd",
    "name": "Calvary TV (576p)",
    "url": "https://cdn.pishow.tv/ott/live/963/master.m3u8",
    "category": "General",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Calvary.png",
    "enabled": true,
    "order": 94
  },
  {
    "id": "in-channeldivya-in-sd",
    "name": "Channel Divya (1080p)",
    "url": "https://vg-pitaaratvlive.akamaized.net/v1/vglive-sk-906482/playlist.m3u8",
    "category": "Religious",
    "logo": "https://dtil.tmsimg.com/assets/s143010_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 95
  },
  {
    "id": "in-channelwin-in-sd",
    "name": "Channel WIN (720p)",
    "url": "https://cdn.pishow.tv/ott/live/229/master.m3u8",
    "category": "Religious",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_CHANNEL_WIN/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 96
  },
  {
    "id": "in-chardiklagurbaanitv-in-sd",
    "name": "Chardikla Gurbaani TV (1080p)",
    "url": "https://chardikalatimestv.gigabitcdn.net/in-chardikala/chardikala-gurbani-tv/playlist.m3u8",
    "category": "News",
    "logo": "https://i.imgur.com/NXD8CPq.png",
    "enabled": true,
    "order": 97
  },
  {
    "id": "in-chardiklatimetv-in-sd",
    "name": "Chardikla Time TV (1080p)",
    "url": "https://chardikalagurbanitv.gigabitcdn.net/in-chardikala/chardikala-timetv/playlist.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_CHARDIKLA_TIME_TV/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 98
  },
  {
    "id": "in-chithiram-in-sd",
    "name": "Chithiram (576p)",
    "url": "https://cdn.pishow.tv/ott/live/1243/master.m3u8",
    "category": "Kids",
    "logo": "https://i.imgur.com/xv9cWSh.png",
    "enabled": true,
    "order": 99
  },
  {
    "id": "in-cnbcawaaz-in-sd",
    "name": "CNBC Awaaz (1080p)",
    "url": "https://n18syndication.akamaized.net/bpk-tv/CNBC_Awaaz_NW18_MOB/output01/master.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/CNBCAwaaz.png",
    "enabled": true,
    "order": 100
  },
  {
    "id": "in-cnbcbajar-in-sd",
    "name": "CNBC Bajar (1080p)",
    "url": "https://n18syndication.akamaized.net/bpk-tv/CNBC_Bazaar_NW18_MOB/output01/master.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/CNBCBajar.png",
    "enabled": true,
    "order": 101
  },
  {
    "id": "in-cnbctv18-in-sd",
    "name": "CNBC TV18 (1080p)",
    "url": "https://n18syndication.akamaized.net/bpk-tv/CNBC_TV18_NW18_MOB/output01/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/CNBCTV18.png",
    "enabled": true,
    "order": 102
  },
  {
    "id": "in-cnbctv18primehd-in-sd",
    "name": "CNBC TV18 Prime HD (1080p)",
    "url": "https://n18syndication.akamaized.net/bpk-tv/CNBC_Tv18_Prime_HD_NW18_MOB/output01/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/CNBCTV18Prime.png",
    "enabled": true,
    "order": 103
  },
  {
    "id": "in-cnewsbharat-in-sd",
    "name": "Cnews Bharat (720p)",
    "url": "https://legitpro.co.in/cnews/cnews/index.fmp4.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/C_News_Bharat.png",
    "enabled": true,
    "order": 104
  },
  {
    "id": "in-colors-in-sd",
    "name": "Colors (576p)",
    "url": "https://raw.githubusercontent.com/amazeyourself/adaptive-streams/refs/heads/main/streams/sg/YuppTV/ColorsAPAC.m3u8",
    "category": "Entertainment",
    "logo": "https://i.imgur.com/M8uCJ0D.png",
    "enabled": true,
    "order": 105
  },
  {
    "id": "in-colorsbanglacinema-in-sd",
    "name": "Colors Bangla Cinema (576p)",
    "url": "http://103.151.60.162:2122/play/a02m/index.m3u8?hls",
    "category": "Movies",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_COLORS_BANGLA_CINEMA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 106
  },
  {
    "id": "in-colorscineplex-in-sd",
    "name": "Colors Cineplex (576p)",
    "url": "https://raw.githubusercontent.com/amazeyourself/adaptive-streams/refs/heads/main/streams/gb/YuppTV/ColorsCineplexUK.m3u8",
    "category": "Movies",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_COLORS_CINEPLEX/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 107
  },
  {
    "id": "in-colorsgujarati-in-sd",
    "name": "Colors Gujarati (396p)",
    "url": "https://raw.githubusercontent.com/amazeyourself/adaptive-streams/refs/heads/main/streams/in/YuppTV/ColorsGujarati.m3u8",
    "category": "Entertainment",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_COLORS_GUJARATI/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 108
  },
  {
    "id": "in-colorsinfinity-in-hd",
    "name": "Colors Infinity HD (1080p)",
    "url": "http://103.151.60.162:2122/play/a02r/index.m3u8?hls",
    "category": "Entertainment",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_COLORS_INFINITY/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 109
  },
  {
    "id": "in-colorskannada-in-hd",
    "name": "Colors Kannada HD (1080i)",
    "url": "https://da86m1sqpm3o0.cloudfront.net/28072023/smil:colorskannadahd1.smil/playlist.m3u8",
    "category": "Entertainment",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_COLORS_KANNADA_HD/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 110
  },
  {
    "id": "in-colorsmarathi-in-hd",
    "name": "Colors Marathi HD (720p)",
    "url": "https://da86m1sqpm3o0.cloudfront.net/28072023/smil:colorsmarathihd.smil/playlist.m3u8",
    "category": "Entertainment",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_COLORS_MARATHI/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 111
  },
  {
    "id": "in-colorsrishteyamericas-in-sd",
    "name": "Colors Rishtey Americas (396p)",
    "url": "https://manatv.akamaized.net/090823/smil:ristheyamerica.smil/playlist.m3u8",
    "category": "General",
    "logo": "https://i.imgur.com/xkOunuW.png",
    "enabled": true,
    "order": 112
  },
  {
    "id": "in-colorssuper-in-sd",
    "name": "Colors Super (396p)",
    "url": "https://d1rc86nwwc9fag.cloudfront.net/260723/smil:colorssuper1.smil/playlist.m3u8?hdnts=st=1735898689~exp=1835898688~acl=*~hmac=f5fe24724fe05481e3841f9eb5ab8efdee0a3dd83645ae9dcf45703f525bab7b",
    "category": "Entertainment",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_COLORS_SUPER/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 113
  },
  {
    "id": "in-colorstamil-in-hd",
    "name": "Colors Tamil HD (720p)",
    "url": "https://da86m1sqpm3o0.cloudfront.net/28072023/smil:colorstamilhd11.smil/playlist.m3u8",
    "category": "Entertainment",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_COLORS_TAMIL/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 114
  },
  {
    "id": "in-ctvnakdplus-in-sd",
    "name": "CTVN AKD Plus (1080p)",
    "url": "https://live.legitpro.co.in/ctvnakdplus/index.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s142754_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 115
  },
  {
    "id": "in-cvrenglish-in-sd",
    "name": "CVR English (720p)",
    "url": "https://cdn.pishow.tv/ott/live/425/master.m3u8",
    "category": "News",
    "logo": "https://i.imgur.com/k0WTQKi.png",
    "enabled": true,
    "order": 116
  },
  {
    "id": "in-cvrhealth-in-sd",
    "name": "CVR Health (576p)",
    "url": "https://mumbai-edge.smartplaytv.in/CVRHealth/index.m3u8",
    "category": "General",
    "logo": "https://i.imgur.com/bCyW32I.png",
    "enabled": true,
    "order": 117
  },
  {
    "id": "in-cvrnews-in-sd",
    "name": "CVR News (576p)",
    "url": "https://mumbai-edge.smartplaytv.in/CVRNews/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_CVR_NEWS/images/LOGO_HD/LOGO_HD_image.png",
    "enabled": true,
    "order": 118
  },
  {
    "id": "in-cvromspiritual-in-sd",
    "name": "CVR OM Spiritual (576p)",
    "url": "https://yuppnimrestreammum.akamaized.net/181224/smil:cvrom1.smil/playlist.m3u8?hdnts=st=1735898689~exp=1835898688~acl=*~hmac=f5fe24724fe05481e3841f9eb5ab8efdee0a3dd83645ae9dcf45703f525bab7b",
    "category": "Religious",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/CVR_OM_Spiritual.png",
    "enabled": true,
    "order": 119
  },
  {
    "id": "in-dailyposttv-in-sd",
    "name": "Daily Post TV (1080p)",
    "url": "https://vglivessai.akamaized.net/sg/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/103b8dd3-a888-4d1d-89a5-8a4bc25e48c1/index.m3u8",
    "category": "News",
    "logo": "https://papaji.freetvindia.com/media/Daily_post.png",
    "enabled": true,
    "order": 120
  },
  {
    "id": "in-dangal2-in-sd",
    "name": "Dangal 2 (720p)",
    "url": "https://live-dangal2.akamaized.net/liveabr/playlist.m3u8",
    "category": "Entertainment",
    "logo": "https://i.imgur.com/BEr1r7L.png",
    "enabled": true,
    "order": 121
  },
  {
    "id": "in-dangaltv-in-sd",
    "name": "Dangal TV (720p)",
    "url": "https://live-dangal.akamaized.net/liveabr/playlist.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_DANGAL/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 122
  },
  {
    "id": "in-darshan24-in-sd",
    "name": "Darshan 24 (576p)",
    "url": "https://mumt05.tangotv.in/87NeALx2DARSHAN24/index.m3u8",
    "category": "Religious",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Darshan_24.png",
    "enabled": true,
    "order": 123
  },
  {
    "id": "in-darshanatv-in-sd",
    "name": "Darshana TV (576p)",
    "url": "https://mumt04.tangotv.in/m18aqlK4DARSHANATV/index.m3u8",
    "category": "Entertainment",
    "logo": "https://dtil.tmsimg.com/assets/s142774_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 124
  },
  {
    "id": "in-ddarunprabha-in-sd",
    "name": "DD Arun Prabha (360p)",
    "url": "https://d2lk5u59tns74c.cloudfront.net/out/v1/308556d9fd1246adb479ef012a39bbfe/index.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_DD_ARUNPRABHA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 125
  },
  {
    "id": "in-ddassam-in-sd",
    "name": "DD Assam (504p)",
    "url": "https://d2lk5u59tns74c.cloudfront.net/out/v1/d380bf5c167b4319a46cdd8204bc26b2/index.m3u8",
    "category": "General",
    "logo": "https://dtil.tmsimg.com/assets/s142777_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 126
  },
  {
    "id": "in-ddbangla-in-sd",
    "name": "DD Bangla (504p)",
    "url": "https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/7ff57cc9046b4c188b51a0d506f36e7f/index.m3u8",
    "category": "General",
    "logo": "https://dtil.tmsimg.com/assets/s142778_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 127
  },
  {
    "id": "in-ddbharati-in-sd",
    "name": "DD Bharati (720p)",
    "url": "https://cdn.pishow.tv/ott/live/10/master.m3u8",
    "category": "General",
    "logo": "https://i.imgur.com/4tfUIEo.png",
    "enabled": true,
    "order": 128
  },
  {
    "id": "in-ddbihar-in-sd",
    "name": "DD Bihar (720p)",
    "url": "https://cdn.pishow.tv/ott/live/35/master.m3u8",
    "category": "General",
    "logo": "https://i.imgur.com/C7KQiZI.png",
    "enabled": true,
    "order": 129
  },
  {
    "id": "in-ddchandana-in-sd",
    "name": "DD Chandana (504p)",
    "url": "https://d2lk5u59tns74c.cloudfront.net/out/v1/0c980455d2fb4b69bcc6235745ee6039/index.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_DD_CHANDANA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 130
  },
  {
    "id": "in-ddchhattisgarh-in-sd",
    "name": "DD Chhattisgarh (720p)",
    "url": "https://cdn.pishow.tv/ott/live/15/master.m3u8",
    "category": "General",
    "logo": "https://i.imgur.com/zBg6Iuv.png",
    "enabled": true,
    "order": 131
  },
  {
    "id": "in-ddgirnar-in-sd",
    "name": "DD Girnar (504p)",
    "url": "https://d2lk5u59tns74c.cloudfront.net/out/v1/558fdb9aebb54bb5bbbf0ced03686148/index.m3u8",
    "category": "General",
    "logo": "https://dtil.tmsimg.com/assets/s142782_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 132
  },
  {
    "id": "in-ddgoa-in-sd",
    "name": "DD Goa (504p)",
    "url": "https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/e5b9db1cc184406bb97159da2f120f91/index.m3u8",
    "category": "General",
    "logo": "https://ltsk-cdn.s3.eu-west-1.amazonaws.com/jumpstart/Temp_Live/cdn/HLS/Channel/transparentImages/DD-Goa-Logo_2000_X_1125_Transpharent.png",
    "enabled": true,
    "order": 133
  },
  {
    "id": "in-ddharyana-in-sd",
    "name": "DD Haryana (504p)",
    "url": "https://d2lk5u59tns74c.cloudfront.net/out/v1/950fc69666474351bde0a32b9600c804/index.m3u8",
    "category": "General",
    "logo": "https://ltsk-cdn.s3.eu-west-1.amazonaws.com/jumpstart/Temp_Live/cdn/HLS/Channel/transparentImages/DD-Haryana-Logo_2000_X_1125_Transpharent.png",
    "enabled": true,
    "order": 134
  },
  {
    "id": "in-ddhimachalpradesh-in-sd",
    "name": "DD Himachal Pradesh (504p)",
    "url": "https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/afd2e335b0ba40eb9bdf1096118c6ede/index.m3u8",
    "category": "General",
    "logo": "https://dtil.tmsimg.com/assets/s142785_ld_h9_aa.png?lock=720x540",
    "enabled": true,
    "order": 135
  },
  {
    "id": "in-ddindia-in-sd",
    "name": "DD India (1080p)",
    "url": "https://mumbai-edge.smartplaytv.in/DDIndia/index.m3u8",
    "category": "General",
    "logo": "https://dtil.tmsimg.com/assets/s158251_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 136
  },
  {
    "id": "in-ddjharkhand-in-sd",
    "name": "DD Jharkhand (504p)",
    "url": "https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/e8c3741f8c154d3185831f4e31777fb2/index.m3u8",
    "category": "General",
    "logo": "https://dtil.tmsimg.com/assets/s142787_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 137
  },
  {
    "id": "in-ddkashir-in-sd",
    "name": "DD Kashir (504p)",
    "url": "https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/8a59a828e80c49d0958925950cec0204/index.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_DD_KASHIR/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 138
  },
  {
    "id": "in-ddkisan-in-sd",
    "name": "DD Kisan (1080p)",
    "url": "https://mumbai-edge.smartplaytv.in/DDKisan/index.m3u8",
    "category": "Education",
    "logo": "https://i.imgur.com/x56WJEa.png",
    "enabled": true,
    "order": 139
  },
  {
    "id": "in-ddmadhyapradesh-in-sd",
    "name": "DD Madhya Pradesh (720p)",
    "url": "https://mumbai-edge.smartplaytv.in/ddmadhyapradesh/index.m3u8",
    "category": "General",
    "logo": "https://dtil.tmsimg.com/assets/s142790_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 140
  },
  {
    "id": "in-ddmalayalam-in-sd",
    "name": "DD Malayalam (504p)",
    "url": "https://d2lk5u59tns74c.cloudfront.net/out/v1/c313674ffced4c9a90f1bba436df2b9b/index.m3u8",
    "category": "Entertainment",
    "logo": "https://i.postimg.cc/BZjmjJJs/DD-Malayalam.png",
    "enabled": true,
    "order": 141
  },
  {
    "id": "in-ddmanipur-in-sd",
    "name": "DD Manipur (504p)",
    "url": "https://d2lk5u59tns74c.cloudfront.net/out/v1/8b75afc6576f450e8f554b6c877681d2/index.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_DD_IMPHAL/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 142
  },
  {
    "id": "in-ddmeghalaya-in-sd",
    "name": "DD Meghalaya (504p)",
    "url": "https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/4f81bc8d13dd49b484da35988abb8729/index.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_DD_SHILLONG/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 143
  },
  {
    "id": "in-ddmizoram-in-sd",
    "name": "DD Mizoram (504p)",
    "url": "https://d2lk5u59tns74c.cloudfront.net/out/v1/eea48c6b61074052a2fa8532ff795ff1/index.m3u8",
    "category": "General",
    "logo": "https://i.imgur.com/I5zT1DG.png",
    "enabled": true,
    "order": 144
  },
  {
    "id": "in-ddnagaland-in-sd",
    "name": "DD Nagaland (504p)",
    "url": "https://d2lk5u59tns74c.cloudfront.net/out/v1/29c92e0bef954a6d9b0908d1be29c1f0/index.m3u8",
    "category": "General",
    "logo": "https://i.imgur.com/HUL4aF6.png",
    "enabled": true,
    "order": 145
  },
  {
    "id": "in-ddnational-in-sd",
    "name": "DD National (576p)",
    "url": "http://107.167.16.138/ddnational/index.m3u8?token=test",
    "category": "Entertainment",
    "logo": "https://ltsk-cdn.s3.eu-west-1.amazonaws.com/jumpstart/Temp_Live/cdn/HLS/Channel/transparentImages/DD%20National.png",
    "enabled": true,
    "order": 146
  },
  {
    "id": "in-ddnational-in-hd",
    "name": "DD National HD (1080p)",
    "url": "https://mumbai-edge.smartplaytv.in/DDNational/index.m3u8",
    "category": "Entertainment",
    "logo": "https://ltsk-cdn.s3.eu-west-1.amazonaws.com/jumpstart/Temp_Live/cdn/HLS/Channel/transparentImages/DD%20National.png",
    "enabled": true,
    "order": 147
  },
  {
    "id": "in-ddnews-in-sd",
    "name": "DD News (1080p)",
    "url": "https://mumbai-edge.smartplaytv.in/DDNews/index.m3u8",
    "category": "News",
    "logo": "https://ltsk-cdn.s3.eu-west-1.amazonaws.com/jumpstart/Temp_Live/cdn/HLS/Channel/transparentImages/DD%20News%20HD.png",
    "enabled": true,
    "order": 148
  },
  {
    "id": "in-ddnews-in-hd",
    "name": "DD News HD (1080p)",
    "url": "https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/0811cd8c37ca4c409d5385a6cd2fa18b/index.m3u8",
    "category": "News",
    "logo": "https://ltsk-cdn.s3.eu-west-1.amazonaws.com/jumpstart/Temp_Live/cdn/HLS/Channel/transparentImages/DD%20News%20HD.png",
    "enabled": true,
    "order": 149
  },
  {
    "id": "in-ddodia-in-sd",
    "name": "DD Odia (576p)",
    "url": "https://mumbai-edge.smartplaytv.in/ddodiya/index.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_DD_ORIYA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 150
  },
  {
    "id": "in-ddpunjabi-in-sd",
    "name": "DD Punjabi (504p)",
    "url": "https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/da821c24a59d4e57960497aeaca8fb33/index.m3u8",
    "category": "General",
    "logo": "https://dtil.tmsimg.com/assets/s142800_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 151
  },
  {
    "id": "in-ddrajasthan-in-sd",
    "name": "DD Rajasthan (720p)",
    "url": "https://cdn.pishow.tv/ott/live/34/master.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_DD_RAJASTHAN/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 152
  },
  {
    "id": "in-ddsahyadri-in-sd",
    "name": "DD Sahyadri (504p)",
    "url": "https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/66dcc3ebe182447ba42837e746cf0c7c/index.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_DD_SAHYADRI/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 153
  },
  {
    "id": "in-ddsaptagiri-in-sd",
    "name": "DD Saptagiri (504p)",
    "url": "https://d2lk5u59tns74c.cloudfront.net/out/v1/26e915d6d12b4a06822c5e33c088ed56/index.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_DD_SAPTAGIRI/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 154
  },
  {
    "id": "in-ddsports-in-hd",
    "name": "DD Sports (720p)",
    "url": "https://mumbai-edge.smartplaytv.in/DDSportsHD/index.m3u8",
    "category": "Sports",
    "logo": "https://dtil.tmsimg.com/assets/s158255_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 155
  },
  {
    "id": "in-ddsports-in-sd",
    "name": "DD Sports SD (1080p)",
    "url": "https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/b17adfe543354fdd8d189b110617cddd/index.m3u8",
    "category": "Sports",
    "logo": "https://dtil.tmsimg.com/assets/s158255_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 156
  },
  {
    "id": "in-ddtamil-in-hd",
    "name": "DD Tamil HD (1080p)",
    "url": "https://cdn.pishow.tv/ott/live/1737/master.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_DD_TAMIL/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 157
  },
  {
    "id": "in-ddtripura-in-sd",
    "name": "DD Tripura (504p)",
    "url": "https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/52b998e9510d41c29ad2ceca8ea3d849/index.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_DD_TRIPURA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 158
  },
  {
    "id": "in-ddurdu-in-sd",
    "name": "DD Urdu (720p)",
    "url": "https://cdn.pishow.tv/ott/live/8/master.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_DD_URDU/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 159
  },
  {
    "id": "in-dduttarpradesh-in-sd",
    "name": "DD Uttar Pradesh (720p)",
    "url": "https://cdn.pishow.tv/ott/live/36/master.m3u8",
    "category": "General",
    "logo": "https://dtil.tmsimg.com/assets/s142807_ld_h9_ab.png?lock=720x540",
    "enabled": true,
    "order": 160
  },
  {
    "id": "in-dduttarakhand-in-sd",
    "name": "DD Uttarakhand (720p)",
    "url": "https://cdn.pishow.tv/ott/live/17/master.m3u8",
    "category": "General",
    "logo": "https://dtil.tmsimg.com/assets/s142809_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 161
  },
  {
    "id": "in-ddyadagiri-in-sd",
    "name": "DD Yadagiri (576p)",
    "url": "https://cdn.pishow.tv/ott/live/21/master.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_DD_YADAGIRI/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 162
  },
  {
    "id": "in-deewanahd-in-sd",
    "name": "Deewana HD (540p)",
    "url": "https://live20.bozztv.com/giatvplayout7/giatv-209592/index.m3u8",
    "category": "Music",
    "logo": "https://i.imgur.com/xIYITQ9.png",
    "enabled": true,
    "order": 163
  },
  {
    "id": "in-desichannel-in-sd",
    "name": "Desi Channel (720p)",
    "url": "https://livestream.unlimitedcdn.com/agm-dc/desi-channel/index.m3u8",
    "category": "Entertainment",
    "logo": "https://desichannel.in/wp-content/uploads/2025/01/desi-channel.png",
    "enabled": true,
    "order": 164
  },
  {
    "id": "in-dhamaal-in-sd",
    "name": "Dhamaal (576p)",
    "url": "http://107.167.16.138/dhamaal/index.m3u8?token=test",
    "category": "Music",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Dhamaal_TV.png",
    "enabled": true,
    "order": 165
  },
  {
    "id": "in-dharsantv-in-sd",
    "name": "Dharsan TV (720p)",
    "url": "https://cable91tataplay.akamaized.net/live/dharshantv/index.m3u8",
    "category": "Religious",
    "logo": "https://play-lh.googleusercontent.com/brn76ZzRlqS8ylZVVcc5ZFWcqUp36iJ82WyzwiQ8-Nqi_8pIZZ_gsMCXNn6YiLhOEQ",
    "enabled": true,
    "order": 166
  },
  {
    "id": "in-dheerantv-in-sd",
    "name": "Dheeran TV (576p)",
    "url": "https://live.we2live.in/dheerantv/dheerantv/playlist.m3u8",
    "category": "Religious",
    "logo": "https://i.imgur.com/jSedjXf.png",
    "enabled": true,
    "order": 167
  },
  {
    "id": "in-dhooltv-in-sd",
    "name": "Dhool TV (576p)",
    "url": "https://d1msejlow1t3l4.cloudfront.net/fta/subhartitv/playlist.m3u8",
    "category": "Music",
    "logo": "https://i.ibb.co/Rk78p2LB/dhooltv.png",
    "enabled": true,
    "order": 168
  },
  {
    "id": "in-dhoommusic-in-sd",
    "name": "Dhoom Music (720p)",
    "url": "https://cdn.pishow.tv/ott/live/1456/master.m3u8",
    "category": "Music",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_DHOOM_MUSIC/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 169
  },
  {
    "id": "in-dishatv-in-sd",
    "name": "Disha TV (396p)",
    "url": "https://d1msejlow1t3l4.cloudfront.net/fta/dishatv/playlist.m3u8",
    "category": "General",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Disha_tv.png",
    "enabled": true,
    "order": 170
  },
  {
    "id": "in-disneyinternationalhd-in-sd",
    "name": "Disney International HD (576p)",
    "url": "http://103.151.60.162:2122/play/a018/index.m3u8?hls",
    "category": "Kids",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_DISNEY_INTERNATIONAL_HD/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 171
  },
  {
    "id": "in-disneyjunior-in-sd",
    "name": "Disney Junior (India) (576p)",
    "url": "http://103.151.60.162:2122/play/a016/index.m3u8?hls",
    "category": "Kids",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_DISNEY_JUNIOR/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 172
  },
  {
    "id": "in-divyavanitv-in-sd",
    "name": "Divyavani TV (576p)",
    "url": "https://mumbai-edge.smartplaytv.in/Divyavani/index.m3u8",
    "category": "Religious",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Divya_Vani.png",
    "enabled": true,
    "order": 173
  },
  {
    "id": "in-docubaytv-in-sd",
    "name": "DocuBay TV (1080p)",
    "url": "https://cc-mgr91yrk4pehy.akamaized.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-mgr91yrk4pehy/playlist.m3u8",
    "category": "Documentary",
    "logo": "https://i.imgur.com/OGyeLLR.png",
    "enabled": true,
    "order": 174
  },
  {
    "id": "in-dy365-in-sd",
    "name": "DY 365 (360p)",
    "url": "https://cdn.smartstream.video/smartstream-us/dy365/dy365/playlist.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s143015_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 175
  },
  {
    "id": "in-e24-in-sd",
    "name": "E 24 (576p)",
    "url": "https://mumt04.tangotv.in/m18aqlK4E24/index.m3u8",
    "category": "Entertainment",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_E24/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 176
  },
  {
    "id": "in-ekamrabharatodia-in-sd",
    "name": "Ekamra Bharat Odia (400p)",
    "url": "https://live.ekamraott.com/bharat/bharat/index.m3u8",
    "category": "News",
    "logo": "https://jiotv.catchup.cdn.jio.com/dare_images/images/Ekamra_Bharat_Odia.png",
    "enabled": true,
    "order": 177
  },
  {
    "id": "in-enterr10bangla-in-sd",
    "name": "Enterr 10 Bangla (720p)",
    "url": "https://amg01448-samsungin-enterr10bangla-samsungin-ad-gg.amagi.tv/playlist/amg01448-samsungin-enterr10bangla-samsungin/playlist.m3u8",
    "category": "Entertainment",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_ENTERR10_BANGLA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 178
  },
  {
    "id": "in-epicbharat-in-sd",
    "name": "Epic Bharat (576p)",
    "url": "https://mumt06.tangotv.in/qYyB8fXVEPICTV/index.m3u8",
    "category": "Entertainment",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG0032BW6T.png?lock=720x540",
    "enabled": true,
    "order": 179
  },
  {
    "id": "in-epicbharat-in-digital",
    "name": "Epic Bharat Digital (1080p)",
    "url": "https://cc-p1izg43bk7sj5.akamaized.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-p1izg43bk7sj5/DIYC/PMSL/IN10/Nazara_IN_B/Nazara_IN_B.m3u8",
    "category": "Entertainment",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG0032BW6T.png?lock=720x540",
    "enabled": true,
    "order": 180
  },
  {
    "id": "in-epicbhojpuri-in-sd",
    "name": "Epic Bhojpuri (576p)",
    "url": "https://mumt01.tangotv.in/O5aw8Zn3EPICBHOJPURI/index.m3u8",
    "category": "Movies",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG0032BVJ8.png?lock=720x540",
    "enabled": true,
    "order": 181
  },
  {
    "id": "in-epicbhojpuri-in-digital",
    "name": "Epic Bhojpuri Digital (1080p)",
    "url": "https://cc-8hy4a26pz2uos.akamaized.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-8hy4a26pz2uos/playlist.m3u8",
    "category": "Movies",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG0032BVJ8.png?lock=720x540",
    "enabled": true,
    "order": 182
  },
  {
    "id": "in-epiccrimes-in-sd",
    "name": "Epic Crimes (1080p)",
    "url": "https://cc-wsuyg2uxeak04.akamaized.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-wsuyg2uxeak04/master.m3u8",
    "category": "Documentary",
    "logo": "https://i.imgur.com/a5kaqDc.png",
    "enabled": true,
    "order": 183
  },
  {
    "id": "in-epickids-in-digital",
    "name": "Epic Kids Digital (1080p)",
    "url": "https://cc-t8lqe1o99pszu.akamaized.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-t8lqe1o99pszu/playlist.m3u8",
    "category": "Kids",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_GUBBARE/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 184
  },
  {
    "id": "in-epicmusic-in-sd",
    "name": "Epic Music (576p)",
    "url": "https://mumt04.tangotv.in/m18aqlK4EPICMUSIC/index.m3u8",
    "category": "Music",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SHOWBOX/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 185
  },
  {
    "id": "in-epicmusic-in-digital",
    "name": "Epic Music Digital (1080p)",
    "url": "https://cc-3cyxq80qusspd.akamaized.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-3cyxq80qusspd/playlist.m3u8",
    "category": "Music",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SHOWBOX/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 186
  },
  {
    "id": "in-epicparivar-in-sd",
    "name": "Epic Parivar (576p)",
    "url": "http://103.151.60.162:2122/play/a01p/index.m3u8?hls",
    "category": "Entertainment",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG0032BVZH.png?lock=720x540",
    "enabled": true,
    "order": 187
  },
  {
    "id": "in-epictv-in-digital",
    "name": "Epic TV Digital (1080p)",
    "url": "https://cc-czbq30x55knit.akamaized.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-czbq30x55knit/DIYC/PMSL/IN10/Epic_TV_IN_B/Epic_TV_IN_B.m3u8",
    "category": "Entertainment",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_EPIC/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 188
  },
  {
    "id": "in-etnow-in-sd",
    "name": "ET Now (720p) [Geo-blocked]",
    "url": "https://dztlhgid9me95.cloudfront.net/live-tv/Vidgyor/etnow/etnow_master.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_ET_NOW/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 189
  },
  {
    "id": "in-etvbalbharat-in-sd",
    "name": "ETV Bal Bharat (576p)",
    "url": "http://103.185.24.134:3001/ETV-BAL-BHARAT/index.m3u8",
    "category": "Kids",
    "logo": "https://i.imgur.com/zsTxPV9.png",
    "enabled": true,
    "order": 190
  },
  {
    "id": "in-etvbeats-in-hd",
    "name": "ETV Beats (1080p)",
    "url": "https://jmp2.uk/stvp-IN4900002RV",
    "category": "Music",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/ETVBeats1.png",
    "enabled": true,
    "order": 191
  },
  {
    "id": "in-etvcinema-in-sd",
    "name": "ETV Cinema (396p)",
    "url": "https://yupplivegcpusa.yuppcdn.net/100823/smil:etvcinema.smil/playlist.m3u8?hdnts=st=1735898689~exp=1835898688~acl=*~hmac=f5fe24724fe05481e3841f9eb5ab8efdee0a3dd83645ae9dcf45703f525bab7b",
    "category": "Movies",
    "logo": "https://dtil.tmsimg.com/assets/s143026_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 192
  },
  {
    "id": "in-etvcomedy-in-hd",
    "name": "ETV Comedy (1080p)",
    "url": "https://cc-wie8j8y69d2uy.akamaized.net/WWBI/Amagi/ETV_Comedy_IN/playlist.m3u8",
    "category": "Entertainment",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/ETV_Comedy.png",
    "enabled": true,
    "order": 193
  },
  {
    "id": "in-etvjosh-in-hd",
    "name": "ETV Josh (1080p)",
    "url": "https://cc-uyh1ow5zouoio.akamaized.net/WWBI/Amagi/ETV_Josh_IN/playlist.m3u8",
    "category": "Entertainment",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/ETV_Josh.png",
    "enabled": true,
    "order": 194
  },
  {
    "id": "in-etvnews-in-hd",
    "name": "ETV News (1080p)",
    "url": "https://cc-3448kp65yhc5w.akamaized.net/WWBI/Amagi/ETV_News_IN/playlist.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/ETV_News.png",
    "enabled": true,
    "order": 195
  },
  {
    "id": "in-etvplus-in-sd",
    "name": "ETV Plus (396p)",
    "url": "https://yupplivegcpusa.yuppcdn.net/100823/smil:etvplus.smil/playlist.m3u8?hdnts=st=1735898689~exp=1835898688~acl=*~hmac=f5fe24724fe05481e3841f9eb5ab8efdee0a3dd83645ae9dcf45703f525bab7b",
    "category": "Entertainment",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_ETV_PLUS/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 196
  },
  {
    "id": "in-faktmarathi-in-sd",
    "name": "Fakt Marathi (576p)",
    "url": "https://mumt07.tangotv.in/zHjX9OFlFAKTMARATHI/index.m3u8",
    "category": "Entertainment",
    "logo": "https://dtil.tmsimg.com/assets/s143038_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 197
  },
  {
    "id": "in-fast1-in-sd",
    "name": "Fast1 (576p)",
    "url": "https://cdn.pishow.tv/ott/live/10008/master.m3u8",
    "category": "General",
    "logo": "https://papaji.freetvindia.com/media/channels/fast1.png",
    "enabled": true,
    "order": 198
  },
  {
    "id": "in-fatehtv-in-sd",
    "name": "Fateh TV (576p)",
    "url": "https://cdn.pishow.tv/ott/live/349/master.m3u8",
    "category": "Religious",
    "logo": "https://i.imgur.com/c4ItNkB.png",
    "enabled": true,
    "order": 199
  },
  {
    "id": "in-firstindianews-in-sd",
    "name": "First India News (576p)",
    "url": "https://mumt03.tangotv.in/Dsly5z3H1STINDIANEWS/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_FIRST_INDIA_NEWS_RAJASTHAN/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 200
  },
  {
    "id": "in-foodfood-in-sd",
    "name": "Food Food (576p)",
    "url": "https://mumt03.tangotv.in/Dsly5z3HFOODFOOD/index.m3u8",
    "category": "General",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Food_Food.png",
    "enabled": true,
    "order": 201
  },
  {
    "id": "in-friendstv-in-sd",
    "name": "Friends TV (1080p)",
    "url": "https://server.playontv.in/friendstv/index.m3u8",
    "category": "Entertainment",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Friends_TV.png",
    "enabled": true,
    "order": 202
  },
  {
    "id": "in-gangaurtv-in-sd",
    "name": "Gangaur TV (1080p)",
    "url": "https://pbgangaur.wiseplayout.com/Gangaur/master.m3u8",
    "category": "Entertainment",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Gangaur.png",
    "enabled": true,
    "order": 203
  },
  {
    "id": "in-gaundapunjabtv-ca-sd",
    "name": "Gaunda Punjab TV (720p)",
    "url": "http://cdn6.live247stream.com/gaundapunjab/tv/playlist.m3u8",
    "category": "General",
    "logo": "https://i.imgur.com/ArRZRM3.png",
    "enabled": true,
    "order": 204
  },
  {
    "id": "in-globalpunjab-in-sd",
    "name": "Global Punjab (1080p)",
    "url": "https://server.livelegitpro.in/globalpunjab/globalpunjab/index.m3u8",
    "category": "News",
    "logo": "https://i.imgur.com/WDLqcWW.png",
    "enabled": true,
    "order": 205
  },
  {
    "id": "in-goldmines2-in-sd",
    "name": "Goldmines 2 (576p)",
    "url": "https://mumt03.tangotv.in/Dsly5z3HGOLDMINES2/index.m3u8",
    "category": "Movies",
    "enabled": true,
    "order": 206
  },
  {
    "id": "in-goldmines-in-sd",
    "name": "Goldmines (576p)",
    "url": "https://streams.tangotv.in/GOLDMINES/ORIGIN/index.m3u8",
    "category": "Movies",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_GOLDMINES/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 207
  },
  {
    "id": "in-goldminesaction-in-sd",
    "name": "Goldmines Action (576p)",
    "url": "https://mumt03.tangotv.in/Dsly5z3HGOLDMINESACTION/index.m3u8",
    "category": "Movies",
    "logo": "https://yt3.googleusercontent.com/_X6U6bMLF-pTu5wBMFwsSI6aubGrXk2B0kUKdGiLIMqFLyDIne4Ot4ro76BS1S8fX3pWcCwS=s900-c-k-c0x00ffffff-no-rj",
    "enabled": true,
    "order": 208
  },
  {
    "id": "in-goldminesbollywood-in-sd",
    "name": "Goldmines Bollywood (576p)",
    "url": "https://mumt03.tangotv.in/Dsly5z3HGOLDMINESBOLLYWOOD/index.m3u8",
    "category": "Movies",
    "logo": "https://i.imgur.com/6mNQ9mM.png",
    "enabled": true,
    "order": 209
  },
  {
    "id": "in-goodnewstoday-in-sd",
    "name": "Good News Today (720p)",
    "url": "https://aajtaklive.vgcdn.net/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/3196cced-ce29-4219-9809-f07ccdaa02b9/vglive-sk-848805/master.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_GOOD_NEWS_TODAY/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 210
  },
  {
    "id": "in-goodnesstv-in-sd",
    "name": "Goodness TV (576p)",
    "url": "https://mumt07.tangotv.in/zHjX9OFlGOODNESSTV/index.m3u8",
    "category": "Religious",
    "logo": "https://dtil.tmsimg.com/assets/s143091_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 211
  },
  {
    "id": "in-goodnewstv-in-sd",
    "name": "GoodNews TV (720p)",
    "url": "https://bpgdlwwar3ze-hls-live.wmncdn.net/goodnews/live.stream/playlist.m3u8",
    "category": "Religious",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_GOODNEWS_TV/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 212
  },
  {
    "id": "in-gospeltvindia-in-sd",
    "name": "Gospel TV India (576p)",
    "url": "https://server.livelegitpro.in:9899/gospeltv/index.m3u8",
    "category": "Religious",
    "logo": "https://i.ibb.co/xhbZvzt/cropped-final-logo-300x127.png",
    "enabled": true,
    "order": 213
  },
  {
    "id": "in-gstv-in-sd",
    "name": "GS TV (576p)",
    "url": "https://mumt05.tangotv.in/87NeALx2GSTV/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/GS_TV.png",
    "enabled": true,
    "order": 214
  },
  {
    "id": "in-gtcnews-in-sd",
    "name": "GTC News (1080p)",
    "url": "https://vglivessai.akamaized.net/sg/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/921cca59-daee-4f89-8c38-7ffe8de44f4c/index.m3u8",
    "category": "News",
    "logo": "https://www.thegtcnetwork.com/gtc-news.png",
    "enabled": true,
    "order": 215
  },
  {
    "id": "in-gtcpunjabi-in-sd",
    "name": "GTC Punjabi (1080p)",
    "url": "https://gtc-yupp.vgcdn.net/vglive-sk-254807/index.m3u8",
    "category": "Entertainment",
    "logo": "https://media.thegtcnetwork.com/uploads/gtc-pujabin-s.jpg",
    "enabled": true,
    "order": 216
  },
  {
    "id": "in-guaranteenews-in-sd",
    "name": "Guarantee News (1080p)",
    "url": "https://guaranteenews.in:8443/live/gnews/index.m3u8",
    "category": "News",
    "logo": "https://media.licdn.com/dms/image/v2/D560BAQHYZzbGJ7ViZA/company-logo_200_200/company-logo_200_200/0/1728031377890?e=2147483647&v=beta&t=bIsZgNUCcg0M_-Zqeu5wKYgBt_1-pI798X9lP5CxhTM",
    "enabled": true,
    "order": 217
  },
  {
    "id": "in-gujaratfirst-in-sd",
    "name": "Gujarat First (576p)",
    "url": "https://mumt03.tangotv.in/Dsly5z3HGUJARATFIRST/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Gujarat_First_24x7.png",
    "enabled": true,
    "order": 218
  },
  {
    "id": "in-gyandarshan-in-sd",
    "name": "Gyandarshan (720p)",
    "url": "https://cdn.pishow.tv/ott/live/14/master.m3u8",
    "category": "Education",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_GYANDARSHAN/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 219
  },
  {
    "id": "in-gyandarshan-in-hd",
    "name": "Gyandarshan HD (576p)",
    "url": "https://mumt05.tangotv.in/87NeALx2GYANDARSHAN/index.m3u8",
    "category": "Education",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_GYANDARSHAN/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 220
  },
  {
    "id": "in-hamdardtv-ca-sd",
    "name": "Hamdard TV (1080p)",
    "url": "https://tv.hamdardtv.com/hamdard/index.m3u8",
    "category": "News",
    "logo": "https://i.ibb.co/JcD2xck/logo-hamda.png",
    "enabled": true,
    "order": 221
  },
  {
    "id": "in-harekrsnatv-in-sd",
    "name": "Hare Krsna TV (1080p)",
    "url": "https://hktv.harekrsnatv.com/HKTV/HKWebApp/manifest.mpd",
    "category": "Religious",
    "logo": "https://dtil.tmsimg.com/assets/s143102_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 222
  },
  {
    "id": "in-harvesttvkeralam-in-sd",
    "name": "Harvest TV Keralam (720p)",
    "url": "https://7mbd4ogkr3gx-hls-live.wmncdn.net/harvestenglish/d1796a22d24e8696c7d5d0b5c349fdd2.sdp/index.m3u8",
    "category": "Religious",
    "logo": "https://i.imgur.com/1DyPuIt.png",
    "enabled": true,
    "order": 223
  },
  {
    "id": "in-harvestusa-in-sd",
    "name": "Harvest USA (576p)",
    "url": "https://7mbd4ogkr3gx-hls-live.wmncdn.net/harvestusa/d57ffba6564caea2fee3f4085f19a098.sdp/playlist.m3u8",
    "category": "Religious",
    "enabled": true,
    "order": 224
  },
  {
    "id": "in-headlinestripura-in-sd",
    "name": "Headlines Tripura (720p)",
    "url": "https://distro.ottlive.co.in/headlinestripura/headlinestripura/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Headlines_Tripura.png",
    "enabled": true,
    "order": 225
  },
  {
    "id": "in-hebrontv-in-sd",
    "name": "Hebron TV (1080p)",
    "url": "https://account20.livebox.co.in/charleshls/live.m3u8",
    "category": "Religious",
    "logo": "https://i0.wp.com/hebrontv.in/wp-content/uploads/2023/11/hebron-.png?w=512",
    "enabled": true,
    "order": 226
  },
  {
    "id": "in-hidost-in-sd",
    "name": "Hi Dost! (720p)",
    "url": "https://cdn.pishow.tv/ott/live/224/master.m3u8",
    "category": "Entertainment",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Hi_Dost.png",
    "enabled": true,
    "order": 227
  },
  {
    "id": "in-highnews-in-sd",
    "name": "High News (480p)",
    "url": "https://highmedia.livebox.co.in/HIGHNEWShls/LIVE.m3u8",
    "category": "News",
    "logo": "https://pbs.twimg.com/profile_images/1104268476858937351/USUT4ykS_400x400.png",
    "enabled": true,
    "order": 228
  },
  {
    "id": "in-hindikhabar-in-sd",
    "name": "Hindi Khabar (1080p)",
    "url": "https://stream.ottlive.co.in/hindikhabar/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_HINDI_KHABAR/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 229
  },
  {
    "id": "in-historytv18-in-sd",
    "name": "History TV18 (576p)",
    "url": "http://103.151.60.162:2122/play/a00y/index.m3u8?hls",
    "category": "Documentary",
    "logo": "https://dtil.tmsimg.com/assets/s143132_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 230
  },
  {
    "id": "in-hmtv-in-sd",
    "name": "HMTV (India) (720p)",
    "url": "https://cdn.pishow.tv/ott/live/280/master.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s143136_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 231
  },
  {
    "id": "in-hnn24x7-in-sd",
    "name": "HNN 24x7 (576p)",
    "url": "https://ott.livelegitpro.in:9899/hnnnews/hnnnews/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/HNN24x7.png",
    "enabled": true,
    "order": 232
  },
  {
    "id": "in-hopechannelindia-in-sd",
    "name": "Hope Channel India (576p)",
    "url": "https://mumt01.tangotv.in/O5aw8Zn3HOPECHANNELINDIA/index.m3u8",
    "category": "Religious",
    "logo": "https://i.imgur.com/wPzPUrK.png",
    "enabled": true,
    "order": 233
  },
  {
    "id": "in-hornbilltv-in-sd",
    "name": "Hornbill TV (576p)",
    "url": "https://mumt01.tangotv.in/O5aw8Zn3HORNBILLTV/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_HORNBILL/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 234
  },
  {
    "id": "in-hosannatv-in-tamil",
    "name": "Hosanna TV",
    "url": "https://asia.mslivestream.net/mslive/bfba54c5c96a6359e2da0ca35f4998af.sdp/playlist.m3u8",
    "category": "Religious",
    "logo": "https://i.imgur.com/VYorU1L.png",
    "enabled": true,
    "order": 235
  },
  {
    "id": "in-hosannatv-in-global",
    "name": "Hosanna TV Global",
    "url": "https://ktismaservers.in:3349/live/hosannatvlive.m3u8",
    "category": "Religious",
    "logo": "https://i.imgur.com/VYorU1L.png",
    "enabled": true,
    "order": 236
  },
  {
    "id": "in-hungamatv-in-sd",
    "name": "Hungama TV (576p)",
    "url": "http://103.185.24.134:3001/HUNGAMA/index.m3u8",
    "category": "Kids",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_HUNGAMA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 237
  },
  {
    "id": "in-hydertv-ca-sd",
    "name": "Hyder TV (720p)",
    "url": "https://cdn.live247stream.com/hyder/tv/playlist.m3u8",
    "category": "General",
    "logo": "https://i.imgur.com/reHjjRZ.png",
    "enabled": true,
    "order": 238
  },
  {
    "id": "in-ibc24-in-sd",
    "name": "IBC 24 (576p)",
    "url": "https://mumt05.tangotv.in/87NeALx2IBC24/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_IBC24/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 239
  },
  {
    "id": "in-indiaahead-in-sd",
    "name": "India Ahead (576p)",
    "url": "https://mumt05.tangotv.in/87NeALx2INDIAAHEAD/index.m3u8",
    "category": "News",
    "logo": "https://i.imgur.com/hBkTmf9.png",
    "enabled": true,
    "order": 240
  },
  {
    "id": "in-indiadailylive-in-sd",
    "name": "India Daily Live (1080p)",
    "url": "https://indiadaily.ottlive.co.in/indiadailylive/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/India_Daily_24x7.png",
    "enabled": true,
    "order": 241
  },
  {
    "id": "in-indiatoday-in-sd",
    "name": "India Today (720p)",
    "url": "https://d1rc86nwwc9fag.cloudfront.net/vglive-sk-293160/master.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_INDIA_TODAY/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 242
  },
  {
    "id": "in-indiatv-in-sd",
    "name": "India TV (720p)",
    "url": "https://pl-indiatvnews.akamaized.net/out/v1/db79179b608641ceaa5a4d0dd0dca8da/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_INDIA_TV/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 243
  },
  {
    "id": "in-indiatvaapkiadalat-in-sd",
    "name": "India TV Aap Ki Adalat (1080p) [Geo-blocked]",
    "url": "https://amg01550-amg01550c6-samsung-in-4679.playouts.now.amagi.tv/playlist/amg01550-indiatvfast-indiatvakasamsung-samsungin/playlist.m3u8",
    "category": "Documentary",
    "logo": "https://play-lh.googleusercontent.com/2IlBX3IQHna8g4g-56vwGWb14K38spcviIh3i7uJCJ32ydfhcKZdOsacgijPkPeerEA",
    "enabled": true,
    "order": 244
  },
  {
    "id": "in-indiatvspeednews-in-hd",
    "name": "India TV Speed News (1080p)",
    "url": "https://cc-lyf4c0hwzg5dd.akamaized.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-lyf4c0hwzg5dd/v1/vglive-sk-479089/main.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_INDIA_TV_SPEED_NEWS/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 245
  },
  {
    "id": "in-indiavoice-in-sd",
    "name": "India Voice (576p)",
    "url": "https://d1msejlow1t3l4.cloudfront.net/fta/indiavoice/playlist.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/India_Voice.png",
    "enabled": true,
    "order": 246
  },
  {
    "id": "in-indywoodtv-in-sd",
    "name": "Indywood TV (720p)",
    "url": "https://43wrzjnpqoxe-hls-live.wmncdn.net/indywood/indywoodtv/index.m3u8",
    "category": "Movies",
    "logo": "https://i.ibb.co/jT3NCPp/logo-tv.png",
    "enabled": true,
    "order": 247
  },
  {
    "id": "in-inews-in-sd",
    "name": "INews (720p)",
    "url": "https://cdn.pishow.tv/ott/live/411/master.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/I_News.png",
    "enabled": true,
    "order": 248
  },
  {
    "id": "in-infast-nl-sd",
    "name": "INFAST (1080p)",
    "url": "https://amg00861-terninternation-lifestyle-samsungau-kdlyy.amagi.tv/playlist/amg00861-terninternation-lifestyle-samsungau/playlist.m3u8",
    "category": "General",
    "logo": "https://i.imgur.com/VwAMqA7.png",
    "enabled": true,
    "order": 249
  },
  {
    "id": "in-inh24x7-in-sd",
    "name": "INH 24x7 (396p)",
    "url": "https://d1msejlow1t3l4.cloudfront.net/fta/inh24x7/playlist.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_INH_24X7/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 250
  },
  {
    "id": "in-insync-in-sd",
    "name": "Insync (576p)",
    "url": "https://mumt04.tangotv.in/m18aqlK4INSYNC/index.m3u8",
    "category": "Music",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Insync.png",
    "enabled": true,
    "order": 251
  },
  {
    "id": "in-inwild-nl-sd",
    "name": "INWILD (1080p)",
    "url": "https://amg00861-terninternation-inwild-samsunguk-w5wic.amagi.tv/playlist/amg00861-terninternation-inwild-samsunguk/playlist.m3u8",
    "category": "Documentary",
    "logo": "https://cdn.uc.assets.prezly.com/92770c71-9d6f-400f-8311-38e9cfec52c2/InWild_landscape-green.png",
    "enabled": true,
    "order": 252
  },
  {
    "id": "in-inwonder-nl-sd",
    "name": "InWonder (1080p)",
    "url": "https://amg00861-terninternation-inwonder-samsungau-1k63k.amagi.tv/playlist/amg00861-terninternation-inwonder-samsungau/playlist.m3u8",
    "category": "Documentary",
    "logo": "https://cdn.uc.assets.prezly.com/f12e798d-6da4-46e1-8ec5-e391d6762659/InWonder_portrait-purple.png",
    "enabled": true,
    "order": 253
  },
  {
    "id": "in-isaiaruvi-in-sd",
    "name": "Isai Aruvi (396p)",
    "url": "https://segment.yuppcdn.net/140622/isaiaruvi/playlist.m3u8",
    "category": "Music",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_ISAI_ARUVI/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 254
  },
  {
    "id": "in-ishwarbhaktitv-in-sd",
    "name": "Ishwar Bhakti TV (720p)",
    "url": "https://6n3yow8pl9ok-hls-live.5centscdn.com/ishwartvlive/tv.stream/playlist.m3u8",
    "category": "Religious",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_ISHWAR_TV/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 255
  },
  {
    "id": "in-jaimaharashtra-in-sd",
    "name": "Jai Maharashtra (576p)",
    "url": "https://d1msejlow1t3l4.cloudfront.net/fta/jaimaharashtra/playlist.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Jai_Maharashtra.png",
    "enabled": true,
    "order": 256
  },
  {
    "id": "in-jaihindtv-in-sd",
    "name": "Jaihind TV (576p)",
    "url": "https://mumt03.tangotv.in/Dsly5z3HJAIHIND/index.m3u8",
    "category": "Entertainment",
    "logo": "https://i.imgur.com/NaiA73p.png",
    "enabled": true,
    "order": 257
  },
  {
    "id": "in-jalshamovies-in-hd",
    "name": "Jalsha Movies HD (1080p)",
    "url": "http://103.185.24.134:3001/JALSHA-MOVIES-HD/index.m3u8",
    "category": "Movies",
    "logo": "https://i.imgur.com/25eWjX2.png",
    "enabled": true,
    "order": 258
  },
  {
    "id": "in-jantv-in-sd",
    "name": "Jan TV (576p)",
    "url": "https://d1msejlow1t3l4.cloudfront.net/fta/jantv/playlist.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_JAN_TV/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 259
  },
  {
    "id": "in-janamtv-in-sd",
    "name": "Janam TV (576p)",
    "url": "https://mumt03.tangotv.in/Dsly5z3HJANAMTV/index.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s143221_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 260
  },
  {
    "id": "in-jantatv-in-sd",
    "name": "Janta TV (1080p)",
    "url": "https://live.jswk.online/IK_RTPM/live/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_JANTA_TV/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 261
  },
  {
    "id": "in-jantantratv-in-sd",
    "name": "Jantantra TV (576p)",
    "url": "https://mumt05.tangotv.in/87NeALx2JANTANTRA/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Jantantra.png",
    "enabled": true,
    "order": 262
  },
  {
    "id": "in-jeevantv-in-sd",
    "name": "Jeevan TV (576p)",
    "url": "https://raw.githubusercontent.com/amazeyourself/adaptive-streams/refs/heads/main/streams/in/YuppTV/JeevanTV.m3u8",
    "category": "General",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Jeevan_TV.png",
    "enabled": true,
    "order": 263
  },
  {
    "id": "in-jinvanichannel-in-sd",
    "name": "Jinvani Channel (720p)",
    "url": "https://cdn.pishow.tv/ott/live/989/master.m3u8",
    "category": "Religious",
    "logo": "https://dtil.tmsimg.com/assets/s143230_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 264
  },
  {
    "id": "in-jonack-in-sd",
    "name": "Jonack (576p)",
    "url": "https://cdn.pishow.tv/ott/live/10006/master.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_JONACK/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 265
  },
  {
    "id": "in-joytv-in-sd",
    "name": "Joy TV (1080p)",
    "url": "https://ktismaservers.in:3412/live/joytvlive.m3u8",
    "category": "Religious",
    "logo": "https://joytvchennai.org/wp-content/uploads/2026/04/cropped-512.png",
    "enabled": true,
    "order": 266
  },
  {
    "id": "in-kadak-in-sd",
    "name": "Kadak (1080p)",
    "url": "https://n18syndication.akamaized.net/bpk-tv/Kadak_NW18_MOB/output01/master.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Kadak.png",
    "enabled": true,
    "order": 267
  },
  {
    "id": "in-kairaliarabia-in-sd",
    "name": "Kairali Arabia (576p)",
    "url": "https://mumt03.tangotv.in/Dsly5z3HKAIRALIARABIA/index.m3u8",
    "category": "General",
    "logo": "https://i.imgur.com/BBEfplL.png",
    "enabled": true,
    "order": 268
  },
  {
    "id": "in-kairalinews-in-sd",
    "name": "Kairali News (720p)",
    "url": "https://cdn.pishow.tv/ott/live/1469/master.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s143246_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 269
  },
  {
    "id": "in-kairalitv-in-sd",
    "name": "Kairali TV (576p)",
    "url": "https://mumt01.tangotv.in/O5aw8Zn3KAIRALI/index.m3u8",
    "category": "General",
    "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/6/6e/Kairali_TV.svg/500px-Kairali_TV.svg.png",
    "enabled": true,
    "order": 270
  },
  {
    "id": "in-kairaliwe-in-sd",
    "name": "Kairali We (576p)",
    "url": "https://streams.tangotv.in/WETV/ORIGIN/index.m3u8",
    "category": "Movies",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_KAIRALI_WE/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 271
  },
  {
    "id": "in-kalaignarmurasu-in-sd",
    "name": "Kalaignar Murasu (396p)",
    "url": "https://yuppmedtaorire.akamaized.net/v1/master/a0d007312bfd99c47f76b77ae26b1ccdaae76cb1/murasu_nim_https/050522/murasu/playlist.m3u8",
    "category": "Entertainment",
    "logo": "https://dtil.tmsimg.com/assets/s143561_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 272
  },
  {
    "id": "in-kalaignarseithigal-in-sd",
    "name": "Kalaignar Seithigal (576p)",
    "url": "https://raw.githubusercontent.com/amazeyourself/adaptive-streams/refs/heads/main/streams/in/YuppTV/KalaignarSeithigal.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s143769_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 273
  },
  {
    "id": "in-kalaignartv-in-sd",
    "name": "Kalaignar TV (396p)",
    "url": "https://segment.yuppcdn.net/240122/kalaignartv/playlist.m3u8",
    "category": "General",
    "logo": "https://ltsk-cdn.s3.eu-west-1.amazonaws.com/jumpstart/Temp_Live/cdn/HLS/Channel/transparentImages/Kalaignar%20TV.png",
    "enabled": true,
    "order": 274
  },
  {
    "id": "in-kalikatv-in-sd",
    "name": "Kalika TV (576p)",
    "url": "http://server.applelive.in/kalikatv/kalikatv.m3u8",
    "category": "Music",
    "logo": "https://i.imgur.com/XWXFoJA.png",
    "enabled": true,
    "order": 275
  },
  {
    "id": "in-kalingatv-in-sd",
    "name": "Kalinga TV (720p)",
    "url": "https://server.thelegitpro.in/kalingatv/kalingatv/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_KALINGA_TV/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 276
  },
  {
    "id": "in-kappatv-in-sd",
    "name": "Kappa TV (576p)",
    "url": "https://mumt03.tangotv.in/Dsly5z3HKAPPATV/index.m3u8",
    "category": "General",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Kappa_TV.png",
    "enabled": true,
    "order": 277
  },
  {
    "id": "in-kashishnews-in-sd",
    "name": "Kashish News (720p)",
    "url": "https://server.thelegitpro.in/kashishnews/kashishnews/index.m3u8",
    "category": "News",
    "logo": "https://i.imgur.com/qfINs2r.png",
    "enabled": true,
    "order": 278
  },
  {
    "id": "in-kaumudytv-in-sd",
    "name": "Kaumudy TV (720p)",
    "url": "https://oqgdrkxby4rm-hls-live.5centscdn.com/kaumudytv/live.stream/playlist.m3u8",
    "category": "General",
    "logo": "https://dtil.tmsimg.com/assets/s143259_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 279
  },
  {
    "id": "in-kbcnews-in-sd",
    "name": "KBC News (1080p)",
    "url": "https://stream.ottlive.co.in/kbcnews/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/kbcnews.png",
    "enabled": true,
    "order": 280
  },
  {
    "id": "in-kbptimes-in-sd",
    "name": "KBP Times (1080p)",
    "url": "https://kbpnews.cloud/Kbptimes/Kbptimeslive/video.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/KBPTimes.png",
    "enabled": true,
    "order": 281
  },
  {
    "id": "in-kcltv-in-sd",
    "name": "KCL TV (720p)",
    "url": "https://kcltv.livebox.co.in/kclhls/live.m3u8",
    "category": "Entertainment",
    "logo": "https://i.imgur.com/bkp9dIm.png",
    "enabled": true,
    "order": 282
  },
  {
    "id": "in-kcm-sg-india",
    "name": "KCM India (1080p) [Geo-blocked]",
    "url": "https://amg02159-amg02159c7-samsung-in-4001.playouts.now.amagi.tv/playlist/amg02159-kcglobal-kcm-samsungin/playlist.m3u8",
    "category": "Entertainment",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/KCM.png",
    "enabled": true,
    "order": 283
  },
  {
    "id": "in-keralavision-in-sd",
    "name": "Kerala Vision (576p)",
    "url": "https://mumt03.tangotv.in/Dsly5z3HKERALAVISION/index.m3u8",
    "category": "Entertainment",
    "logo": "https://i.imgur.com/SWNjyyp.png",
    "enabled": true,
    "order": 284
  },
  {
    "id": "in-khabarfast-in-sd",
    "name": "Khabar Fast (576p)",
    "url": "https://mumt04.tangotv.in/m18aqlK4KHABARFAST/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Khabar_Fast.png",
    "enabled": true,
    "order": 285
  },
  {
    "id": "in-khabrainabhitak-in-sd",
    "name": "Khabrain Abhi Tak (576p)",
    "url": "https://mumt05.tangotv.in/87NeALx2KHABRAINABHITAK/index.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s143262_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 286
  },
  {
    "id": "in-khushboobangla-in-sd",
    "name": "Khushboo Bangla (720p)",
    "url": "https://cdn.pishow.tv/ott/live/1473/master.m3u8",
    "category": "Entertainment",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_KHUSHBOO_BANGLA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 287
  },
  {
    "id": "in-kitevicters-in-sd",
    "name": "Kite Victers (720p) [Not 24/7]",
    "url": "https://932y4x26ljv8-hls-live.5centscdn.com/victers/tv.stream/playlist.m3u8",
    "category": "Education",
    "logo": "https://i.imgur.com/kj4OEsb.png",
    "enabled": true,
    "order": 288
  },
  {
    "id": "in-knockbhakti-in-sd",
    "name": "Knock Bhakti (1080p)",
    "url": "https://knocktv2.wiseplayout.com/Knock_Bhakti_EST/master.m3u8",
    "category": "Religious",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/KnockBhakti.png",
    "enabled": true,
    "order": 289
  },
  {
    "id": "in-kolkatatv-in-sd",
    "name": "Kolkata TV (1080p)",
    "url": "https://cdn.ottlive.co.in/kolkatatv/index.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s143271_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 290
  },
  {
    "id": "in-ktvbangla-in-sd",
    "name": "KTV Bangla (720p)",
    "url": "https://server.livelegitpro.in:9899/tribetv/tribetv/index.m3u8",
    "category": "General",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/channel/2f8e3b371c660faa2f43a7f0942948a4.png",
    "enabled": true,
    "order": 291
  },
  {
    "id": "in-lifetv-in-sd",
    "name": "Life TV (India) (720p)",
    "url": "https://lifetv.livebox.co.in/lifetvhls/lifetv.m3u8",
    "category": "Religious",
    "logo": "https://i.ibb.co/v1C0bdR/logo-1.png",
    "enabled": true,
    "order": 292
  },
  {
    "id": "in-livetimes-in-sd",
    "name": "Live Times (720p)",
    "url": "https://stream.ottlive.co.in/livetimetv/index.m3u8",
    "category": "News",
    "logo": "https://www.livetimes.news/wp-content/uploads/2021/11/LT-logoConverted-01.png",
    "enabled": true,
    "order": 293
  },
  {
    "id": "in-livingindianews-in-sd",
    "name": "Living India News (1080p)",
    "url": "https://stream.ottlive.co.in/livingindia/index.m3u8",
    "category": "News",
    "logo": "https://i.imgur.com/YikaJvd.png",
    "enabled": true,
    "order": 294
  },
  {
    "id": "in-lokshahinews-in-sd",
    "name": "Lokshahi News (576p)",
    "url": "https://mumt05.tangotv.in/87NeALx2LOKSAAHI/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_LOKSHAHI/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 295
  },
  {
    "id": "in-mnadutv-in-sd",
    "name": "M Nadu TV (576p)",
    "url": "https://cloudcdnplayer.mslivestream.net/mslivecdn/mnadu/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/M_Nadu.png",
    "enabled": true,
    "order": 296
  },
  {
    "id": "in-madhatv-in-sd",
    "name": "Madha TV (576p)",
    "url": "https://mumt07.tangotv.in/zHjX9OFlMADHATV/index.m3u8",
    "category": "Religious",
    "logo": "https://dtil.tmsimg.com/assets/s143287_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 297
  },
  {
    "id": "in-madhimugamtv-in-sd",
    "name": "Madhimugam TV (576p)",
    "url": "https://mumt01.tangotv.in/O5aw8Zn3MATHIMUGAMTV/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Madhimugam_TV.png",
    "enabled": true,
    "order": 298
  },
  {
    "id": "in-mahamovie-in-sd",
    "name": "Maha Movie (576p)",
    "url": "https://cdn.pishow.tv/ott/live/10007/master.m3u8",
    "category": "Movies",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Maha_Movies.png",
    "enabled": true,
    "order": 299
  },
  {
    "id": "in-mahapunjabi-in-sd",
    "name": "Maha Punjabi",
    "url": "https://cdn.pishow.tv/ott/live/1521/master.m3u8",
    "category": "Entertainment",
    "logo": "https://i.imgur.com/AWUcSb8.png",
    "enabled": true,
    "order": 300
  },
  {
    "id": "in-mahaabhakti-in-sd",
    "name": "Mahaa Bhakti (1080p)",
    "url": "https://mumbai-edge.smartplaytv.in/MahaBhakthi/index.m3u8",
    "category": "Religious",
    "logo": "https://yt3.googleusercontent.com/OWECRvCVJh-dXU2MTRZhMRIDvFvcWan0YMoWWfXsM5_WEHobQy2QoHQbGr7AZUXzMOByTMAXbg=s900-c-k-c0x00ffffff-no-rj",
    "enabled": true,
    "order": 301
  },
  {
    "id": "in-mahaamax-in-sd",
    "name": "Mahaa Max (1080p)",
    "url": "https://mumbai-edge.smartplaytv.in/MahaMax/index.m3u8",
    "category": "Entertainment",
    "logo": "https://objectstorage.ap-mumbai-1.oraclecloud.com/p/7Eg7LPw1gBcncVDrfwf__7yyrg13awaU6DmMk4gutavGYZgoAuAziv8e0aSEdU4G/n/bmaqqlwez184/b/GTPL_CHANNEL_LOGO/o/gtpl/MAHAA+MAX+LOGO.png",
    "enabled": true,
    "order": 302
  },
  {
    "id": "in-mahaanews-in-sd",
    "name": "Mahaa News (1080p)",
    "url": "https://mumbai-edge.smartplaytv.in/MahaNews/index.m3u8",
    "category": "News",
    "logo": "https://i.imgur.com/buT76vR.png",
    "enabled": true,
    "order": 303
  },
  {
    "id": "in-makkaltv-in-sd",
    "name": "Makkal TV (576i)",
    "url": "https://5k8q87azdy4v-hls-live.wmncdn.net/MAKKAL/271ddf829afeece44d8732757fba1a66.sdp/playlist.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_MAKKAL_TV/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 304
  },
  {
    "id": "in-malaimurasutv-in-sd",
    "name": "Malai Murasu TV (576p)",
    "url": "https://streams.tangotv.in/MALAIMURASUSEITHIGAL/ORIGIN/index.m3u8",
    "category": "News",
    "logo": "https://i.imgur.com/OC5TQxp.png",
    "enabled": true,
    "order": 305
  },
  {
    "id": "in-mangalmaytv-in-sd",
    "name": "Mangalmay TV (576p)",
    "url": "https://yupplivegcpusa.yuppcdn.net/100823/mangalmay_1800/playlist.m3u8?hdnts=st=1735898689~exp=1835898688~acl=*~hmac=f5fe24724fe05481e3841f9eb5ab8efdee0a3dd83645ae9dcf45703f525bab7b",
    "category": "Religious",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Mangalmaylive.png",
    "enabled": true,
    "order": 306
  },
  {
    "id": "in-mango-in-sd",
    "name": "Mango (India) (576p)",
    "url": "https://stmv6.voxtvhd.com.br/cinehindi/cinehindi/playlist.m3u8",
    "category": "Entertainment",
    "logo": "https://i.imgur.com/neZm4CY.png",
    "enabled": true,
    "order": 307
  },
  {
    "id": "in-mangomobiletv-in-hd",
    "name": "Mango Mobile TV (1080p)",
    "url": "https://amg01911-mangotv-amg01911c1-xiaomi-in-1270.playouts.now.amagi.tv/playlist/amg01911-mangomassmedia-mangotv-xiaomiin/playlist.m3u8",
    "category": "Entertainment",
    "logo": "https://dvvlqr1rtlak3.cloudfront.net/Mango/MANGOTVLOGO.jpg",
    "enabled": true,
    "order": 308
  },
  {
    "id": "in-manoramanews-in-sd",
    "name": "Manorama News (1080p)",
    "url": "https://mmtvnews1.akamaized.net/v1/master/673630b269b766886555eebfddd4f27f3de3ab50/mmtvNewsCampaign1/index.m3u8",
    "category": "News",
    "logo": "https://i.imgur.com/adjRrVx.png",
    "enabled": true,
    "order": 309
  },
  {
    "id": "in-manoranjangrand-in-sd",
    "name": "Manoranjan Grand (720p)",
    "url": "https://cdn.pishow.tv/ott/live/1011/master.m3u8",
    "category": "Movies",
    "logo": "https://dtil.tmsimg.com/assets/s143302_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 310
  },
  {
    "id": "in-manoranjanmovies-in-sd",
    "name": "Manoranjan Movies (576p)",
    "url": "https://mumt04.tangotv.in/m18aqlK4MANORANJANMOVIES/index.m3u8",
    "category": "Movies",
    "logo": "https://dtil.tmsimg.com/assets/s143303_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 311
  },
  {
    "id": "in-manoranjanprime-in-sd",
    "name": "Manoranjan Prime (576p)",
    "url": "https://mumt06.tangotv.in/qYyB8fXVMANORANJANPRIME/index.m3u8",
    "category": "Entertainment",
    "logo": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjrGNUi4TMw8UslbIJF1ja-NrA1Ps656h9cxrj6aTfl3Cm-_C2gxtBBAKz-fLdPk7rJ0YrXfNvcQaBSDFTUdPgSYt8sBA0xn4aSMPnl-J2hiKa7P3Ybjd3BlE3XjoAJ0d7HNvhy8mZFDbf1JfAdMVBpdnPBuim3y3x0zMw1D3ryOw3NCoOsPA5fMMplPbU/s500/manoranjan-prime-tv-schedule-on-dd-freedish.jpg",
    "enabled": true,
    "order": 312
  },
  {
    "id": "in-manoranjantv-in-sd",
    "name": "Manoranjan TV (720p)",
    "url": "https://cdn.pishow.tv/ott/live/1013/master.m3u8",
    "category": "Entertainment",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_MANORANJAN_TV/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 313
  },
  {
    "id": "in-mantavyanews-in-sd",
    "name": "Mantavya News (576p)",
    "url": "https://d1msejlow1t3l4.cloudfront.net/fta/mantavya/playlist.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Mantavya_News.png",
    "enabled": true,
    "order": 314
  },
  {
    "id": "in-marutamtv-in-sd",
    "name": "Marutam TV (1080p)",
    "url": "https://mntv.livebox.co.in/mntvhls/live.m3u8",
    "category": "Entertainment",
    "logo": "https://i.imgur.com/cFNw4Af.png",
    "enabled": true,
    "order": 315
  },
  {
    "id": "in-mastiii-in-sd",
    "name": "Mastiii (576p)",
    "url": "https://mumbai-edge.smartplaytv.in/MastiMusic/index.m3u8",
    "category": "Music",
    "logo": "https://i.imgur.com/lxgXHx4.png",
    "enabled": true,
    "order": 316
  },
  {
    "id": "in-mathrubhuminews-in-sd",
    "name": "Mathrubhumi News (576p)",
    "url": "https://streams.tangotv.in/MATHRUBHUMINEWS/ORIGIN/index.m3u8",
    "category": "News",
    "logo": "https://i.imgur.com/diQftzP.png",
    "enabled": true,
    "order": 317
  },
  {
    "id": "in-mazhavilmanorama-in-sd",
    "name": "Mazhavil Manorama (576p)",
    "url": "https://mumt03.tangotv.in/Dsly5z3HMAZHAVILMANORAMAINT/index.m3u8",
    "category": "Entertainment",
    "logo": "https://i.imgur.com/fjgzW20.png",
    "enabled": true,
    "order": 318
  },
  {
    "id": "in-mazhavilmanorama-in-hd",
    "name": "Mazhavil Manorama HD (1080p)",
    "url": "https://mmtv-vglivessai.akamaized.net/v1/master/673630b269b766886555eebfddd4f27f3de3ab50/f8a0827f-030f-4a0d-b7e5-338996c09a5b/index.m3u8",
    "category": "Entertainment",
    "logo": "https://i.imgur.com/fjgzW20.png",
    "enabled": true,
    "order": 319
  },
  {
    "id": "in-mediaone-in-sd",
    "name": "Media One (720p)",
    "url": "https://cdn.pishow.tv/ott/live/1481/master.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_MEDIA_ONE/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 320
  },
  {
    "id": "in-medibiztv-in-sd",
    "name": "MediBizTV (720p)",
    "url": "https://43wrzjnpqoxe-hls-live.wmncdn.net/marinebiztvlive/marinebiztvlive/playlist.m3u8",
    "category": "Education",
    "logo": "https://www.medibiztv.com/assets/logo-E76jcvP9.png",
    "enabled": true,
    "order": 321
  },
  {
    "id": "in-meialaitv-in-sd",
    "name": "Mei Alai TV (576p)",
    "url": "https://meialai.iptelevishion.com/meialai/2/index.m3u8",
    "category": "General",
    "logo": "https://www.meialai.in/assets/meialai-DBaBUZTH.png",
    "enabled": true,
    "order": 322
  },
  {
    "id": "in-mercytv-in-sd",
    "name": "Mercy TV (India) (1080p)",
    "url": "https://5dd3981940faa.streamlock.net/mercytv/mercytv/playlist.m3u8",
    "category": "Religious",
    "logo": "https://i.imgur.com/klNH4tV.png",
    "enabled": true,
    "order": 323
  },
  {
    "id": "in-metrotv-in-sd",
    "name": "Metro TV (India) (1080p)",
    "url": "https://mercury.streambridge.link:8042/telugu/metrotv/index.m3u8",
    "category": "General",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Metro_TV.png",
    "enabled": true,
    "order": 324
  },
  {
    "id": "in-mh1music-in-sd",
    "name": "Mh 1 Music (720p)",
    "url": "https://livestream.jswk.online/playlisttest/live/playlist.m3u8",
    "category": "Music",
    "logo": "https://dtil.tmsimg.com/assets/s143539_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 325
  },
  {
    "id": "in-mh1news-in-sd",
    "name": "Mh 1 News (576p)",
    "url": "https://streams.tangotv.in/MHONENEWS/ORIGIN/index.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s143540_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 326
  },
  {
    "id": "in-mh1prime-in-sd",
    "name": "Mh 1 Prime (576p)",
    "url": "https://streams.tangotv.in/MHONE/ORIGIN/index.m3u8",
    "category": "General",
    "enabled": true,
    "order": 327
  },
  {
    "id": "in-mhonedilse-in-sd",
    "name": "MH One Dil Se (576p)",
    "url": "https://streams.tangotv.in/MHONEDILSE/ORIGIN/index.m3u8",
    "category": "Entertainment",
    "logo": "https://dilse.mhone.in/wp-content/uploads/2022/02/MH-ONE-dil-se-LOGO-white-copy.png",
    "enabled": true,
    "order": 328
  },
  {
    "id": "in-mhonemovies-in-sd",
    "name": "MH One Movies (576p)",
    "url": "https://mumt03.tangotv.in/Dsly5z3HMHONEMOVIE/index.m3u8",
    "category": "Movies",
    "enabled": true,
    "order": 329
  },
  {
    "id": "in-mhoneshraddha-in-sd",
    "name": "MH One Shraddha (576p)",
    "url": "https://mumt01.tangotv.in/O5aw8Zn3MHONESHRADDHA/index.m3u8",
    "category": "Religious",
    "logo": "https://i.imgur.com/Lrm8qTO.png",
    "enabled": true,
    "order": 330
  },
  {
    "id": "in-mirrornow-in-sd",
    "name": "Mirror Now (720p)",
    "url": "https://dai.google.com/linear/hls/event/ClPOullTQky5vGPf7fMZ8g/master.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_MIRROR_NOW/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 331
  },
  {
    "id": "in-mksix-in-sd",
    "name": "MK Six (576p)",
    "url": "https://mumt06.tangotv.in/qYyB8fXVMKSIX/index.m3u8",
    "category": "Entertainment",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/MK_Six.png",
    "enabled": true,
    "order": 332
  },
  {
    "id": "in-mojotv-in-sd",
    "name": "Mojo TV (576p)",
    "url": "https://mumt07.tangotv.in/zHjX9OFlMOJOTV/index.m3u8",
    "category": "News",
    "logo": "https://upload.wikimedia.org/wikipedia/en/1/19/MOJO_TV_LOGO.png",
    "enabled": true,
    "order": 333
  },
  {
    "id": "in-moontv-in-sd",
    "name": "Moon TV (576p)",
    "url": "https://d1msejlow1t3l4.cloudfront.net/fta/moontv/playlist.m3u8",
    "category": "News",
    "logo": "https://i.imgur.com/3l25EZI.png",
    "enabled": true,
    "order": 334
  },
  {
    "id": "in-moviesnow-in-hd",
    "name": "Movies Now HD (1080p)",
    "url": "http://103.151.60.162:2122/play/a02w/index.m3u8?hls",
    "category": "Movies",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_MOVIES_NOW/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 335
  },
  {
    "id": "in-mrbeananimated-uk-english",
    "name": "Mr Bean Animated (1080p)",
    "url": "https://amg00627-amg00627c23-samsung-au-4110.playouts.now.amagi.tv/playlist.m3u8",
    "category": "Kids",
    "logo": "https://static.wikia.nocookie.net/logopedia/images/2/25/Mr._Bean_Animated_Series_stacked_logo.png",
    "enabled": true,
    "order": 336
  },
  {
    "id": "in-munsiftv-in-sd",
    "name": "Munsif TV (576p)",
    "url": "https://live1.ottlive.co.in/munsiftv/munsiftv/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Munsif_TV.png",
    "enabled": true,
    "order": 337
  },
  {
    "id": "in-musicindia-in-sd",
    "name": "Music India (576p)",
    "url": "https://streams.tangotv.in/MUSICINDIA/ORIGIN/index.m3u8",
    "category": "Music",
    "logo": "https://dtil.tmsimg.com/assets/s143563_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 338
  },
  {
    "id": "in-nambikkaitv-in-sd",
    "name": "Nambikkai TV",
    "url": "https://cdn.pishow.tv/ott/live/1389/master.m3u8",
    "category": "Religious",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NAMBIKKAI_TV/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 339
  },
  {
    "id": "in-namdharitv-in-sd",
    "name": "Namdhari TV (404p) [Not 24/7]",
    "url": "https://namdhari.tv/live/sbs1.m3u8",
    "category": "Religious",
    "logo": "https://i.imgur.com/NalsXTo.png",
    "enabled": true,
    "order": 340
  },
  {
    "id": "in-nandighoshatv-in-sd",
    "name": "Nandighosha TV (576p)",
    "url": "https://mumt05.tangotv.in/87NeALx2NANDIGHOSHATV/index.m3u8",
    "category": "General",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Nandighosha.png",
    "enabled": true,
    "order": 341
  },
  {
    "id": "in-nationnews-in-sd",
    "name": "Nation News (720p)",
    "url": "https://server.playontv.in/nationnews/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/nationnews.png",
    "enabled": true,
    "order": 342
  },
  {
    "id": "in-nationalgeographic-in-hd",
    "name": "National Geographic (India) HD (1080p)",
    "url": "http://103.185.24.134:3001/NATGEO-HD/index.m3u8",
    "category": "Documentary",
    "logo": "https://dtil.tmsimg.com/assets/s143574_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 343
  },
  {
    "id": "in-nationalgeographicwild-in-hd",
    "name": "National Geographic Wild (India) HD (1080p)",
    "url": "http://103.185.24.134:3001/NATGEO-WILD-HD/index.m3u8",
    "category": "Documentary",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NAT_GEO_WILD/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 344
  },
  {
    "id": "in-ndtv24x7-in-sd",
    "name": "NDTV 24x7 (720p)",
    "url": "https://raw.githubusercontent.com/amazeyourself/adaptive-streams/refs/heads/main/streams/in/YuppTV/NDTV24x7.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s154895_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 345
  },
  {
    "id": "in-ndtvgoodtimes-in-sd",
    "name": "NDTV Good Times (1080p)",
    "url": "https://amg01448-samsungin-ndtvgoodtimes-samsungin-ad-gp.amagi.tv/playlist/amg01448-samsungin-ndtvgoodtimes-samsungin/playlist.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_GOOD_TIMES/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 346
  },
  {
    "id": "in-ndtvindia-in-sd",
    "name": "NDTV India (720p)",
    "url": "https://raw.githubusercontent.com/amazeyourself/adaptive-streams/refs/heads/main/streams/in/YuppTV/NDTVIndia.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NDTV_INDIA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 347
  },
  {
    "id": "in-ndtvmadhyapradeshchhattisgarh-in-sd",
    "name": "NDTV Madhya Pradesh Chhattisgarh (1080p)",
    "url": "https://ndtvregional.akamaized.net/hls/live/2102726-b/ndtvmpcg/master_1.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NDTV_MPCG/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 348
  },
  {
    "id": "in-ndtvmarathi-in-sd",
    "name": "NDTV Marathi (1080p)",
    "url": "https://web-ndtv-marathi.akamaized.net/hls/live/2110470/ndtvmarathi/master_1.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NDTV_MARATHI/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 349
  },
  {
    "id": "in-ndtvprofit-in-sd",
    "name": "NDTV Profit (1080p)",
    "url": "https://ndtvprofit.akamaized.net/hls/live/2107404/ndtvprofit/chunklist_5.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NDTV_PROFIT_PRIME/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 350
  },
  {
    "id": "in-ndtvrajasthan-in-sd",
    "name": "NDTV Rajasthan (1080p)",
    "url": "https://ndtvregional.akamaized.net/hls/live/2102726-b/ndtvraj/master_1.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NDTV_RAJASTHAN/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 351
  },
  {
    "id": "in-nenews-in-sd",
    "name": "NE News (576p)",
    "url": "https://mumt05.tangotv.in/87NeALx2NENEWS/index.m3u8",
    "category": "News",
    "logo": "https://i.imgur.com/L5GeJFb.png",
    "enabled": true,
    "order": 352
  },
  {
    "id": "in-nepal1-in-sd",
    "name": "Nepal 1 (576p)",
    "url": "https://mumt05.tangotv.in/87NeALx2NEPAL1/index.m3u8",
    "category": "Entertainment",
    "logo": "https://i.imgur.com/Xr4FjC8.png",
    "enabled": true,
    "order": 353
  },
  {
    "id": "in-network10-in-sd",
    "name": "Network 10 (720p)",
    "url": "https://mumbai-edge.smartplaytv.in/Network10/index.m3u8",
    "category": "General",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Network_10.png",
    "enabled": true,
    "order": 354
  },
  {
    "id": "in-news1india-in-sd",
    "name": "News 1 India (576p)",
    "url": "https://mumt07.tangotv.in/zHjX9OFlNEWS1INDIA/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NEWS_1_INDIA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 355
  },
  {
    "id": "in-news1st-in-sd",
    "name": "News 1st (576p)",
    "url": "https://d1msejlow1t3l4.cloudfront.net/fta/News1st/playlist.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s143587_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 356
  },
  {
    "id": "in-news7tamil-in-sd",
    "name": "News 7 Tamil (576p)",
    "url": "https://segment.yuppcdn.net/240122/news7/playlist.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/News7_Tamil.png",
    "enabled": true,
    "order": 357
  },
  {
    "id": "in-news9live-in-sd",
    "name": "News9Live (1080p)",
    "url": "https://amg01106-amg01106c3-amgplt0844.playout.now3.amagi.tv/ts-ap-s1-n1/playlist/amg01106-amg01106c3-amgplt0844/playlist.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/News9.png",
    "enabled": true,
    "order": 358
  },
  {
    "id": "in-news11-in-sd",
    "name": "News 11 (576p)",
    "url": "https://mumt07.tangotv.in/zHjX9OFlNEWS11BHARAT/index.m3u8",
    "category": "General",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/News11.png",
    "enabled": true,
    "order": 359
  },
  {
    "id": "in-news18assamnortheast-in-sd",
    "name": "News18 Assam North-East (1080p)",
    "url": "https://n18syndication.akamaized.net/bpk-tv/News18_Assam_North_East_NW18_MOB/output01/master.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NEWS18_ASSAM_NORTHSYMHYPEAST/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 360
  },
  {
    "id": "in-news18bangla-in-sd",
    "name": "News18 Bangla (1080p)",
    "url": "https://n18syndication.akamaized.net/bpk-tv/News18_Bangla_NW18_MOB/output01/master.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NEWS18_BANGLA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 361
  },
  {
    "id": "in-news18biharjharkhand-in-sd",
    "name": "News18 Bihar Jharkhand (1080p)",
    "url": "https://n18syndication.akamaized.net/bpk-tv/News18_Bihar_Jharkhand_NW18_MOB/output01/master.m3u8",
    "category": "News",
    "logo": "https://i.imgur.com/FQ3zDZE.png",
    "enabled": true,
    "order": 362
  },
  {
    "id": "in-news18delhincrjk-in-sd",
    "name": "News18 Delhi NCR JK (1080p)",
    "url": "https://n18syndication.akamaized.net/bpk-tv/News18_JKLH_NW18_MOB/output01/master.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/News18JKLH.png",
    "enabled": true,
    "order": 363
  },
  {
    "id": "in-news18gujarati-in-sd",
    "name": "News18 Gujarati (1080p)",
    "url": "https://n18syndication.akamaized.net/bpk-tv/News18_Gujarati_NW18_MOB/output01/master.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NEWS18_GUJARATI/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 364
  },
  {
    "id": "in-news18india-in-sd",
    "name": "News18 India (1080p)",
    "url": "https://n18syndication.akamaized.net/bpk-tv/News18_India_NW18_MOB/output01/master.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NEWS18_INDIA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 365
  },
  {
    "id": "in-news18kannada-in-sd",
    "name": "like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0\" group-title=\"News\",News18 Kannada (1080p)",
    "url": "https://n18syndication.akamaized.net/bpk-tv/News18_Kannada_NW18_MOB/output01/master.m3u8",
    "category": "News",
    "logo": "https://i.imgur.com/3XVFxdO.png",
    "enabled": true,
    "order": 366
  },
  {
    "id": "in-news18kerala-in-sd",
    "name": "News18 Kerala (1080p)",
    "url": "https://n18syndication.akamaized.net/bpk-tv/News18_Kerala_NW18_MOB/output01/master.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NEWS18_KERALA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 367
  },
  {
    "id": "in-news18madhyapradeshchhattisgarh-in-sd",
    "name": "News18 Madhya Pradesh/Chhattisgarh (1080p)",
    "url": "https://n18syndication.akamaized.net/bpk-tv/News18_MP_Chhattisgarh_NW18_MOB/output01/master.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NEWS18_MADHYA_PRADESH_CHHATTISGARH/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 368
  },
  {
    "id": "in-news18marathi-in-sd",
    "name": "News18 Marathi (1080p)",
    "url": "https://n18syndication.akamaized.net/bpk-tv/News18_Lokmat_NW18_MOB/output01/master.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NEWS18_LOKMAT/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 369
  },
  {
    "id": "in-news18odia-in-sd",
    "name": "News18 Odia (1080p)",
    "url": "https://n18syndication.akamaized.net/bpk-tv/News18_Odia_NW18_MOB/output01/master.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NEWS18_ODIA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 370
  },
  {
    "id": "in-news18punjabharyanahimachal-in-sd",
    "name": "News18 Punjab/Haryana/Himachal (1080p)",
    "url": "https://n18syndication.akamaized.net/bpk-tv/News18_Punjab_Haryana_HP_NW18_MOB/output01/master.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NEWS18_PUNJAB_HARYANA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 371
  },
  {
    "id": "in-news18rajasthan-in-sd",
    "name": "News18 Rajasthan (1080p)",
    "url": "https://n18syndication.akamaized.net/bpk-tv/News18_Rajasthan_NW18_MOB/output01/master.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NEWS18_RAJASTHAN/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 372
  },
  {
    "id": "in-news18tamilnadu-in-sd",
    "name": "News18 Tamil Nadu (1080p)",
    "url": "https://n18syndication.akamaized.net/bpk-tv/News18_Tamil_Nadu_NW18_MOB/output01/master.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NEWS18_TAMIL_NADU/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 373
  },
  {
    "id": "in-news18urdu-in-sd",
    "name": "News18 Urdu (1080p)",
    "url": "https://n18syndication.akamaized.net/bpk-tv/News18_Urdu_NW18_MOB/output01/master.m3u8",
    "category": "News",
    "logo": "https://i.imgur.com/8xnwMRR.png",
    "enabled": true,
    "order": 374
  },
  {
    "id": "in-news18uttarpradeshuttarakhand-in-sd",
    "name": "News18 Uttar Pradesh Uttarakhand (1080p)",
    "url": "https://n18syndication.akamaized.net/bpk-tv/News18_UP_Uttarakhand_NW18_MOB/output01/master.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NEWS18_UTTAR_PRADESH_UTTARAKHAND/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 375
  },
  {
    "id": "in-news24mpchhattisgarh-in-sd",
    "name": "News 24 MP & Chhattisgarh (576p)",
    "url": "https://mumt04.tangotv.in/m18aqlK4NEWS24MPCG/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NEWS24_MPCG/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 376
  },
  {
    "id": "in-newscapitalgujarat-in-sd",
    "name": "News Capital Gujarat (1080p)",
    "url": "https://newscapital.com/hls/main4/stream.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/NewsCapital_Gujarat.png",
    "enabled": true,
    "order": 377
  },
  {
    "id": "in-newscapitalmarket-in-sd",
    "name": "News Capital Market (1080p)",
    "url": "https://newscapital.com/hls/stream.m3u8?token=Nc360PermanentSecureKey987",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/NewsCapitalMarket.png",
    "enabled": true,
    "order": 378
  },
  {
    "id": "in-newsdaily24-in-sd",
    "name": "News Daily 24 (576p)",
    "url": "https://mumt01.tangotv.in/O5aw8Zn3NEWSDAILY24/index.m3u8",
    "category": "News",
    "logo": "https://i.imgur.com/lT8rihP.png",
    "enabled": true,
    "order": 379
  },
  {
    "id": "in-newsindia24x7-in-sd",
    "name": "News India 24x7",
    "url": "https://cdn.pishow.tv/ott/live/273/master.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG002N1TXH.png?lock=720x540",
    "enabled": true,
    "order": 380
  },
  {
    "id": "in-newsj-in-sd",
    "name": "News J (720p) [Not 24/7]",
    "url": "https://cdn.pishow.tv/ott/live/1279/master.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/News_J.png",
    "enabled": true,
    "order": 381
  },
  {
    "id": "in-newsleader-in-sd",
    "name": "News Leader (576p)",
    "url": "https://stream.ottlive.co.in/newsleader/index.m3u8",
    "category": "News",
    "logo": "https://img-cdn.publive.online/fit-in/360x280/filters:format(webp)/newsleaderlive/media/agency_attachments/2026/04/15/2026-04-15t100517555z-news-leader-640-480-1-sarvajeet-singh-chauhan-2026-04-15-15-35-17.png",
    "enabled": true,
    "order": 382
  },
  {
    "id": "in-newslive-in-sd",
    "name": "News Live (576p)",
    "url": "https://prideeast.thelegitpro.in/newslive/newslive/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NEWS_LIVE/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 383
  },
  {
    "id": "in-newslivebangla-in-sd",
    "name": "News Live Bangla (576p)",
    "url": "https://mumt06.tangotv.in/qYyB8fXVINDRADHANU/index.m3u8",
    "category": "News",
    "logo": "https://papaji.freetvindia.com/media/News_Live_Bangla.png",
    "enabled": true,
    "order": 384
  },
  {
    "id": "in-newsmarathi24x7-in-sd",
    "name": "News Marathi 24x7 (720p)",
    "url": "https://live1.ottlive.co.in/newsmarathi/newsmarathi/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/channel/cb84d7f7e19bcbfb9b6d664e7fb2adee.png",
    "enabled": true,
    "order": 385
  },
  {
    "id": "in-newsnation81-in-sd",
    "name": "News Nation 81 (1080p)",
    "url": "https://live.newsnation81.com/newsnation81/newsnation81/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/News_Nation_81.png",
    "enabled": true,
    "order": 386
  },
  {
    "id": "in-newsnation-in-sd",
    "name": "News Nation (1080p)",
    "url": "https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/6cd2f649739a45ca9de1daf81cc7d0f2/index.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s143596_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 387
  },
  {
    "id": "in-newsstatempchg-in-sd",
    "name": "News State MP & CHG (1080p)",
    "url": "https://jmp2.uk/stvp-IN4000012ML",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NEWS_STATE_MADHYA_PRADESH_CHHATTISGARH/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 388
  },
  {
    "id": "in-newsstatepunjabharyanahimachal-in-sd",
    "name": "News State Punjab Haryana Himachal (1080p)",
    "url": "https://jmp2.uk/stvp-IN300083R1",
    "category": "News",
    "enabled": true,
    "order": 389
  },
  {
    "id": "in-newsstateupuk-in-sd",
    "name": "News State UP & UK (1080p)",
    "url": "https://jmp2.uk/stvp-IN3000846P",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NEWS_STATE_UP_UK/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 390
  },
  {
    "id": "in-newstamil24x7-in-sd",
    "name": "News Tamil 24x7 (576p)",
    "url": "https://cdn.pishow.tv/ott/live/1433/master.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NEWS_TAMIL_24X7/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 391
  },
  {
    "id": "in-newsxworld-in-hd",
    "name": "NewsX World (576p)",
    "url": "https://mumt03.tangotv.in/Dsly5z3HNEWSXWORLD/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/News_X_World.png",
    "enabled": true,
    "order": 392
  },
  {
    "id": "in-nhbollyflix-in-hd",
    "name": "NH BollyFlix (1080p)",
    "url": "https://jmp2.uk/stvp-IN46000140Q",
    "category": "Movies",
    "logo": "https://i.ibb.co/yF9MPTDK/blyflx.png",
    "enabled": true,
    "order": 393
  },
  {
    "id": "in-nhbollygold-in-hd",
    "name": "NH BollyGold (1080p)",
    "url": "https://0dc330e6408b4c3b9ac31fd37b121368.mediatailor.ap-south-1.amazonaws.com/v1/master/d367f9b863a7a04827f71ecab4cbeeb11f78a827/nh-bollygold-airtel/playlist.m3u8",
    "category": "Movies",
    "logo": "https://i.ibb.co/x9PsrMy/NH-BOLLYGOLD.png",
    "enabled": true,
    "order": 394
  },
  {
    "id": "in-nhbollyraga-in-hd",
    "name": "NH BollyRaga (1080p)",
    "url": "https://jmp2.uk/stvp-IN460001373",
    "category": "Music",
    "logo": "https://i.ibb.co/BKB9mv1K/NH-Bolly-Raga.png",
    "enabled": true,
    "order": 395
  },
  {
    "id": "in-nhtamilgold-in-hd",
    "name": "NH Tamil Gold (1080p)",
    "url": "https://d3arbp6l7f096k.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/pb-gv6wgpbb4mgwk/playlist.m3u8?ads.ads_cdn=cf&ads.app_domain=APP_DOMAIN&ads.cdn=cf",
    "category": "Movies",
    "logo": "https://tvpnlogopus.samsungcloud.tv/platform/image/sourcelogo/vc/00/02/34/IN400061DB_20260623T015348SQUARE.png",
    "enabled": true,
    "order": 396
  },
  {
    "id": "in-nickjr-in-sd",
    "name": "Nick Jr. (India) (576p)",
    "url": "http://103.185.24.134:3001/NICK-JR/index.m3u8",
    "category": "Kids",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NICK_JUNIOR/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 397
  },
  {
    "id": "in-nickelodeon-in-sd",
    "name": "Nickelodeon (India) (576p)",
    "url": "http://103.185.24.134:3001/NICK/index.m3u8",
    "category": "Kids",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NICK/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 398
  },
  {
    "id": "in-nireekshanatv-in-sd",
    "name": "Nireekshana TV (576p)",
    "url": "https://cdn.pishow.tv/ott/live/965/master.m3u8",
    "category": "Religious",
    "logo": "https://i.imgur.com/nGJv6QR.png",
    "enabled": true,
    "order": 399
  },
  {
    "id": "in-nktv24x7-in-sd",
    "name": "NK TV 24x7 (1080p)",
    "url": "https://nktv.smartstream.video/smartstream-us/nktvplus/nktvplus/chunks.m3u8",
    "category": "News",
    "logo": "https://www.nktv.in/wp-content/uploads/2023/01/NEW-LOGO-NEW.png",
    "enabled": true,
    "order": 400
  },
  {
    "id": "in-nktvbangla-in-sd",
    "name": "NK TV Bangla (1080p)",
    "url": "https://nktv.smartstream.video/smartstream-us/nkbangla/nkbangla/playlist.m3u8",
    "category": "News",
    "logo": "https://www.nktvbangla.com/wp-content/uploads/2023/09/WhatsApp-Image-2023-09-12-at-2.59.18-PM.jpg",
    "enabled": true,
    "order": 401
  },
  {
    "id": "in-nkrtvkannada-in-sd",
    "name": "NKR TV Kannada (1080p)",
    "url": "https://stream.ottlive.co.in/nkrtv/index.m3u8",
    "category": "General",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/NKRTV.png",
    "enabled": true,
    "order": 402
  },
  {
    "id": "in-northeastlive-in-hd",
    "name": "like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0\" group-title=\"News\",Northeast Live (720p)",
    "url": "https://server.thelegitpro.in/northeastlive/northeastlive/index.fmp4.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_NORTH_EAST_LIVE/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 403
  },
  {
    "id": "in-nsc9news-in-sd",
    "name": "NSC9 News (1080p)",
    "url": "https://legitpro.co.in/nsc9/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/nsc9.png",
    "enabled": true,
    "order": 404
  },
  {
    "id": "in-ntctv-in-sd",
    "name": "NTC TV (720p)",
    "url": "https://galaxyott.live/hls/ntv.m3u8",
    "category": "Entertainment",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/ntvtamil.png",
    "enabled": true,
    "order": 405
  },
  {
    "id": "in-ntvtelugu-in-sd",
    "name": "NTV Telugu (1080p)",
    "url": "https://mumbai-edge.smartplaytv.in/NTVTelugu/index.m3u8",
    "category": "News",
    "logo": "https://i.imgur.com/WqTIoWS.png",
    "enabled": true,
    "order": 406
  },
  {
    "id": "in-odishatv-in-sd",
    "name": "Odisha TV (720p)",
    "url": "https://livetv.tarangplus.in/otv-origin/live/playlist.m3u8",
    "category": "General",
    "logo": "https://dtil.tmsimg.com/assets/s143639_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 407
  },
  {
    "id": "in-olitv-in-sd",
    "name": "Oli TV (India) (1080p)",
    "url": "https://live.olidigital.in/olitv/olitv/index.m3u8",
    "category": "Entertainment",
    "logo": "https://i.ibb.co/XfvTQyJn/main-removebg-preview.png",
    "enabled": true,
    "order": 408
  },
  {
    "id": "in-omtv-in-sd",
    "name": "OM TV (576p)",
    "url": "https://mumt01.tangotv.in/O5aw8Zn3OMTV/index.m3u8",
    "category": "Religious",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/OM_TV.png",
    "enabled": true,
    "order": 409
  },
  {
    "id": "in-onepaschima-in-sd",
    "name": "One Paschima (400p)",
    "url": "https://live.ekamraott.com/onepaschima/onepaschima/index.m3u8",
    "category": "Entertainment",
    "logo": "https://jiotv.catchup.cdn.jio.com/dare_images/images/One_Paschima.png",
    "enabled": true,
    "order": 410
  },
  {
    "id": "in-onlybharat-in-sd",
    "name": "Only Bharat (576p)",
    "url": "https://mumt07.tangotv.in/zHjX9OFlONLYBHARAT/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_AMV_NETWORK/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 411
  },
  {
    "id": "in-orangebanglatv-in-sd",
    "name": "Orange Bangla TV (720p)",
    "url": "https://cdn.pishow.tv/ott/live/1499/master.m3u8",
    "category": "Music",
    "logo": "https://i.imgur.com/wjSaHj5.png",
    "enabled": true,
    "order": 412
  },
  {
    "id": "in-oscarmoviesbhojpuri-in-sd",
    "name": "Oscar Movies Bhojpuri (720p)",
    "url": "https://cdn.pishow.tv/ott/live/233/master.m3u8",
    "category": "Movies",
    "logo": "https://dtil.tmsimg.com/assets/s143638_ld_h9_ab.png?lock=720x540",
    "enabled": true,
    "order": 413
  },
  {
    "id": "in-parasgold-in-sd",
    "name": "Paras Gold (576p)",
    "url": "https://mumt04.tangotv.in/m18aqlK4PARASGOLD/index.m3u8",
    "category": "Religious",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_PARAS_GOLD_ONE/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 414
  },
  {
    "id": "in-pasandtv-in-sd",
    "name": "Pasand TV (576p)",
    "url": "https://d1msejlow1t3l4.cloudfront.net/fta/pasand/playlist.m3u8",
    "category": "Entertainment",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG002NFYY1.png?lock=720x540",
    "enabled": true,
    "order": 415
  },
  {
    "id": "in-peaceofmindtv-in-sd",
    "name": "Peace of Mind TV (576p)",
    "url": "https://yuppnimrestreammum.akamaized.net/181224/smil:peaceofmind.smil/playlist.m3u8?hdnts=st=1735898689~exp=1835898688~acl=*~hmac=f5fe24724fe05481e3841f9eb5ab8efdee0a3dd83645ae9dcf45703f525bab7b",
    "category": "Religious",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_PEACE_OF_MIND/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 416
  },
  {
    "id": "in-peacetvbangla-ae-sd",
    "name": "Peace TV Bangla (1080p)",
    "url": "https://dzkyvlfyge.erbvr.com/PeaceTvBangla/index.m3u8",
    "category": "Religious",
    "logo": "https://i.imgur.com/1ztVXUi.png",
    "enabled": true,
    "order": 417
  },
  {
    "id": "in-peacetvurdu-ae-sd",
    "name": "Peace TV Urdu (1080p)",
    "url": "https://dzkyvlfyge.erbvr.com/PeaceTvUrdu/index.m3u8",
    "category": "Religious",
    "logo": "https://github.com/fawazahmed0/tiger/raw/master/peace/urdu.jpg",
    "enabled": true,
    "order": 418
  },
  {
    "id": "in-peartv-in-sd",
    "name": "Pear TV (576p)",
    "url": "https://mumt01.tangotv.in/O5aw8Zn3PEARTV/index.m3u8",
    "category": "Entertainment",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_PEARS_TV/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 419
  },
  {
    "id": "in-pepperstv-in-sd",
    "name": "Peppers TV (751p)",
    "url": "https://cdn.pishow.tv/ott/live/1383/master.m3u8",
    "category": "Music",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Peppers_TV.png",
    "enabled": true,
    "order": 420
  },
  {
    "id": "in-pitaara-in-sd",
    "name": "Pitaara (720p)",
    "url": "https://vg-pitaaratvlive.akamaized.net/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/vglive-sk-583798/playlist.m3u8",
    "category": "Movies",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_PITAARA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 421
  },
  {
    "id": "in-pmctelugu-in-sd",
    "name": "PMC Telugu (1080p)",
    "url": "https://mumbai-edge.smartplaytv.in/PMC/index.m3u8",
    "category": "Religious",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/PMC_Telugu.png",
    "enabled": true,
    "order": 422
  },
  {
    "id": "in-pocketfilms-in-sd",
    "name": "Pocket Films",
    "url": "https://vglivessai.akamaized.net/sg/v1/manifest/611d79b11b77e2f571934fd80ca1413453772ac7/b8ada260-bb81-472b-b7c1-3a79213a84b8/e02a0ce5-6c42-4cca-bb53-e5cfecff74a9/0.m3u8",
    "category": "Movies",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/p_pktflm.png",
    "enabled": true,
    "order": 423
  },
  {
    "id": "in-polimernews-in-sd",
    "name": "Polimer News (576p)",
    "url": "https://segment.yuppcdn.net/110322/polimernews/playlist.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s143664_ld_h9_aa.png?lock=720x540",
    "enabled": true,
    "order": 424
  },
  {
    "id": "in-polimertv-in-sd",
    "name": "Polimer TV (720p)",
    "url": "https://cdn.pishow.tv/ott/live/1241/master.m3u8",
    "category": "Entertainment",
    "logo": "https://dtil.tmsimg.com/assets/s143665_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 425
  },
  {
    "id": "in-powertv-in-sd",
    "name": "like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0\" group-title=\"News\",Power TV (India) (576p)",
    "url": "https://powertvkannada.com/hls/stream.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_POWER_TV/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 426
  },
  {
    "id": "in-powervisiontv-in-sd",
    "name": "Powervision TV (720p)",
    "url": "https://mumbai-edge.smartplaytv.in/PowerVision/index.m3u8",
    "category": "Religious",
    "logo": "https://dtil.tmsimg.com/assets/s143670_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 427
  },
  {
    "id": "in-pragnews-in-sd",
    "name": "Prag News (576p)",
    "url": "https://streams.tangotv.in/PRAGNEWS/ORIGIN/index.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s143671_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 428
  },
  {
    "id": "in-prameyanews7-in-sd",
    "name": "Prameya News7 (576p)",
    "url": "https://mumt03.tangotv.in/Dsly5z3HPRAMEYANEWS7/index.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s143578_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 429
  },
  {
    "id": "in-prarthanatv-in-sd",
    "name": "Prarthana TV (720p)",
    "url": "https://livetv.tarangplus.in/prarthana-origin/live/playlist.m3u8",
    "category": "General",
    "logo": "https://i.imgur.com/gj7dtNF.png",
    "enabled": true,
    "order": 430
  },
  {
    "id": "in-prathamkhabar24x7-in-sd",
    "name": "Pratham Khabar 24x7 (576p)",
    "url": "https://livelegitpro.in/hls2/newstime/index.m3u8",
    "category": "News",
    "logo": "https://i.imgur.com/HNsg5Px.png",
    "enabled": true,
    "order": 431
  },
  {
    "id": "in-pratidintime-in-sd",
    "name": "Pratidin Time (576p)",
    "url": "https://server.thelegitpro.in/pratidintime/pratidintime/index.fmp4.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_PRATIDIN_TIME/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 432
  },
  {
    "id": "in-pravasichannel-in-sd",
    "name": "Pravasi Channel (1080p)",
    "url": "https://m6gdavepdn93-hls-live.5centscdn.com/pravasi/d0dbe915091d400bd8ee7f27f0791303.sdp/playlist.m3u8",
    "category": "General",
    "logo": "https://i.imgur.com/1dHarb7.png",
    "enabled": true,
    "order": 433
  },
  {
    "id": "in-prime9news-in-sd",
    "name": "Prime9 News (1080p)",
    "url": "https://mumbai-edge.smartplaytv.in/Prime9News/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Prime_9_News.png",
    "enabled": true,
    "order": 434
  },
  {
    "id": "in-primenews-in-sd",
    "name": "Prime News (1080p)",
    "url": "https://stream.ottlive.co.in/primenews/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Prime_News.png",
    "enabled": true,
    "order": 435
  },
  {
    "id": "in-prudentmedia-in-sd",
    "name": "Prudent Media (1080p)",
    "url": "https://prudentmcdn.rixcast.com/prudentm.m3u8",
    "category": "News",
    "logo": "https://i.imgur.com/DG0x4UD.png",
    "enabled": true,
    "order": 436
  },
  {
    "id": "in-ptcchakde-in-sd",
    "name": "PTC Chakde (720p)",
    "url": "https://cdn.pishow.tv/ott/live/449/master.m3u8",
    "category": "Music",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_PTC_CHAKDE/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 437
  },
  {
    "id": "in-ptcmusic-in-sd",
    "name": "PTC Music (720p)",
    "url": "https://d2lk5u59tns74c.cloudfront.net/out/v1/f913cf893c594f73b114216e74a2efbc/index.m3u8",
    "category": "Music",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_PTC_MUSIC/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 438
  },
  {
    "id": "in-ptcnews-in-sd",
    "name": "PTC News (576p)",
    "url": "https://streams.tangotv.in/PTCNEWS/ORIGIN/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_PTC_NEWS/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 439
  },
  {
    "id": "in-ptcpunjabi-in-sd",
    "name": "PTC Punjabi (576p)",
    "url": "https://streams.tangotv.in/PTCPUNJABI/ORIGIN/index.m3u8",
    "category": "Entertainment",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_PTC_PUNJABI/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 440
  },
  {
    "id": "in-ptcpunjabi-in-hd",
    "name": "PTC Punjabi HD (1080p)",
    "url": "https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/3e22a9c278db4e3eb779afd42e41b0a6/index.m3u8",
    "category": "Entertainment",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_PTC_PUNJABI/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 441
  },
  {
    "id": "in-ptcpunjabigold-in-sd",
    "name": "PTC Punjabi Gold (1080p)",
    "url": "https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/6e14bac6d0384e129521a4d005188bfb/index.m3u8",
    "category": "Entertainment",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_PTC_PUNJABI_GOLD/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 442
  },
  {
    "id": "in-ptcsimran-in-sd",
    "name": "PTC Simran (576p)",
    "url": "https://streams.tangotv.in/PTCSIMRAN/ORIGIN/index.m3u8",
    "category": "Religious",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG002NG05K.png?lock=720x540",
    "enabled": true,
    "order": 443
  },
  {
    "id": "in-publicmovies-in-sd",
    "name": "Public Movies (576p)",
    "url": "https://mumt04.tangotv.in/m18aqlK4PUBLICMOVIES/index.m3u8",
    "category": "Movies",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_PUBLIC_MOVIES/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 444
  },
  {
    "id": "in-publicmusic-in-sd",
    "name": "Public Music (576p)",
    "url": "https://mumt04.tangotv.in/m18aqlK4PUBLICMUSIC/index.m3u8",
    "category": "Music",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_PUBLIC_MUSIC/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 445
  },
  {
    "id": "in-publictv-in-sd",
    "name": "Public TV (720p)",
    "url": "https://cdn.pishow.tv/ott/live/439/master.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_PUBLIC_TV/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 446
  },
  {
    "id": "in-pudharinews-in-sd",
    "name": "Pudhari News (576p)",
    "url": "https://streams.tangotv.in/PUDHARINEWS/ORIGIN/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_PUDHARI_NEWS/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 447
  },
  {
    "id": "in-pularitv-in-sd",
    "name": "Pulari TV (576p)",
    "url": "https://mumbai-edge.smartplaytv.in/PulariTV/index.m3u8",
    "category": "Entertainment",
    "logo": "https://i.imgur.com/v5urG30.png",
    "enabled": true,
    "order": 448
  },
  {
    "id": "in-punjabihits-in-sd",
    "name": "Punjabi Hits (1080p)",
    "url": "https://stream.ottlive.co.in/punjabihits/index.m3u8",
    "category": "Music",
    "logo": "https://dtil.tmsimg.com/assets/s143691_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 449
  },
  {
    "id": "in-punjabishorts-in-sd",
    "name": "Punjabi Shorts (1080p)",
    "url": "https://vglivessai.akamaized.net/ptnr-yupptv/title-Punjabi_Shorts/in/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/27c3fd7a-b01f-4b00-ac03-557ac77acd47/index.m3u8",
    "category": "Movies",
    "logo": "https://www.thegtcnetwork.com/punjabi-shorts.jpg",
    "enabled": true,
    "order": 450
  },
  {
    "id": "in-puthiyathalaimurai-in-sd",
    "name": "Puthiya Thalaimurai (576p)",
    "url": "https://mumt07.tangotv.in/zHjX9OFlPUTHIYAEXPRESS/index.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s143692_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 451
  },
  {
    "id": "in-puthuyugamtv-in-sd",
    "name": "Puthuyugam TV (576p)",
    "url": "https://mumt04.tangotv.in/m18aqlK4PUTHUYUGAMTV/index.m3u8",
    "category": "General",
    "logo": "https://dtil.tmsimg.com/assets/s143693_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 452
  },
  {
    "id": "in-qtv-in-sd",
    "name": "Q TV (576p)",
    "url": "https://mumt05.tangotv.in/87NeALx2THEQ/index.m3u8",
    "category": "Entertainment",
    "logo": "https://www.theq.tv/wp-content/uploads/2023/10/The-Q-new-Logo.png",
    "enabled": true,
    "order": 453
  },
  {
    "id": "in-qelloconcertsbystingray-ca-sd",
    "name": "Qello Concerts by Stingray (1080p)",
    "url": "https://lotus.stingray.com/manifest/qello-qello001-montreal/samsungtvplus/master.m3u8",
    "category": "Music",
    "logo": "https://i.imgur.com/IRyFTWq.png",
    "enabled": true,
    "order": 454
  },
  {
    "id": "in-rplus-in-sd",
    "name": "R Plus (768p)",
    "url": "https://thelegitpro.in/pntv/rplusnews24x7/index.m3u8",
    "category": "General",
    "logo": "https://i.imgur.com/XUnWcZF.png",
    "enabled": true,
    "order": 455
  },
  {
    "id": "in-rplusgold-in-sd",
    "name": "R Plus Gold (720p)",
    "url": "https://cdn.pishow.tv/ott/live/1231/master.m3u8",
    "category": "General",
    "logo": "https://i.imgur.com/dpI7XPC.png",
    "enabled": true,
    "order": 456
  },
  {
    "id": "in-raatdinbangla-in-sd",
    "name": "Raatdin Bangla (720p)",
    "url": "https://server.playontv.in/raatdinbangla/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/raatdinbangla.png",
    "enabled": true,
    "order": 457
  },
  {
    "id": "in-raftaarmedia-in-sd",
    "name": "Raftaar Media (576p)",
    "url": "https://mumt04.tangotv.in/m18aqlK4RAFTAARMEDIA/index.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_RAFTAAR_MEDIA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 458
  },
  {
    "id": "in-rajdigitalplus-in-sd",
    "name": "Raj Digital Plus (1080p)",
    "url": "https://livestream.rajtv.tv/hlslive/Admin/px08241087/live/RajTV_Digital_plus/master_1.m3u8",
    "category": "Movies",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_RAJ_DIGITAL_PLUS/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 459
  },
  {
    "id": "in-rajmusixkannada-in-sd",
    "name": "Raj Musix Kannada (576p)",
    "url": "https://mumt01.tangotv.in/O5aw8Zn3RAJMUSIXKANDA/index.m3u8",
    "category": "Music",
    "logo": "https://i.imgur.com/z7fhhyX.png",
    "enabled": true,
    "order": 460
  },
  {
    "id": "in-rajmusixmalayalam-in-sd",
    "name": "Raj Musix Malayalam (576p)",
    "url": "https://cdn.pishow.tv/ott/live/1073/master.m3u8",
    "category": "Music",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_RAJ_MUSIX_MALAYALAM/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 461
  },
  {
    "id": "in-rajmusixtamil-in-sd",
    "name": "Raj Musix Tamil (1080p)",
    "url": "https://livestream.rajtv.tv/hlslive/Admin/px08241087/live/Raj_Musix/master_1.m3u8",
    "category": "Music",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_RAJ_MUSIX_TAMIL/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 462
  },
  {
    "id": "in-rajmusixtelugu-in-sd",
    "name": "Raj Musix Telugu (720p)",
    "url": "https://cdn.pishow.tv/ott/live/1213/master.m3u8",
    "category": "Music",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_RAJ_MUSIX_TELUGU/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 463
  },
  {
    "id": "in-rajnewsmalayalam-in-sd",
    "name": "Raj News Malayalam (576p)",
    "url": "https://mumt04.tangotv.in/m18aqlK4RAJNEWSMALAYALAM/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_RAJ_NEWS_MALAYALAM/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 464
  },
  {
    "id": "in-rajnewstelugu-in-sd",
    "name": "Raj News Telugu (576p)",
    "url": "https://mumt04.tangotv.in/m18aqlK4RAJNEWSTELUGU/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_RAJ_NEWS_TELUGU/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 465
  },
  {
    "id": "in-rajtv-in-sd",
    "name": "Raj TV (1080p)",
    "url": "https://livestream.rajtv.tv/hlslive/Admin/px08241087/live/RAJTV/master_1.m3u8",
    "category": "Entertainment",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_RAJ_TV/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 466
  },
  {
    "id": "in-ramdhenu-in-sd",
    "name": "Ramdhenu (576p)",
    "url": "https://mumt01.tangotv.in/O5aw8Zn3RAMDHENU/index.m3u8",
    "category": "General",
    "logo": "https://dtil.tmsimg.com/assets/s143717_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 467
  },
  {
    "id": "in-rang-in-sd",
    "name": "Rang (576p)",
    "url": "https://cdn.pishow.tv/ott/live/10017/master.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_RANG/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 468
  },
  {
    "id": "in-rdxgoa-in-sd",
    "name": "RDX Goa (720p) [Geo-blocked]",
    "url": "https://g5nl6xoalpq6-hls-live.5centscdn.com/rdxgoa/d0dbe915091d400bd8ee7f27f0791303.sdp/playlist.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/RDX_News.png",
    "enabled": true,
    "order": 469
  },
  {
    "id": "in-rengoni-in-sd",
    "name": "Rengoni (576p)",
    "url": "https://streams.tangotv.in/RENGONI/ORIGIN/index.m3u8",
    "category": "General",
    "logo": "https://dtil.tmsimg.com/assets/s143722_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 470
  },
  {
    "id": "in-reportertv-in-sd",
    "name": "Reporter TV (576p)",
    "url": "https://segment.yuppcdn.net/050522/reporter/playlist.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s85096_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 471
  },
  {
    "id": "in-republicbangla-in-sd",
    "name": "Republic Bangla (576p)",
    "url": "https://streams.tangotv.in/RBANGLA/ORIGIN/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_RSYMDOT_BANGLA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 472
  },
  {
    "id": "in-republicbharat-in-sd",
    "name": "Republic Bharat (1080p)",
    "url": "https://raw.githubusercontent.com/amazeyourself/adaptive-streams/refs/heads/main/streams/in/YuppTV/RepublicBharat.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s143724_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 473
  },
  {
    "id": "in-republickannada-in-sd",
    "name": "Republic Kannada (720p)",
    "url": "https://mumbai-edge.smartplaytv.in/republickannada/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_RSYMDOTKANNADA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 474
  },
  {
    "id": "in-republictv-in-sd",
    "name": "Republic TV (1080p)",
    "url": "https://raw.githubusercontent.com/amazeyourself/adaptive-streams/refs/heads/main/streams/in/YuppTV/RepublicTV.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s143723_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 475
  },
  {
    "id": "in-rongeentv-in-sd",
    "name": "Rongeen TV (720p)",
    "url": "https://server.thelegitpro.in/rongeentv/rongeentv/index.m3u8",
    "category": "General",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Rongeen_TV.png",
    "enabled": true,
    "order": 476
  },
  {
    "id": "in-rozanaspokesman-in-sd",
    "name": "Rozana Spokesman (1080p)",
    "url": "https://live1.ottlive.co.in/spokesman/spokesman/index.m3u8",
    "category": "News",
    "logo": "https://www.rozanaspokesman.in/images/logospokesman.png",
    "enabled": true,
    "order": 477
  },
  {
    "id": "in-rtindia-in-hd",
    "name": "RT India (1080p)",
    "url": "https://rt-india.rttv.com/dvr/rtindia/playlist.m3u8",
    "category": "News",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/a/a0/Russia-today-logo.svg",
    "enabled": true,
    "order": 478
  },
  {
    "id": "in-rupasibangla-in-sd",
    "name": "Rupasi Bangla (720p)",
    "url": "https://cdn.pishow.tv/ott/live/1039/master.m3u8",
    "category": "Entertainment",
    "logo": "https://dtil.tmsimg.com/assets/s143733_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 479
  },
  {
    "id": "in-saamtv-in-sd",
    "name": "Saam TV",
    "url": "https://cdn.pishow.tv/ott/live/437/master.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SAAM_TV/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 480
  },
  {
    "id": "in-sachbedhadak-in-sd",
    "name": "Sach Bedhadak (576p)",
    "url": "https://sbnews.nexcdn.online/sbnews/live/index.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s158864_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 481
  },
  {
    "id": "in-sadatv-in-sd",
    "name": "SADA TV (1080p) [Not 24/7]",
    "url": "http://cdn12.henico.net:8080/live/sadatv/index.m3u8",
    "category": "Entertainment",
    "logo": "https://i.ibb.co/cXPzpGp/SADA-CHANNEL-HBN-global-Punjabi-Satellite-TV.png",
    "enabled": true,
    "order": 482
  },
  {
    "id": "in-sadhna-in-sd",
    "name": "Sadhna (720p)",
    "url": "https://6n3yow8pl9ok-hls-live.5centscdn.com/sadhanalivetv/live.stream/playlist.m3u8",
    "category": "Religious",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SADHNA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 483
  },
  {
    "id": "in-sadhnanewsmadhyapradeshchhattisgarh-in-sd",
    "name": "Sadhna News Madhya Pradesh/Chhattisgarh (576p)",
    "url": "https://mumt04.tangotv.in/m18aqlK4SADHNEWSPMRAJ/index.m3u8",
    "category": "News",
    "logo": "https://i.imgur.com/799WMit.png",
    "enabled": true,
    "order": 484
  },
  {
    "id": "in-sadhnaplusnews-in-sd",
    "name": "Sadhna Plus News (720p)",
    "url": "https://6n3yow8pl9ok-hls-live.5centscdn.com/sadhananewstv/live.stream/playlist.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Sadhna_News_Plus.png",
    "enabled": true,
    "order": 485
  },
  {
    "id": "in-sadhnatv-in-sd",
    "name": "Sadhna TV (576p)",
    "url": "https://mumt05.tangotv.in/87NeALx2SADHNATV/index.m3u8",
    "category": "Religious",
    "logo": "https://dtil.tmsimg.com/assets/s143736_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 486
  },
  {
    "id": "in-safaritv-in-sd",
    "name": "Safari TV (576p)",
    "url": "https://mumt04.tangotv.in/m18aqlK4SAFARITV/index.m3u8",
    "category": "Documentary",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SAFARI_TV/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 487
  },
  {
    "id": "in-sahananews-in-sd",
    "name": "Sahana News (576p)",
    "url": "https://mumt03.tangotv.in/Dsly5z3HSAHANANEWS/index.m3u8",
    "category": "News",
    "logo": "https://i.imgur.com/3odbJJq.png",
    "enabled": true,
    "order": 488
  },
  {
    "id": "in-saitv-in-sd",
    "name": "Sai TV (576p)",
    "url": "https://mumbai-edge.smartplaytv.in/SaiTV/index.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SAI_TV/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 489
  },
  {
    "id": "in-sairamtv-in-sd",
    "name": "Sairam TV (576p)",
    "url": "https://mumt04.tangotv.in/m18aqlK4SAIRAMTV/index.m3u8",
    "category": "Religious",
    "enabled": true,
    "order": 490
  },
  {
    "id": "in-sakshitv-in-sd",
    "name": "Sakshi TV (576p)",
    "url": "https://yuppmedtaorire.akamaized.net/v1/master/a0d007312bfd99c47f76b77ae26b1ccdaae76cb1/sakshi_nim_https/240122/sakshi/playlist.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SAKSHI_TV/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 491
  },
  {
    "id": "in-salaamtv-in-sd",
    "name": "Salaam TV (720p)",
    "url": "https://d2o3r1shda7xvv.cloudfront.net/index_5.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s144466_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 492
  },
  {
    "id": "in-salvationtv-in-sd",
    "name": "Salvation TV (India) (1080p)",
    "url": "https://ktismaservers.in:3902/live/salvationtvlive.m3u8",
    "category": "Religious",
    "logo": "https://content.jdmagicbox.com/comp/bangalore/l5/080pxx80.xx80.150207120517.e4l5/catalogue/salvation-tv-network-pvt-m-g-road-bangalore-religious-organizations-1sabn2d.jpg",
    "enabled": true,
    "order": 493
  },
  {
    "id": "in-samacharplus24x7-in-sd",
    "name": "Samachar Plus 24x7 (576p)",
    "url": "https://mumt05.tangotv.in/87NeALx2VERTENTSAMACHARPLUS/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Samachar_Plus.png",
    "enabled": true,
    "order": 494
  },
  {
    "id": "in-samaykolkata-in-sd",
    "name": "Samay Kolkata (1080p)",
    "url": "https://server.livelegitpro.in/samaykolkata/samaykolkata/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Samay_Kolkata.png",
    "enabled": true,
    "order": 495
  },
  {
    "id": "in-sanaplus-in-sd",
    "name": "Sana Plus (1080p)",
    "url": "https://mumbai-edge.smartplaytv.in/SanaPlusHD/index.m3u8",
    "category": "Music",
    "logo": "https://i.imgur.com/N6tKUZv.png",
    "enabled": true,
    "order": 496
  },
  {
    "id": "in-sandeshnews-in-sd",
    "name": "Sandesh News (576p)",
    "url": "https://mumt01.tangotv.in/O5aw8Zn3SANDESHNEWS/index.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s143755_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 497
  },
  {
    "id": "in-sangeetbangla-in-sd",
    "name": "Sangeet Bangla (720p)",
    "url": "https://cdn.pishow.tv/ott/live/1143/master.m3u8",
    "category": "Music",
    "logo": "https://ltsk-cdn.s3.eu-west-1.amazonaws.com/jumpstart/Temp_Live/cdn/HLS/Channel/transparentImages/Sangeet%20Bangla.png",
    "enabled": true,
    "order": 498
  },
  {
    "id": "in-sangeetbhojpuri-in-sd",
    "name": "Sangeet Bhojpuri (576p)",
    "url": "https://mumt01.tangotv.in/O5aw8Zn3SANGEETBHOJPURI/index.m3u8",
    "category": "Music",
    "logo": "https://dtil.tmsimg.com/assets/s143757_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 499
  },
  {
    "id": "in-sangeetmarathi-in-sd",
    "name": "Sangeet Marathi (720p)",
    "url": "https://cdn.pishow.tv/ott/live/1229/master.m3u8",
    "category": "Music",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SANGEET_MARATHI/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 500
  },
  {
    "id": "in-sankaratv-in-sd",
    "name": "Sankara TV (576p)",
    "url": "https://mumt05.tangotv.in/87NeALx2SRISANKARA/index.m3u8",
    "category": "Religious",
    "logo": "https://i.imgur.com/2z0bDRD.png",
    "enabled": true,
    "order": 501
  },
  {
    "id": "in-sansadtv1-in-sd",
    "name": "Sansad TV 1 (1080p)",
    "url": "https://playhls.media.nic.in/hls/live/lstv/lstv.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SANSAD_TV_SYMHYP_1_HD/images/LOGO_HD/LOGO_HD_image.png",
    "enabled": true,
    "order": 502
  },
  {
    "id": "in-sansadtv1-in-hd",
    "name": "Sansad TV 1 HD (1080p)",
    "url": "https://d2lk5u59tns74c.cloudfront.net/out/v1/fff8f20221d5456e8922e689d71dedc3/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SANSAD_TV_SYMHYP_1_HD/images/LOGO_HD/LOGO_HD_image.png",
    "enabled": true,
    "order": 503
  },
  {
    "id": "in-sansadtv2-in-sd",
    "name": "Sansad TV 2",
    "url": "https://cdn.pishow.tv/ott/live/39/master.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s143761_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 504
  },
  {
    "id": "in-sansadtv2-in-hd",
    "name": "Sansad TV 2 HD (1080p)",
    "url": "https://d2lk5u59tns74c.cloudfront.net/out/v1/e4182054dce340da9e0ff38b6b3658a4/index.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s143761_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 505
  },
  {
    "id": "in-sanskartv-in-sd",
    "name": "Sanskar TV (1080p)",
    "url": "https://d26idhjf0y1p2g.cloudfront.net/out/v1/cd66dd25b9774cb29943bab54bbf3e2f/index.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SANSKAR/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 506
  },
  {
    "id": "in-sanskarwebtv-in-sd",
    "name": "Sanskar Web TV (1080p)",
    "url": "https://deatfcv3xdvi3.cloudfront.net/out/v1/7a43dd2f64e34ec28da1b4bd6923251a/index.m3u8",
    "category": "Religious",
    "logo": "https://i.imgur.com/mu2B6hw.png",
    "enabled": true,
    "order": 507
  },
  {
    "id": "in-santvanichannel-in-sd",
    "name": "Santvani Channel (576p)",
    "url": "https://d1msejlow1t3l4.cloudfront.net/fta/santwani/playlist.m3u8",
    "category": "General",
    "logo": "https://dtil.tmsimg.com/assets/s143763_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 508
  },
  {
    "id": "in-sarvdharmsangam-in-sd",
    "name": "Sarv Dharm Sangam (576p)",
    "url": "https://mumt01.tangotv.in/O5aw8Zn3SARAVDHARAMSANGAM/index.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SARV_DHARAM_SANGAM/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 509
  },
  {
    "id": "in-sathiyamtv-in-sd",
    "name": "Sathiyam TV (576p)",
    "url": "https://mumt07.tangotv.in/zHjX9OFlSATHIYAMTV/index.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s143765_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 510
  },
  {
    "id": "in-satsangtv-in-sd",
    "name": "Satsang TV (1080p)",
    "url": "https://d2vfwvjxwtwq1t.cloudfront.net/out/v1/6b24239d5517495b986e7705490c6e65/index.m3u8",
    "category": "Religious",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SATSANG/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 511
  },
  {
    "id": "in-satsangwebtv-in-sd",
    "name": "Satsang Web TV (1080p)",
    "url": "https://d1ji7e9jbzm5g8.cloudfront.net/out/v1/769f22f64d80442889306b9c4abea63c/index.m3u8",
    "category": "Religious",
    "logo": "https://i.imgur.com/40kNu1w.png",
    "enabled": true,
    "order": 512
  },
  {
    "id": "in-shalom-in-sd",
    "name": "Shalom (1080p)",
    "url": "https://d2c4zqo2rb5uf1.cloudfront.net/master.m3u8",
    "category": "Religious",
    "logo": "https://dtil.tmsimg.com/assets/s143774_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 513
  },
  {
    "id": "in-sharnamtv-in-sd",
    "name": "Sharnam TV (576p)",
    "url": "https://mumt06.tangotv.in/qYyB8fXVSHARNAMTV/index.m3u8",
    "category": "General",
    "logo": "https://papaji.freetvindia.com/media/channels/SarnamTV.png",
    "enabled": true,
    "order": 514
  },
  {
    "id": "in-shemaroofilmigaane-in-hd",
    "name": "Shemaroo Filmi Gaane (1080p)",
    "url": "https://prod-runn.cdn.runn.tv/shemaroo/stream/smrfgn/playlist.m3u8",
    "category": "Movies",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/channel/0d5b07555b2d4415aa9f145273095ed7.png",
    "enabled": true,
    "order": 515
  },
  {
    "id": "in-shemaroojosh-in-sd",
    "name": "Shemaroo Josh (576p)",
    "url": "https://mumt04.tangotv.in/m18aqlK4SHEMAROOJOSH/index.m3u8",
    "category": "Movies",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG00297P3E.png?lock=720x540",
    "enabled": true,
    "order": 516
  },
  {
    "id": "in-shemaroomarathibana-in-sd",
    "name": "Shemaroo Marathi Bana (720p)",
    "url": "https://airtelapp.shemaroo.com/marathibana/smil:marathibanaadp.smil/playlist.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SHEMAROO_MARATHIBANA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 517
  },
  {
    "id": "in-shemarootv-in-sd",
    "name": "Shemaroo TV (720p)",
    "url": "https://airtelapp.shemaroo.com/shemarootv/smil:shemarootvadp.smil/playlist.m3u8",
    "category": "Entertainment",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SHEMAROO_TV/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 518
  },
  {
    "id": "in-shemarooumang-in-sd",
    "name": "Shemaroo Umang (720p)",
    "url": "https://airtelapp.shemaroo.com/shemarooumang/smil:shemarooumangadp.smil/playlist.m3u8",
    "category": "Entertainment",
    "logo": "https://dtil.tmsimg.com/assets/s143779_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 519
  },
  {
    "id": "in-shubhcinematv-in-sd",
    "name": "Shubh Cinema TV (720p)",
    "url": "https://d393sxaxig6bax.cloudfront.net/out/v1/589cf2cf44bf42bb941e817a2240d62e/index.m3u8",
    "category": "Movies",
    "logo": "https://i.imgur.com/RQhorAG.png",
    "enabled": true,
    "order": 520
  },
  {
    "id": "in-shubhtv-in-sd",
    "name": "Shubh TV (1080p)",
    "url": "https://d2g1vdc6ozl2o8.cloudfront.net/out/v1/0a0dc7d7911b4fddbb4dfc963fdd4b9e/index.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SHUBH_TV/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 521
  },
  {
    "id": "in-shubhsandeshtv-in-sd",
    "name": "Shubhsandesh TV (576p)",
    "url": "https://mumt03.tangotv.in/Dsly5z3HSHUBHSANDESH/index.m3u8",
    "category": "Religious",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SHUBHSANDESH_TV/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 522
  },
  {
    "id": "in-sirikannada-in-sd",
    "name": "Siri Kannada (576p)",
    "url": "https://mumt03.tangotv.in/Dsly5z3HSIRIKANNADA/index.m3u8",
    "category": "Entertainment",
    "logo": "https://dtil.tmsimg.com/assets/s143790_ld_h9_aa.png?lock=720x540",
    "enabled": true,
    "order": 523
  },
  {
    "id": "in-sirikannadaalltime-in-sd",
    "name": "Siri Kannada All Time (576p)",
    "url": "https://mumt07.tangotv.in/zHjX9OFlSIRIKANNADAALLTIME/index.m3u8",
    "category": "Entertainment",
    "logo": "https://i.imgur.com/IR0BrEX.jpeg",
    "enabled": true,
    "order": 524
  },
  {
    "id": "in-sirippolitv-in-sd",
    "name": "Sirippoli TV (576p)",
    "url": "https://segment.yuppcdn.net/240122/siripoli/playlist.m3u8",
    "category": "Entertainment",
    "logo": "https://dtil.tmsimg.com/assets/s143791_ld_h9_aa.png?lock=720x540",
    "enabled": true,
    "order": 525
  },
  {
    "id": "in-sohamtv-in-sd",
    "name": "Soham TV (576p)",
    "url": "https://mumt03.tangotv.in/Dsly5z3HSOHAMTV/index.m3u8",
    "category": "Religious",
    "logo": "https://i.imgur.com/cpedJ0L.png",
    "enabled": true,
    "order": 526
  },
  {
    "id": "in-songdewtv-in-sd",
    "name": "Songdew TV (396p)",
    "url": "https://yuppnimrestreammum.akamaized.net/181224/smil:songdewtv.smil/playlist.m3u8?hdnts=st=1735898689~exp=1835898688~acl=*~hmac=f5fe24724fe05481e3841f9eb5ab8efdee0a3dd83645ae9dcf45703f525bab7b",
    "category": "Music",
    "logo": "https://dtil.tmsimg.com/assets/s142920_ld_h9_aa.png?lock=720x540",
    "enabled": true,
    "order": 527
  },
  {
    "id": "in-sonic-in-sd",
    "name": "Sonic (576p)",
    "url": "http://103.185.24.134:3001/SONIC/index.m3u8",
    "category": "Kids",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SONIC/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 528
  },
  {
    "id": "in-sonybbcearth-in-hd",
    "name": "Sony BBC Earth HD (1080p)",
    "url": "http://103.185.24.134:3001/SONY-BBC/index.m3u8",
    "category": "Documentary",
    "logo": "https://dtil.tmsimg.com/assets/s143800_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 529
  },
  {
    "id": "in-sonyentertainmenttelevision-in-sd",
    "name": "Sony Entertainment Television (576p)",
    "url": "http://103.151.60.162:2122/play/a015/index.m3u8?hls",
    "category": "Entertainment",
    "logo": "https://dtil.tmsimg.com/assets/s157589_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 530
  },
  {
    "id": "in-sonyentertainmenttelevision-in-hd",
    "name": "Sony Entertainment Television HD (1080p)",
    "url": "http://38.96.178.205/SONYHD/index.m3u8",
    "category": "Entertainment",
    "logo": "https://dtil.tmsimg.com/assets/s159096_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 531
  },
  {
    "id": "in-sonymarathi-in-sd",
    "name": "Sony Marathi (576p)",
    "url": "http://107.167.16.138/sonymarathi/index.m3u8?token=test",
    "category": "Entertainment",
    "logo": "https://dtil.tmsimg.com/assets/s157970_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 532
  },
  {
    "id": "in-sonymax2-in-sd",
    "name": "Sony Max 2 (576p)",
    "url": "http://107.167.16.138/sonymax2/index.m3u8?token=test",
    "category": "Movies",
    "logo": "https://i.imgur.com/gqUYk6C.png",
    "enabled": true,
    "order": 533
  },
  {
    "id": "in-sonymax-in-hd",
    "name": "Sony Max HD (1080p)",
    "url": "http://103.185.24.134:3001/SonyMAX/index.m3u8",
    "category": "Movies",
    "logo": "https://dtil.tmsimg.com/assets/s157590_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 534
  },
  {
    "id": "in-sonypix-in-hd",
    "name": "Sony Pix HD (1080p)",
    "url": "http://103.151.60.162:2122/play/a01d/index.m3u8?hls",
    "category": "Movies",
    "logo": "https://i.postimg.cc/Z5G8j67L/PIX-HD-WHITE.png",
    "enabled": true,
    "order": 535
  },
  {
    "id": "in-sonysab-in-sd",
    "name": "Sony SAB (576p)",
    "url": "http://103.151.60.162:2122/play/a01q/index.m3u8?hls",
    "category": "Entertainment",
    "logo": "https://dtil.tmsimg.com/assets/s159099_ld_h15_ab.png?lock=720x540",
    "enabled": true,
    "order": 536
  },
  {
    "id": "in-sonysportsten1-in-sd",
    "name": "Sony Sports Ten 1 (576p)",
    "url": "http://103.151.60.162:2122/play/a01c/index.m3u8?hls",
    "category": "Sports",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SONY_SPORTS_TEN_1/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 537
  },
  {
    "id": "in-sonysportsten1-in-hd",
    "name": "Sony Sports Ten 1 HD (1080p)",
    "url": "http://103.185.24.134:3001/SonyTenSports1/index.m3u8",
    "category": "Sports",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SONY_SPORTS_TEN_1/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 538
  },
  {
    "id": "in-sonysportsten2-in-sd",
    "name": "Sony Sports Ten 2 (576p)",
    "url": "http://103.151.60.162:2122/play/a01b/index.m3u8?hls",
    "category": "Sports",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SONY_SPORTS_TEN_2/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 539
  },
  {
    "id": "in-sonysportsten3hindi-in-sd",
    "name": "Sony Sports Ten 3 Hindi (576p)",
    "url": "http://103.151.60.162:2122/play/a01t/index.m3u8?hls",
    "category": "Sports",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG0025TCMR.png?lock=720x540",
    "enabled": true,
    "order": 540
  },
  {
    "id": "in-sonysportsten5-in-sd",
    "name": "Sony Sports Ten 5 (576p)",
    "url": "http://103.151.60.162:2122/play/a028/index.m3u8?hls",
    "category": "Sports",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SONY_SPORTS_TEN_5/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 541
  },
  {
    "id": "in-sonywah-in-sd",
    "name": "Sony Wah (1080p) [Geo-blocked]",
    "url": "https://sl.vodep39240327.workers.dev/channel/SONY+WAH.m3u8",
    "category": "Movies",
    "logo": "https://dtil.tmsimg.com/assets/s157974_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 542
  },
  {
    "id": "in-sooriyantv-ca-sd",
    "name": "Sooriyan TV (1080p)",
    "url": "https://live20.bozztv.com/giatv/giatv-Infinittyott/Infinittyott/playlist.m3u8",
    "category": "Entertainment",
    "logo": "https://i.ibb.co/LSyydKj/Sooriyan-TV-Tamil.jpg",
    "enabled": true,
    "order": 543
  },
  {
    "id": "in-southstation-in-hd",
    "name": "South Station (1080p)",
    "url": "https://cc-yw7ztecy8do3q.akamaized.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-yw7ztecy8do3q/SS_IN.m3u8",
    "category": "Movies",
    "logo": "https://tvpnlogopus.samsungcloud.tv/platform/image/sourcelogo/vc/00/02/34/IN3800008CX_20260325T012316SQUARE.png",
    "enabled": true,
    "order": 544
  },
  {
    "id": "in-spondon-in-sd",
    "name": "Spondon (1080p)",
    "url": "https://nktv.smartstream.video/smartstream-us/spondon/spondon/playlist.m3u8",
    "category": "Entertainment",
    "logo": "https://www.spondontv.com/wp-content/uploads/2025/10/cropped-SPONDON_Blue-Violet_1-copy-300x100.png",
    "enabled": true,
    "order": 545
  },
  {
    "id": "in-stargold2-in-hd",
    "name": "Star Gold 2 HD (1080p)",
    "url": "http://103.151.60.162:2122/play/a01v/index.m3u8?hls",
    "category": "Movies",
    "logo": "https://i.imgur.com/G0ZfzZr.png",
    "enabled": true,
    "order": 546
  },
  {
    "id": "in-stargold-in-hd",
    "name": "Star Gold HD (1080p)",
    "url": "http://103.185.24.134:3001/Star-Gold/index.m3u8",
    "category": "Movies",
    "logo": "https://i.imgur.com/xC460sj.png",
    "enabled": true,
    "order": 547
  },
  {
    "id": "in-starjalsha-in-sd",
    "name": "Star Jalsha (576p)",
    "url": "http://103.151.60.162:2122/play/a00w/index.m3u8?hls",
    "category": "Entertainment",
    "logo": "https://i.imgur.com/IlufzR5.png",
    "enabled": true,
    "order": 548
  },
  {
    "id": "in-starjalsha-in-hd",
    "name": "Star Jalsha HD (720p)",
    "url": "https://da86m1sqpm3o0.cloudfront.net/28072023/smil:starjalsha.smil/chunklist_b1928000.m3u8",
    "category": "Entertainment",
    "logo": "https://i.imgur.com/IlufzR5.png",
    "enabled": true,
    "order": 549
  },
  {
    "id": "in-starmaa-in-hd",
    "name": "Star Maa HD (720p)",
    "url": "https://da86m1sqpm3o0.cloudfront.net/28072023/smil:starmaa1.smil/chunklist_b2628000.m3u8",
    "category": "Entertainment",
    "logo": "https://i.imgur.com/5c9PVS0.png",
    "enabled": true,
    "order": 550
  },
  {
    "id": "in-starmaamovies-in-hd",
    "name": "Star Maa Movies HD (720p)",
    "url": "https://da86m1sqpm3o0.cloudfront.net/28072023/smil:maamovies.smil/chunklist_b2628000.m3u8",
    "category": "Movies",
    "logo": "https://dtil.tmsimg.com/assets/s143826_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 551
  },
  {
    "id": "in-starmovies-in-hd",
    "name": "Star Movies (India) HD (1080p)",
    "url": "http://103.185.24.134:3001/Star-Movies/index.m3u8",
    "category": "Movies",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_STAR_MOVIES/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 552
  },
  {
    "id": "in-starmoviesselect-in-hd",
    "name": "Star Movies Select HD (1080p)",
    "url": "http://103.151.60.162:2122/play/a02l/index.m3u8?hls",
    "category": "Movies",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_STAR_MOVIES_SELECT_HD/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 553
  },
  {
    "id": "in-starpravah-in-hd",
    "name": "Star Pravah HD (720p)",
    "url": "https://da86m1sqpm3o0.cloudfront.net/28072023/smil:starpravah.smil/chunklist_b1928000.m3u8",
    "category": "Entertainment",
    "logo": "https://i.imgur.com/ZT0u7AK.png",
    "enabled": true,
    "order": 554
  },
  {
    "id": "in-starsports2-in-sd",
    "name": "Star Sports 2 (576p)",
    "url": "http://103.151.60.162:2122/play/a00v/index.m3u8?hls",
    "category": "Sports",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_STAR_SPORTS_2/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 555
  },
  {
    "id": "in-starsports2telugu-in-hd",
    "name": "Star Sports 2 Telugu HD (576p)",
    "url": "https://real-vk.proxy.nellaiiptv.com/SDMEDIA/index.m3u8",
    "category": "Sports",
    "logo": "https://i.imgur.com/m7DvvqF.png",
    "enabled": true,
    "order": 556
  },
  {
    "id": "in-starsportsselect1-in-hd",
    "name": "Star Sports Select 1 HD (1080p)",
    "url": "http://103.151.60.162:2122/play/a026/index.m3u8?hls",
    "category": "Sports",
    "logo": "https://i.imgur.com/Mh9tKPx.png",
    "enabled": true,
    "order": 557
  },
  {
    "id": "in-starsportsselect2-in-hd",
    "name": "Star Sports Select 2 HD (1080p)",
    "url": "http://103.151.60.162:2122/play/a027/index.m3u8?hls",
    "category": "Sports",
    "logo": "https://i.imgur.com/FtRT73R.png",
    "enabled": true,
    "order": 558
  },
  {
    "id": "in-starnet-in-sd",
    "name": "Starnet (480p)",
    "url": "https://5a1178b42cc03.streamlock.net/8220/8220/playlist.m3u8",
    "category": "General",
    "logo": "https://i.imgur.com/J3jB7Kr.png",
    "enabled": true,
    "order": 559
  },
  {
    "id": "in-steelbirdmusic-in-sd",
    "name": "Steelbird Music (720p) [Not 24/7]",
    "url": "https://cdn2.in/SteelbirdMusicTVhls/live.m3u8",
    "category": "Music",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Steelbird_Music.png",
    "enabled": true,
    "order": 560
  },
  {
    "id": "in-stingrayclassicrock-ca-sd",
    "name": "Stingray Classic Rock (1080p)",
    "url": "https://lotus.stingray.com/manifest/ose-101ads-montreal/samsungtvplus/master.m3u8",
    "category": "Music",
    "logo": "https://i.imgur.com/FBgu8yB.png",
    "enabled": true,
    "order": 561
  },
  {
    "id": "in-stingraydjazz-ca-sd",
    "name": "Stingray DJAZZ (1080p)",
    "url": "https://lotus.stingray.com/manifest/djazz-djaads-montreal/samsungtvplus/master.m3u8",
    "category": "Music",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Stingray_Djazz.png/960px-Stingray_Djazz.png",
    "enabled": true,
    "order": 562
  },
  {
    "id": "in-stingrayeasylistening-ca-sd",
    "name": "Stingray Easy Listening (1080p)",
    "url": "https://lotus.stingray.com/manifest/ose-137ads-montreal/samsungtvplus/master.m3u8",
    "category": "Music",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Stingray_Music_logo.svg/960px-Stingray_Music_logo.svg.png",
    "enabled": true,
    "order": 563
  },
  {
    "id": "in-stingraynaturescape-ca-sd",
    "name": "Stingray Naturescape (1080p)",
    "url": "https://lotus.stingray.com/manifest/naturescape-a003-montreal/samsungtvplus/master.m3u8",
    "category": "Music",
    "logo": "https://i.imgur.com/882kd90.png",
    "enabled": true,
    "order": 564
  },
  {
    "id": "in-stingraythespa-ca-sd",
    "name": "Stingray The Spa (1080p)",
    "url": "https://lotus.stingray.com/manifest/ose-122ads-montreal/samsungtvplus/master.m3u8",
    "category": "Music",
    "logo": "https://i.imgur.com/ywAN923.png",
    "enabled": true,
    "order": 565
  },
  {
    "id": "in-stingraytodayskpop-ca-sd",
    "name": "Stingray Today's K-Pop (1080p)",
    "url": "https://lotus.stingray.com/manifest/ose-317ads-montreal/samsungtvplus/master.m3u8",
    "category": "Music",
    "logo": "https://i.imgur.com/mMbntB5.png",
    "enabled": true,
    "order": 566
  },
  {
    "id": "in-studiooneplus-in-sd",
    "name": "Studio One + (720p)",
    "url": "https://cdn.pishow.tv/ott/live/276/master.m3u8",
    "category": "Movies",
    "logo": "https://i.imgur.com/yOPB7JB.png",
    "enabled": true,
    "order": 567
  },
  {
    "id": "in-studioyuva-in-sd",
    "name": "Studio Yuva (576p)",
    "url": "https://mumt01.tangotv.in/O5aw8Zn3STUDIOYUVA/index.m3u8",
    "category": "Entertainment",
    "logo": "https://i.imgur.com/BOhgz2T.png",
    "enabled": true,
    "order": 568
  },
  {
    "id": "in-subhavaarthatv-in-sd",
    "name": "Subhavaartha TV (720p)",
    "url": "https://2mk9qae4rwyb-hls-live.wmncdn.net/shubhavartha/live.stream/playlist.m3u8",
    "category": "Religious",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SUBHAVAARTHA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 569
  },
  {
    "id": "in-subintv-in-sd",
    "name": "Subin TV (1080p)",
    "url": "https://stream.galaxyott.live/live/subintv/index.m3u8",
    "category": "Entertainment",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/subintvtamil.png",
    "enabled": true,
    "order": 570
  },
  {
    "id": "in-sudarshannews-in-sd",
    "name": "Sudarshan News (1080p)",
    "url": "https://ott.livelegitpro.in/sudarshannews/sudarshannews/tracks-v1/index.fmp4.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SUDARSHAN_NEWS/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 571
  },
  {
    "id": "in-sungemini-in-sd",
    "name": "Sun Gemini (576p)",
    "url": "http://ptuf.ridsys.in/riptv/live/GEMINI_TV/index.m3u8",
    "category": "General",
    "logo": "https://sund-images.sunnxt.com/194396/300x300_SunGemini_194396_22c18c1e-7eb9-4855-9c4e-12e109911559.png",
    "enabled": true,
    "order": 572
  },
  {
    "id": "in-superhungama-in-sd",
    "name": "Super Hungama (576p)",
    "url": "http://103.185.24.134:3001/SUPER-HUNGAMA/index.m3u8",
    "category": "Kids",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SUPER_HUNGAMA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 573
  },
  {
    "id": "in-superhitz-in-sd",
    "name": "Superhitz (576p)",
    "url": "http://103.151.60.162:2122/play/a02f/index.m3u8?hls",
    "category": "General",
    "logo": "https://i.imgur.com/aRNBvTU.png",
    "enabled": true,
    "order": 574
  },
  {
    "id": "in-suriyatv-in-sd",
    "name": "Suriya TV (1080p)",
    "url": "https://stream.ottlive.co.in/suryatvtamil/index.m3u8",
    "category": "Entertainment",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/suryatvtamil.png",
    "enabled": true,
    "order": 575
  },
  {
    "id": "in-suvarnanews-in-sd",
    "name": "Suvarna News SD (576p)",
    "url": "https://streams.tangotv.in/SUVARNANEWS/ORIGIN/index.m3u8",
    "category": "News",
    "logo": "https://i.imgur.com/0H1HObK.png",
    "enabled": true,
    "order": 576
  },
  {
    "id": "in-svbc2-in-sd",
    "name": "SVBC 2 (1080p)",
    "url": "https://player.mslivestream.net/tamil/ac206e74d75b285755ee4924df87d951.sdp/playlist.m3u8",
    "category": "Religious",
    "logo": "https://dtil.tmsimg.com/assets/s143890_ld_h9_aa.png?lock=720x540",
    "enabled": true,
    "order": 577
  },
  {
    "id": "in-svbc3-in-sd",
    "name": "SVBC 3 (720p)",
    "url": "https://player.mslivestream.net/svbc/2e628d7e1b65d31254fd7705ff7ee64d.sdp/playlist.m3u8",
    "category": "Religious",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/SVBC3.png",
    "enabled": true,
    "order": 578
  },
  {
    "id": "in-svbc4-in-sd",
    "name": "SVBC 4 (1080p)",
    "url": "https://player.mslivestream.net/mslive/13a2927187b9700ae7ea82d7841d5b68.sdp/playlist.m3u8",
    "category": "Religious",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/SVBC4.png",
    "enabled": true,
    "order": 579
  },
  {
    "id": "in-svbc-in-sd",
    "name": "SVBC (1080p)",
    "url": "https://player.mslivestream.net/telugu/5d076e5c3d34cb8bb08e54a4bb7e223e.sdp/playlist.m3u8",
    "category": "Religious",
    "logo": "https://dtil.tmsimg.com/assets/s143889_ld_h9_ab.png?lock=720x540",
    "enabled": true,
    "order": 580
  },
  {
    "id": "in-swadeshnews-in-sd",
    "name": "Swadesh News (720p)",
    "url": "https://cdn.pishow.tv/ott/live/465/master.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Swadesh_News.png",
    "enabled": true,
    "order": 581
  },
  {
    "id": "in-swarajexpresssmbc-in-sd",
    "name": "Swaraj Express SMBC (576p)",
    "url": "https://d1msejlow1t3l4.cloudfront.net/fta/swarajexpresssmbc/playlist.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/SMBC_TV.png",
    "enabled": true,
    "order": 582
  },
  {
    "id": "in-swastiktv-in-sd",
    "name": "Swastik TV (720p)",
    "url": "https://server.playontv.in/swastiktv/index.m3u8",
    "category": "Religious",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/swastiktv.png",
    "enabled": true,
    "order": 583
  },
  {
    "id": "in-swatantratv-in-sd",
    "name": "Swatantra TV (1080p)",
    "url": "https://mumbai-edge.smartplaytv.in/SwatantraTV/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Swatantra_News.png",
    "enabled": true,
    "order": 584
  },
  {
    "id": "in-tnews-in-sd",
    "name": "T News (720p)",
    "url": "https://cdn.pishow.tv/ott/live/385/master.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s143919_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 585
  },
  {
    "id": "in-taazatv-in-sd",
    "name": "Taaza TV (720p)",
    "url": "https://live.we2live.in/taazatv/live/playlist.m3u8",
    "category": "General",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Taaza_TV.png",
    "enabled": true,
    "order": 586
  },
  {
    "id": "in-tabbarhits-in-sd",
    "name": "Tabbar Hits (1080p)",
    "url": "https://vglivessai.akamaized.net/sg/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/e11b0319-52e8-4190-ab03-3931cc68eac9/index.m3u8",
    "category": "Music",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_TABBAR_HITS/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 587
  },
  {
    "id": "in-tamiljanam-in-sd",
    "name": "Tamil Janam (576p)",
    "url": "https://mumt01.tangotv.in/O5aw8Zn3JANAMTVTAMIL/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Janam_Tamil.png",
    "enabled": true,
    "order": 588
  },
  {
    "id": "in-tamilantv-in-sd",
    "name": "Tamilan TV (576p)",
    "url": "https://mumt04.tangotv.in/m18aqlK4TAMILANTELEVISION/index.m3u8",
    "category": "General",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Tamilan_Television.png",
    "enabled": true,
    "order": 589
  },
  {
    "id": "in-tamilvisiontv-ca-sd",
    "name": "TamilVision-TV (1080p)",
    "url": "https://live.cmr24.fm/TVI/HD/chunks.m3u8",
    "category": "General",
    "logo": "https://i.imgur.com/DodsLuW.png",
    "enabled": true,
    "order": 590
  },
  {
    "id": "in-tarangmusic-in-sd",
    "name": "Tarang Music (720p)",
    "url": "https://livetv.tarangplus.in/tarangmusic-origin/live/playlist.m3u8",
    "category": "Music",
    "logo": "https://i.imgur.com/oSm8zFD.png",
    "enabled": true,
    "order": 591
  },
  {
    "id": "in-tarangtv-in-sd",
    "name": "Tarang TV (720p)",
    "url": "https://livetv.tarangplus.in/tarangtv-origin/live/playlist.m3u8",
    "category": "Entertainment",
    "logo": "https://dtil.tmsimg.com/assets/s143927_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 592
  },
  {
    "id": "in-tehzeebtv-in-sd",
    "name": "Tehzeeb TV (720p)",
    "url": "https://cdn.pishow.tv/ott/live/239/master.m3u8",
    "category": "General",
    "logo": "https://i.imgur.com/PCVOdup.png",
    "enabled": true,
    "order": 593
  },
  {
    "id": "in-teluguone-in-hd",
    "name": "Telugu One (1080p)",
    "url": "https://teluguone-yupptv.vgcdn.net/v1/019be9e3f04d1ea55784338b5c3e89/019be9e4474415fc60e93459e1e808/teluguone_2500k.m3u8",
    "category": "Entertainment",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/teluguone.png",
    "enabled": true,
    "order": 594
  },
  {
    "id": "in-tencricket-in-sd",
    "name": "Ten Cricket (576p)",
    "url": "http://103.151.60.162:2122/play/a0fj/index.m3u8?hls",
    "category": "Sports",
    "logo": "https://i.imgur.com/K5XIFuW.png",
    "enabled": true,
    "order": 595
  },
  {
    "id": "in-thalaatv-in-hd",
    "name": "Thalaa TV (1080p)",
    "url": "https://streams2.sofast.tv/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/2069c593-3c07-4d62-9d44-746be5c3a5d6/manifest.m3u8",
    "category": "Movies",
    "logo": "https://d229kpbsb5jevy.cloudfront.net/yuppfast/content/common/channel/logos/thalaa-tv.png",
    "enabled": true,
    "order": 596
  },
  {
    "id": "in-thanthione-in-sd",
    "name": "Thanthi One (576p)",
    "url": "https://mumt07.tangotv.in/zHjX9OFlTHANTHIONE/index.m3u8",
    "category": "Entertainment",
    "logo": "https://dtil.tmsimg.com/assets/s158791_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 597
  },
  {
    "id": "in-thanthitv-in-sd",
    "name": "Thanthi TV (576p)",
    "url": "https://streams.tangotv.in/THANTHITV/ORIGIN/index.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s144000_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 598
  },
  {
    "id": "in-thejunglebook-in-sd",
    "name": "The Jungle Book (1080p)",
    "url": "https://cc-4bhi5osabejc9.akamaized.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-4bhi5osabejc9/junglebook.m3u8",
    "category": "Kids",
    "logo": "https://pash.ink/storage/uploads/JungleBook_Logo.png",
    "enabled": true,
    "order": 599
  },
  {
    "id": "in-themovieclub-in-hd",
    "name": "The Movie Club (1080p)",
    "url": "https://sis-global.prod.samsungtv.plus/v1/tvpprd/sc-mp2ar4ca425xo.m3u8",
    "category": "Movies",
    "logo": "https://tvpnlogopus.samsungcloud.tv/platform/image/sourcelogo/vc/00/02/34/IN38000072R_20260325T012318SQUARE.png",
    "enabled": true,
    "order": 600
  },
  {
    "id": "in-themovieclub-in-plus2",
    "name": "The Movie Club +2 (1080p)",
    "url": "https://d3gnyty2vddhsg.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/pb-ytipwjqub3kf8/TMC2_IN.m3u8?ads.ads_cdn=cf&ads.cdn=cf",
    "category": "Movies",
    "logo": "https://tvpnlogopus.samsungcloud.tv/platform/image/sourcelogo/vc/00/02/34/IN40000100Y_20260204T004058SQUARE.png",
    "enabled": true,
    "order": 601
  },
  {
    "id": "in-thepetcollective-us-india",
    "name": "The Pet Collective India",
    "url": "https://the-pet-collective-international-in.samsung.wurl.tv/playlist.m3u8",
    "category": "General",
    "logo": "https://i.imgur.com/yH7n2dF.png",
    "enabled": true,
    "order": 602
  },
  {
    "id": "in-thevoicetv-in-sd",
    "name": "The Voice TV (1080p)",
    "url": "https://legitpro.co.in/thevoicetv/thevoicetv/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/thevoicetv.png",
    "enabled": true,
    "order": 603
  },
  {
    "id": "in-thendraltv-in-sd",
    "name": "Thendral TV (576p)",
    "url": "https://hls.thendraltv.in/thendraltv_1210b43d/index.m3u8",
    "category": "General",
    "logo": "https://i.imgur.com/kQK80gB.png",
    "enabled": true,
    "order": 604
  },
  {
    "id": "in-timesnow-in-sd",
    "name": "Times Now (720p) [Geo-blocked]",
    "url": "https://dztlhgid9me95.cloudfront.net/live-tv/Vidgyor/timesnow/timesnow_master.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_TIMES_NOW/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 605
  },
  {
    "id": "in-timesnownavbharat-in-sd",
    "name": "Times Now Navbharat (1080p)",
    "url": "https://raw.githubusercontent.com/amazeyourself/adaptive-streams/refs/heads/main/streams/in/YuppTV/TimesNowNavbharat.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_TIMES_NOW_NAVBHARAT_HD/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 606
  },
  {
    "id": "in-timesnownavbharat-in-hd",
    "name": "Times Now Navbharat HD (1080p)",
    "url": "https://yupprestreamliveus.akamaized.net/v1/vglive-sk-717514/main.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_TIMES_NOW_NAVBHARAT_HD/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 607
  },
  {
    "id": "in-tnpnews-in-sd",
    "name": "TNP News (1080p)",
    "url": "https://server.thelegitpro.in/tnpnews/tnpnews/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/TNP_News.png",
    "enabled": true,
    "order": 608
  },
  {
    "id": "in-tollytv-in-hd",
    "name": "Tolly TV (1080p)",
    "url": "https://streams2.sofast.tv/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/13b5735d-52c3-4be0-853d-e0ec0127e708/manifest.m3u8",
    "category": "Movies",
    "logo": "https://d229kpbsb5jevy.cloudfront.net/yuppfast/content/common/channel/logos/aumnrs.png",
    "enabled": true,
    "order": 609
  },
  {
    "id": "in-topnewsmarathi-in-sd",
    "name": "Top News Marathi (1080p)",
    "url": "https://live1.ottlive.co.in/topnewsmarathi/topnewsmarathi/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/topnewsmarathi.png",
    "enabled": true,
    "order": 610
  },
  {
    "id": "in-totalbhakti-in-sd",
    "name": "Total Bhakti (1080p)",
    "url": "https://d34z4embz0hjf6.cloudfront.net/out/v1/d55b3323a9f142638f897378f0b526fe/index.m3u8",
    "category": "Religious",
    "logo": "https://i.imgur.com/LPwRdmF.png",
    "enabled": true,
    "order": 611
  },
  {
    "id": "in-totaltvharyana-in-sd",
    "name": "Total TV Haryana (576p)",
    "url": "https://cdn.pishow.tv/ott/live/1522/master.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_TOTAL_TV/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 612
  },
  {
    "id": "in-travelxp-in-4khdr",
    "name": "Travelxp 4K HDR (2160p) [Geo-blocked]",
    "url": "https://deltatesttatasky.akamaized.net/out/i/968284.m3u8",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_TRAVELXP/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 613
  },
  {
    "id": "in-travelxp-in-hd",
    "name": "Travelxp HD (1080p)",
    "url": "http://103.151.60.162:2122/play/a01s/index.m3u8?hls",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_TRAVELXP/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 614
  },
  {
    "id": "in-tv5kannada-in-sd",
    "name": "TV5 Kannada (576p)",
    "url": "https://mumt07.tangotv.in/zHjX9OFlTV5KANNADA/index.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s144024_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 615
  },
  {
    "id": "in-tv5news-in-sd",
    "name": "TV5 News (576p)",
    "url": "https://yuppmedtaorire.akamaized.net/v1/master/a0d007312bfd99c47f76b77ae26b1ccdaae76cb1/tv5_nim_https/110322/tv5/playlist.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_TV5_TELUGU/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 616
  },
  {
    "id": "in-tv7bharat-in-sd",
    "name": "TV7 Bharat (576p)",
    "url": "https://stream.ottlive.co.in/tv7bharat/index.m3u8",
    "category": "News",
    "logo": "https://tv7bharat.tv/wp-content/uploads/2023/07/Logo-Bharat.jpg",
    "enabled": true,
    "order": 617
  },
  {
    "id": "in-tv9bangla-in-sd",
    "name": "TV9 Bangla (720p)",
    "url": "https://dyjmyiv3bp2ez.cloudfront.net/pub-iotv9banaen8yq/liveabr/playlist.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_TV9_BANGLA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 618
  },
  {
    "id": "in-tv9bharatvarsh-in-sd",
    "name": "TV9 Bharatvarsh (720p)",
    "url": "https://dyjmyiv3bp2ez.cloudfront.net/pub-iotv9hinjzgtpe/liveabr/playlist.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_TV9_BHARATVARSH/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 619
  },
  {
    "id": "in-tv9gujarati-in-sd",
    "name": "TV9 Gujarati (720p)",
    "url": "https://dyjmyiv3bp2ez.cloudfront.net/pub-iotv9guj3ki8lu/liveabr/playlist.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_TV9_GUJARATI/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 620
  },
  {
    "id": "in-tv9kannada-in-sd",
    "name": "TV9 Kannada (576p)",
    "url": "https://streams.tangotv.in/TV9KANNADA/ORIGIN/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_TV9_KANNADA/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 621
  },
  {
    "id": "in-tv9marathi-in-sd",
    "name": "TV9 Marathi (720p)",
    "url": "https://dyjmyiv3bp2ez.cloudfront.net/pub-iotv9marlygv8h/liveabr/playlist.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_TV9_MARATHI/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 622
  },
  {
    "id": "in-tv9telugu-in-sd",
    "name": "TV9 Telugu (720p)",
    "url": "https://dyjmyiv3bp2ez.cloudfront.net/pub-iotv9telcmjhcs/liveabr/playlist.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_TV9_TELUGU_NEWS/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 623
  },
  {
    "id": "in-tv13gujarati-in-sd",
    "name": "TV13 Gujarati (480p)",
    "url": "https://live.wrencdn.in/wrencdn/hls/tv13_web/index.m3u8",
    "category": "News",
    "logo": "https://www.tv13gujarati.com/assets/front/img/footer-logo.jpg",
    "enabled": true,
    "order": 624
  },
  {
    "id": "in-tv27news-in-sd",
    "name": "TV27 News (360p)",
    "url": "https://mumt04.tangotv.in/m18aqlK4TV27/index.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/TV27_News.png",
    "enabled": true,
    "order": 625
  },
  {
    "id": "in-tv30india-in-sd",
    "name": "TV30 India (1080p)",
    "url": "https://stream.tv30bharat.com/hls/shree/bhattji.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/TV30India.png",
    "enabled": true,
    "order": 626
  },
  {
    "id": "in-tv45-in-sd",
    "name": "TV45 (1080p)",
    "url": "https://server.livelegitpro.in/bnews24/bnews24/video.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/TV45.png",
    "enabled": true,
    "order": 627
  },
  {
    "id": "in-tvbricsenglish-in-sd",
    "name": "TV BRICS English (1080p)",
    "url": "https://engbrics.mediacdn.ru/cdn/brics/english/playlist.m3u8",
    "category": "General",
    "logo": "https://i.imgur.com/8rKNuS6.png",
    "enabled": true,
    "order": 628
  },
  {
    "id": "in-tvpunjab-ca-sd",
    "name": "TV Punjab (720p) [Geo-blocked]",
    "url": "https://932y483pdjv8-hls-live.5centscdn.com/stream/deb10bae362f810630ec3abedcae5894.sdp/playlist.m3u8",
    "category": "News",
    "logo": "https://en.tvpunjab.com/storage/2022/03/logo-2022.png",
    "enabled": true,
    "order": 629
  },
  {
    "id": "in-ubangla-in-sd",
    "name": "U Bangla (1080p)",
    "url": "https://stream.ottlive.co.in/ubangla/index.m3u8",
    "category": "General",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/U_Bangla.png",
    "enabled": true,
    "order": 630
  },
  {
    "id": "in-ultimatetv-in-sd",
    "name": "Ultimate TV (1080p)",
    "url": "https://stream.ottlive.co.in/utvtamil/index.m3u8",
    "category": "Music",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/utvtamil.png",
    "enabled": true,
    "order": 631
  },
  {
    "id": "in-uniquetv-in-sd",
    "name": "Unique TV (576p)",
    "url": "https://mumt05.tangotv.in/87NeALx2UNIQUETV/index.m3u8",
    "category": "Entertainment",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Unique_Tv.png",
    "enabled": true,
    "order": 632
  },
  {
    "id": "in-upnow-in-sd",
    "name": "UP NOW (720p)",
    "url": "http://45.122.122.61:8080/UPNOW/video.m3u8",
    "category": "News",
    "logo": "https://papaji.freetvindia.com/media/channels/Upnow.png",
    "enabled": true,
    "order": 633
  },
  {
    "id": "in-utvpalakkad-in-sd",
    "name": "UTV Palakkad (1080p)",
    "url": "https://em4qj6nedyvg-hls-live.wmncdn.net/liveunit/89b1e919eed04e59383cf820d644c20e.sdp/playlist.m3u8",
    "category": "General",
    "logo": "https://utvpkd.in/assets/img/logo.png",
    "enabled": true,
    "order": 634
  },
  {
    "id": "in-v6news-in-sd",
    "name": "V6 News (576p)",
    "url": "https://yuppmedtaorire.akamaized.net/v1/master/a0d007312bfd99c47f76b77ae26b1ccdaae76cb1/v6news_nim_https/140622/v6news/playlist.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/s144047_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 635
  },
  {
    "id": "in-vaanaviltv-in-sd",
    "name": "Vaanavil TV (720p)",
    "url": "https://6n3yope4d9ok-hls-live.5centscdn.com/vaanavil/TV.stream/playlist.m3u8",
    "category": "Music",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Vaanavil_TV.png",
    "enabled": true,
    "order": 636
  },
  {
    "id": "in-valamtvdayro-in-sd",
    "name": "Valam TV Dayro (576p)",
    "url": "https://mumt03.tangotv.in/Dsly5z3HVALAMDAIRO/index.m3u8",
    "category": "Religious",
    "logo": "https://papaji.freetvindia.com/media/channels/Valam_Dayro.png",
    "enabled": true,
    "order": 637
  },
  {
    "id": "in-vanithatv-in-sd",
    "name": "Vanitha TV (576p)",
    "url": "https://mumt01.tangotv.in/O5aw8Zn3VANITHA/index.m3u8",
    "category": "Entertainment",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Vanitha.png",
    "enabled": true,
    "order": 638
  },
  {
    "id": "in-vasanthtv-in-sd",
    "name": "Vasanth TV (576p)",
    "url": "https://mumt04.tangotv.in/m18aqlK4VASANTHTV/index.m3u8",
    "category": "Entertainment",
    "logo": "https://dtil.tmsimg.com/assets/s144068_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 639
  },
  {
    "id": "in-vedic-in-sd",
    "name": "Vedic (576p)",
    "url": "https://mumt05.tangotv.in/87NeALx2VEDIC/index.m3u8",
    "category": "Religious",
    "logo": "https://dtil.tmsimg.com/assets/s144069_ld_h15_aa.png?lock=720x540",
    "enabled": true,
    "order": 640
  },
  {
    "id": "in-velichamtv-in-sd",
    "name": "Velicham TV (576p)",
    "url": "https://mumt05.tangotv.in/87NeALx2VALICHAMPLUS/index.m3u8",
    "category": "News",
    "logo": "https://upload.wikimedia.org/wikipedia/en/e/e4/Logo_of_Velicham_TV.png",
    "enabled": true,
    "order": 641
  },
  {
    "id": "in-vendhartv-in-sd",
    "name": "Vendhar TV (576p)",
    "url": "https://mumt04.tangotv.in/m18aqlK4VENDHARTV/index.m3u8",
    "category": "Entertainment",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Vendhar_TV.png",
    "enabled": true,
    "order": 642
  },
  {
    "id": "in-villagetv-in-sd",
    "name": "Village TV (1080p)",
    "url": "https://live.villagetv.net/villagetv/hd/index.m3u8",
    "category": "Religious",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/VillageTV.png",
    "enabled": true,
    "order": 643
  },
  {
    "id": "in-vipnews-in-sd",
    "name": "VIP News (360p)",
    "url": "https://live.vipnews24x7.co.in/vipnews24x7/d0dbe915091d400bd8ee7f27f0791303.sdp/playlist.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_VIP_NEWS/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 644
  },
  {
    "id": "in-vision-in-sd",
    "name": "Vision (India) (576p)",
    "url": "http://103.85.204.205:1935/VISIONMEDIA/live/playlist.m3u8",
    "category": "General",
    "logo": "https://i.imgur.com/YozqNL3.jpg",
    "enabled": true,
    "order": 645
  },
  {
    "id": "in-vissatv-in-sd",
    "name": "Vissa TV (576p)",
    "url": "https://mumt07.tangotv.in/zHjX9OFlVISSATV/index.m3u8",
    "category": "Entertainment",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_VISSA_TV/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 646
  },
  {
    "id": "in-vistaarnews-in-sd",
    "name": "Vistaar News (1080p)",
    "url": "https://stream.ottlive.co.in/vistaartv/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_VISTAAR_NEWS/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 647
  },
  {
    "id": "in-vrlive-in-sd",
    "name": "VR Live (720p)",
    "url": "https://channel.vrlivegujarat.com/hls/vrchannel.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/VRLive.png",
    "enabled": true,
    "order": 648
  },
  {
    "id": "in-vtu-in-sd",
    "name": "VTU (1080p)",
    "url": "https://lbgo.bozztv.com/ssh101/ssh101/afghantheatretv/playlist.m3u8",
    "category": "General",
    "logo": "https://i.imgur.com/zMwZRGJ.png",
    "enabled": true,
    "order": 649
  },
  {
    "id": "in-vtvnews-in-sd",
    "name": "VTV News (576p)",
    "url": "https://live1.ottlive.co.in/vtvgujarati/vtvgujarati/index.m3u8",
    "category": "News",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_VTV_GUJARATI/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 650
  },
  {
    "id": "in-vyaschannel-in-sd",
    "name": "Vyas Channel (576p)",
    "url": "https://playhls.media.nic.in/hls/live/vyas/vyas.m3u8",
    "category": "Education",
    "logo": "https://www.yupptv.com/seo_img/UGC_GEC_big.jpg",
    "enabled": true,
    "order": 651
  },
  {
    "id": "in-weatherspy-in-sd",
    "name": "WeatherSpy (India)",
    "url": "https://jukin-weatherspy-2-in.samsung.wurl.tv/playlist.m3u8",
    "category": "Weather",
    "logo": "https://i.imgur.com/KIEKOt1.png",
    "enabled": true,
    "order": 652
  },
  {
    "id": "in-worldpunjabitv-in-sd",
    "name": "World Punjabi TV (1080p)",
    "url": "https://live1.ottlive.co.in/worldpunjabitv/worldpunjabitv/index.m3u8",
    "category": "News",
    "logo": "https://papaji.freetvindia.com/media/World_Punjabi_TV.png",
    "enabled": true,
    "order": 653
  },
  {
    "id": "in-wowkidz-in-hindi",
    "name": "WOW Kidz (720p)",
    "url": "https://yuppparoriglin.akamaized.net/181224/smil:wowkidzhindi.smil/playlist.m3u8?hdnts=st=1735898689~exp=1835898688~acl=*~hmac=f5fe24724fe05481e3841f9eb5ab8efdee0a3dd83645ae9dcf45703f525bab7b",
    "category": "Kids",
    "logo": "https://d229kpbsb5jevy.cloudfront.net/yupptvnew/content/common/channel/logos/mjvezt.png",
    "enabled": true,
    "order": 654
  },
  {
    "id": "in-wowkidz-in-tamil",
    "name": "WOW Kidz Tamil (720p)",
    "url": "https://yuppparoriglin.akamaized.net/181224/smil:wowkidztam.smil/playlist.m3u8?hdnts=st=1735898689~exp=1835898688~acl=*~hmac=f5fe24724fe05481e3841f9eb5ab8efdee0a3dd83645ae9dcf45703f525bab7b",
    "category": "Kids",
    "logo": "https://d229kpbsb5jevy.cloudfront.net/yupptvnew/content/common/channel/logos/mjvezt.png",
    "enabled": true,
    "order": 655
  },
  {
    "id": "in-wowkidz-in-telugu",
    "name": "WOW Kidz Telugu (720p)",
    "url": "https://yuppparoriglin.akamaized.net/181224/smil:wowkidztelgu.smil/playlist.m3u8?hdnts=st=1735898689~exp=1835898688~acl=*~hmac=f5fe24724fe05481e3841f9eb5ab8efdee0a3dd83645ae9dcf45703f525bab7b",
    "category": "Kids",
    "logo": "https://d229kpbsb5jevy.cloudfront.net/yupptvnew/content/common/channel/logos/mjvezt.png",
    "enabled": true,
    "order": 656
  },
  {
    "id": "in-yrfmusic-in-sd",
    "name": "YRF Music (1080p)",
    "url": "https://cdn-uw2-prod.tsv2.amagi.tv/linear/amg01412-xiaomiasia-yrfmusic-xiaomi/playlist.m3u8",
    "category": "Music",
    "logo": "https://i.imgur.com/pKj3F4M.png",
    "enabled": true,
    "order": 657
  },
  {
    "id": "in-yrfmusic-in-nepal",
    "name": "YRF Music Nepal",
    "url": "https://vidaa.kableone.com/hls/live/2111218/YrfMusic/1.m3u8",
    "category": "Music",
    "logo": "https://i.imgur.com/mxx05Z9.png",
    "enabled": true,
    "order": 658
  },
  {
    "id": "in-zainabiachannel-in-sd",
    "name": "Zainabia Channel",
    "url": "https://zainabia.livebox.co.in/ZainabiaChannelhls/channel.m3u8",
    "category": "Religious",
    "enabled": true,
    "order": 659
  },
  {
    "id": "in-zbbhakti-in-hd",
    "name": "ZB Bhakti (720p)",
    "url": "https://server.zillarbarta.com/zbbhakti/index.m3u8",
    "category": "Religious",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/zbbhakti.png",
    "enabled": true,
    "order": 660
  },
  {
    "id": "in-zbcartoon-in-hd",
    "name": "ZB Cartoon (1080p)",
    "url": "https://server.zillarbarta.com/zbcatun/video.m3u8",
    "category": "Kids",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/zbcatun.png",
    "enabled": true,
    "order": 661
  },
  {
    "id": "in-zee24kalak-in-sd",
    "name": "Zee 24 Kalak (720p)",
    "url": "https://vg-zeefta.akamaized.net/ptnr-yupptv/title-zee24kalak/v1/manifest/611d79b11b77e2f571934fd80ca1413453772ac7/497f7199-758d-495d-9d2f-a5489231c428/14b7c8ec-16da-47f2-8d7e-5bbaec67b3e2/3.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG00230P1R.png?lock=720x540",
    "enabled": true,
    "order": 662
  },
  {
    "id": "in-zee24taas-in-sd",
    "name": "Zee 24 Taas (720p)",
    "url": "https://dgrvlduwztkd4.cloudfront.net/index_5.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG00230LKE.png?lock=720x540",
    "enabled": true,
    "order": 663
  },
  {
    "id": "in-zeeaction-in-sd",
    "name": "Zee Action (576p)",
    "url": "http://107.167.16.138/zeeaction/index.m3u8?token=test",
    "category": "Movies",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG0022K5ZV.png?lock=720x540",
    "enabled": true,
    "order": 664
  },
  {
    "id": "in-zeebangla-in-sd",
    "name": "Zee Bangla (576p)",
    "url": "http://103.151.60.162:2122/play/a011/index.m3u8?hls",
    "category": "Entertainment",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_ZEE_BANGLA_HD/images/LOGO_HD/LOGO_HD_image.png",
    "enabled": true,
    "order": 665
  },
  {
    "id": "in-zeebangla-in-hd",
    "name": "Zee Bangla HD (1080p)",
    "url": "http://103.151.60.162:2122/play/a02p/index.m3u8?hls",
    "category": "Entertainment",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_ZEE_BANGLA/images/LOGO_HD/LOGO_HD_image.png",
    "enabled": true,
    "order": 666
  },
  {
    "id": "in-zeebanglasonar-in-sd",
    "name": "Zee Bangla Sonar (576p)",
    "url": "https://d1g8wgjurz8via.cloudfront.net/bpk-tv/ColorsHD/default/ColorsHD.m3u8",
    "category": "Entertainment",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG00287G7K.png?lock=720x540",
    "enabled": true,
    "order": 667
  },
  {
    "id": "in-zeebharat-in-sd",
    "name": "Zee Bharat (720p)",
    "url": "https://vg-zeefta.akamaized.net/ptnr-yupptv/title-zeehindustan/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/96bbab12-582e-4540-af70-510ab6824581/main.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG00230QBL.png?lock=720x540",
    "enabled": true,
    "order": 668
  },
  {
    "id": "in-zeebiharjharkhand-in-sd",
    "name": "Zee Bihar Jharkhand (720p)",
    "url": "https://raw.githubusercontent.com/amazeyourself/adaptive-streams/refs/heads/main/streams/in/YuppTV/ZeeBiharJharkhand.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG00230Y44.png?lock=720x540",
    "enabled": true,
    "order": 669
  },
  {
    "id": "in-zeebusiness-in-sd",
    "name": "Zee Business (720p)",
    "url": "https://dwby15d04agvq.cloudfront.net/index_5.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG00230YYJ.png?lock=720x540",
    "enabled": true,
    "order": 670
  },
  {
    "id": "in-zeecineclassic-in-sd",
    "name": "Zee Cine Classic (1080p)",
    "url": "https://amg00862-amg00862c8-amgplt0173.playout.now3.amagi.tv/playlist/amg00862-amg00862c8-amgplt0173/playlist.m3u8",
    "category": "General",
    "logo": "https://i.imgur.com/QCRhS1n.png",
    "enabled": true,
    "order": 671
  },
  {
    "id": "in-zeecinema-in-sd",
    "name": "Zee Cinema (576p)",
    "url": "https://d1g8wgjurz8via.cloudfront.net/bpk-tv/NGCHD/default/NGCHD.m3u8",
    "category": "Movies",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_ZEE_CINEMA/images/LOGO_HD/LOGO_HD_image.png",
    "enabled": true,
    "order": 672
  },
  {
    "id": "in-zeecinema-in-hd",
    "name": "Zee Cinema HD (1080p)",
    "url": "http://103.151.60.162:2122/play/a024/index.m3u8?hls",
    "category": "Movies",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_ZEE_CINEMA/images/LOGO_HD/LOGO_HD_image.png",
    "enabled": true,
    "order": 673
  },
  {
    "id": "in-zeeclassic-in-sd",
    "name": "Zee Classic (576p)",
    "url": "http://107.167.16.138/zeeclassic/index.m3u8?token=test",
    "category": "General",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_ZEE_CLASSIC/images/LOGO_HD/LOGO_HD_image.png",
    "enabled": true,
    "order": 674
  },
  {
    "id": "in-zeecomedynation-in-hd",
    "name": "Zee Comedy Nation (1080p)",
    "url": "https://amg00862-amg00862c5-amgplt0173.playout.now3.amagi.tv/playlist/amg00862-amg00862c5-amgplt0173/playlist.m3u8",
    "category": "Entertainment",
    "logo": "https://tvpnlogopus.samsungcloud.tv/platform/image/sourcelogo/vc/00/02/34/IN2100002GD_20260325T012327SQUARE.png",
    "enabled": true,
    "order": 675
  },
  {
    "id": "in-zeedelhincrharyana-in-sd",
    "name": "Zee Delhi NCR Haryana (720p)",
    "url": "https://vg-zeefta.akamaized.net/ptnr-yupptv/title-zeedelhincr/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/cc483a15-1b39-4642-872d-5d08d362ed01/main.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG0023166M.png?lock=720x540",
    "enabled": true,
    "order": 676
  },
  {
    "id": "in-zeedilse-in-hd",
    "name": "Zee Dil Se (1080p)",
    "url": "https://amg00862-amg00862c6-amgplt0173.playout.now3.amagi.tv/playlist/amg00862-amg00862c6-amgplt0173/playlist.m3u8",
    "category": "Entertainment",
    "logo": "https://d2mxb63djushzm.cloudfront.net/images/Zee_Dil_Se.png",
    "enabled": true,
    "order": 677
  },
  {
    "id": "in-zeehorrornights-in-hd",
    "name": "Zee Horror Nights (1080p)",
    "url": "https://amg00862-amg00862c7-amgplt0173.playout.now3.amagi.tv/playlist/amg00862-amg00862c7-amgplt0173/playlist.m3u8",
    "category": "Entertainment",
    "logo": "https://d3bd0tgyk368z1.cloudfront.net/zeelg/LG%20logo%20artwork/400x200/zhornights.png",
    "enabled": true,
    "order": 678
  },
  {
    "id": "in-zeekannada-in-hd",
    "name": "Zee Kannada HD (1080p)",
    "url": "https://yuppnimresmum.akamaized.net/28072023/smil:zeekannadahd.smil/playlist.m3u8?hdnts=st=1735898689~exp=1835898688~acl=*~hmac=f5fe24724fe05481e3841f9eb5ab8efdee0a3dd83645ae9dcf45703f525bab7b",
    "category": "Entertainment",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_ZEE_KANNADA_HD/images/LOGO_HD/LOGO_HD_image.png",
    "enabled": true,
    "order": 679
  },
  {
    "id": "in-zeekannadanews-in-sd",
    "name": "Zee Kannada News (720p)",
    "url": "https://d3vzwoqcbpfm8p.cloudfront.net/index_4.m3u8",
    "category": "News",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Zee_Kannada_News.png",
    "enabled": true,
    "order": 680
  },
  {
    "id": "in-zeemadhyapradeshchhattisgarh-in-sd",
    "name": "Zee Madhya Pradesh Chhattisgarh (720p)",
    "url": "https://vg-zeefta.akamaized.net/ptnr-yupptv/title-zeemadhyachhattisgarh/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/2ab17056-6187-4f0e-a34d-f436ac479d6c/main.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG002316X5.png?lock=720x540",
    "enabled": true,
    "order": 681
  },
  {
    "id": "in-zeemarathi-in-hd",
    "name": "Zee Marathi HD (720p)",
    "url": "https://raw.githubusercontent.com/amazeyourself/adaptive-streams/refs/heads/main/streams/in/YuppTV/ZeeMarathiHD.m3u8",
    "category": "Entertainment",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_ZEE_MARATHI/images/LOGO_HD/LOGO_HD_image.png",
    "enabled": true,
    "order": 682
  },
  {
    "id": "in-zeenews-in-sd",
    "name": "Zee News (1080p)",
    "url": "https://dknttpxmr0dwf.cloudfront.net/index_57.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG0023VWYC.png?lock=720x540",
    "enabled": true,
    "order": 683
  },
  {
    "id": "in-zeepunjabharyanahimachal-in-sd",
    "name": "Zee Punjab Haryana Himachal (720p)",
    "url": "https://vg-zeefta.akamaized.net/ptnr-yupptv/title-zeepunjabharyanahima/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/65eed269-2f3a-4dd0-ac89-d18959af28e3/main.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG0022KHKS.png?lock=720x540",
    "enabled": true,
    "order": 684
  },
  {
    "id": "in-zeerajasthan-in-sd",
    "name": "Zee Rajasthan (720p)",
    "url": "https://vg-zeefta.akamaized.net/ptnr-yupptv/title-zeerajashthannews/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/8e864b9a-1681-41a0-99a6-387490bc5b24/main.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG00231732.png?lock=720x540",
    "enabled": true,
    "order": 685
  },
  {
    "id": "in-zeesouthflix-in-hd",
    "name": "Zee South Flix (1080p)",
    "url": "https://amg00862-amg00862c9-amgplt0173.playout.now3.amagi.tv/playlist/amg00862-amg00862c9-amgplt0173/playlist.m3u8",
    "category": "Movies",
    "logo": "https://d3bd0tgyk368z1.cloudfront.net/zeelg/LG%20logo%20artwork/400x200/zsouthflix.png",
    "enabled": true,
    "order": 686
  },
  {
    "id": "in-zeetalkies-in-sd",
    "name": "Zee Talkies (576p)",
    "url": "http://107.167.16.138/zeetalkies/index.m3u8?token=test",
    "category": "Movies",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_ZEE_TALKIES/images/LOGO_HD/LOGO_HD_image.png",
    "enabled": true,
    "order": 687
  },
  {
    "id": "in-zeetamil-in-hd",
    "name": "Zee Tamil HD (720p)",
    "url": "https://da86m1sqpm3o0.cloudfront.net/28072023/smil:zeetamil1.smil/playlist.m3u8",
    "category": "Entertainment",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG00233WCL.png?lock=720x540",
    "enabled": true,
    "order": 688
  },
  {
    "id": "in-zeetamilnews-in-sd",
    "name": "Zee Tamil News (720p)",
    "url": "https://raw.githubusercontent.com/amazeyourself/adaptive-streams/refs/heads/main/streams/in/ZMCL/ZeeTamilNews.m3u8",
    "category": "News",
    "logo": "https://english.cdn.zeenews.com/images/logo/zee-tamil-logo-20.svg",
    "enabled": true,
    "order": 689
  },
  {
    "id": "in-zeetelugunews-in-sd",
    "name": "Zee Telugu News (720p)",
    "url": "https://d116gfrn8orazi.cloudfront.net/index.m3u8?akes=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3NjcxOTc5NzJ9.O4qmdMPbHwKrCg6hFXvD70vjSPWKQd0a7NrjmFdeMB8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG0023178R.png?lock=720x540",
    "enabled": true,
    "order": 690
  },
  {
    "id": "in-zeetv-in-sd",
    "name": "Zee TV (576p)",
    "url": "http://103.151.60.162:2122/play/a01u/index.m3u8?hls",
    "category": "Entertainment",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_ZEE_TV/images/LOGO_HD/LOGO_HD_image.png",
    "enabled": true,
    "order": 691
  },
  {
    "id": "in-zeeuttarpradeshuttarakhand-in-sd",
    "name": "Zee Uttar Pradesh/Uttarakhand (720p)",
    "url": "https://duw35ict5q7th.cloudfront.net/index_3.m3u8",
    "category": "News",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG002317GQ.png?lock=720x540",
    "enabled": true,
    "order": 692
  },
  {
    "id": "in-zillarbartanews-in-hd",
    "name": "ZillarBarta News",
    "url": "https://server.zillarbarta.com/zillarbarta/index.m3u8",
    "category": "General",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/zillarbarta.png",
    "enabled": true,
    "order": 693
  },
  {
    "id": "in-zing-in-sd",
    "name": "Zing! (576p)",
    "url": "http://107.167.16.138/zing/index.m3u8?token=test",
    "category": "Music",
    "logo": "https://dtil.tmsimg.com/assets/GNLZZGG0025L26R.png?lock=720x540",
    "enabled": true,
    "order": 694
  },
  {
    "id": "in-zodiaktv-in-sd",
    "name": "Zodiak TV (1080p)",
    "url": "https://ranacable.duckdns.org/ZodiakTv/index.m3u8",
    "category": "Entertainment",
    "logo": "https://i.imgur.com/gE166hZ.jpeg",
    "enabled": true,
    "order": 695
  },
  {
    "id": "in-zoom-in-sd",
    "name": "Zoom (India) (720p)",
    "url": "https://dai.google.com/linear/hls/event/JCAm25qkRXiKcK1AJMlvKQ/master.m3u8",
    "category": "Music",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_ZOOM/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 696
  },
  {
    "id": "in-zoom-in-nepal",
    "name": "Zoom (India) Nepal (720p)",
    "url": "https://pubads.g.doubleclick.net/ssai/event/JCAm25qkRXiKcK1AJMlvKQ/master.m3u8",
    "category": "Music",
    "logo": "https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_ZOOM/images/LOGO_HD/image.png",
    "enabled": true,
    "order": 697
  },
  {
    "id": "cat-30agolfkingdom-us-sd",
    "name": "30A Golf Kingdom (720p)",
    "url": "https://30a-tv.com/feeds/vidaa/golf.m3u8",
    "category": "Sports",
    "logo": "https://i.imgur.com/Lv53nh4.png",
    "enabled": true,
    "order": 698
  },
  {
    "id": "cat-aspor-tr-sd",
    "name": "A Spor SD (1080p)",
    "url": "https://rnttwmjcin.turknet.ercdn.net/lcpmvefbyo/aspor/aspor.m3u8",
    "category": "Sports",
    "logo": "https://i.imgur.com/ZhkZzLf.png",
    "enabled": true,
    "order": 699
  },
  {
    "id": "cat-accdigitalnetwork-us-sd",
    "name": "ACC Digital Network (1080p)",
    "url": "https://raycom-accdn-firetv.amagi.tv/playlist.m3u8",
    "category": "Sports",
    "logo": "https://i.imgur.com/V6Kaqha.png",
    "enabled": true,
    "order": 700
  },
  {
    "id": "cat-accnetwork-us-sd",
    "name": "ACC Network (720p)",
    "url": "http://23.239.31.26:8989/accnetwork/index.m3u8",
    "category": "Sports",
    "logo": "https://i.imgur.com/TpCkbkT.png",
    "enabled": true,
    "order": 701
  },
  {
    "id": "cat-adotv-bj-sd",
    "name": "ADO TV (720p)",
    "url": "https://strhls.streamakaci.tv/ortb/ortb2-multi/playlist.m3u8",
    "category": "Sports",
    "logo": "https://i.imgur.com/pxFamLr.png",
    "enabled": true,
    "order": 702
  },
  {
    "id": "cat-aliraqiasport-iq-sd",
    "name": "Al Iraqia Sport (720p)",
    "url": "https://imn-live.esite-lab.com/hls/iraqia-sports-1.m3u8",
    "category": "Sports",
    "logo": "https://i.imgur.com/DrrlxTO.png",
    "enabled": true,
    "order": 703
  },
  {
    "id": "cat-arena4-hu-sd",
    "name": "Arena4",
    "url": "http://88.212.15.17/live/arena4/index.m3u8",
    "category": "Sports",
    "logo": "https://i.imgur.com/uAaQDr6.png",
    "enabled": true,
    "order": 704
  },
  {
    "id": "cat-arenasport1-sk-sd",
    "name": "like Gecko) Chrome/149.0.0.0 Safari/537.3\" group-title=\"Sports\",Arena Sport 1",
    "url": "http://88.212.15.19/live/test_arenasport/playlist.m3u8",
    "category": "Sports",
    "logo": "https://i.imgur.com/2qf67zW.png",
    "enabled": true,
    "order": 705
  },
  {
    "id": "cat-arenasport2-sk-sd",
    "name": "like Gecko) Chrome/149.0.0.0 Safari/537.3\" group-title=\"Sports\",Arena Sport 2",
    "url": "http://88.212.15.19/live/test_arenasport_dva/playlist.m3u8",
    "category": "Sports",
    "logo": "https://i.imgur.com/Yq3Jf19.png",
    "enabled": true,
    "order": 706
  },
  {
    "id": "cat-arryadia-ma-sd",
    "name": "Arryadia (720p)",
    "url": "http://149.100.11.252:8000/play/a065/index.m3u8",
    "category": "Sports",
    "logo": "https://i.imgur.com/XjzK3gZ.png",
    "enabled": true,
    "order": 707
  },
  {
    "id": "cat-as3sporttv-ve-sd",
    "name": "AS3 Sport TV (1080p)",
    "url": "https://streamtv.as3sport.online:3394/hybrid/play.m3u8",
    "category": "Sports",
    "logo": "https://i.ibb.co/bRmGbsyV/A3-SPORTTV.jpg",
    "enabled": true,
    "order": 708
  },
  {
    "id": "cat-astrahanrusport-ru-sd",
    "name": "Astrahan.Ru Sport (720p)",
    "url": "https://streaming.astrakhan.ru/astrakhanrusporthd/playlist.m3u8",
    "category": "Sports",
    "logo": "https://i.imgur.com/BKaEtqL.png",
    "enabled": true,
    "order": 709
  },
  {
    "id": "cat-atglive-se-sd",
    "name": "ATG Live (720p)",
    "url": "https://kanal75xto-llhls.akamaized.net/live/Data/atg-kanal-15-02a-rr/HLS-Legacy-HL/atg-kanal-15-02a-rr.m3u8",
    "category": "Sports",
    "logo": "https://i.imgur.com/bPWFXkL.png",
    "enabled": true,
    "order": 710
  },
  {
    "id": "cat-aymsports-mx-sd",
    "name": "AyM Sports (1080p)",
    "url": "http://168.196.127.137:6001/play/a06v/index.m3u8",
    "category": "Sports",
    "logo": "https://i.imgur.com/yu3Bpbd.png",
    "enabled": true,
    "order": 711
  },
  {
    "id": "cat-aztecadeportesnetwork-mx-sd",
    "name": "Azteca Deportes Network (1080p)",
    "url": "http://181.119.66.28:8081/AZTECA-DEPORTES-HD/index.m3u8",
    "category": "Sports",
    "logo": "https://match-images.icdb.tv/5913207f2494844101287828e87625eb.jpg",
    "enabled": true,
    "order": 712
  },
  {
    "id": "cat-bahrainsports1-bh-sd",
    "name": "Bahrain Sports 1 (720p) [Not 24/7]",
    "url": "https://5c7b683162943.streamlock.net/live/ngrp:sportsone_all/playlist.m3u8",
    "category": "Sports",
    "logo": "https://i.imgur.com/fBpLsbC.png",
    "enabled": true,
    "order": 713
  },
  {
    "id": "cat-bahrainsports2-bh-sd",
    "name": "Bahrain Sports 2 (720p) [Not 24/7]",
    "url": "https://5c7b683162943.streamlock.net/live/ngrp:bahrainsportstwo_all/playlist.m3u8",
    "category": "Sports",
    "logo": "https://i.imgur.com/ZkuZmIo.png",
    "enabled": true,
    "order": 714
  },
  {
    "id": "cat-beinsportsxtra-us-sd",
    "name": "beIN SPORTS XTRA (1080p)",
    "url": "https://bein-xtra-bein.amagi.tv/playlist.m3u8",
    "category": "Sports",
    "logo": "https://i.ibb.co/HT49GPmB/XTRA-2.png",
    "enabled": true,
    "order": 715
  },
  {
    "id": "cat-beksports-us-west",
    "name": "BEK Sports West (720p)",
    "url": "https://cdn3.wowza.com/5/ZWQ1K2NYTmpFbGsr/BEK-WOWZA-1/smil:BEKPRIMEW.smil/playlist.m3u8",
    "category": "Sports",
    "logo": "https://i.imgur.com/1l3t5jd.png",
    "enabled": true,
    "order": 716
  },
  {
    "id": "cat-belarus5-by-sd",
    "name": "Belarus-5 (1080p) [Not 24/7]",
    "url": "https://ngtrk.dc.beltelecom.by/ngtrk/smil:belarus5.smil/playlist.m3u8",
    "category": "Sports",
    "logo": "https://i.imgur.com/NJsRFud.png",
    "enabled": true,
    "order": 717
  },
  {
    "id": "cat-belarus5-by-hd",
    "name": "Belarus-5 HD (1080p)",
    "url": "http://178.124.179.122:8080/BT5/index.m3u8",
    "category": "Sports",
    "logo": "https://i.imgur.com/NJsRFud.png",
    "enabled": true,
    "order": 718
  },
  {
    "id": "cat-30aloomeredtv-us-sd",
    "name": "30A Loomered TV",
    "url": "https://30a-tv.com/loomer.m3u8",
    "category": "Documentary",
    "logo": "https://cbs12.com/resources/media/0c1ecad8-fb09-4bb2-beaa-fc561dfe624a-small21x9_LoomerStill.jpg?1603419052801",
    "enabled": true,
    "order": 719
  },
  {
    "id": "cat-365daystv-ru-sd",
    "name": "365 days TV (576p)",
    "url": "http://stream.mcquack.net/70/index.m3u8",
    "category": "Documentary",
    "logo": "https://i.imgur.com/NfnAiTR.png",
    "enabled": true,
    "order": 720
  },
  {
    "id": "cat-adventureearth-de-sd",
    "name": "Adventure Earth (1080p)",
    "url": "https://a57e9c69976649b582a8d7604c00e69a.mediatailor.us-east-1.amazonaws.com/v1/master/44f73ba4d03e9607dcd9bebdcb8494d86964f1d8/RlaxxTV-eu_AdventureEarth/playlist.m3u8",
    "category": "Documentary",
    "logo": "https://d3b6luslimvglo.cloudfront.net/images/79/rlaxximages/channels-rescaled/icon-white/adventureearth_white.png",
    "enabled": true,
    "order": 721
  },
  {
    "id": "cat-alarabiyaprograms-ae-sd",
    "name": "Al Arabiya Programs (1280p)",
    "url": "https://live.alarabiya.net/alarabiapublish/aaprograms.smil/playlist.m3u8",
    "category": "Documentary",
    "logo": "https://i.imgur.com/Hoc3cfO.png",
    "enabled": true,
    "order": 722
  },
  {
    "id": "cat-alternatv-ar-sd",
    "name": "AlternaTV (720p) [Not 24/7]",
    "url": "https://tv.alterna.ar/stream/hls/live.m3u8",
    "category": "Documentary",
    "logo": "https://tv.alterna.ar/alternatv.png",
    "enabled": true,
    "order": 723
  },
  {
    "id": "cat-americanheroeschannel-us-sd",
    "name": "American Heroes Channel (720p)",
    "url": "http://23.237.104.106:8080/USA_AMERICAN_HEROES/index.m3u8",
    "category": "Documentary",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/American_Heroes_Channel_logo.svg/960px-American_Heroes_Channel_logo.svg.png",
    "enabled": true,
    "order": 724
  },
  {
    "id": "cat-animalplanet-ru-sd",
    "name": "Animal Planet (Russia) (1080p)",
    "url": "http://stream.mcquack.net/114/index.m3u8",
    "category": "Documentary",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/2018_Animal_Planet_logo.svg/960px-2018_Animal_Planet_logo.svg.png",
    "enabled": true,
    "order": 725
  },
  {
    "id": "cat-animalplanet-us-east",
    "name": "Animal Planet (United States) (720p)",
    "url": "http://23.239.31.26:8989/animalplanet/index.m3u8",
    "category": "Documentary",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/2018_Animal_Planet_logo.svg/960px-2018_Animal_Planet_logo.svg.png",
    "enabled": true,
    "order": 726
  },
  {
    "id": "cat-animalplanetlatinamerica-us-sd",
    "name": "Animal Planet Latin America (1080p)",
    "url": "http://190.128.214.97:64333/play/a01n/index.m3u8",
    "category": "Documentary",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/2018_Animal_Planet_logo.svg/960px-2018_Animal_Planet_logo.svg.png",
    "enabled": true,
    "order": 727
  },
  {
    "id": "cat-animalplanetlatinamerica-us-hd",
    "name": "Animal Planet Latin America HD (720p) [Geo-blocked]",
    "url": "http://15.204.246.24:8080/AnimalPlanetHD/index.m3u8",
    "category": "Documentary",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/2018_Animal_Planet_logo.svg/960px-2018_Animal_Planet_logo.svg.png",
    "enabled": true,
    "order": 728
  },
  {
    "id": "cat-arsenal-ru-sd",
    "name": "Arsenal (576p)",
    "url": "https://stream8.cinerama.uz/1414/tracks-v1a1/mono.m3u8",
    "category": "Documentary",
    "logo": "https://i.imgur.com/DBpVeb0.png",
    "enabled": true,
    "order": 729
  },
  {
    "id": "cat-asharqdiscovery-sa-sd",
    "name": "Asharq Discovery (1080p)",
    "url": "https://svs.itworkscdn.net/asharqdiscoverylive/asharqd.smil/playlist_dvr.m3u8",
    "category": "Documentary",
    "logo": "https://i.imgur.com/Czxi7yk.png",
    "enabled": true,
    "order": 730
  },
  {
    "id": "cat-asharqdocumentary-sa-sd",
    "name": "Asharq Documentary (1080p)",
    "url": "https://svs.itworkscdn.net/asharqdocumentarylive/asharqdocumentary.smil/playlist_dvr.m3u8",
    "category": "Documentary",
    "logo": "https://i.imgur.com/v6VsFEt.png",
    "enabled": true,
    "order": 731
  },
  {
    "id": "cat-atlas-us-sd",
    "name": "Atlas (480p)",
    "url": "https://cdn.whiplash.cc/whiplash-atlas/index.m3u8",
    "category": "Documentary",
    "logo": "https://whiplash.cc/assets/img/channels/atlas.png",
    "enabled": true,
    "order": 732
  },
  {
    "id": "cat-autentichistory-de-sd",
    "name": "Autentic History (1080p)",
    "url": "https://9e754fa707344ccca6d84955c8fcaf36.mediatailor.us-east-1.amazonaws.com/v1/master/44f73ba4d03e9607dcd9bebdcb8494d86964f1d8/RlaxxTV-eu_AutenticHistory/playlist.m3u8",
    "category": "Documentary",
    "logo": "https://d3b6luslimvglo.cloudfront.net/images/79/rlaxximages/channels-rescaled/icon-white/autentichistory_white.png",
    "enabled": true,
    "order": 733
  },
  {
    "id": "cat-backstage-us-sd",
    "name": "Backstage (1080p)",
    "url": "https://d2ah48mnofquik.cloudfront.net/Backstage.m3u8",
    "category": "Documentary",
    "logo": "https://i.imgur.com/qcTNvNU.png",
    "enabled": true,
    "order": 734
  },
  {
    "id": "cat-bbcearth-uk-poland",
    "name": "BBC Earth (1080p)",
    "url": "http://57.128.231.171:8080/307/index.m3u8",
    "category": "Documentary",
    "logo": "https://i.imgur.com/nGSsUd4.png",
    "enabled": true,
    "order": 735
  },
  {
    "id": "cat-bbcearth-uk-czechia",
    "name": "BBC Earth Czechia",
    "url": "http://88.212.15.29/live/test_bbc_eartch_hevc/playlist.m3u8",
    "category": "Documentary",
    "logo": "https://i.imgur.com/nGSsUd4.png",
    "enabled": true,
    "order": 736
  },
  {
    "id": "cat-bbcearth-uk-hungary",
    "name": "like Gecko) Chrome/120.0.0.0 Safari/537.36\" group-title=\"Documentary\",BBC Earth Hungary",
    "url": "http://88.212.15.19/live/bbce_hun/index.m3u8",
    "category": "Documentary",
    "logo": "https://i.imgur.com/nGSsUd4.png",
    "enabled": true,
    "order": 737
  },
  {
    "id": "cat-bbcearth-uk-us",
    "name": "BBC Earth US (1080p)",
    "url": "https://amg00793-amg00793c6-xumo-us-2669.playouts.now.amagi.tv/BBCStudios-BBCEarthA-hls/playlist.m3u8",
    "category": "Documentary",
    "logo": "https://i.imgur.com/nGSsUd4.png",
    "enabled": true,
    "order": 738
  },
  {
    "id": "cat-bloombergoriginals-us-us",
    "name": "Bloomberg Originals (1080p)",
    "url": "https://bloomberg.com/media-manifest/streams/qt.m3u8",
    "category": "Documentary",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Bloomberg_Originals.png",
    "enabled": true,
    "order": 739
  },
  {
    "id": "cat-bloombergoriginals-us-sd",
    "name": "Bloomberg Originals SD (1080p)",
    "url": "https://86fdc85a.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/TEctZ2JfQmxvb21iZXJnT3JpZ2luYWxzX0hMUw/playlist.m3u8",
    "category": "Documentary",
    "logo": "https://jiotvimages.cdn.jio.com/dare_images/images/Bloomberg_Originals.png",
    "enabled": true,
    "order": 740
  },
  {
    "id": "cat-britboxmysteries-us-sd",
    "name": "BritBox Mysteries (1080p)",
    "url": "https://aegis-cloudfront-1.tubi.video/c95700f8-e51c-4a36-ad46-56f70fc9f1d9/playlist.m3u8",
    "category": "Documentary",
    "logo": "https://i.imgur.com/PJdzoLN.png",
    "enabled": true,
    "order": 741
  },
  {
    "id": "cat-cctv9-cn-sd",
    "name": "CCTV-9 (576i)",
    "url": "https://xykt-fix.github.io/Y77.m3u8",
    "category": "Documentary",
    "logo": "https://i.imgur.com/3tivvMm.png",
    "enabled": true,
    "order": 742
  },
  {
    "id": "cat-cgtndocumentary-cn-sd",
    "name": "CGTN Documentary (1080p)",
    "url": "https://amg00405-rakutentv-cgtndocumentary-rakuten-0ql8j.amagi.tv/master.m3u8",
    "category": "Documentary",
    "logo": "https://i.imgur.com/JHv0WxM.png",
    "enabled": true,
    "order": 743
  },
  {
    "id": "cat-chemodantv-ua-sd",
    "name": "like Gecko) Chrome/130.0.0.0 Safari/537.36\" group-title=\"Documentary;Education\",Chemodan TV (1080p)",
    "url": "http://stream.mcquack.net/399/index.m3u8",
    "category": "Documentary",
    "logo": "https://i.imgur.com/1WjGN8u.png",
    "enabled": true,
    "order": 744
  },
  {
    "id": "cat-chinatravel-cn-sd",
    "name": "China Travel (1080p)",
    "url": "https://fastlive.cctvplus.com/out/v1/ca6f9297b7314a63959435028af287fc/index.m3u8",
    "category": "Documentary",
    "logo": "https://i.imgur.com/vSgY3CD.png",
    "enabled": true,
    "order": 745
  },
  {
    "id": "cat-cityedenkinodok-ru-hd",
    "name": "City Eden KinoDok [Not 24/7]",
    "url": "https://cityeden.catcast.tv/content/38354/index.m3u8",
    "category": "Documentary",
    "logo": "https://i.imgur.com/itRbMX3.png",
    "enabled": true,
    "order": 746
  },
  {
    "id": "cat-clicktvchile-cl-sd",
    "name": "ClickTV Chile (720p)",
    "url": "https://v2.tustreaming.cl/clicktv/playlist.m3u8",
    "category": "Documentary",
    "logo": "https://i.imgur.com/H0XNbMS.png",
    "enabled": true,
    "order": 747
  },
  {
    "id": "cat-3catcameresdeltemps-es-sd",
    "name": "3Cat Cameres del temps (1080p)",
    "url": "https://directes-tv-int.3catdirectes.cat/live-content/beauties-hls/master.m3u8",
    "category": "Weather",
    "logo": "https://i.imgur.com/zXy2kbe.png",
    "enabled": true,
    "order": 748
  },
  {
    "id": "cat-accuweathernow-us-sd",
    "name": "AccuWeather NOW (1080p)",
    "url": "https://cdn-ue1-prod.tsv2.amagi.tv/linear/amg00684-accuweather-accuweather-plex/playlist.m3u8",
    "category": "Weather",
    "logo": "https://i.imgur.com/M8wbVYK.png",
    "enabled": true,
    "order": 749
  },
  {
    "id": "cat-foxweather-us-sd",
    "name": "Fox Weather (720p)",
    "url": "https://247wlive.foxweather.com/stream/index.m3u8",
    "category": "Weather",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Fox_Weather_logo.svg/960px-Fox_Weather_logo.svg.png",
    "enabled": true,
    "order": 750
  },
  {
    "id": "cat-meteonews-ch-sd",
    "name": "Meteonews (1080p)",
    "url": "https://streaming.meteonews.net/hls/stream.m3u8",
    "category": "Weather",
    "logo": "https://i.imgur.com/YtYhbJD.png",
    "enabled": true,
    "order": 751
  },
  {
    "id": "cat-norcastweather-us-hd",
    "name": "NorCast Weather (1080p)",
    "url": "https://norcast-weather.streamology.live/api/v1/streams/c1b5b114698e1ad4687153c4402d5ef0/live.m3u8",
    "category": "Weather",
    "logo": "https://i.imgur.com/AfjoZgo.png",
    "enabled": true,
    "order": 752
  },
  {
    "id": "cat-skynewsweather-uk-sd",
    "name": "Sky News Weather (720p)",
    "url": "https://distro001-gb-hls1-prd.delivery.skycdp.com/easel_cdn/ngrp:weather_loop.stream_all/playlist.m3u8",
    "category": "Weather",
    "logo": "https://pbs.twimg.com/profile_images/1604994875459518464/lGt2wEqM_400x400.jpg",
    "enabled": true,
    "order": 753
  },
  {
    "id": "cat-theweatherchannel-us-sd",
    "name": "The Weather Channel (1080p)",
    "url": "https://twcprod-live.twc-tv.com/v1/manifest/b4d4d63a49309cc5140171fb2e92485c31be1e9e/DSP_6228e4760505741a116f1ba2_twcprod-live/6bf09ce5-366b-463c-b67e-c4b799f73c3f/4.m3u8",
    "category": "Weather",
    "logo": "https://i.imgur.com/PIaNjfa.png",
    "enabled": true,
    "order": 754
  },
  {
    "id": "cat-weathernation-us-sd",
    "name": "WeatherNation (1080p)",
    "url": "https://d2ferbiwcx1539.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-8zd06wicndthf-ssai-prd/WNNationalSamsung/WNNationalSamsung.m3u8",
    "category": "Weather",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/WeatherNation_Logo.svg/960px-WeatherNation_Logo.svg.png",
    "enabled": true,
    "order": 755
  },
  {
    "id": "cat-weathernews-jp-sd",
    "name": "Weathernews (720p)",
    "url": "https://rch01e-alive-hls.akamaized.net/38fb45b25cdb05a1/out/v1/4e907bfabc684a1dae10df8431a84d21/index.m3u8",
    "category": "Weather",
    "logo": "https://i.imgur.com/A8uRSTS.png",
    "enabled": true,
    "order": 756
  },
  {
    "id": "cat-weatherspy-au-sd",
    "name": "WeatherSpy (Australia) (720p)",
    "url": "https://jukin-weatherspy-2-au.samsung.wurl.tv/playlist.m3u8",
    "category": "Weather",
    "logo": "https://i.imgur.com/GTxN2nH.png",
    "enabled": true,
    "order": 757
  },
  {
    "id": "cat-weatherspy-mx-sd",
    "name": "WeatherSpy (Mexico) (720p)",
    "url": "https://jukin-weatherspy-2-mx.samsung.wurl.tv/playlist.m3u8",
    "category": "Weather",
    "logo": "https://i.imgur.com/KIEKOt1.png",
    "enabled": true,
    "order": 758
  },
  {
    "id": "cat-weatherspy-us-sd",
    "name": "WeatherSpy (United States) (720p)",
    "url": "https://d12gab6t5iutxf.cloudfront.net/playlist.m3u8",
    "category": "Weather",
    "logo": "https://i.imgur.com/yHUUIIz.png",
    "enabled": true,
    "order": 759
  }
];
