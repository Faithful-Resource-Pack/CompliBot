import { string, stringKey } from "@src/Helpers/string";
import { Command } from "@src/Interfaces";
import enUS from "@/lang/en-US.json";
export const command: Command = {
	name: "logAlphabeticalLang",
	description: "haha lang go brr",
	usage: ["logAlphabeticalLang"],
	aliases: [],
	run: async (client, message, args) => {
		if (message.author.id != "601501288978448411") return;
		let sorted = Object.keys(enUS)
			.sort()
			.reduce(
				(acc, key) => ({
					...acc,
					[key]: enUS[key],
				}),
				{},
			);

		console.log(sorted);
	},
};
