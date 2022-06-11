import { Contributions } from './contributions';
import { Paths } from './paths';
import { Uses } from './uses';

export interface Texture {
  id: string;
  name: string;
  tags: string[];
  uses?: Uses;
  paths?: Paths;
  contributions?: Contributions;
}
export interface Textures extends Array<Texture> {}

export interface MCMETA {
  animation: {
    interpolate?: true;
    frametime?: number;
    frames?: Array<number | { index: number; time: number }>;
  };
}
