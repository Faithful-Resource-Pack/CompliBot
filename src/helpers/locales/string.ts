import path from 'path';
import { ids, parseId } from '@helpers/emojis';
import { err } from 'helpers/logger';
import { Langs, enUS, JSONFiles } from '.';

export type Keys = keyof typeof enUS;

export interface Placeholder {
  [key: Capitalize<string>]: string;
}

export function parseString(text: string | string[], lang: string, placeholders?: Placeholder): string {
  if (text === undefined) return '!Translation Missing!'; // just in case

  let result: string = typeof text === 'string' ? text : text.join('$,'); // merge arrays into 1 string

  // handles emojis: %EMOJI.<ANY>%
  result = result.replaceAll(/%EMOJI\.([A-Z_]+)%/g, (str: string) => {
    const parsed = str.substring(7, str.length - 1);
    return parseId(ids[parsed.toLowerCase()]);
  });

  if (placeholders && Object.keys(placeholders).length > 0) {
    Object.keys(placeholders).forEach((key) => {
      if (!placeholders[key]) {
        if (placeholders.IGNORE_MISSING && placeholders.IGNORE_MISSING.toLowerCase() === 'true') result = result.replaceAll(`%${key}%`, '');
        else console.error(`${err} No translations found for key: %${key}% in language: ${lang}`);
      } else result = result.replaceAll(`%${key}%`, placeholders[key]);
    });
  }

  return result;
}

export async function string(country_code: Langs, key: Keys, placeholders?: Placeholder): Promise<string> {
  let lang: {};
  for (let i = 0; JSONFiles[i]; i += 1) {
    lang = {
      ...lang,
      ...(await import(path.join(__dirname, '../../../', `/lang/en-US/${JSONFiles[i]}.json`))),
    };
  } // fallback

  if (country_code !== 'en-GB' && country_code !== 'en-US') {
  // because the fallback is already IN ENGLISH
    for (let i = 0; JSONFiles[i]; i += 1) {
      try {
      //* We try the import before spreading the object to avoid issues, we only want to check if the file exists
        const lang2 = await import(path.join(__dirname, '../../../', `/lang/${country_code}/${JSONFiles[i]}.json`));
        lang = {
          ...lang,
          ...lang2,
        };
      } catch {
        //* If the file doesn't exist, we don't do anything
      }
    }
  } // file not found

  return parseString(lang[key], country_code, placeholders);
}
