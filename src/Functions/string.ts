import en_US from '@/lang/en_US.json';
import { ids, parseId } from '@src/Helpers/emojis';
export type stringKey = keyof typeof en_US;

export async function string(countryCode: string, text: stringKey, placeholders?: { [key: string]: string }): Promise<string> {
	try {
		const data: {} = await import(`@/lang/${countryCode}.json`).catch((e) => {
			Promise.reject(e);
		});
		return data[text] == undefined ? undefined : parse(data[text], placeholders);
	} catch (error) {
		Promise.reject(error);
		return undefined;
	}
}

function parse(text: string, placeholders?: { [key: string]: string }): string {
	if (text == undefined) return undefined;
	let result = text;

	//handles emojis: %EMOJI.DELETE%
	result = result.replaceAll(/%EMOJI\.([A-Z_]+)%/g, (string) => {
		let parsedStr = string.substring(7, string.length - 1);
		return parseId(ids[parsedStr.toLowerCase()]);
	});

	//key value pairs can exist: "%foo%" => "bar"
	if (placeholders != undefined && Object.keys(placeholders).length > 0) {
		for (let key in placeholders) {
			result = result.replaceAll(`%${key}%`, placeholders[key]);
		}
	}

	return result;
}
