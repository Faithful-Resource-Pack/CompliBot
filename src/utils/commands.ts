import fs from 'fs';
import path from 'path';

export function getConfigurableCommands() {
  const blacklistedCommands = [
    'whitelist.ts',
    'blacklist.ts',
  ];

  return fs.readdirSync(path.join(__dirname, '../client/commands'))
    .filter((file) => file.endsWith('.ts' || '.js'))
    .filter((file) => !blacklistedCommands.includes(file))
    .map((file) => file.slice(0, -3))
    .map((key: string) => ({ name: key, value: key }));
}
