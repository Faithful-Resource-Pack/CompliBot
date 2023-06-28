import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Message, MessageEmbed, CommandInteraction, Client } from "@client";
import { MessageAttachment } from "discord.js";
import axios from "axios";

function toTitleCase(str: string) {
	return str.replace(/(^|\s)\S/g, t => t.toUpperCase());
}
export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("about")
		.setDescription("Shows a given user's contributions")
		.addUserOption(option =>
			option
				.setName("user")
				.setDescription("User you want to look up (leave blank if you want to search yourself).")
				.setRequired(false)
		),
	execute: async (interaction: CommandInteraction) => {
		await interaction.deferReply();
		// used for loading times
		const baseDescription = "This can take some time, please wait...";

		const loadingEmbed = new MessageEmbed()
			.setTitle("Searching for contributions...")
			.setDescription(baseDescription)
			.setThumbnail(`${(interaction.client as Client).config.images}bot/loading.gif`)

		await interaction
			.editReply({ embeds: [loadingEmbed] })
			.then((message: Message) =>	message.deleteButton());

		// if nobody to search up is provided, defaults to the person who asked
		const user = interaction.options.getUser('user') ?? interaction.user;
		const userData = (await axios.get(`${(interaction.client as Client).tokens.apiUrl}users/${user.id}/contributions`)).data;

		let textureData = [];
		let i = 0;
		for (let data of Object.values(userData)) {
			try {
				const response = (await axios.get(
					`${(interaction.client as Client).tokens.apiUrl}textures/${(data as any).texture}`
				)).data;
				textureData.push([ data, response ]);
				if (i % 5 == 0) // so it's not spamming message edits
					await interaction.editReply({ embeds: [
						loadingEmbed.setDescription(`${baseDescription}\n${i} textures searched of ${userData.length} total.`)
					] })
			} catch {/* texture doesn't exist so just skip it */};
			++i;
		}

		let packCount = {};

		const textBuf = Buffer.from(
			textureData
				.map((data) => {
					const packName = toTitleCase(data[0].pack.replace(/_/g, ' '))
					packCount[packName] = (packCount[packName] ?? 0) + 1;
					return `${packName}: [#${data[1].id}] ${data[1].name}`
				})
				.join("\n")
		);

		const files = new MessageAttachment(textBuf, 'about.txt');
		const finalEmbed = new MessageEmbed()
			.setTitle(`@${user.username} has ${userData.length} ${userData.length == 1 ? "contribution" : "contributions"}!`)
			.setDescription((Object.entries(packCount).map(i => i.join(": "))).join("\n"))

		await interaction
			.editReply({embeds: [finalEmbed], files: [files]})
	}
};
