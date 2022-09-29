export type TEditions = 'java' | 'bedrock';

export interface IPack {
  name: string;
  value: 'faithful_32x' | 'faithful_64x' | 'classic_faithful_32x' | 'classic_faithful_64x' | 'classic_faithful_32x_progart' | 'default',
  editions: Array<Partial<TEditions>>
}
export interface IPacks extends Array<IPack> {}
