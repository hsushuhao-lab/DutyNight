import { solid } from '../../art/ArtDetails.js';
import { SignAnchor } from './SignAnchor.js';
import { buildVerticalCore } from './VerticalCore.js';

export function addTravelFixtures(zone, zoneId) {
  const m=zone.gf.materials;
  buildVerticalCore(zone,zoneId);
  // Outdoor trail wayfinding signs
  if (zoneId === 'hillside_route') {
    for (const [x, z, label] of [[12, -35.5, '第一院區 2F 急診'], [72.8, -18.4, '第二院區 1F 入口']]) {
      solid(zone.zoneGroup, m.metal, [x, 0.35, z], [0.07, 1.7, 0.07]);
      SignAnchor.buildWallPlaque({
        scene: zone.zoneGroup,
        x,
        y: 0.9,
        z: z - 0.055,
        rotationY: Math.PI,
        width: 1.05,
        height: 0.36,
        code: 'PATH',
        title: label,
        subtitle: '',
        header: '院區步道'
      });
    }
  }
}
