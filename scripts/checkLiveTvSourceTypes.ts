import assert from "node:assert/strict";
import { getMediaSourceType } from "../src/utils/mediaSourceType";
import { LIVE_TV_DEFAULTS, PRIORITY_LIVE_TV_CHANNELS, mergeTvCatalogue } from "../src/data/liveTvDefaults";

const cases: Array<[string, string, string | undefined]> = [
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
  ["Extensionless stream lets browser infer type", "https://cdn.example.test/live/channel?id=1", undefined],
  ["Invalid URL has no forced type", "not a valid url", undefined],
];

for (const [label, url, expected] of cases) {
  assert.equal(getMediaSourceType(url), expected, label);
  console.log(`PASS ${label}`);
}

console.log(`Live TV source-type checks passed: ${cases.length}/${cases.length}`);

const customChannel = {
  id: "custom-test-channel",
  name: "Custom Test Channel",
  url: "https://stream.example.test/custom.m3u8",
  category: "News",
  enabled: true
};

assert.deepEqual(mergeTvCatalogue([]), [], "an intentionally empty saved catalogue must stay empty");
assert.deepEqual(
  mergeTvCatalogue([customChannel]).map((channel) => channel.id),
  ["custom-test-channel"],
  "a saved custom catalogue must not be repopulated with default priority channels"
);

const disabledPriority = { ...PRIORITY_LIVE_TV_CHANNELS[0], enabled: false };
const prioritizedSaved = mergeTvCatalogue([customChannel, disabledPriority]);
assert.deepEqual(
  prioritizedSaved.map((channel) => channel.id),
  [disabledPriority.id, customChannel.id],
  "saved priority channels should sort first without restoring channels absent from the saved list"
);
assert.equal(prioritizedSaved[0].enabled, false, "the saved enabled/disabled state of a priority channel must be preserved");
assert.ok(mergeTvCatalogue(undefined).length > 0, "bundled defaults should be used only when no saved catalogue is supplied");
assert.ok(LIVE_TV_DEFAULTS.length > 0, "bundled Live TV defaults should remain available for first-run setup");
console.log("PASS Live TV catalogue deletion/persistence checks");
