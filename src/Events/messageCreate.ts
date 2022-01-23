import { Event, Command } from "@src/Interfaces";
import { increase } from "@src/Functions/commandProcess";
import Message from "@src/Client/message";
import Client from "@src/Client";

export const event: Event = {
	name: "messageCreate",
	run: async (client: Client, message: Message) => {
		if (message.author.bot) return;

		if (!message.content.startsWith(client.tokens.prefix)) {
			switch (message.content.toLocaleLowerCase()) {
				case "engineer gaming":
					try {
						await message.react("👷");
					} catch (err) {
						/* can't react */
					}
					break;
				case "rip":
				case "f":
					try {
						await message.react("🇫");
					} catch (err) {
						/* can't react */
					}
					break;
				case "band":
					["🎤", "🎸", "🥁", "🪘", "🎺", "🎷", "🎹", "🪗", "🎻"].forEach(async (emoji) => {
						try {
							await message.react(emoji);
						} catch (err) {
							/* can't react */
						}
					});
					break;
				case "monke": //cases can do this, they can overlap. Very useful
				case "monkee":
				case "monkey":
					["🎷", "🐒"].forEach(async (emoji) => {
						try {
							await message.react(emoji);
						} catch (err) {
							/* can't react */
						}
					});
					break;
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
