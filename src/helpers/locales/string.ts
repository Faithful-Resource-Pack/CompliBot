import { ids, parseId } from "@helpers/emojis";
import { langs, en_US, JSONFiles } from ".";
export type keys = keyof typeof en_US;

export interface Placeholder {
  [key: Capitalize<string>]: string;
}

export async function string(country_code: langs, key: keys, placeholders?: Placeholder): Promise<string> {

  let lang: {};
  for (let i = 0; JSONFiles[i]; i++) lang = {...lang, ...(await import(`@/lang/en-US/${JSONFiles[i]}.json`))} // fallback

  if (country_code !== "en-GB" && country_code !== "en-US") // because the fallback is already IN ENGLISH
    for (let i = 0; JSONFiles[i]; i++) try {
      //* We try the import before spreading the object to avoid issues, we only want to check if the file exists
      const lang2 = await import(`@/lang/${country_code}/${JSONFiles[i]}.json`);
      lang = {...lang, ...lang2};
    } catch {} // file not found

  return parseString(lang[key], country_code, placeholders);
}

export function parseString(text: string | string[], lang: string, placeholders?: Placeholder): string {
  if (text === undefined) return "!Translation Missing!"; // just in case

  let result: string = typeof text === "string" ? (text) : (text.join("$,")); // merge arrays into 1 string

  // handles emojis: %EMOJI.<ANY>%
  result = result.replaceAll(/%EMOJI\.([A-Z_]+)%/g, (str: string) => {
    let parsed = str.substring(7, str.length - 1);
    return parseId(ids[parsed.toLowerCase()]);
  })

  if (placeholders && Object.keys(placeholders).length > 0) {
    for (const key in placeholders) 
      if (!placeholders[key]) {
        if (placeholders["IGNORE_MISSING"].toLocaleLowerCase() == "true") return;
        console.error(`No translation for key: %${key}% in language: ${lang}!`);
      } else result = result.replaceAll(`%${key}%`, placeholders[key]);
  }

  return result;
}