import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "discord.js";
import { ChatInputCommandInteraction, EmbedBuilder, Message } from "@client";
import * as Random from "@helpers/random";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("kill")
		.setDescription("Kill someone you tag, be careful with weapons!")
		.addUserOption((user) => user.setName("user").setDescription("User to be killed."))
		.addStringOption((string) =>
			string.setName("weapon").setDescription("Weapon to kill the user with."),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		let embed = new EmbedBuilder();

		const killed = interaction.strings().Command.Kill.Killed;
		const killed_by = interaction.strings().Command.Kill.KilledBy;
		const killed_by_using = interaction.strings().Command.Kill.KilledByUsing;

		if (interaction.options.getUser("user") !== null) {
			if (interaction.options.getString("weapon") !== null)
				embed.setDescription(
					Random.choice(killed_by_using)
						.replace("%AUTHOR%", interaction.member.user.username)
						.replace("%PLAYER%", interaction.options.getUser("user").username)
						.replace("%WEAPON%", interaction.options.getString("weapon")),
				);
			else
				embed.setDescription(
					Random.choice(killed_by)
						.replace("%AUTHOR%", interaction.member.user.username)
						.replace("%PLAYER%", interaction.options.getUser("user").username),
				);
		} else
			embed.setDescription(
				Random.choice(killed).replace("%AUTHOR%", interaction.member.user.username),
			);

		interaction
			.reply({ embeds: [embed], fetchReply: true })
			.then((message: Message) => message.deleteButton());
	},
};
