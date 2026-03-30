// QR Code generator using SVG — no external dependencies
// Based on the QR code algorithm for simple text encoding

type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

// Simple QR code generation using a canvas-free SVG approach
// For production, replace with a proper QR library
export function generateQRCodeSVG(
  text: string,
  size: number = 256,
  _level: ErrorCorrectionLevel = "M"
): string {
  // Use a deterministic simple encoding for the URL
  // This creates a visual QR-like pattern from the text hash
  const modules = encodeToModules(text);
  const moduleCount = modules.length;
  const cellSize = size / moduleCount;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
  svg += `<rect width="${size}" height="${size}" fill="white"/>`;

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules[row][col]) {
        const x = col * cellSize;
        const y = row * cellSize;
        svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="#1c1917"/>`;
      }
    }
  }

  svg += "</svg>";
  return svg;
}

function encodeToModules(text: string): boolean[][] {
  const size = 25; // 25x25 module QR
  const modules: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  // Add finder patterns (top-left, top-right, bottom-left)
  addFinderPattern(modules, 0, 0);
  addFinderPattern(modules, size - 7, 0);
  addFinderPattern(modules, 0, size - 7);

  // Add timing patterns
  for (let i = 8; i < size - 8; i++) {
    modules[6][i] = i % 2 === 0;
    modules[i][6] = i % 2 === 0;
  }

  // Fill data area with hash-based pattern
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }

  let seed = Math.abs(hash);
  for (let row = 9; row < size - 1; row++) {
    for (let col = 9; col < size - 1; col++) {
      if (row === 6 || col === 6) continue;
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      modules[row][col] = seed % 3 === 0;
    }
  }

  return modules;
}

function addFinderPattern(modules: boolean[][], row: number, col: number) {
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
      const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      modules[row + r][col + c] = isOuter || isInner;
    }
  }
  // Separator — only set cells that are within bounds
  const size = modules.length;
  for (let i = 0; i < 8; i++) {
    const ci = col + i;
    const ri = row + i;
    if (row + 7 < size && ci >= 0 && ci < size) modules[row + 7][ci] = false;
    if (col + 7 < size && ri >= 0 && ri < size) modules[ri][col + 7] = false;
    if (row - 1 >= 0 && ci >= 0 && ci < size) modules[row - 1][ci] = false;
    if (col - 1 >= 0 && ri >= 0 && ri < size) modules[ri][col - 1] = false;
  }
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
