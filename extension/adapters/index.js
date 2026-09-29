/* global mathcsAdapter, almawebAdapter */
const facultyAdapters = [mathcsAdapter];
const adapters = { faculty: facultyAdapters[0], almaweb: almawebAdapter };

function adapterFor(destination, number) {
  const adapter = adapters[destination];
  return adapter?.matchesModule(number) ? adapter : null;
}
