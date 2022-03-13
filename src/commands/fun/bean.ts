import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Collection, CommandInteraction, Guild, GuildMember, Interaction, TextChannel, User } from "discord.js";
import { Client, Message, MessageEmbed } from "@client";
import { Config } from "@interfaces";
import ConfigJson from "@json/config.json";
import { parseDate } from "@helpers/dates";
import { colors } from "@helpers/colors";
import { getRolesIds } from "@helpers/roles";
const config: Config = ConfigJson;

export const command: SlashCommand = {
	permissions: {
		roles: getRolesIds({ name: ["moderators", "trial_moderators"], discords: "all", teams: "all" }),
	},
	data: new SlashCommandBuilder()
		.setDefaultPermission(false)
		.setName("bean")
		.setDescription("Bean him at once!")
		.addUserOption((option) => option.setName("user").setDescription("User you want to mute").setRequired(true)),
	execute: async (interaction: CommandInteraction, client: Client) => {
		const embed = new MessageEmbed()
			.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
			.setDescription(`<@${interaction.options.getUser("user").id}> has bean beaned!`)
			.setColor(colors.red);
		interaction.reply({ embeds: [embed] });
	},
};
