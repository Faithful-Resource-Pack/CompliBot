import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { ids, parseId } from "@helpers/emojis";
import { Client, EmbedBuilder, Message, ChatInputCommandInteraction } from "@client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("feedback")
		.setDescription("Submits bot feedback to the developers.")
		.addStringOption((option) =>
			option.setName("message").setDescription("The message you wish to send").setRequired(true),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const embedPreview = new EmbedBuilder()
			.setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
			.setTitle(interaction.strings().Command.Feedback.Preview)
			.setDescription(interaction.options.getString("message"))
			.setTimestamp()
			.setFooter({
				text: interaction.strings().Command.Feedback.ConfirmPrompt,
			});

		const btnBug = new ButtonBuilder()
			.setLabel(interaction.strings().Command.Feedback.Bug)
			.setStyle(ButtonStyle.Primary)
			.setEmoji(parseId(ids.bug))
			.setCustomId("feedbackBug");

		const btnSuggestion = new ButtonBuilder()
			.setLabel(interaction.strings().Command.Feedback.Suggestion)
			.setStyle(ButtonStyle.Primary)
			.setEmoji(parseId(ids.suggestion))
			.setCustomId("feedbackSuggestion");

		const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(btnBug, btnSuggestion);

		return interaction
			.reply({
				components: [buttons],
				embeds: [embedPreview],
				fetchReply: true,
			})
			.then((message: Message) => message.deleteButton());
	},
};
