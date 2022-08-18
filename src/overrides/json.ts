import { ICommandConfig } from '@interfaces';
import fs from 'fs';
import path from 'path';

declare global {
  interface JSON {
    /**
     * Load a JSON file from the given path.
     * @param {String} filepath - The path to the JSON file.
     */
    load(filepath: string): any;

    /**
     * Save a JSON file to the given path.
     * @param {String} filepath - The path to the JSON file.
     * @param data - The data to be saved in the file.
     */
    save(filepath: string, data: any): void;

    /**
     * Load the configuration JSON file from the __dirname/config directory.
     * @param filepath - file inside the config directory
     * @returns {ICommandConfig} the configuration object
     */
    configLoad(filepath: string): ICommandConfig;

    /**
     * Save the configuration JSON file to the __dirname/config directory.
     * @param filepath - file inside the config directory
     * @param {ICommandConfig} data - the configuration object to be saved
     */
    configSave(filepath: string, data: ICommandConfig): void;

    /**
     * Equivalent of JSON.stringify() but adapted to Discord code-blocks.
     * @param data - the data to be code-blocks-ed
     */
    toCodeBlock(data: any): string;
  }
}

if (!JSON.load) {
  Object.defineProperty(JSON, 'load', {
    value: function load(filepath: string) {
      let output = {};

      try {
        output = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      } catch (err) {
        // File does not exist.
        console.warn(`File ${filepath} does not exist.\n${err}`);
      }

      return output;
    },
    enumerable: false,
    configurable: false,
    writable: false,
  });
}

if (!JSON.save) {
  Object.defineProperty(JSON, 'save', {
    value: function save(filepath: string, data: any) {
      const dirs = filepath.split(path.sep).slice(0, -1).join(path.sep);
      if (!fs.existsSync(dirs)) fs.mkdirSync(dirs, { recursive: true });

      fs.writeFileSync(filepath, JSON.stringify(data));
    },
    enumerable: false,
    configurable: false,
    writable: false,
  });
}

if (!JSON.configLoad) {
  Object.defineProperty(JSON, 'configLoad', {
    value: function configLoad(filepath: string) {
      return JSON.load(path.join(__dirname, '../../config', filepath));
    },
    enumerable: false,
    configurable: false,
    writable: false,
  });
}

if (!JSON.configSave) {
  Object.defineProperty(JSON, 'configSave', {
    value: function configSave(filepath: string, data: ICommandConfig) {
      return JSON.save(path.join(__dirname, '../../config', filepath), data);
    },
    enumerable: false,
    configurable: false,
    writable: false,
  });
}

if (!JSON.toCodeBlock) {
  Object.defineProperty(JSON, 'toCodeBlock', {
    value: function toCodeBlock(data: any) {
      return `\`\`\`json\n${
        JSON
          .stringify(data, null, '\t').split('\n')
          .map((line, index, arr) => (index > 1 || index < arr.length ? `\t${line}` : line))
          .join('\n')
      }\n\`\`\``;
    },
    enumerable: false,
    configurable: false,
    writable: false,
  });
}

export {};
