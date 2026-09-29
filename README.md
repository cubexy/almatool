# TOOL → faculty registry and AlmaWeb details

Firefox 142+ extension in **`extension/`**. On TOOL booking pages, `Fakultät ↗` opens a popup at the faculty's WS2026 registry and expands the exact `10-` or `FMI-` module. `10-` rows also have `AlmaWeb ↗` for public AlmaWeb details. Grey/unavailable rows have the same available buttons. Firefox handles any faculty login in the popup using the normal profile session.

## Temporary installation and use

1. Open `about:debugging#/runtime/this-firefox` in Firefox, click **Load Temporary Add-on…**, and choose `extension/manifest.json` (not the repository root). Grant access to TOOL, the faculty registry, and AlmaWeb if Firefox asks. If updating an already loaded temporary add-on, click **Reload** there and refresh TOOL. Version **1.1.3** uses a direct background lookup and explicitly requests AlmaWeb host access. If needed, enable that access under `about:addons` → this add-on → **Permissions**.
2. Open a TOOL module booking page (`tool.uni-leipzig.de/einschreibung/bookings/…`). Click `Fakultät ↗` to expand the module in the faculty registry, or `AlmaWeb ↗` on a `10-` row for AlmaWeb's public module-details page. The AlmaWeb button displays **AlmaWeb sucht …** while a blank popup waits; each of the four AlmaWeb requests may take up to two minutes. It searches the public catalogue without browser cookies, verifies the exact module number, then navigates the popup directly to the details URL. On failure, the blank popup closes and TOOL displays the error. The faculty route continues to use normal browser authentication.

Temporary add-ons disappear when Firefox closes. This extension has no support claim for private windows or Firefox containers; test in the ordinary profile/session. This repository contains only extension source and this README; saved third-party pages are not distributed.

## Checks

Check JavaScript syntax with `for file in extension/*.js extension/adapters/*.js; do node --check "$file" || exit; done`. Run `npm exec --yes --package web-ext@10.7.0 -- web-ext lint --source-dir extension` for lint. Tests are development-only and not shipped; saved third-party pages are not in this repository. The resolver passed five temporary DOM/API-mock checks for exact matching, detail verification, popup navigation, errors, and independent requests. It also passed a live anonymous lookup for `10-202-2207` using curl transport: record `398603265372739`, verified detail heading. This does not establish Firefox runtime behavior: reload the add-on, refresh TOOL, click both buttons, confirm their correct destinations, test signed-out faculty login, and check two simultaneous popups.

## Semester and faculty updates

Change the faculty registry URL in `extension/adapters/mathcs.js` and its `content_scripts.matches` pattern in `extension/manifest.json` together each semester. Also update `catalogueName` in `extension/almaweb.js` for the public AlmaWeb search. AlmaWeb's detail URL contains an internal record ID that cannot be derived from the displayed module number: the extension searches by exact number, extracts the resulting record ID, and opens the details. The `AlmaWeb ↗` button is limited to `10-` because the checked `FMI-26W11` was not found in that public catalogue. To add a faculty, create another object with `id`, `matchesModule(number)`, `registryUrl`, and `openModule(number)`; add it to `extension/adapters/index.js`, load its file before `index.js` in all three script lists, and add its registry URL match/content-script entry in the manifest.
