import * as emojis from "@src/Helpers/emojis";
import { Event, Command } from "@src/Interfaces";
import { increase } from "@src/Functions/commandProcess";
import Message from "@src/Client/message";

export const event: Event = {
	name: "messageCreate",
	run: async (client, message: Message) => {
		if (message.author.bot) return;

		if (!message.content.startsWith(client.tokens.prefix)) {
			switch (message.content.toLocaleLowerCase()) {
				case "engineer":
					return message.react("👷");
				case "test":
					return message.react(emojis.parseId(emojis.ids.delete));
				case "rip":
				case "f":
				case "oof":
					return message.react("🇫");
				case "band":
					return ["🎤", "🎸", "🥁", "🪘", "🎺", "🎷", "🎹", "🪗", "🎻"].forEach(async (emoji) => {
						await message.react(emoji);
					});
				case "monke": //cases can do this, they can overlap. Very useful
				case "monkee":
				case "monkey":
					return ["🎷", "🐒"].forEach(async (emoji) => {
						await message.react(emoji);
					});
			}
			return;
		}

		client.storeMessage(message); // used to backup last 5 messages in case of unhandled rejection

		const args = message.content.slice(client.tokens.prefix.length).trim().split(/ +/);
		const cmd = args.shift().toLowerCase();
		if (!cmd) return;

		const command = client.commands.get(cmd) || client.aliases.get(cmd);
		if (command) {
			let _ = (message as Message) instanceof Message; // do not remove, 'force' message to be casted (break if removed)
			(command as Command).run(client, message, args);
			increase((command as Command).name);
		}
	},
};
