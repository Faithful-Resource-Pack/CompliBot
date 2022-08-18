import path from 'path';
import { getFileNames } from './files';

/**
 *
 * @returns
 */
export function getConfigurableCommands() {
  const files = getFileNames(path.join(__dirname, '..', 'client', 'commands'), true);
  const blacklistedCommands = [
    'whitelist.ts',
    'blacklist.ts',
  ];

  return files.filter((file) => {
    for (let i = 0; i < blacklistedCommands.length; i += 1) {
      if (file.endsWith(blacklistedCommands[i])) return false;
    }

    return true;
  })
    .map((file) => file.slice(0, -3))
    .map((key: string) => ({ name: key, value: key }));
}
