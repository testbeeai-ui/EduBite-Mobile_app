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
  setAttribute: () => void;
  getContext: (type?: string) => ExpoWebGLRenderingContext | null;
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
    setAttribute: () => {},
    // THREE r163+ throws if a passed context is instanceof WebGLRenderingContext.
    // Expo's WebGL2 context inherits that prototype, so we never pass `context`
    // and only answer getContext('webgl2').
    getContext: (type?: string) => {
      if (type && type !== 'webgl2') return null;
      return gl;
    },
  };
}

/**
 * Expo GL only implements UNPACK_FLIP_Y_WEBGL. Three.js also calls UNPACK_ALIGNMENT
 * (and similar), which spam "doesn't support this parameter yet!" — safe to ignore.
 */
export function silenceUnsupportedPixelStorei(gl: ExpoWebGLRenderingContext): void {
  const flipY = gl.UNPACK_FLIP_Y_WEBGL;
  const original = gl.pixelStorei.bind(gl);
  gl.pixelStorei = ((pname: number, param: number) => {
    if (pname === flipY) original(pname, param);
  }) as typeof gl.pixelStorei;
}

export function createHubSceneRenderer(gl: ExpoWebGLRenderingContext) {
  const canvas = createExpoGlCanvas(gl);
  Object.assign(gl, { canvas });
  silenceUnsupportedPixelStorei(gl);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas as unknown as HTMLCanvasElement,
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
