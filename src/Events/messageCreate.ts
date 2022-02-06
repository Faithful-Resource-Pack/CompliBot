import { Event, Command } from "@src/Interfaces";
import { increase } from "@src/Functions/commandProcess";
import { Client, Message, MessageEmbed } from "@src/Extended Discord";
import { quote } from "@src/Functions/quote";
import easterEgg from "@functions/canvas/isEasterEggImg";

export const event: Event = {
	name: "messageCreate",
	run: async (client: Client, message: Message) => {
		if (message.author.bot) return;

		if (!message.content.startsWith(client.tokens.prefix)) {
			if (/https:\/\/(canary\.)?discord(app)?\.com\/channels\/([0-9]+)\/([0-9]+)\/([0-9]+)/g.exec(message.content))
				quote(message);

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

			if (message.attachments.size > 0) {
				console.log("a");
				console.log(await easterEgg(message.attachments.first().url));
				if (await easterEgg(message.attachments.first().url)) {
					console.log("a");
					const embed = new MessageEmbed()
						.setTitle('"rOtAte tiLinG"')
						.setImage("https://cdn.discordapp.com/attachments/923370825762078720/939476550749913138/tiled.png")
						.setFooter({ text: "Nick.#1666" })
						.setTimestamp(new Date(1644059063305)); // when the funny moment happened
					message.channel.send({ embeds: [embed] });
				}
			}
			return;
		}

		client.storeMessage(message); // used to backup last 5 messages in case of unhandled rejection

		const args = message.content.slice(client.tokens.prefix.length).trim().split(/ +/);
		const cmd = args.shift().toLowerCase();
		if (!cmd) return;

		const command = client.commands.get(cmd) || client.aliases.get(cmd);
		if (command) {
			let _ = (message as Message) instanceof Message; //! do not remove, 'force' message to be casted (break if removed)
			(command as Command).run(client, message, args);
			increase((command as Command).name);
		}
	},
};
