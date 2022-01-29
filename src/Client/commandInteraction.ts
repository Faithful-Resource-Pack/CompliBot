import { Client, CommandInteraction } from "discord.js";
import { string, keys } from "@src/Helpers/string";

declare module "discord.js" {
	interface CommandInteraction {
		text(options: TextOptions): Promise<string>;
	}
}

interface TextOptions {
	string: keys;
	placeholders?: { [key: Capitalize<string>]: string };
}

CommandInteraction.prototype.text = async function (options: TextOptions): Promise<string> {
	return await string(this.locale, options.string, options.placeholders);
};

export default CommandInteraction;
CommandInteraction;
