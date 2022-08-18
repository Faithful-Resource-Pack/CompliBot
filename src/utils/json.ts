import { ICommandConfig } from '@interfaces';
import fs from 'fs';
import path from 'path';

export class JSONManager {
  /**
   * Loads a JSON file from the given path.
   * @param p The path to the JSON file.
   */
  public static load(p: string): any {
    let output = {};

    try {
      output = JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch {
      // File does not exist.
    }

    return output;
  }

  /**
   * Save a JSON file to the given path.
   * @param p The path to the JSON file.
   * @param data The data to be saved in the file.
   */
  public static save(p: string, data: any): void {
    const dirs = p.split(path.sep).slice(0, -1).join(path.sep);
    if (!fs.existsSync(dirs)) fs.mkdirSync(dirs, { recursive: true });

    fs.writeFileSync(p, JSON.stringify(data));
  }

  public static loadCommandConfig(filename: string): ICommandConfig {
    return this.load(path.join(__dirname, '../../config/commands', filename.endsWith('json') ? filename : `${filename}.json`));
  }

  public static saveCommandConfig(filename: string, data: ICommandConfig): void {
    this.save(path.join(__dirname, '../../config/commands', filename.endsWith('json') ? filename : `${filename}.json`), data);
  }

  public static toCodeBlocks(data: any): string {
    return `\`\`\`json\n${
      JSON
        .stringify(data, null, '\t').split('\n')
        .map((line, index, arr) => (index > 1 || index < arr.length ? `\t${line}` : line))
        .join('\n')
    }\n\`\`\``;
  }
}
