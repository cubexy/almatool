// Background-only public catalogue lookup. No injected AlmaWeb script or login is needed.
const almawebOrigin = "https://almaweb.uni-leipzig.de";

function publicAlmawebUrl(href, base) {
  const url = new URL(href, base);
  if (url.origin !== almawebOrigin)
    throw new Error("Unerwarteter AlmaWeb-Link.");
  return url.href;
}

async function almawebDocument(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);
  try {
    const response = await fetch(url, {
      ...options,
      credentials: "omit",
      signal: controller.signal,
    });
    if (!response.ok)
      throw new Error(`AlmaWeb antwortet mit HTTP ${response.status}.`);
    const finalUrl = publicAlmawebUrl(response.url || url, url);
    const document = new DOMParser().parseFromString(
      await response.text(),
      "text/html",
    );
    return { document, url: finalUrl };
  } catch (error) {
    if (error.name === "AbortError")
      throw new Error(
        "AlmaWeb antwortet nicht rechtzeitig. Bitte erneut versuchen.",
      );
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

/* global currentSemester */
function findCatalogueOption(options, semester) {
  const exact = [...options].find(
    (option) =>
      option.textContent.trim() === `Vorlesungsverzeichnis ${semester.label}`,
  );
  if (exact) return exact;
  // Tolerate abbreviated year forms (WiSe 2027-28, SoSe 27) instead of failing outright.
  const start = String(semester.start);
  const end = String(semester.end || "");
  const yearMatches = (value, expected) =>
    value === expected || value === expected.slice(-2);
  return [...options].find((option) => {
    const match =
      /^Vorlesungsverzeichnis\s+(\S+)\s+(\d{2,4})(?:\s*[/–-]\s*(\d{2,4}))?$/.exec(
        option.textContent.trim(),
      );
    if (!match || match[1] !== semester.abbreviation) return false;
    return match[3]
      ? yearMatches(match[2], start) && yearMatches(match[3], end)
      : yearMatches(match[2], start);
  });
}

async function resolveAlmawebModule(number) {
  const catalogue = await almawebDocument(`${almawebOrigin}/vvz`);
  const searchLink = catalogue.document.querySelector(
    '#pageTopNavi li[title="Suche"] > a',
  );
  if (!searchLink) throw new Error("AlmaWeb-Suche nicht gefunden.");
  const search = await almawebDocument(
    publicAlmawebUrl(searchLink.getAttribute("href"), catalogue.url),
  );
  const form = search.document.querySelector("#findcourse");
  const semesterInfo = currentSemester();
  const catalogueName = semesterInfo.label;
  const semester = findCatalogueOption(
    form?.querySelector("#course_catalogue")?.options || [],
    semesterInfo,
  );
  if (!form || !semester || !form.querySelector('[name="module_number"]')) {
    throw new Error(
      `AlmaWeb-Suchformular für ${catalogueName} nicht verfügbar.`,
    );
  }

  // Preserve the fresh hidden search token. Send only catalogue/number criteria,
  // not remembered course filters or refresh/reset submit buttons.
  const fields = new URLSearchParams();
  for (const input of form.querySelectorAll('input[type="hidden"][name]')) {
    fields.set(input.name, input.value);
  }
  fields.set("course_catalogue", semester.value);
  fields.set("course_catalogue_section", "0");
  fields.set("module_number", number);
  fields.set("submit_search", "Suche");
  const results = await almawebDocument(
    publicAlmawebUrl(form.getAttribute("action"), search.url),
    {
      method: "POST",
      body: fields,
    },
  );
  const records = new Set();
  for (const link of results.document.querySelectorAll(
    'tr.module a[href*="PRGNAME=MODULEDETAILS"]',
  )) {
    if (link.textContent.trim().split(/\s+/)[0] !== number) continue;
    const url = new URL(
      publicAlmawebUrl(link.getAttribute("href"), results.url),
    );
    // The live search currently emits a broken menu-ID placeholder. Extract only
    // the module record ID and use the working public search-menu context below.
    const record = url.searchParams
      .get("ARGUMENTS")
      ?.match(/^-N\d+,-N[^,]+,-N(\d{15}),-A/);
    if (record) records.add(record[1]);
  }
  if (!records.size)
    throw new Error(
      `Modul ${number} wurde in AlmaWeb (${catalogueName}) nicht gefunden.`,
    );
  if (records.size !== 1)
    throw new Error(`Modul ${number} ist in AlmaWeb nicht eindeutig.`);
  const details = new URL("/scripts/mgrqispi.dll", almawebOrigin);
  details.search = new URLSearchParams({
    APPNAME: "CampusNet",
    PRGNAME: "MODULEDETAILS",
    ARGUMENTS: `-N000000000000001,-N000407,-N${records.values().next().value},-A`,
  });
  const verified = await almawebDocument(details.href);
  if (
    verified.document
      .querySelector("#moduledetails h1")
      ?.textContent.trim()
      .split(/\s+/)[0] !== number
  ) {
    throw new Error(`AlmaWeb hat nicht die Details für ${number} geliefert.`);
  }
  return details.href;
}

const almawebAdapter = {
  id: "almaweb",
  matchesModule: () => true,

  async openModule(number) {
    return resolveAlmawebModule(number);
  },
};
