/* global adapterFor */
function addModuleButtons() {
  document.querySelectorAll("#modules .tagEntry tbody tr").forEach((row) => {
    const cell = row.cells[1];
    if (!cell) return;
    const original = cell.querySelector("label, span");
    const number = original?.textContent.trim();
    if (!number) return;
    for (const [destination, label] of [
      ["faculty", "Fakultät ↗"],
      ["almaweb", "AlmaWeb ↗"],
    ]) {
      if (!adapterFor(destination, number)) continue;
      if (
        cell.querySelector(
          `.almaweb-module-button[data-destination="${destination}"]`,
        )
      )
        continue;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "almaweb-module-button";
      button.dataset.destination = destination;
      button.textContent = label;
      button.setAttribute("aria-label", `${label}: ${number} öffnen`);
      button.addEventListener("click", async () => {
        button.disabled = true;
        cell.querySelector(".almaweb-error")?.remove();
        button.textContent =
          destination === "almaweb" ? "AlmaWeb sucht …" : label;
        try {
          const result = await browser.runtime.sendMessage({
            type: "open-module",
            number,
            destination,
          });
          if (!result?.ok)
            throw new Error(
              result?.error || "Popup konnte nicht geöffnet werden.",
            );
        } catch (error) {
          let message = cell.querySelector(".almaweb-error");
          if (!message) {
            message = document.createElement("span");
            message.className = "almaweb-error";
            message.setAttribute("role", "alert");
            cell.append(message);
          }
          message.textContent =
            error.message || "Popup konnte nicht geöffnet werden.";
        } finally {
          button.disabled = false;
          button.textContent = label;
        }
      });
      cell.append(button);
    }
  });
}

addModuleButtons();
browser.runtime.sendMessage({ type: "warm-almaweb" });
