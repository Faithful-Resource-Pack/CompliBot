import { string, keys } from "@src/Helpers/string";
import { Command } from "@src/Interfaces";

export const command: Command = {
	name: "test",
	description: "eee",
	usage: ["t"],
	aliases: ["t"],
	run: async (client, message, args) => {
		message.reply("old commands still works");
	},
};
