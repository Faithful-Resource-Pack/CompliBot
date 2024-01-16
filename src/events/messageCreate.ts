import { Event } from "@interfaces/events";
import { Client, Message, EmbedBuilder } from "@client";
import { FaithfulPack, Submission } from "@interfaces/firestorm";
import { colors } from "@utility/colors";
import axios from "axios";
import { randint } from "@utility/methods";
import prefixCommandHandler from "@helpers/prefixCommandHandler";

export default {
	name: "messageCreate",
	async execute(client: Client, message: Message) {
		// duplicate message for logger (ask @Juknum)
		client.storeAction("message", structuredClone(message));

		if (message.author.bot) return;

		const packs: Record<FaithfulPack, Submission> = (
			await axios.get(`${client.tokens.apiUrl}submissions/raw`)
		).data;

		// returns early if you're in a submission channel
		if (Object.values(packs).some((pack) => pack.channels.submit == message.channel.id)) return;

		if (message.content.startsWith(client.tokens.prefix)) return prefixCommandHandler(message);

		/**
		 * easter eggs
		 */
		switch (message.content.toLocaleLowerCase()) {
			case "engineer gaming":
				return message.react("👷").catch(() => {});
			case "rip":
			case "f":
				return message.react("🇫").catch(() => {});
			case "band":
			case "banding":
				return ["🎤", "🎸", "🥁", "🪘", "🎺", "🎷", "🎹", "🪗", "🎻"].forEach(async (emoji) => {
					await message.react(emoji);
				});
			case "monke":
			case "monkee":
				return ["🎷", "🐒"].forEach(async (emoji) => {
					await message.react(emoji).catch(() => {});
				});
			case "hello there":
				message
					.reply({
						content:
							randint(0, 4) == 1
								? "https://i.imgur.com/hAuUsnD.png"
								: "https://media1.tenor.com/images/8dc53503f5a5bb23ef12b2c83a0e1d4d/tenor.gif",
					})
					.then((message) => message.deleteButton());
				break;
		}

		if (message.content.includes("(╯°□°）╯︵ ┻━┻"))
			await message.reply({ content: "┬─┬ ノ( ゜-゜ノ) calm down bro" });

		if (message.mentions.has(client.user.id)) await message.react("1131383751713243277");

		if (/\bmhhh+/.test(message.content.toLocaleLowerCase())) {
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

		if (/\bforgor\b/.test(message.content.toLocaleLowerCase())) await message.react("💀");

		/** @todo remove this in a few months when people forget it existed */
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
