import { duration } from "moment";
import { SlashCommand, SlashCommandI } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Collection, Guild, version as djsVersion } from "discord.js";
import { getUsage, total } from "@src/Functions/commandProcess";
import { CommandInteraction } from "@src/Client/interaction";
import MessageEmbed from "@src/Client/embed";
import Message from "@src/Client/message";
import Client from "@src/Client";
import os from "os";
import linuxOs from "linux-os-info";

export const command: SlashCommand = {
	permissions: undefined,
	data: new SlashCommandBuilder()
		.setName("stats")
		.setDescription("Gets statistics about the bot or commands!")
		.addSubcommand((subcommand) => subcommand.setName("bot").setDescription("Statistics about the bot!"))
		.addSubcommand((subcommand) =>
			subcommand
				.setName("command")
				.setDescription("Statistics about commands!")
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

			const number = total() + 1;

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
					{ name: FieldTitles[6], value: "" + client.commands.size, inline: true },
					{ name: FieldTitles[7], value: "" + number, inline: true },
					{ name: FieldTitles[8], value: "" + sumMembers, inline: true },
					{ name: FieldTitles[9], value: version },
				)
				.setFooter({
					text: await interaction.text({ string: "Command.Stats.Footer" }),
					iconURL: "https://static.wikia.nocookie.net/minecraft_gamepedia/images/0/06/Heart_(icon).png",
				});
			interaction.reply({ embeds: [embed] });
			const message: Message = (await interaction.fetchReply()) as Message;
			message.deleteReact({ authorMessage: message, authorID: interaction.user.id, deleteAuthorMessage: false });
		})
		.set("command", async (interaction: CommandInteraction, client: Client) => {
			const embed = new MessageEmbed().setTitle(
				await interaction.text({
					string: "Command.Stats.Usage",
					placeholders: {
						COMMAND: interaction.options.getString("command", true),
						USE: getUsage(interaction.options.getString("command", true)).toString() ?? "0",
					},
				}),
			);
			interaction.reply({ embeds: [embed] });
			const message: Message = (await interaction.fetchReply()) as Message;
			message.deleteReact({ authorMessage: message, authorID: interaction.user.id, deleteAuthorMessage: false });
		}),
};
