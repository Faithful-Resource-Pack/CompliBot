import { Event } from "@interfaces";
import { Client, Message, EmbedBuilder } from "@client";
import { Pack } from "@interfaces";
import { colors } from "@utility/colors";
import axios from "axios";
import * as Random from "@utility/random";
import prefixCommandHandler from "@helpers/prefixCommandHandler";

export default {
	name: "messageCreate",
	async execute(client: Client, message: Message) {
		// duplicate message for logger (ask @Juknum)
		client.storeAction("message", structuredClone(message));

		if (message.author.bot) return;

		const packs: Pack[] = (await axios.get(`${client.tokens.apiUrl}settings/submission.packs`))
			.data;

		const submissionChannels = Object.values(packs).map((pack) => pack.channels.submit);
		// returns early if you're in a submission channel
		if (submissionChannels.includes(message.channel.id)) return;

		if (message.content.startsWith(client.tokens.prefix)) return prefixCommandHandler(message);
		/**
		 * easter eggs
		 */
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
			case "banding":
				["🎤", "🎸", "🥁", "🪘", "🎺", "🎷", "🎹", "🪗", "🎻"].forEach(async (emoji) => {
					try {
						await message.react(emoji);
					} catch (err) {
						/* can't react */
					}
				});
				break;
			case "monke":
			case "monkee":
				["🎷", "🐒"].forEach(async (emoji) => {
					try {
						await message.react(emoji);
					} catch (err) {
						/* can't react */
					}
				});
				break;
			case "hello there":
				message
					.reply({
						embeds: [
							new EmbedBuilder().setImage(
								Random.randint(0, 4) == 1
									? "https://i.imgur.com/hAuUsnD.png"
									: "https://media1.tenor.com/images/8dc53503f5a5bb23ef12b2c83a0e1d4d/tenor.gif",
							),
						],
					})
					.then((message) => message.deleteButton());
				break;
		}

		if (message.content.includes("(╯°□°）╯︵ ┻━┻"))
			await message.reply({ content: "┬─┬ ノ( ゜-゜ノ) calm down bro" });

		if (message.mentions.has(client.user.id)) await message.react("1131383751713243277");

		if (message.content.toLocaleLowerCase().includes("mhhh")) {
			message
				.reply({
					embeds: [
						new EmbedBuilder()
							.setDescription("```Uh-oh moment```")
							.setFooter({ text: "Swahili → English" }),
					],
				})
				.then((message) => message.deleteButton());
		}

		if (message.content.toLocaleLowerCase().includes("forgor")) await message.react("💀");

		const results = message.content.match(/(?<=\[\#)(.*?)(?=\])/g) ?? [];
		if (!results.length) return;
		message
			.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle("Texture ID quoting has been removed!")
						.setDescription(
							"The feature was notoriously buggy, is based on a largely outdated Discord bot meta, and is entirely duplicated by `/compare`.\n\nTo replicate the functionality of ID quoting, simply run `/compare <id>`. [#template] is now a button on the embed for additional visibility.",
						)
						.setColor(colors.red),
				],
			})
			.then((message: Message) => message.deleteButton());
	},
} as Event;
