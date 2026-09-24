import * as THREE from 'three';

export const VisualProfile = Object.freeze({
  ACT1_DUSK_NORMAL: { fill: 0.42, sky: 0xe6e5de, ground: 0xd0c7b6, background: 0xabb4b4 },
  NIGHT_NORMAL: { fill: 0.38, sky: 0xa6b9be, ground: 0x8a9283, background: 0x1b252b }
});

const zones = {
  first_campus_3f: { lamps: [[-8, 0], [-1.5, 0], [6.5, 0], [14, 0], [6, 5.5]], intensity: 4.2 },
  first_campus_4f: { lamps: [[0, 6], [-11, 6], [0, -3], [-2, -9], [0, -15], [8, -3]], intensity: 4.0 },
  first_campus_2f: { lamps: [[-8, 0], [0, 0], [8, 0], [16, 0], [3.5, 6], [14.5, 6.5], [3.5, -6.5], [12.5, -6.5]], intensity: 4.8, color: 0xf1f4ed },
  first_campus_1f: { lamps: [[-7, 0], [2, -3], [2, 3], [12, 0]], intensity: 6.0, y: 3.65, width: 5 },
  first_campus_8f: { lamps: [[-8, 0], [-2, 0]], intensity: 3.8 },
  skybridge: { lamps: [[4, 0], [14, 0], [27, 0], [41, 0], [55, 0]], intensity: 3.4, width: 5.5, color: 0xe1e9e6 },
  second_campus_2f: { lamps: [[65, 0], [75, 0]], intensity: 3.7, width: 4 },
  second_campus_std: { lamps: [[72, 6], [76, -2], [72, -9], [72, -15], [81, -8], [65, -8], [83, 6]], intensity: 3.8 },
  second_campus_1f: { lamps: [[72, -4], [72, -11]], intensity: 3.5 },
  hillside_route: { lamps: [], intensity: 0 },
  ecology_pond: { lamps: [], intensity: 0 },
  phantom_6f: { lamps: [[0,-1],[0,-6],[0,-11]], intensity: 1.35, width: 2.4, color: 0x8a5b4b, night: true },
  b2_archive: { lamps: [[0,-1],[0,-6],[0,-11]], intensity: 1.15, width: 2.2, color: 0x6b5146, night: true }
};

export function applyZoneLighting(group, scene, zoneId) {
  group.traverse(object => { if (object.isLight) object.shadow?.dispose(); });
  group.clear();
  const zone = zones[zoneId] || { lamps: [], intensity: 0, night: true };
  const profile = zone.night ? VisualProfile.NIGHT_NORMAL : VisualProfile.ACT1_DUSK_NORMAL;
  scene.background = new THREE.Color(profile.background);
  scene.fog = null;
  group.userData.profile = zone.night ? 'NIGHT_NORMAL' : 'ACT1_DUSK_NORMAL';
  group.add(new THREE.HemisphereLight(profile.sky, profile.ground, profile.fill));
  if (zoneId === 'hillside_route' || zoneId === 'ecology_pond') {
    const sun = new THREE.DirectionalLight(0xffedcf, 2.2);
    sun.position.set(20,35,-5);
    sun.target.position.set(50,0,-35);
    sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);
    Object.assign(sun.shadow.camera,{left:-50,right:50,top:45,bottom:-45,near:1,far:120});
    sun.shadow.bias=-.0002;
    group.add(sun,sun.target);
  }
  if (zoneId === 'first_campus_3f') {
    const daylight = new THREE.SpotLight(0xffe2b5, 150, 24, .70, .65, 2);
    daylight.position.set(1.5,2.8,-5);
    daylight.target.position.set(7,.4,1.4);
    daylight.castShadow=true;
    daylight.shadow.mapSize.set(1024,1024);
    daylight.shadow.bias=-.0002;
    group.add(daylight,daylight.target);
  }
  if (zoneId === 'first_campus_4f') {
    const readingLight=new THREE.PointLight(0xffdcaa,9,3.3,2);
    readingLight.position.set(-11.25,1.0,8.1);
    group.add(readingLight);
  }
  for (const [x, z] of zone.lamps) {
    const panel = new THREE.RectAreaLight(zone.color || 0xfff0d9, zone.intensity, zone.width || 3.6, 1.2);
    panel.position.set(x, zone.y || 3.05, z);
    panel.lookAt(x, 0, z);
    group.add(panel);
  }
}
