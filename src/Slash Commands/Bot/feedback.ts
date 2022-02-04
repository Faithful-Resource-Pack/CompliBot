import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "@src/Client/interaction";
import MessageEmbed from "@src/Client/embed";
import { MessageActionRow, MessageButton } from "discord.js";
import { ids, parseId } from "@src/Helpers/emojis";
import ExtendedClient from "@src/Client";

export const command: SlashCommand = {
	permissions: undefined,
	data: new SlashCommandBuilder()
		.setName("feedback")
		.setDescription("Submits bot feedback to the developers.")
		.addStringOption((option) =>
			option.setName("message").setDescription("The message you wish to send").setRequired(true),
		),
	execute: async (interaction: CommandInteraction, client: ExtendedClient) => {
		const embedPreview = new MessageEmbed()
			.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
			.setTitle(await interaction.text({ string: "Command.Feedback.Preview" }))
			.setDescription(interaction.options.getString("message"))
			.setTimestamp()
			.setFooter({ text: await interaction.text({ string: "Command.Feedback.ConfirmPrompt" }) });

		const btnCancel = new MessageButton()
			.setLabel(await interaction.text({ string: "General.Cancel" }))
			.setStyle("SECONDARY")
			.setEmoji(parseId(ids.delete))
			.setCustomId("feedbackCancel");

		const btnBug = new MessageButton()
			.setLabel(await interaction.text({ string: "Command.Feedback.Bug" }))
			.setStyle("DANGER")
			.setEmoji(parseId(ids.downvote))
			.setCustomId("feedbackBug");

		const btnSuggestion = new MessageButton()
			.setLabel(await interaction.text({ string: "Command.Feedback.Suggestion" }))
			.setStyle("SUCCESS")
			.setEmoji(parseId(ids.upvote))
			.setCustomId("feedbackSuggestion");

		const buttons = new MessageActionRow().addComponents([btnCancel, btnBug, btnSuggestion]);

		return interaction.reply({
			components: [buttons],
			embeds: [embedPreview],
		});
	},
};
