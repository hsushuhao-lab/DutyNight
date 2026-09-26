import assert from 'node:assert/strict';
import {existsSync,statSync} from 'node:fs';
import {ERA_POSTERS} from './src/art/PosterRegistry.js';
import {ERA_POSTER_PLACEMENTS} from './src/art/PosterPlacements.js';

const posters=Object.values(ERA_POSTERS);
assert.equal(posters.length,8,'all eight era posters must be registered');
for(const poster of posters){
  for(const property of ['displayTexture','inspectTexture']){
    const path=`./public/${poster[property]}`;
    assert(existsSync(path),`${property} missing for ${poster.id}`);
    assert(statSync(path).size>1000,`${property} is empty for ${poster.id}`);
  }
  const raw=`./public/assets/posters/era/raw/${poster.id}.png`;
  assert(existsSync(raw),`raw poster missing for ${poster.id}`);
}
const placements=Object.values(ERA_POSTER_PLACEMENTS).flat();
assert(placements.length>=20,'at least twenty poster placements are required');
assert(placements.filter(item=>item.inspectable!==false).length>=5,'at least five posters must be inspectable');
for(const zone of ['first_campus_1f','first_campus_2f','first_campus_3f','first_campus_4f','second_campus_5f','skybridge','phantom_6f','b2_archive']){
  assert(ERA_POSTER_PLACEMENTS[zone]?.length>0,`${zone} needs a visible poster placement`);
}
console.log('ERA POSTER ASSETS + PLACEMENTS QA PASS');
