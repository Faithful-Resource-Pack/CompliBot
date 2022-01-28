import { Client, CommandInteraction } from "discord.js";
import en_US from "@/lang/en-US.json";
import { ids, parseId } from "@src/Helpers/emojis";
export type stringKey = keyof typeof en_US;

// export async function string(
// 	countryCode: string,
// 	text: stringKey,
// 	placeholders?: { [key: string]: string },
// ): Promise<string> {
// 	if (countryCode == "en-GB") countryCode = "en-US"; // no need for difference just adds inconsistency imo.

// 	try {
// 		const data: {} = await import(`@/lang/${countryCode}.json`).catch((e) => {
// 			Promise.reject(e);
// 		});
// 		return data[text] == undefined ? undefined : parse(data[text], countryCode, false, placeholders);
// 	} catch (error) {
// 		const data: {} = en_US;
// 		return data[text] == undefined ? undefined : parse(data[text], countryCode, true, placeholders);

// 		Promise.reject(error);
// 		return undefined;
// 	}
// }

function parse(
	text: string | string[],
	lang: string,
	fallback: boolean,
	placeholders?: { [key: Capitalize<string>]: string },
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

declare module "discord.js" {
	interface CommandInteraction {
		/**
		 * @author Nick-1666
		 * @description a function for translating string keys into the users language.
		 *
		 * USAGE:
		 * -    `%EMOJI.<emoji name>%` gets parsed as an emoji from "ids"
		 * -    `%{KEY}%` gets parsed as its value pair as defined in the placeholders object (if given).
		 * -    Arrays get parsed as strings with "$," as their seperator. A `.split("$,")` can be appended to convert back
		 * -    Should the key `%IGNORE_MISSING%` be equal to "True" (case insensitive), missing keys wont default to en-US.
		 * -    if a language is not yet implemented, en_US will be used as a default but "(untranslated) " will prefix it.
		 * -    if placeholders are only partialy provided, the rest of the keys will not get parsed.
		 */
		text(key: stringKey, placeholders?: { [key: Capitalize<string>]: string }): Promise<string>;
	}
}

CommandInteraction.prototype.text = async (
	key: stringKey,
	placeholders?: { [key: Capitalize<string>]: string },
): Promise<string> => {
	if (this == undefined) return Promise.reject("this is undefined");
	else {
		let countryCode = CommandInteraction.prototype.locale == "en-GB" ? "en-US" : CommandInteraction.prototype.locale;

		try {
			const data: {} = await import(`@/lang/${countryCode}.json`).catch((e) => {
				Promise.reject(e);
			});
			Promise.resolve(data[key] == undefined ? undefined : parse(data[key], countryCode, false, placeholders));
		} catch (error) {
			const data: {} = en_US;
			Promise.resolve(data[key] == undefined ? undefined : parse(data[key], countryCode, true, placeholders));
		}
	}
};

// class ExCommandInteraction extends CommandInteraction {
// 	constructor(client: Client<boolean>, data: GatewayInteractionCreateDispatchData) {
// 		super(client, data);
// 	}
// 	public text = async (key: stringKey, placeholders?: { [key: Capitalize<string>]: string }) => {
// 		return "a";
// 		return await string((this as CommandInteraction).locale, key, placeholders);
// 	};
// }

// export default ExCommandInteraction;

// declare module "discord.js" {
// 	interface CommandInteraction {
// 		text(key: stringKey, placeholders?: { [key: Capitalize<string>]: string }): Promise<string>;
// 	}
// }

// CommandInteraction.prototype.text = async (key: stringKey, placeholders?: { [key: Capitalize<string>]: string }):Promise<string> => {
//     return await string((this as CommandInteraction).locale, key, placeholders);
// }

export default CommandInteraction;
