export const MAX_SURFACE = 262144;

export default function getFactor(width: number, height: number): number {
  const surface = width * height;
  let factor = 1;

  if (surface <= 256) factor = 32; // 16²px or below
  if (surface > 256) factor = 16; // 16²px
  if (surface > 1024) factor = 8; // 32²px
  if (surface > 4096) factor = 4; // 64²px
  if (surface > 65636) factor = 2;

  // 262144 = 512²px
  if (surface >= MAX_SURFACE) factor = 1;

  return factor;
}

export function canBeMagnified(width: number, height: number): boolean {
  return width * height <= MAX_SURFACE;
}
