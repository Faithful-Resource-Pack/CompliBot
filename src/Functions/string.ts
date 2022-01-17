import en_US from '@/lang/en_US.json';
import { ids, parseId } from '~/Helpers/emojis';
export type stringKey = keyof typeof en_US;

export async function string(countryCode: string, text: stringKey, placeholders?: Array<string>): Promise<string> {
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

function parse(text: string, placeholders?: Array<string>): string {
	if (text == undefined) return undefined;
	let result = text;

	//handles emojis: %EMOJI.DELETE%
	result = result.replaceAll(/%EMOJI\.([A-Z_]+)%/g, (string) => {
		let parsedStr = string.substring(7, string.length - 1);
		return parseId(ids[parsedStr.toLowerCase()]);
	});

	//handles placeholders: %1%, %2%..
	//todo: use an object so key value pairs can exist: "%weDoAlil%" => "trolling"

	if (placeholders != undefined) {
		for (let i = 0; i < placeholders.length; i++) {
			result = result.replaceAll(`%${i}%`, placeholders[i].replaceAll(/\\n/, '\n').replaceAll('s', ' '));
		}
	}

	return result;
}
