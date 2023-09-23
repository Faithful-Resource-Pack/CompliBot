import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	MessageActionRowComponentBuilder,
} from "discord.js";
import { ids, parseId } from "@helpers/emojis";
import { Client, EmbedBuilder, Message, ChatInputCommandInteraction } from "@client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("feedback")
		.setDescription("Submits bot feedback to the developers.")
		.addStringOption((option) =>
			option.setName("message").setDescription("The message you wish to send").setRequired(true),
		),
	execute: async (interaction: ChatInputCommandInteraction, client: Client) => {
		const embedPreview = new EmbedBuilder()
			.setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
			.setTitle(await interaction.getEphemeralString({ string: "Command.Feedback.Preview" }))
			.setDescription(interaction.options.getString("message"))
			.setTimestamp()
			.setFooter({
				text: await interaction.getEphemeralString({ string: "Command.Feedback.ConfirmPrompt" }),
			});

		const btnBug = new ButtonBuilder()
			.setLabel(await interaction.getEphemeralString({ string: "Command.Feedback.Bug" }))
			.setStyle(ButtonStyle.Primary)
			.setEmoji(parseId(ids.bug))
			.setCustomId("feedbackBug");

		const btnSuggestion = new ButtonBuilder()
			.setLabel(await interaction.getEphemeralString({ string: "Command.Feedback.Suggestion" }))
			.setStyle(ButtonStyle.Primary)
			.setEmoji(parseId(ids.suggestion))
			.setCustomId("feedbackSuggestion");

		const buttons = new ActionRowBuilder().addComponents(btnBug, btnSuggestion);

		return interaction
			.reply({
				components: [buttons as ActionRowBuilder<MessageActionRowComponentBuilder>],
				embeds: [embedPreview],
				fetchReply: true,
			})
			.then((message: Message) => message.deleteButton());
	},
};
