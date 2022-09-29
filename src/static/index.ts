import { IPacks, TEditions } from '@interfaces';

import IGNORED_TEXTURES from './ignored_textures.json';
import PACKS from './packs.json';

export const packs = PACKS as IPacks;
export const ignoredTextures = IGNORED_TEXTURES as { global: { [edition in TEditions]: string[] } };
