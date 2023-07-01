import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, MessageEmbed, Message } from "@client";
import { MessageSelectMenu, MessageActionRow, MessageSelectOptionData } from "discord.js";
import { textureComparison } from "@functions/canvas/stitch";
import axios from "axios";
import { MinecraftSorter } from "@helpers/sorter";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("compare")
		.setDescription("Compare a given texture.")
		.addStringOption((option) =>
			option
				.setName("texture")
				.setDescription("The texture to compare (use [#id] syntax to compare by id).")
				.setRequired(true),
		),
	execute: async (interaction: CommandInteraction) => {
		let name = interaction.options.getString("texture");
		if (name.includes(".png")) name = name.replace(".png", "");
		name = name.replace(/ /g, "_");
		if (name.length < 3) {
			// textures like "bed" exist :/
			interaction.reply({
				content: "You need at least three characters to start a texture search!",
				ephemeral: true,
			});
			return;
		}

		const results: Array<any> = (
			await axios.get(`${(interaction.client as Client).tokens.apiUrl}textures/${name}/all`)
		).data;

		if (!results.length) {
			// no results
			interaction.reply({
				content: await interaction.getEphemeralString({
					string: "Command.Texture.NotFound",
					placeholders: { TEXTURENAME: `\`${name}\`` },
				}),
				ephemeral: true,
			});
			return;
		}

		await interaction.deferReply();

		let texture: any | any[];

		// only one result
		if (results.length === 1) {
			texture = results[0];
			const [embed, magnified] = await textureComparison(interaction.client as Client, texture.id);

			interaction
				.editReply({ embeds: [embed], files: [magnified] })
				.then((message: Message) => message.deleteButton(true));
			return;
		} else {
			const components: Array<MessageActionRow> = [];
			let rlen: number = results.length;
			let max: number = 4; // actually 5 but - 1 because we are adding a delete button to it (the 5th one)
			let _max: number = 0;

			// parsing everything correctly
			for (let i = 0; i < results.length; i++) {
				results[i] = {
					label: `[#${results[i].id}] (${
						results[i].paths[0].versions.sort(MinecraftSorter).reverse()[0]
					}) ${results[i].name}`,
					description: results[i].paths[0].name,
					value: results[i].id,
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
				.setDescription(`If you can't what you're looking for, please be more specific!`);

			await interaction
				.editReply({ embeds: [embed], components: components })
				.then((message: Message) => message.deleteButton());
			return;
		}
	},
};
