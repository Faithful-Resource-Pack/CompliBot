import en_US from "@/lang/en-US.json";
import { ids, parseId } from "@src/Helpers/emojis";
export type keys = keyof typeof en_US;

/**
 * !todo: add description @Nick
 *
 * @param country_code
 * @param key
 * @param placeholders
 * @returns
 */
export async function string(
	country_code: string,
	key: keys,
	placeholders?: { [key: string]: string },
): Promise<string> {
	let lang: {};

	if (country_code !== "en-GB" && country_code !== "en-US") {
		try {
			lang = await import(`@/lang/${country_code}.json`);
		} catch (error) {
			// fallback
			console.error(error);
			lang = en_US;
		}
	} else lang = en_US; // same for enGB & enUS

	return lang[key] === undefined
		? parse(en_US[key], country_code, placeholders)
		: parse(lang[key], country_code, placeholders);
}

/**
 * !todo: add description @Nick
 *
 * @param text
 * @param lang
 * @param placeholders
 * @returns
 */
function parse(text: string | string[], lang: string, placeholders?: { [key: Capitalize<string>]: string }): string {
	if (text === undefined) return "!!Translation Missing!!"; // just in case, shouldn't happening

	let result: string;
	typeof text === "string" ? (result = text) : (result = text.join("$,")); // merge arrays into 1 string

	// handles emojis: %EMOJI.DELETE%
	result = result.replaceAll(/%EMOJI\.([A-Z_]+)%/g, (string) => {
		let parsedStr = string.substring(7, string.length - 1);
		return parseId(ids[parsedStr.toLowerCase()]);
	});

	// key value pairs can exist: "%FOO%" => "bar"
	if (placeholders != undefined && Object.keys(placeholders).length > 0) {
		for (let key in placeholders) {
			if (placeholders[key] == undefined) {
				if (placeholders["IGNORE_MISSING"].toLocaleLowerCase() == "true") return;
				console.error(`No translation for key: %${key}% in language: ${lang}!`);
			}

			result = result.replaceAll(`%${key}%`, placeholders[key]);
		}
	}

	return result;
}
