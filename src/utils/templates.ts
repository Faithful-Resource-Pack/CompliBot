import fs from 'fs';
import path from 'path';

/**
 * Load template file from the ./templates directory.
 * @param {String} filepath - The filepath to the template file inside the ./template directory.
 * @returns {String} The template file contents.
 */
export function templateLoad(filepath: string): string {
  const fullPath = path.join(__dirname, '../../templates', filepath);
  let output = '';

  try {
    output = fs.readFileSync(fullPath, 'utf8');
  } catch (err) {
    // File does not exist.
    console.warn(`File ${fullPath} does not exist.\n${err}`);
  }

  return output;
}
