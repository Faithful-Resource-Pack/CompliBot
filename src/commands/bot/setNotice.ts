import { notice, SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Client } from "@client";
import { setData } from "@functions/setDataToJSON";
import path from "path";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("setnotice")
		.setDescription("Set the bots notice")
		.addStringOption((option) =>
			option.setName("title").setDescription("Title of the new notice").setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("description")
				.setDescription("Description of the new notice")
				.setRequired(true),
		),
	execute: async (interaction: CommandInteraction, client: Client) => {
		if (
			await interaction.perms({
				type: "dev",
			})
		)
			return;

		const newNotice: notice = {
			unix: +Date.now(),
			title: interaction.options.getString("title"),
			description: interaction.options.getString("description").split("\n"), // TODO: make this a multiline input when it is released!
		};
		setData({
			data: newNotice,
			filename: "notice.json",
			relative_path: path.join(__dirname + "../../../../json/"),
		});
		interaction.reply({
			content: `Notice set as:\n\`\`\`json\n${JSON.stringify(newNotice)}\`\`\``,
			ephemeral: true,
		});
	},
};
