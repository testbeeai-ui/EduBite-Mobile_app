import './three-native-shim';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { HubSceneCamera, HubSceneLayout } from './hub-scene-layout';
import { HUB_SCENE_WEB_CAMERA } from './hub-scene-layout';

function standardMaterial(
  color: string,
  extras: Partial<{
    metalness: number;
    roughness: number;
    emissive: string;
    emissiveIntensity: number;
    opacity: number;
  }> = {},
) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: extras.metalness ?? 0.45,
    roughness: extras.roughness ?? 0.4,
    emissive: extras.emissive ?? color,
    emissiveIntensity: extras.emissiveIntensity ?? 0.08,
    transparent: extras.opacity != null && extras.opacity < 1,
    opacity: extras.opacity ?? 1,
  });
}

/** Tiny 5-row glyphs so the cube face matches Edubite's BRAIN / GYM text without a font file. */
const GLYPHS: Record<string, string[]> = {
  A: ['01110', '10001', '11111', '10001', '10001'],
  B: ['11110', '10001', '11110', '10001', '11110'],
  E: ['11111', '10000', '11110', '10000', '11111'],
  G: ['01111', '10000', '10111', '10001', '01110'],
  I: ['11111', '00100', '00100', '00100', '11111'],
  M: ['10001', '11011', '10101', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001'],
  R: ['11110', '10001', '11110', '10100', '10010'],
  Y: ['10001', '01010', '00100', '00100', '00100'],
};

function makeBrainGymFaceTexture() {
  const width = 128;
  const height = 64;
  const data = new Uint8Array(width * height * 4);
  const plot = (px: number, py: number) => {
    if (px < 0 || py < 0 || px >= width || py >= height) return;
    const i = (py * width + px) * 4;
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = 255;
  };
  const drawLine = (text: string, originX: number, originY: number, scale: number) => {
    let x = originX;
    for (const ch of text) {
      const glyph = GLYPHS[ch];
      if (!glyph) {
        x += 3 * scale;
        continue;
      }
      for (let row = 0; row < glyph.length; row += 1) {
        const bits = glyph[row] ?? '';
        for (let col = 0; col < bits.length; col += 1) {
          if (bits[col] !== '1') continue;
          for (let dy = 0; dy < scale; dy += 1) {
            for (let dx = 0; dx < scale; dx += 1) {
              plot(x + col * scale + dx, originY + row * scale + dy);
            }
          }
        }
      }
      x += 6 * scale;
    }
  };
  drawLine('BRAIN', 16, 10, 3);
  drawLine('GYM', 38, 34, 3);
  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

export type HubSceneLabelAnchor = {
  category: HubSceneLayout['clusters'][number]['category'];
  emoji: string;
  label: string;
  object: THREE.Object3D;
};

export function createHubSceneGraph(
  layout: HubSceneLayout,
  cameraPose: HubSceneCamera = HUB_SCENE_WEB_CAMERA,
) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0b1220');

  const camera = new THREE.PerspectiveCamera(cameraPose.fov, 1, 0.1, 80);
  camera.position.set(...cameraPose.position);
  camera.lookAt(...cameraPose.target);

  const root = new THREE.Group();
  scene.add(root);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(8, 12, 6);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.45);
  fill.position.set(-6, 4, -4);
  scene.add(fill);
  const point = new THREE.PointLight(0x818cf8, 0.25, 24, 2);
  point.position.set(0, 8, 0);
  scene.add(point);

  const centerGeo = new RoundedBoxGeometry(2.2, 2.2, 2.2, 4, 0.25);
  const platformGeo = new RoundedBoxGeometry(2.4, 0.35, 2.4, 4, 0.12);
  const gameGeo = new RoundedBoxGeometry(0.55, 0.55, 0.55, 3, 0.1);
  const sphereGeo = new THREE.SphereGeometry(1, 8, 8);
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];

  const centerMat = standardMaterial('#6366f1', {
    metalness: 0.7,
    roughness: 0.25,
    emissive: '#4338ca',
    emissiveIntensity: 0.35,
  });
  materials.push(centerMat);
  const center = new THREE.Mesh(centerGeo, centerMat);
  root.add(center);

  const faceTex = makeBrainGymFaceTexture();
  textures.push(faceTex);
  const faceMat = new THREE.MeshBasicMaterial({
    map: faceTex,
    transparent: true,
    depthWrite: false,
  });
  materials.push(faceMat);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.85, 0.9), faceMat);
  face.position.set(0, 0, 1.14);
  root.add(face);

  const labelAnchors: HubSceneLabelAnchor[] = [];

  for (const cluster of layout.clusters) {
    const group = new THREE.Group();
    group.position.set(...cluster.center);

    const platformMat = standardMaterial(cluster.color, {
      metalness: 0.35,
      roughness: 0.45,
      opacity: 0.85,
      emissiveIntensity: 0.12,
    });
    materials.push(platformMat);
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.set(0, -0.6, 0);
    group.add(platform);

    const anchor = new THREE.Object3D();
    anchor.position.set(0, 0.55, 0);
    group.add(anchor);
    labelAnchors.push({
      category: cluster.category,
      emoji: cluster.emoji,
      label: cluster.label,
      object: anchor,
    });

    for (const game of cluster.games) {
      const gameMat = standardMaterial(game.color, {
        metalness: game.unlocked ? 0.55 : 0.2,
        roughness: game.unlocked ? 0.35 : 0.75,
        opacity: game.unlocked ? 1 : 0.55,
        emissiveIntensity: game.unlocked ? 0.15 : 0.05,
      });
      materials.push(gameMat);
      const cube = new THREE.Mesh(gameGeo, gameMat);
      cube.position.set(...game.offset);
      group.add(cube);
    }

    root.add(group);
  }

  for (const particle of layout.particles) {
    const pMat = standardMaterial(particle.color, {
      metalness: 0.1,
      roughness: 0.4,
      opacity: 0.7,
      emissiveIntensity: 0.45,
    });
    materials.push(pMat);
    const mesh = new THREE.Mesh(sphereGeo, pMat);
    mesh.position.set(...particle.position);
    mesh.scale.setScalar(particle.scale);
    root.add(mesh);
  }

  const grid = new THREE.GridHelper(28, 28, '#334155', '#1e293b');
  grid.position.y = -1.2;
  root.add(grid);

  const dispose = () => {
    centerGeo.dispose();
    platformGeo.dispose();
    gameGeo.dispose();
    sphereGeo.dispose();
    face.geometry.dispose();
    for (const mat of materials) mat.dispose();
    for (const tex of textures) tex.dispose();
    grid.geometry.dispose();
    const gridMat = grid.material;
    if (Array.isArray(gridMat)) {
      for (const mat of gridMat) mat.dispose();
    } else {
      gridMat.dispose();
    }
  };

  return { scene, camera, root, labelAnchors, dispose };
}
