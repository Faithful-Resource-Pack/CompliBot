import firestorm from 'firestorm-db';
import { Config, Tokens } from '@src/Interfaces';

import ConfigJson from '@/config.json';
import TokensJson from '@/tokens.json';

const config: Config = ConfigJson;
const tokens: Tokens = TokensJson;

export default function (): void {
  firestorm.address(config.firestormUrl);
  firestorm.token(tokens.firestormToken);
}