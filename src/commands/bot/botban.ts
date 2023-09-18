import { Config, SlashCommand, SlashCommandI } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, MessageEmbed, CommandInteraction } from "@client";
import { Collection, MessageAttachment, TextChannel } from "discord.js";
import ConfigJson from "@json/config.json";
import { colors } from "@helpers/colors";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { PermissionFlagsBits } from "discord-api-types/v10";
const config: Config = ConfigJson;

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("botban")
		.setDescription("Manages the ban list (devs naughty list :D).")
		.addSubcommand((view) =>
			view
				.setName("view")
				.setDescription("View the ban list")
				.addStringOption((option) =>
					option
						.setName("format")
						.setDescription("The format the ban list should be displayed in.")
						.setRequired(false)
						.addChoices(
							{ name: "Json", value: "json" },
							{ name: "Embed", value: "emb" },
							{ name: "Text", value: "txt" },
							{ name: "Mentions", value: "ment" },
						),
				),
		)
		.addSubcommand((audit) =>
			audit
				.setName("audit")
				.setDescription("change the banlist")
				.addUserOption((option) =>
					option
						.setName("subject")
						.setDescription("The user to edit the permissions of.")
						.setRequired(true),
				)
				.addBooleanOption((option) =>
					option
						.setName("pardon")
						.setDescription("Whether to undo an oopsie or not.")
						.setRequired(false),
				),
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	execute: new Collection<string, SlashCommandI>()
		.set("audit", async (interaction: CommandInteraction, client: Client) => {
			if (!interaction.hasPermission("dev")) return;

			await interaction.deferReply({ ephemeral: true });
			const banlist = require("@json/botbans.json");
			// const banlist = JSON.parse(banlistJSON);
			const victimID = interaction.options.getUser("subject").id;
			if (
				victimID == client.user.id || //self
				victimID == "360249987927638016" || //Evorp
				victimID == "173336582265241601" || //TheRolf
				victimID == "473860522710794250" || //RobertR11
				victimID == "601501288978448411" //Nick.
			)
				return interaction.followUp(
					await interaction.getEphemeralString({ string: "Command.Botban.view.unbannable" }),
				);

			if (interaction.options.getBoolean("pardon")) {
				banlist.ids.filter(async (v: string) => {
					return v != victimID; //removes only the id of the victim
				});
			} else {
				banlist.ids.push(victimID);
			}
			writeFileSync(join(__dirname, "../../../json/botbans.json"), JSON.stringify(banlist));

			interaction.followUp({
				content: `Bot-${
					interaction.options.getBoolean("revoke") ? "Unbanned" : "Banned"
				} <@${victimID}>`,
				ephemeral: true,
			});
			const embed: MessageEmbed = new MessageEmbed()
				.setTitle(
					`${
						interaction.options.getBoolean("revoke") ? "Removed" : "Added"
					} <@${victimID}> to botban list`,
				)
				.setAuthor({
					name: interaction.user.username,
					iconURL: interaction.user.avatarURL({ dynamic: true }),
				})
				.setColor(colors.red)
				.addFields([
					{ name: "Server", value: `\`${interaction.guild.name}\``, inline: true },
					{ name: "Channel", value: `${interaction.channel}`, inline: true },
				])
				.setTimestamp();

			// send log into the addressed logs channel
			let logChannel: TextChannel;
			const team: string = config.discords.filter((d) => d.id === interaction.guildId)[0].team;
			try {
				if (team)
					logChannel = (await client.channels.fetch(
						config.teams.filter((t) => t.name === team)[0].channels.moderation,
					)) as any;
				else
					logChannel = (await client.channels.fetch(
						config.discords.filter((d) => d.id === interaction.guildId)[0].channels.moderation,
					)) as any;
				logChannel.send({ embeds: [embed] });
			} catch {
				return;
			} // can't fetch channel
		})
		.set("view", async (interaction: CommandInteraction, client: Client) => {
			if (!interaction.hasPermission("dev")) return;

			await interaction.deferReply({ ephemeral: true });
			const buffer = readFileSync(join(__dirname, "../../../json/botbans.json"));
			const txtBuff = Buffer.from(
				`Botbanned IDs:\n\n${JSON.parse(buffer.toString("utf-8"))["ids"].join("\n")}`,
				"utf-8",
			);

			switch (interaction.options.getString("format")) {
				case "json":
					return interaction.followUp({
						files: [new MessageAttachment(buffer, "bans.json")],
						ephemeral: true,
					});
				case "emb":
					const emb = new MessageEmbed()
						.setTitle("Botbanned IDs:")
						.setDescription(JSON.parse(buffer.toString("utf-8"))["ids"].join("\n"));
					return interaction.followUp({ embeds: [emb], ephemeral: true });
				case "ment":
					const pingEmb = new MessageEmbed()
						.setTitle("Botbanned Users:")
						.setDescription("<@" + JSON.parse(buffer.toString("utf-8"))["ids"].join(">\n<@") + ">");
					return interaction.followUp({ embeds: [pingEmb], ephemeral: true });
				case "txt":
				default:
					interaction.followUp({
						files: [new MessageAttachment(txtBuff, "bans.txt")],
						ephemeral: true,
					});
					break;
			}
		}),
};
