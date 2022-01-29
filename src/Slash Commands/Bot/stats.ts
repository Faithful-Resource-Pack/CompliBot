import { SlashCommand, SlashCommandI } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Collection, CommandInteraction, Guild, version as djsVersion } from "discord.js";
import MessageEmbed from "@src/Client/embed";
import Client from "@src/Client";
import { getUsage, total } from "@src/Functions/commandProcess";
import os from "os";
import { duration } from "moment";
import { string } from "@src/Helpers/string";

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

			/**
			 * @author nick
			 * i know what it does, its a stupid regex.
			 *
			 * \d+ (any digit repeated any ammount of times)
			 * ^ (start of string)
			 * \. (period)
			 *
			 * if the platform is linux and the release starts with \d+.\d+ (e.g 69.420)
			 * then use replace it and everything following it with '$1' (i.e fist capture group (which is the version thing) )
			 *
			 * example:
			 *  1.0.0-beta trolling version => 1.0
			 */

			if (os.platform() === "linux") version = "Linux" + os.release().replace(/^(\d+\.\d+).*/, "$1");
			else version = os.version();

			const FieldTitles = (await interaction.text("Command.Stats.Embed.FieldTitles")).split("$");

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
					text: await interaction.text({ string: "Command.Stats.Footer"}),
					iconURL: "https://static.wikia.nocookie.net/minecraft_gamepedia/images/0/06/Heart_(icon).png",
				});
			interaction.reply({ embeds: [embed] });
		})
		.set("command", async (interaction: CommandInteraction, client: Client) => {
			const embed = new MessageEmbed().setTitle(
				await interaction.text({ string: "Command.Stats.Usage", placeholders: {
					COMMAND: interaction.options.getString("command", true),
					USE: getUsage(interaction.options.getString("command", true)).toString() ?? "0",
				}}),
			);
			interaction.reply({ embeds: [embed] });
		}),
};
