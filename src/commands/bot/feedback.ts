import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageButton } from "discord.js";
import { ids, parseId } from "@helpers/emojis";
import { Client, MessageEmbed, Message, CommandInteraction } from "@client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("feedback")
		.setDescription("Submits bot feedback to the developers.")
		.addStringOption((option) =>
			option.setName("message").setDescription("The message you wish to send").setRequired(true),
		),
	execute: async (interaction: CommandInteraction, client: Client) => {
		const embedPreview = new MessageEmbed()
			.setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
			.setTitle(await interaction.getEphemeralString({ string: "Command.Feedback.Preview" }))
			.setDescription(interaction.options.getString("message"))
			.setTimestamp()
			.setFooter({
				text: await interaction.getEphemeralString({ string: "Command.Feedback.ConfirmPrompt" }),
			});

		const btnBug = new MessageButton()
			.setLabel(await interaction.getEphemeralString({ string: "Command.Feedback.Bug" }))
			.setStyle("PRIMARY")
			.setEmoji(parseId(ids.bug))
			.setCustomId("feedbackBug");

		const btnSuggestion = new MessageButton()
			.setLabel(await interaction.getEphemeralString({ string: "Command.Feedback.Suggestion" }))
			.setStyle("PRIMARY")
			.setEmoji(parseId(ids.suggestion))
			.setCustomId("feedbackSuggestion");

		const buttons = new MessageActionRow().addComponents([btnBug, btnSuggestion]);

		return interaction
			.reply({
				components: [buttons],
				embeds: [embedPreview],
				fetchReply: true,
			})
			.then((message: Message) => message.deleteButton());
	},
};
