/* global mathcsAdapter */
const facultyAdapters = [mathcsAdapter];

function adapterFor(number) {
  return facultyAdapters.find(adapter => adapter.matchesModule(number));
}
