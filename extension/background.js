/* global adapterFor, facultyAdapters */
const requestKey = tabId => `pending-module-${tabId}`;

browser.tabs.onRemoved.addListener(tabId => {
  browser.storage.session.remove(requestKey(tabId)).catch(console.error);
});

browser.runtime.onMessage.addListener(async (message, sender) => {
  if (message?.type === "open-module") {
    if (!sender.tab || !sender.url?.startsWith("https://tool.uni-leipzig.de/einschreibung/bookings/")) {
      return { ok: false, error: "Anfrage nicht von TOOL." };
    }
    const adapter = typeof message.number === "string" && adapterFor(message.number);
    if (!adapter) return { ok: false, error: "Modulnummer nicht unterstützt." };
    let tabId;
    let windowId;
    try {
      const popup = await browser.windows.create({ type: "popup", url: "about:blank", width: 980, height: 760 });
      windowId = popup.id;
      tabId = popup.tabs?.[0]?.id;
      if (!Number.isInteger(tabId)) throw new Error("Popup-Tab nicht verfügbar.");
      await browser.storage.session.set({ [requestKey(tabId)]: { adapterId: adapter.id, number: message.number } });
      await browser.tabs.update(tabId, { url: adapter.registryUrl });
      return { ok: true };
    } catch (error) {
      if (tabId !== undefined) await browser.storage.session.remove(requestKey(tabId)).catch(console.error);
      if (windowId !== undefined) await browser.windows.remove(windowId).catch(console.error);
      return { ok: false, error: "Popup konnte nicht geöffnet werden." };
    }
  }

  if (message?.type === "get-module-request" || message?.type === "finish-module-request") {
    const tabId = sender.tab?.id;
    if (!Number.isInteger(tabId)) return null;
    const request = (await browser.storage.session.get(requestKey(tabId)))[requestKey(tabId)];
    const adapter = facultyAdapters.find(item => item.id === request?.adapterId);
    if (!adapter || sender.url?.split("#")[0] !== adapter.registryUrl.split("#")[0]) return null;
    if (message.type === "finish-module-request") {
      if (message.number !== request.number) return null;
      await browser.storage.session.remove(requestKey(tabId));
    }
    return request;
  }
  return null;
});
