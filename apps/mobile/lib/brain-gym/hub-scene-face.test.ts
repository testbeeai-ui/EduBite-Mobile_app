import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  faceRowHasInk,
  makeBrainGymFacePixels,
  resolveCubeFaceScale,
} from './hub-scene-face';

describe('makeBrainGymFacePixels', () => {
  it('paints BRAIN in the upper half and GYM in the lower half', () => {
    const width = 128;
    const data = makeBrainGymFacePixels(width, 64);
    assert.equal(faceRowHasInk(data, width, 12), true);
    assert.equal(faceRowHasInk(data, width, 40), true);
    assert.equal(faceRowHasInk(data, width, 2), false);
  });
});

describe('resolveCubeFaceScale', () => {
  it('uses Y-only flip so Expo GL shows left-to-right BRAIN GYM on the cube', () => {
    assert.deepEqual(resolveCubeFaceScale(), [1, -1, 1]);
  });
});
