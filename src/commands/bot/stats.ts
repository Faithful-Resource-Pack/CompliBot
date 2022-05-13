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
				.setDescription("Returns top 10 most used commands.")
				.addStringOption((option) =>
					option.setName("command").setDescription("Returns usage for a specific command.").setRequired(false),
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

			const FieldTitles = (await interaction.getEphemeralString({ string: "Command.Stats.Embed.FieldTitles" })).split(
				"$,",
			);

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
					{ name: FieldTitles[6], value: `${client.slashCommands.size}`, inline: true },
					{ name: FieldTitles[7], value: `${number}`, inline: true },
					{ name: FieldTitles[8], value: `${sumMembers}`, inline: true },
					{ name: FieldTitles[9], value: version },
				)
				.setFooter({
					text: await interaction.getEphemeralString({ string: "Command.Stats.Footer" }),
					iconURL: "https://cdn.discordapp.com/emojis/799357507126427699",
				});
			interaction.reply({ embeds: [embed], fetchReply: true }).then((message: Message) => message.deleteButton());
		})
		.set("command", async (interaction: CommandInteraction, client: Client) => {
			//if the command ars is provided and the command does not exist in commandsProcessed:
			if (
				interaction.options.getString("command") &&
				client.commandsProcessed.get(interaction.options.getString("command")) === undefined
			)
				return interaction.reply({
					ephemeral: true,
					content: await interaction.getEphemeralString({
						string: "Command.Stats.NotFound",
						placeholders: {
							COMMAND: interaction.options.getString("command"),
						},
					}),
				});

			if (interaction.options.getString("command")) {
				const embed = new MessageEmbed().setTimestamp().setTitle(
					await interaction.getEphemeralString({
						string: "Command.Stats.Usage",
						placeholders: {
							COMMAND: interaction.options.getString("command"),
							USE: client.commandsProcessed.get(interaction.options.getString("command")).toString() ?? "0",
						},
					}),
				);
				interaction.reply({ ephemeral: true, embeds: [embed], fetchReply: true });
			} else {
				//sorts commands by usage: 4,3,2,1
				const sorted = new Map([...client.commandsProcessed.entries()].sort((a, b) => b[1] - a[1]));
				const data = [[...sorted.keys()], [...sorted.values()]];

				const embed = new MessageEmbed()
					.setTimestamp()
					.setTitle(await interaction.getEphemeralString({ string: "Command.Stats.Top10" })).setDescription(`
${data[0]
	.slice(0, data[0].length > 10 ? 10 : data[0].length)
	.map((key: any, index: any) => {
		let place = `\`${index + 1 < 10 ? ` ${index + 1}` : index + 1}.`;
		place += ` `.repeat(4 - place.length);
		place += "`";
		let command = `\`${key}`;
		command += ` `.repeat(13 - command.length);
		command += "`";
		let uses = `\`${data[1][index]}`;
		uses += "`";

		return `${place} ${command} - ${uses}`;
	})
	.join("\n")}`);

				interaction.reply({ ephemeral: true, embeds: [embed] });
			}
		}),
};
