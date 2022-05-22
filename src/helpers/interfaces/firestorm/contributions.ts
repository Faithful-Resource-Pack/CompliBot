export interface Contribution {
  id: string;
  date: number; // unix timestamp
  texture: string; // texture ID
  resolution: number; // texture resolution
  pack:
  | 'faithful_64x'
  | 'faithful_32x'
  | 'classic_faithful_32x'
  | 'classic_faithful_64x'
  | 'classic_faithful_32x_progart'
  | 'classic_faithful_64x_progart';
  authors: string[];
}
export interface Contributions extends Array<Contribution> {}
