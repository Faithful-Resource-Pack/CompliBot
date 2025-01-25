import type { SlashCommand, SlashCommandExecute } from "@interfaces/interactions";
import { SlashCommandBuilder, Collection, version as djsVersion, MessageFlags } from "discord.js";
import { EmbedBuilder, Message } from "@client";
import axios from "axios";
import { colors } from "@utility/colors";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("stats")
		.setDescription("Gets statistics about the bot or commands.")
		.addSubcommand((subcommand) =>
			subcommand.setName("bot").setDescription("Statistics about the bot."),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("command")
				.setDescription("Returns top 10 most used commands.")
				.addStringOption((option) =>
					option
						.setName("command")
						.setDescription("Returns usage for a specific command.")
						.setRequired(false),
				),
		),
	execute: new Collection<string, SlashCommandExecute>()
		.set("bot", async (interaction) => {
			// easier to get extended properties
			const { client } = interaction;
			const memberCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

			const commandCount =
				Array.from(client.commandsProcessed.values()).reduce((acc, cur) => acc + cur, 0) + 1;
			const heart: string = (await axios.get(`${client.tokens.apiUrl}settings/images.heart`)).data;

			const embed = new EmbedBuilder()
				.setTitle(`${client.user.username}'s Statistics`)
				.setThumbnail(client.user.displayAvatarURL())
				.addFields(
					{ name: "Prefix", value: interaction.client.tokens.prefix, inline: true },
					{
						name: "Uptime",
						value: `<t:${Math.round((new Date().getTime() - client.uptime) / 1000)}:R>`,
						inline: true,
					},
					{ name: "Server Count", value: client.guilds.cache.size.toString(), inline: true },
					{
						name: "Memory Usage",
						value: `${(process.memoryUsage().heapUsed / 1048576).toFixed(2)} MB`,
						inline: true,
					},
					{ name: "Discord Library", value: `Discord.js ${djsVersion}`, inline: true },
					{ name: "Node.js", value: `${process.version}`, inline: true },
					{ name: "Total Commands", value: `${client.commands.size}`, inline: true },
					{ name: "Commands Processed", value: `${commandCount}`, inline: true },
					{ name: "Members Across Servers", value: `${memberCount}`, inline: true },
				)
				.setFooter({
					text: "Made with love",
					iconURL: heart,
				});
			interaction
				.reply({ embeds: [embed], withResponse: true })
				.then(({ resource }) => resource.message.deleteButton());
		})
		.set("command", async (interaction) => {
			const command = interaction.options.getString("command");
			if (command) {
				// command doesn't exist
				if (interaction.client.commandsProcessed.get(command) === undefined)
					return interaction.reply({
						flags: MessageFlags.Ephemeral,
						embeds: [
							new EmbedBuilder()
								.setTitle(interaction.strings().error.generic)
								.setDescription(
									interaction.strings().command.stats.not_found.replace("%COMMAND%", command),
								)
								.setColor(colors.red),
						],
					});

				return interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle(
								interaction
									.strings()
									.command.stats.usage.replace("%COMMAND%", command)
									.replace(
										"%USE%",
										interaction.client.commandsProcessed.get(command).toString() ?? "0",
									),
							)
							.setTimestamp(),
					],
					flags: MessageFlags.Ephemeral,
				});
			}

			//sorts commands by usage: [4, 3, 2, 1]
			const data = Array.from(interaction.client.commandsProcessed.entries()).sort(
				(a, b) => b[1] - a[1],
			);

			interaction.reply({
				flags: MessageFlags.Ephemeral,
				embeds: [
					new EmbedBuilder()
						.setTimestamp()
						.setTitle(interaction.strings().command.stats.top_ten)
						.setDescription(
							data
								.slice(0, data.length > 10 ? 10 : data.length)
								.map(([key, value], i) => {
									let index = `\`${i + 1}.`;
									index += " ".repeat(Math.max(0, 4 - index.length)) + "`";
									let command = `\`${key}`;
									command += " ".repeat(Math.max(0, 13 - command.length)) + "`";
									const count = `\`${value}\``;
									return `${index} ${command} – ${count}`;
								})
								.join("\n"),
						),
				],
			});
		}),
};
