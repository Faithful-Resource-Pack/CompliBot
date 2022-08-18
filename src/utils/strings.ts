import defaultStrings from '@langs/en-US.json';
import { LocaleString } from 'discord.js';
import path from 'path';
import fs from 'fs';
import { Emojis, mentionEmoji } from './emojis';
import { Logger } from './logger';
import { JSONManager } from './json';

export type BaseStrings = keyof typeof defaultStrings;

export type Placeholder = {
  keys: {
    [key: string]: string;
  },
  ignore_missing?: boolean,
};

export class Strings {
  public static getAll(key: BaseStrings, placeholders?: Placeholder): Partial<Record<LocaleString, string>> {
    const locales: Partial<Record<LocaleString, string>> = {};
    const files: Array<string> = fs.readdirSync(path.join(__dirname, '../..', 'langs'));

    files.forEach((file) => {
      if (!file) return;

      const locale: LocaleString = file.replace('.json', '') as LocaleString;
      const dictionary: typeof defaultStrings = {
        ...defaultStrings, // default strings as fallback
        ...JSONManager.load(path.join(__dirname, '../..', `langs/${file}`)), // asked language
      };

      locales[locale] = this.format(dictionary[key], placeholders);
    });

    return locales;
  }

  public static get(key: BaseStrings, locale: LocaleString = 'en-US', placeholders?: Placeholder): string {
    let lang: typeof defaultStrings;
    const file: string = path.join(__dirname, '../..', `langs/${locale}.json`);

    try {
      lang = {
        ...defaultStrings, // default strings as fallback
        ...JSONManager.load(file), // asked language
      };
    } catch (err) {
      Logger.log('error', `Could not load language file for ${locale} at ${file}`, err);
      return this.format(defaultStrings[key], placeholders);
    }

    return this.format(lang[key], placeholders);
  }

  public static format(str: string | Array<string>, placeholders?: Placeholder): string {
    let result: string = (typeof str === 'string' ? str : str.join('$;'))
      .replaceAll(/%EMOJI\.([A-Z_]+)%/g, (emojiName: string) => mentionEmoji(Emojis[emojiName.substring(7, emojiName.length - 1).toLowerCase() as keyof typeof Emojis]));

    if (placeholders && Object.keys(placeholders).length > 0) {
      Object.keys(placeholders.keys).forEach((key) => {
        if (!placeholders.keys[key]) {
          if (placeholders.ignore_missing) result = result.replaceAll(`%${key}%`, '');
        } else result = result.replaceAll(`%${key}%`, placeholders.keys[key]);
      });
    }

    return result;
  }
}
