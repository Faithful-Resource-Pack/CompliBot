export interface Pack {
  name: string;
  value: 'faithful_32x' | 'faithful_64x' | 'classic_faithful_32x' | 'classic_faithful_64x' | 'classic_faithful_32x_progart'
}
export interface Packs extends Array<Pack> {}
