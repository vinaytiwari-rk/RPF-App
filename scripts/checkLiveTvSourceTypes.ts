import assert from "node:assert/strict";
import { getMediaSourceType } from "../src/utils/mediaSourceType";

const cases: Array<[string, string, string]> = [
  ["HLS with signed query", "https://cdn.example.test/live/playlist.m3u8?token=abc&expires=123", "application/x-mpegURL"],
  ["M3U playlist", "https://cdn.example.test/live/channels.m3u?key=abc", "application/x-mpegURL"],
  ["MP4 with query", "https://cdn.example.test/video/movie.mp4?token=abc", "video/mp4"],
  ["M4V", "https://cdn.example.test/video/movie.m4v", "video/mp4"],
  ["WebM", "https://cdn.example.test/video/movie.webm", "video/webm"],
  ["OGV", "https://cdn.example.test/video/movie.ogv", "video/ogg"],
  ["MP3", "https://cdn.example.test/audio/live.mp3?token=abc", "audio/mpeg"],
  ["AAC", "https://cdn.example.test/audio/live.aac", "audio/aac"],
  ["M4A", "https://cdn.example.test/audio/live.m4a", "audio/mp4"],
  ["OGG", "https://cdn.example.test/audio/live.ogg", "audio/ogg"],
  ["Extensionless legacy stream", "https://cdn.example.test/live/channel?id=1", "application/x-mpegURL"],
  ["Invalid URL legacy fallback", "not a valid url", "application/x-mpegURL"],
];

for (const [label, url, expected] of cases) {
  assert.equal(getMediaSourceType(url), expected, label);
  console.log(`PASS ${label}`);
}

console.log(`Live TV source-type checks passed: ${cases.length}/${cases.length}`);
