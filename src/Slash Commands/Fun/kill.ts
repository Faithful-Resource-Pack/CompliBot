import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import MessageEmbed from "@src/Client/embed";
import Client from "@src/Client";
import { string } from "@functions/string";

export const command: SlashCommand = {
	permissions: undefined,
	data: new SlashCommandBuilder()
		.setName("kill")
		.setDescription("Kill someone you tag, be carefull with weapons!")
		.addUserOption((user) => user.setName("user").setDescription("User to be killed."))
		.addStringOption((string) => string.setName("weapon").setDescription("Weapon to kill the user with.")),
	execute: async (interaction: CommandInteraction) => {
		let embed = new MessageEmbed();

		const killed = (await string(interaction.locale, "Command.Kill.Killed", { DONT_REPORT_MISSING: "True" })).split(
			"$",
		);
		const killed_by = (
			await string(interaction.locale, "Command.Kill.KilledBy", { DONT_REPORT_MISSING: "True" })
		).split("$");
		const killed_by_using = (
			await string(interaction.locale, "Command.Kill.KilledByUsing", { DONT_REPORT_MISSING: "True" })
		).split("$");

		if (interaction.options.getUser("user") !== null) {
			if (interaction.options.getString("weapon") !== null)
				embed.setDescription(
					killed_by_using[Math.floor(Math.random() * killed_by_using.length)]
						.replace("%AUTHOR%", interaction.member.user.username)
						.replace("%PLAYER%", interaction.options.getUser("user").username)
						.replace("%WEAPON%", interaction.options.getString("weapon")),
				);
			else
				embed.setDescription(
					killed_by[Math.floor(Math.random() * killed_by.length)]
						.replace("%AUTHOR%", interaction.member.user.username)
						.replace("%PLAYER%", interaction.options.getUser("user").username),
				);
		} else
			embed.setDescription(
				killed[Math.floor(Math.random() * killed.length)].replace("%AUTHOR%", interaction.member.user.username),
			);

		interaction.reply({ embeds: [embed] });
	},
};
