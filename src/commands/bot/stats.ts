import { duration } from "moment";
import { SlashCommand, SlashCommandI } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Collection, Guild, version as djsVersion } from "discord.js";
import { Client, MessageEmbed, CommandInteraction, Message } from "@client";
import os from "os";
import linuxOs from "linux-os-info";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("stats")
		.setDescription("Gets statistics about the bot or commands.")
		.addSubcommand((subcommand) => subcommand.setName("bot").setDescription("Statistics about the bot."))
		.addSubcommand((subcommand) =>
			subcommand
				.setName("command")
				.setDescription("Statistics about commands.")
				.addStringOption((option) =>
					option.setName("command").setDescription("A command from the bot.").setRequired(true),
				),
		),
	execute: new Collection<string, SlashCommandI>()
		.set("bot", async (interaction: CommandInteraction, client: Client) => {
			let sumMembers = 0;
			let version;

			client.guilds.cache.each((guild: Guild) => {
				sumMembers += guild.memberCount;
			});

			const number = [...client.commandsProcessed.values()].reduce((a, b) => a + b, 0) + 1;

			if (os.platform() == "linux") version = linuxOs({ mode: "sync" }).pretty_name;
			else version = os.version();

			const FieldTitles = (await interaction.text({ string: "Command.Stats.Embed.FieldTitles" })).split("$,");

			const embed = new MessageEmbed()
				.setTitle(`${client.user.username} Stats`)
				.setThumbnail(client.user.displayAvatarURL())
				.addFields(
					{ name: FieldTitles[0], value: client.tokens.prefix, inline: true },
					{ name: FieldTitles[1], value: duration(client.uptime).humanize(), inline: true },
					{ name: FieldTitles[2], value: client.guilds.cache.size.toString(), inline: true },
					{
						name: FieldTitles[3],
						value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
						inline: true,
					},
					{ name: FieldTitles[4], value: `discord.js ${djsVersion}`, inline: true },
					{ name: FieldTitles[5], value: `${process.version}`, inline: true },
					{ name: FieldTitles[6], value: "" + (client.commands.size + client.slashCommands.size), inline: true },
					{ name: FieldTitles[7], value: "" + number, inline: true },
					{ name: FieldTitles[8], value: "" + sumMembers, inline: true },
					{ name: FieldTitles[9], value: version },
				)
				.setFooter({
					text: await interaction.text({ string: "Command.Stats.Footer" }),
					iconURL: "https://cdn.discordapp.com/emojis/799357507126427699",
				});
			interaction.reply({ embeds: [embed], fetchReply: true }).then((message: Message) => message.deleteButton());
		})
		.set("command", async (interaction: CommandInteraction, client: Client) => {
			if (client.commandsProcessed.get(interaction.options.getString("command", true)) === undefined)
				return interaction.reply({
					ephemeral: true,
					content: await interaction.text({
						string: "Command.Stats.NotFound",
					}),
				});

			const embed = new MessageEmbed().setTitle(
				await interaction.text({
					string: "Command.Stats.Usage",
					placeholders: {
						COMMAND: interaction.options.getString("command", true),
						USE: client.commandsProcessed.get(interaction.options.getString("command", true)).toString() ?? "0",
					},
				}),
			);
			interaction.reply({ embeds: [embed], fetchReply: true }).then((message: Message) => message.deleteButton());
		}),
};
