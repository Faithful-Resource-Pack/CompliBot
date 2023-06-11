import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Message, MessageEmbed, CommandInteraction, Client } from "@client";
import axios from "axios";

function toTitleCase(str: string) {
	return str.replace(/(^|\s)\S/g, t => t.toUpperCase());
}
export const command: SlashCommand = {
	servers: ["faithful", "faithful_extra", "classic_faithful"],
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
		// TODO: use pages to load more than 20 textures at once without the bot crashing
		const loadingEmbed = new MessageEmbed()
			.setTitle("Searching for contributions...")
			.setDescription("This can take some time, please wait...")
			.setThumbnail(`${(interaction.client as Client).config.images}bot/loading.gif`)
		await interaction.reply({ embeds: [loadingEmbed] })

		// if nobody to search up is provided, defaults to the person who asked
		const user = interaction.options.getUser('user') ?? interaction.user;
		const response = (await axios.get(`${(interaction.client as Client).config.apiUrl}/users/${user.id}/contributions`)).data;
		const AMOUNT_TO_LOAD = 20;
		const totalCount = response.length;
		let textures = [];

		for (let i of response.slice(0, AMOUNT_TO_LOAD)) {
			// TODO: find a better way to get the texture name by ID without fetching from the API 20 times
			try {
				const response2 = (await axios.get(`${(interaction.client as Client).config.apiUrl}/textures/${i.texture}`)).data;
				textures.push([response2.name, i.pack, i.texture]);
			} catch {/* texture doesn't exist so we just skip it */};
		}

		const formatted = textures.map(value => [
			`[\`${value[0]}\`](https://webapp.faithfulpack.net/?#/gallery?show=${value[2]})`,
			toTitleCase(value[1].replace(/_/g, ' '))
		].join(' — '));

		const moreContributions = totalCount >= AMOUNT_TO_LOAD
			? `\n*...${totalCount - AMOUNT_TO_LOAD} more ${(totalCount-AMOUNT_TO_LOAD) == 1 ? "contribution" : "contributions"} not shown*`
			: "";

		const finalEmbed = new MessageEmbed()
			.setTitle(`${user.username} has **${totalCount}** ${totalCount == 1 ? "contribution" : "contributions"}`)
			.setDescription(`${formatted.join('\n')}${moreContributions}`)

		await interaction
			.editReply({embeds: [finalEmbed]})
			.then((message: Message) => message.deleteButton());
	}
};
