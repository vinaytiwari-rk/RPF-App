# Nuvio Dailymotion Provider

A small Nuvio plugin repository containing a Dailymotion provider.

## Install in Nuvio

Use the raw manifest URL for this branch:

`https://raw.githubusercontent.com/vinaytiwari-rk/RPF-App/nuvio-dailymotion-provider/nuvio-dailymotion/manifest.json`

Add it under **Settings → Content & Discovery → Plugins → Add Repository**.

## Required setting

The provider needs a personal TMDB API v3 key because Nuvio supplies the provider with a TMDB ID rather than the title. The key is entered inside the provider's Nuvio settings and is not stored in this repository.

## How it works

1. Resolve the TMDB movie/TV ID to a title.
2. Search Dailymotion for matching public videos.
3. Resolve Dailymotion player metadata.
4. Return available MP4/HLS URLs to Nuvio.

The provider does not host or upload media.

## Important

Dailymotion availability, geo restrictions, anti-bot protections, and individual video permissions can change. A zero-result response does not necessarily mean the title is absent from Dailymotion.
