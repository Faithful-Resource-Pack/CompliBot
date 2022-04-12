import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Collection, CommandInteraction, TextChannel } from "discord.js";
import { Client, Message, MessageEmbed } from "@client";
import { Config } from "@interfaces";
import ConfigJson from "@json/config.json";
import { colors } from "@helpers/colors";
import { getRolesIds } from "@helpers/roles";
const config: Config = ConfigJson;

export const command: SlashCommand = {
	permissions: {
		roles: getRolesIds({ name: "moderators", discords: "all", teams: "all" }),
	},
	data: new SlashCommandBuilder()
		.setDefaultPermission(false)
		.setName("clear")
		.setDescription("Clear a specified amount of messages")
		.addNumberOption((option) =>
			option.setName("amount").setDescription("The amount of messages you want to clear [0 - 100]").setRequired(true),
		),
	execute: async (interaction: CommandInteraction, client: Client) => {
		const amount: number = interaction.options.getNumber("amount", true);
		if (amount > 100 || amount < 0)
			return interaction.reply({ ephemeral: true, content: "Amount must be between `0` and `100`" });

		let messages: Collection<string, Message>;
		try {
			messages = await interaction.channel.messages.fetch({ limit: amount });
			await (interaction.channel as TextChannel).bulkDelete(messages);
		} catch (err) {
			return interaction.reply({ content: err, ephemeral: true });
		}

		interaction.reply({ ephemeral: true, content: `Successfully deleted ${amount} messages` });

		// construct logs
		//! TODO: add clear icon in thumbnail (waiting for @Pomi108 to draw it)
		const embed: MessageEmbed = new MessageEmbed()
			.setTitle(`Deleted ${amount} message${amount === 1 ? "" : "s"}`)
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
	},
};
