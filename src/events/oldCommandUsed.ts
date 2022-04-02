import { Event, Command } from "@interfaces";
import { Client, Message } from "@client";

export const event: Event = {
	name: "oldCommandUsed",
	run: async (client: Client, message: Message) => {
		client.storeAction("oldCommand", message);

		// deprecated (old commands detection system)
		const args = message.content.slice(client.tokens.prefix.length).trim().split(/ +/);
		const cmd = args.shift().toLowerCase();
		if (!cmd) return;

		const command = client.commands.get(cmd) || client.aliases.get(cmd);
		if (command) {
			let _ = (message as Message) instanceof Message; //! do not remove, 'force' message to be casted (break if removed)
			(command as Command).run(client, message, args);
		}
	},
};
