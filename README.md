# almatool

Firefox 142+ extension for Uni Leipzig TOOL pages to add actual AlmaWeb links to modules so you can actually look at them.

<img width="774" height="244" alt="AlmaWeb buttons next to modules" src="https://github.com/user-attachments/assets/b904b17e-c2e8-4b3d-983b-3932b26f6a11" />

## Disclaimer 🤖

Please note that this was fully coded using AI as a proof of concept. I do not recommend **permanently** using this add on and also will not publish this onto the Addons Store. It works for the designated use case though!

## Running the extension

- Clone the repository.

- Open `about:debugging#/runtime/this-firefox` in Firefox and click **Load Temporary Add-on…**.

- Select `extension/manifest.json`.

If Firefox asks for access to TOOL, the faculty registry, or AlmaWeb, allow it. If AlmaWeb access is disabled, you can enable it under `about:addons` → this extension → **Permissions**.

Temporary extensions are removed when Firefox closes.

## Using the extension

Open a TOOL module booking page and use the added faculty button to open the matching module in the faculty registry.

The AlmaWeb button is shown for all available modules and opens the matching public AlmaWeb details page. The lookup can take a while because AlmaWeb is searched by module number first.

The faculty registry uses your normal Firefox session, so you can log in there as usual if required.

## Why is this so slow?

This is unfortunately not a cause of bad AI slop code but rather of bad AlmaWeb code (thanks, Telekom!). Because AlmaWeb uses internal IDs for identifying modules, we cannot view a module by ID directly and instead have to use the AlmaWeb search to find it which is terrible. A fix for this would probably be building a full index of the available modules with IDs and AlmaWeb IDs which would speed up lookup a lot.
