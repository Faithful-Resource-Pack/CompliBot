import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message, MessageEmbed, Client } from "@client";
import { colors } from "@helpers/colors";
import axios from "axios";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("faq")
		.setDescription("Show a specific FAQ entry.")
		.addStringOption((option) =>
			option.setName("keyword").setDescription("The specific FAQ entry to view.").setRequired(true),
		),
	execute: async (interaction: CommandInteraction) => {
		const choice = interaction.options.getString("keyword", true);
		const faqStrings = (
			await axios.get(
				`https://raw.githubusercontent.com/Faithful-Resource-Pack/Discord-Bot/javascript/resources/strings.json`,
			)
		).data.faq;

		let faqChoice: any;
		for (let faq of faqStrings) {
			if (faq.keywords.includes(choice)) {
				faqChoice = faq;
				break;
			}
		}

		if (!faqChoice) {
			const errorEmbed = new MessageEmbed()
				.setTitle("Invalid choice!")
				.setDescription(`\`${choice}\` is not a valid FAQ keyword! Have you made a typo?`)
				.setColor(colors.red);

			await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
			return;
		}

		const faqEmbed = new MessageEmbed()
			.setTitle(faqChoice.question)
			.setDescription(faqChoice.answer)
			.setThumbnail(`${(interaction.client as Client).config.images}bot/question_mark.png`)
			.setFooter({ text: `Keywords: ${faqChoice.keywords.join(" • ")}` });

		interaction
			.reply({ embeds: [faqEmbed], fetchReply: true })
			.then((message: Message) => message.deleteButton());
	},
};
