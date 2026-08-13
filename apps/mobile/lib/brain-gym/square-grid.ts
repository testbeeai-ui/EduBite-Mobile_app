/**
 * Pixel-perfect square cell sizing for Brain Gym grids.
 * Avoids React Native collapse when combining width% + aspectRatio
 * inside a flex parent with unresolved height.
 */
export function computeSquareCellSize(args: {
  width: number;
  height: number;
  cols: number;
  rows: number;
  gap?: number;
  minCell?: number;
}): {
  cell: number;
  gap: number;
  gridWidth: number;
  gridHeight: number;
} {
  const cols = Math.max(1, Math.floor(args.cols));
  const rows = Math.max(1, Math.floor(args.rows));
  let gap = args.gap ?? 10;
  const minCell = args.minCell ?? 48;
  const width = Math.max(0, args.width);
  const height = Math.max(0, args.height);

  const cellForGap = (g: number) => {
    const byW = Math.floor((width - g * (cols - 1)) / cols);
    const byH = Math.floor((height - g * (rows - 1)) / rows);
    return Math.min(byW, byH);
  };

  let cell = cellForGap(gap);
  if (cell < minCell && gap > 6) {
    gap = 6;
    cell = cellForGap(gap);
  }

  const maxByWidth = Math.floor((width - gap * (cols - 1)) / cols);
  const maxByHeight = Math.floor((height - gap * (rows - 1)) / rows);
  const maxFit = Math.min(
    maxByWidth > 0 ? maxByWidth : Number.POSITIVE_INFINITY,
    maxByHeight > 0 ? maxByHeight : Number.POSITIVE_INFINITY,
  );

  if (Number.isFinite(maxFit)) {
    // Prefer minCell, but never overflow the measured board.
    const preferred = Math.max(cell, Math.min(minCell, maxFit));
    cell = Math.max(1, Math.min(preferred, maxFit));
  } else {
    cell = Math.max(minCell, Math.max(1, cell));
  }

  const gridWidth = cols * cell + (cols - 1) * gap;
  const gridHeight = rows * cell + (rows - 1) * gap;
  return { cell, gap, gridWidth, gridHeight };
}
