import { EmbedBuilder, ChatInputCommandInteraction, Message, Client } from "@client";
import {
	ActionRowBuilder,
	SelectMenuComponentOptionData,
	StringSelectMenuBuilder,
} from "discord.js";
import { Texture } from "@interfaces";
import { minecraftSorter } from "@helpers/sorter";
import axios from "axios";

/**
 * construct custom choice embed with any given results
 * @param interaction interaction to reply to
 * @param menuID which id the result gets sent to
 * @param choices pre-formatted choices to add in the menus
 */
export async function generalChoiceEmbed(
	interaction: ChatInputCommandInteraction,
	menuID: string,
	choices: SelectMenuComponentOptionData[],
) {
	const choicesLength = choices.length; // we're modifying choices directly so it needs to be saved first
	const components: ActionRowBuilder<StringSelectMenuBuilder>[] = [];
	const emojis: string[] = (
		await axios.get(`${(interaction.client as Client).tokens.apiUrl}settings/emojis.default_select`)
	).data;

	// dividing into maximum of 25 choices per menu
	// 4 menus max
	const maxRows = 4; // actually 5 but - 1 because we are adding a delete button to it (the 5th one)
	for (let currentRow = 0; currentRow <= maxRows && choices.length; ++currentRow) {
		const options: SelectMenuComponentOptionData[] = [];

		for (let i = 0; i < emojis.length; i++)
			if (choices[0] !== undefined) {
				let t = choices.shift();
				t.emoji = emojis[i % emojis.length];
				options.push(t);
			}

		const menu = new StringSelectMenuBuilder()
			.setCustomId(`${menuID}_${currentRow}`)
			.setPlaceholder("Select an option!")
			.addOptions(options);

		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

		components.push(row);
	}

	const embed = new EmbedBuilder()
		.setTitle(`${choicesLength} results found`)
		.setDescription(`If you can't what you're looking for, please be more specific!`);

	await interaction
		.editReply({ embeds: [embed], components: components })
		.then((message: Message) => message.deleteButton());
}

/**
 * construct choice embed when there's multiple textures to pick from
 * @param interaction interaction to reply to
 * @param menuID which id the result gets sent to
 * @param results textures to embed
 * @param constValue extra info to send to the menuID (separate multiple values with "__")
 */
export async function textureChoiceEmbed(
	interaction: ChatInputCommandInteraction,
	menuID: string,
	results: Texture[],
	constValue: string,
) {
	const mappedResults: SelectMenuComponentOptionData[] = [];
	for (const result of results) {
		mappedResults.push({
			label: `[#${result.id}] (${result.paths[0].versions.sort(minecraftSorter).reverse()[0]}) ${
				result.name
			}`,
			description: result.paths[0].name,
			value: `${result.id}__${constValue}`,
		});
	}

	return await generalChoiceEmbed(interaction, menuID, mappedResults);
}
