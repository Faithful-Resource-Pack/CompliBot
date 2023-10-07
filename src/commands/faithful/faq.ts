import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "discord.js";
import { ChatInputCommandInteraction, Message, EmbedBuilder } from "@client";
import { colors } from "@helpers/colors";
import faqStrings from "@json/faq.json";
import axios from "axios";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("faq")
		.setDescription("Show a specific FAQ entry.")
		.addStringOption((option) =>
			option.setName("keyword").setDescription("The specific FAQ entry to view.").setRequired(true),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const choice = interaction.options.getString("keyword", true).toLocaleLowerCase().trim();

		if (choice == "all") {
			if (!interaction.hasPermission("manager")) return;

			interaction
				.reply({ content: "** **", fetchReply: true })
				.then((message: Message) => message.delete());

			let embedArray = [];
			let i = 0;

			for (const faq of faqStrings) {
				embedArray.push(
					new EmbedBuilder()
						.setTitle(faq.question)
						.setDescription(faq.answer)
						.setColor(colors.brand)
						.setFooter({ text: `Keywords: ${faq.keywords.join(" • ")}` }),
				);

				if ((i + 1) % 5 == 0) {
					// groups the embeds in batches of 5 to reduce API spam
					await interaction.channel.send({ embeds: embedArray });
					embedArray = [];
				}
				++i;
			}

			if (embedArray.length) await interaction.channel.send({ embeds: embedArray }); // sends the leftovers if exists
			return;
		}

		const faqChoice = faqStrings.filter((faq) => faq.keywords.includes(choice))?.[0];

		if (!faqChoice) {
			const errorEmbed = new EmbedBuilder()
				.setTitle("Invalid choice!")
				.setDescription(`\`${choice}\` is not a valid FAQ keyword! Have you made a typo?`)
				.setColor(colors.red);

			await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
			return;
		}

		const question: string = (
			await axios.get(`${interaction.client.tokens.apiUrl}settings/images.question`)
		).data;

		const faqEmbed = new EmbedBuilder()
			.setTitle(faqChoice.question)
			.setDescription(faqChoice.answer)
			.setThumbnail(question)
			.setFooter({ text: `Keywords: ${faqChoice.keywords.join(" • ")}` });

		interaction
			.reply({ embeds: [faqEmbed], fetchReply: true })
			.then((message: Message) => message.deleteButton());
	},
};
