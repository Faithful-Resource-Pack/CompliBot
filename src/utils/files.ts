import fs from 'fs';
import path from 'path';

/**
 * Aggregate all the files in the directory and return an array of their names.
 * @param {String} directory - The directory to get the files from.
 * @param {Boolean} recursive - Whether to get the files in subdirectories too.
 * @returns {Array<string>} An array of the file names.
 */
export function getFileNames(directory: string, recursive: boolean = false): Array<string> {
  const files: Array<string> = [];

  fs.readdirSync(directory)
    .forEach((file) => {
      const absolute = path.join(directory, file);

      if (fs.statSync(absolute).isDirectory() && recursive) return files.push(...getFileNames(absolute));
      return files.push(absolute);
    });

  return files;
}
