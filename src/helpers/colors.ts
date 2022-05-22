export const colors = {
  red: '#f44336',
  yellow: '#ffeb3b',
  blue: '#5865F2',
  black: '#000000',
  council: '#9c3848',
  green: '#4caf50',
  c32: '#76c945',
  c64: '#76c945',
  caddons: '#6d6163',
  ctweaks: '#658430',
  cmods: '#349687',
  cdungeons: '#df7c2b',
  twitter: '#1da0f2',
  youtube: '#ff0000',
  patreon: '#f96754',
  github: '#171515',
  planet_mc: '#3366CC',
  curseforge: '#484848',
  mcpedl: '#12be3c',
  coin: '#ffdc16',
} as const;

export type Color = keyof typeof colors;
