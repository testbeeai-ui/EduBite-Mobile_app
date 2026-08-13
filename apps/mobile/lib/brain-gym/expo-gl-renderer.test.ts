import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createExpoGlCanvas } from './expo-gl-renderer';

describe('createExpoGlCanvas', () => {
  it('mirrors the Expo drawing buffer so three.js never loads a model file', () => {
    const gl = {
      drawingBufferWidth: 640,
      drawingBufferHeight: 360,
    } as Parameters<typeof createExpoGlCanvas>[0];
    const canvas = createExpoGlCanvas(gl);
    assert.equal(canvas.width, 640);
    assert.equal(canvas.height, 360);
    assert.equal(canvas.getContext(), gl);
  });

  it('only exposes webgl2 so THREE r163+ does not treat Expo GL as WebGL 1', () => {
    const gl = {
      drawingBufferWidth: 320,
      drawingBufferHeight: 180,
    } as Parameters<typeof createExpoGlCanvas>[0];
    const canvas = createExpoGlCanvas(gl);
    assert.equal(canvas.getContext('webgl2'), gl);
    assert.equal(canvas.getContext('webgl'), null);
    assert.equal(canvas.getContext('experimental-webgl'), null);
  });
});
