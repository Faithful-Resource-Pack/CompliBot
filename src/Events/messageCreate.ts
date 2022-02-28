import { Event } from "@src/Interfaces";
import { Client, Message, MessageEmbed } from "@src/Extended Discord";
import { quote } from "@src/Functions/quote";
import easterEgg from "@functions/canvas/isEasterEggImg";
import { deleteMessage } from "@helpers/buttons";
import { MessageActionRow } from "discord.js";

export const event: Event = {
	name: "messageCreate",
	run: async (client: Client, message: Message) => {
		if (message.author.bot) return;

		//! do not remove, 'force' message to be casted (break if removed)
		let _ = (message as Message) instanceof Message;

		// old commands handler (remove for release)
		if (message.content.startsWith(client.tokens.prefix)) {
			client.emit("oldCommandUsed", (client as Client, message));
			return;
		}

		// test if message is in submit channel
		if (Object.values(client.config.submissions).filter(c => c.submit === message.channelId).length > 0) {
			client.emit("textureSubmitted", (client as Client, message));
			return;
		}

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
			case "mhhh":
				const embed = new MessageEmbed().setDescription("```Uh-oh moment```").setFooter({ text: "Swahili → English" });
				message.reply({ embeds: [embed] }).then((message) => message.deleteButton(true));
				break;
			case "hello there":
				message
					.reply("https://media1.tenor.com/images/8dc53503f5a5bb23ef12b2c83a0e1d4d/tenor.gif")
					.then((message) => message.deleteButton(true));
				break;
		}
		if (message.content.includes("(╯°□°）╯︵ ┻━┻"))
			return await message.reply({ content: "┬─┬ ノ( ゜-゜ノ) calm down bro" });
		if (message.attachments.size > 0) {
			if ((await easterEgg(message.attachments.first().url, 1)) && !client.tokens.dev) {
				const embed = new MessageEmbed()
					.setTitle('"rOtAte tiLinG"')
					.setImage("https://cdn.discordapp.com/attachments/923370825762078720/939476550749913138/tiled.png")
					.setFooter({ text: "Nick.#1666" })
					.setTimestamp(new Date(1644059063305)); // when the funny moment happened
				message.reply({ embeds: [embed] }).then((message) => message.deleteButton(true));
			}
			if ((await easterEgg(message.attachments.first().url, 2)) && !client.tokens.dev) {
				const embed = new MessageEmbed()
					.setTitle('"FlIp tiLinG"')
					.setImage("https://cdn.discordapp.com/attachments/923370825762078720/940676536330223676/tiled.png")
					.setFooter({ text: "Nick.#1666 - again" })
					.setTimestamp(new Date(1644345162257)); // when the funny moment happened again
				message.reply({ embeds: [embed] }).then((message) => message.deleteButton(true));
			}
		}
	},
};
