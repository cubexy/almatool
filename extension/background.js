/* global adapterFor, facultyAdapters, almawebOrigin, warmAlmawebSearch */
const requestKey = (tabId) => `pending-module-${tabId}`;
const requestTypes = new Set([
  "get-module-request",
  "finish-module-request",
]);

browser.tabs.onRemoved.addListener((tabId) => {
  browser.storage.session.remove(requestKey(tabId)).catch(console.error);
});

browser.runtime.onMessage.addListener(async (message, sender) => {
  if (message?.type === "warm-almaweb") {
    warmAlmawebSearch();
    return null;
  }

  if (message?.type === "open-module") {
    if (
      !sender.tab ||
      !sender.url?.startsWith(
        "https://tool.uni-leipzig.de/einschreibung/bookings/",
      )
    ) {
      return { ok: false, error: "Anfrage nicht von TOOL." };
    }
    const destination =
      message.destination === "almaweb" ? "almaweb" : "faculty";
    const adapter =
      typeof message.number === "string" &&
      adapterFor(destination, message.number);
    if (!adapter)
      return {
        ok: false,
        error:
          destination === "almaweb"
            ? "Dieses Modul ist in AlmaWeb nicht unterstützt."
            : "Modulnummer nicht unterstützt.",
      };
    if (destination === "almaweb") {
      try {
        if (
          !(await browser.permissions.contains({
            origins: [`${almawebOrigin}/*`],
          }))
        ) {
          return {
            ok: false,
            error:
              "Bitte in Firefox AlmaWeb als Website-Zugriff für dieses Add-on erlauben und erneut klicken.",
          };
        }
      } catch (error) {
        return {
          ok: false,
          error: "AlmaWeb-Website-Zugriff konnte nicht geprüft werden.",
        };
      }
    }
    let url;
    if (destination === "almaweb") {
      try {
        url = await adapter.openModule(message.number);
      } catch (error) {
        console.error("AlmaWeb: Modulsuche fehlgeschlagen", error);
        return {
          ok: false,
          error: `AlmaWeb: ${error.message || "Modulsuche fehlgeschlagen."}`,
        };
      }
    } else {
      url = adapter.registryUrl;
    }
    let tabId;
    let windowId;
    try {
      const popup = await browser.windows.create({
        type: "popup",
        url: "about:blank",
        width: 980,
        height: 760,
      });
      windowId = popup.id;
      tabId = popup.tabs?.[0]?.id;
      if (!Number.isInteger(tabId))
        throw new Error("Popup-Tab nicht verfügbar.");
      if (destination === "faculty")
        await browser.storage.session.set({
          [requestKey(tabId)]: { adapterId: adapter.id, number: message.number },
        });
      await browser.tabs.update(tabId, { url });
      return { ok: true };
    } catch (error) {
      if (tabId !== undefined)
        await browser.storage.session
          .remove(requestKey(tabId))
          .catch(console.error);
      if (windowId !== undefined)
        await browser.windows.remove(windowId).catch(console.error);
      console.error("Modul-Popup fehlgeschlagen", error);
      return { ok: false, error: "Popup konnte nicht geöffnet werden." };
    }
  }

  if (requestTypes.has(message?.type)) {
    const tabId = sender.tab?.id;
    if (!Number.isInteger(tabId)) return null;
    const key = requestKey(tabId);
    const request = (await browser.storage.session.get(key))[key];
    const adapter = facultyAdapters.find(
      (item) => item.id === request?.adapterId,
    );
    if (!adapter) return null;
    if (sender.url?.split("#")[0] !== adapter.registryUrl.split("#")[0])
      return null;
    if (message.type === "finish-module-request") {
      if (message.number !== request.number) return null;
      await browser.storage.session.remove(key);
    }
    return request;
  }
  return null;
});
