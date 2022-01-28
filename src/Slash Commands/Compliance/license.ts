import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import CommandInteraction from "@src/Client/commandInteraction";

export const command: SlashCommand = {
	permissions: undefined,
	data: new SlashCommandBuilder()
		.setName("license")
		.setDescription("Shows the license for Compliance Resources Packs."),
	execute: (interaction: CommandInteraction) => {
		interaction.reply({ content: "https://www.compliancepack.net/license" });
	},
};
