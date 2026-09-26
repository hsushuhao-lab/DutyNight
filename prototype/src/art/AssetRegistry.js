import { Box3, CylinderGeometry, DoubleSide, Group, Mesh, MeshStandardMaterial, SphereGeometry, TextureLoader, Vector3 } from 'three';
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
const openingCriticalAssets = new Set(['officeChair', 'storageCabinet', 'workDesk', 'printer', 'bench', 'plant']);
const assets = new Map();
const pendingAssets = new Map();
const pendingInstances = new Map();
const treeTrunk = new CylinderGeometry(.12, .20, 2.2, 8);
const treeCanopy = new SphereGeometry(1.15, 10, 8);
const shrubCanopy = new SphereGeometry(.5, 10, 8);
const barkMaterial = new MeshStandardMaterial({ color: 0x514b3e, roughness: 1 });
const leafMaterial = new MeshStandardMaterial({ color: 0x394d3c, roughness: 1 });
for (const resource of [treeTrunk, treeCanopy, shrubCanopy, barkMaterial, leafMaterial]) resource.userData.sharedAsset = true;
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
        resolveInstances(`${name}_${letter}`);
      }
      assets.set(name, assets.get(`${name}_a`));
      resolveInstances(name);
    } else if (name === 'campusTree') {
      const tree = new Group();
      tree.add(gltf.scene);
      const bounds = new Box3().setFromObject(tree);
      const center = bounds.getCenter(new Vector3());
      gltf.scene.position.sub(new Vector3(center.x, bounds.min.y, center.z));
      tree.userData = { sharedAsset: true, dimensions: bounds.getSize(new Vector3()).toArray(), source: 'island_tree_02' };
      assets.set(name, tree);
      resolveInstances(name);
    } else {
      assets.set(name, gltf.scene);
      resolveInstances(name);
    }
  }));
}

export function preloadCriticalAssets() {
  if (criticalPreload) return criticalPreload;
  criticalPreload = preloadAssetNames([...openingCriticalAssets])
    .catch(error => { throw new Error(`Opening GLTF asset preload failed: ${error.message}`, { cause: error }); });
  return criticalPreload;
}

export function preloadAssets() {
  if (preload) return preload;
  preload = preloadAssetNames(Object.keys(assetManifest).filter(name => !outdoorAssets.has(name)))
    .catch(error => { throw new Error(`Hospital GLTF asset preload failed: ${error.message}`, { cause: error }); });
  return preload;
}

export function preloadOutdoorAssets() {
  if (outdoorPreload) return outdoorPreload;
  outdoorPreload = preloadAssetNames([...outdoorAssets])
    .catch(error => { throw new Error(`Outdoor GLTF asset preload failed: ${error.message}`, { cause: error }); });
  return outdoorPreload;
}

export function preloadAssetNames(names) {
  return Promise.all(names.map(name => {
    if (assets.has(name)) return Promise.resolve();
    if (!assetManifest[name]) throw new Error(`Unknown art asset: ${name}`);
    if (!pendingAssets.has(name)) pendingAssets.set(name, loadAssetEntries([[name, assetManifest[name]]]));
    return pendingAssets.get(name);
  }));
}

// Geometry/materials remain shared across clones; zone cleanup must skip sharedAsset resources.
export function isAssetReady(name) { return assets.has(name); }

function resolveInstances(name) {
  const source = assets.get(name);
  for (const instance of pendingInstances.get(name) || []) {
    instance.clear();
    instance.add(source.clone(true));
    instance.userData.dimensions = source.userData.dimensions;
    if (instance.userData.targetHeight) instance.scale.setScalar(instance.userData.targetHeight / source.userData.dimensions[1]);
  }
  pendingInstances.delete(name);
}

export function instantiateAsset(name) {
  const source = assets.get(name);
  if (!source) {
    if (!/^(shrub|fern)_[a-d]$/.test(name) && !outdoorAssets.has(name)) return null;
    const instance = new Group();
    instance.name = `ArtAsset/${name}`;
    instance.userData = { pendingAsset: name, dimensions: name === 'campusTree' ? [2.3, 4, 2.3] : [1, 1, 1] };
    if (name === 'campusTree') {
      const trunk = new Mesh(treeTrunk, barkMaterial); trunk.position.y = 1.1;
      const crown = new Mesh(treeCanopy, leafMaterial); crown.position.y = 3;
      crown.scale.set(1, 1.2, 1);
      instance.add(trunk, crown);
    } else {
      const crown = new Mesh(shrubCanopy, leafMaterial); crown.position.y = .5;
      instance.add(crown);
    }
    if (!pendingInstances.has(name)) pendingInstances.set(name, new Set());
    pendingInstances.get(name).add(instance);
    return instance;
  }
  const clone = source.clone(true);
  clone.name = `ArtAsset/${name}`;
  clone.userData.sharedAsset = true;
  return clone;
}
