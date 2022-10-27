import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message } from "@client";

export const command: SlashCommand = {
	servers: ["faithful", "faithful_extra", "classic_faithful"],
	data: new SlashCommandBuilder()
		.setName("guidelines")
		.setDescription("Shows various Faithful texturing guidelines.")
		.addStringOption((option) =>
			option
				.setName("pack")
				.setDescription("The guidelines you want to view")
				.addChoices(
					{ name: "Faithful 32x", value: "faithful_32x" },
					{ name: "Classic Faithful 32x", value: "classic_faithful_32x" },
				)
				.setRequired(true),
		),
	execute: async (interaction: CommandInteraction) => {
		let contents: string;
		const variable = interaction.options.getString("name", false)
		if (variable === "faithful_32x") {
			contents = "https://docs.faithfulpack.net/pages/textures/texturing-guidelines";
		}
		else if (variable === "classic_faithful_32x") {
			contents = "https://docs.faithfulpack.net/pages/classicfaithful/32x-texturing-guidelines";
		};
		interaction.reply({ content: contents, fetchReply: true }).then((message: Message) => message.deleteButton());
	},
};
