import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, MessageEmbed, Message } from "@client";
import { cycleComparison } from "@functions/canvas/cycle";
import { MessageSelectMenu, MessageActionRow, MessageSelectOptionData } from "discord.js";
import { minecraftSorter } from "@helpers/sorter";
import parseTextureName from "@functions/parseTextureName";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("cycle")
		.setDescription("Cycles through a given texture.")
		.addStringOption((option) =>
			option
				.setName("texture")
				.setDescription("Name or ID of the texture you want to compare.")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("pack")
				.setDescription("Which set of packs you want to display.")
				.addChoices(
					{ name: "Faithful", value: "faithful" },
					{ name: "Classic Faithful Jappa", value: "cfjappa" },
					{ name: "Classic Faithful Programmer Art", value: "cfpa" },
				)
				.setRequired(true),
		)
		.addNumberOption((num) => {
			return num
				.addChoices(
					{ name: "0.25s", value: 4 },
					{ name: "0.5s", value: 2 },
					{ name: "1s", value: 1 },
					{ name: "2s", value: 0.5 },
					{ name: "4s", value: 0.25 },
				)
				.setName("framerate")
				.setDescription("The number of seconds between each frame.")
				.setRequired(false);
		}),
	execute: async (interaction: CommandInteraction) => {
		const display = interaction.options.getString("pack", true);
		const name = interaction.options.getString("texture", true);
		const framerate = interaction.options.getNumber("framerate", false) ?? 1;

		// sometimes it takes too long otherwise
		await interaction.deferReply();
		const results = await parseTextureName(name, interaction);

		// returned early in parseTextureName()
		if (!results) return;

		if (!results.length) {
			// no results
			return interaction
				.editReply({
					content: await interaction.getEphemeralString({
						string: "Command.Texture.NotFound",
						placeholders: { TEXTURENAME: `\`${name}\`` },
					}),
				})
				.then((message: Message) => message.deleteButton());
		}

		// only one result
		if (results.length === 1) {
			const [embed, giffed] = await cycleComparison(
				interaction.client as Client,
				results[0].id,
				display,
				framerate,
			);

			return interaction
				.editReply({ embeds: [embed], files: giffed ? [giffed] : null })
				.then((message: Message) => message.deleteButton());
		}
		const components: Array<MessageActionRow> = [];
		let rlen: number = results.length;
		let max: number = 4; // actually 5 but - 1 because we are adding a delete button to it (the 5th one)
		let _max: number = 0;

		// parsing everything correctly
		for (let i = 0; i < results.length; i++) {
			results[i] = {
				label: `[#${results[i].id}] (${
					results[i].paths[0].versions.sort(minecraftSorter).reverse()[0]
				}) ${results[i].name}`,
				description: results[i].paths[0].name,
				value: `${results[i].id}__${display}`,
			};
		}

		const emojis: Array<string> = [
			"1️⃣",
			"2️⃣",
			"3️⃣",
			"4️⃣",
			"5️⃣",
			"6️⃣",
			"7️⃣",
			"8️⃣",
			"9️⃣",
			"🔟",
			"🇦",
			"🇧",
			"🇨",
			"🇩",
			"🇪",
			"🇫",
			"🇬",
			"🇭",
			"🇮",
			"🇯",
			"🇰",
			"🇱",
			"🇲",
			"🇳",
			"🇴",
		];

		// dividing into maximum of 25 choices per menu
		// 4 menus max
		do {
			const options: Array<MessageSelectOptionData> = [];

			for (let i = 0; i < 25; i++)
				// if (results[0] !== undefined) options.push(results.shift());
				if (results[0] !== undefined) {
					let t = results.shift();
					t.emoji = emojis[i % emojis.length];
					options.push(t);
				}

			const menu = new MessageSelectMenu()
				.setCustomId(`compareSelect_${_max}`)
				.setPlaceholder("Select a texture!")
				.addOptions(options);

			const row = new MessageActionRow().addComponents(menu);

			components.push(row);
		} while (results.length !== 0 && _max++ < max);

		const embed = new MessageEmbed()
			.setTitle(`${rlen} results found`)
			.setDescription(`If you can't find what you're looking for, please be more specific!`);

		await interaction
			.editReply({ embeds: [embed], components: components })
			.then((message: Message) => message.deleteButton());
	},
};
