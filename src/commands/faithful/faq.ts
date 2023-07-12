import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message, MessageEmbed, Client } from "@client";
import { colors } from "@helpers/colors";
import faqStrings from "@json/faq.json";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("faq")
		.setDescription("Show a specific FAQ entry.")
		.addStringOption((option) =>
			option.setName("keyword").setDescription("The specific FAQ entry to view.").setRequired(true),
		),
	execute: async (interaction: CommandInteraction) => {
		const choice = interaction.options.getString("keyword", true).toLocaleLowerCase().trim();

		console.log(choice);
		if (choice == "all") {
			if (
				await interaction.perms({
					type: "manager",
				})
			)
				return;

			interaction.reply({ content: "** **", ephemeral: true });

			let embedArray = [];
			let i = 0;

			for (let faq of faqStrings) {
				embedArray.push(
					new MessageEmbed()
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
