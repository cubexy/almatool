/* global mathcsAdapter, almawebAdapter */
const facultyAdapters = [mathcsAdapter];
const almawebAdapters = [almawebAdapter];

function adapterFor(destination, number) {
  const candidates =
    destination === "almaweb" ? almawebAdapters : facultyAdapters;
  return candidates.find((adapter) => adapter.matchesModule(number)) || null;
}
