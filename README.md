# TOOL → faculty module registry

Firefox 115+ extension in **`extension/`**. On TOOL booking pages, `AlmaWeb ↗` opens a separate popup at the faculty's WS2026 module registry and expands the exact `10-` or `FMI-` module. Grey/unavailable rows also have buttons. Firefox handles login in the popup using the normal profile session.

## Temporary installation and use

1. Open `about:debugging#/runtime/this-firefox` in Firefox, click **Load Temporary Add-on…**, and choose `extension/manifest.json` (not the repository root). Grant access to the TOOL and faculty sites if Firefox asks; check the add-on's site-access controls if buttons do not appear.
2. Open a TOOL module booking page (`tool.uni-leipzig.de/einschreibung/bookings/…`). Click `AlmaWeb ↗` beside a supported module number. Complete a normal login in the popup if needed. An absent module displays a German message above the module list.

Temporary add-ons disappear when Firefox closes. This extension has no support claim for private windows or Firefox containers; test in the ordinary profile/session. This repository contains only extension source and this README; saved third-party pages are not distributed.

## Checks

Check JavaScript syntax with `for file in extension/*.js extension/adapters/*.js; do node --check "$file" || exit; done`. With `web-ext` installed separately, run `web-ext lint --source-dir extension`. Before removing the saved fixtures, the implementation passed focused DOM/API-mock checks and `web-ext lint` with no findings. Actual Firefox installation, browser event-page suspension and authenticated navigation still require a live check: click a module while signed in and again while signed out, finish login in the popup, and confirm the exact module expands and scrolls into view. Check two simultaneous popups as well.

## Semester and faculty updates

Change the single registry URL in `extension/adapters/mathcs.js` and the corresponding registry `content_scripts.matches` pattern in `extension/manifest.json` together each semester. To add a faculty, create another object with `id`, `matchesModule(number)`, `registryUrl`, and `openModule(number)`; add it to `extension/adapters/index.js`, load its file before `index.js` in all three script lists, and add its registry URL match/content-script entry in the manifest. Generic TOOL buttons and popup routing need no faculty-specific selectors.
