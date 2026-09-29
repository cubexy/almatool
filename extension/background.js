/* global adapterFor, facultyAdapters */
const requestKey = (tabId) => `pending-module-${tabId}`;

browser.tabs.onRemoved.addListener((tabId) => {
  browser.storage.session.remove(requestKey(tabId)).catch(console.error);
});

browser.runtime.onMessage.addListener(async (message, sender) => {
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
            origins: ["https://almaweb.uni-leipzig.de/*"],
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
      if (destination === "almaweb") {
        const url = await adapter.openModule(message.number);
        await browser.tabs.update(tabId, { url });
      } else {
        const request = { adapterId: adapter.id, number: message.number };
        await browser.storage.session.set({ [requestKey(tabId)]: request });
        await browser.tabs.update(tabId, { url: adapter.registryUrl });
      }
      return { ok: true };
    } catch (error) {
      if (tabId !== undefined)
        await browser.storage.session
          .remove(requestKey(tabId))
          .catch(console.error);
      if (windowId !== undefined)
        await browser.windows.remove(windowId).catch(console.error);
      console.error("Modul-Popup fehlgeschlagen", error);
      return {
        ok: false,
        error:
          destination === "almaweb"
            ? `AlmaWeb: ${error.message || "Modulsuche fehlgeschlagen."}`
            : "Popup konnte nicht geöffnet werden.",
      };
    }
  }

  if (["get-module-request", "finish-module-request"].includes(message?.type)) {
    const tabId = sender.tab?.id;
    if (!Number.isInteger(tabId)) return null;
    const request = (await browser.storage.session.get(requestKey(tabId)))[
      requestKey(tabId)
    ];
    const adapter = facultyAdapters.find(
      (item) => item.id === request?.adapterId,
    );
    if (!adapter) return null;
    if (sender.url?.split("#")[0] !== adapter.registryUrl.split("#")[0])
      return null;
    if (message.type === "finish-module-request") {
      if (message.number !== request.number) return null;
      await browser.storage.session.remove(requestKey(tabId));
    }
    return request;
  }
  return null;
});
