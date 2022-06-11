import { Contribution } from './contributions';
import { Use } from './uses';

export type Repos = {
  [edition in Use['edition']]?: string
};

export type AllRepos = {
  [pack in Contribution['pack']]: Repos
};
