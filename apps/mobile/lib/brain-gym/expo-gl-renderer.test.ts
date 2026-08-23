import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createExpoGlCanvas,
  silenceUnsupportedPixelStorei,
} from './expo-gl-renderer';

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

describe('silenceUnsupportedPixelStorei', () => {
  it('forwards only UNPACK_FLIP_Y_WEBGL and ignores other params', () => {
    const calls: Array<[number, number]> = [];
    const gl = {
      UNPACK_FLIP_Y_WEBGL: 0x9240,
      UNPACK_ALIGNMENT: 0x0cf5,
      pixelStorei(pname: number, param: number) {
        calls.push([pname, param]);
      },
    } as unknown as Parameters<typeof silenceUnsupportedPixelStorei>[0];

    silenceUnsupportedPixelStorei(gl);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.pixelStorei(0x0cf5, 1);

    assert.deepEqual(calls, [[0x9240, 1]]);
  });
});
