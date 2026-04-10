import type { DbShot } from '../hooks/use-sqlite-training';

export interface DispersionPoint {
  shotId: string;
  /** Lateral offset in yards (positive = right, negative = left) */
  x: number;
  /** Forward carry distance in yards */
  y: number;
  accent: 'green' | 'blue' | 'gold' | 'orange';
  shape: string;
  carry: number;
}

export interface DispersionBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  /** Center of the Y range — used for target circle */
  centerY: number;
}

function parseCarry(val: string): number | null {
  const n = Number.parseFloat(val.replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Convert carry + horizontal launch angle to a landing coordinate. */
function toLandingPoint(carry: number, hla: number): { x: number; y: number } {
  const rad = (hla * Math.PI) / 180;
  return {
    x: carry * Math.sin(rad),
    y: carry * Math.cos(rad),
  };
}

/**
 * Convert DB shots to dispersion points.
 * Shots without HLA data (old records) are skipped.
 */
export function toDispersionPoints(shots: DbShot[]): DispersionPoint[] {
  const points: DispersionPoint[] = [];

  for (const shot of shots) {
    if (shot.hla == null) continue;
    const carry = parseCarry(shot.carry);
    if (carry == null) continue;

    const { x, y } = toLandingPoint(carry, shot.hla);
    points.push({
      shotId: shot.id,
      x,
      y,
      accent: shot.accent,
      shape: shot.shape,
      carry,
    });
  }

  return points;
}

/**
 * Compute axis bounds with symmetric X (so the fairway is centered)
 * and a small padding on each side.
 */
export function computeDispersionBounds(
  points: DispersionPoint[],
  paddingFactor = 0.15,
): DispersionBounds | null {
  if (points.length === 0) return null;

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);

  const rawMinX = Math.min(...xs);
  const rawMaxX = Math.max(...xs);
  const rawMinY = Math.min(...ys);
  const rawMaxY = Math.max(...ys);

  const xSpread = Math.max(Math.abs(rawMinX), Math.abs(rawMaxX));
  const yRange = rawMaxY - rawMinY;
  const yPad = Math.max(yRange * paddingFactor, 5);
  const xPad = Math.max(xSpread * paddingFactor, 5);

  return {
    minX: -(xSpread + xPad),
    maxX: xSpread + xPad,
    minY: rawMinY - yPad,
    maxY: rawMaxY + yPad,
    centerY: (rawMinY + rawMaxY) / 2,
  };
}
