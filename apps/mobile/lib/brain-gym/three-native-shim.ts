/**
 * Minimal DOM shims so three.js WebGLRenderer can boot under React Native.
 * No canvas/document textures — hub geometry is procedural only.
 */
function dummyEl(): Record<string, unknown> {
  return {
    style: {},
    width: 0,
    height: 0,
    getContext: () => null,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

const g = globalThis as unknown as {
  window?: unknown;
  document?: {
    createElement: (tag: string) => Record<string, unknown>;
    createElementNS: (ns: string, tag: string) => Record<string, unknown>;
  };
};

if (g.window == null) {
  g.window = globalThis;
}
if (g.document == null) {
  g.document = {
    createElement: () => dummyEl(),
    createElementNS: () => dummyEl(),
  };
}
