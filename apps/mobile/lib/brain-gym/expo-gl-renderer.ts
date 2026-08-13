import type { ExpoWebGLRenderingContext } from 'expo-gl';
import './three-native-shim';
import * as THREE from 'three';

export type ExpoGlCanvas = {
  width: number;
  height: number;
  style: Record<string, never>;
  clientWidth: number;
  clientHeight: number;
  addEventListener: () => void;
  removeEventListener: () => void;
  getContext: () => ExpoWebGLRenderingContext;
};

export function createExpoGlCanvas(gl: ExpoWebGLRenderingContext): ExpoGlCanvas {
  const width = gl.drawingBufferWidth;
  const height = gl.drawingBufferHeight;
  return {
    width,
    height,
    style: {},
    clientWidth: width,
    clientHeight: height,
    addEventListener: () => {},
    removeEventListener: () => {},
    getContext: () => gl,
  };
}

export function createHubSceneRenderer(gl: ExpoWebGLRenderingContext) {
  const canvas = createExpoGlCanvas(gl);
  Object.assign(gl, { canvas });

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas as unknown as HTMLCanvasElement,
    context: gl,
    antialias: false,
    alpha: false,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(1);
  renderer.setSize(canvas.width, canvas.height, false);
  renderer.setClearColor('#0b1220', 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  return { renderer, canvas };
}
