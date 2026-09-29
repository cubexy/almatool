// Lecture starts: Jul–Dec belongs to the winter semester starting that year,
// Jan–Jun to the summer semester starting that year.
function currentSemester(now = new Date()) {
  const start = now.getFullYear();
  const winter = now.getMonth() >= 6;
  const end = winter ? start + 1 : null;
  return {
    winter,
    start,
    end,
    // AlmaWeb catalogue label.
    abbreviation: winter ? "WiSe" : "SoSe",
    label: winter ? `WiSe ${start}/${String(end).slice(2)}` : `SoSe ${start}`,
    // Faculty registry directory, e.g. ws2026 or ss2026.
    pathSegment: `${winter ? "ws" : "ss"}${start}`,
  };
}