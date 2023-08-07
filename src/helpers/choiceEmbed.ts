import { MessageEmbed, CommandInteraction, Message } from "@client";
import { MessageActionRow, MessageSelectOptionData, MessageSelectMenu } from "discord.js";
import { Textures } from "./interfaces/firestorm";
import { minecraftSorter } from "@helpers/sorter";

/**
 * construct custom choice embed with any given results
 * @param interaction interaction to reply to
 * @param menuID which id the result gets sent to
 * @param results pre-formatted results to add in the menus
 */
export async function generalChoiceEmbed(
	interaction: CommandInteraction,
	menuID: string,
	results: MessageSelectOptionData[],
) {
	const resultLength = results.length; // we're modifying results directly so it needs to be saved first
	const maxRows = 4; // actually 5 but - 1 because we are adding a delete button to it (the 5th one)
	const components: Array<MessageActionRow> = [];
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
	let currentRow = 0;
	do {
		const options: Array<MessageSelectOptionData> = [];

		for (let i = 0; i < 25; i++)
			if (results[0] !== undefined) {
				let t = results.shift();
				t.emoji = emojis[i % emojis.length];
				options.push(t);
			}

		const menu = new MessageSelectMenu()
			.setCustomId(`${menuID}_${currentRow}`)
			.setPlaceholder("Select an option!")
			.addOptions(options);

		const row = new MessageActionRow().addComponents(menu);

		components.push(row);
	} while (results.length !== 0 && currentRow++ < maxRows);

	const embed = new MessageEmbed()
		.setTitle(`${resultLength} results found`)
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
 * @param constValue extra info to send to the menuID
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
