import type { GameCategory } from './types';

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

export type HubSceneGameInput = {
  id: string;
  color: string;
  category: GameCategory;
};

export type HubSceneVec3 = [number, number, number];

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
