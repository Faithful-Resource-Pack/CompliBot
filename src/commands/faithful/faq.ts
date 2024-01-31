import { SlashCommand } from "@interfaces/interactions";
import { SlashCommandBuilder } from "discord.js";
import { Message, EmbedBuilder } from "@client";
import { colors } from "@utility/colors";
import faqStrings from "@json/faq.json";
import axios from "axios";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("faq")
		.setDescription("Show a specific FAQ entry.")
		.addStringOption((option) =>
			option.setName("keyword").setDescription("The specific FAQ entry to view.").setRequired(true),
		),
	async execute(interaction) {
		const choice = interaction.options.getString("keyword", true).toLocaleLowerCase().trim();

		if (choice == "all") {
			if (!interaction.hasPermission("manager")) return;

			await interaction.complete();

			let embedArray: EmbedBuilder[] = [];
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

		const faqChoice = faqStrings.find((faq) => faq.keywords.includes(choice));

		if (!faqChoice)
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle(interaction.strings().command.faq.invalid_choice.title)
						.setDescription(
							interaction
								.strings()
								.command.faq.invalid_choice.description.replace("%CHOICE%", choice),
						)
						.setColor(colors.red),
				],
				ephemeral: true,
			});

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
