import assert from 'node:assert/strict';
import {zoneAssetManifest} from '../src/art/ZoneAssetManifest.js';
const {essential,optional}=zoneAssetManifest.second_campus_1f;
for(const name of ['ground','asphalt'])assert(optional.surfaces.includes(name),`second_campus_1f renders ${name} outdoors and must schedule its background PBR`);
assert(!essential.models.includes('campusTree'),'outdoor tree must not block lobby entry');
assert(!optional.models.includes('campusTree'),'hillside preview needs surfaces, not a full tree download');
console.log('PASS: second-campus 1F exterior surfaces load without blocking indoor entry');
