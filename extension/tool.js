/* global adapterFor */
function addModuleButtons() {
  document.querySelectorAll("#modules .tagEntry tbody tr").forEach(row => {
    const cell = row.cells[1];
    if (!cell || cell.querySelector(".almaweb-module-button")) return;
    const original = cell.querySelector("label, span");
    const number = original?.textContent.trim();
    if (!number || !adapterFor(number)) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "almaweb-module-button";
    button.textContent = "AlmaWeb ↗";
    button.setAttribute("aria-label", `AlmaWeb: ${number} öffnen`);
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        const result = await browser.runtime.sendMessage({ type: "open-module", number });
        if (!result?.ok) throw new Error(result?.error || "Popup konnte nicht geöffnet werden.");
      } catch (error) {
        let message = cell.querySelector(".almaweb-error");
        if (!message) {
          message = document.createElement("span");
          message.className = "almaweb-error";
          message.setAttribute("role", "alert");
          cell.append(message);
        }
        message.textContent = ` ${error.message || "Popup konnte nicht geöffnet werden."}`;
      } finally {
        button.disabled = false;
      }
    });
    cell.append(button);
  });
}

addModuleButtons();
