/** Pixel face for the Brain Gym cube — stays on the mesh so it rotates with the cube. */

const GLYPHS: Record<string, string[]> = {
  A: ['01110', '10001', '11111', '10001', '10001'],
  B: ['11110', '10001', '11110', '10001', '11110'],
  E: ['11111', '10000', '11110', '10000', '11111'],
  G: ['01111', '10000', '10111', '10001', '01110'],
  I: ['11111', '00100', '00100', '00100', '11111'],
  M: ['10001', '11011', '10101', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001'],
  R: ['11110', '10001', '11110', '10100', '10010'],
  Y: ['10001', '01010', '00100', '00100', '00100'],
};

function fillBrainGymFacePixels(data: Uint8Array, width: number, height: number) {
  const plot = (px: number, py: number) => {
    if (px < 0 || py < 0 || px >= width || py >= height) return;
    const i = (py * width + px) * 4;
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = 255;
  };
  const drawLine = (text: string, originX: number, originY: number, scale: number) => {
    let x = originX;
    for (const ch of text) {
      const glyph = GLYPHS[ch];
      if (!glyph) {
        x += 4 * scale;
        continue;
      }
      for (let row = 0; row < glyph.length; row += 1) {
        const bits = glyph[row] ?? '';
        for (let col = 0; col < bits.length; col += 1) {
          if (bits[col] !== '1') continue;
          for (let dy = 0; dy < scale; dy += 1) {
            for (let dx = 0; dx < scale; dx += 1) {
              plot(x + col * scale + dx, originY + row * scale + dy);
            }
          }
        }
      }
      x += 6 * scale;
    }
  };
  // Larger glyphs so the cube face stays readable while rotating.
  drawLine('BRAIN', 8, 6, 4);
  drawLine('GYM', 32, 34, 4);
}

export function faceRowHasInk(data: Uint8Array, width: number, row: number): boolean {
  const start = row * width * 4;
  for (let x = 0; x < width; x += 1) {
    if ((data[start + x * 4 + 3] ?? 0) > 0) return true;
  }
  return false;
}

export function makeBrainGymFacePixels(width = 128, height = 64): Uint8Array {
  const data = new Uint8Array(width * height * 4);
  fillBrainGymFacePixels(data, width, height);
  return data;
}

/**
 * Expo GL DataTexture presents Y flipped vs browser. X must stay +1 so letters
 * read left-to-right (scale -1,-1 left them mirrored).
 */
export function resolveCubeFaceScale(): [number, number, number] {
  return [1, -1, 1];
}
