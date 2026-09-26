import { preloadAssetNames } from './AssetRegistry.js';
import { preloadMaterialSurfaces } from './MaterialRegistry.js';

const clinicalSurfaces = ['plaster', 'vinyl', 'terrazzo', 'wood'];
const clinicalFurniture = ['officeChair', 'storageCabinet', 'workDesk', 'printer', 'bench', 'plant'];
const exteriorModels = ['shrub', 'fern', 'campusTree'];
const indoor = models => ({ essential: { models, surfaces: clinicalSurfaces }, optional: { models: [], surfaces: [] } });
const withExterior = models => ({ essential: { models, surfaces: [...clinicalSurfaces, 'ground', 'asphalt'] }, optional: { models: exteriorModels, surfaces: [] } });

export const zoneAssetManifest = Object.freeze({
  first_campus_3f: withExterior(clinicalFurniture),
  first_campus_4f: indoor([...clinicalFurniture, 'hospitalBed']),
  first_campus_2f: withExterior([...clinicalFurniture, 'hospitalBed']),
  first_campus_1f: withExterior(clinicalFurniture),
  first_campus_8f: withExterior(clinicalFurniture),
  skybridge: withExterior(clinicalFurniture),
  second_campus_1f: indoor(clinicalFurniture),
  second_campus_2f: indoor([...clinicalFurniture, 'hospitalBed']),
  second_campus_4f_story: indoor([...clinicalFurniture, 'hospitalBed']),
  second_campus_5f: indoor([...clinicalFurniture, 'hospitalBed']),
  second_campus_std: indoor([...clinicalFurniture, 'hospitalBed']),
  phantom_6f: indoor(clinicalFurniture),
  b2_archive: indoor(clinicalFurniture)
});

function preloadEntries(entries) {
  return Promise.all([
    preloadAssetNames(entries.models),
    preloadMaterialSurfaces(entries.surfaces)
  ]);
}

export function preloadZoneEssential(zoneId) {
  const manifest = zoneAssetManifest[zoneId];
  if (!manifest) throw new Error(`Missing zone asset manifest: ${zoneId}`);
  return preloadEntries(manifest.essential);
}

export function preloadZoneOptional(zoneId) {
  const manifest = zoneAssetManifest[zoneId];
  if (!manifest) throw new Error(`Missing zone asset manifest: ${zoneId}`);
  return preloadEntries(manifest.optional);
}
