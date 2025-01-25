import { EmbedBuilder, Message, StringSelectMenuInteraction } from "@client";
import {
	ActionRowBuilder,
	SelectMenuComponentOptionData,
	StringSelectMenuBuilder,
} from "discord.js";
import type { Texture } from "@interfaces/database";
import minecraftSorter from "@utility/minecraftSorter";
import axios from "axios";
import type { AnyInteraction } from "@interfaces/interactions";

/**
 * Construct custom choice embed with any given results
 * @author Juknum, Evorp
 * @param interaction interaction to reply to
 * @param menuID which id the result gets sent to
 * @param choices pre-formatted choices to add in the menus
 */
export async function generalChoiceEmbed(
	interaction: AnyInteraction,
	menuID: string,
	choices: SelectMenuComponentOptionData[],
) {
	const choicesLength = choices.length; // we're modifying choices directly so it needs to be saved first
	const components: ActionRowBuilder<StringSelectMenuBuilder>[] = [];
	const emojis: string[] = (
		await axios.get(`${interaction.client.tokens.apiUrl}settings/emojis.default_select`)
	).data;

	// dividing into maximum of 25 choices per menu
	// 4 menus max
	const maxRows = 4; // actually 5 but - 1 because we are adding a delete button to it (the 5th one)
	for (let currentRow = 0; currentRow < maxRows && choices.length; ++currentRow) {
		const options: SelectMenuComponentOptionData[] = [];

		for (let i = 0; i < emojis.length; ++i)
			if (choices[0] !== undefined) {
				const choice = choices.shift();
				choice.emoji = emojis[i % emojis.length];
				options.push(choice);
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
		.setDescription("If you can't find what you're looking for, please be more specific!");

	await interaction
		.editReply({ embeds: [embed], components })
		.then((message: Message) => message.deleteButton());
}

/**
 * Construct choice embed when there's multiple textures to pick from
 * @author Juknum
 * @param interaction interaction to reply to
 * @param menuID which id the result gets sent to
 * @param results textures to embed
 * @param values extra info to send to the menuID
 */
export async function textureChoiceEmbed(
	interaction: AnyInteraction,
	menuID: string,
	results: Texture[],
	...values: string[]
) {
	const mappedResults: SelectMenuComponentOptionData[] = [];
	for (const result of results) {
		mappedResults.push({
			label: `[#${result.id}] (${result.paths[0].versions.sort(minecraftSorter).at(-1)}) ${
				result.name
			}`,
			description: result.paths[0].name,
			value: `${result.id}__${values.join("__")}`,
		});
	}

	return generalChoiceEmbed(interaction, menuID, mappedResults);
}

/**
 * Convert interaction from choice embed into chosen option
 * @author Evorp
 * @param interaction interaction to unencode
 * @returns chosen value (texture choice embeds always have the texture ID first)
 */
export const unencodeChoice = (interaction: StringSelectMenuInteraction) =>
	interaction.values[0].split("__");
