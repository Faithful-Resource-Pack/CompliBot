import { ISettings, ITokens } from '@interfaces';

import SETTINGS from '@config/settings.json';
import TOKENS from '@config/tokens.json';

export const URL: ISettings['apiBaseURL'] = SETTINGS.apiBaseURL;
export const TOKEN: ITokens['api'] = TOKENS.api;

export {
  getAllMCVersions as MCversions,
  getAllMCEditions as MCeditions,
  getMCVersionsFromEdition as MCversionsFromEdition,
} from './packs';
