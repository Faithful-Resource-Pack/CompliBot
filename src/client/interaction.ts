import { ButtonInteraction, CommandInteraction, SelectMenuInteraction } from "discord.js";
import { string, keys } from "@src/Helpers/string";

declare module "discord.js" {
	interface CommandInteraction {
		text(options: TextOptions): Promise<string>;
	}

	interface ButtonInteraction {
		text(options: TextOptions): Promise<string>;
	}

	interface SelectMenuInteraction {
		text(options: TextOptions): Promise<string>;
	}
}

interface TextOptions {
	string: keys;
	placeholders?: { [key: Capitalize<string>]: string };
}

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
async function text(options: TextOptions): Promise<string> {
	return await string(this.locale, options.string, options.placeholders);
}

CommandInteraction.prototype.text = text;
ButtonInteraction.prototype.text = text;
SelectMenuInteraction.prototype.text = text;

export { CommandInteraction, ButtonInteraction, SelectMenuInteraction };
