// SignAnchor.js - Physically anchored architectural signage with double-sided rendering
import * as THREE from 'three';

export class SignAnchor {
  /**
   * Builds a wall-mounted room plaque flush to a wall surface.
   */
  static buildWallPlaque(options) {
    const {
      scene,
      x,
      y,
      z,
      width = 0.85,
      height = 0.32,
      thickness = 0.024,
      rotationY = 0,
      code = '4F',
      title = '護理站',
      subtitle = 'NURSING STATION',
      header = '松德醫療中心 ｜ 臨床醫療區'
    } = options;

    const group = new THREE.Group();
    group.name = `Plaque_${code}_${title}`;

    // 1. Backplate box
    const mountMat = new THREE.MeshStandardMaterial({
      color: 0x22362b,
      metalness: 0.35,
      roughness: 0.6
    });
    const backplate = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, thickness),
      mountMat
    );
    group.add(backplate);

    // 2. High-res Canvas face
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 192;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#edf2ee';
    ctx.fillRect(0, 0, 512, 192);

    // Top hospital department header
    ctx.fillStyle = '#204d37';
    ctx.fillRect(0, 0, 512, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(header, 24, 20, 464);

    // Left room number / code badge
    ctx.fillStyle = '#204d37';
    ctx.fillRect(18, 54, 120, 120);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(code, 78, 114, 106);

    // Right room designation
    ctx.fillStyle = '#1c2822';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(title, 156, 95, 332);

    ctx.fillStyle = '#556a5e';
    ctx.font = '18px sans-serif';
    ctx.fillText(subtitle, 156, 140, 332);

    // Border
    ctx.strokeStyle = '#8faaa0';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 508, 188);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const faceMat = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide
    });
    const faceMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width - 0.02, height - 0.02),
      faceMat
    );
    // Position 2mm in front of mount face
    faceMesh.position.set(0, 0, thickness / 2 + 0.003);
    group.add(faceMesh);

    group.position.set(x, y, z);
    group.rotation.y = rotationY;
    scene.add(group);
    return group;
  }

  /**
   * Builds an overhead hanging directional wayfinding sign suspended from ceiling.
   */
  static buildHangingSign(options) {
    const {
      scene,
      x,
      y,
      z,
      ceilingY = 3.2,
      width = 2.4,
      height = 0.55,
      depth = 0.05,
      rotationY = 0,
      text = '◀ 3F 電梯大廳 ｜ 2F 急診・4F 病房區 ▶',
      bgColor = '#234a36',
      borderColor = '#b6d3c3'
    } = options;

    const group = new THREE.Group();
    group.name = `HangingSign_${text.substring(0, 8)}`;

    // 1. Sign enclosure box
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({ color: 0x223328, roughness: 0.7 })
    );
    group.add(box);

    // 2. High-res Canvas for front and back
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 116);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '').trim(), 256, 64, 464);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const signMat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });

    // Front face
    const frontMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width - 0.02, height - 0.02),
      signMat
    );
    frontMesh.position.set(0, 0, depth / 2 + 0.002);
    group.add(frontMesh);

    // Back face
    const backMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width - 0.02, height - 0.02),
      signMat
    );
    backMesh.rotation.y = Math.PI;
    backMesh.position.set(0, 0, -depth / 2 - 0.002);
    group.add(backMesh);

    group.position.set(x, y, z);
    group.rotation.y = rotationY;
    scene.add(group);

    // 3. Suspension rods to ceiling
    const rodMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.85, roughness: 0.3 });
    const rodLength = ceilingY - (y + height / 2);
    if (rodLength > 0.05) {
      const rodY = y + height / 2 + rodLength / 2;
      const offset = (width / 2) * 0.7;

      // In local coordinates rotated by rotationY
      const rod1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, rodLength, 8), rodMat);
      const rod2 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, rodLength, 8), rodMat);

      const dx = Math.cos(rotationY) * offset;
      const dz = -Math.sin(rotationY) * offset;

      rod1.position.set(x + dx, rodY, z + dz);
      rod2.position.set(x - dx, rodY, z - dz);
      scene.add(rod1);
      scene.add(rod2);
    }

    return group;
  }
}
