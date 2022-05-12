import { SlashCommand } from "@interfaces";
import { CommandInteraction, Client, VoiceChannel, VoiceBasedChannel } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { activities, activityOptions } from "@helpers/activities";
import { ChannelType } from "discord-api-types";
import axios from "axios";
import { MessageEmbed } from "@client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("activity")
		.setDescription(`Creates an activity in a voice channel.`)
		.addStringOption((option) =>
			option
				.setName("activity")
				.setDescription("The activity option to open in voice chat")
				.addChoices(activityOptions)
				.setRequired(true),
		)
		.addChannelOption((option) =>
			option
				.setName("channel")
				.setDescription("The channel to create the activity in")
				.addChannelTypes([ChannelType.GuildVoice])

				.setRequired(false),
		),
	execute: async (interaction: CommandInteraction, client: Client) => {
		const guild = client.guilds.cache.get(interaction.guildId);
		const member = guild.members.cache.get(interaction.member.user.id);
		let channel = interaction.options.getChannel("channel") as VoiceChannel;

		//no option for channel was provided
		if (channel == undefined) {
			if (member.voice.channelId == undefined)
				return interaction.reply({
					content: await interaction.getEphemeralString({ string: "Command.Activity.noChannel" }),
					ephemeral: true,
				});
			if (member.voice.channel.type == "GUILD_STAGE_VOICE")
				return interaction.reply({
					content: await interaction.getEphemeralString({ string: "Command.Activity.stageChannel" }),
					ephemeral: true,
				});
			channel = member.voice.channel as VoiceBasedChannel as VoiceChannel;
		}
		let data = await axios(`https://discord.com/api/v8/channels/${channel.id}/invites`, {
			data: JSON.stringify({
				max_age: 86400,
				max_uses: 0,
				target_application_id: interaction.options.getString("activity"),
				target_type: 2,
				temporary: false,
				validate: null,
			}),
			method: "POST",
			headers: {
				Authorization: `Bot ${client.token}`,
				"Content-Type": "application/json",
			},
		}).catch((e) => {
			console.log(e.message);
			console.log(e.toJSON());
			return undefined;
		});
		const embed = new MessageEmbed()
			.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
			.setTitle(`Click to join ${activities[parseInt(interaction.options.getString("activity"))]}`);
		if (data && data.data["code"]) {
			embed.setURL(`https://discord.com/invite/${data.data["code"]}`);
			return interaction.reply({ embeds: [embed] });
		} else
			return interaction.reply({
				content: await interaction.getEphemeralString({ string: "Command.Activity.unableToCreateInvite" }),
				ephemeral: true,
			});
	},
};
