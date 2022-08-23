import fs from 'fs';
import path from 'path';
import defaultStrings from '@langs/en-US.json';
import { formatEmoji, LocaleString } from 'discord.js';
import { Emojis } from '@enums';
import { Logger } from '@utils';

export type BaseStrings = keyof typeof defaultStrings;

export type Placeholder = {
  keys: {
    [key: string]: string;
  },
  ignore_missing?: boolean,
};

declare global {
  interface String {
    /**
     * Capitalize the first letter of the string.
     * @returns {String} The capitalized string.
     * @example String.capitalize('hello world'); // 'Hello world'
     */
    capitalize(): string;
  }

  interface StringConstructor {
    /**
     * Get the corresponding string for the given key.
     * @param {BaseStrings} key - The key from the default strings in `./langs/en-US.json`.
     * @param {LocaleString} locale - The locale to get the string for (default 'en-US').
     * @param {Placeholder} placeholders - The placeholders to replace inside the string.
     * @returns {String|Array<String>} The string(s) for the given key.
     */
    //* Do not remove the 'any' type. Otherwise the compiler will complain in the SlashCommandBuilder (strings[] is not assignable to string).
    get(key: BaseStrings, locale?: LocaleString | null, placeholders?: Placeholder): any;

    /**
     * Get all localizations of the given key.
     * @param {BaseStrings} key - The key from the default strings in `./langs/en-US.json`.
     * @param {Placeholder} placeholders - The placeholders to replace inside the string.
     * @returns {Partial<Record<LocaleString>, string>} A partial record of all strings.
     */
    getAll(key: BaseStrings, placeholders?: Placeholder): Partial<Record<LocaleString, string>>;

    /**
     * Format the given string with the given placeholders.
     * @param {String|Array<String>} str - The string to format.
     * @param {Placeholder} placeholders - The placeholders to replace inside the string.
     * @returns {String|Array<String>} The formatted string(s).
     */
    format(str: string | Array<string>, placeholders?: Placeholder): string | Array<string>;
  }
}

if (!String.get) {
  Object.defineProperty(String, 'get', {
    value: function get(key: BaseStrings, locale: LocaleString = 'en-US', placeholders?: Placeholder): any {
      let lang: typeof defaultStrings;
      const file: string = path.join(__dirname, '../..', `langs/${locale}.json`);

      try {
        lang = {
          ...defaultStrings, // default strings as fallback
          ...JSON.load(file), // asked language
        };
      } catch (err) {
        Logger.log('error', `Could not load language file for ${locale} at ${file}`, err);
        return this.format(defaultStrings[key], placeholders);
      }

      return this.format(lang[key], placeholders);
    },
    enumerable: false,
    configurable: false,
    writable: false,
  });
}

if (!String.getAll) {
  Object.defineProperty(String, 'getAll', {
    value: function getAll(key: BaseStrings, placeholders?: Placeholder): Partial<Record<LocaleString, string>> {
      const locales: Partial<Record<LocaleString, string>> = {};
      const files: Array<string> = fs.readdirSync(path.join(__dirname, '../..', 'langs'));

      files.forEach((file) => {
        if (!file) return;

        const locale: LocaleString = file.replace('.json', '') as LocaleString;
        const dictionary: typeof defaultStrings = {
          ...defaultStrings, // default strings as fallback
          ...JSON.load(path.join(__dirname, '../..', `langs/${file}`)), // asked language
        };

        [locales[locale]] = [...this.format(dictionary[key], placeholders)];
      });

      return locales;
    },
    enumerable: false,
    configurable: false,
    writable: false,
  });
}

if (!String.format) {
  Object.defineProperty(String, 'format', {
    value: function format(str: string | Array<string>, placeholders?: Placeholder): string | Array<string> {
      let result: string = (typeof str === 'string' ? str : str.join('$;'))
        .replaceAll(/%EMOJI\.([A-Z_]+)%/g, (emojiName: string) => formatEmoji(Emojis[emojiName.substring(7, emojiName.length - 1).toLowerCase() as keyof typeof Emojis]));

      if (placeholders && Object.keys(placeholders).length > 0) {
        Object.keys(placeholders.keys).forEach((key) => {
          if (!placeholders.keys[key]) {
            if (placeholders.ignore_missing) result = result.replaceAll(`%${key}%`, '');
          } else result = result.replaceAll(`%${key}%`, placeholders.keys[key]);
        });
      }

      if (typeof str === 'string') return result;
      return result.split('$;');
    },
    enumerable: false,
    configurable: false,
    writable: false,
  });
}

if (!String.prototype.capitalize) {
  Object.defineProperty(String.prototype, 'capitalize', {
    value: function capitalize(): string {
      return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false,
    configurable: false,
    writable: false,
  });
}

export {};
