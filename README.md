# almatool

Firefox 142+ extension for Uni Leipzig TOOL pages to add actual AlmaWeb links to modules so you can actually look at them.

<img width="732" height="279" alt="grafik" src="https://github.com/user-attachments/assets/ee7ddad7-b327-4a45-8034-79c0f87857fc" />

## Disclaimer 🤖

Please note that this was fully coded using AI as a proof of concept. I do not recommend **permanently** using this add on and also will not publish this onto the Addons Store. It was tested for FMI modules.

## Running the extension

- Clone the repository.

- Open `about:debugging#/runtime/this-firefox` in Firefox and click **Load Temporary Add-on…**.

- Select `extension/manifest.json`.

If Firefox asks for access to TOOL, the faculty registry, or AlmaWeb, allow it. If AlmaWeb access is disabled, you can enable it under `about:addons` → this extension → **Permissions**.

Temporary extensions are removed when Firefox closes.

## Using the extension

Open a TOOL module booking page and use the added faculty button to open the matching module in the faculty registry.

The AlmaWeb button is shown for all available modules and opens the matching public AlmaWeb details page. The lookup can take a while because AlmaWeb is searched by module number first. Repeat lookups are cached, so a module you already opened once opens instantly.

The faculty registry uses your normal Firefox session, so you can log in there as usual if required.
