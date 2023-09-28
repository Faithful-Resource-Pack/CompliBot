import { SlashCommand } from "@interfaces";
import {
	ActionRowBuilder,
	SlashCommandBuilder,
	TextInputBuilder,
	TextInputStyle,
	ModalBuilder,
} from "discord.js";
import { ChatInputCommandInteraction } from "@client";

// I'm sorry...
const feedbackFormat = {
	bug: [
		new TextInputBuilder()
			.setCustomId("bugTitle")
			.setStyle(TextInputStyle.Short)
			.setLabel("Title")
			.setPlaceholder("Create a title for the ticket"),
		new TextInputBuilder()
			.setCustomId("bugWhatHappened")
			.setStyle(TextInputStyle.Paragraph)
			.setLabel("What happened? What did you expect to happen?"),
		new TextInputBuilder()
			.setCustomId("bugToReproduce")
			.setStyle(TextInputStyle.Paragraph)
			.setLabel("Steps to reproduce the behavior")
			.setPlaceholder("1. Type this\n2. Click that\n3. Bot errors"),
		new TextInputBuilder()
			.setCustomId("bugNotes")
			.setStyle(TextInputStyle.Short)
			.setLabel("Additional Notes")
			.setRequired(false),
	],
	suggestion: [
		new TextInputBuilder()
			.setCustomId("suggestionTitle")
			.setStyle(TextInputStyle.Short)
			.setLabel("Title")
			.setPlaceholder("Create a title for the ticket"),
		new TextInputBuilder()
			.setCustomId("suggestionIsProblem")
			.setStyle(TextInputStyle.Paragraph)
			.setLabel("Is your feature request related to a problem?")
			.setRequired(false),
		new TextInputBuilder()
			.setCustomId("suggestionDescription")
			.setStyle(TextInputStyle.Paragraph)
			.setLabel("Describe the feature you'd like"),
		new TextInputBuilder()
			.setCustomId("suggestionNotes")
			.setStyle(TextInputStyle.Short)
			.setLabel("Additional Notes")
			.setRequired(false),
	],
};

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("feedback")
		.setDescription("Submits bot feedback to the developers.")
		.addStringOption((option) =>
			option
				.setName("type")
				.setDescription("What type of request to create")
				.addChoices(
					{ name: "Bug Report", value: "bug" },
					{ name: "Feature Request", value: "suggestion" },
				)
				.setRequired(true),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const type = interaction.options.getString("type");
		const modal = new ModalBuilder().setCustomId(`${type}Ticket`).setTitle(`New ${type} Issue`);

		modal.addComponents(
			// every modal input needs to be in a new action row (blame djs)
			...feedbackFormat[type].map((textInput: TextInputBuilder) =>
				new ActionRowBuilder<TextInputBuilder>().addComponents(textInput),
			),
		);

		await interaction.showModal(modal);
	},
};
