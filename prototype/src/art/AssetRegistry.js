import { Box3, DoubleSide, Group, TextureLoader, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getMaterials } from './MaterialRegistry.js';

const root = `${import.meta.env?.BASE_URL ?? '/'}assets/models/`;
export const assetManifest = Object.freeze({
  officeChair: 'officeChair.glb', workDesk: 'workDesk.glb', storageCabinet: 'storageCabinet.glb',
  hospitalBed: 'hospitalBed.glb', bench: 'bench.glb', printer: 'printer.glb', plant: 'plant.glb',
  shrub: 'shrub_02/shrub_02_2k.gltf', fern: 'fern_02/fern_02_2k.gltf', campusTree: 'campusTree.glb',
});
const vegetation = { shrub: 'shrub_02', fern: 'fern_02' };
const outdoorAssets = new Set(['shrub', 'fern', 'campusTree']);
const openingCriticalAssets = new Set(['officeChair', 'storageCabinet']);
const assets = new Map();
let criticalPreload;
let preload;
let outdoorPreload;

async function loadAssetEntries(entries) {
  const loader = new GLTFLoader();
  return Promise.all(entries.map(async ([name, file]) => {
    const gltf = await loader.loadAsync(`${root}${file}`);
    const collection = vegetation[name];
    const alpha = collection ? await new TextureLoader().loadAsync(`${root}${collection}/textures/${collection}_alpha_2k.png`) : null;
    if (alpha) { alpha.flipY = false; alpha.userData.sharedAsset = true; }
    const materials = getMaterials();
    gltf.scene.traverse(object => {
      if (!object.isMesh) return;
      object.geometry.userData.sharedAsset = true;
      const materialAlias = { wood: 'doorWood', edge: 'handrail', metal: 'stainless', sage: 'wallBumper', white: 'bedSheet' }[object.material.name];
      if (materialAlias) object.material = materials[materialAlias];
      if (alpha) {
        object.material.alphaMap = alpha;
        object.material.alphaTest = .5;
        object.material.side = DoubleSide;
        object.material.needsUpdate = true;
      }
      object.material.userData.sharedAsset = true;
      for (const value of Object.values(object.material)) if (value?.isTexture) value.userData.sharedAsset = true;
      object.userData.sharedAsset = true;
      object.castShadow = true;
      object.receiveShadow = true;
    });
    if (collection) {
      for (const letter of ['a', 'b', 'c', 'd']) {
        const original = gltf.scene.getObjectByName(`${collection}_${letter}`);
        if (!original) throw new Error(`Missing ${collection} variant ${letter}`);
        const variant = new Group();
        const object = original.clone(true);
        variant.add(object);
        const bounds = new Box3().setFromObject(variant);
        const center = bounds.getCenter(new Vector3());
        object.position.sub(new Vector3(center.x, bounds.min.y, center.z));
        variant.userData = { sharedAsset: true, dimensions: bounds.getSize(new Vector3()).toArray(), source: collection, variant: letter };
        assets.set(`${name}_${letter}`, variant);
      }
      assets.set(name, assets.get(`${name}_a`));
    } else if (name === 'campusTree') {
      const tree = new Group();
      tree.add(gltf.scene);
      const bounds = new Box3().setFromObject(tree);
      const center = bounds.getCenter(new Vector3());
      gltf.scene.position.sub(new Vector3(center.x, bounds.min.y, center.z));
      tree.userData = { sharedAsset: true, dimensions: bounds.getSize(new Vector3()).toArray(), source: 'island_tree_02' };
      assets.set(name, tree);
    } else {
      assets.set(name, gltf.scene);
    }
  }));
}

export function preloadCriticalAssets() {
  if (criticalPreload) return criticalPreload;
  criticalPreload = loadAssetEntries(Object.entries(assetManifest).filter(([name]) => openingCriticalAssets.has(name)))
    .catch(error => { throw new Error(`Opening GLTF asset preload failed: ${error.message}`, { cause: error }); });
  return criticalPreload;
}

export function preloadAssets() {
  if (preload) return preload;
  preload = Promise.all([
    preloadCriticalAssets(),
    loadAssetEntries(Object.entries(assetManifest).filter(([name]) => !outdoorAssets.has(name) && !openingCriticalAssets.has(name)))
  ]).catch(error => { throw new Error(`Hospital GLTF asset preload failed: ${error.message}`, { cause: error }); });
  return preload;
}

export function preloadOutdoorAssets() {
  if (outdoorPreload) return outdoorPreload;
  outdoorPreload = loadAssetEntries(Object.entries(assetManifest).filter(([name]) => outdoorAssets.has(name)))
    .catch(error => { throw new Error(`Outdoor GLTF asset preload failed: ${error.message}`, { cause: error }); });
  return outdoorPreload;
}

// Geometry/materials remain shared across clones; zone cleanup must skip sharedAsset resources.
export function isAssetReady(name) { return assets.has(name); }

export function instantiateAsset(name) {
  const source = assets.get(name);
  if (!source) return null;
  const clone = source.clone(true);
  clone.name = `ArtAsset/${name}`;
  clone.userData.sharedAsset = true;
  return clone;
}
