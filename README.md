# WOL Adjustments Suite

A Firefox extension for [Watchtower Online Library](https://wol.jw.org) that adds audio playback speed control and automatically expands collapsed reference material.

## Features

**Playback speed control.** A floating selector in the lower-right corner of every WOL page offers 0.5×, 0.75×, 1×, 1.1×, 1.2×, 1.5×, and 2×. Your choice is saved and applied automatically on every WOL page, in every tab, across browser sessions.

**Auto-expand collapsibles.** Index sections that normally load collapsed are expanded on page load, including sections WOL inserts dynamically. Each section is expanded once only — if you deliberately re-collapse one, it stays closed.

## Install

From [addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/wol-adjustments-suite/).

## Permissions

| Permission | Why |
| --- | --- |
| `storage` | Persists the selected playback speed across pages and sessions |
| `*://wol.jw.org/*` | Limits the extension to WOL pages only |

The extension collects and transmits no data. The playback speed is the only value stored, and it stays in local browser storage.

## Development

Requires [web-ext](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/):

```sh
npm install -g web-ext
```

Run a live-reloading Firefox instance with the extension loaded:

```sh
web-ext run --url https://wol.jw.org/
```

Validate the manifest and package before release:

```sh
web-ext lint
web-ext build
```

## Files

| File | Purpose |
| --- | --- |
| `manifest.json` | Extension metadata, permissions, extension ID |
| `contentscript.js` | Speed control UI, playback rate logic, collapsible expansion |
| `speedcontrol.css` | Styling for the floating control |
| `icon.png` | Extension icon |

## Releasing

1. Bump `"version"` in `manifest.json` — AMO rejects a reused version number
2. `web-ext lint && web-ext build`
3. Upload `web-ext-artifacts/*.zip` via **Upload a New Version** on the [AMO Developer Hub](https://addons.mozilla.org/en-US/developers/addons/)
4. `git commit`, `git tag vX.Y`, `git push --follow-tags`

## Implementation notes

MediaElement.js resets `playbackRate` during player initialization, and WOL creates `#wolplayer` after the content script runs. The extension handles this with a `MutationObserver` on the document plus listeners on the player's media events (`loadedmetadata`, `canplay`, `play`, `emptied`, `ratechange`, and others), re-asserting the saved rate whenever it drifts. An equality check prevents the `ratechange` listener from recursing.

Manifest V2. Firefox continues to support MV2 with no announced removal date.
