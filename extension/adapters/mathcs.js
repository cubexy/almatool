const mathcsAdapter = {
  id: "mathcs",
  matchesModule: number => /^(10-|FMI-)/.test(number),
  // Update this URL and the registry match in manifest.json together each semester.
  registryUrl: "https://www.informatik.uni-leipzig.de/ifijung/10/service/stundenplaene/ws2026/modul.html#MODUL_N",

  async openModule(number) {
    const section = document.querySelector("#accordion_unit_MODUL_N");
    const entry = [...(section?.querySelectorAll(".toc-modul-n-link") || [])]
      .find(node => node.textContent.trim() === number);
    if (!entry) return { status: "missing" };

    const heading = entry.closest(".panel-heading");
    const toggle = heading?.querySelector('a[data-toggle="collapse"]');
    const panelId = toggle?.getAttribute("aria-controls") ||
      toggle?.getAttribute("href")?.replace(/^#/, "");
    const panel = panelId && document.getElementById(panelId);
    if (!toggle || !panel || !heading.closest(".panel")?.contains(panel)) {
      return { status: "failed" };
    }

    const expanded = () => panel.classList.contains("in") &&
      !panel.classList.contains("collapsing") && toggle.getAttribute("aria-expanded") === "true" &&
      panel.getClientRects().length > 0;

    if (!expanded()) {
      // Observe before clicking: Bootstrap can finish synchronously if transitions are disabled.
      const ready = new Promise(resolve => {
        let observer;
        const finish = value => {
          observer.disconnect();
          clearTimeout(timeout);
          resolve(value);
        };
        observer = new MutationObserver(() => { if (expanded()) finish(true); });
        observer.observe(panel, { attributes: true, attributeFilter: ["class", "style"] });
        observer.observe(toggle, { attributes: true, attributeFilter: ["aria-expanded"] });
        const timeout = setTimeout(() => finish(false), 2500);
        if (expanded()) finish(true);
      });
      if (!panel.classList.contains("in") && !panel.classList.contains("collapsing")) toggle.click();
      if (!await ready || !expanded()) return { status: "failed" };
    }

    // Allow the browser to lay out the final expanded panel before scrolling.
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    if (!expanded()) return { status: "failed" };
    const fixedHeader = [...document.querySelectorAll("header, nav, .navbar-fixed-top")]
      .filter(node => getComputedStyle(node).position === "fixed" && node.getBoundingClientRect().top <= 0)
      .reduce((height, node) => Math.max(height, node.getBoundingClientRect().bottom), 0);
    heading.style.scrollMarginTop = `${Math.max(0, fixedHeader) + 12}px`;
    heading.scrollIntoView({ block: "start" });
    return { status: "opened" };
  }
};
