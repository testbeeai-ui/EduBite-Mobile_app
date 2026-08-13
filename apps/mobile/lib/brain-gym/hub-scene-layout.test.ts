import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildHubSceneLayout,
  HUB_SCENE_CATEGORIES,
  HUB_SCENE_CATEGORY_COLORS,
} from './hub-scene-layout';

const SAMPLE_GAMES = [
  { id: 'a', color: '#60a5fa', category: 'memory' as const },
  { id: 'b', color: '#2dd4bf', category: 'memory' as const },
  { id: 'c', color: '#fbbf24', category: 'logic' as const },
  { id: 'd', color: '#a78bfa', category: 'visual' as const },
  { id: 'e', color: '#f472b6', category: 'speed' as const },
];

describe('buildHubSceneLayout', () => {
  it('places four category platforms on the same ring as web Brain Gym', () => {
    const layout = buildHubSceneLayout(SAMPLE_GAMES, {});
    assert.deepEqual(
      layout.clusters.map((c) => c.category),
      [...HUB_SCENE_CATEGORIES],
    );

    const memory = layout.clusters[0];
    const angle = -Math.PI / 4;
    assert.ok(memory);
    assert.equal(memory.color, HUB_SCENE_CATEGORY_COLORS.memory);
    assert.equal(memory.center[0].toFixed(4), (Math.cos(angle) * 7.5).toFixed(4));
    assert.equal(memory.center[1], 0);
    assert.equal(memory.center[2].toFixed(4), (Math.sin(angle) * 7.5).toFixed(4));
  });

  it('orbits games around their category and marks unlock from plays', () => {
    const layout = buildHubSceneLayout(SAMPLE_GAMES, { a: 2, c: 0 });
    const memory = layout.clusters.find((c) => c.category === 'memory');
    assert.ok(memory);
    assert.equal(memory.games.length, 2);
    assert.equal(memory.games[0]?.unlocked, true);
    assert.equal(memory.games[1]?.unlocked, false);

    const radius = Math.min(2.8, 1.4 + 2 * 0.12);
    const first = memory.games[0];
    assert.ok(first);
    const dist = Math.hypot(first.offset[0], first.offset[2]);
    assert.ok(Math.abs(dist - radius) < 1e-9);
  });

  it('keeps a light particle field (no model assets)', () => {
    const layout = buildHubSceneLayout(SAMPLE_GAMES, {});
    assert.equal(layout.particles.length, 16);
    assert.equal(layout.center.size[0], 2.2);
  });
});
