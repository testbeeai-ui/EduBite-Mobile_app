import './three-native-shim';
import * as THREE from 'three';
import type { HubSceneLayout } from './hub-scene-layout';

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

export function createHubSceneGraph(layout: HubSceneLayout) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0b1220');

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
  camera.position.set(0, 4.2, 11.2);
  camera.lookAt(0, 0.15, 0);

  const root = new THREE.Group();
  scene.add(root);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.15);
  key.position.set(8, 12, 6);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.4);
  fill.position.set(-6, 4, -4);
  scene.add(fill);
  const point = new THREE.PointLight(0x818cf8, 0.25, 24, 2);
  point.position.set(0, 8, 0);
  scene.add(point);

  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const sphereGeo = new THREE.SphereGeometry(1, 8, 8);
  const materials: THREE.Material[] = [];

  const centerMat = standardMaterial('#6366f1', {
    metalness: 0.7,
    roughness: 0.25,
    emissive: '#4338ca',
    emissiveIntensity: 0.35,
  });
  materials.push(centerMat);
  const center = new THREE.Mesh(boxGeo, centerMat);
  center.scale.set(layout.center.size[0], layout.center.size[1], layout.center.size[2]);
  root.add(center);

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
    const platform = new THREE.Mesh(boxGeo, platformMat);
    platform.scale.set(2.4, 0.35, 2.4);
    platform.position.set(0, -0.6, 0);
    group.add(platform);

    for (const game of cluster.games) {
      const gameMat = standardMaterial(game.color, {
        metalness: game.unlocked ? 0.55 : 0.2,
        roughness: game.unlocked ? 0.35 : 0.75,
        opacity: game.unlocked ? 1 : 0.55,
        emissiveIntensity: game.unlocked ? 0.15 : 0.05,
      });
      materials.push(gameMat);
      const cube = new THREE.Mesh(boxGeo, gameMat);
      cube.scale.set(0.55, 0.55, 0.55);
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
    boxGeo.dispose();
    sphereGeo.dispose();
    for (const mat of materials) mat.dispose();
    grid.geometry.dispose();
    const gridMat = grid.material;
    if (Array.isArray(gridMat)) {
      for (const mat of gridMat) mat.dispose();
    } else {
      gridMat.dispose();
    }
  };

  return { scene, camera, root, dispose };
}
