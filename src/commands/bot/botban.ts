import { Config, SlashCommand, SlashCommandI } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, MessageEmbed, CommandInteraction } from "@client";
import { Collection, MessageAttachment, TextChannel } from "discord.js";
import ConfigJson from "@json/config.json";
import { colors } from "@helpers/colors";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
const config: Config = ConfigJson;

export const command: SlashCommand = {
	permissions: {
		users: [
			//* idk who this should be available to since i dont think mods should ban across servers
			"207471947662098432", // Juknum
			"173336582265241601", // TheRolf
			"473860522710794250", // RobertR11
			"601501288978448411", // Nick
		],
	},
	data: new SlashCommandBuilder()
		.setName("botban")
		.setDescription("Manages the banlist *(devs naughty list :D).")
		.setDefaultPermission(false)
		.addSubcommand((view) => {
			return view.setName("view").setDescription("view the banlist");
		})
		.addSubcommand((audit) => {
			return audit
				.setName("audit")
				.setDescription("change the banlist")
				.addUserOption((userOpt) => {
					return userOpt.setName("victim").setDescription("The user to ban from using the bot").setRequired(true);
				})
				.addBooleanOption((bool) => {
					return bool.setName("revoke").setDescription("Weather to undo an oopsie or not").setRequired(false);
				});
		}),
	execute: new Collection<string, SlashCommandI>()
		.set("audit", async (interaction: CommandInteraction, client: Client) => {
			await interaction.deferReply({ ephemeral: true });
			const banlist = require("@json/botbans.json");
			// const banlist = JSON.parse(banlistJSON);
            const victimID = await interaction.options.getUser("victim").id;
            
            if (victimID == client.user.id ||       //self
                victimID == "207471947662098432" || //Juknum
                victimID == "173336582265241601" || //The Rolf
                victimID == "473860522710794250" || //RobertR11
                victimID == "601501288978448411")   //Nick.
            return interaction.followUp("You cannot ban/unban this user")

            if (await interaction.options.getBoolean("revoke")) {
                banlist.ids.filter(async (v) => {
                    return v != (victimID); //removes only the id of the victim
                });
            } else {
                banlist.ids.push(victimID);
            }
			writeFileSync(join(__dirname, "../../../json/botbans.json"), JSON.stringify(banlist));

			interaction.followUp({
				content: `Bot-Banned <@${victimID}>`,
				ephemeral: true,
			});
			const embed: MessageEmbed = new MessageEmbed()
				.setTitle(`Added <@:${victimID} to botban list`)
				.setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: true }) })
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
			await interaction.deferReply({ ephemeral: true });
			let buffer = readFileSync(join(__dirname, "../../../json/botbans.json"));
			interaction.followUp({ files: [new MessageAttachment(buffer, "bans.json")], ephemeral: true });
		}),
};
