import { MessageEmbed, CommandInteraction, Message } from "@client";
import { MessageActionRow, MessageSelectOptionData, MessageSelectMenu } from "discord.js";
import { Textures } from "./interfaces/firestorm";
import { minecraftSorter } from "@helpers/sorter";
import settings from "@json/dynamic/settings.json";

/**
 * construct custom choice embed with any given results
 * @param interaction interaction to reply to
 * @param menuID which id the result gets sent to
 * @param choices pre-formatted choices to add in the menus
 */
export async function generalChoiceEmbed(
	interaction: CommandInteraction,
	menuID: string,
	choices: MessageSelectOptionData[],
) {
	const choicesLength = choices.length; // we're modifying choices directly so it needs to be saved first
	const components: Array<MessageActionRow> = [];
	const emojis = settings.emojis.default_select;

	// dividing into maximum of 25 choices per menu
	// 4 menus max
	const maxRows = 4; // actually 5 but - 1 because we are adding a delete button to it (the 5th one)
	for (let currentRow = 0; currentRow <= maxRows && choices.length; ++currentRow) {
		const options: Array<MessageSelectOptionData> = [];

		for (let i = 0; i < emojis.length; i++)
			if (choices[0] !== undefined) {
				let t = choices.shift();
				t.emoji = emojis[i % emojis.length];
				options.push(t);
			}

		const menu = new MessageSelectMenu()
			.setCustomId(`${menuID}_${currentRow}`)
			.setPlaceholder("Select an option!")
			.addOptions(options);

		const row = new MessageActionRow().addComponents(menu);

		components.push(row);
	}

	const embed = new MessageEmbed()
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
	interaction: CommandInteraction,
	menuID: string,
	results: Textures,
	constValue: string,
) {
	const mappedResults: MessageSelectOptionData[] = [];
	for (let result of results) {
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
