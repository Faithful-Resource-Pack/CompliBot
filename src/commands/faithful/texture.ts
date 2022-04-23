import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, Message, MessageEmbed } from "@client";
import { getTextureMessageOptions } from "@functions/getTexture";
import { MessageActionRow, MessageSelectMenu, MessageSelectOptionData } from "discord.js";
import axios from "axios";
import { imageButtons } from "@helpers/buttons";
import { MinecraftSorter } from "@helpers/sorter";

export const command: SlashCommand = {
	servers: ["faithful", "faithful_extra", "classic_faithful"],
	data: new SlashCommandBuilder()
		.setName("texture")
		.setDescription("Displays a specified texture from either vanilla Minecraft or Faithful.")
		.addStringOption((option) =>
			option.setName("name").setDescription("Name of the texture you are searching for.").setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("pack")
				.setDescription("Resource pack of the texture you are searching for.")
				.addChoices([
					["Vanilla 16x", "default"],
					["Faithful 32x", "faithful_32x"],
					["Faithful 64x", "faithful_64x"],
					["Classic Faithful 32x", "classic_faithful_32x"],
					["Classic Faithful 64x", "classic_faithful_64x"],
					["Classic Faithful 32x Programmer Art", "classic_faithful_32x_progart"],
				])
				.setRequired(true),
		),
	execute: async (interaction: CommandInteraction) => {
		await interaction.deferReply();

		var name = interaction.options.getString("name");
		if (name.includes(".png")) name = name.replace(".png", "");
		name = name.replace(/ /g, "_");
		if (name.length < 3) {
			// textures like "bed" exist :/
			try {
				interaction.deleteReply();
			} catch {}
			interaction.followUp({
				content: "The minimum length for a texture name search is 3, please search with a longer name.",
				ephemeral: true,
			});
			return;
		}

		/**
		 * TODO: find a fix for this Error: connect ETIMEDOUT 172.67.209.9:443 at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1161:16)
		 */
		const results: Array<any> = (await axios.get(`${(interaction.client as Client).config.apiUrl}textures/${name}/all`))
			.data;

		// only 1 result
		if (results.length === 1) {
			const [embed, files] = await getTextureMessageOptions({
				texture: results[0],
				pack: interaction.options.getString("pack", true),
			});
			interaction
				.editReply({ embeds: [embed], files: files, components: [imageButtons] })
				.then((message: Message) => message.deleteButton());
			return;
		}

		// multiple results
		else if (results.length > 1) {
			const components: Array<MessageActionRow> = [];
			let rlen: number = results.length;
			let max: number = 4; // actually 5 but - 1 because we are adding a delete button to it (the 5th one)
			let _max: number = 0;

			// parsing everything correctly
			for (let i = 0; i < results.length; i++) {
				results[i] = {
					label: `[#${results[i].id}] (${results[i].paths[0].versions.sort(MinecraftSorter).reverse()[0]}) ${results[i].name}`,
					description: results[i].paths[0].name,
					value: `${results[i].id}__${interaction.options.getString("pack", true)}`,
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
					.setCustomId(`textureSelect_${_max}`)
					.setPlaceholder("Select a texture!")
					.addOptions(options);

				const row = new MessageActionRow().addComponents(menu);

				components.push(row);
			} while (results.length !== 0 && _max++ < max);

			const embed = new MessageEmbed()
				.setTitle(`${rlen} results`)
				.setFooter({ text: "Some results may be hidden, if you don't see them, be more specific" });

			await interaction
				.editReply({ embeds: [embed], components: components })
				.then((message: Message) => message.deleteButton());
			return;
		}

		// no results
		interaction.deleteReply()
		interaction.followUp({
			content: await interaction.text({ string: "Command.Texture.NotFound", placeholders: { TEXTURENAME: `\`${name}\`` } }),
			ephemeral: true,
		})
	},
};
