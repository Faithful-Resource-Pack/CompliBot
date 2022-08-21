import { Octokit } from '@octokit/core';
import { ITokens } from '@interfaces';

import tokens from '@config/tokens.json';

export const octokit = new Octokit({
  auth: (tokens as ITokens).github,
});
