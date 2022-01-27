import en_US from "@/lang/en-US.json";
import { ids, parseId } from "@src/Helpers/emojis";
import { type } from "os";
export type stringKey = keyof typeof en_US;

//todo: document all replacements, emojis and DONT_REPORT_MISSING: "True" key
export async function string(
	countryCode: string,
	text: stringKey,
	placeholders?: { [key: string]: string },
): Promise<string> {
	if (countryCode == "en-GB") countryCode = "en-US"; // no need for difference just adds inconsistency imo.

	try {
		const data: {} = await import(`@/lang/${countryCode}.json`).catch((e) => {
			Promise.reject(e);
		});
		return data[text] == undefined ? undefined : parse(data[text], countryCode, placeholders, false);
	} catch (error) {
		const data: {} = en_US;
		return data[text] == undefined ? undefined : parse(data[text], countryCode, placeholders, true);

		Promise.reject(error);
		return undefined;
	}
}

function parse(
	text: string | string[],
	lang: string,
	placeholders?: { [key: Capitalize<string>]: string },
	fallback: boolean,
): string {
	if (text == undefined) return undefined;
	let result: string;
	typeof text === "string" ? (result = text) : (result = text.join("$"));

	//handles emojis: %EMOJI.DELETE%
	result = result.replaceAll(/%EMOJI\.([A-Z_]+)%/g, (string) => {
		let parsedStr = string.substring(7, string.length - 1);
		return parseId(ids[parsedStr.toLowerCase()]);
	});

	//key value pairs can exist: "%FOO%" => "bar"
	if (placeholders != undefined && Object.keys(placeholders).length > 0) {
		for (let key in placeholders) {
			if (placeholders[key] == undefined) {
				if (placeholders["DONT_REPORT_MISSING"] == "True") return;
				console.error(`No translation for key: %${key}% in language: ${lang}!`);
			}

			result = result.replaceAll(`%${key}%`, placeholders[key]);
		}
	}

	if (fallback) result = "(untranslated) " + result;
	return result;
}
