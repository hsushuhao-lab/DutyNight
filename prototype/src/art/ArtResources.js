/** Release zone-owned resources once; registries retain shared GLTF/PBR resources. */
export function disposeZoneArt(root) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  root.traverse(object => {
    if (object.isLight) object.shadow?.dispose();
    if (object.isInstancedMesh) object.dispose();
    if (object.userData.disposeArt) object.userData.disposeArt();
    if (object.geometry && !object.geometry.userData.sharedAsset) geometries.add(object.geometry);
    for (const material of (Array.isArray(object.material) ? object.material : [object.material])) {
      if (!material || material.userData.sharedAsset) continue;
      materials.add(material);
      for (const value of Object.values(material)) {
        if (value?.isTexture && !value.userData.sharedAsset) textures.add(value);
      }
    }
  });
  textures.forEach(texture => texture.dispose());
  materials.forEach(material => material.dispose());
  geometries.forEach(geometry => geometry.dispose());
  root.clear();
}
