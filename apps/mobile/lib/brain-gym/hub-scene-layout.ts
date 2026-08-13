import { CATEGORY_META } from './registry';
import type { GameCategory } from './types';

export type HubSceneVec3 = [number, number, number];

export const HUB_SCENE_CATEGORIES: GameCategory[] = [
  'memory',
  'logic',
  'visual',
  'speed',
];

export const HUB_SCENE_CATEGORY_COLORS: Record<GameCategory, string> = {
  memory: '#a78bfa',
  logic: '#60a5fa',
  visual: '#f472b6',
  speed: '#fbbf24',
};

/** Edubite web canvas height in brain-gym-scene-3d.tsx */
export const HUB_SCENE_WEB_HEIGHT = 400;

export const HUB_SCENE_WEB_CAMERA = {
  position: [0, 4.2, 11.2] as HubSceneVec3,
  fov: 42,
  target: [0, 0.15, 0] as HubSceneVec3,
};

export type HubSceneGameInput = {
  id: string;
  color: string;
  category: GameCategory;
};

export type HubSceneGameNode = {
  id: string;
  color: string;
  offset: HubSceneVec3;
  unlocked: boolean;
};

export type HubSceneCluster = {
  category: GameCategory;
  center: HubSceneVec3;
  color: string;
  emoji: string;
  label: string;
  games: HubSceneGameNode[];
};

export type HubSceneParticle = {
  position: HubSceneVec3;
  color: string;
  scale: number;
};

export type HubSceneLayout = {
  center: { size: HubSceneVec3 };
  clusters: HubSceneCluster[];
  particles: HubSceneParticle[];
};

export type HubSceneCamera = {
  position: HubSceneVec3;
  fov: number;
  target: HubSceneVec3;
};

export function hubSceneCameraForViewport(height: number): HubSceneCamera {
  const scale = HUB_SCENE_WEB_HEIGHT / Math.max(height, 1);
  const t = Math.min(Math.max(scale, 1), 1.75);
  return {
    position: [
      0,
      HUB_SCENE_WEB_CAMERA.position[1] * t,
      HUB_SCENE_WEB_CAMERA.position[2] * t,
    ],
    fov: HUB_SCENE_WEB_CAMERA.fov,
    target: HUB_SCENE_WEB_CAMERA.target,
  };
}

/** Map Three.js NDC to RN view coords. Hide near edges instead of clamping (that pulled chips off their islands). */
export function projectNdcToView(
  ndcX: number,
  ndcY: number,
  ndcZ: number,
  width: number,
  height: number,
  chipW: number,
  chipH: number,
  /** Keep chips below the title/stats overlay (px from top of the GL view). */
  minTop = 0,
): { left: number; top: number; visible: boolean } {
  const left = (ndcX * 0.5 + 0.5) * width - chipW / 2;
  const top = (-ndcY * 0.5 + 0.5) * height - chipH / 2;
  const visible =
    ndcZ < 1 &&
    Math.abs(ndcX) < 0.78 &&
    Math.abs(ndcY) < 0.78 &&
    top >= minTop &&
    top + chipH <= height - 8;
  if (!visible) return { left: -400, top: -400, visible: false };
  return { left, top, visible: true };
}

export function buildHubSceneLayout(
  games: HubSceneGameInput[],
  playsById: Record<string, number | undefined>,
): HubSceneLayout {
  const grouped: Record<GameCategory, HubSceneGameInput[]> = {
    memory: [],
    logic: [],
    visual: [],
    speed: [],
  };
  for (const game of games) grouped[game.category].push(game);

  const clusters = HUB_SCENE_CATEGORIES.map((category, index) => {
    const angle = (index / HUB_SCENE_CATEGORIES.length) * Math.PI * 2 - Math.PI / 4;
    const radius = 7.5;
    const list = grouped[category];
    const gameRadius = Math.min(2.8, 1.4 + list.length * 0.12);
    return {
      category,
      color: HUB_SCENE_CATEGORY_COLORS[category],
      emoji: CATEGORY_META[category].emoji,
      label: CATEGORY_META[category].label,
      center: [
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius,
      ] as HubSceneVec3,
      games: list.map((game, gameIndex) => {
        const gameAngle = (gameIndex / list.length) * Math.PI * 2;
        return {
          id: game.id,
          color: game.color,
          unlocked: (playsById[game.id] ?? 0) > 0,
          offset: [
            Math.cos(gameAngle) * gameRadius,
            0.15 + Math.sin(gameIndex * 0.8) * 0.2,
            Math.sin(gameAngle) * gameRadius,
          ] as HubSceneVec3,
        };
      }),
    };
  });

  const particles = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    const radius = 11 + (i % 3) * 1.5;
    return {
      position: [
        Math.cos(angle) * radius,
        ((i % 5) - 2) * 0.8,
        Math.sin(angle) * radius,
      ] as HubSceneVec3,
      color: `hsl(${(i * 360) / 16}, 75%, 58%)`,
      scale: 0.08 + (i % 4) * 0.04,
    };
  });

  return {
    center: { size: [2.2, 2.2, 2.2] },
    clusters,
    particles,
  };
}
