export interface Use {
  id: string;
  name: string;
  edition: 'java' | 'bedrock' | 'dungeons';
  assets: string | null; // assets folder name (default: "minecraft") (null if bedrock/dungeons edition)
}
export interface Uses extends Array<Use> {}
