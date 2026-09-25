import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assetManifest} from './src/art/AssetRegistry.js';

const prototypeRoot = dirname(fileURLToPath(import.meta.url));
const modelRoot = resolve(prototypeRoot, 'public/assets/models');
const registered = {
  annieHero: assetManifest.annieHero,
  zhangStethoscope: assetManifest.zhangStethoscope,
};
const expectedFiles = {
  annieHero: registered.annieHero ?? 'characters/annie_cpr_hero.glb',
  zhangStethoscope: registered.zhangStethoscope ?? 'props/zhang_stethoscope_1997.glb',
};
const absent = [];

for (const [name, relativePath] of Object.entries(expectedFiles)) {
  try {
    await stat(resolve(modelRoot, relativePath));
  } catch {
    absent.push(`${name}: ${relativePath}`);
  }
}

if (absent.length || Object.values(registered).some(value => !value)) {
  console.log('ART-CHAR-ANNIE-HERO-V2: FUTURE_ART_POLISH_SKIPPED (procedural release does not require Hero GLBs)');
} else {
  assert.equal(registered.annieHero, 'characters/annie_cpr_hero.glb', 'annieHero manifest path differs from the contract');
  assert.equal(registered.zhangStethoscope, 'props/zhang_stethoscope_1997.glb', 'zhangStethoscope manifest path differs from the contract');

  function parseGlb(bytes, label) {
    assert(bytes.length >= 20, `${label}: GLB is truncated`);
    assert.equal(bytes.readUInt32LE(0), 0x46546c67, `${label}: invalid GLB magic`);
    assert.equal(bytes.readUInt32LE(4), 2, `${label}: expected glTF 2.0`);
    assert.equal(bytes.readUInt32LE(8), bytes.length, `${label}: declared length differs from file size`);
    let offset = 12;
    let json;
    while (offset < bytes.length) {
      const chunkLength = bytes.readUInt32LE(offset);
      const chunkType = bytes.readUInt32LE(offset + 4);
      const chunk = bytes.subarray(offset + 8, offset + 8 + chunkLength);
      if (chunkType === 0x4e4f534a) json = JSON.parse(chunk.toString('utf8').replace(/[\u0000\s]+$/g, ''));
      offset += 8 + chunkLength;
    }
    assert(json, `${label}: JSON chunk missing`);
    return json;
  }

  async function readAsset(relativePath) {
    const file = resolve(modelRoot, relativePath);
    const bytes = await readFile(file);
    return {file, bytes, gltf: parseGlb(bytes, relativePath)};
  }

  function nodeNames(gltf) {
    return new Set((gltf.nodes ?? []).map(node => node.name).filter(Boolean));
  }

  function triangleCount(gltf) {
    return (gltf.meshes ?? []).reduce((sum, mesh) => sum + (mesh.primitives ?? []).reduce((meshSum, primitive) => {
      const mode = primitive.mode ?? 4;
      if (mode !== 4 && mode !== 5 && mode !== 6) return meshSum;
      const count = primitive.indices === undefined
        ? gltf.accessors[primitive.attributes.POSITION].count
        : gltf.accessors[primitive.indices].count;
      return meshSum + (mode === 4 ? Math.floor(count / 3) : Math.max(0, count - 2));
    }, 0), 0);
  }

  async function externalPayloadBytes(asset) {
    const dependencies = new Set();
    for (const item of [...(asset.gltf.buffers ?? []), ...(asset.gltf.images ?? [])]) {
      if (!item.uri || item.uri.startsWith('data:')) continue;
      dependencies.add(resolve(dirname(asset.file), decodeURIComponent(item.uri)));
    }
    let bytes = asset.bytes.length;
    for (const file of dependencies) bytes += (await stat(file)).size;
    return bytes;
  }

  const hero = await readAsset(registered.annieHero);
  const prop = await readAsset(registered.zhangStethoscope);
  const expectedMeshes = [
    'Annie_Face_Vinyl', 'Annie_Eye_L', 'Annie_Eye_R', 'Annie_Mouth_Airway',
    'Annie_Hair_Wig', 'Annie_Coat', 'Annie_Scrubs', 'Annie_Shoe_L', 'Annie_Shoe_R',
    'Annie_Stethoscope_1997',
  ];
  const expectedBones = [
    'root', 'pelvis', 'spine_01', 'spine_02', 'neck', 'head',
    'upperarm_L', 'upperarm_R', 'forearm_L', 'forearm_R', 'hand_L', 'hand_R',
    'thigh_L', 'thigh_R', 'shin_L', 'shin_R', 'foot_L', 'foot_R',
  ];
  const expectedClips = [
    'annie_idle_static', 'annie_head_track_subtle', 'annie_bridge_cpr_empty',
    'annie_floor6_cpr', 'annie_transition_freeze',
  ];
  const requiredMaterials = [
    'Annie_Mat_Vinyl', 'Annie_Mat_Coat', 'Annie_Mat_Scrubs',
    'Annie_Mat_Stethoscope_Rubber', 'Annie_Mat_Stethoscope_Metal',
  ];
  const heroNodes = nodeNames(hero.gltf);
  const propNodes = nodeNames(prop.gltf);
  const boneNames = new Set((hero.gltf.skins ?? []).flatMap(skin => skin.joints.map(index => hero.gltf.nodes[index]?.name)));
  const clips = new Set((hero.gltf.animations ?? []).map(animation => animation.name));
  const materials = new Map((hero.gltf.materials ?? []).map(material => [material.name, material]));
  const heroPayload = await externalPayloadBytes(hero);
  const propPayload = await externalPayloadBytes(prop);
  const combinedPayload = heroPayload + propPayload;

  for (const name of expectedMeshes) assert(heroNodes.has(name), `Hero node missing: ${name}`);
  assert(propNodes.has('Zhang_Stethoscope_1997'), 'Pickup prop node missing: Zhang_Stethoscope_1997');
  for (const name of expectedBones) assert(boneNames.has(name), `Rig bone missing: ${name}`);
  for (const name of expectedClips) assert(clips.has(name), `Animation clip missing: ${name}`);
  for (const name of requiredMaterials) {
    const material = materials.get(name);
    assert(material, `PBR material missing: ${name}`);
    assert(material.pbrMetallicRoughness?.baseColorTexture, `${name}: Base Color texture missing`);
    assert(material.pbrMetallicRoughness?.metallicRoughnessTexture, `${name}: Metallic-Roughness texture missing`);
    assert(material.normalTexture, `${name}: Normal texture missing`);
    assert(material.occlusionTexture, `${name}: AO texture missing`);
  }
  const triangles = triangleCount(hero.gltf);
  assert(triangles >= 30000 && triangles <= 90000, `Hero triangle count outside contract: ${triangles}`);
  assert(heroPayload <= 8 * 1024 * 1024, `Hero transfer payload exceeds 8 MB: ${heroPayload}`);
  assert(combinedPayload <= 10 * 1024 * 1024, `Character + prop package exceeds 10 MB: ${combinedPayload}`);

  const artFactoryPath = resolve(prototypeRoot, 'src/art/AnnieArt.js');
  const artFactory = await readFile(artFactoryPath, 'utf8');
  assert.match(artFactory, /SkeletonUtils\.clone/, 'Skinned instances must use SkeletonUtils.clone');
  assert.match(artFactory, /new\s+AnimationMixer/, 'Each instance must own an AnimationMixer');
  assert.match(artFactory, /instantiateAsset\(['"]annieHero['"]\)/, 'All Annie states must instantiate the registered Hero asset');
  assert.match(artFactory, /STORAGE_STATIC[\s\S]*BRIDGE_MANIFEST[\s\S]*FLOOR6_CPR/, 'Shared Hero factory must expose all three required states');
  assert.doesNotMatch(artFactory, /window\.DutyNightAssets/, 'Do not add a second global asset cache');
  for (const file of ['src/world/Level3FBlockout.js', 'src/world/zones/Skybridge.js', 'src/world/zones/Phantom6F.js']) {
    const source = await readFile(resolve(prototypeRoot, file), 'utf8');
    assert.match(source, /AnnieArt|buildAnnie|instantiateAsset\(['"]annieHero['"]\)/, `${file}: shared Hero factory not used`);
  }
  const registrySource = await readFile(resolve(prototypeRoot, 'src/art/AssetRegistry.js'), 'utf8');
  const extensions = new Set([...(hero.gltf.extensionsUsed ?? []), ...(prop.gltf.extensionsUsed ?? [])]);
  if (extensions.has('KHR_draco_mesh_compression')) assert.match(registrySource, /DRACOLoader/, 'Draco extension has no configured decoder');
  if (extensions.has('EXT_meshopt_compression')) assert.match(registrySource, /MeshoptDecoder/, 'Meshopt extension has no configured decoder');
  if (extensions.has('KHR_texture_basisu')) assert.match(registrySource, /KTX2Loader/, 'KTX2 extension has no configured transcoder');
  console.log(`ART-CHAR-ANNIE-HERO-V2: PASS (${triangles} triangles; hero ${heroPayload} bytes; package ${combinedPayload} bytes)`);
}
