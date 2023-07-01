import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message, MessageEmbed } from "@client";
import guidelineJSON from "@json/guidelines.json";
import { colors } from "@helpers/colors";

export const command: SlashCommand = {
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
		)
		.addStringOption((option) =>
			option
				.setName("choice")
				.setDescription("A specific part of the guidelines you want to link to")
				.setRequired(false),
		),
	execute: async (interaction: CommandInteraction) => {
		let contents: string;
		let choice = interaction.options.getString("choice");
		const pack = interaction.options.getString("pack");
		const errorEmbed = new MessageEmbed()
			.setTitle("Invalid choice!")
			.setDescription(
				`\`${choice}\` is not a valid choice for pack \`${pack}\`. Have you chosen the wrong pack or made a typo?`,
			)
			.setColor(colors.red);

		switch (pack) {
			case "faithful_32x":
				contents = "https://docs.faithfulpack.net/pages/textures/texturing-guidelines";
				break;
			case "classic_faithful_32x":
				contents = "https://docs.faithfulpack.net/pages/classicfaithful/32x-texturing-guidelines";
				break;
		}

		if (choice) {
			choice = choice.toLowerCase(); // remove case sensitivity for easier parsing
			if (
				!guidelineJSON.choices
					.map((i) => i.keywords)
					.flat()
					.includes(choice)
			) {
				// if it's not present anywhere escape early
				interaction.reply({ embeds: [errorEmbed], ephemeral: true });
				return;
			}

			for (let i of guidelineJSON.choices) {
				if (!i.keywords.includes(choice)) continue;
				if (!i[pack]) {
					// if you pick an option that isn't present in the pack you selected
					interaction.reply({ embeds: [errorEmbed], ephemeral: true });
					return;
				}
				contents += `#${i[pack]}`; // adds the html id specified in the json
				break;
			}
		}
		interaction
			.reply({ content: contents, fetchReply: true })
			.then((message: Message) => message.deleteButton());
	},
};
