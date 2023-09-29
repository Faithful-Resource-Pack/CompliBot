import { Event } from "@interfaces";
import { Client, Message, EmbedBuilder } from "@client";
import textureComparison from "@functions/textureComparison";
import { Pack } from "@interfaces";
import { colors } from "@helpers/colors";
import axios from "axios";

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
								Math.floor(Math.random() * 4) == 1 // why can't TS/JS just have a normal randint() function
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

		/**
		 * texture ID quoting
		 * @todo deprecate this and switch fully to /compare <id>
		 * @author Evorp
		 */

		const results = message.content.match(/(?<=\[\#)(.*?)(?=\])/g) ?? [];
		if (!results.length) return;

		for (const result of results) {
			let id: string;
			let display = "all";

			// check for [#template]
			const split = result.toLocaleLowerCase().split(" ");
			if (split.includes("template")) {
				id = "template";
				// check for template + display
				if (split.length > 1) display = split.find((arg) => arg !== "template");
			} else if (!isNaN(Number(result))) {
				// if no display is passed in
				id = result;
			} else {
				// display is passed in so parse them separately
				id = result.match(/\d+/g)?.[0];
				display = result
					.match(/[a-zA-Z]+/g)?.[0]
					.toLocaleLowerCase()
					.trim();
			}

			message.channel.sendTyping();
			const replyOptions = await textureComparison(client, id, display);

			try {
				message.reply(replyOptions).then((message: Message) => message.deleteButton());
			} catch {
				message
					.reply({
						embeds: [
							new EmbedBuilder()
								.setTitle("No results found!")
								.setDescription(`The ID ${id} doesn't exist!`)
								.setColor(colors.red),
						],
					})
					.then((message: Message) => message.deleteButton());
			}
		}
	},
} as Event;
