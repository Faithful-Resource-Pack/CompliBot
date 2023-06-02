import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message, MessageEmbed } from "@client";
import guidelineJSON from "@json/guidelines.json";
import { colors } from "@helpers/colors";

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
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("choice")
				.setDescription("A specific part of the guidelines you want to link to")
				.setRequired(false)
		),
	execute: async (interaction: CommandInteraction) => {
		let contents: string;
		const pack = interaction.options.getString("pack");
		const choice = interaction.options.getString("choice");
		const errorEmbed = new MessageEmbed()
			.setTitle("Invalid choice!")
			.setDescription(`\`${choice}\` is not a valid choice.`)
			.setColor(colors.red);

		switch (pack) {
			case "faithful_32x":
				contents = "https://docs.faithfulpack.net/pages/textures/texturing-guidelines";
				break;
			case "classic_faithful_32x":
				contents = "https://docs.faithfulpack.net/pages/classicfaithful/32x-texturing-guidelines";
				break;
		}

		if (choice) { // if someone just called the entire guidelines
			if (!guidelineJSON.choices.map(i => i.names).flat().includes(choice)) {
				contents = ""
				interaction.reply({ embeds: [errorEmbed], ephemeral: true })
				return;
			}

			for (let i of guidelineJSON.choices) {
				if (!i.names.includes(choice)) continue;
				if (!i[pack]) {
					interaction.reply({ embeds: [errorEmbed], ephemeral: true })
				}
				contents += `#${i[pack]}`;
				break;
			}
		}
		interaction.reply({ content: contents, fetchReply: true })
			.then((message: Message) => message.deleteButton());
	},
};
