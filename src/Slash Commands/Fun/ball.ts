import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import MessageEmbed from "@src/Client/embed";
import Client from "@src/Client";
import { string } from "@functions/string";

export const command: SlashCommand = {
	permissions: undefined,
	data: new SlashCommandBuilder()
		.setName("ball")
		.setDescription("Asks a question to the 8-ball.")
		.addStringOption((option: SlashCommandStringOption) =>
			option.setName("question").setDescription("The question to ask to the 8-ball.").setRequired(true),
		),
	execute: async (interaction: CommandInteraction) => {
		const answers = await (await string(interaction.locale, "Command.EightBall.Answers")).split("$");

		let embed = new MessageEmbed()
			.setTitle(`${interaction.options.getString("question", true)}`.slice(0, 255))
			.setDescription(answers[Math.floor(Math.random() * answers.length)]);

		interaction.reply({ embeds: [embed] });
	},
};
