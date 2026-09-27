import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTER_PROFILES,getCharacterProfile,getCorePersonnelProfiles} from './src/story/CharacterBible.js';

const all=Object.values(CHARACTER_PROFILES);
assert.equal(all.length,8,'character bible must define 8 core 1998 people including Liu Zhiyuan');
assert.equal(getCorePersonnelProfiles().length,7,'4+3 personnel archive must contain exactly seven core staff');

for(const name of ['張守恆','李承禮','周啟文','陳柏勳','林婉真','王世榮','謝玉琴','劉志遠']){
  const profile=getCharacterProfile(name);
  assert(profile, 'missing profile: '+name);
  for(const field of ['employeeId','role','introduction','personality','hobby','signatureQuote','relationship']){
    assert(profile[field], `${name} missing ${field}`);
  }
  assert(profile.visual?.prop, `${name} missing signature prop`);
  assert(profile.visual?.gesture, `${name} missing signature gesture`);
}

const doctors=['ZHANG_SHOUHENG','LI_CHENGLI','ZHOU_QIWEN','CHEN_BOXUN'].map(id=>CHARACTER_PROFILES[id]);
assert.equal(new Set(doctors.map(x=>x.visual.prop)).size,4,'four doctors need four distinct signature props');
assert.equal(new Set(doctors.map(x=>x.visual.gesture)).size,4,'four doctors need four distinct signature gestures');
assert.equal(new Set(doctors.map(x=>x.signatureQuote)).size,4,'four doctors need four distinct recurring lines');

assert.equal(getCharacterProfile('不詳男')?.id,'LIU_ZHIYUAN','ER unknown male should retain Liu visual identity under ambiguity');
assert.equal(getCharacterProfile('未知醫師')?.id,'ZHANG_SHOUHENG','unknown doctor archive silhouette should preserve Zhang visual grammar');

const portrait=readFileSync('./src/art/CharacterPortraitArt.js','utf8');
const memory=readFileSync('./src/story/MemoryInstallations.js','utf8');
const ui=readFileSync('./src/ui/UIManager.js','utf8');
const floor3=readFileSync('./src/world/zones/FirstCampus3F.js','utf8');
const main=readFileSync('./src/main.js','utf8');

assert(portrait.includes('drawCharacterFigure')&&portrait.includes('drawCharacterStrip'),'procedural character portrait renderer missing');
assert(memory.includes("drawCharacterStrip")&&memory.includes("CharacterPortraitArt"),'wall memory evidence must use character-specific portraits');
assert(ui.includes("drawCharacterStrip")&&ui.includes("getCharacterProfile"),'memory viewer / identity matrix must use character bible cues');
assert(floor3.includes("ARCHIVE_PERSONNEL_1998")&&floor3.includes("getCorePersonnelProfiles"),'3F 4+3 personnel archive missing');
assert(main.includes("HISTORY_PERSONNEL_PROFILES_REVIEWED"),'personnel archive review flag missing');

for(const token of ['black_mug','red_pen_watch','note_camera','transfer_folder','green_chart_timer','purple_key_thermos','photo_index_pencil','toolbox_tag']){
  assert(portrait.includes(token), 'portrait renderer missing prop: '+token);
}

console.log('CHARACTER IDENTITY PASS V1 QA PASS');
