/* global facultyAdapters */
(async () => {
  try {
    const request = await browser.runtime.sendMessage({ type: "get-module-request" });
    if (!request) return;
    const adapter = facultyAdapters.find(item => item.id === request.adapterId);
    if (!adapter) return;
    const result = await adapter.openModule(request.number);
    if (result.status !== "opened") {
      const notice = document.createElement("div");
      notice.className = "almaweb-notice";
      notice.setAttribute("role", "status");
      notice.textContent = result.status === "missing"
        ? `Modul ${request.number} wurde in diesem Verzeichnis nicht gefunden.`
        : `Modul ${request.number} konnte nicht geöffnet werden.`;
      (document.querySelector("#accordion_unit_MODUL_N") || document.body).before(notice);
    }
    await browser.runtime.sendMessage({ type: "finish-module-request", number: request.number });
  } catch (error) {
    console.error("AlmaWeb: Modul konnte nicht geöffnet werden", error);
  }
})();
