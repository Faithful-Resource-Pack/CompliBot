import path from 'path';
import { getFileNames } from './files';

/**
 * Gets the names of all commands that can be configured.
 * @returns {Array<{ name: string, value: string }>} The names of all commands that can be configured.
 */
export function getConfigurableCommands(): Array<{ name: string; value: string; }> {
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
    .filter((file) => file.endsWith('.ts' || '.js'))
    .map((file) => file.split(path.sep).pop()!.split('.')[0])
    .map((key) => ({ name: key, value: key }));
}
